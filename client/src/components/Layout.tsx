import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, MapPin, Settings, BarChart3, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import backgroundImage from "@assets/generated_images/subtle_abstract_geometric_white_and_light_gray_pattern.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/" },
    { icon: MapPin, label: "Locations", href: "/locations" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: PieChart, label: "Reports", href: "/reports" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm fixed h-full z-20 hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold font-display tracking-tight text-primary flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            BizPulse
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 bg-card/50 rounded-lg border border-border/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              JD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Jane Doe</span>
              <span className="text-xs text-muted-foreground">Admin Access</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative min-h-screen">
        {/* Background Texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.4] z-0 mix-blend-multiply dark:mix-blend-overlay" 
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Content Container */}
        <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
