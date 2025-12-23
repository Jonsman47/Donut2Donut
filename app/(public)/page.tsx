import Hero from "@/components/Hero";
import FeaturedTrades from "@/components/FeaturedTrades";
import EscrowStepper from "@/components/EscrowStepper";
import TrustStrip from "@/components/TrustStrip";

export default function Home() {
  return (
    <div>
      <Hero />
      <FeaturedTrades />
      <EscrowStepper />
      <TrustStrip />
    </div>
  );
}
