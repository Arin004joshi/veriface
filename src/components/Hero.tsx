import { Button } from "@/components/ui/button";
import { Shield, Upload, Search, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-dark" />
      <div className="absolute inset-0 bg-gradient-glow" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        {/* Logo/Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-primary/20 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-top duration-700">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">AI-Powered Deepfake Detection</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom duration-700 delay-150">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            VeriFace
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          Detect Deepfakes. Protect Your Identity.
        </p>
        
        <p className="text-base md:text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-500">
          Advanced AI analysis to verify media authenticity, detect manipulated content, and monitor your digital presence across the web.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-in fade-in slide-in-from-bottom duration-700 delay-700">
          <Link to="/analyze">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow transition-all hover:scale-105">
              <Upload className="mr-2 h-5 w-5" />
              Start Analysis
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-border hover:bg-card/50">
              <Search className="mr-2 h-5 w-5" />
              View Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-1000">
          <div className="group p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all hover:shadow-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Reality Score</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered authenticity analysis with detailed anomaly detection and confidence scoring.
            </p>
          </div>

          <div className="group p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all hover:shadow-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Web Crawling</h3>
            <p className="text-sm text-muted-foreground">
              Reverse search technology to find and monitor where your media appears online.
            </p>
          </div>

          <div className="group p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all hover:shadow-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <AlertTriangle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Real-time Alerts</h3>
            <p className="text-sm text-muted-foreground">
              Instant notifications when suspicious media or identity misuse is detected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
