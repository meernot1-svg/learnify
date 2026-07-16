import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileCheck, Upload, Loader2, Sparkles, AlertCircle, FileText, History, Trophy, Image as ImageIcon, X, Download } from 'lucide-react';
import { aiService } from '../services/ai';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { toPng } from 'html-to-image';

export default function PaperPredictor() {
  const [content, setContent] = useState('');
  const [fileData, setFileData] = useState<{ b64: string, mime: string, name: string } | null>(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (outputRef.current) {
      try {
        const dataUrl = await toPng(outputRef.current, {
          backgroundColor: '#0a0a0a',
          width: 1000,
          style: {
            padding: '60px',
            borderRadius: '40px',
            width: '1000px',
            margin: '0',
            color: '#fff'
          },
          pixelRatio: 2
        });
        const link = document.createElement('a');
        link.download = `prediction-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Download failed', err);
      }
    }
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

  const handlePredict = async () => {
    if (!content.trim() && !fileData) return;
    setLoading(true);

    try {
      let result;
      if (fileData) {
        result = await aiService.predictPaperFromImage(content || "Predict exam questions from this past paper", fileData.b64, fileData.mime);
      } else {
        result = await aiService.predictPaper(content);
      }

      setPrediction(result);
    } catch (error: any) {
      console.error("Prediction Error:", error);
      if (error.message?.includes('401') || error.message?.includes('UNAUTHENTICATED')) {
        alert("Neural synchronization failed: Invalid Authentication. Ensure your Gemini API Key is configured in the platform settings.");
      } else {
        alert("Neural predictor could not synthesize a pattern. Try reducing the input or checking the file quality.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header className="text-center">
         <div className="w-16 h-16 rounded-3xl bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-6">
            <FileCheck size={32} />
         </div>
         <h1 className="text-4xl font-bold mb-4 italic tracking-tight">Paper Pattern Predictor</h1>
         <p className="text-muted-foreground">Upload or paste past paper questions to discover high-yield topics for your next session.</p>
      </header>

      <div className="bg-card border border-border rounded-[2.5rem] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
         {/* Input */}
          <div className="p-10 border-b md:border-b-0 md:border-r border-border bg-muted/20">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                   <History size={14} />
                   <span>Past Paper Data</span>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  {fileData ? 'Change Material' : 'Upload Material'}
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
               <div className="mb-8 p-4 bg-background border-2 border-dashed border-border rounded-2xl text-center relative group aspect-square flex flex-col items-center justify-center">
                  {fileData.mime === 'application/pdf' ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shadow-lg">
                        <FileText size={40} />
                      </div>
                      <span className="font-bold text-xs max-w-[150px] truncate">{fileData.name}</span>
                    </div>
                  ) : (
                    <img src={`data:${fileData.mime};base64,${fileData.b64}`} className="max-h-full object-contain rounded-lg shadow-sm mb-4" alt="Paper source" />
                  )}
                  <button 
                    onClick={() => setFileData(null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg"
                  >
                    <X size={14} />
                  </button>
               </div>
             ) : (
               <textarea
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 placeholder="Paste text from past papers here (e.g., questions from 2023, 2022 exams)..."
                 className="w-full h-80 bg-background border border-border rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-primary/20 mb-8 font-medium resize-none shadow-inner"
               />
             )}
             
             <button
              onClick={handlePredict}
              disabled={(!content.trim() && !fileData) || loading}
              className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              <span>{loading ? 'Analyzing Patterns...' : 'Generate Prediction'}</span>
            </button>
         </div>

         {/* Output */}
         <div className="p-10 flex flex-col bg-card relative group">
            <div className="flex items-center gap-2 mb-6 text-green-500 font-bold uppercase tracking-widest text-xs">
               <Trophy size={14} />
               <span>Predicted Topics</span>
            </div>
            <div className="flex-1 overflow-auto">
               {prediction ? (
                 <div ref={outputRef} className="markdown-body p-4 bg-muted/10 rounded-2xl border border-border/50">
                    <Markdown>{prediction}</Markdown>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-30 mt-10">
                    <FileText size={48} className="mb-6" />
                    <p className="font-bold text-lg">Waiting for Input</p>
                    <p className="max-w-[180px] text-sm">Provide past paper details to see intelligent pattern analysis.</p>
                 </div>
               )}
            </div>

            {prediction && !loading && (
              <button
                onClick={handleDownload}
                className="absolute top-6 right-10 p-3 bg-primary text-primary-foreground rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest z-10"
              >
                <Download size={14} />
                Download Image
              </button>
            )}
         </div>
      </div>

      <div className="flex p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl gap-4">
         <AlertCircle className="text-blue-500 shrink-0" />
         <div>
            <p className="font-bold text-sm text-blue-900 dark:text-blue-300">Disclaimer</p>
            <p className="text-xs text-blue-800/70 dark:text-blue-400/70 leading-relaxed">AI predictions are based on statistical analysis of provided patterns. This should be used as a supplementary guide, not as a replacement for full syllabus coverage.</p>
         </div>
      </div>
    </div>
  );
}
