import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SaraProvider } from "@/contexts/SaraContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import CalendarPage from "./pages/CalendarPage";
import Finances from "./pages/Finances";
import Notes from "./pages/Notes";
import MindMap from "./pages/MindMap";
import Diary from "./pages/Diary";
import Settings from "./pages/Settings";
import AdminClients from "./pages/AdminClients";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import Welcome from "./pages/Welcome";
import Install from "./pages/Install";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SaraProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/install" element={<Install />} />
              <Route path="/reset-password" element={<ResetPassword />} />


              {/* Protected routes with subscription check */}
              <Route element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <AppLayout />
                  </SubscriptionGuard>
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/finances" element={<Finances />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/mindmap" element={<MindMap />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Admin routes */}
              <Route element={
                <ProtectedRoute requireAdmin>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/admin/clients" element={<AdminClients />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SaraProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
