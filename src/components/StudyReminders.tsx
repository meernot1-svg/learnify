import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar as CalendarIcon, 
  X as CloseIcon,
  AlertCircle,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { dbService } from '../services/db';
import { useAuth } from '../hooks/useAuth';
import { StudyReminder, Subject } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface StudyRemindersProps {
  onClose?: () => void;
}

export default function StudyReminders({ onClose }: StudyRemindersProps) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  const [subject, setSubject] = useState<Subject | string>('computer');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadReminders();
    }
  }, [user]);

  const loadReminders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await dbService.getReminders(user.uid);
      setReminders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic || !date || !time) return;

    setSubmitting(true);
    try {
      const reminderTime = new Date(`${date}T${time}`);
      await dbService.createReminder({
        subject,
        topic,
        time: reminderTime,
      });
      setShowAdd(false);
      setTopic('');
      setDate('');
      setTime('');
      loadReminders();
    } catch (error) {
      console.error(error);
      alert('Failed to set reminder. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dbService.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const subjects: Subject[] = ['computer', 'physics', 'biology', 'chemistry'];

  return (
    <div className="space-y-8 p-1">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4">
          <Bell className="text-primary" size={32} strokeWidth={3} />
          Study Pulse
        </h2>
        <button 
          onClick={() => setShowAdd(true)}
          className="p-4 bg-primary text-primary-foreground rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center opacity-30">
            <Clock className="mx-auto mb-4 animate-pulse" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Syncing temporal data...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed border-border/20 rounded-[3rem] bg-muted/5">
            <p className="text-xs font-black italic uppercase text-muted-foreground tracking-[0.3em] opacity-40">No active reminders in the sector.</p>
          </div>
        ) : (
          reminders.map(reminder => (
            <motion.div 
              key={reminder.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "p-4 sm:p-6 border-2 sm:border-4 border-border rounded-[2rem] sm:rounded-[2.5rem] bg-card shadow-xl flex flex-col sm:flex-row gap-4 sm:items-center justify-between group hover:border-primary transition-all",
                reminder.isNotified && "opacity-50 grayscale-[0.5]"
              )}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <div className={cn(
                  "w-12 h-12 sm:w-16 sm:h-16 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center shadow-inner shrink-0",
                  reminder.subject === 'computer' ? 'bg-blue-500/10 text-blue-500' :
                  reminder.subject === 'physics' ? 'bg-purple-500/10 text-purple-500' :
                  reminder.subject === 'biology' ? 'bg-emerald-500/10 text-emerald-500' :
                  'bg-red-500/10 text-red-500'
                )}>
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-base sm:text-lg font-black italic uppercase tracking-tighter leading-none">{reminder.topic}</p>
                    {reminder.isNotified && <CheckCircle2 size={16} className="text-emerald-500" />}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{reminder.subject}</span>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                      {format(new Date(reminder.time.seconds ? reminder.time.seconds * 1000 : reminder.time), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(reminder.id)}
                className="p-3 sm:p-4 rounded-xl bg-muted/50 text-muted-foreground hover:bg-red-500 hover:text-white transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 self-end sm:self-auto"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-md w-full bg-card border-2 md:border-4 border-border p-6 sm:p-10 rounded-3xl sm:rounded-[4rem] shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAdd(false)}
                className="absolute top-6 right-6 p-3 rounded-full hover:bg-muted transition-colors"
              >
                <CloseIcon size={24} />
              </button>

              <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-8">Deploy Reminder</h3>

              <form onSubmit={handleAddReminder} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Sector / Subject</label>
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-4 bg-muted border-4 border-border rounded-2xl font-bold uppercase text-[10px] tracking-widest outline-none focus:border-primary transition-all"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Topic Intelligence</label>
                  <input 
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="E.g. Quantum Mechanics Prep"
                    className="w-full p-4 bg-muted border-4 border-border rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Launch Date</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-4 bg-muted border-4 border-border rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Sync Time</label>
                    <input 
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full p-4 bg-muted border-4 border-border rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-6 bg-primary text-primary-foreground rounded-[2rem] font-black italic uppercase tracking-tighter text-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Calibrating...' : 'Set Study Pulse'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
