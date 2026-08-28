import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function About() {
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
          <Info className="w-16 h-16 text-brand mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl font-bold mb-4 tracking-tight">เกี่ยวกับเรา (About Us)</h1>
          <p className="text-text-muted text-lg leading-relaxed max-w-2xl mx-auto">
             NexSpec คือศูนย์รวมสคริปต์, Config, และ Tool ที่ดีที่สุดสำหรับนักพัฒนาและผู้ใช้งานทั่วไป 
             เรามุ่งมั่นที่จะรวบรวมทรัพยากรคุณภาพมารวมไว้ในที่เดียว 
             เพื่อการพัฒนาซอฟต์แวร์และเสริมสร้างประสบการณ์การเล่นเกมหรือการใช้งานโปรแกรมต่างๆ ได้ดียิ่งขึ้น
          </p>
      </div>
    </motion.div>
  );
}
