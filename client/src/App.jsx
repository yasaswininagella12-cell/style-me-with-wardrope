import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PressStrip from './components/PressStrip';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Outfits from './components/Outfits';
import Stats from './components/Stats';
import Chat from './components/Chat';
import Reviews from './components/Reviews';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="glow glow-3" />

      <Navbar />
      <main>
        <Hero />
        <PressStrip />
        <HowItWorks />
        <Features />
        <Outfits />
        <Stats />
        <Chat />
        <Reviews />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
