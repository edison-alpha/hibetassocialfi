import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import somniaLogo from "@/assets/somnia.png";
import Hero3D from "./Hero3D";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* 3D Background */}
      <Hero3D />

      {/* Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background pointer-events-none z-0"></div>

      {/* Content */}
      <div className="container mx-auto px-6 py-32 relative z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-clash font-semibold text-5xl md:text-7xl lg:text-8xl leading-tight"
          >
            Create your own song with AI
            <br />
            <span className="inline-block mt-2">
              and <AnimatedRotatingWord /> your song
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-sm text-muted-foreground tracking-wider flex items-center justify-center gap-2"
          >
            Powered by
            <img src={somniaLogo} alt="Somnia" className="inline-block h-6 object-contain" />
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 pt-4"
          >
            <Link to="/feed">
              <Button
                variant="outline"
                size="lg"
                className="font-clash font-semibold text-lg px-12 py-8 h-auto rounded-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)]"
              >
                Launch App
              </Button>
            </Link>

            <motion.button
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-foreground/60 hover:text-foreground transition-colors"
              aria-label="Scroll down"
            >
              <ChevronDown className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

// Small inline component to rotate a few words with a fade effect
function AnimatedRotatingWord() {
  const words = ["Create", "Trade", "Share", "Earn"];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // fade out
      setVisible(false);
      // after fade out, switch word and fade in
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setVisible(true);
      }, 300);

      return () => clearTimeout(t);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={
        "inline-block text-primary drop-shadow-[0_0_30px_rgba(179,255,94,0.5)] transition-opacity duration-300 " +
        (visible ? "opacity-100" : "opacity-0")
      }
      aria-live="polite"
    >
      {words[index]}
    </span>
  );
}
