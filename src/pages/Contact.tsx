import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageSquare, Facebook, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { siteConfig } from '../config';

export function Contact() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-[1000px] mx-auto px-5 sm:px-8 py-6 sm:py-8 w-full"
    >
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-text-muted hover:text-brand font-medium mb-8 transition-colors group px-2"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        กลับไปหน้าแรก
      </button>

      <div className="bg-card-bg shadow-sm border border-border-subtle rounded-2xl overflow-hidden p-8 text-center text-text-main">
          <MessageSquare className="w-16 h-16 text-brand mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl font-bold mb-4 tracking-tight">ติดต่อเรา (Contact Us)</h1>
          <p className="text-text-muted text-lg leading-relaxed max-w-2xl mx-auto mb-8">
             หากคุณพบปัญหาในการใช้งาน แจ้งลิงก์เสีย 
             หรือต้องการสอบถามข้อมูลเพิ่มเติม สามารถติดต่อเราได้ผ่านช่องทางด้านล่างนี้
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
              {siteConfig.socials?.discord && (
                <a 
                  href={siteConfig.socials.discord} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 px-6 rounded-xl font-medium transition-colors"
                >
                  <MessageSquare className="w-5 h-5" /> Discord ของเรา
                </a>
              )}
              {siteConfig.socials?.facebook && (
                <a 
                  href={siteConfig.socials.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] text-white py-3 px-6 rounded-xl font-medium transition-colors"
                >
                  <Facebook className="w-5 h-5" /> Facebook Page
                </a>
              )}
          </div>
      </div>
    </motion.div>
  );
}
