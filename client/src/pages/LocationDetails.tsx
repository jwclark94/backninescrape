import { useRoute } from "wouter";
import Layout from "@/components/Layout";
import { mockLocations } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import KPICard from "@/components/KPICard";
import { ArrowLeft, Calendar, DollarSign, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export default function LocationDetails() {
  const [match, params] = useRoute("/location/:id");
  const id = params?.id;
  const location = mockLocations.find((l) => l.id === id);
  const [timeRange, setTimeRange] = useState("lastWeek");

  if (!location) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Location not found</h2>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">
            Return to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div>
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-display text-foreground flex items-center gap-3">
                {location.name}
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium font-sans">
                  Active
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{location.city} • ID: #{location.id}</span>
              </div>
            </div>
            
            <Select defaultValue="week">
               <SelectTrigger className="w-[180px]">
                 <SelectValue placeholder="Select Range" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="week">This Week</SelectItem>
                 <SelectItem value="month">This Month</SelectItem>
                 <SelectItem value="quarter">This Quarter</SelectItem>
                 <SelectItem value="year">This Year</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </div>

        {/* Detailed KPI Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Revenue Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Revenue Metrics</h3>
            <KPICard 
              title="All Time Revenue" 
              value={formatCurrency(location.revenue.allTime)} 
              icon={DollarSign}
              className="bg-card"
            />
            <div className="grid grid-cols-2 gap-4">
               <KPICard 
                title="Last Week" 
                value={formatCurrency(location.revenue.lastWeek)} 
                icon={DollarSign}
                trend="up"
                trendValue="4%"
                className="bg-card/50"
              />
               <KPICard 
                title="Last Month" 
                value={formatCurrency(location.revenue.lastMonth)} 
                icon={DollarSign}
                trend="down"
                trendValue="1.2%"
                className="bg-card/50"
              />
            </div>
          </div>

          {/* Hours Column */}
          <div className="space-y-4">
             <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Booking Volume</h3>
            <KPICard 
              title="Total Hours" 
              value={location.hoursBooked.allTime} 
              icon={Clock}
              className="bg-card"
            />
            <div className="grid grid-cols-2 gap-4">
               <KPICard 
                title="Last Week" 
                value={location.hoursBooked.lastWeek} 
                icon={Clock}
                trend="up"
                trendValue="8%"
                className="bg-card/50"
              />
               <KPICard 
                title="Last Month" 
                value={location.hoursBooked.lastMonth} 
                icon={Clock}
                trend="up"
                trendValue="12%"
                className="bg-card/50"
              />
            </div>
          </div>
          
           {/* Context Column */}
           <div className="space-y-4">
             <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Performance Score</h3>
             <Card className="h-full flex flex-col justify-center items-center p-6 border-primary/20 bg-primary/5">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      className="text-muted/30"
                    />
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      strokeDasharray="283"
                      strokeDashoffset="70"
                      className="text-primary"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-display">A</span>
                    <span className="text-xs text-muted-foreground uppercase">Grade</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="font-medium">Top Performer</p>
                  <p className="text-xs text-muted-foreground mt-1">Top 10% of all locations</p>
                </div>
             </Card>
           </div>
        </div>

        <Separator />

        {/* Daily Performance Chart */}
        <Card className="shadow-sm border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-display">Daily Engagement</CardTitle>
                <CardDescription>
                  Number of hours booked per day of the week.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-muted-foreground" />
                 <span className="text-sm font-medium">Average: {Math.round(location.totalHours / 365 * 7)} hrs/week</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={location.dailyBookings}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorHours)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
