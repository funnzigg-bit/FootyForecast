import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Palette, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
  };

  const TIMEZONES = [
    "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
    "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-3xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-secondary border border-border w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
            <TabsTrigger value="profile" className="text-xs gap-1.5"><User className="h-3 w-3" /> Profile</TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs gap-1.5"><Palette className="h-3 w-3" /> Display</TabsTrigger>
            <TabsTrigger value="account" className="text-xs gap-1.5"><Shield className="h-3 w-3" /> Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Profile Information</h3>
              <div className="space-y-2">
                <Label className="text-xs">Full Name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Email</Label>
                <Input value={user?.email || ""} disabled className="bg-background border-border opacity-60" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="bg-background border-border"><Globe className="h-3 w-3 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent>{TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} size="sm" className="font-semibold">Save Profile</Button>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Display Preferences</h3>
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-foreground">Auto-refresh data</p><p className="text-[10px] text-muted-foreground">Automatically update match data</p></div>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-foreground">Compact Mode</p><p className="text-[10px] text-muted-foreground">Reduce spacing in tables</p></div>
                <Switch checked={compactMode} onCheckedChange={setCompactMode} />
              </div>
              <Button onClick={handleSave} size="sm" className="font-semibold">Save Preferences</Button>
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Subscription</h3>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Free Plan</p>
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Current</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Full access · All leagues · All markets</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Security</h3>
              <Button variant="outline" size="sm" className="text-xs">Change Password</Button>
            </div>
            <div className="rounded-xl border border-destructive/30 bg-card p-4 sm:p-6 space-y-3">
              <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10">Delete Account</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
