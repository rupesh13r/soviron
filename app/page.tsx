import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { VoiceCloneDemo } from "@/components/VoiceCloneDemo";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <Header />
      <main>
        <Hero />
        <VoiceCloneDemo />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
