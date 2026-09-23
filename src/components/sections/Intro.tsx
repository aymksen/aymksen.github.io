import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppleHelloEnglishEffect } from "@/components/ui/apple-hello-effect";
import { prefersReducedMotion } from "@/lib/utils";

const SEEN_KEY = "am-hello-seen";
/** Writing speed multiplier: "hello" is drawn in about 1.3 s. */
const SPEED = 2.6;
/** Hard stop in case animation frames are throttled (e.g. background tab). */
const MAX_MS = 2000;

function shouldPlay() {
  if (prefersReducedMotion()) return false;
  try {
    return sessionStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

/** Apple-style "hello" written quickly once per visit, then fades into the site. */
export function Intro({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(shouldPlay);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Not critical: the intro just plays again next time.
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      onDone();
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const timeout = window.setTimeout(finish, MAX_MS);
    return () => {
      window.clearTimeout(timeout);
      document.documentElement.style.overflow = "";
    };
  }, [visible, onDone, finish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          aria-hidden="true"
          className="fixed inset-0 z-[100] grid place-items-center bg-bg text-fg"
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          onClick={finish}
        >
          <AppleHelloEnglishEffect
            speed={SPEED}
            className="h-20 w-auto sm:h-28 lg:h-36"
            onAnimationComplete={() => window.setTimeout(finish, 120)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
