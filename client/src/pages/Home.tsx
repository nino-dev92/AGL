import Hero from "../components/home-components/home/Hero";
import FeaturedGames from "../components/home-components/home/FeaturedGames";
import HowItWorks from "../components/home-components/home/HowItWorks";
import Players from "../components/home-components/home/Players";
import Watch from "../components/home-components/home/Watch";
import CTA from "../components/home-components/home/CTA";
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
