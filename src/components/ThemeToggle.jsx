import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true); // Default to dark mode for premium look

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsDark(!isDark)}
      className="relative p-2 rounded-full glassmorphism dark:glassmorphism glow-orange hover:glow-orange-lg transition-all duration-300 overflow-hidden group border border-white/10 dark:border-white/5"
    >
      <div className="relative z-10 text-orange-500 dark:text-orange-400 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
        {isDark ? <Moon size={20} /> : <Sun size={20} />}
      </div>
      <motion.div
        className="absolute inset-0 bg-orange-500/20 dark:bg-orange-400/10 rounded-full"
        initial={false}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  );
}
