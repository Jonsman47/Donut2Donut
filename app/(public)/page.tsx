import Hero from "@/components/Hero";
import EscrowHowItWorks from "@/components/EscrowHowItWorks";
import ReviewsStrip from "@/components/ReviewsStrip";
import FinalCTA from "@/components/FinalCTA";

export default function Home() {
  return (
    <div>
      <Hero />
      <EscrowHowItWorks />
      <ReviewsStrip />
      <FinalCTA />
    </div>
  );
}
