import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Gift, Truck } from "lucide-react";

const ANNOUNCEMENTS = [
  {
    id: 1,
    text: "Free Shipping on orders over ₹2000",
    icon: Truck,
  },
  {
    id: 2,
    text: "Complimentary Luxury Gift Packaging",
    icon: Gift,
  },
  {
    id: 3,
    text: "Discover our New Body Care Rituals",
    icon: Sparkles,
  },
  {
    id: 4,
    text: "Exclusive Inner Circle Member Offers",
    icon: Heart,
  },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[36px] bg-foreground text-background overflow-hidden flex items-center justify-center border-b border-border">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 flex items-center justify-center w-full h-full"
        >
          <div className="flex items-center gap-2 text-xs font-medium tracking-[0.15em] uppercase px-4 text-center">
            {(() => {
              const Icon = ANNOUNCEMENTS[currentIndex].icon;
              return <Icon className="h-3 w-3 stroke-[2] opacity-70" />;
            })()}
            <span>{ANNOUNCEMENTS[currentIndex].text}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
