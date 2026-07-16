import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Book as BookIcon, Terminal, FlaskConical, Binary, Atom, Dna, Beaker, ChevronRight, PlayCircle, Download } from 'lucide-react';
import { dbService } from '../services/db';
import { Material, Subject } from '../types';
import PythonIDE from './PythonIDE';
import VirtualLab from './VirtualLab';

export default function SubjectView() {
  const { id } = useParams<{ id: string }>();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'tool'>('content');

  useEffect(() => {
    if (id) {
       dbService.getMaterials(id as Subject).then(setMaterials);
    }
  }, [id]);

  const subjectMeta = {
    computer: { label: 'Computer Science', icon: Binary, color: 'text-blue-500', toolLabel: 'Python Mini IDE' },
    physics: { label: 'Physics', icon: Atom, color: 'text-purple-500', toolLabel: 'Formula Sandbox' },
    biology: { label: 'Biology', icon: Dna, color: 'text-green-500', toolLabel: 'Specimen Lab' },
    chemistry: { label: 'Chemistry', icon: Beaker, color: 'text-orange-500', toolLabel: 'Virtual Lab' }
  }[id as keyof typeof subjectMeta || 'computer'];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 rounded-2xl bg-card border border-border shadow-sm">
                <subjectMeta.icon className={subjectMeta.color} size={32} />
             </div>
             <h1 className="text-4xl font-bold tracking-tight">{subjectMeta.label}</h1>
          </div>
          <p className="text-muted-foreground max-w-xl">
             Explore high-quality resources, video lectures, and hands-on interactive tools curated for {subjectMeta.label}.
          </p>
        </div>

        <div className="flex bg-muted p-1 rounded-2xl overflow-hidden self-start md:self-auto">
          <button 
             onClick={() => setActiveTab('content')}
             className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'content' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Learning Materials
          </button>
          <button 
             onClick={() => setActiveTab('tool')}
             className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'tool' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {subjectMeta.toolLabel}
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'content' ? (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {materials.length > 0 ? (
              materials.map(m => <MaterialCard key={m.id} material={m} />)
            ) : (
                <div className="col-span-full space-y-10">
                   <div className="py-20 text-center bg-card border border-border rounded-[3rem] shadow-sm">
                      <p className="text-muted-foreground mb-4">No content from mentors yet. Here are some high-yield topics curated for you:</p>
                      <h3 className="text-2xl font-bold italic text-primary">Core Curriculum</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {id === 'physics' && (
                        <>
                          <StaticTopicCard title="Newtonian Mechanics" description="Forces, motion, and energy conservation. Includes vector diagrams and free-body analysis." icon={<Atom />} />
                          <StaticTopicCard title="Electromagnetism" description="Electric fields, circuits, and magnetic induction. View diagrammatic representations of Lorentz force." icon={<Atom />} />
                        </>
                      )}
                      {id === 'biology' && (
                        <>
                          <StaticTopicCard title="Cellular Architecture" description="Organelle functions and protein synthesis. Detailed diagrams of mitochondria and ribosomes." icon={<Dna />} />
                          <StaticTopicCard title="Genetics & DNA" description="Heredity patterns, Mendel's laws, and DNA replication stages." icon={<Dna />} />
                        </>
                      )}
                      {id === 'chemistry' && (
                        <>
                          <StaticTopicCard title="Periodic Architecture" description="Atomic structure and chemical bonding types. Lewis dot diagrams explained." icon={<Beaker />} />
                          <StaticTopicCard title="Organic Synthesis" description="Hydrocarbon structures and functional groups identification." icon={<Beaker />} />
                        </>
                      )}
                      {id === 'computer' && (
                        <>
                          <StaticTopicCard title="Algorithm Design" description="Flowcharts and pseudocode strategies for problem solving." icon={<Binary />} />
                          <StaticTopicCard title="Object Oriented Programming" description="Classes, inheritance, and encapsulation diagrams." icon={<Binary />} />
                        </>
                      )}
                   </div>
                </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="tool"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            {id === 'computer' && <PythonIDE />}
            {id === 'chemistry' && <VirtualLab initialSubject="chemistry" hideSwitcher />}
            {id === 'physics' && <VirtualLab initialSubject="physics" hideSwitcher />}
            {id === 'biology' && <VirtualLab initialSubject="biology" hideSwitcher />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MaterialCard({ material }: { material: Material }) {
  const handleOpen = () => {
    if (material.url) {
      window.open(material.url, '_blank');
    }
  };

  return (
    <div 
      onClick={handleOpen}
      className="group bg-card border border-border rounded-2xl p-6 hover:border-primary hover:shadow-xl transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`p-3 rounded-xl ${
          material.type === 'video' ? 'bg-blue-500/10 text-blue-500' : 
          material.type === 'pdf' ? 'bg-red-500/10 text-red-500' :
          'bg-orange-500/10 text-orange-500'
        }`}>
           {material.type === 'video' ? <Video size={24} /> : <BookIcon size={24} />}
        </div>
        <div className="p-2 rounded-lg hover:bg-muted transition-colors">
          {material.type === 'video' ? <PlayCircle size={20} /> : <Download size={20} />}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{material.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed">{material.description}</p>
      <div className="flex items-center justify-between pt-6 border-t border-border">
         <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
           Shared on {material.createdAt ? new Date(material.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
         </span>
         <ChevronRight size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

function StaticTopicCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="p-8 bg-card border border-border rounded-3xl group hover:border-primary/50 transition-all shadow-sm">
       <div className="mb-6 w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
       </div>
       <h3 className="text-xl font-bold mb-3">{title}</h3>
       <p className="text-muted-foreground leading-relaxed text-sm mb-6">{description}</p>
       <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:gap-3 transition-all">
          <span>Explore Module</span>
          <ChevronRight size={14} />
       </button>
    </div>
  );
}
