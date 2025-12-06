import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileImage, AlertCircle, CheckCircle, TrendingUp, Search, Shield } from "lucide-react";

const mockScans = [
  { id: 1, filename: "profile_photo.jpg", score: 94.5, status: "authentic", date: "2024-01-15" },
  { id: 2, filename: "interview_video.mp4", score: 45.2, status: "suspicious", date: "2024-01-14" },
  { id: 3, filename: "voice_recording.mp3", score: 22.8, status: "deepfake", date: "2024-01-13" },
  { id: 4, filename: "company_logo.png", score: 98.1, status: "authentic", date: "2024-01-12" },
];

const mockAlerts = [
  { id: 1, type: "warning", message: "Your media found on 3 unauthorized websites", time: "2 hours ago" },
  { id: 2, type: "critical", message: "Deepfake detected in recent upload", time: "5 hours ago" },
  { id: 3, type: "info", message: "Weekly scan completed successfully", time: "1 day ago" },
];

export default function Dashboard() {
  const getStatusBadge = (status: string) => {
    if (status === "authentic") return <Badge className="bg-success/20 text-success border-success/30">Authentic</Badge>;
    if (status === "suspicious") return <Badge className="bg-warning/20 text-warning border-warning/30">Suspicious</Badge>;
    return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Deepfake</Badge>;
  };

  const getAlertIcon = (type: string) => {
    if (type === "critical") return <AlertCircle className="w-5 h-5 text-destructive" />;
    if (type === "warning") return <AlertCircle className="w-5 h-5 text-warning" />;
    return <CheckCircle className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your scans, alerts, and web presence</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">24</p>
            <p className="text-sm text-muted-foreground">Total Scans</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">18</p>
            <p className="text-sm text-muted-foreground">Authentic Media</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <TrendingUp className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">3</p>
            <p className="text-sm text-muted-foreground">Deepfakes Detected</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-warning" />
              </div>
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">12</p>
            <p className="text-sm text-muted-foreground">Web Mentions</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Scans */}
          <Card className="lg:col-span-2 p-6 bg-card border-border">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Recent Scans</h2>
            <div className="space-y-4">
              {mockScans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/20 border border-border hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileImage className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{scan.filename}</p>
                    <p className="text-sm text-muted-foreground">{scan.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground mb-1">{scan.score}%</p>
                    {getStatusBadge(scan.status)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Alerts */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Recent Alerts</h2>
            <div className="space-y-4">
              {mockAlerts.map((alert) => (
                <div key={alert.id} className="flex gap-3 p-4 rounded-lg bg-secondary/20 border border-border">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Average Reality Score */}
        <Card className="mt-6 p-6 bg-card border-border">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Average Reality Score</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Average</span>
                <span className="text-sm font-medium text-foreground">72.5%</span>
              </div>
              <Progress value={72.5} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {mockScans.length} recent scans. Your media authenticity is in good standing.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
