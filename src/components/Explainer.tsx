import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ImageIcon, Search, Loader2, Sparkles, AlertCircle, Camera, Upload, FileText, X, Download } from 'lucide-react';
import { aiService } from '../services/ai';
import Markdown from 'react-markdown';
import { toPng } from 'html-to-image';

export default function Explainer() {
  const [prompt, setPrompt] = useState('');
  const [fileData, setFileData] = useState<{ b64: string, mime: string, name: string } | null>(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
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
        link.download = `explanation-${Date.now()}.png`;
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

  const handleExplain = async () => {
    if ((!prompt.trim() && !fileData) || loading) return;
    setLoading(true);
    try {
      const result = await aiService.explainConcept(
        prompt || "Explain the educational concepts depicted here", 
        fileData?.b64, 
        fileData?.mime,
        "Answer with clear, structured text and include SVG or Mermaid diagram code if relevant. If you provide diagrams, wrap them in ```mermaid or ```svg blocks."
      );
      setExplanation(result);
    } catch (error: any) {
      console.error("Explainer Error:", error);
      if (error.message?.includes('401') || error.message?.includes('UNAUTHENTICATED')) {
        alert("Neural synchronization failed: Invalid Authentication. Ensure your Gemini API Key is configured in the platform settings.");
      } else {
        alert("Neural analyzer failed to process this material. Check document size or format.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="text-center">
         <div className="w-16 h-16 rounded-3xl bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto mb-6">
            <ImageIcon size={32} />
         </div>
         <h1 className="text-4xl font-bold mb-4 italic">Concept Explainer</h1>
         <p className="text-muted-foreground">Upload a diagram or photo of a concept, and AI will break it down with diagrams.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Input Pane */}
        <div className="space-y-6">
          <div 
            className="aspect-auto md:aspect-square bg-muted/50 border-4 border-dashed border-border rounded-3xl md:rounded-[3rem] flex flex-col items-center justify-center p-6 md:p-10 min-h-[300px] relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {fileData ? (
              fileData.mime === 'application/pdf' ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center shadow-2xl">
                    <FileText size={48} />
                  </div>
                  <p className="font-bold text-center max-w-[250px] truncate">{fileData.name}</p>
                </div>
              ) : (
                <img src={`data:${fileData.mime};base64,${fileData.b64}`} className="absolute inset-0 w-full h-full object-contain p-4" alt="Diagram" />
              )
            ) : (
              <>
                 <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform mb-6 shadow-xl">
                    <Camera size={32} />
                 </div>
                 <p className="font-bold text-lg mb-2">Drop Material Here</p>
                 <p className="text-sm text-muted-foreground">PDFs or Images supported</p>
              </>
            )}
            <input 
              type="file" 
              id="file-upload" 
              hidden 
              onChange={handleFileChange}
              accept="image/*,application/pdf"
            />
            {fileData && (
              <button 
                onClick={(e) => { e.stopPropagation(); setFileData(null); }}
                className="absolute top-6 right-6 p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all z-20 shadow-lg"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
             <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">Perspective (Optional)</label>
             <input 
               type="text"
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="e.g., Explain photosynthesis with a diagram" 
               className="w-full bg-muted border border-border rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 mb-6 font-medium"
             />
             <button
               onClick={handleExplain}
               disabled={(!prompt.trim() && !fileData) || loading}
               className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
             >
               {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
               <span>{loading ? 'Synthesizing Explanation...' : 'Explain Diagram'}</span>
             </button>
          </div>
        </div>

        {/* Output Pane */}
        <div className="relative flex flex-col group">
          <div 
            ref={outputRef}
            className="bg-card border border-border rounded-3xl md:rounded-[3rem] p-6 md:p-10 shadow-xl overflow-auto min-h-[400px] md:min-h-[500px]"
          >
             {explanation ? (
                <div className="markdown-body">
                   <Markdown>{explanation}</Markdown>
                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                   <Search size={48} className="mb-6 mx-auto" />
                   <p className="text-xl font-bold">Analysis Pending</p>
                   <p className="text-sm max-w-[200px] mx-auto mt-2">Upload an image and click explain to see magic here.</p>
                </div>
             )}
          </div>
          
          {explanation && !loading && (
            <button
              onClick={handleDownload}
              className="mt-4 sm:mt-0 sm:absolute sm:top-6 sm:right-6 w-full sm:w-auto p-4 bg-primary text-primary-foreground rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest z-10"
            >
              <Download size={16} />
              Download as Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
