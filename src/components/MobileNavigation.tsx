import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileCheck, 
  Image as ImageIcon, 
  Binary, 
  Atom, 
  Dna, 
  Beaker,
  FileQuestion,
  GraduationCap,
  RefreshCcw,
  Menu as MenuIcon,
  X as CloseIcon,
  Sun,
  Moon,
  Zap,
  LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { dbService } from '../services/db';
import { auth } from '../lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MobileNavigation() {
  const { profile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSwitchRole = async () => {
    if (!profile) return;
    const newRole = profile.role === 'Mentor' ? 'Student' : 'Mentor';
    if (!confirm(`Switching operational identity to ${newRole}. Proceed?`)) return;
    
    try {
      await dbService.updateUserProfile(profile.uid, { role: newRole });
      await refreshProfile();
      setIsDrawerOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to log out?')) return;
    await auth.signOut();
    setIsDrawerOpen(false);
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/ai-chat', icon: MessageSquare, label: 'AI Chat' },
    { to: '/mcqs', icon: FileQuestion, label: 'MCQs' },
    { to: '/explainer', icon: ImageIcon, label: 'AI Explainer' },
  ];

  const secondaryItems = [
    { to: '/predictor', icon: FileCheck, label: 'Paper Predictor' },
  ];

  const subjectItems = [
    { id: 'computer', icon: Binary, label: 'Computer Science' },
    { id: 'physics', icon: Atom, label: 'Physics' },
    { id: 'biology', icon: Dna, label: 'Biology' },
    { id: 'chemistry', icon: Beaker, label: 'Chemistry' },
  ];

  const themeOptions: { id: 'light' | 'dark' | 'midnight'; icon: React.ReactNode; label: string }[] = [
    { id: 'light', icon: <Sun size={14} />, label: 'Light' },
    { id: 'midnight', icon: <Zap size={14} />, label: 'Midnight' },
    { id: 'dark', icon: <Moon size={14} />, label: 'Dark' },
  ];

  return (
    <>
      {/* Floating Bottom Navigation Bar for Mobile */}
      <nav id="mobile-bottom-bar" className="lg:hidden fixed bottom-4 left-4 right-4 z-40 bg-card/90 backdrop-blur-xl border border-border shadow-2xl rounded-3xl h-20 px-4 flex items-center justify-around transition-all">
        {navItems.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center flex-1 py-1 h-full relative group transition-colors hover:text-primary"
            >
              <div className={cn(
                "relative p-2.5 rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110" 
                  : "text-muted-foreground group-hover:bg-muted"
              )}>
                <item.icon size={20} className="transition-transform group-hover:scale-105" />
              </div>
              <span className={cn(
                "text-[10px] font-bold mt-1 tracking-tight transition-all",
                isActive ? "text-primary font-black scale-105" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
        
        {/* Menu Toggle for Slide-out Drawer */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 h-full relative group transition-colors text-muted-foreground hover:text-primary",
            isDrawerOpen && "text-primary"
          )}
        >
          <div className={cn(
            "p-2.5 rounded-2xl transition-all duration-300",
            isDrawerOpen ? "bg-primary/20 text-primary scale-110" : "group-hover:bg-muted"
          )}>
            <MenuIcon size={20} className="transition-transform" />
          </div>
          <span className={cn("text-[10px] font-bold mt-1 tracking-tight", isDrawerOpen && "text-primary font-black")}>
            Menu
          </span>
        </button>
      </nav>

      {/* Slide-out Drawer Panel overlay & content */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop Fade-in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-55 cursor-pointer"
            />

            {/* Slide-out panel from Right */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border z-60 shadow-2xl flex flex-col h-screen overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xl text-primary font-sans">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GraduationCap size={18} />
                  </div>
                  <span className="tracking-tighter">Edupulse Menu</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-muted hover:bg-border text-muted-foreground hover:text-foreground transition-all"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              {/* Scrollable Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                {/* Profile Widget */}
                {profile && (
                  <div className="bg-muted/40 border border-border p-5 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg">
                        {profile.displayName ? profile.displayName[0] : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-black truncate">{profile.displayName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{profile.role}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleSwitchRole}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-card hover:bg-muted-foreground/10 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all active:scale-[0.98]"
                    >
                      <RefreshCcw size={12} />
                      Switch Identity
                    </button>
                  </div>
                )}

                 {/* Secondary utilities (Predictor) */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 opacity-50">Additional tools</p>

                  {secondaryItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsDrawerOpen(false)}
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
                      )}
                    >
                      <item.icon size={18} className="transition-transform group-hover:scale-105" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>

                {/* Academic Subjects List */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 opacity-50">Academic Subjects</p>
                  <div className="grid grid-cols-1 gap-2">
                    {subjectItems.map(item => {
                      const subjectPath = `/subject/${item.id}`;
                      const isActive = location.pathname === subjectPath;
                      return (
                        <NavLink
                          key={item.id}
                          to={subjectPath}
                          onClick={() => setIsDrawerOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group",
                            isActive 
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" 
                              : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
                          )}
                        >
                          <item.icon size={18} className="transition-transform group-hover:scale-110" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>

                {/* Theme Selector Option Inside Drawer */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 opacity-50">Visual Theme</p>
                  <div className="flex bg-muted p-1 rounded-2xl border border-border">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                          theme === opt.id 
                            ? "bg-card text-primary shadow-sm scale-102 border border-border" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer controls */}
              <div className="p-6 border-t border-border bg-muted/10">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-white font-bold text-sm rounded-2xl transition-all active:scale-[0.98] mb-3"
                >
                  <LogOut size={16} />
                  <span>Logout Protocol</span>
                </button>
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/30 font-sans">
                    Created by <span className="text-primary italic font-black">Safiullah</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
