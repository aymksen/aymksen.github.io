import { useCallback, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { Intro } from "@/components/sections/Intro";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Craft } from "@/components/sections/Craft";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function App() {
  const { theme, setTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const onIntroDone = useCallback(() => setReady(true), []);

  // Honour a #section link once the intro is out of the way.
  useEffect(() => {
    if (ready && window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView();
  }, [ready]);

  return (
    <MotionConfig reducedMotion="user">
      <Intro onDone={onIntroDone} />
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-bg focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Nav theme={theme} onThemeChange={setTheme} />
      <main>
        <Hero ready={ready} theme={theme} />
        <About />
        <Craft />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
}
