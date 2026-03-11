import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Sliders, Trash2, Copy, Bell, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LEAGUES } from "@/services/leagues";

interface Strategy {
  id: string;
  name: string;
  isActive: boolean;
  probabilityThreshold: number;
  minMinute: number;
  maxMinute: number;
  minShotsOnTarget: number;
  minDangerousAttacks: number;
  minCorners: number;
  requireRedCard: boolean;
  secondHalfOnly: boolean;
  favoriteTrailingOnly: boolean;
  cooldownMinutes: number;
  leagueFilters: string[];
}

const LEAGUE_NAMES = LEAGUES.map(l => l.name);

const Strategies = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const toggleActive = (id: string) => {
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const deleteStrategy = (id: string) => {
    setStrategies(prev => prev.filter(s => s.id !== id));
    toast({ title: "Strategy deleted" });
  };

  const duplicateStrategy = (s: Strategy) => {
    const newS = { ...s, id: `s${Date.now()}`, name: `${s.name} (Copy)` };
    setStrategies(prev => [...prev, newS]);
    toast({ title: "Strategy duplicated" });
  };

  const openNew = () => {
    setEditingStrategy({
      id: `s${Date.now()}`, name: '', isActive: true,
      probabilityThreshold: 60, minMinute: 50, maxMinute: 88,
      minShotsOnTarget: 3, minDangerousAttacks: 50, minCorners: 2,
      requireRedCard: false, secondHalfOnly: false, favoriteTrailingOnly: false,
      cooldownMinutes: 15, leagueFilters: [],
    });
    setDialogOpen(true);
  };

  const openEdit = (s: Strategy) => {
    setEditingStrategy({ ...s });
    setDialogOpen(true);
  };

  const saveStrategy = () => {
    if (!editingStrategy || !editingStrategy.name.trim()) {
      toast({ title: "Please enter a strategy name", variant: "destructive" });
      return;
    }
    setStrategies(prev => {
      const exists = prev.find(s => s.id === editingStrategy.id);
      if (exists) return prev.map(s => s.id === editingStrategy.id ? editingStrategy : s);
      return [...prev, editingStrategy];
    });
    setDialogOpen(false);
    toast({ title: "Strategy saved" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Strategy Builder</h1>
            <p className="text-xs text-muted-foreground mt-1">{strategies.filter(s => s.isActive).length} active strategies · Custom alert rules</p>
          </div>
          <Button onClick={openNew} size="sm" className="gap-2 font-semibold">
            <Plus className="h-4 w-4" /> New Strategy
          </Button>
        </div>

        {/* Strategy cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {strategies.map(s => (
            <div key={s.id} className={`rounded-xl border bg-card p-4 transition-colors ${s.isActive ? "border-primary/30" : "border-border opacity-60"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                </div>
                <Switch checked={s.isActive} onCheckedChange={() => toggleActive(s.id)} />
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Probability ≥</span><span className="font-mono text-foreground">{s.probabilityThreshold}%</span></div>
                <div className="flex justify-between"><span>Minute range</span><span className="font-mono text-foreground">{s.minMinute}' – {s.maxMinute}'</span></div>
                <div className="flex justify-between"><span>Min SOT</span><span className="font-mono text-foreground">{s.minShotsOnTarget}</span></div>
                {s.requireRedCard && <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[10px]">Red Card Required</Badge>}
                {s.secondHalfOnly && <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]">2nd Half Only</Badge>}
              </div>

              {s.leagueFilters.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {s.leagueFilters.slice(0, 3).map(l => (
                    <span key={l} className="rounded bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">{l}</span>
                  ))}
                  {s.leagueFilters.length > 3 && <span className="text-[9px] text-muted-foreground">+{s.leagueFilters.length - 3} more</span>}
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => openEdit(s)}>Edit</Button>
                <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => duplicateStrategy(s)}><Copy className="h-3 w-3" /></Button>
                <Button variant="outline" size="sm" className="h-8 px-2 text-destructive hover:text-destructive" onClick={() => deleteStrategy(s.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </div>

        {strategies.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <Sliders className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No strategies yet. Create one to start receiving custom alerts.</p>
            <Button onClick={openNew} size="sm" className="mt-4 gap-2"><Plus className="h-4 w-4" />Create Strategy</Button>
          </div>
        )}

        {/* Edit/Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-card border-border max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">{editingStrategy ? 'Edit' : 'New'} Strategy</DialogTitle>
            </DialogHeader>
            {editingStrategy && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Strategy Name</Label>
                  <Input value={editingStrategy.name} onChange={e => setEditingStrategy({ ...editingStrategy, name: e.target.value })} placeholder="e.g. Late Game Pressure" className="bg-background border-border" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Probability Threshold: <span className="font-mono text-primary">{editingStrategy.probabilityThreshold}%</span></Label>
                  <Slider value={[editingStrategy.probabilityThreshold]} onValueChange={v => setEditingStrategy({ ...editingStrategy, probabilityThreshold: v[0] })} min={30} max={95} step={5} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Min Minute</Label>
                    <Input type="number" value={editingStrategy.minMinute} onChange={e => setEditingStrategy({ ...editingStrategy, minMinute: +e.target.value })} className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Max Minute</Label>
                    <Input type="number" value={editingStrategy.maxMinute} onChange={e => setEditingStrategy({ ...editingStrategy, maxMinute: +e.target.value })} className="bg-background border-border" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Min SOT</Label>
                    <Input type="number" value={editingStrategy.minShotsOnTarget} onChange={e => setEditingStrategy({ ...editingStrategy, minShotsOnTarget: +e.target.value })} className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Min DA</Label>
                    <Input type="number" value={editingStrategy.minDangerousAttacks} onChange={e => setEditingStrategy({ ...editingStrategy, minDangerousAttacks: +e.target.value })} className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Min Corners</Label>
                    <Input type="number" value={editingStrategy.minCorners} onChange={e => setEditingStrategy({ ...editingStrategy, minCorners: +e.target.value })} className="bg-background border-border" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Require Red Card</Label>
                    <Switch checked={editingStrategy.requireRedCard} onCheckedChange={v => setEditingStrategy({ ...editingStrategy, requireRedCard: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Second Half Only</Label>
                    <Switch checked={editingStrategy.secondHalfOnly} onCheckedChange={v => setEditingStrategy({ ...editingStrategy, secondHalfOnly: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Trailing Team Only</Label>
                    <Switch checked={editingStrategy.favoriteTrailingOnly} onCheckedChange={v => setEditingStrategy({ ...editingStrategy, favoriteTrailingOnly: v })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">League Filters (leave empty for all)</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {LEAGUE_NAMES.map(l => {
                      const selected = editingStrategy.leagueFilters.includes(l);
                      return (
                        <button
                          key={l}
                          onClick={() => {
                            const filters = selected ? editingStrategy.leagueFilters.filter(f => f !== l) : [...editingStrategy.leagueFilters, l];
                            setEditingStrategy({ ...editingStrategy, leagueFilters: filters });
                          }}
                          className={`rounded-full px-2.5 py-1 text-[10px] transition-colors border ${selected ? "bg-primary/20 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border hover:text-foreground"}`}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={saveStrategy} className="w-full font-semibold">Save Strategy</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Strategies;
