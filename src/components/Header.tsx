import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Sun, Moon, Zap, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { auth } from '../lib/firebase';
import { Logo } from './Logo';

export default function Header() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const themeOptions: { id: 'light' | 'dark' | 'midnight', icon: React.ReactNode }[] = [
    { id: 'light', icon: <Sun size={18} /> },
    { id: 'midnight', icon: <Zap size={18} /> },
    { id: 'dark', icon: <Moon size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors">
      <div className="px-6 md:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Link to="/" className="flex items-center gap-3 font-black text-2xl tracking-tighter text-primary italic uppercase group">
              <Logo className="w-10 h-10 group-hover:rotate-12 transition-transform duration-300 shadow-xl shadow-primary/20" />
              <span className="hidden sm:block">Edupulse</span>
           </Link>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center bg-muted/50 rounded-full p-1 border border-border">
            {themeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`p-2 rounded-full transition-all ${
                  theme === opt.id 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title={`${opt.id.charAt(0).toUpperCase() + opt.id.slice(1)} Mode`}
              >
                {opt.icon}
              </button>
            ))}
          </div>

          {!user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium hover:text-primary transition-colors"
              >
                <LogIn size={16} />
                <span className="hidden xs:inline">Sign In</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
              >
                <UserPlus size={16} />
                <span>Join</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/dashboard" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 max-w-[120px] sm:max-w-[200px]">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                  {profile?.displayName ? profile.displayName[0].toUpperCase() : 'U'}
                </div>
                <span className="truncate hidden xs:inline max-w-[80px] sm:max-w-none">{profile?.displayName || user.email?.split('@')[0]}</span>
                <span className="text-[9px] opacity-60 bg-muted px-1.5 py-0.5 rounded-full capitalize shrink-0 hidden md:inline">
                  {profile?.role}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
