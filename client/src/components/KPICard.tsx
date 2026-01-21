import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: LucideIcon;
  className?: string;
}

export default function KPICard({ title, value, subValue, trend, trendValue, icon: Icon, className }: KPICardProps) {
  return (
    <Card className={cn("overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground font-sans">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display tracking-tight">{value}</div>
        {(subValue || trendValue) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend && (
              <span className={cn(
                "font-medium",
                trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-gray-500"
              )}>
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "•"} {trendValue}
              </span>
            )}
            <span className="opacity-80">{subValue}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
