import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  RefreshCcw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleSwitchRole = async () => {
    if (!profile) return;
    const newRole = profile.role === 'Mentor' ? 'Student' : 'Mentor';
    if (!confirm(`Switching operational identity to ${newRole}. Proceed?`)) return;
    
    try {
      await dbService.updateUserProfile(profile.uid, { role: newRole });
      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/ai-chat', icon: MessageSquare, label: 'AI Chatbot' },
    { to: '/mcqs', icon: FileQuestion, label: 'MCQs Provider' },
    { to: '/explainer', icon: ImageIcon, label: 'AI Explainer' },
    { to: '/predictor', icon: FileCheck, label: 'Paper Predictor' },
  ];

  const subjectItems = [
    { id: 'computer', icon: Binary, label: 'Computer' },
    { id: 'physics', icon: Atom, label: 'Physics' },
    { id: 'biology', icon: Dna, label: 'Biology' },
    { id: 'chemistry', icon: Beaker, label: 'Chemistry' },
  ];

  return (
    <aside className="w-64 border-r border-border flex flex-col hidden lg:flex bg-card h-screen sticky top-0 overflow-hidden">
      <div className="p-8 flex-1 scrollbar-hide overflow-y-auto">
        <div className="flex items-center gap-2 font-bold text-2xl mb-12 text-primary">
           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap size={24} />
           </div>
           <span className="tracking-tighter">Learnify</span>
        </div>

        <nav className="space-y-1.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 px-3 opacity-50">Main Menu</p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={18} className={cn("transition-transform group-hover:scale-110")} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-10 mb-4 px-3 opacity-50">Academic Subjects</p>
          {subjectItems.map(item => (
            <NavLink
              key={item.id}
              to={`/subject/${item.id}`}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={18} className={cn("transition-transform group-hover:scale-110")} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-border bg-muted/20">
        {profile && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 bg-card p-3 rounded-2xl border border-border shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-inner">
                {profile.displayName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate leading-none mb-1">{profile.displayName}</p>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{profile.role}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleSwitchRole}
              className="flex items-center justify-center gap-2 w-full py-2 bg-muted hover:bg-border rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
            >
              <RefreshCcw size={12} />
              Switch Identity
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
