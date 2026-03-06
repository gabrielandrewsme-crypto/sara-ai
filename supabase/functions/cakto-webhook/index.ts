import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const caktoSecret = Deno.env.get("CAKTO_WEBHOOK_SECRET");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Cakto webhook received:", JSON.stringify(body));

    // Validate Cakto webhook secret if configured
    if (caktoSecret) {
      const receivedSecret = body.secret || req.headers.get("x-webhook-secret");
      if (receivedSecret !== caktoSecret) {
        console.error("Invalid Cakto webhook secret");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Cakto webhook event types:
    // purchase_approved, purchase_refused, refund, chargeback,
    // subscription_created, subscription_canceled, subscription_renewed, subscription_renewal_refused
    const event = body.event || body.custom_id;
    
    // Extract customer data — Cakto sends order data with customer object
    const order = body.order || body;
    const customer = order.customer || body.customer;
    const customerEmail = customer?.email;
    const customerName = customer?.name;
    const orderId = order.id || body.id;
    const subscriptionId = order.subscription || body.subscription;

    if (!customerEmail) {
      console.error("No customer email found in Cakto webhook payload");
      return new Response(JSON.stringify({ error: "No customer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing Cakto event: ${event} for ${customerEmail}`);

    // Find existing user by email
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let userId: string | null = null;

    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email?.toLowerCase() === customerEmail.toLowerCase()
    );

    if (existingUser) {
      userId = existingUser.id;
    }

    switch (event) {
      case "purchase_approved":
      case "subscription_created":
      case "subscription_renewed": {
        // Create user if doesn't exist
        if (!userId) {
          const tempPassword = crypto.randomUUID().slice(0, 16) + "Aa1!";

          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: customerEmail,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: customerName || "Usuário Sara" },
          });

          if (createError) {
            console.error("Error creating user:", createError);
            return new Response(JSON.stringify({ error: "Failed to create user" }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          userId = newUser.user.id;
          console.log(`Created new user: ${userId}`);
        }

        // Activate profile
        await supabase
          .from("profiles")
          .update({ is_active: true })
          .eq("user_id", userId);

        // Upsert subscription
        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            status: "active",
            plan: "basic",
            kiwify_transaction_id: orderId,
            kiwify_subscription_id: subscriptionId,
            kiwify_email: customerEmail,
            started_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (subError) {
          console.error("Error upserting subscription:", subError);
        }

        console.log(`Activated access for ${customerEmail}`);
        break;
      }

      case "refund":
      case "chargeback":
      case "subscription_canceled":
      case "subscription_renewal_refused": {
        if (userId) {
          await supabase
            .from("profiles")
            .update({ is_active: false })
            .eq("user_id", userId);

          const statusMap: Record<string, string> = {
            refund: "refunded",
            chargeback: "refunded",
            subscription_canceled: "canceled",
            subscription_renewal_refused: "expired",
          };

          await supabase
            .from("subscriptions")
            .update({
              status: statusMap[event] || "canceled",
              canceled_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          console.log(`Deactivated access for ${customerEmail}`);
        }
        break;
      }

      default:
        console.log(`Unhandled Cakto event: ${event}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Cakto webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
