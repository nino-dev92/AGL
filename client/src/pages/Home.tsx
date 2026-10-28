import Hero from "../components/components/home/Hero";
import FeaturedGames from "../components/components/home/FeaturedGames";
import HowItWorks from "../components/components/home/HowItWorks";
import Players from "../components/components/home/Players";
import Watch from "../components/components/home/Watch";
import CTA from "../components/components/home/CTA";
import GeneralLayout from "../layouts/GeneralLayout";

export default function Home() {
  return (
    <GeneralLayout>
      <main className="grow">
        <Hero />
        <FeaturedGames />
        <HowItWorks />
        <Players />
        <Watch />
        <CTA />
      </main>
    </GeneralLayout>
  );
}
