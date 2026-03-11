import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ArrowLeft, Globe, Trophy, SkipForward } from "lucide-react";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const LEAGUES = [
  "Premier League", "Champions League", "Europa League", "Conference League",
  "La Liga", "Bundesliga", "Serie A",
];

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid",
  "Asia/Tokyo", "Asia/Dubai", "Australia/Sydney", "Africa/Lagos",
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [timezone, setTimezone] = useState<string>(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [leagueSearch, setLeagueSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleLeague = (league: string) => {
    setSelectedLeagues(prev => prev.includes(league) ? prev.filter(l => l !== league) : [...prev, league]);
  };

  const filteredLeagues = useMemo(() =>
    LEAGUES.filter(l => l.toLowerCase().includes(leagueSearch.toLowerCase())), [leagueSearch]
  );

  const handleSkip = () => navigate("/predictions");

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await supabase.from("user_preferences").insert({
        user_id: user.id,
        preferred_leagues: selectedLeagues,
        alert_channel: "email" as const,
        alert_style: "balanced" as const,
        timezone,
        watchlist_leagues: selectedLeagues,
      });
      await supabase.from("profiles").update({ onboarding_completed: true, timezone }).eq("user_id", user.id);
      navigate("/predictions");
    } catch (err: any) {
      toast({ title: "Error saving preferences", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const steps = [
    {
      icon: Trophy,
      title: "Select Your Leagues",
      subtitle: "Choose the leagues you want to follow",
      content: (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search leagues..." value={leagueSearch} onChange={(e) => setLeagueSearch(e.target.value)} className="pl-9" />
          </div>
          {selectedLeagues.length > 0 && <div className="text-xs text-primary font-medium">{selectedLeagues.length} selected</div>}
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
            {filteredLeagues.map((league) => (
              <button key={league} onClick={() => toggleLeague(league)} className={`rounded-lg border px-3 py-2 text-left text-sm transition-all ${selectedLeagues.includes(league) ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/30 text-muted-foreground hover:border-border/80"}`}>
                {league}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      icon: Globe,
      title: "Timezone",
      subtitle: "Set your timezone for match schedules",
      content: (
        <div className="space-y-2">
          <Label>Your Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grid px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-lg font-bold text-foreground">Footy<span className="text-primary">Forecast</span></span>
          </div>
          <button onClick={handleSkip} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            Skip <SkipForward className="h-3 w-3" />
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-xl border border-border bg-card p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <currentStep.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{currentStep.title}</h2>
                <p className="text-xs text-muted-foreground">{currentStep.subtitle}</p>
              </div>
            </div>
            {currentStep.content}
            <div className="mt-8 flex gap-3">
              {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-1"><ArrowLeft className="h-4 w-4" /> Back</Button>}
              <Button className="flex-1 font-semibold" onClick={() => (step < steps.length - 1 ? setStep(step + 1) : handleComplete())} disabled={loading}>
                {step < steps.length - 1 ? "Continue" : loading ? "Saving..." : "Launch Predictions"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
