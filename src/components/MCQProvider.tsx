import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileQuestion, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  RefreshCcw, 
  Loader2, 
  Sparkles, 
  BrainCircuit, 
  X, 
  Heart, 
  Lightbulb, 
  Lock, 
  Search, 
  FileText, 
  Image as ImageIcon,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { aiService } from '../services/ai';
import { cn } from '../lib/utils';

export default function MCQProvider() {
  const [inputText, setInputText] = useState('');
  const [fileData, setFileData] = useState<{ b64: string, mime: string, name: string } | null>(null);
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Synthesizing Test Parameters...');
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    let msgInterval: NodeJS.Timeout;
    if (loading) {
      const messages = [
        'Analyzing source material...',
          'Extracting semantic concepts...',
          'Formulating challenge vectors...',
          'Calibrating difficulty levels...',
          'Optimizing neural assessment...'
      ];
      let i = 0;
      setLoadingMessage(messages[0]);
      msgInterval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingMessage(messages[i]);
      }, 3000);
    }
    return () => clearInterval(msgInterval);
  }, [loading]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isExamMode, setIsExamMode] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(30);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mcqs.length > 0 && !showResults) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
        if (isExamMode) {
          setQuestionTimer(prev => prev - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mcqs.length, showResults, isExamMode, currentIdx]);

  useEffect(() => {
    if (isExamMode && questionTimer <= 0 && !showResults && mcqs.length > 0) {
      nextQuestion();
    }
  }, [questionTimer, isExamMode, showResults, mcqs.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = (reader.result as string).split(',')[1];
        setFileData({
          b64,
          mime: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const generate = async () => {
    if (!inputText.trim() && !fileData) return;
    setLoading(true);
    
    try {
      let result;
      if (fileData) {
        const prompt = inputText || "Generate comprehensive MCQs based on the provided material.";
        result = await aiService.generateMcqsFromImage(prompt, fileData.b64, fileData.mime);
      } else {
        result = await aiService.generateMcqs(inputText);
      }

      if (result && result.length > 0) {
        setMcqs(result);
        setUserAnswers({});
        setShowResults(false);
        setCurrentIdx(0);
        setTimer(0);
        setQuestionTimer(30);
      } else {
        alert("Synthesizer failed to extract enough distinct challenges. Please refine your material or try a different section.");
      }
    } catch (error: any) {
      console.error("MCQ Generation Error:", error);
      if (error.message?.includes('401') || error.message?.includes('UNAUTHENTICATED')) {
        alert("Neural synchronization failed: Invalid Authentication. Ensure your Gemini API Key is configured in the platform settings.");
      } else {
        alert("Neural synthesis interrupted. Check your network or the document size.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (oIdx: number) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [currentIdx]: oIdx }));
  };

  const nextQuestion = () => {
    if (currentIdx < mcqs.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowHint(false);
      setQuestionTimer(30);
    } else {
      setShowResults(true);
    }
  };

  const getScore = () => {
    return mcqs.reduce((acc, q, idx) => acc + (userAnswers[idx] === q.correctIndex ? 1 : 0), 0);
  };

  if (mcqs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 py-10 px-4">
        <header className="text-center">
           <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/5 ring-4 ring-indigo-500/5">
              <BrainCircuit size={40} />
           </div>
           <h1 className="text-5xl font-bold mb-4 italic tracking-tight text-foreground">MCQ Neural Lab</h1>
           <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">Intelligence-driven testing. Paste your materials to construct a custom-weighted knowledge synthesis.</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative">
            <div className="flex border-b border-border mb-8">
               <button 
                 onClick={() => setFileData(null)}
                 className={cn(
                   "px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2",
                   !fileData ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                 )}
               >
                 Text Analysis
               </button>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className={cn(
                   "px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2",
                   fileData ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                 )}
               >
                 {fileData ? (fileData.mime === 'application/pdf' ? 'PDF Loaded' : 'Image Loaded') : 'Upload Image/PDF'}
                 <Upload size={14} />
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileChange} 
                 hidden 
                 accept="image/*,application/pdf"
               />
            </div>

            {fileData ? (
              <div className="mb-8 p-4 bg-muted/30 border-2 border-dashed border-border rounded-3xl text-center relative group min-h-[300px] flex flex-col items-center justify-center">
                 {fileData.mime === 'application/pdf' ? (
                   <div className="flex flex-col items-center gap-4">
                     <div className="w-20 h-20 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shadow-lg">
                       <FileText size={40} />
                     </div>
                     <span className="font-bold text-sm max-w-[200px] truncate">{fileData.name}</span>
                   </div>
                 ) : (
                   <img src={`data:${fileData.mime};base64,${fileData.b64}`} className="max-h-[300px] object-contain rounded-xl shadow-lg mb-4" alt="Uploaded material" />
                 )}
                 <button 
                   onClick={() => setFileData(null)}
                   className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                 >
                   <X size={16} />
                 </button>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-4">
                   {fileData.mime === 'application/pdf' ? 'Document' : 'Image'} ready for intelligence extraction
                 </p>
              </div>
            ) : (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste lecture notes, textbook excerpts, or research summaries. Our AI will extract key concepts and formulate challenges."
                className="w-full h-64 bg-muted/30 border-2 border-border rounded-3xl p-8 focus:outline-none focus:border-primary/30 mb-8 whitespace-pre-wrap font-medium placeholder:opacity-40 transition-all shadow-inner"
              />
            )}

            <div className="flex items-center gap-4 mb-8">
               <button 
                 onClick={() => setIsExamMode(!isExamMode)}
                 className={cn(
                   "flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-between group",
                   isExamMode ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-muted/10 border-border text-muted-foreground"
                 )}
               >
                 <div className="flex items-center gap-3 text-left">
                   <Clock size={20} className={cn(isExamMode ? "animate-pulse" : "")} />
                   <div>
                     <p className="font-bold text-sm">Exam Mode</p>
                     <p className="text-[10px] uppercase font-black opacity-60">Timed questions • No hints</p>
                   </div>
                 </div>
                 <div className={cn(
                   "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                   isExamMode ? "border-red-500 bg-red-500" : "border-muted"
                 )}>
                   {isExamMode && <div className="w-2 h-2 rounded-full bg-white" />}
                 </div>
               </button>

               <div className="flex-1 p-4 rounded-2xl border-2 bg-indigo-500/10 border-indigo-500/30 text-indigo-500 flex items-center gap-3">
                  <Heart size={20} />
                  <div>
                    <p className="font-bold text-sm">Intel Boost</p>
                    <p className="text-[10px] uppercase font-black opacity-60">AI explanations active</p>
                  </div>
               </div>
            </div>
            
            <button
              onClick={generate}
              disabled={loading || (!inputText.trim() && !fileData)}
              className="w-full py-6 bg-primary text-primary-foreground rounded-[2rem] font-bold text-lg flex items-center justify-center gap-4 hover:shadow-2xl shadow-primary/30 transition-all disabled:opacity-50 group"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />}
              <span>{loading ? loadingMessage : 'Engineer Intelligence Check'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = mcqs[currentIdx];
  const progress = ((currentIdx + 1) / mcqs.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-muted/20 dark:bg-[#0a0a0a] transition-colors font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white dark:bg-[#121212] rounded-[2.5rem] shadow-[0_20px_80px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_80px_-15px_rgba(0,0,0,0.6)] overflow-hidden relative border border-border/10"
      >
        {/* Header Navigation */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-border/5">
           <button 
             onClick={() => setMcqs([])}
             className="flex items-center gap-2 px-5 py-3 hover:bg-muted rounded-2xl text-muted-foreground/60 hover:text-foreground transition-all font-black text-[10px] uppercase tracking-[0.2em] border border-border/40"
           >
             <X size={14} strokeWidth={3} />
             <span>Exit</span>
           </button>
           
           <div className="absolute left-1/2 -translate-x-1/2 text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
             Attempt {formatTime(timer)}
           </div>

           <div className="flex items-center gap-2 text-red-500 font-black bg-red-500/5 px-4 py-2 rounded-2xl border border-red-500/10">
             <Heart size={16} fill="currentColor" strokeWidth={3} />
             <span className="text-base">∞</span>
           </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 mt-6">
          <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all duration-700"
            />
          </div>
        </div>

        <div className="px-8 md:px-20 py-12 md:py-16 space-y-10">
          {/* Exam Mode Timer UI */}
          {isExamMode && !showResults && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="space-y-4 mb-8"
            >
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500",
                    questionTimer <= 5 ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-red-500/10 text-red-500"
                  )}>
                    <Clock size={24} className={cn(questionTimer <= 10 ? "animate-spin" : "animate-pulse")} style={{ animationDuration: questionTimer <= 5 ? '1s' : '2s' }} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-500/60 leading-none mb-1">Strict Countdown</h3>
                    <p className="text-sm font-black italic uppercase text-foreground leading-none">Automated Sync Sequence</p>
                  </div>
                </div>
                <div className={cn(
                  "text-4xl font-black italic tabular-nums tracking-tighter transition-all duration-300",
                  questionTimer <= 5 ? "text-red-500 scale-125" : "text-foreground/80"
                )}>
                  {Math.max(0, questionTimer)}s
                </div>
              </div>
              <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden border border-border/50 shadow-inner">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: `${Math.max(0, (questionTimer / 30) * 100)}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                  className={cn(
                    "h-full shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-colors duration-500",
                    questionTimer <= 5 ? "bg-red-500" : "bg-red-400"
                  )}
                />
              </div>
            </motion.div>
          )}

          {/* Question Text */}
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-[800] leading-tight tracking-tight text-foreground/90">
              {currentQ.question}
            </h2>
            
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Targeting concept:</span>
              <div className="flex gap-3">
                <span className="px-4 py-1.5 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 font-extrabold rounded-lg text-[9px] border border-yellow-400/20 uppercase tracking-widest">
                  Neural Mapping
                </span>
                <div className="flex items-center gap-1.5 text-muted-foreground/40 text-[9px] font-bold uppercase tracking-widest">
                  <FileText size={12} strokeWidth={2.5} />
                  <span>Pages 12-14</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hint Area */}
          {!isExamMode && (
            <div className="space-y-2">
              <button 
                onClick={() => setShowHint(!showHint)}
                className="w-full p-4 bg-yellow-400/5 border border-yellow-400/10 rounded-2xl flex items-center justify-between text-yellow-600/60 dark:text-yellow-400/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Lightbulb size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                  <span className="font-extrabold text-xs tracking-tight">Reveal Hint {showHint ? '(1/1)' : '(0/1)'}</span>
                </div>
                <Lock size={16} strokeWidth={2.5} className={cn("transition-all", showHint ? 'rotate-12 scale-0 opacity-0' : 'opacity-100')} />
              </button>
              <AnimatePresence>
                {showHint && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="p-5 bg-muted/10 border border-border/40 rounded-2xl text-[13px] italic font-medium text-foreground/60 leading-relaxed">
                      Focus on interpreting the specific constraints and relationships highlighted in your source material.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {isExamMode && (
            <div className="w-full p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-4 text-red-500/40">
              <ShieldCheck size={20} strokeWidth={2.5} />
              <span className="font-black tracking-widest uppercase text-[10px]">Strict exam protocol • indicators disabled</span>
            </div>
          )}

          {/* Options Grid */}
          <div className="space-y-4">
             {currentQ.options.map((opt: string, oIdx: number) => {
               const isSelected = userAnswers[currentIdx] === oIdx;
               return (
                 <button
                   key={oIdx}
                   onClick={() => handleSelect(oIdx)}
                   className={cn(
                     "w-full p-5 md:p-6 rounded-2xl border-2 flex items-center gap-6 transition-all group text-left relative",
                     isSelected 
                      ? "border-primary/30 bg-primary/5 dark:bg-primary/10 shadow-sm" 
                      : "border-muted dark:border-border/10 hover:border-border/30 bg-transparent"
                   )}
                 >
                   <div className={cn(
                     "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                     isSelected ? "border-primary bg-primary/10" : "border-muted group-hover:border-primary/20"
                   )}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                   </div>
                   
                   <div className="flex items-center gap-5">
                     <span className="text-[13px] font-black text-muted-foreground/20 italic">{oIdx + 1}</span>
                     <span className="text-[17px] font-bold tracking-tight text-foreground/80 leading-snug">{opt}</span>
                   </div>
                 </button>
               );
             })}
          </div>

          {/* Footer Controls */}
          <div className="pt-10 flex justify-between items-center border-t border-border/5">
            <div className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.4em]">
               CHALLENGE {currentIdx + 1} // {mcqs.length}
            </div>
            <button
               onClick={nextQuestion}
               disabled={userAnswers[currentIdx] === undefined}
               className="px-12 py-5 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-10 disabled:grayscale shadow-xl shadow-primary/10"
            >
              {currentIdx === mcqs.length - 1 ? 'Complete Assessment' : 'Proceed Forward'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results Modal/Overlay */}
      <AnimatePresence>
        {showResults && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex items-center justify-center p-6"
           >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="max-w-2xl w-full bg-card border border-border p-6 sm:p-12 rounded-3xl sm:rounded-[4rem] text-center shadow-4xl relative overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-20" />
                
                <div className="relative">
                  <div className="w-24 h-24 bg-primary text-primary-foreground rounded-[2rem] flex items-center justify-center text-4xl font-black mx-auto mb-8 shadow-2xl shadow-primary/30">
                    {Math.round((getScore()/mcqs.length) * 100)}%
                  </div>
                  <h2 className="text-4xl font-bold mb-4 italic tracking-tight">{isExamMode ? 'Official Score Verification' : 'Neural Checkpoint Complete'}</h2>
                  <p className="text-muted-foreground mb-10 text-lg">
                    {isExamMode 
                      ? `Final Exam Score: ${getScore()} / ${mcqs.length}. Total Time: ${formatTime(timer)}.` 
                      : `You achieved ${getScore()} out of ${mcqs.length} correct inferences.`}
                  </p>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => { setMcqs([]); setShowResults(false); setInputText(''); }}
                      className="flex-1 py-5 bg-muted rounded-2xl font-bold border border-border hover:bg-muted/80 transition-all uppercase tracking-widest text-xs"
                    >
                      Try New Topic
                    </button>
                    <button 
                      onClick={() => { setShowResults(false); setCurrentIdx(0); setUserAnswers({}); setTimer(0); }}
                      className="flex-1 py-5 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all uppercase tracking-widest text-xs"
                    >
                      Retry Challenge
                    </button>
                  </div>
                </div>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
