import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { elements, ElementData } from '../lib/elementData';
import { X, Info, Beaker, Thermometer, Layers, Box } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PeriodicTable({ onAddElement }: { onAddElement?: (element: ElementData, quantity: number) => void }) {
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(null);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(10);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Base dimensions of the table grid
        const baseWidth = 1100;
        const baseHeight = 550;
        
        const scaleW = (width - 40) / baseWidth;
        const scaleH = (height - 40) / baseHeight;
        
        setScale(Math.min(scaleW, scaleH, 1.2));
      }
    };

    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    updateScale();
    
    return () => observer.disconnect();
  }, []);

  const getCategoryColor = (category: string) => {
    const map: Record<string, string> = {
      "diatomic nonmetal": "bg-emerald-500",
      "noble gas": "bg-cyan-500",
      "alkali metal": "bg-rose-500",
      "alkaline earth metal": "bg-amber-500",
      "metalloid": "bg-yellow-500",
      "polyatomic nonmetal": "bg-teal-500",
      "post-transition metal": "bg-indigo-500",
      "transition metal": "bg-blue-500",
      "lanthanide": "bg-pink-500",
      "actinide": "bg-purple-500",
    };
    return map[category] || "bg-slate-500";
  };

  const getElementAt = (row: number, col: number) => {
    return elements.find(e => e.period === row && e.group === col);
  };

  const renderGrid = (startRow: number, endRow: number) => {
    const grid = [];
    for (let r = startRow; r <= endRow; r++) {
      for (let c = 1; c <= 18; c++) {
        const element = getElementAt(r, c);
        const isMuted = activePhase && element && element.phase !== activePhase;

        grid.push(
          <div key={`${r}-${c}`} className="aspect-square p-px">
            {element ? (
              <motion.button
                whileHover={{ scale: 1.25, zIndex: 20 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedElement(element);
                  setQuantity(10);
                }}
                onMouseEnter={() => setHoveredElement(element)}
                onMouseLeave={() => setHoveredElement(null)}
                className={cn(
                  "w-full h-full rounded-md border border-white/10 flex flex-col items-center justify-center relative overflow-hidden transition-all shadow-lg backdrop-blur-sm",
                  getCategoryColor(element.category),
                  "bg-opacity-20 hover:bg-opacity-60",
                  isMuted && "opacity-20 grayscale"
                )}
              >
                <div className="absolute top-0.5 left-0.5 flex flex-col items-start gap-0">
                  <span className="text-[5px] lg:text-[6px] opacity-60 font-black leading-none">{element.number}</span>
                </div>
                <span className="text-[10px] lg:text-xs font-black tracking-tighter drop-shadow-md leading-none mb-0.5">{element.symbol}</span>
                <span className="text-[4px] lg:text-[5px] font-bold opacity-50 truncate w-full px-0.5 uppercase tracking-tighter leading-none">{element.name}</span>
                
                {/* Visual indicator for category */}
                <div className={cn("absolute bottom-0 inset-x-0 h-0.5 opacity-40", getCategoryColor(element.category))} />
              </motion.button>
            ) : (
              <div className="w-full h-full rounded-md border border-white/5 bg-white/2 opacity-5" />
            )}
          </div>
        );
      }
    }
    return grid;
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
         <div>
            <h2 className="text-4xl font-black italic tracking-tighter text-primary leading-none">Inter_Table</h2>
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.4em] font-black opacity-40 mt-2">Atomic Data Engine v1.0</p>
         </div>
         
         <div className="flex gap-1.5 p-1 bg-muted/20 border border-border rounded-xl">
            {["Solid", "Liquid", "Gas"].map(phase => (
               <button 
                  key={phase}
                  onClick={() => setActivePhase(activePhase === phase ? null : phase)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    activePhase === phase ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted/50"
                  )}
               >
                  {phase}
               </button>
            ))}
         </div>
      </div>

      <div ref={containerRef} className="relative flex-1 bg-card/50 border border-border/50 rounded-[3rem] p-2 lg:p-4 shadow-inner overflow-hidden backdrop-blur-xl flex flex-col items-center justify-center">
         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
         
          <div 
             className="flex flex-col gap-1 lg:gap-2 p-2 origin-center transition-all shrink-0"
             style={{ 
               width: '1100px', 
               height: '520px',
               transform: `scale(${scale})`
             }}
          >
             <div className="grid grid-cols-[repeat(18,1fr)] gap-1">
                {renderGrid(1, 7)}
             </div>

             {/* Gap for spacing */}
             <div className="h-4 border-b border-dashed border-border/30 mx-10" />

             {/* Lanthanides / Actinides */}
             <div className="grid grid-cols-[repeat(18,1fr)] gap-1 pl-[11.11%]">
                {renderGrid(8, 9)}
             </div>
          </div>

         {/* Selection Overlay / Modal */}
         <AnimatePresence>
            {selectedElement && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-12 z-[350]"
                >
                   <motion.div 
                     initial={{ scale: 0.9, y: 20 }}
                     animate={{ scale: 1, y: 0 }}
                     className="bg-card border-2 border-border w-full max-w-4xl rounded-2xl sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible"
                   >
                     <button 
                       onClick={() => setSelectedElement(null)}
                       className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-muted hover:bg-muted/80 transition-all z-10"
                     >
                       <X size={20} />
                     </button>

                     {/* Left: Element Large Identity */}
                     <div className={cn("w-full md:w-80 p-6 sm:p-12 flex flex-col items-center justify-center text-white text-center gap-6 shrink-0", getCategoryColor(selectedElement.category))}>
                        <div className="relative mt-4 md:mt-0">
                           <motion.div 
                             animate={{ rotate: [0, 360] }}
                             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                             className="absolute inset-x-[-30px] inset-y-[-30px] sm:inset-x-[-40px] sm:inset-y-[-40px] rounded-full border-2 border-dashed border-white/20"
                           />
                           <h3 className="text-6xl sm:text-8xl font-black tracking-tighter drop-shadow-2xl">{selectedElement.symbol}</h3>
                        </div>
                        <div>
                           <p className="text-2xl sm:text-4xl font-bold italic tracking-tight">{selectedElement.name}</p>
                           <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-60 mt-2">{selectedElement.category}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full mt-4">
                           <div className="bg-black/20 p-3 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-sm">
                              <p className="text-[10px] font-black uppercase opacity-60">Number</p>
                              <p className="text-lg sm:text-xl font-bold">{selectedElement.number}</p>
                           </div>
                           <div className="bg-black/20 p-3 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-sm">
                              <p className="text-[10px] font-black uppercase opacity-60">Mass</p>
                              <p className="text-lg sm:text-xl font-bold">{selectedElement.atomic_mass}</p>
                           </div>
                        </div>
                     </div>

                     {/* Right: Details */}
                     <div className="flex-1 p-6 sm:p-12 overflow-y-auto max-h-[500px] md:max-h-[600px] custom-scrollbar">
                        <section className="mb-10 text-left">
                           <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                              <Info size={14} />
                              <span>Overview</span>
                           </h4>
                           <p className="leading-relaxed font-medium text-muted-foreground">{selectedElement.summary}</p>
                        </section>

                        <div className="grid grid-cols-2 gap-8 mb-10">
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Shell Info</h4>
                              <div className="flex items-center gap-3">
                                 <Layers className="text-primary" size={20} />
                                 <p className="font-bold">{selectedElement.electron_configuration}</p>
                              </div>
                              {/* Simple Shell Visualization */}
                              <div className="mt-4 flex items-center justify-center p-4 bg-muted/20 rounded-3xl h-24 relative overflow-hidden">
                                {Array.from({ length: Math.min(Math.ceil(selectedElement.number / 8) + 1, 4) }).map((_, i) => (
                                   <div 
                                     key={i}
                                     className="absolute border border-primary/20 rounded-full"
                                     style={{ 
                                       width: `${(i + 1) * 30}px`, 
                                       height: `${(i + 1) * 30}px` 
                                     }}
                                   />
                                 ))}
                                 <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                              </div>
                           </div>
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Physical State</h4>
                              <div className="flex items-center gap-3">
                                 <Box className="text-primary" size={20} />
                                 <p className="font-bold">{selectedElement.phase}</p>
                              </div>
                           </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="mb-10 p-6 bg-muted/20 border border-border rounded-3xl text-left">
                           <div className="flex items-center justify-between mb-4">
                              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Quantity</h4>
                              <span className="text-sm font-black text-primary">{quantity} {selectedElement.phase === 'Gas' ? 'L' : selectedElement.phase === 'Liquid' ? 'ml' : 'g'}</span>
                           </div>
                           <input 
                              type="range"
                              min="1"
                              max="100"
                              value={quantity}
                              onChange={(e) => setQuantity(parseInt(e.target.value))}
                              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                           />
                           <div className="flex justify-between mt-2 px-1 text-[8px] font-bold opacity-30">
                              <span>Trace</span>
                              <span>Moderate</span>
                              <span>Saturation</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/40 rounded-3xl border border-border">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                 <Thermometer size={18} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase opacity-40">Melting Point</p>
                                 <p className="font-bold">{selectedElement.melting_point || 'N/A'} K</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                                 <Thermometer size={18} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase opacity-40">Boiling Point</p>
                                 <p className="font-bold">{selectedElement.boiling_point || 'N/A'} K</p>
                              </div>
                           </div>
                        </div>

                        <button 
                          onClick={() => {
                            if (onAddElement && selectedElement) {
                              onAddElement(selectedElement, quantity);
                              setSelectedElement(null);
                            }
                          }}
                          className="w-full mt-10 py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-primary/20"
                        >
                           <Beaker size={20} />
                           <span>Add to Lab Session</span>
                        </button>
                     </div>
                   </motion.div>
                </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Quick Hover Bar */}
      <div className="min-h-20 bg-muted/20 border border-border rounded-[2rem] flex items-center px-6 lg:px-8 gap-4 lg:gap-8 overflow-hidden pointer-events-none flex-wrap py-4">
         {hoveredElement ? (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-center gap-4 lg:gap-6 flex-wrap"
            >
               <span className="text-2xl lg:text-4xl font-black text-primary opacity-40">{hoveredElement.number}</span>
               <div className="h-8 w-px bg-border hidden sm:block" />
               <div>
                  <p className="text-lg lg:text-xl font-bold">{hoveredElement.name}</p>
                  <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest opacity-40">{hoveredElement.category}</p>
               </div>
               <div className="ml-auto hidden xl:block italic text-sm text-muted-foreground max-w-md truncate">
                  {hoveredElement.summary}
               </div>
            </motion.div>
         ) : (
            <p className="text-muted-foreground font-medium opacity-40 italic text-xs lg:text-sm">Hover over an element to explore its atomic fingerprint.</p>
         )}
      </div>
    </div>
  );
}
