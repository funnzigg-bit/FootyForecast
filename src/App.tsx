import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Predictions = lazy(() => import("./pages/Predictions"));
const LiveMatches = lazy(() => import("./pages/LiveMatches"));
const MatchDetail = lazy(() => import("./pages/MatchDetail"));
const DailyPicks = lazy(() => import("./pages/DailyPicks"));
const UpsetWatch = lazy(() => import("./pages/UpsetWatch"));
const GoalsMarket = lazy(() => import("./pages/GoalsMarket"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Methodology = lazy(() => import("./pages/Methodology"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      Loading FootyForecast...
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteLoader />}>
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
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
              <Route path="/methodology" element={<ProtectedRoute><Methodology /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              {/* Legacy redirects */}
              <Route path="/dashboard" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
              <Route path="/live-matches" element={<ProtectedRoute><LiveMatches /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
