import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Brain, FlaskConical, Terminal, GraduationCap } from 'lucide-react';
import Header from './Header';
import { Logo } from './Logo';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && profile) {
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  const handleGetStarted = () => {
    if (user) {
      if (profile) {
        navigate('/dashboard');
      } else {
        navigate('/registration');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/30">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden pt-24 pb-12 text-center">
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col items-center">
          
          {/* Large Visible Mascot on the Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -150, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute left-[-35%] md:left-[-15%] top-1/2 -translate-y-1/2 -z-0 pointer-events-none opacity-40 md:opacity-100"
          >
            <div className="relative">
              <img 
                src="https://lh3.googleusercontent.com/d/1mjlHJVtQeSVVmtFMkFwLLCs_ZRMfaOrf"
                alt="Learnify Mascot"
                className="w-[600px] md:w-[1000px] h-auto drop-shadow-[0_40px_80px_rgba(244,180,0,0.5)] brightness-110"
                referrerPolicy="no-referrer"
              />
              {/* Intensive Glow behind mascot */}
              <div className="absolute inset-0 bg-primary/20 blur-[150px] rounded-full -z-10 animate-pulse" />
            </div>
          </motion.div>

          {/* Centered Content shifted to the right */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl relative z-10 md:translate-x-24"
          >
            <h1 className="text-[40px] sm:text-[65px] md:text-[100px] leading-[0.9] font-[900] m-0 tracking-tighter mb-4 drop-shadow-sm">
              Unlock Your <br/>
              <span className="text-[#f4b400]">Potential</span>
            </h1>
            <h2 className="text-[35px] sm:text-[55px] md:text-[90px] leading-none text-foreground font-[800] m-0 tracking-tighter mb-10 opacity-90">
              with Learnify
            </h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-[16px] sm:text-[20px] md:text-[22px] text-muted-foreground/90 max-w-2xl mx-auto mb-14 font-medium leading-relaxed px-4"
            >
              EduPulse is the ultimate ecosystem for interactive mastery. 
              Engineered for deep-learning retention and high-frequency engagement.
            </motion.p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto group relative px-10 sm:px-12 py-5 sm:py-6 rounded-2xl bg-primary text-primary-foreground font-black text-sm sm:text-base uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/40 transition-all transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10">Initialize Journey</span>
              </button>
              <button className="w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 rounded-2xl border-2 border-border font-black text-sm sm:text-base uppercase tracking-widest hover:bg-muted transition-all">
                System Manual
              </button>
            </div>
          </motion.div>
        </div>

        {/* Subtle Background Glows */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <StatItem value="15k+" label="Active Cadets" />
          <StatItem value="250+" label="Verified Mentors" />
          <StatItem value="1.2k+" label="Simulations" />
          <StatItem value="98%" label="Success Index" />
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter mb-4 uppercase">CORE MODULES</h2>
            <p className="text-muted-foreground font-medium">Engineered for deep-learning retention and high-frequency engagement.</p>
          </div>
          <div className="flex gap-2">
            <div className="w-12 h-1 bg-primary rounded-full" />
            <div className="w-4 h-1 bg-border rounded-full" />
            <div className="w-4 h-1 bg-border rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto md:auto-rows-[240px]">
          <BentoCard 
            className="md:col-span-8 md:row-span-2"
            icon={<FlaskConical className="w-10 h-10 text-primary" />}
            title="NEURAL LAB SIMULATIONS"
            description="Physics. Chemistry. Biology. Perform dangerous experiments in a zero-risk, high-fidelity digital sandbox that mimics real-world thermodynamics."
            tag="EXPERIMENTAL"
          />
          <BentoCard 
            className="md:col-span-4 md:row-span-1"
            icon={<Brain className="w-8 h-8 text-pink-500" />}
            title="GEMINI AI OPTIMIZER"
            description="Real-time MCQ generation and diagram decryption."
            tag="INTELLIGENCE"
          />
          <BentoCard 
            className="md:col-span-4 md:row-span-2"
            icon={<Terminal className="w-8 h-8 text-green-500" />}
            title="SANDBOX IDE"
            description="Execute Python logic directly within the curriculum workflow. No external setup required."
            tag="DEVELOPMENT"
          />
          <BentoCard 
            className="md:col-span-8 md:row-span-1"
            icon={<GraduationCap className="w-8 h-8 text-blue-500" />}
            title="MENTOR OVERSEER"
            description="Direct-to-student stream protocol for materials."
            tag="PEDAGOGY"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-40 px-6">
        <div className="max-w-5xl mx-auto p-8 sm:p-12 md:p-24 rounded-3xl sm:rounded-[3rem] bg-foreground text-background relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 text-center">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-8 sm:mb-10 leading-tight">READY TO TRIGGER <br/> THE FUTURE?</h2>
            <button 
              onClick={handleGetStarted}
              className="px-8 sm:px-12 py-4 sm:py-6 rounded-2xl bg-primary text-primary-foreground font-black text-sm sm:text-base uppercase tracking-widest hover:scale-105 sm:hover:scale-110 shadow-2xl shadow-primary/40 transition-all"
            >
              Initialize Node
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-20 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3 font-black text-xl sm:text-2xl tracking-tighter uppercase italic">
            <Logo className="w-10 h-10" />
            Learnify
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-xs font-bold uppercase tracking-widest opacity-60">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Neural Network</a>
            <a href="#" className="hover:text-primary transition-colors">System Protocols</a>
          </div>
          <div className="text-xs font-medium opacity-40">
            © 2024 LEARNIFY CORE SYSTEMS.
          </div>
        </div>
      </footer>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px]" />
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 tracking-tighter">{value}</div>
      <div className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-muted-foreground">{label}</div>
    </div>
  );
}

function BentoCard({ className, icon, title, description, tag }: { className?: string, icon: React.ReactNode, title: string, description: string, tag: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      className={cn("group p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border border-border bg-card shadow-sm hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between", className)}
    >
      <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-muted text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 group-hover:bg-primary/20 group-hover:text-primary transition-all">
        {tag}
      </div>
      <div>
        <div className="mb-6 sm:mb-10 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-muted w-fit group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
          {icon}
        </div>
        <h3 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 tracking-tighter uppercase">{title}</h3>
        <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">{description}</p>
      </div>
      
      <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 hidden sm:block">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
          <BookOpen size={18} />
        </div>
      </div>
    </motion.div>
  );
}

const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');
