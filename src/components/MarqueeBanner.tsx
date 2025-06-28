
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getExhibitionSettings, type ExhibitionSettings } from '../services/settingsService';

export const MarqueeBanner = () => {
  const [settings, setSettings] = useState<ExhibitionSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getExhibitionSettings();
      setSettings(data);
    };
    fetchSettings();
  }, []);

  if (!settings) return null;

  const style = {
    background: `linear-gradient(135deg, ${settings.marqueeColor || '#1e40af'}, ${settings.marqueeColor || '#1e40af'}dd)`
  };

  const fullText = settings.marqueeMessages.join(' • ');
  const duration = fullText.length * ((settings.marqueeSpeed || 5) / 10);

  return (
    <motion.div 
      style={style} 
      className="relative py-4 overflow-hidden shadow-2xl border-y border-white/20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <motion.div 
          className="absolute top-0 w-96 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['0%', '100%'] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
        ></motion.div>
      </div>
      
      {/* Content */}
      <div className="relative max-w-6xl mx-auto overflow-hidden">
        <div 
          className="flex whitespace-nowrap items-center"
          style={{
            animation: `marquee ${duration}s linear infinite`
          }}
        >
          <motion.span 
            className="inline-block px-6 text-white text-lg md:text-xl font-medium tracking-wide"
            whileHover={{ scale: 1.05 }}
          >
            ✨ {fullText} ✨
          </motion.span>
          <motion.span 
            className="inline-block px-6 text-white text-lg md:text-xl font-medium tracking-wide"
            whileHover={{ scale: 1.05 }}
          >
            ✨ {fullText} ✨
          </motion.span>
          <motion.span 
            className="inline-block px-6 text-white text-lg md:text-xl font-medium tracking-wide"
            whileHover={{ scale: 1.05 }}
          >
            ✨ {fullText} ✨
          </motion.span>
        </div>
      </div>
      
      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
    </motion.div>
  );
};
