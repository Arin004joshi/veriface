import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { WhyChooseVeriFace } from "@/components/WhyChooseVeriFace";
import { ContributorsContact } from "@/components/ContributorsContact";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <WhyChooseVeriFace />
      <ContributorsContact />
    </div>
  );
}
