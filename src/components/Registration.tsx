import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Shield, Phone, MapPin, AtSign, Briefcase, GraduationCap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import { UserRole } from '../types';

export default function Registration() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  
  // Use effect to handle existing profile
  React.useEffect(() => {
    if (profile) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    fatherName: '',
    phone: '',
    address: ''
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;
    
    if (!navigator.onLine) {
      setError("NO UPLINK: Please check your internet connection before finalizing.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await dbService.createUserProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: formData.fullName,
        username: formData.username,
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        phone: formData.phone,
        address: formData.address,
        role,
        achievements: [],
        createdAt: new Date()
      });
      
      // Add a small artificial delay to let Firestore index propagate if needed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Failed to register:", err);
      setError(err?.message || "Registration failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-4xl w-full text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-black mb-6 italic text-primary uppercase tracking-tighter">Choose Your Path</h1>
            <p className="text-xl text-muted-foreground mb-16 max-w-2xl mx-auto">To begin your journey, identify your primary objective within our ecosystem.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button 
                onClick={() => setRole('Mentor')}
                className="group p-10 bg-card border-2 border-border rounded-[3rem] text-left hover:border-primary transition-all relative overflow-hidden shadow-2xl shadow-primary/5"
              >
                <div className="mb-8 w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Briefcase className="w-10 h-10" />
                </div>
                <h3 className="text-4xl font-black mb-4 uppercase italic">Mentor</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed font-medium">I am here to architect curriculums, facilitate learning, and catalyze student potential.</p>
              </button>
              
              <button 
                onClick={() => setRole('Student')}
                className="group p-10 bg-card border-2 border-border rounded-[3rem] text-left hover:border-primary transition-all relative overflow-hidden shadow-2xl shadow-primary/5"
              >
                <div className="mb-8 w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <GraduationCap className="w-10 h-10" />
                </div>
                <h3 className="text-4xl font-black mb-4 uppercase italic">Student</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed font-medium">I am here to acquire mastery, conquer challenges, and utilize precision tools.</p>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white dark:bg-[#0a0a0a] rounded-[3rem] p-10 md:p-16 shadow-2xl border border-border/5"
      >
        <div className="mb-12">
          <button onClick={() => setRole(null)} className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.3em] mb-4 hover:text-primary">← Change Identification</button>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-primary">Biometric Data</h2>
          <p className="text-muted-foreground font-medium mt-2">Complete your profile to access the secure network.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest leading-relaxed"
            >
              {error}
            </motion.div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <AtSign size={14} /> Network Alias (Username)
              </label>
              <input 
                required
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-muted/20 border-0 rounded-2xl p-5 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g. cyber_learner_01"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <User size={14} /> Legal Name
              </label>
              <input 
                required
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full bg-muted/20 border-0 rounded-2xl p-5 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="First and last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <Shield size={14} /> Parent/Guardian Alias
              </label>
              <input 
                value={formData.fatherName}
                onChange={e => setFormData({...formData, fatherName: e.target.value})}
                className="w-full bg-muted/20 border-0 rounded-2xl p-5 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Father's name"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <Phone size={14} /> Communication Link
              </label>
              <input 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-muted/20 border-0 rounded-2xl p-5 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
              <MapPin size={14} /> Physical Coordinate (Address)
            </label>
            <input 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full bg-muted/20 border-0 rounded-2xl p-5 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Your city or district"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] rounded-3xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-8 shadow-2xl"
          >
            {loading ? 'Processing Protocol...' : 'Finalize Registration'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
