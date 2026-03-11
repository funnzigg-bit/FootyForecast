import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Bell } from "lucide-react";

const Alerts = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Alert History</h1>
          <p className="text-xs text-muted-foreground mt-1">Alert system coming soon</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">The alert system is not yet available.</p>
          <p className="text-xs text-muted-foreground mt-1">Check back soon for real-time match alerts.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
