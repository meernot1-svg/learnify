import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap, Chrome } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Logo } from './Logo';

export default function Login() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      navigate('/dashboard');
    } else if (user && !profile) {
      navigate('/registration');
    }
  }, [user, profile, navigate]);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    if (!navigator.onLine) {
      setError("NO SATELLITE LINK: Please check your internet connection.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result.user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === 'auth/network-request-failed') {
        setError("UPLINK INTERRUPTED: Network request failed.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("AUTH CANCELLED: Identity verification was interrupted.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`UNAUTHORIZED DOMAIN: Please add '${window.location.hostname}' to your Authorized Domains in the Firebase Console (Authentication -> Settings -> Authorized Domains).`);
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("PROVIDER DISABLED: Google Sign-In is not enabled in your Firebase project.");
      } else {
        setError(`ACCESS DENIED: ${err.message || "Authentication protocol failed."}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="max-w-md w-full relative"
      >
        {/* Mascot Element */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex justify-center mb-8"
        >
          <img 
            src="https://lh3.googleusercontent.com/d/1mjlHJVtQeSVVmtFMkFwLLCs_ZRMfaOrf" 
            alt="Mascot"
            className="w-[140px] drop-shadow-[0_10px_30px_rgba(250,204,21,0.4)]"
            referrerPolicy="no-referrer"
          />
        </motion.div>


        <div className="bg-card border-2 border-border p-12 rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
          
          <div className="text-center mb-12">
            <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ delay: 0.4, type: "spring" }}
               className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground mx-auto mb-8 shadow-2xl shadow-primary/40 rotate-12"
            >
              <Logo className="w-16 h-16" />
            </motion.div>
            <h1 className="text-4xl font-black mb-3 tracking-tighter uppercase">ACCESS CHANNEL</h1>
            <p className="text-muted-foreground font-medium">Verify your identity to engage the Learnify network.</p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
              >
                {error}
              </motion.div>
            )}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-4 px-8 py-5 rounded-2xl bg-foreground text-background font-black text-sm uppercase tracking-widest transition-all group ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary hover:text-white hover:shadow-xl shadow-primary/20 hover:-translate-y-1'}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Chrome size={20} className="group-hover:rotate-12 transition-transform" />
              )}
              <span>{isLoading ? 'Decrypting...' : 'Google Auth Override'}</span>
            </button>
          </motion.div>

          <div className="mt-12 pt-8 border-t border-border/50 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-4">Secured by AES-256 Protocol</p>
            <div className="flex justify-center gap-6 opacity-40">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <div className="w-2 h-2 rounded-full bg-primary animate-ping delay-75" />
              <div className="w-2 h-2 rounded-full bg-primary animate-ping delay-150" />
            </div>
          </div>
        </div>

        {/* Decorative shadow */}
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-[3.5rem] -z-10 translate-y-6" />
      </motion.div>
    </div>
  );
}
