import { Card } from "@/components/ui/card";
import { Shield, Lock, Link2, Target, Bell, Search } from "lucide-react";

export const WhyChooseVeriFace = () => {
  const features = [
    {
      icon: Shield,
      title: "Our Mission",
      description: "To protect your identity in a world where reality can be manipulated. We believe everyone deserves to control their digital presence and trust what they see online."
    },
    {
      icon: Lock,
      title: "Privacy-First Architecture",
      description: "Your media never leaves your device unencrypted. We use end-to-end encryption and zero-knowledge proofs to ensure your data remains private and secure."
    },
    {
      icon: Link2,
      title: "Blockchain-Backed Verification",
      description: "Every scan is timestamped on the blockchain, creating an immutable record of authenticity that can be independently verified by anyone."
    },
    {
      icon: Target,
      title: "High-Accuracy AI Detection",
      description: "Our advanced neural networks are trained on millions of samples, achieving industry-leading accuracy in detecting manipulated media across all formats."
    },
    {
      icon: Bell,
      title: "Real-Time Identity Misuse Alerts",
      description: "Get instant notifications when your media appears on unauthorized websites or when potential deepfakes using your identity are detected online."
    },
    {
      icon: Search,
      title: "Reverse Web Crawling Engine",
      description: "Our proprietary crawling technology scans the web 24/7 to find where your media is being used, helping you maintain control of your digital footprint."
    }
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Why Choose <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">VeriFace</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            At VeriFace, our mission is to protect your identity in a world where reality can be manipulated.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all hover:shadow-card hover:scale-105 duration-300"
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 text-center">
          <Card className="inline-block p-6 bg-card/50 backdrop-blur-sm border-primary/30">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-semibold text-foreground">Trusted by Security Professionals</p>
                <p className="text-sm text-muted-foreground">Advanced protection for the digital age</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
