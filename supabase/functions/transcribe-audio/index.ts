import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_SECONDS_PER_MONTH = 3600; // 1 hour

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get user from auth header
    const authHeader = req.headers.get("authorization") ?? "";
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autenticado." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Check current usage
    const { data: usage } = await supabaseAdmin
      .from("audio_usage")
      .select("seconds_used")
      .eq("user_id", user.id)
      .eq("month_year", monthYear)
      .maybeSingle();

    const currentSeconds = usage?.seconds_used ?? 0;
    if (currentSeconds >= MAX_SECONDS_PER_MONTH) {
      return new Response(JSON.stringify({
        error: "Você atingiu o limite de 1 hora de áudio este mês. O limite renova no próximo mês.",
        limit_reached: true,
        seconds_used: currentSeconds,
        seconds_limit: MAX_SECONDS_PER_MONTH,
      }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const formData = await req.formData();
    const audioFile = formData.get("file");
    if (!audioFile || !(audioFile instanceof File)) {
      return new Response(JSON.stringify({ error: "Nenhum arquivo de áudio enviado." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Transcribe - Received audio:", audioFile.name, audioFile.size, "bytes");

    // Estimate audio duration (~16kbps for webm/opus)
    const estimatedSeconds = Math.max(1, Math.round(audioFile.size / 2000));

    if (currentSeconds + estimatedSeconds > MAX_SECONDS_PER_MONTH + 60) {
      // Allow small overflow (60s grace) but block large ones
      return new Response(JSON.stringify({
        error: "Áudio muito longo para o tempo restante este mês.",
        limit_reached: true,
        seconds_used: currentSeconds,
        seconds_limit: MAX_SECONDS_PER_MONTH,
      }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Forward to OpenAI
    const openaiForm = new FormData();
    openaiForm.append("file", audioFile, audioFile.name || "audio.webm");
    openaiForm.append("model", "gpt-4o-mini-transcribe");
    openaiForm.append("language", "pt");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: openaiForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI transcription error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro na transcrição. Tente novamente." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    console.log("Transcription result:", result.text?.substring(0, 100));

    // Update usage via upsert
    await supabaseAdmin.from("audio_usage").upsert({
      user_id: user.id,
      month_year: monthYear,
      seconds_used: currentSeconds + estimatedSeconds,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,month_year" });

    return new Response(JSON.stringify({
      text: result.text,
      seconds_used: currentSeconds + estimatedSeconds,
      seconds_limit: MAX_SECONDS_PER_MONTH,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Transcribe error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
