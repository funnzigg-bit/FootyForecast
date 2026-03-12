import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePredictionsData } from "@/hooks/usePredictionsData";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Palette, Globe, Bell, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PredictionSortMetric } from "@/lib/predictionInsights";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney",
];

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: predictions = [] } = usePredictionsData();
  const { settings, saveSettings, isSaving } = useUserPreferences();
  const [fullName, setFullName] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [alertStyle, setAlertStyle] = useState(settings.alertStyle);
  const [alertChannel, setAlertChannel] = useState(settings.alertChannel);
  const [oddsDisplay, setOddsDisplay] = useState(settings.oddsDisplay);
  const [defaultSort, setDefaultSort] = useState<PredictionSortMetric>(settings.defaultPredictionSort);
  const [preferredLeagues, setPreferredLeagues] = useState<string[]>(settings.preferredLeagues);

  useEffect(() => {
    setFullName(settings.fullName);
    setTimezone(settings.timezone);
    setAlertStyle(settings.alertStyle);
    setAlertChannel(settings.alertChannel);
    setOddsDisplay(settings.oddsDisplay);
    setDefaultSort(settings.defaultPredictionSort);
    setPreferredLeagues(settings.preferredLeagues);
  }, [settings]);

  const leagues = useMemo(
    () => [...new Set(predictions.map((prediction) => prediction.league))].sort(),
    [predictions]
  );

  const toggleLeague = (league: string) => {
    setPreferredLeagues((previous) => (
      previous.includes(league)
        ? previous.filter((entry) => entry !== league)
        : [...previous, league]
    ));
  };

  const handleSave = async () => {
    await saveSettings({
      ...settings,
      fullName,
      timezone,
      preferredLeagues,
      alertChannel,
      alertStyle,
      oddsDisplay,
      defaultPredictionSort: defaultSort,
    });

    toast({
      title: "Settings saved",
      description: "Your account, alert, and market display preferences have been updated.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-xs text-muted-foreground">Manage your account, alerts, and market display preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 border border-border bg-secondary sm:w-auto sm:inline-flex">
            <TabsTrigger value="profile" className="gap-1.5 text-xs"><User className="h-3 w-3" /> Profile</TabsTrigger>
            <TabsTrigger value="preferences" className="gap-1.5 text-xs"><Palette className="h-3 w-3" /> Display</TabsTrigger>
            <TabsTrigger value="account" className="gap-1.5 text-xs"><Shield className="h-3 w-3" /> Alerts & Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-4">
            <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground">Profile Information</h3>
              <div className="space-y-2">
                <Label className="text-xs">Full Name</Label>
                <Input value={fullName} onChange={(event) => setFullName(event.target.value)} className="border-border bg-background" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input value={user?.email || ""} disabled className="border-border bg-background opacity-60" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="border-border bg-background"><Globe className="mr-2 h-3 w-3" /><SelectValue /></SelectTrigger>
                  <SelectContent>{TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} size="sm" className="font-semibold" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="mt-4 space-y-4">
            <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground">Display Preferences</h3>
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-foreground">Auto-refresh data</p><p className="text-[10px] text-muted-foreground">Automatically update match data</p></div>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-foreground">Compact mode</p><p className="text-[10px] text-muted-foreground">Reduce spacing in tables and cards</p></div>
                <Switch checked={compactMode} onCheckedChange={setCompactMode} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs"><Percent className="h-3 w-3" />Odds Display</Label>
                <Select value={oddsDisplay} onValueChange={(value) => setOddsDisplay(value as "average" | "best")}>
                  <SelectTrigger className="border-border bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="average">Average market odds</SelectItem>
                    <SelectItem value="best">Best available price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Default Prediction Sort</Label>
                <Select value={defaultSort} onValueChange={(value) => setDefaultSort(value as PredictionSortMetric)}>
                  <SelectTrigger className="border-border bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Kickoff date</SelectItem>
                    <SelectItem value="win_probability">Win probability</SelectItem>
                    <SelectItem value="confidence">Confidence</SelectItem>
                    <SelectItem value="btts">BTTS</SelectItem>
                    <SelectItem value="over25">Over 2.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Preferred Leagues</Label>
                <div className="flex flex-wrap gap-2">
                  {leagues.slice(0, 12).map((league) => (
                    <button
                      key={league}
                      type="button"
                      onClick={() => toggleLeague(league)}
                      className={`rounded-full border px-2.5 py-1 text-[10px] transition-colors ${
                        preferredLeagues.includes(league)
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {league}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleSave} size="sm" className="font-semibold" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-4 space-y-4">
            <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground">Alert Preferences</h3>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs"><Bell className="h-3 w-3" />Alert Style</Label>
                <Select value={alertStyle} onValueChange={(value) => setAlertStyle(value as typeof alertStyle)}>
                  <SelectTrigger className="border-border bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Alert Channel</Label>
                <Select value={alertChannel} onValueChange={(value) => setAlertChannel(value as typeof alertChannel)}>
                  <SelectTrigger className="border-border bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">In-app + external ready</SelectItem>
                    <SelectItem value="email">Email first</SelectItem>
                    <SelectItem value="telegram">Telegram first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} size="sm" className="font-semibold" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Alerts"}
              </Button>
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground">Subscription</h3>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Free Plan</p>
                    <Badge className="border-primary/30 bg-primary/20 text-[10px] text-primary">Current</Badge>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Full access · All leagues · All markets</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground">Security</h3>
              <Button variant="outline" size="sm" className="text-xs">Change Password</Button>
            </div>

            <div className="space-y-3 rounded-xl border border-destructive/30 bg-card p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              <Button variant="outline" size="sm" className="border-destructive/30 text-xs text-destructive hover:bg-destructive/10">Delete Account</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
