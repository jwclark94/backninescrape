import { useState } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { mockLocations } from "@/lib/mockData";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Clock, DollarSign, TrendingUp, Users } from "lucide-react";
import KPICard from "@/components/KPICard";

export default function Dashboard() {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Sort locations by total hours
  const sortedLocations = [...mockLocations].sort((a, b) => {
    return sortOrder === "desc" 
      ? b.totalHours - a.totalHours 
      : a.totalHours - b.totalHours;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl outline-none">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          <p className="text-primary text-sm font-medium">
            {payload[0].value} Hours Booked
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of location performance and booking metrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Last updated: Today, 9:00 AM</span>
          </div>
        </div>

        {/* High-level stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard 
            title="Total Revenue" 
            value="$458,500" 
            icon={DollarSign} 
            trend="up"
            trendValue="12%"
            subValue="vs last month"
          />
          <KPICard 
            title="Hours Booked" 
            value="4,900" 
            icon={Clock} 
            trend="up"
            trendValue="5%"
            subValue="vs last month"
          />
          <KPICard 
            title="Active Locations" 
            value="5" 
            icon={Users} 
            subValue="Across 4 states"
            trend="neutral"
          />
          <KPICard 
            title="Avg. Occupancy" 
            value="78%" 
            icon={TrendingUp} 
            trend="down"
            trendValue="2%"
            subValue="vs last month"
          />
        </div>

        {/* Main Chart Section */}
        <Card className="col-span-4 shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div className="space-y-1">
              <CardTitle className="text-xl font-display">Location Performance</CardTitle>
              <CardDescription>
                Total hours booked per location. Click on a bar to view details.
              </CardDescription>
            </div>
            <Select value={sortOrder} onValueChange={(val: any) => setSortOrder(val)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Highest Hours First</SelectItem>
                <SelectItem value="asc">Lowest Hours First</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={sortedLocations}
                  margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 14 }}
                    width={150}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }} content={<CustomTooltip />} />
                  <Bar 
                    dataKey="totalHours" 
                    radius={[0, 4, 4, 0]}
                    onClick={(data) => window.location.href = `/location/${data.id}`}
                    className="cursor-pointer"
                  >
                    {sortedLocations.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(var(--primary))`} 
                        fillOpacity={0.8 + (index * 0.05)} // Subtle gradient effect
                        className="hover:fill-primary transition-all duration-300"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-6">
               {sortedLocations.map(loc => (
                 <Link 
                   key={loc.id} 
                   href={`/location/${loc.id}`}
                   className="group block p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all"
                 >
                     <div className="flex justify-between items-start mb-2">
                       <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{loc.city}</h3>
                       <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                     </div>
                     <p className="text-2xl font-bold font-display">{loc.totalHours}</p>
                     <p className="text-xs text-muted-foreground">hours booked</p>
                 </Link>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
