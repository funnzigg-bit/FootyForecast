import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

interface Props {
  alerts: any[];
}

const RecentAlerts = ({ alerts }: Props) => {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Bell className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
      </div>

      <div className="p-6 text-center text-sm text-muted-foreground">
        {alerts.length === 0 ? "No alerts yet. Alert system coming soon." : `${alerts.length} alerts`}
      </div>
    </div>
  );
};

export default RecentAlerts;
