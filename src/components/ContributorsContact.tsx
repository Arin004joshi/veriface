import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export const ContributorsContact = () => {
  const contributors = [
    { name: "Priyambada Ray", email: "priyambadaray13@gmail.com" },
    { name: "Pritam Kumar Sahoo", email: "pritamkr.sahoo2100@gmail.com" },
    { name: "Monisha Mahato", email: "mnishamht05@gmail.com" },
    { name: "Arin Kumar Joshi", email: "arinkumarjoshi2004@gmail.com" }
  ];

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <section className="py-16 bg-card/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            Our <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Team</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Meet the team behind VeriFace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
          {contributors.map((contributor, index) => (
            <Card 
              key={index}
              className="group p-5 bg-card border-border rounded-2xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-semibold text-primary-foreground">
                  {contributor.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              
              <div className="text-center mb-3">
                <h3 className="text-base font-semibold text-foreground leading-tight">{contributor.name}</h3>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                className="w-full border-border hover:bg-primary/10 hover:border-primary/40 rounded-lg text-sm"
                onClick={() => handleEmailClick(contributor.email)}
              >
                <Mail className="mr-2 h-3.5 w-3.5" />
                Contact
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 VeriFace. Built with dedication to protect digital identities.
          </p>
        </div>
      </div>
    </section>
  );
};
