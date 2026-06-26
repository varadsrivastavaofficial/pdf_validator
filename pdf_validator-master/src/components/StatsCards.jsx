import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Clock } from 'lucide-react';

const stats = [
  { id: 2, label: 'Avg. Processing Time', value: '1.2s', icon: Clock },
];

function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);
  const isNumber = typeof value === 'number';

  useEffect(() => {
    if (!isNumber) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, isNumber]);

  return <span>{isNumber ? count.toLocaleString() : value}</span>;
}

function StatCardItem({ stat, index }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative group p-6 rounded-2xl glassmorphism-light dark:glassmorphism border border-black/5 dark:border-white/10 hover:border-[var(--color-primary)]/50 dark:hover:border-[var(--color-primary)]/50 transition-colors duration-300 w-full max-w-sm cursor-default"
    >
      {/* Hover Glow Effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ transform: "translateZ(-10px)", boxShadow: "0 0 30px rgba(255,106,0,0.3)" }}
      />
      
      <div className="flex items-center justify-between" style={{ transform: "translateZ(30px)" }}>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
            {stat.label}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white text-glow">
            <AnimatedCounter value={stat.value} />
          </h3>
        </div>
        <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
          <stat.icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}

export default function StatsCards() {
  return (
    <div className="flex justify-center w-full max-w-5xl mx-auto my-12 relative z-10 perspective-1000">
      {stats.map((stat, index) => (
        <StatCardItem key={stat.id} stat={stat} index={index} />
      ))}
    </div>
  );
}
