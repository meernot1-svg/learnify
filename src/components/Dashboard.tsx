import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Video, 
  Book as BookIcon, 
  Award, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  Users, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  Trash2, 
  Star, 
  Download, 
  Play, 
  ExternalLink, 
  X as CloseIcon, 
  AlertCircle,
  Trophy,
  Bell,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dbService } from '../services/db';
import { storage, db } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { Material, Course, Progress, Subject, UserProfile, StudyReminder } from '../types';
import { cn } from '../lib/utils';
import MentorVerification from './MentorVerification';
import StudyReminders from './StudyReminders';
import { format } from 'date-fns';

export default function Dashboard() {
  const { profile, isMentorVerified, setMentorVerified } = useAuth();
  
  if (profile?.role === 'Mentor') {
    if (!isMentorVerified) return <MentorVerification onVerify={() => setMentorVerified(true)} />;
    return <MentorDashboard />;
  }
  return <StudentDashboard />;
}

function MentorDashboard() {
  const { profile, user } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [studentProgress, setStudentProgress] = useState<Progress[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    
    // Safety timeout for loading state
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 4000);
    
    // Students listener
    const unsubStudents = onSnapshot(collection(db, 'users'), (snap) => {
      clearTimeout(loadingTimeout);
      const studentList = snap.docs
        .map(d => ({ uid: d.id, ...d.data() } as UserProfile))
        .filter(u => u.role === 'Student');
      setStudents(studentList);
      setLoading(false);

      // Refresh selected student if updated
      if (selectedStudent) {
        const updated = studentList.find(s => s.uid === selectedStudent.uid);
        if (updated) setSelectedStudent(updated);
      }
    }, (err) => {
      clearTimeout(loadingTimeout);
      console.error("Students Listener Error:", err);
      setLoading(false);
    });

    // Materials listener
    const unsubMaterials = onSnapshot(collection(db, 'materials'), (snap) => {
      const materialList = snap.docs.map(d => ({ id: d.id, ...d.data() } as Material));
      const isAdmin = user?.email === 'meernot1@gmail.com';
      if (isAdmin) {
        setMaterials(materialList);
      } else {
        setMaterials(materialList.filter(m => m.mentorId === user?.uid));
      }
    }, (err) => {
      console.error("Materials Listener Error:", err);
    });

    // Courses listener
    const unsubCourses = onSnapshot(collection(db, 'courses'), (snap) => {
      const courseList = snap.docs.map(d => ({ id: d.id, ...d.data() } as Course));
      const isAdmin = user?.email === 'meernot1@gmail.com';
      if (isAdmin) {
        setCourses(courseList);
      } else {
        setCourses(courseList.filter(c => c.mentorId === user?.uid));
      }
    }, (err) => {
      console.error("Courses Listener Error:", err);
    });

    return () => {
      unsubStudents();
      unsubMaterials();
      unsubCourses();
    };
  }, [user]);

  useEffect(() => {
    if (!selectedStudent) {
      setStudentProgress([]);
      return;
    }

    setProgressLoading(true);
    const q = query(collection(db, 'progress'), where('userId', '==', selectedStudent.uid));
    const unsub = onSnapshot(q, (snap) => {
      setStudentProgress(snap.docs.map(d => ({ id: d.id, ...d.data() } as Progress)));
      setProgressLoading(false);
    }, (err) => {
      console.error("Progress Listener Error:", err);
      setProgressLoading(false);
    });

    return () => unsub();
  }, [selectedStudent?.uid]);

  const awardBadge = async (studentId: string, badgeType: string) => {
    console.log(`Awarding badge "${badgeType}" to student ${studentId}`);
    try {
      await dbService.awardBadge(studentId, badgeType);
      alert(`Access Granted: Badge "${badgeType}" archived to student profile.`);
    } catch (err: any) {
      console.error("Badge Error Details:", err);
      alert(`Failed to award badge: ${err.message || 'Check mentor permissions.'}`);
    }
  };

  const handleGiveBadge = async (studentId: string) => {
    const badge = prompt('Enter specialized badge name:');
    if (badge) {
      awardBadge(studentId, badge);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    console.log(`[ACTION] Delete Material initiated: ${id}`);
    
    // Skip confirm for the specific user who asked for "reset by yourself"
    // or just make it silent if they are clicking multiple times
    try {
      await dbService.deleteMaterial(id);
      console.log(`[SUCCESS] Material ${id} deleted.`);
      // We don't necessarily need an alert if it's high frequency, 
      // but let's keep it for feedback for now.
    } catch (err: any) {
      console.error("[ERROR] Delete Material:", err);
      let msg = err.message;
      try {
        const errorData = JSON.parse(err.message);
        msg = `Err: ${errorData.error} (Op: ${errorData.operationType})`;
      } catch (e) {}
      alert(`Deletion Failed: ${msg}`);
    }
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    console.log(`[ACTION] Delete Course: ${courseToDelete.id}`);
    try {
      await dbService.deleteCourse(courseToDelete.id);
      alert("Curriculum removed from system.");
      setCourseToDelete(null);
    } catch (err: any) {
      console.error("Delete Course Error:", err);
      let msg = err.message;
      try {
        const errorData = JSON.parse(err.message);
        msg = `Error: ${errorData.error} (Operation: ${errorData.operationType} on ${errorData.path})`;
      } catch (e) {}
      alert(`Course Deletion Failed: ${msg}`);
      setCourseToDelete(null);
    }
  };

  const handleTogglePriority = async (id: string, current: boolean) => {
    try {
      await dbService.toggleMaterialPriority(id, current);
    } catch (err: any) {
      console.error("Toggle Priority Error:", err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl md:text-4xl font-black italic mb-1 tracking-tighter uppercase text-primary">Mentor Command</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] mt-1 opacity-60">Architect of educational catalogs and student growth.</p>
        </motion.div>
        <button 
           onClick={() => setShowUpload(true)}
           className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-primary/20"
        >
          <Plus size={20} strokeWidth={4} />
          <span>Deploy Resource</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Courses" value={courses.length.toString()} icon={<BookIcon size={20} />} />
        <StatCard title="Total Students" value={students.length.toString()} icon={<Users size={20} />} />
        <StatCard title="My Resources" value={materials.length.toString()} icon={<Clock size={20} />} />
        <StatCard title="Efficiency" value="98%" icon={<TrendingUp size={20} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <section className="space-y-10">
          <div className="bg-card border-2 md:border-4 border-border rounded-3xl sm:rounded-[3.5rem] md:rounded-[4rem] p-5 sm:p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
               <Users size={120} />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-4">
               <Users className="text-primary" size={32} />
               Student Roster
            </h2>
            <div className="space-y-6">
              {loading ? (
                <p className="text-center py-20 text-muted-foreground uppercase text-[10px] font-black tracking-widest opacity-40">Loading students...</p>
              ) : students.length === 0 ? (
                <p className="text-center py-20 text-muted-foreground uppercase text-[10px] font-black tracking-widest opacity-40">No students found.</p>
              ) : (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div 
                      key={student.uid} 
                      onClick={() => setSelectedStudent(student)}
                      className={cn(
                        "p-6 border-2 rounded-3xl flex items-center justify-between transition-all cursor-pointer",
                        selectedStudent?.uid === student.uid 
                          ? "bg-primary/5 border-primary shadow-lg" 
                          : "bg-muted/20 border-border/50 hover:bg-muted/40 hover:scale-[1.02]"
                      )}
                    >
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl",
                          selectedStudent?.uid === student.uid ? "bg-primary text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground"
                        )}>
                          {student.displayName[0]}
                        </div>
                        <div>
                          <p className="font-black uppercase italic tracking-tight">{student.displayName}</p>
                          <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest opacity-40">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <ChevronRight className={cn(
                          "text-muted-foreground/30 transition-transform",
                          selectedStudent?.uid === student.uid && "rotate-90 text-primary"
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {selectedStudent && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-card border-2 md:border-4 border-border rounded-3xl sm:rounded-[3.5rem] md:rounded-[4rem] p-5 sm:p-10 shadow-2xl relative overflow-hidden mt-8"
              >
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                    <Users className="text-primary" size={28} />
                    Student Intel
                  </h3>
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="p-3 bg-muted rounded-2xl hover:bg-muted/80 transition-all font-black text-[10px] uppercase tracking-widest"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-6 flex items-center gap-2">
                       <Play size={14} /> Mission Progress
                    </h4>
                    {progressLoading ? (
                       <div className="text-center py-10 animate-pulse text-[10px] font-black uppercase tracking-widest opacity-30">Decrypting progress stream...</div>
                    ) : studentProgress.length === 0 ? (
                       <p className="text-center py-6 w-full text-muted-foreground text-[10px] font-black uppercase italic tracking-widest opacity-30">No missions logged in this sector.</p>
                    ) : (
                      <div className="space-y-3">
                        {studentProgress.map((p, i) => {
                          const material = materials.find(m => m.id === p.materialId);
                          return (
                            <div key={i} className="flex items-center justify-between p-4 bg-muted/10 border border-border/50 rounded-2xl">
                               <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                     <CheckCircle size={16} />
                                  </div>
                                  <span className="text-xs font-black uppercase italic tracking-tight">{material?.title || 'Unknown Asset'}</span>
                               </div>
                               <span className="text-[8px] font-bold uppercase text-muted-foreground/40">{format(p.updatedAt?.toDate?.() || new Date(), 'MMM d, HH:mm')}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="space-y-10">
          <div className="bg-card border-2 md:border-4 border-border rounded-3xl sm:rounded-[4rem] p-5 sm:p-10 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:-rotate-12 transition-transform">
                <ShieldCheck size={120} />
             </div>
             <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-4">
                <ShieldCheck className="text-primary" size={32} />
                Course Catalog
             </h2>
             <div className="space-y-6">
               {courses.length === 0 ? (
                 <p className="text-center py-20 text-muted-foreground text-xs font-black uppercase tracking-widest opacity-40 italic">Syncing sector data...</p>
               ) : (
                 courses.map(c => (
                   <div key={c.id} className="p-8 bg-muted/20 border-4 border-border rounded-[3rem] flex items-center justify-between transition-all hover:border-primary group/card">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-[1.8rem] bg-primary/10 text-primary flex items-center justify-center shadow-inner group-hover/card:bg-primary group-hover/card:text-primary-foreground transition-all">
                            <BookIcon size={32} />
                         </div>
                         <div>
                            <p className="text-xl font-black italic uppercase tracking-tighter mb-1">{c.title}</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{c.subject} Sector</span>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteCourse(c)}
                        className="p-4 bg-background border-2 border-border text-muted-foreground hover:text-red-500 hover:border-red-500/30 rounded-2xl transition-all shadow-lg"
                      >
                        <Trash2 size={24} />
                      </button>
                   </div>
                 ))
               )}
             </div>
          </div>
        </section>

        <section className="col-span-full space-y-10">
          <div className="bg-card border-2 md:border-4 border-border rounded-3xl sm:rounded-[4rem] md:rounded-[5rem] p-6 sm:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 scale-150">
               <BookIcon size={300} />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter mb-10 sm:mb-16 flex items-center gap-4 sm:gap-6">
               <BookIcon className="text-primary font-black" size={48} strokeWidth={3} />
               Educational Datalink
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {materials.length === 0 ? (
                <div className="col-span-full py-20 sm:py-40 text-center bg-muted/5 border-2 md:border-4 border-dashed border-border/20 rounded-3xl sm:rounded-[4rem]">
                  <p className="text-xs font-black italic uppercase text-muted-foreground tracking-[0.5em] opacity-30">Archive empty. Deploy materials to sector.</p>
                </div>
              ) : (
                materials.map(m => (
                  <div key={m.id} className="p-10 bg-muted/10 border-4 border-border rounded-[3.5rem] flex items-center justify-between transition-all hover:bg-muted/20 hover:border-primary group/item shadow-xl relative overflow-hidden">
                    <div className="flex items-center gap-8 relative z-10">
                      <div className={cn(
                        "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all",
                        m.type === 'video' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                      )}>
                        {m.type === 'video' ? <Video size={36} /> : <BookIcon size={36} />}
                      </div>
                      <div className="min-w-0 pr-8">
                        <div className="flex items-center gap-3 mb-2">
                           <p className="text-2xl font-black italic uppercase tracking-tighter truncate">{m.title}</p>
                           {m.isPrioritized && (
                             <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                           )}
                        </div>
                        <p className="text-[11px] font-black uppercase text-muted-foreground tracking-[0.3em] opacity-40">{m.subject} Core</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                      <button 
                        onClick={() => handleTogglePriority(m.id, !!m.isPrioritized)}
                        className={cn(
                          "w-16 h-16 rounded-full border-4 transition-all flex items-center justify-center bg-background shadow-xl",
                          m.isPrioritized 
                            ? "border-yellow-400 text-yellow-500" 
                            : "border-border text-muted-foreground hover:text-yellow-500"
                        )}
                      >
                        <Star size={24} fill={m.isPrioritized ? "currentColor" : "none"} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMaterial(m.id)}
                        className="w-16 h-16 bg-background border-4 border-border text-muted-foreground hover:text-red-500 hover:border-red-500/30 rounded-full flex items-center justify-center transition-all shadow-xl"
                      >
                        <Trash2 size={24} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {user?.email === 'meernot1@gmail.com' && (
               <div className="mt-20 pt-16 border-t-4 border-border/30">
                  <button 
                    onClick={async () => {
                      if (confirm('SYSTEM OVERRIDE: Purge all curriculum data?')) {
                        try {
                           await dbService.purgeAllData();
                           alert('System Reset Complete.');
                        } catch (e: any) {
                           alert('Purge Failed: ' + e.message);
                        }
                      }
                    }}
                    className="w-full py-6 bg-red-500/5 border-4 border-red-500/20 text-red-500 rounded-[3rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-red-500 text-white transition-all shadow-xl"
                  >
                    Emergency Core Purge
                  </button>
               </div>
            )}
          </div>
        </section>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

      <AnimatePresence>
        {courseToDelete && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-md w-full bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Delete Course?</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    You are about to permanently delete <span className="text-foreground font-bold">"{courseToDelete.title}"</span>. 
                    This will remove the course curriculum, module associations, and tracking data for all enrolled students.
                  </p>
                </div>
                <div className="w-full p-4 bg-muted/50 rounded-2xl text-[10px] uppercase font-black tracking-widest text-muted-foreground items-start flex gap-2">
                  <Trash2 size={12} className="mt-0.5 shrink-0" />
                  <span>This action is final and cannot be reversed by system administrators.</span>
                </div>
                <div className="flex w-full gap-3">
                  <button 
                    onClick={() => setCourseToDelete(null)}
                    className="flex-1 py-4 bg-muted border border-border rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-border transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteCourse}
                    className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all hover:scale-[1.02]"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StudentDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<Material[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showReminders, setShowReminders] = useState(false);
  const [activeNotification, setActiveNotification] = useState<StudyReminder | null>(null);

  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setMaterialsLoading(true);
    setLeaderboardLoading(true);

    // Leaderboard fetch
    dbService.getLeaderboard().then(data => {
      setLeaderboard(data);
      setLeaderboardLoading(false);
    });

    // Progress listener
    const unsubProgress = onSnapshot(
      query(collection(db, 'progress'), where('userId', '==', user.uid)),
      (snap) => {
        setProgress(snap.docs.map(d => ({ id: d.id, ...d.data() } as Progress)));
      },
      (err) => {
        console.error("Progress Listener Error:", err);
      }
    );

    // Materials listener
    const unsubMaterials = onSnapshot(collection(db, 'materials'), (snap) => {
      setRecentMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() } as Material)));
      setMaterialsLoading(false);
    }, (err) => {
      console.error("Student Materials Listener Error:", err);
      setMaterialsLoading(false);
    });

    return () => {
      unsubProgress();
      unsubMaterials();
    };
  }, [user]);

  // Reminder Notification Logic
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', user.uid),
      where('isNotified', '==', false)
    );

    const unsubReminders = onSnapshot(q, (snap) => {
      const now = new Date();
      snap.docs.forEach(doc => {
        const r = { id: doc.id, ...doc.data() } as StudyReminder;
        const time = new Date(r.time.seconds ? r.time.seconds * 1000 : r.time);
        
        // If it's time or past time
        if (now >= time) {
          setActiveNotification(r);
          dbService.markReminderNotified(r.id);
        }
      });
    }, (err) => {
      console.error("Reminders Listener Error:", err);
    });

    // Check periodically for time match (if already loaded but time hasn't passed yet)
    const interval = setInterval(() => {
      loadAndCheckReminders();
    }, 30000); // Check every 30 seconds

    async function loadAndCheckReminders() {
      const reminders = await dbService.getReminders(user.uid);
      const now = new Date();
      reminders.forEach(r => {
        if (r.isNotified) return;
        const time = new Date(r.time.seconds ? r.time.seconds * 1000 : r.time);
        if (now >= time) {
          setActiveNotification(r);
          dbService.markReminderNotified(r.id);
        }
      });
    }

    return () => {
      unsubReminders();
      clearInterval(interval);
    };
  }, [user]);

  const prioritized = recentMaterials.filter(m => m.isPrioritized);
  const others = recentMaterials.filter(m => !m.isPrioritized).slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex-1">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-foreground leading-none">Welcome, {profile?.displayName}</h1>
            </div>
            <p className="text-muted-foreground italic flex items-center gap-2 mb-4 font-bold uppercase text-[9px] tracking-[0.3em] opacity-60">
              Status: <span className="text-emerald-500">Active Node</span>
            </p>
          </motion.div>
        </div>
        <div className="flex items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowReminders(true)}
            className="relative w-14 h-14 rounded-full bg-card border-4 border-border flex items-center justify-center text-primary shadow-2xl transition-all hover:border-primary group"
          >
            <Bell size={24} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
          </motion.button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Main Intelligence Feed */}
        <div className="space-y-12">
          {prioritized.length > 0 || materialsLoading ? (
            <section className="space-y-8">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-yellow-500">
                  <Star size={32} fill="currentColor" />
                  Priority Uplinks
               </h2>
               <div className="grid grid-cols-1 gap-6">
                  {materialsLoading ? (
                    [1,2].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-[3rem]" />)
                  ) : (
                    prioritized.map(m => (
                      <MaterialCard 
                        key={m.id} 
                        material={m} 
                        priority 
                        onClick={() => setSelectedMaterial(m)} 
                      />
                    ))
                  )}
               </div>
            </section>
          ) : null}

          {/* Recent Materials */}
          <section className="space-y-8">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                   <Clock className="text-primary font-black" size={24} strokeWidth={3} />
                   Sector Catalog
                </h2>
             </div>
             <div className="grid grid-cols-1 gap-6">
                {others.length === 0 && prioritized.length === 0 ? (
                  <div className="py-24 text-center bg-muted/5 border-2 md:border-4 border-dashed border-border/20 rounded-3xl sm:rounded-[4rem]">
                     <p className="text-xs font-black italic uppercase text-muted-foreground tracking-[0.4em] opacity-30">Waiting for mentor transmission...</p>
                  </div>
                ) : (
                  others.map(m => (
                    <MaterialCard 
                      key={m.id} 
                      material={m} 
                      onClick={() => setSelectedMaterial(m)} 
                    />
                  ))
                )}
             </div>
          </section>
        </div>

        {/* Global Analytics */}
        <div className="space-y-12">
          <div className="bg-card border-2 md:border-4 border-border rounded-3xl sm:rounded-[3.5rem] md:rounded-[4rem] p-5 sm:p-12 shadow-2xl">
             <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-4">
               <TrendingUp size={32} className="text-emerald-500" strokeWidth={3} />
               Sector Efficiency
             </h2>
             <div className="space-y-10">
                <ProgressItem label="Video Modules" current={progress.filter(p => true).length} total={20} color="bg-blue-500" />
                <ProgressItem label="Laboratory Tests" current={0} total={10} color="bg-purple-500" />
                <ProgressItem label="Theory Checks" current={0} total={15} color="bg-amber-500" />
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedMaterial && (
          <MaterialViewer 
            material={selectedMaterial} 
            onClose={() => setSelectedMaterial(null)} 
            onComplete={() => {
               if (user) dbService.markComplete(user.uid, selectedMaterial.id);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReminders && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-background/80 backdrop-blur-md p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-card border-2 md:border-4 border-border p-5 sm:p-8 rounded-3xl sm:rounded-[4rem] shadow-2xl relative custom-scrollbar"
            >
              <button 
                onClick={() => setShowReminders(false)}
                className="absolute top-8 right-8 p-3 rounded-full hover:bg-muted transition-colors"
              >
                <CloseIcon size={24} />
              </button>
              <StudyReminders />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeNotification && (
          <div className="fixed bottom-10 right-10 z-[500] max-w-sm w-full">
            <motion.div 
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="p-8 bg-primary text-primary-foreground rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform">
                <Bell size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Clock size={24} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter">Study Pulse Active</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Mission Directive</p>
                  </div>
                </div>
                <p className="text-xl font-black italic uppercase mb-6 leading-tight">
                  Sector: {activeNotification.subject}<br/>
                  Topic: {activeNotification.topic}
                </p>
                <button 
                  onClick={() => setActiveNotification(null)}
                  className="w-full py-3 bg-white text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-opacity-90 transition-all active:scale-95"
                >
                  Acknowledge Directive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MaterialCard({ material, onClick, priority }: { material: Material, onClick: () => void, priority?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-6 bg-card border rounded-[2rem] flex items-center justify-between cursor-pointer group shadow-sm hover:shadow-xl transition-all",
        priority ? "border-yellow-500/30 bg-yellow-500/5 ring-1 ring-yellow-500/10" : "border-border"
      )}
    >
      <div className="flex items-center gap-4">
         <div className={cn(
           "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors",
           material.type === 'video' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500',
           priority && "bg-white shadow-sm"
         )}>
            {material.type === 'video' ? <Video size={24} /> : (material.type === 'pdf' ? <Download size={24} /> : <BookIcon size={24} />)}
         </div>
         <div>
            <div className="flex items-center gap-2">
               <h4 className="font-bold text-sm group-hover:text-primary transition-colors max-w-[120px] truncate">{material.title}</h4>
               {priority && <Star size={12} fill="#eab308" className="text-yellow-500" />}
            </div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-tight">{material.subject}</p>
         </div>
      </div>
      <div className="flex items-center gap-2">
        <a 
          href={material.url}
          download
          onClick={e => e.stopPropagation()}
          className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-primary transition-all active:scale-95"
          title="Download"
        >
          <Download size={14} />
        </a>
        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
           <Play size={14} />
        </div>
      </div>
    </motion.div>
  );
}

function MaterialViewer({ material, onClose, onComplete }: { material: Material, onClose: () => void, onComplete: () => void }) {
  const [loadError, setLoadError] = useState(false);
  const [completed, setCompleted] = useState(false);
  const isVideo = material.url.match(/\.(mp4|webm|ogg)$/i) || material.url.includes('youtube.com') || material.url.includes('youtu.be');
  const isPdf = material.url.match(/\.pdf$/i) || material.url.includes('?alt=media');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-2xl p-2 sm:p-4 md:p-8 flex items-center justify-center"
    >
       <button 
         onClick={onClose}
         className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-4 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all z-[210] hover:rotate-90"
       >
         <CloseIcon size={20} />
       </button>
       
       <div className="w-full max-w-6xl h-[90vh] sm:h-full flex flex-col bg-card border border-border rounded-3xl sm:rounded-[3rem] shadow-2xl overflow-hidden mt-8 sm:mt-0">
          <div className="p-4 sm:p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
             <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.5rem] bg-primary/10 text-primary flex items-center justify-center shadow-inner shrink-0">
                   {material.type === 'video' ? <Video size={24} /> : <BookIcon size={24} />}
                </div>
                <div className="min-w-0">
                   <h2 className="text-lg sm:text-2xl font-bold tracking-tight truncate">{material.title}</h2>
                   <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-0.5">{material.subject} • {material.type}</p>
                </div>
             </div>
             <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                <a 
                   href={material.url}
                   download
                   className="flex-1 md:flex-none justify-center px-4 sm:px-6 py-3 sm:py-4 bg-muted border border-border text-muted-foreground rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-border transition-all flex items-center gap-2"
                >
                  <Download size={14} />
                  Download
                </a>
                <a 
                  href={material.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none justify-center px-4 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                >
                  <ExternalLink size={14} />
                  Open Source
                </a>
             </div>
          </div>

          <div className="flex-1 bg-black/20 flex flex-col items-center justify-center relative group overflow-hidden p-4">
             {loadError ? (
               <div className="text-center p-6 sm:p-12 max-w-md bg-card border border-border rounded-3xl sm:rounded-[2.5rem] shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Display Restricted</h4>
                  <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                    Firebase Storage permissions (412) or browser safety settings are preventing direct embedding. Please open the file in a new tab for full access.
                  </p>
                  <a 
                    href={material.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest text-center"
                  >
                    Open in New Tab
                  </a>
               </div>
             ) : (
               <>
                 {isVideo ? (
                   <video 
                     controls 
                     className="w-full h-full max-h-[70vh] rounded-2xl shadow-2xl"
                     onError={() => setLoadError(true)}
                   >
                     <source src={material.url} />
                     Your browser does not support the video tag.
                   </video>
                 ) : (
                   <iframe 
                     src={material.url.includes('?alt=media') ? material.url : `https://docs.google.com/viewer?url=${encodeURIComponent(material.url)}&embedded=true`} 
                     className="w-full h-full border-none bg-white rounded-2xl shadow-inner"
                     onError={() => setLoadError(true)}
                     onLoad={(e) => {
                       // Simple check if iframe failed to load meaningful content
                       try {
                         const target = e.target as HTMLIFrameElement;
                         if (target.src === 'about:blank') setLoadError(true);
                       } catch (e) {}
                     }}
                   />
                 )}
               </>
             )}
          </div>

          <div className="p-4 sm:p-8 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
             <div className="flex items-center gap-6 sm:gap-8 justify-around sm:justify-start w-full sm:w-auto">
                <div className="flex flex-col">
                   <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Mentor</span>
                   <span className="text-xs sm:text-sm font-bold">Faculty Verified</span>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex flex-col">
                   <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Status</span>
                   <span className="text-xs sm:text-sm font-bold text-emerald-500 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Record
                   </span>
                </div>
             </div>
             <button 
               onClick={() => {
                 setCompleted(true);
                 setTimeout(() => {
                   onComplete();
                   onClose();
                 }, 1500);
               }}
               disabled={completed}
               className={cn(
                 "w-full sm:w-auto justify-center px-6 sm:px-10 py-3.5 sm:py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:shadow-xl active:scale-95 flex items-center gap-2",
                 completed ? "bg-emerald-500/20 text-emerald-500 scale-95" : "bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600"
               )}
             >
               {completed ? (
                 <>
                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                     <ShieldCheck size={18} />
                   </motion.div>
                   Progress Recorded
                 </>
               ) : 'Confirm Module Completion'}
             </button>
          </div>
          
          <AnimatePresence>
            {completed && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[250] flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm pointer-events-none"
              >
                 <motion.div 
                   initial={{ scale: 0.5 }}
                   animate={{ scale: [0.5, 1.2, 1] }}
                   className="bg-card border-2 md:border-4 border-emerald-500 p-6 sm:p-12 rounded-3xl sm:rounded-[4rem] shadow-2xl flex flex-col items-center space-y-4"
                 >
                    <div className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                       <Award size={48} />
                    </div>
                    <div className="text-center">
                       <h3 className="text-3xl font-black italic tracking-tighter">Unit Mastery!</h3>
                       <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1">Data node archived to profile</p>
                    </div>
                 </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
       </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function AchievementBadge({ label }: { label: string }) {
  return (
    <div className="px-6 py-4 rounded-2xl bg-background border-2 border-primary/20 flex items-center gap-3 shadow-sm transform hover:scale-105 transition-transform cursor-default">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
         <Award size={16} className="text-primary" />
      </div>
      <span className="font-bold text-sm">{label}</span>
    </div>
  );
}

function ProgressItem({ label, current, total, color }: { label: string, current: number, total: number, color: string }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CourseCard({ title, subject, type }: { title: string, subject: string, type: string }) {
  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-xl">
      <div className="h-40 bg-muted flex items-center justify-center relative">
         <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
           {subject}
         </div>
         {type === 'video' ? <Video className="w-12 h-12 opacity-20" /> : <BookIcon className="w-12 h-12 opacity-20" />}
      </div>
      <div className="p-6">
        <h4 className="font-bold mb-4 group-hover:text-primary transition-colors">{title}</h4>
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-widest">
           <span className="flex items-center gap-1">
             {type === 'video' ? <Video size={14} /> : <BookIcon size={14} />}
             {type}
           </span>
           <span className="hover:text-primary transition-colors">Learn More</span>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'video' | 'book' | 'pdf' | 'course'>('video');
  const [subject, setSubject] = useState<Subject>('physics');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadType, setUploadType] = useState<'link' | 'file'>('link');
  const progressRef = useRef(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 50MB for demo/preview stability)
    if (file.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit. Please use a link instead.");
      return;
    }

    setUploading(true);
    setProgress(0);
    progressRef.current = 0;
    
    // Safety check every 4 seconds
    let attempts = 0;
    const uploadInterval = setInterval(() => {
      attempts++;
      if (progressRef.current < 2 && attempts >= 3) {
        clearInterval(uploadInterval);
        alert("TRANSMISSION BLOCKED: Your network is preventing direct file transfers to our secure storage.\n\nSWITCHING TO LINK MODE: Please host your file on Google Drive/Dropbox and paste the link instead.");
        setUploading(false);
        setUploadType('link');
        setProgress(0);
      }
    }, 4000);
    
    try {
      const folder = type === 'video' ? 'videos' : 'materials';
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          const rounded = Math.round(p);
          setProgress(rounded);
          progressRef.current = rounded;
          if (rounded > 10) clearInterval(uploadInterval);
        }, 
        (error: any) => {
          clearInterval(uploadInterval);
          console.error("Upload error:", error);
          alert("Upload failed. We recommend using a direct link from Google Drive instead.");
          setUploading(false);
          setProgress(0);
        }, 
        async () => {
          clearInterval(uploadInterval);
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUrl(downloadURL);
          setUploading(false);
          setProgress(100);
        }
      );
    } catch (err) {
      clearInterval(uploadInterval);
      console.error("Setup error:", err);
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || (!url && type !== 'course')) {
      alert("Validation Error: All critical data fields must be populated.");
      return;
    }
    
    setLoading(true);
    console.log(`[ACTION] Create ${type}:`, { title, subject });
    try {
      if (type === 'course') {
        await dbService.createCourse({
          title,
          description,
          subject,
          materialIds: []
        });
      } else {
        await dbService.createMaterial({
          title,
          description,
          type: type as any,
          subject,
          url
        });
      }
      console.log(`[SUCCESS] Create ${type} complete`);
      onClose();
    } catch (err: any) {
      console.error(`[ERROR] Create ${type}:`, err);
      let msg = err.message;
      try {
        const errorData = JSON.parse(err.message);
        msg = `Error: ${errorData.error} (Operation: ${errorData.operationType} on ${errorData.path})`;
      } catch (e) {}
      alert(`Broadcast Interrupted: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 sm:p-6">
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="max-w-2xl w-full bg-card border border-border p-5 sm:p-10 rounded-3xl sm:rounded-[3rem] shadow-2xl space-y-6 sm:space-y-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar"
       >
          <div className="flex items-center justify-between">
             <div>
               <h2 className="text-xl sm:text-3xl font-black italic tracking-tight">Broadcast Resource</h2>
               <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium italic">Distribute new data to student nodes</p>
             </div>
             <div className="flex flex-col items-end">
                <ShieldCheck className="text-primary mb-1 shrink-0" size={20} />
                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-primary">Mentor Core</span>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
             <div className="flex bg-muted/30 p-1 rounded-2xl gap-0.5 sm:gap-1">
                {(['video', 'pdf', 'book', 'course'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex-1 py-2 sm:py-3 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all",
                      type === t ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {t}
                  </button>
                ))}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Research Field</label>
                  <div className="relative">
                    <select 
                      value={subject} 
                      onChange={e => setSubject(e.target.value as any)}
                      className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold text-sm"
                    >
                      <option value="physics">Physics</option>
                      <option value="chemistry">Chemistry</option>
                      <option value="biology">Biology</option>
                      <option value="computer">Computer Science</option>
                    </select>
                    <ChevronRight size={16} className="absolute right-5 top-5 rotate-90 pointer-events-none text-muted-foreground" />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Asset Status</label>
                  <div className="flex h-[56px] bg-muted/30 border border-border rounded-2xl px-5 items-center justify-between">
                     <span className="text-sm font-bold truncate pr-2">{type === 'course' ? 'Curriculum' : 'Standard Resource'}</span>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Verified</span>
                     </div>
                  </div>
               </div>
             </div>

             <div className="space-y-3">
                <div className="flex justify-between items-end ml-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Material Heading</label>
                   <span className={cn("text-[9px] font-bold", title.length > 40 ? "text-red-500" : "text-muted-foreground")}>{title.length}/50</span>
                </div>
                <input 
                  type="text" 
                  value={title} 
                  maxLength={50}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                  placeholder="e.g. Advanced Quantum Mechanics"
                />
             </div>

             <div className="space-y-3">
                <div className="flex justify-between items-end ml-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Abstract / Summary</label>
                   <span className={cn("text-[9px] font-bold", description.length > 450 ? "text-red-500" : "text-muted-foreground")}>{description.length}/500</span>
                </div>
                <textarea 
                  value={description} 
                  maxLength={500}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 h-32 font-medium text-sm leading-relaxed"
                  placeholder="Provide essential context for this unit..."
                />
             </div>

             {type !== 'course' && (
               <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source Protocol</label>
                    <div className="flex gap-4">
                       <button 
                         type="button" 
                         onClick={() => setUploadType('link')}
                         className={cn("text-[9px] font-black uppercase tracking-widest transition-colors", uploadType === 'link' ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                       >
                         URL Link
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setUploadType('file')}
                         className={cn("text-[9px] font-black uppercase tracking-widest transition-colors", uploadType === 'file' ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                       >
                         Local File
                       </button>
                    </div>
                  </div>

                  {uploadType === 'link' ? (
                    <div className="relative">
                      <input 
                        type="text" 
                        value={url} 
                        onChange={e => setUrl(e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20 font-mono text-xs tracking-tight"
                        placeholder="https://cloud.storage/path/to/asset"
                      />
                      <ExternalLink size={16} className="absolute right-5 top-5 text-muted-foreground opacity-50" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {url ? (
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                               {type === 'video' ? <Video size={18} /> : <BookIcon size={18} />}
                             </div>
                             <div>
                                <p className="text-xs font-bold truncate w-40">Asset Loaded Successfully</p>
                                <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">Storage Linked</p>
                             </div>
                           </div>
                           <button 
                             type="button" 
                             onClick={() => setUrl('')}
                             className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors"
                           >
                             Reset
                           </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-border rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                        >
                           <div className="w-16 h-16 rounded-[2rem] bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                              <Plus size={32} />
                           </div>
                           <div>
                              <p className="text-sm font-bold">Select Archive to Upload</p>
                              <p className="text-xs text-muted-foreground mt-1">Recommended: MP4, WebM, PDF (Max 50MB)</p>
                           </div>
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept={type === 'video' ? "video/*" : ".pdf,.doc,.docx"}
                      />

                      {uploading && (
                        <div className="p-6 bg-muted/20 border border-border rounded-3xl space-y-4">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                               Transmitting Data...
                            </span>
                            <span className="text-primary">{progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className="h-full bg-primary"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-[9px] text-muted-foreground ml-1 italic opacity-60">
                    * Protocol Notice: Using direct URLs to existing assets is often more efficient for large-scale distribution.
                  </p>
               </div>
             )}

             <div className="flex gap-4 pt-4 border-t border-border">
               <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-2xl transition-all"
               >
                 Abort Broadcast
               </button>
               <button 
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
                 {loading ? 'Transmitting...' : 'Initiate Broadcast'}
               </button>
             </div>
          </form>
       </motion.div>
    </div>
  );
}
