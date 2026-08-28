import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User as UserIcon, Loader2, Save, UserCircle, CheckSquare } from 'lucide-react';

interface ProfileModalProps {
  currentUser: { id: string, username: string, email: string, avatarUrl?: string, history?: any[] };
  onClose: () => void;
  onUpdate: (updatedUser: any) => void;
  t: (key: string) => string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ currentUser, onClose, onUpdate, t }) => {
  const [username, setUsername] = useState(currentUser.username || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, avatarUrl })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
      }

      const { user } = await res.json();
      onUpdate(user);
      setSuccess('อัปเดตโปรไฟล์สำเร็จแล้ว');
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-card-bg w-full max-w-[480px] rounded-[24px] shadow-2xl relative border border-border-subtle z-10 flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border-subtle flex items-center justify-between shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-text-main flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
               {currentUser.avatarUrl ? (
                 <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
               ) : (
                 <UserIcon className="w-5 h-5" />
               )}
             </div>
             {t('profileSettings') || 'ตั้งค่าโปรไฟล์'}
          </h2>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-main bg-bg-app hover:bg-border-subtle p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] px-4 py-3 rounded-[12px] mb-4 shrink-0">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[13px] px-4 py-3 rounded-[12px] mb-4 shrink-0 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">{t('email') || 'อีเมล'}</label>
              <input 
                type="email"
                value={currentUser.email}
                disabled
                className="w-full bg-bg-app border border-border-subtle text-text-muted px-4 py-3 rounded-xl outline-none font-medium text-sm opacity-70 cursor-not-allowed"
              />
              <p className="text-[11px] text-text-muted mt-1.5">* อีเมลไม่สามารถเปลี่ยนแปลงได้</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">{t('username') || 'ชื่อผู้ใช้'}</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="กรอกชื่อผู้ใช้..."
                className="w-full bg-bg-app border border-border-subtle text-text-main px-4 py-3 rounded-xl outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Avatar URL (ตัวเลือก)</label>
              <input 
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="w-full bg-bg-app border border-border-subtle text-text-main px-4 py-3 rounded-xl outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-medium text-sm"
              />
            </div>

            <button 
              type="submit"
              disabled={loading || (!username.trim() && !currentUser.username)}
              className="mt-2 w-full py-3 sm:py-3.5 flex items-center justify-center gap-2 font-semibold transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 rounded-[14px] bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] shadow-md"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> บันทึกข้อมูล</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
