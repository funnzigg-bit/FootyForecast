import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Predictions from "./pages/Predictions";
import LiveMatches from "./pages/LiveMatches";
import MatchDetail from "./pages/MatchDetail";
import DailyPicks from "./pages/DailyPicks";
import UpsetWatch from "./pages/UpsetWatch";
import GoalsMarket from "./pages/GoalsMarket";
import Methodology from "./pages/Methodology";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
            <Route path="/live" element={<ProtectedRoute><LiveMatches /></ProtectedRoute>} />
            <Route path="/match/:id" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
            <Route path="/daily-picks" element={<ProtectedRoute><DailyPicks /></ProtectedRoute>} />
            <Route path="/upset-watch" element={<ProtectedRoute><UpsetWatch /></ProtectedRoute>} />
            <Route path="/goals-market" element={<ProtectedRoute><GoalsMarket /></ProtectedRoute>} />
            <Route path="/methodology" element={<ProtectedRoute><Methodology /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            {/* Legacy redirects */}
            <Route path="/dashboard" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
            <Route path="/live-matches" element={<ProtectedRoute><LiveMatches /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
