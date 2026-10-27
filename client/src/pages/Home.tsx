import Hero from "../components/home/Hero";
import FeaturedGames from "../components/home/FeaturedGames";
import HowItWorks from "../components/home/HowItWorks";
import Players from "../components/home/Players";
import Watch from "../components/home/Watch";
import Staking from "../components/home/Staking";
import CTA from "../components/home/CTA";

export default function Home() {
  return (
    <main className="grow">
      <Hero />
      <FeaturedGames />
      <HowItWorks />
      <Players />
      <Watch />
      <Staking />
      <CTA />
    </main>
  );
}
