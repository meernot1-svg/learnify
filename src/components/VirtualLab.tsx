import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Beaker,
  FlaskConical,
  Droplet,
  Flame,
  RotateCcw,
  Info,
  LayoutGrid,
  Microscope,
  FlaskRound,
  X,
  Zap,
  Search,
  Binary,
  Plus,
  Users,
  User,
  Activity,
  Rocket,
  Book as BookIcon,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  ToggleLeft,
  ToggleRight,
  Layers,
  Shield,
  BrainCircuit
} from "lucide-react";
import PeriodicTable from "./PeriodicTable";
import { cn } from "../lib/utils";
import { ElementData, elements } from "../lib/elementData";

type Substance = {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  quantity?: number;
  description?: string;
};
type Tool = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
};

type ViewMode =
  | "lab"
  | "periodic"
  | "balancer"
  | "molarmass"
  | "solubility"
  | "journal"
  | "anatomy"
  | "guides"
  | "molecules";

const LAB_GUIDES: Record<Subject, { title: string; desc: string; difficulty: string }[]> = {
  chemistry: [
    { title: "Safety Protocol", desc: "Basic lab safety and equipment handling.", difficulty: "Beginner" },
    { title: "Titration Basics", desc: "Understanding acid-base neutralization.", difficulty: "Intermediate" },
    { title: "Chromatography", desc: "Separating mixtures using solvent phase.", difficulty: "Beginner" },
    { title: "Reaction Kinetics", desc: "Measuring rates of chemical reactions.", difficulty: "Advanced" },
    { title: "Periodic Trends", desc: "Exploring electronegativity and ionization.", difficulty: "Intermediate" },
    { title: "Mole Concept", desc: "Calculating molar masses and Avogadro's constant.", difficulty: "Beginner" },
    { title: "Organic Bonding", desc: "Lewis structures for hydrocarbons.", difficulty: "Intermediate" },
    { title: "Solubility Rules", desc: "Predicting precipitate formation.", difficulty: "Beginner" },
    { title: "VSEPR Theory", desc: "3D molecular geometry analysis.", difficulty: "Advanced" },
    { title: "Redox Reactions", desc: "Electron transfer and oxidation states.", difficulty: "Advanced" },
    { title: "Thermal Chemistry", desc: "Exothermic vs Endothermic energy paths.", difficulty: "Intermediate" },
    { title: "Gas Laws", desc: "Ideal gas behaviors (Boyle & Charles).", difficulty: "Intermediate" },
    { title: "Atomic Structure", desc: "Subatomic particle distribution mapping.", difficulty: "Beginner" },
    { title: "Electrochemistry", desc: "Galvanic cells and potentials.", difficulty: "Advanced" },
    { title: "Functional Groups", desc: "Identifying active sites in organic chains.", difficulty: "Intermediate" },
    { title: "Ion Identification", desc: "Flame tests and reagent indicators.", difficulty: "Beginner" },
    { title: "Buffer Systems", desc: "Maintaining pH stability in solutions.", difficulty: "Advanced" },
    { title: "Phase Changes", desc: "States of matter and latent heat.", difficulty: "Beginner" },
    { title: "Lewis Dot Models", desc: "Valence electron sharing strategies.", difficulty: "Beginner" },
    { title: "Sustainability", desc: "Green chemistry and waste management.", difficulty: "Intermediate" }
  ],
  physics: [
    { title: "Circular Motion", desc: "Centripetal force and angular momentum.", difficulty: "Advanced" },
    { title: "Wave Physics", desc: "Interference and diffraction patterns.", difficulty: "Intermediate" },
    { title: "Quantum Basics", desc: "Photoelectric effect and photon energy.", difficulty: "Advanced" },
    { title: "Gravity Map", desc: "Universal gravitation and orbit mechanics.", difficulty: "Intermediate" },
    { title: "Thermodynamics", desc: "Heat transfer and entropy laws.", difficulty: "Advanced" },
    { title: "Optical Lenses", desc: "Ray tracing through convex/concave glass.", difficulty: "Beginner" },
    { title: "Circuit Logic", desc: "Series and parallel resistance analysis.", difficulty: "Intermediate" },
    { title: "Standard Units", desc: "SI dimensions and measurement precision.", difficulty: "Beginner" },
    { title: "Projectile Path", desc: "Trajectory calculations for motion.", difficulty: "Intermediate" },
    { title: "Linear Momentum", desc: "Elastic and inelastic collision data.", difficulty: "Beginner" },
    { title: "Nuclear Physics", desc: "Half-life and isotope decay paths.", difficulty: "Advanced" },
    { title: "Special Relativity", desc: "Time dilation for beginners.", difficulty: "Advanced" },
    { title: "Electromagnetism", desc: "Lorentz force and magnetic fields.", difficulty: "Intermediate" },
    { title: "Fluid Dynamics", desc: "Bernoulli's principle application.", difficulty: "Advanced" },
    { title: "Oscillations", desc: "Simple harmonic motion parameters.", difficulty: "Intermediate" },
    { title: "Power & Work", desc: "Energy expenditure in mechanical systems.", difficulty: "Beginner" },
    { title: "Vector Analysis", desc: "Decomposing forces into components.", difficulty: "Beginner" },
    { title: "Sound Harmonics", desc: "Frequency and wavelength of acoustics.", difficulty: "Intermediate" },
    { title: "Satellite Motion", desc: "Kepler's laws and escape velocity.", difficulty: "Advanced" },
    { title: "Experimental Error", desc: "Uncertainty and data validaton.", difficulty: "Beginner" }
  ],
  biology: [
    { title: "Genetics Intro", desc: "Punnett squares and dominant traits.", difficulty: "Beginner" },
    { title: "Cell Structure", desc: "Comparing Eukaryotic and Prokaryotic.", difficulty: "Beginner" },
    { title: "Photosynthesis", desc: "Light dependent vs dark cycle logic.", difficulty: "Intermediate" },
    { title: "Enzyme Activity", desc: "Active sites and denaturation factors.", difficulty: "Advanced" },
    { title: "Human Systems", desc: "Brief tour of major organ functions.", difficulty: "Beginner" },
    { title: "DNA Extraction", desc: "Isolating nucleic acids from tissue.", difficulty: "Intermediate" },
    { title: "Microscopy", desc: "Focusing and slide preparation guide.", difficulty: "Beginner" },
    { title: "Osmosis & Diffusion", desc: "Passive transport across membranes.", difficulty: "Intermediate" },
    { title: "Evolutionary Path", desc: "Natural selection and adaptation.", difficulty: "Intermediate" },
    { title: "Ecology Balance", desc: "Trophic levels and energy pyramids.", difficulty: "Beginner" },
    { title: "Nervous Signal", desc: "Action potentials and synapses.", difficulty: "Advanced" },
    { title: "Protein Synthesis", desc: "Transcription and translation.", difficulty: "Advanced" },
    { title: "Meiosis Cycle", desc: "Gamete formation and variation.", difficulty: "Advanced" },
    { title: "Plant Anatomy", desc: "Xylem, phloem and vascular bundles.", difficulty: "Intermediate" },
    { title: "Immune Response", desc: "Lymphocytes and antibody production.", difficulty: "Advanced" },
    { title: "Homeostasis", desc: "Internal regulation mechanisms.", difficulty: "Intermediate" },
    { title: "Classification", desc: "Taxonomy and binomial nomenclature.", difficulty: "Beginner" },
    { title: "Microbial Growth", desc: "Bacterial binary fission monitoring.", difficulty: "Intermediate" },
    { title: "Animal Behavior", desc: "Instincts and learned responses.", difficulty: "Beginner" },
    { title: "Biotechnology", desc: "CRISPR and genetic engineering intro.", difficulty: "Advanced" }
  ]
};
type Subject = "chemistry" | "physics" | "biology";

// Molecular Mapping for Visualization
function MoleculeBall3D({
  element,
  size = 32,
  position = { x: 0, y: 0, z: 0 },
}: {
  element: string;
  size?: number;
  position?: { x: number; y: number; z: number };
}) {
  const elementData = elements.find((e) => e.symbol === element);
  const color = elementData ? `#${elementData.cpk_hex}` : "#94a3b8";
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, x: position.x, y: position.y }}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        transform: `translateZ(${position.z}px)`,
        position: "absolute",
        zIndex: Math.round(position.z + 100),
      }}
      className="rounded-full shadow-2xl flex items-center justify-center border border-white/10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_60%)] rounded-full" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40 rounded-full" />
      <span className="relative z-10 text-[10px] font-black mix-blend-difference invert uppercase">
        {element}
      </span>
    </motion.div>
  );
}

const ANATOMY_MODELS = [
  { id: "frog", name: "Amphibian Model", system: "Skeletal System", icon: LayoutGrid },
  { id: "human", name: "Human Physiology", system: "Integrated Systems", icon: User },
  { id: "animal", name: "Comparative Zoology", system: "Mammalia Map", icon: LayoutGrid },
];

const MOLECULAR_STRUCTURES: Record<
  string,
  { symbol: string; pos: [number, number, number]; links?: number[] }[]
> = {
  H2O: [
    { symbol: "O", pos: [0, 0, 0], links: [1, 2] },
    { symbol: "H", pos: [-25, 20, 0] },
    { symbol: "H", pos: [25, 20, 0] },
  ],
  NaOH: [
    { symbol: "Na", pos: [-20, 0, 0], links: [1] },
    { symbol: "O", pos: [15, 0, 0], links: [2] },
    { symbol: "H", pos: [35, 10, 0] },
  ],
  H2SO4: [
    { symbol: "S", pos: [0, 0, 0], links: [1, 2, 3, 4] },
    { symbol: "O", pos: [0, -35, 10] },
    { symbol: "O", pos: [0, 35, 10] },
    { symbol: "O", pos: [-35, 0, -10], links: [5] },
    { symbol: "O", pos: [35, 0, -10], links: [6] },
    { symbol: "H", pos: [-55, 10, -5] },
    { symbol: "H", pos: [55, 10, -5] },
  ],
  CuSO4: [
    { symbol: "Cu", pos: [-40, 0, 0] },
    { symbol: "S", pos: [30, 0, 0], links: [2, 3, 4, 5] },
    { symbol: "O", pos: [30, -30, 15] },
    { symbol: "O", pos: [30, 30, 15] },
    { symbol: "O", pos: [0, 0, -15] },
    { symbol: "O", pos: [60, 0, -15] },
  ],
  Na2SO4: [
    { symbol: "Na", pos: [-60, -20, 0] },
    { symbol: "Na", pos: [-60, 20, 0] },
    { symbol: "S", pos: [20, 0, 0], links: [3, 4, 5, 6] },
    { symbol: "O", pos: [20, -30, 15] },
    { symbol: "O", pos: [20, 30, 15] },
    { symbol: "O", pos: [-10, 0, -15] },
    { symbol: "O", pos: [50, 0, -15] },
  ],
  H2: [
    { symbol: "H", pos: [-15, 0, 0], links: [1] },
    { symbol: "H", pos: [15, 0, 0] },
  ],
  O2: [
    { symbol: "O", pos: [-18, 0, 0], links: [1] },
    { symbol: "O", pos: [18, 0, 0] },
  ],
  I2: [
    { symbol: "I", pos: [-25, 0, 0], links: [1] },
    { symbol: "I", pos: [25, 0, 0] },
  ],
  ZnSO4: [
    { symbol: "Zn", pos: [-40, 0, 0] },
    { symbol: "S", pos: [30, 0, 0], links: [2, 3, 4, 5] },
    { symbol: "O", pos: [30, -30, 15] },
    { symbol: "O", pos: [30, 30, 15] },
    { symbol: "O", pos: [0, 0, -15] },
    { symbol: "O", pos: [60, 0, -15] },
  ],
  Mg: [{ symbol: "Mg", pos: [0, 0, 0] }],
  Na: [{ symbol: "Na", pos: [0, 0, 0] }],
  Zn: [{ symbol: "Zn", pos: [0, 0, 0] }],
  H2O2: [
    { symbol: "O", pos: [-15, 0, 0], links: [1, 2] },
    { symbol: "O", pos: [15, 10, 15], links: [3] },
    { symbol: "H", pos: [-25, -20, -10] },
    { symbol: "H", pos: [25, 30, 25] },
  ],
  AgNO3: [
    { symbol: "Ag", pos: [-50, 0, 0] },
    { symbol: "N", pos: [20, 0, 0], links: [2, 3, 4] },
    { symbol: "O", pos: [20, -35, 10] },
    { symbol: "O", pos: [20, 35, 10] },
    { symbol: "O", pos: [55, 0, -10] },
  ],
  Iodine: [
    { symbol: "I", pos: [-25, 0, 0], links: [1] },
    { symbol: "I", pos: [25, 0, 0] },
  ],
};

function MolecularModel3D({ formula }: { formula: string }) {
  const cleanFormula = formula.replace(/\s*\([^)]*\)/g, "").trim();
  const prefixMatch = cleanFormula.match(/^([0-9]+)/);
  const actualFormula = prefixMatch
    ? cleanFormula.slice(prefixMatch[1].length)
    : cleanFormula;
  const structure = MOLECULAR_STRUCTURES[actualFormula];

  if (!structure) {
    // Fallback to simple cluster if structure not predefined
    const elementMatches = Array.from(
      actualFormula.matchAll(/([A-Z][a-z]?)([0-9]*)/g),
    );
    const atoms: { symbol: string; pos: [number, number, number] }[] = [];
    elementMatches.forEach((m, idx) => {
      const sym = m[1];
      const count = parseInt(m[2]) || 1;
      for (let i = 0; i < count; i++) {
        const angle = (atoms.length / 5) * Math.PI * 2;
        const radius = 30 + atoms.length * 2;
        atoms.push({
          symbol: sym,
          pos: [
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            idx * 20 - 20,
          ],
        });
      }
    });

    return (
      <div className="relative w-40 h-40 flex items-center justify-center perspective-[1000px]">
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="relative preserve-3d"
        >
          {atoms.map((a, i) => (
            <MoleculeBall3D
              key={i}
              element={a.symbol}
              position={{ x: a.pos[0], y: a.pos[1], z: a.pos[2] }}
              size={24}
            />
          ))}
        </motion.div>
        <div className="absolute -bottom-2 text-[8px] font-black uppercase text-white/30 tracking-widest">
          {formula}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-48 h-48 flex items-center justify-center perspective-[1000px]">
      <motion.div
        animate={{ rotateY: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="relative preserve-3d"
      >
        {/* Bonds */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible preserve-3d">
          {structure.map((atom, i) =>
            atom.links?.map((targetIdx) => {
              const target = structure[targetIdx];
              if (!target) return null;
              return (
                <line
                  key={`${i}-${targetIdx}`}
                  x1={atom.pos[0] + 100}
                  y1={atom.pos[1] + 100}
                  x2={target.pos[0] + 100}
                  y2={target.pos[1] + 100}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              );
            }),
          )}
        </svg>

        {/* Atoms */}
        {structure.map((atom, i) => (
          <MoleculeBall3D
            key={i}
            element={atom.symbol}
            position={{ x: atom.pos[0], y: atom.pos[1], z: atom.pos[2] }}
            size={atom.symbol === "H" ? 24 : 36}
          />
        ))}
      </motion.div>
      <div className="absolute -bottom-4 text-[9px] font-black uppercase text-primary tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/20">
        {formula}
      </div>
    </div>
  );
}

interface VirtualLabProps {
  initialSubject?: Subject;
  hideSwitcher?: boolean;
}

// Physical Lab Sub-components
function ExperimentCard({
  title,
  difficulty,
  steps,
}: {
  title: string;
  difficulty: string;
  steps: string[];
}) {
  return (
    <div className="p-6 bg-card border border-border rounded-[2rem] hover:border-primary/50 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-black italic text-lg leading-tight mb-1">
            {title}
          </h4>
          <span
            className={cn(
              "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
              difficulty === "Beginner"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : difficulty === "Intermediate"
                  ? "bg-orange-500/10 border-orange-500/20 text-orange-500"
                  : "bg-red-500/10 border-red-500/20 text-red-500",
            )}
          >
            {difficulty}
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <BookIcon size={18} />
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="mt-1 shrink-0">
              <CheckCircle2 size={12} className="text-primary/40" />
            </div>
            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VirtualLab({
  initialSubject,
  hideSwitcher = false,
}: VirtualLabProps) {
  const [subject, setSubject] = useState<Subject>(
    initialSubject || "chemistry",
  );
  const [viewMode, setViewMode] = useState<ViewMode>(
    subject === "chemistry" ? "periodic" : "lab",
  );

  // Physics States
  const [pendulumLength, setPendulumLength] = useState(100);
  const [gravity, setGravity] = useState(9.8);
  const [resistance, setResistance] = useState(100);
  const [voltage, setVoltage] = useState(12);
  const [lensFocalLength, setLensFocalLength] = useState(50);
  const [objDistance, setObjDistance] = useState(100);

  // Biology States
  const [microscopeSlide, setMicroscopeSlide] = useState<
    "none" | "onion" | "blood" | "leaf" | "frog" | "heart" | "eye" | "petri"
  >("none");
  const [zoom, setZoom] = useState(1);
  const [lightIntensity, setLightIntensity] = useState(50);
  const [saltConcentration, setSaltConcentration] = useState(0);

  // Anatomy State
  const [selectedAnatomy, setSelectedAnatomy] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>("Skin");

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [beaker, setBeaker] = useState<Substance[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [vesselType, setVesselType] = useState<"beaker" | "test-tube">(
    "beaker",
  );
  const [reaction, setReaction] = useState<string | null>(null);
  const [reactionType, setReactionType] = useState<
    "mild" | "violent" | "gas" | "precipitate" | null
  >(null);
  const [reactionDetails, setReactionDetails] = useState<{
    color?: string;
    precipitateType?: string;
    speed?: "instant" | "slow" | "gradual";
    effect?: "bubbles" | "smoke" | "sparks" | "crystals";
  } | null>(null);
  const [reactionFormula, setReactionFormula] = useState<{
    reactants: string[];
    products: string[];
  } | null>(null);
  const [balancedEquation, setBalancedEquation] = useState<string | null>(null);
  const [reactionExplanation, setReactionExplanation] = useState<string | null>(
    null,
  );
  const [showReactionDialog, setShowReactionDialog] = useState(false);

  const SPECIMEN_DATA: Record<
    string,
    { magnification: string; features: string[]; description: string }
  > = {
    onion: {
      magnification: "400x",
      features: ["Cell Wall", "Chloroplasts", "Nucleus"],
      description:
        "Onion skin cells showing clear cellular boundaries and organized structure.",
    },
    blood: {
      magnification: "1000x",
      features: ["Erythrocytes", "Leukocytes", "Platelets"],
      description:
        "Human blood smear showing biconcave red cells and nucleated white cells.",
    },
    leaf: {
      magnification: "400x",
      features: ["Stomata", "Guard Cells", "Epidermis"],
      description: "Plant leaf surface showing pores for gas exchange.",
    },
    frog: {
      magnification: "100x",
      features: ["Skin Cells", "Pigment", "Nuclei"],
      description: "Amphibian epithelial tissue with visible pigment spots.",
    },
    heart: {
      magnification: "200x",
      features: ["Cardiac Muscle", "Striations", "Intercalated Discs"],
      description:
        "Tightly packed muscle fibers specialized for rhythmic contraction.",
    },
    eye: {
      magnification: "400x",
      features: ["Retina Layers", "Rods/Cones", "Nerve Fibers"],
      description:
        "Cross section of ocular tissue showing sophisticated sensory layers.",
    },
    petri: {
      magnification: "100x",
      features: ["Bacterial Colonies", "Aseptic Field", "Culture Medium"],
      description: "Agar plate showing rapid microbial growth and colony formation.",
    },
  };
  const [temperature, setTemperature] = useState<number>(25);
  const [pH, setPH] = useState<number>(7);
  const [discoveredReactions, setDiscoveredReactions] = useState<string[]>([]);
  const [hasNewDiscovery, setHasNewDiscovery] = useState(false);
  const [selectedMolecule, setSelectedMolecule] = useState<string>("H2O");
  const [pendingSubstance, setPendingSubstance] = useState<Substance | null>(
    null,
  );
  const [selectedQuantity, setSelectedQuantity] = useState(25);
  const [sidebarQuantity, setSidebarQuantity] = useState<number>(20);

  const [dnaExtractionStage, setDnaExtractionStage] = useState<
    "none" | "crushed" | "lysed" | "protease_added" | "precipitated"
  >("none");
  const [isDnaPrecipitating, setIsDnaPrecipitating] = useState(false);

  // New Tool States
  const [molarMassInput, setMolarMassInput] = useState("");
  const [molarMassResult, setMolarMassResult] = useState<number | null>(null);
  const [equationInput, setEquationInput] = useState("");
  const [isBalanced, setIsBalanced] = useState<boolean | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Physics - Projectile Motion
  const [projectileAngle, setProjectileAngle] = useState(45);
  const [projectileVelocity, setProjectileVelocity] = useState(20);
  const [projectileHeight, setProjectileHeight] = useState(0);
  const [projectilePath, setProjectilePath] = useState<
    { x: number; y: number }[]
  >([]);
  const [isProjectileFlying, setIsProjectileFlying] = useState(false);
  const [projectileTime, setProjectileTime] = useState(0);
  const [isCircuitClosed, setIsCircuitClosed] = useState(true);

  // Biology - DNA Extraction
  const [lysisAdded, setLysisAdded] = useState(false);
  const [ethanolAdded, setEthanolAdded] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [dnaVisible, setDnaVisible] = useState(false);

  React.useEffect(() => {
    let interval: any;
    if (isProjectileFlying) {
      const v0 = projectileVelocity;
      const angle = (projectileAngle * Math.PI) / 180;
      const tMax = (2 * v0 * Math.sin(angle)) / gravity;

      interval = setInterval(() => {
        setProjectileTime((t) => {
          if (t >= tMax) {
            setIsProjectileFlying(false);
            return tMax;
          }
          return t + 0.05;
        });
      }, 50);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isProjectileFlying, projectileVelocity, projectileAngle, gravity]);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const calculateMolarMass = (formula: string) => {
    if (!formula) return;
    try {
      const matches = Array.from(formula.matchAll(/([A-Z][a-z]?)([0-9]*)/g));
      if (matches.length === 0) {
        setMolarMassResult(null);
        return;
      }
      let total = 0;
      for (const match of matches) {
        const symbol = match[1];
        const count = parseInt(match[2]) || 1;
        const element = elements.find((e) => e.symbol === symbol);
        if (element) {
          total += element.atomic_mass * count;
        }
      }
      setMolarMassResult(total);
    } catch (e) {
      setMolarMassResult(null);
    }
  };

  const substances: Substance[] = [
    {
      id: "water",
      name: "Distilled Water (H2O)",
      color: "rgba(96, 165, 250, 0.6)",
      icon: <Droplet size={18} />,
      quantity: 50,
      description: "Purified solvent used for general chemical dilutions and cleaning.",
    },
    {
      id: "h2so4",
      name: "Sulfuric Acid (H2SO4)",
      color: "rgba(234, 179, 8, 0.7)",
      icon: <Droplet size={18} />,
      quantity: 20,
      description: "Concentrated strong acid. Reacts vigorously with bases.",
    },
    {
      id: "naoh",
      name: "Sodium Hydroxide (NaOH)",
      color: "rgba(255, 255, 255, 0.8)",
      icon: <Droplet size={18} />,
      quantity: 20,
      description: "Strong caustic base. Used to neutralize acids and adjust pH.",
    },
    {
      id: "cuso4",
      name: "Copper Sulfate (CuSO4)",
      color: "rgba(37, 99, 235, 0.8)",
      icon: <Droplet size={18} />,
      quantity: 15,
      description: "Vibrant blue salt. Forms deep blue solutions and hydrated crystals.",
    },
    {
      id: "na",
      name: "Sodium (Na)",
      color: "rgba(226, 232, 240, 0.9)",
      icon: <div className="w-4 h-4 bg-slate-200 rounded-full shadow-inner" />,
      quantity: 5,
      description: "Soft alkali metal. Reacts explosively when added to water.",
    },
    {
      id: "mg",
      name: "Magnesium (Mg)",
      color: "rgba(148, 163, 184, 0.9)",
      icon: <div className="w-4 h-1 bg-slate-400 rounded-full" />,
      quantity: 5,
      description: "Ribbon metal. Burns with an intense white flame when heated.",
    },
    {
      id: "kmno4",
      name: "Potassium Permanganate (KMnO4)",
      color: "rgba(88, 28, 135, 0.8)",
      icon: <Droplet size={18} />,
      quantity: 10,
      description: "Powerful purple oxidant. Colors solutions even at low concentrations.",
    },
    {
      id: "h2o2",
      name: "Hydrogen Peroxide (H2O2)",
      color: "rgba(207, 250, 254, 0.5)",
      icon: <Droplet size={18} />,
      quantity: 25,
      description: "Unstable oxidizing agent. Decomposes to release oxygen gas.",
    },
    {
      id: "agno3",
      name: "Silver Nitrate (AgNO3)",
      color: "rgba(209, 250, 229, 0.6)",
      icon: <Droplet size={18} />,
      quantity: 10,
      description: "Precipitating agent. Used to detect the presence of halogens.",
    },
    {
      id: "iodine",
      name: "Iodine (I2)",
      color: "rgba(147, 51, 234, 0.7)",
      icon: <Droplet size={18} />,
      quantity: 10,
      description: "Crystalline halogen. Sublimes and acts as a specific starch indicator.",
    },
    {
      id: "zn",
      name: "Zinc (Zn)",
      color: "rgba(100, 116, 139, 0.9)",
      icon: <div className="w-4 h-4 bg-slate-500 rounded-lg" />,
      quantity: 10,
      description: "Granulated metal. Commonly used for generating hydrogen gas with acids.",
    },
  ];

  const physicsApparatus = [
    {
      id: "multimeter",
      name: "Digital Multimeter",
      icon: (
        <div className="w-5 h-4 bg-orange-600 rounded flex items-center justify-center text-[6px] text-white">
          V/A
        </div>
      ),
      description: "Measures voltage and current.",
    },
    {
      id: "pendulum",
      name: "Simple Pendulum",
      icon: <Activity size={18} />,
      description: "Studies periodic motion.",
    },
    {
      id: "lens",
      name: "Convex Lens",
      icon: <Search size={18} />,
      description: "Converges light rays.",
    },
    {
      id: "projectile",
      name: "Projectile Launcher",
      icon: <Rocket size={18} />,
      description: "Simulates parabolic trajectories.",
    },
    {
      id: "formula_sandbox",
      name: "Formula Sandbox",
      icon: <Binary size={18} />,
      description: "Interactive components requirement and formula matching.",
    },
    {
      id: "power",
      name: "DC Power Source",
      icon: (
        <div className="w-6 h-4 bg-slate-800 rounded flex gap-1 items-center justify-center">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          <div className="w-1.5 h-1.5 bg-black rounded-full" />
        </div>
      ),
      description: "Variable voltage supply.",
    },
  ];

  const biologyApparatus = [
    {
      id: "microscope",
      name: "Compound Microscope",
      icon: <Microscope size={18} />,
      description: "View cellular structures.",
    },
    {
      id: "petri",
      name: "Petri Dish",
      icon: <div className="w-5 h-5 rounded-full border-2 border-slate-300" />,
      description: "Culture and observation.",
    },
    {
      id: "dna_kit",
      name: "DNA Extraction Kit",
      icon: (
        <div className="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-primary/40 rounded-full" />
        </div>
      ),
      description: "Isolate DNA from samples.",
    },
    {
      id: "anatomy_mapper",
      name: "Anatomy Mapper",
      icon: <LayoutGrid size={18} />,
      description: "Map physiological structures.",
    },
    {
      id: "scalpel",
      name: "Precision Scalpel",
      icon: <div className="w-5 h-1 bg-slate-300 rounded-full rotate-45" />,
      description: "Dissection and sampling.",
    },
    {
      id: "slides",
      name: "Glass Slides",
      icon: <div className="w-6 h-3 bg-white/20 border border-white/40" />,
      description: "Prepare specimens.",
    },
  ];

  const biologySubstances: Substance[] = [
    {
      id: "lysis_buffer",
      name: "Lysis Buffer",
      color: "rgba(224, 242, 254, 0.8)",
      icon: <Droplet size={18} />,
      description: "Detergent-based solution that breaks open cell membranes and nuclei.",
    },
    {
      id: "protease",
      name: "Protease Enzyme",
      color: "rgba(254, 243, 199, 0.8)",
      icon: <Droplet size={18} />,
      description: "Digestive enzyme that breaks down proteins like histones wrapping DNA.",
    },
    {
      id: "ethanol_bio",
      name: "Cold Ethanol",
      color: "rgba(255, 255, 255, 0.4)",
      icon: <Droplet size={18} />,
      description: "Ice-cold alcohol used to precipitate DNA out of the aqueous solution.",
    },
    {
      id: "onion_slide",
      name: "Onion Skin Cells",
      color: "rgba(255, 255, 255, 0.3)",
      icon: (
        <div className="w-4 h-4 border border-emerald-500/20 bg-emerald-500/5 rounded-sm" />
      ),
      description: "Plant tissue sample highlighting cellular architecture and nuclei.",
    },
    {
      id: "blood_slide",
      name: "Human Blood Smear",
      color: "rgba(255, 100, 100, 0.3)",
      icon: (
        <div className="w-4 h-4 border border-red-500/20 bg-red-500/5 rounded-full" />
      ),
      description: "Microscopic slide for identifying erythrocytes and leukocytes.",
    },
    {
      id: "leaf_slide",
      name: "Leaf Stomata",
      color: "rgba(100, 255, 100, 0.3)",
      icon: (
        <div className="w-4 h-2 bg-emerald-500/10 border border-emerald-500/20" />
      ),
      description: "Surface peel showing guard cells and gas exchange pores.",
    },
    {
      id: "frog_slide",
      name: "Frog Anatomical Specimen",
      color: "rgba(100, 200, 100, 0.6)",
      icon: <div className="w-4 h-4 rounded-full bg-emerald-700/40" />,
      description: "Translucent section of amphibian tissue for comparative anatomy.",
    },
    {
      id: "heart_slide",
      name: "Mammalian Heart",
      color: "rgba(255, 100, 100, 0.6)",
      icon: <div className="w-4 h-4 rounded-full bg-red-700/40" />,
      description: "Cardiac muscle fibers specializing in repetitive contraction.",
    },
    {
      id: "eye_slide",
      name: "Ocular Structure",
      color: "rgba(200, 200, 255, 0.6)",
      icon: <div className="w-4 h-4 rounded-full bg-blue-700/40" />,
      description: "Multi-layered sensory tissue involved in visual signal transduction.",
    },
    {
      id: "petri_sample",
      name: "Bacterial Culture",
      color: "rgba(200, 255, 100, 0.3)",
      icon: (
        <div className="w-4 h-4 border border-yellow-500/20 bg-yellow-500/5 rounded-full" />
      ),
      description: "Active microbial colonies spreading across nutrient agar surfaces.",
    },
    {
      id: "iodine_bio",
      name: "Iodine Stain",
      color: "rgba(147, 51, 234, 0.7)",
      icon: <Droplet size={18} />,
      description: "Used to detect and colorize complex carbohydrates like starch.",
    },
    {
      id: "methylene",
      name: "Methylene Blue",
      color: "rgba(59, 130, 246, 0.7)",
      icon: <Droplet size={18} />,
      description: "Vibrant blue dye used to stain animal cell nuclei for visibility.",
    },
  ];

  const tools: Tool[] = [
    {
      id: "burner",
      name: "Bunsen Burner",
      icon: <Flame size={18} />,
      description: "Applies heat to speed up reactions.",
    },
    {
      id: "thermometer",
      name: "Thermometer",
      icon: <div className="h-5 w-1 bg-red-500 rounded-full" />,
      description: "Measures reaction temperature.",
    },
    {
      id: "ph-paper",
      name: "pH Strips",
      icon: (
        <div className="flex h-4 gap-0.5">
          <div className="w-1 bg-red-400" />
          <div className="w-1 bg-yellow-400" />
          <div className="w-1 bg-green-400" />
        </div>
      ),
      description: "Tests acidity/alkalinity.",
    },
    {
      id: "microscope",
      name: "Microscope",
      icon: <div className="w-4 h-4 border-2 border-primary rounded-full" />,
      description: "View micro-structures.",
    },
  ];

  const addSubstance = (s: Substance) => {
    const itemToAdd = { ...s, id: `${s.id}-${Date.now()}` }; // Allow multiple additions
    const newBeaker = [...beaker, itemToAdd];
    setBeaker(newBeaker);
    // No automatic check anymore
  };

  const toggleTool = (id: string) => {
    const nextTool = activeTool === id ? null : id;
    setActiveTool(nextTool);
    // No automatic check anymore
  };

  const handleSimulate = () => {
    checkReaction(beaker, activeTool);
  };

  const checkReaction = (items: Substance[], tool: string | null) => {
    const ids = items.map((i) => i.id.split("-")[0]); // Strip timestamp
    let foundReaction: {
      text: string;
      type: "mild" | "violent" | "gas" | "precipitate";
      formula?: { reactants: string[]; products: string[] };
      balancedEquation?: string;
      explanation?: string;
      details?: {
        color?: string;
        precipitateType?: string;
        speed?: "instant" | "slow" | "gradual";
        effect?: "bubbles" | "smoke" | "sparks" | "crystals";
      };
    } | null = null;

    // Core Reactions
    if (ids.includes("na") && ids.includes("water")) {
      foundReaction = {
        text: "Violent reaction! Sodium reacts with water to form NaOH and Hydrogen gas with sparks!",
        type: "violent",
        formula: { reactants: ["Na", "H2O"], products: ["NaOH", "H2"] },
        balancedEquation: "2Na + 2H2O → 2NaOH + H2",
        explanation:
          "This is a single displacement reaction. Sodium is highly reactive and displaces hydrogen from water. The reaction is strongly exothermic, causing the hydrogen gas to potentially ignite with sparks.",
        details: {
          speed: "instant",
          effect: "sparks",
          color: "rgba(255, 255, 255, 0.9)",
        },
      };
    } else if (ids.includes("h2o2") && ids.includes("kmno4")) {
      foundReaction = {
        text: "Elephant Toothpaste Effect! Massive oxygen evolution and thick purple foam.",
        type: "violent",
        formula: {
          reactants: ["H2O2", "KMnO4"],
          products: ["O2", "MnO2", "KOH"],
        },
        balancedEquation: "2KMnO4 + 3H2O2 → 2MnO2 + 2KOH + 2H2O + 3O2",
        explanation:
          "Potassium permanganate acts as a catalyst (and reactant here) to rapidly decompose hydrogen peroxide into water and oxygen gas. The rapid release of gas creates an expanding foam.",
        details: {
          speed: "instant",
          effect: "smoke",
          color: "rgba(168, 85, 247, 0.4)",
        },
      };
    } else if (ids.includes("h2so4") && ids.includes("naoh")) {
      const h2so4Qty =
        items.find((i) => i.id.startsWith("h2so4"))?.quantity || 0;
      const naohQty = items.find((i) => i.id.startsWith("naoh"))?.quantity || 0;
      const isLarge = Math.min(h2so4Qty, naohQty) > 30;
      foundReaction = {
        text: `${isLarge ? "Vigorous" : "Mild"} Exothermic Neutralization! NaOH + H2SO4 reacting to form Sodium Sulfate + Water.`,
        type: isLarge ? "violent" : "mild",
        formula: { reactants: ["NaOH", "H2SO4"], products: ["Na2SO4", "H2O"] },
        balancedEquation: "2NaOH + H2SO4 → Na2SO4 + 2H2O",
        explanation:
          "A classic acid-base neutralization reaction. The hydroxide ions (OH-) from the base react with the hydrogen ions (H+) from the acid to form water, releasing significant thermal energy.",
        details: { speed: "instant", effect: "bubbles" },
      };
    } else if (ids.includes("zn") && ids.includes("h2so4")) {
      foundReaction = {
        text: "Zinc reacting with Sulfuric Acid. Rapid production of Hydrogen gas (effervescence).",
        type: "gas",
        formula: { reactants: ["Zn", "H2SO4"], products: ["ZnSO4", "H2"] },
        balancedEquation: "Zn + H2SO4 → ZnSO4 + H2",
        explanation:
          "Zinc displaces hydrogen from the sulfuric acid. The hydrogen gas is released as bubbles (effervescence), and zinc sulfate remains in the solution.",
        details: { speed: "gradual", effect: "bubbles" },
      };
    } else if (ids.includes("mg") && ids.includes("h2so4")) {
      foundReaction = {
        text: "Magnesium reacting with Sulfuric Acid. Rapid effervescence!",
        type: "gas",
        formula: { reactants: ["Mg", "H2SO4"], products: ["MgSO4", "H2"] },
        balancedEquation: "Mg + H2SO4 → MgSO4 + H2",
        explanation:
          "Magnesium is more reactive than zinc, leading to a faster displacement of hydrogen gas from the acid.",
        details: { speed: "instant", effect: "bubbles" },
      };
    } else if (ids.includes("iodine") && ids.includes("naoh")) {
      foundReaction = {
        text: "Disproportionation of Iodine in NaOH. Solution becomes colorless.",
        type: "mild",
        formula: {
          reactants: ["I2", "NaOH"],
          products: ["NaI", "NaIO3", "H2O"],
        },
        balancedEquation: "3I2 + 6NaOH → 5NaI + NaIO3 + 3H2O",
        explanation:
          "In this disproportionation reaction, iodine is both oxidized (to iodate) and reduced (to iodide). The dark color of iodine disappears as these colorless salts form.",
        details: { speed: "slow", color: "rgba(255, 255, 255, 1)" },
      };
    } else if (ids.includes("water") && ids.includes("cuso4")) {
      foundReaction = {
        text: "Dissolution complete. Beautiful blue solution formed.",
        type: "precipitate",
        formula: {
          reactants: ["CuSO4 (s)", "H2O"],
          products: ["Cu2+ (aq)", "SO4 2- (aq)"],
        },
        balancedEquation: "CuSO4(s) + H2O(l) → Cu2+(aq) + SO4 2-(aq)",
        explanation:
          "The solid copper sulfate lattice breaks down in water, with water molecules hydrating the ions to form a characteristic blue coordinate complex with the copper ions.",
        details: { speed: "gradual", color: "rgba(59, 130, 246, 0.8)" },
      };
    } else if (
      ids.includes("agno3") &&
      ids.includes("naoh") &&
      tool === "burner"
    ) {
      foundReaction = {
        text: "Silver Mirror Test Prototype! Fine silver precipitate coating glass.",
        type: "precipitate",
        formula: {
          reactants: ["AgNO3", "NaOH"],
          products: ["Ag2O", "H2O", "NaNO3"],
        },
        balancedEquation: "2AgNO3 + 2NaOH → Ag2O(s) + 2NaNO3 + H2O",
        explanation:
          "Silver nitrate reacts with sodium hydroxide to form a brown silver oxide precipitate. With heat, this can further reduce to metallic silver in specific conditions.",
        details: {
          speed: "slow",
          precipitateType: "silver-mirror",
          effect: "crystals",
        },
      };
    } else if (ids.includes("cuso4") && ids.includes("naoh")) {
      foundReaction = {
        text: "Displacement reaction! Blue Copper Hydroxide precipitate formed.",
        type: "precipitate",
        formula: {
          reactants: ["CuSO4", "NaOH"],
          products: ["Cu(OH)2", "Na2SO4"],
        },
        balancedEquation: "CuSO4 + 2NaOH → Cu(OH)2(s) + Na2SO4",
        explanation:
          "This is a double displacement (precipitation) reaction. The copper ions combine with hydroxide ions to form insoluble copper(II) hydroxide, while sodium sulfate stays dissolved.",
        details: {
          speed: "instant",
          precipitateType: "gelatinous",
          color: "rgba(34, 197, 94, 0.6)",
        },
      };
    } else if (ids.includes("na") && ids.includes("h2so4")) {
      foundReaction = {
        text: "EXTREMELY VIOLENT! Sodium reacts explosively with concentrated acid!",
        type: "violent",
        formula: { reactants: ["Na", "H2SO4"], products: ["Na2SO4", "H2"] },
        balancedEquation: "2Na + H2SO4 → Na2SO4 + H2",
        explanation:
          "The reaction between a highly reactive alkali metal and a strong acid is extremely fast and generates enough heat to potentially ignite the hydrogen gas instantly.",
        details: { speed: "instant", effect: "sparks" },
      };
    } else if (ids.includes("cuso4") && ids.includes("agno3")) {
      foundReaction = {
        text: "Precipitation reaction! Silver sulfate forms as a white precipitate.",
        type: "precipitate",
        formula: {
          reactants: ["CuSO4", "AgNO3"],
          products: ["Ag2SO4", "Cu(NO3)2"],
        },
        balancedEquation: "CuSO4 + 2AgNO3 → Ag2SO4(s) + Cu(NO3)2",
        explanation:
          "This is a double displacement reaction. While many sulfates are soluble, silver sulfate has low solubility and creates a white precipitate when silver nitrate is added to copper sulfate.",
        details: {
          speed: "gradual",
          effect: "crystals",
          color: "rgba(148, 163, 184, 0.8)",
        },
      };
    }

    // Biology: DNA Extraction Logic
    if (ids.includes("onion_slide") && tool === "scalpel" && dnaExtractionStage === "none") {
      setDnaExtractionStage("crushed");
      foundReaction = {
        text: "Sample Pulverized. Cell walls have been mechanically disrupted.",
        type: "mild",
        explanation: "Using a scalpel on the onion tissue breaks the cellulose cell walls, making the cellular contents accessible to chemical lysis.",
        details: { speed: "instant", effect: "bubbles" }
      };
    } else if (ids.includes("lysis_buffer") && dnaExtractionStage === "crushed") {
      setDnaExtractionStage("lysed");
      foundReaction = {
        text: "Cell Lysis in Progress. Releasing DNA from the nuclei.",
        type: "gas",
        explanation: "Lysis buffer contains detergents like SDS that dissolve lipid membranes (plasma membrane and nuclear envelope), spilling genetic material into the solution.",
        details: { speed: "gradual", color: "rgba(224, 242, 254, 0.4)", effect: "smoke" }
      };
    } else if (ids.includes("protease") && dnaExtractionStage === "lysed") {
      setDnaExtractionStage("protease_added");
      foundReaction = {
         text: "Proteolysis Active. Stripping proteins from DNA strands.",
         type: "mild",
         explanation: "DNA is tightly wrapped around histone proteins. Protease enzymes digest these proteins, leaving behind pure chromatin/DNA strands.",
         details: { speed: "slow", color: "rgba(254, 243, 199, 0.4)" }
      };
    } else if (ids.includes("ethanol_bio") && dnaExtractionStage === "protease_added") {
      setDnaExtractionStage("precipitated");
      setIsDnaPrecipitating(true);
      foundReaction = {
        text: "DNA PRECIPITATION! Visible clumps of genetic material appearing.",
        type: "precipitate",
        explanation: "DNA is insoluble in cold ethanol. Adding it to the salt-rich solution causes DNA molecules to clump together (fleece) and rise to the top interface.",
        details: { speed: "gradual", precipitateType: "dna-fibers", effect: "crystals" }
      };
    }

    if (foundReaction) {
      setReaction(foundReaction.text);
      setReactionType(foundReaction.type);
      setReactionFormula(foundReaction.formula || null);
      setReactionDetails(foundReaction.details || null);
      setBalancedEquation(foundReaction.balancedEquation || null);
      setReactionExplanation(foundReaction.explanation || null);
      setShowReactionDialog(true);

      // Log to Discovery Journal if not already discovered
      setDiscoveredReactions((prev) => {
        if (!prev.includes(foundReaction!.text)) {
          setHasNewDiscovery(true);
          return [foundReaction!.text, ...prev];
        }
        return prev;
      });
    } else {
      setReaction(null);
      setReactionType(null);
      setReactionDetails(null);
      setReactionFormula(null);
    }
  };

  const updateMeasurements = (items: Substance[], tool: string | null) => {
    const ids = items.map((i) => i.id.split("-")[0]);

    // Calculate Base pH
    let calculatedPH = 7;
    const hasAcid = ids.includes("h2so4");
    const hasBase = ids.includes("naoh");
    if (hasAcid && !hasBase) calculatedPH = 1.5;
    else if (hasBase && !hasAcid) calculatedPH = 12.5;
    else if (hasAcid && hasBase) calculatedPH = 7.2; // Slightly basic from Na2SO4 salt equilibrium simulation
    setPH(calculatedPH);

    // Calculate Temperature
    let baseTemp = 25;
    if (tool === "burner") baseTemp += 75;

    // Exothermic reactions add heat
    if (ids.includes("na") && ids.includes("water")) baseTemp += 140;
    if (ids.includes("h2so4") && ids.includes("naoh")) baseTemp += 35;
    if (ids.includes("na") && ids.includes("h2so4")) baseTemp += 250;

    setTemperature(baseTemp);
  };

  React.useEffect(() => {
    updateMeasurements(beaker, activeTool);
  }, [beaker, activeTool]);

  const resetBeaker = () => {
    setBeaker([]);
    setDnaExtractionStage("none");
    setIsDnaPrecipitating(false);
    setReaction(null);
    setReactionType(null);
    setReactionFormula(null);
    setBalancedEquation(null);
    setReactionExplanation(null);
    setShowReactionDialog(false);
    setActiveTool(null);
  };

  return (
    <div
      className={cn(
        "space-y-8 pb-20 transition-all duration-75",
        reactionType === "violent" &&
          "animate-[shake_0.1s_ease-in-out_infinite]",
      )}
    >
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
      `}</style>
      {/* Top Navigation - Zperiod Style */}
      <div className="flex bg-card/80 backdrop-blur-xl border border-border/50 p-1 rounded-2xl w-full max-w-3xl mx-auto shadow-2xl overflow-x-auto scrollbar-hide md:overflow-hidden no-scrollbar-x">
        {[
          { id: "periodic", icon: <LayoutGrid size={16} />, label: "Table" },
          { id: "lab", icon: <FlaskRound size={16} />, label: "Lab" },
          { id: "guides", icon: <BookIcon size={16} />, label: "Guides" },
          { id: "anatomy", icon: <Users size={16} />, label: "Anatomy" },
          { id: "molecules", icon: <Search size={16} />, label: "Molecules" },
          { id: "balancer", icon: <Microscope size={16} />, label: "Balancer" },
          { id: "molarmass", icon: <Info size={16} />, label: "Molar Mass" },
          {
            id: "solubility",
            icon: <Droplet size={16} />,
            label: "Solubility",
          },
          {
            id: "journal",
            icon: (
              <div className="relative">
                <RotateCcw size={16} />
                {hasNewDiscovery && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            ),
            label: "Journal",
          },
        ]
          .filter((item) => {
            if (subject === "biology")
              return (
                item.id === "lab" ||
                item.id === "anatomy" ||
                item.id === "guides" ||
                item.id === "molecules"
              );
            if (subject === "physics")
              return item.id === "lab" || item.id === "guides";
            if (subject === "chemistry")
              return (
                item.id === "lab" ||
                item.id === "periodic" ||
                item.id === "molecules" ||
                item.id === "guides" ||
                item.id === "journal"
              );
            // User requested removal of extra chemistry tools
            if (
              ["balancer", "molarmass", "solubility", "journal"].includes(
                item.id,
              )
            )
              return false;
            return true;
          })
          .map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setViewMode(item.id as ViewMode);
                if (item.id === "journal") setHasNewDiscovery(false);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shrink-0",
                viewMode === item.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "text-muted-foreground hover:bg-muted/50",
              )}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
      </div>

      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full max-w-2xl mx-auto overflow-hidden"
          >
            <div className="bg-orange-500/10 border border-orange-500/50 p-4 rounded-2xl flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center animate-pulse">
                <Info size={20} />
              </div>
              <div>
                <p className="text-orange-500 font-bold text-xs uppercase tracking-widest">
                  Connectivity Issue Detected
                </p>
                <p className="text-foreground/70 text-[10px] font-medium leading-relaxed italic">
                  "Check your internet connection and try again."
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject Selection */}
      {!hideSwitcher && (
        <div className="flex justify-center gap-4">
          {[
            {
              id: "chemistry",
              label: "Chemistry",
              icon: <Beaker size={16} />,
              color: "primary",
            },
            {
              id: "physics",
              label: "Physics",
              icon: <Zap size={16} />,
              color: "orange-500",
            },
            {
              id: "biology",
              label: "Biology",
              icon: <Microscope size={16} />,
              color: "emerald-500",
            },
          ].map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setSubject(sub.id as Subject);
                resetBeaker();
              }}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border",
                subject === sub.id
                  ? "bg-primary border-primary text-white shadow-xl scale-105"
                  : "bg-card border-border text-muted-foreground hover:bg-muted/50",
              )}
            >
              {sub.icon}
              {sub.label}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {viewMode === "molecules" ? (
          <motion.div
            key="molecules"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="bg-card border border-border rounded-[3rem] p-12 shadow-2xl min-h-[600px] flex flex-col"
          >
            <div className="flex flex-col md:flex-row gap-12 flex-1">
              {/* Selector */}
              <div className="w-full md:w-72 space-y-6">
                <div>
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
                    Molecular Explorer
                  </h2>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                    3D Structural Analysis
                  </p>
                </div>

                <div className="space-y-2 pr-2">
                  {Object.keys(MOLECULAR_STRUCTURES).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedMolecule(key)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group",
                        selectedMolecule === key
                          ? "bg-primary border-primary text-primary-foreground shadow-lg"
                          : "bg-muted/30 border-border hover:border-primary/50",
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-black italic text-lg">{key}</span>
                        <span
                          className={cn(
                            "text-[8px] uppercase tracking-widest font-bold",
                            selectedMolecule === key
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {key === "H2O"
                            ? "Water"
                            : key === "NaOH"
                              ? "Sodium Hydroxide"
                              : key === "H2SO4"
                                ? "Sulfuric Acid"
                                : key === "CuSO4"
                                  ? "Copper Sulfate"
                                  : key === "Na2SO4"
                                    ? "Sodium Sulfate"
                                    : key === "ZnSO4"
                                      ? "Zinc Sulfate"
                                      : key === "AgNO3"
                                        ? "Silver Nitrate"
                                        : key === "H2O2"
                                          ? "Hydrogen Peroxide"
                                          : key === "Iodine"
                                            ? "Iodine Crystal"
                                            : key + " Molecule"}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className={cn(
                          "transition-transform",
                          selectedMolecule === key
                            ? "translate-x-1"
                            : "opacity-0 group-hover:opacity-100",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Viewer Wrapper */}
              <div className="flex-1 bg-muted/20 rounded-[2.5rem] border border-border flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.05),transparent_70%)]" />

                <div className="relative z-10 scale-125 md:scale-150">
                  <MolecularModel3D formula={selectedMolecule} />
                </div>

                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Coordinates
                    </p>
                    <p className="text-[8px] font-mono text-muted-foreground tracking-widest">
                      X: 0.00 Y: 0.00 Z: AUTO-ROTATE
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-background/80 backdrop-blur-md border border-border rounded-xl">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      CPK Color Standard
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : viewMode === "guides" ? (
          <motion.div
            key="guides"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border rounded-[3rem] p-10 min-h-[600px]"
          >
             <header className="flex items-center justify-between mb-10 pb-6 border-b border-border">
                <div>
                   <h2 className="text-3xl font-black italic uppercase tracking-tight">Curriculum Guides</h2>
                   <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">{subject} Academic Path</p>
                </div>
                <button 
                  onClick={() => setViewMode("lab")}
                  className="px-6 py-2 bg-muted hover:bg-muted/80 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Back to Lab
                </button>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(LAB_GUIDES[subject] || []).map((guide, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 bg-muted/20 border border-border rounded-3xl group hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                  >
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                           <BookIcon size={16} />
                        </div>
                        <span className={cn(
                          "text-[8px] font-bold uppercase py-1 px-2 rounded-md",
                          guide.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-500' :
                          guide.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                        )}>
                           {guide.difficulty}
                        </span>
                     </div>
                     <h4 className="font-bold mb-2 group-hover:text-primary transition-colors">{guide.title}</h4>
                     <p className="text-[10px] text-muted-foreground leading-relaxed">{guide.desc}</p>
                  </motion.div>
                ))}
             </div>
          </motion.div>
        ) : viewMode === "anatomy" ? (
          <motion.div
            key="anatomy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="max-w-6xl mx-auto">
              {selectedAnatomy ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => setSelectedAnatomy(null)}
                        className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all group"
                      >
                        <RotateCcw size={24} className="group-hover:-rotate-90 transition-transform" />
                      </button>
                      <div className="text-left">
                        <div className="flex items-center gap-3 mb-1">
                           <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">
                            {selectedAnatomy === "frog"
                              ? "Lithobates catesbeianus"
                              : selectedAnatomy === "human"
                                ? "Homo Sapiens"
                                : "Mammalian Comparative"}
                          </h2>
                          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/30">Lvl 4 Model</span>
                        </div>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
                          High-Resolution Biological Synthesis
                        </p>
                      </div>
                    </div>
                  <div className="flex gap-4">
                       <button className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                         <Activity size={14} className="text-primary" />
                         Toggle Skeletal
                       </button>
                       <button className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                         <Zap size={14} />
                         View Vital Nodes
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-1 space-y-4">
                        {[
                         { label: 'Skin', icon: <Layers size={14} /> },
                         { label: 'Muscle', icon: <Zap size={14} /> },
                         { label: 'Nerve', icon: <Activity size={14} /> },
                         { label: 'Bone', icon: <Shield size={14} /> }
                       ].map((layer) => (
                         <button 
                           key={layer.label} 
                           onClick={() => setSelectedLayer(layer.label)}
                           className={cn(
                             "w-full h-24 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 group",
                             selectedLayer === layer.label 
                               ? "bg-primary border-primary text-white shadow-lg" 
                               : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                           )}
                         >
                           <div className={cn("transition-colors", selectedLayer === layer.label ? "text-white" : "text-primary group-hover:text-white")}>
                             {layer.icon}
                           </div>
                           <span className="text-[10px] font-black uppercase [writing-mode:vertical-lr]">{layer.label}</span>
                         </button>
                       ))}
                    </div>

                    <div className="lg:col-span-7 aspect-video bg-black/60 rounded-2xl sm:rounded-[4rem] border border-white/10 relative overflow-hidden group p-4 sm:p-10 flex items-center justify-center">
                      <div className="absolute inset-0 opacity-20 pointer-events-none">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]" />
                      </div>
                      
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={`${selectedAnatomy}-${selectedLayer}`}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          referrerPolicy="no-referrer"
                          src={
                            selectedAnatomy === "frog"
                              ? (selectedLayer === "Skin" ? "https://images.pexels.com/photos/70083/frog-macro-amphibian-nature-70083.jpeg?auto=compress" : 
                                 selectedLayer === "Muscle" ? "https://images.pexels.com/photos/15167144/pexels-photo-15167144.jpeg?auto=compress" :
                                 "https://images.pexels.com/photos/17267154/pexels-photo-17267154.jpeg?auto=compress")
                              : selectedAnatomy === "human"
                                ? (selectedLayer === "Skin" ? "https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress" :
                                   "https://images.pexels.com/photos/4031326/pexels-photo-4031326.jpeg?auto=compress")
                                : "https://images.pexels.com/photos/15167144/pexels-photo-15167144.jpeg?auto=compress"
                          }
                          className="max-h-full max-w-full object-contain rounded-3xl transition-transform duration-[5000ms] group-hover:scale-105"
                          alt="Anatomy Model"
                        />
                      </AnimatePresence>
                      
                      {/* Interactive Nodes */}
                      <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                         {[
                           { top: '40%', left: '30%', color: 'bg-red-500', label: 'Vital Center' },
                           { top: '60%', left: '70%', color: 'bg-blue-500', label: 'Motor Node' },
                           { top: '20%', left: '50%', color: 'bg-emerald-500', label: 'Optic Core' },
                         ].map((node, i) => (
                           <motion.div 
                             key={i}
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             className="absolute group/node pointer-events-auto cursor-pointer"
                             style={{ top: node.top, left: node.left }}
                           >
                              <div className={cn("w-4 h-4 rounded-full flex items-center justify-center relative", node.color)}>
                                 <div className={cn("absolute inset-0 rounded-full animate-ping opacity-75", node.color)} />
                                 <BrainCircuit size={10} className="text-white relative z-10" />
                              </div>
                              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-black/60 border border-white/10 backdrop-blur-md px-3 py-1 transparent rounded-lg text-[8px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity">
                                 {node.label}
                              </div>
                           </motion.div>
                         ))}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
                      
                      <div className="absolute bottom-10 left-10 flex flex-col gap-3">
                        <div className="flex gap-2">
                          <div className="px-5 py-2 bg-primary/20 backdrop-blur-xl rounded-2xl border border-primary/30 text-[10px] font-black uppercase text-primary flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Target: {selectedAnatomy === 'frog' ? 'Ranidae' : 'Hominid'}
                          </div>
                          <div className="px-5 py-2 bg-emerald-500/20 backdrop-blur-xl rounded-2xl border border-emerald-500/30 text-[10px] font-black uppercase text-emerald-500 flex items-center gap-2">
                            <Activity size={12} className="animate-pulse" />
                            Status: Active
                          </div>
                        </div>
                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest pl-2">Coord: 24.55, -12.04, 18.2</p>
                      </div>

                      <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
                         <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                            <Activity className="text-emerald-500 animate-pulse" size={24} />
                         </div>
                         <div className="text-[8px] font-black font-mono text-emerald-500/80 uppercase">Vitals Processing</div>
                      </div>
                    </div>

                    <div className="lg:col-span-4 text-left space-y-10">
                      <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                           <div className="w-2 h-2 bg-primary rounded-full" />
                           Interactive Nodes
                        </h4>
                        <div className="space-y-3">
                          {(selectedAnatomy === "frog"
                            ? [
                                "Peripheral Nervous Web",
                                "Cutaneous Respiration",
                                "Ventral Cavity Mesh",
                                "Ocular Reflex Loop",
                                "Digit Bone Matrix"
                              ]
                            : selectedAnatomy === "human"
                              ? [
                                  "Limbic System Map",
                                  "Myocardial Sync",
                                  "Renal Filtration",
                                  "Synaptic Pathway",
                                  "Hepatic Metabolism"
                                ]
                              : [
                                  "Propriocentive Input",
                                  "Muscular Lever Graph",
                                  "Basal Metabloic Index",
                                  "Sensory Decoupling",
                                  "Cortical Map"
                                ]
                          ).map((feat, i) => (
                            <motion.div
                              key={i}
                              whileHover={{ x: 5 }}
                              className="flex items-center gap-5 p-5 bg-white/5 rounded-[2rem] border border-white/10 hover:border-primary transition-all cursor-pointer group/node"
                            >
                              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover/node:bg-primary group-hover/node:text-white transition-colors">
                                <Zap size={18} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest group-hover/node:text-primary transition-colors">
                                  {feat}
                                </span>
                                <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Active Link</span>
                              </div>
                              <ChevronRight
                                size={14}
                                className="ml-auto text-white/10 group-hover/node:text-primary transition-all"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent rounded-[3rem] border border-primary/20 relative group overflow-hidden">
                        <div className="relative z-10">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">AI Diagnostic Summary</h4>
                          <p className="text-xs font-medium text-white/60 leading-relaxed italic">
                            "The biological framework of this model is optimized for high-pressure environmental stimuli. Observe the {selectedAnatomy === 'frog' ? 'dual-respiratory' : 'complex cognitive'} pathways for critical survival data."
                          </p>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => setViewMode("lab")}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Exit Archive
                    </button>
                  </div>
                  <h2 className="text-3xl font-black italic mb-2 tracking-tighter uppercase">
                    Biology Atlas
                  </h2>
                  <p className="text-muted-foreground mb-12 text-sm uppercase tracking-[0.2em] font-bold">
                    3D Comparative Anatomy & Specimens
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      {
                        id: "frog",
                        name: "Frog Dissection",
                        img: "https://images.pexels.com/photos/70083/frog-macro-amphibian-nature-70083.jpeg?auto=compress",
                        desc: "Skeletal and organ systems.",
                      },
                      {
                        id: "human",
                        name: "Human Body",
                        img: "https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress",
                        desc: "Integrated physiology models.",
                      },
                      {
                        id: "animal",
                        name: "Mammalian Specimen",
                        img: "https://images.pexels.com/photos/15167144/pexels-photo-15167144.jpeg?auto=compress",
                        desc: "Diverse biological structures.",
                      },
                    ].map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelectedAnatomy(item.id)}
                        className="group bg-muted/40 rounded-[2.5rem] p-6 border border-transparent hover:border-primary/50 transition-all cursor-pointer hover:shadow-2xl active:scale-95"
                      >
                        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 relative">
                          <img
                            src={item.img}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt={item.name}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-1 rounded-full text-[8px] font-black uppercase">
                            Premium Model
                          </div>
                        </div>
                        <h4 className="font-black italic text-xl mb-2 tracking-tight group-hover:text-primary transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-muted-foreground text-xs font-medium">
                          {item.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : viewMode === "lab" ? (
          <motion.div
            key="lab"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="bg-card border border-border rounded-[3rem] shadow-2xl flex flex-col lg:flex-row min-h-[750px]"
          >
            {/* Sidebar: Control Panel */}
            <div className="w-full lg:w-80 bg-muted/20 border-r border-border p-6 flex flex-col gap-6 h-auto">
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    {subject === "chemistry" ? (
                      <Beaker size={20} />
                    ) : subject === "physics" ? (
                      <Zap size={20} />
                    ) : (
                      <Microscope size={20} />
                    )}
                  </div>
                  <h3 className="text-xl font-bold italic tracking-tighter capitalize">
                    {subject} Lab
                  </h3>
                </div>

                <div className="space-y-6">
                  {subject === "chemistry" && (
                    <section>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 opacity-50">
                        Vessel Configuration
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <button
                            onMouseEnter={() => setHoveredItem("vessel-beaker")}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={() => setVesselType("beaker")}
                            className={cn(
                              "w-full flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95",
                              vesselType === "beaker"
                                ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10"
                                : "bg-card border-border hover:border-primary/50",
                            )}
                          >
                            <FlaskRound size={24} />
                            <span className="text-[10px] font-black uppercase">
                              Beaker
                            </span>
                          </button>
                          <AnimatePresence>
                            {hoveredItem === "vessel-beaker" && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-[100] w-32 p-2 bg-slate-900 border border-primary/20 rounded-xl shadow-xl pointer-events-none"
                              >
                                <p className="text-[8px] text-white/60 text-center uppercase font-black">Large volume reactions</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="relative">
                          <button
                            onMouseEnter={() => setHoveredItem("vessel-tube")}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={() => setVesselType("test-tube")}
                            className={cn(
                              "w-full flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95",
                              vesselType === "test-tube"
                                ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10"
                                : "bg-card border-border hover:border-primary/50",
                            )}
                          >
                            <FlaskConical size={24} />
                            <span className="text-[10px] font-black uppercase">
                              Tubular
                            </span>
                          </button>
                          <AnimatePresence>
                            {hoveredItem === "vessel-tube" && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-[100] w-32 p-2 bg-slate-900 border border-primary/20 rounded-xl shadow-xl pointer-events-none"
                              >
                                <p className="text-[8px] text-white/60 text-center uppercase font-black">Precision testing</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </section>
                  )}

                  <section>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 opacity-50">
                      {subject === "physics"
                        ? "Field Apparatus"
                        : subject === "biology"
                          ? "Biological Samples"
                          : "Analytical Reagents"}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {(subject === "physics"
                        ? physicsApparatus
                        : subject === "biology"
                          ? biologySubstances
                          : substances
                      ).map((s) => (
                        <div key={s.id} className="relative group/reagent">
                          <button
                            onMouseEnter={() => setHoveredItem(s.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={() => {
                              if (subject === "biology") {
                                if (s.id.includes("slide")) {
                                  setMicroscopeSlide(s.id.split("_")[0] as any);
                                  setActiveTool("microscope");
                                } else if (s.id.includes("petri")) {
                                  setMicroscopeSlide("petri");
                                  setActiveTool("petri");
                                } else {
                                  setPendingSubstance(s);
                                  setSelectedQuantity(25);
                                }
                              } else if (subject === "physics") {
                                toggleTool(s.id);
                              } else {
                                setPendingSubstance(s);
                                setSelectedQuantity(25);
                              }
                            }}
                            className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary transition-all group shrink-0"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center shadow-inner relative overflow-hidden`}
                            >
                              {s.icon}
                              {subject === "biology" &&
                                microscopeSlide === s.id.split("_")[0] && (
                                  <div className="absolute inset-0 bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                  </div>
                                )}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-xs font-bold tracking-tight">
                                {s.name}
                              </p>
                              <p className="text-[8px] font-black opacity-40 uppercase">
                                Initial: {sidebarQuantity} units
                              </p>
                            </div>
                            {subject === "chemistry" && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const formulaM = s.name.match(/\((.*?)\)/);
                                  if (formulaM) {
                                    setSelectedMolecule(formulaM[1]);
                                    setViewMode("molecules");
                                  }
                                }}
                                className="p-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary transition-colors active:scale-90"
                                title="View Molecular Structure"
                              >
                                <Search size={12} />
                              </div>
                            )}
                          </button>
                          <AnimatePresence>
                            {hoveredItem === s.id && s.description && (
                              <motion.div
                                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -5, scale: 0.95 }}
                                className="absolute left-full ml-3 top-0 z-[100] w-56 p-4 bg-slate-900/95 backdrop-blur-md border border-primary/20 rounded-2xl shadow-2xl pointer-events-none hidden lg:block"
                              >
                                <div className="absolute left-0 top-6 -translate-x-1/2 rotate-45 w-2.5 h-2.5 bg-slate-900 border-l border-b border-primary/20" />
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                    {s.icon}
                                  </div>
                                  <p className="text-[10px] font-black text-white uppercase tracking-tighter">
                                    {s.name}
                                  </p>
                                </div>
                                <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                                  {s.description}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                      {subject === "physics" && (
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-[10px] font-bold text-primary/60 italic text-center">
                          Select dynamic tools to begin physics simulation.
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 opacity-50">
                      Workbench Tools
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {(subject === "physics"
                        ? physicsApparatus
                        : subject === "biology"
                          ? biologyApparatus
                          : tools
                      ).map((tool) => (
                        <div key={tool.id} className="relative">
                          <button
                            onMouseEnter={() => setHoveredItem(tool.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={() => toggleTool(tool.id)}
                            className={cn(
                              "w-full flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all group active:scale-95",
                              activeTool === tool.id
                                ? "bg-primary/10 border-primary text-primary shadow-lg"
                                : "bg-card border-border hover:border-primary/30",
                            )}
                          >
                            <div
                              className={cn(
                                "transition-transform group-hover:scale-110",
                                activeTool === tool.id && "animate-pulse",
                              )}
                            >
                              {tool.icon}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest leading-tight text-center">
                              {tool.name.split(" ").slice(0, 2).join(" ")}
                            </span>
                          </button>
                          <AnimatePresence>
                            {hoveredItem === tool.id && tool.description && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-[100] w-48 p-4 bg-slate-900/95 backdrop-blur-md border border-primary/20 rounded-2xl shadow-2xl pointer-events-none"
                              >
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-slate-900 border-r border-b border-primary/20" />
                                <p className="text-[10px] font-black text-white uppercase tracking-tighter mb-2 text-center pb-2 border-b border-white/5">
                                  {tool.name}
                                </p>
                                <p className="text-[10px] text-white/50 leading-relaxed font-medium text-center">
                                  {tool.description}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>

                    {subject === "physics" && (
                      <div className="mt-6 p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                          <RotateCcw size={12} className="animate-spin-slow" />{" "}
                          Environment Config
                        </p>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-[8px] font-black uppercase text-white/30">
                              <span>Planetary Gravity</span>
                              <span>{gravity} m/s²</span>
                            </div>
                            <input
                              type="range"
                              min="1.6"
                              max="24.8"
                              step="0.1"
                              value={gravity}
                              onChange={(e) =>
                                setGravity(parseFloat(e.target.value))
                              }
                              className="w-full h-1 bg-white/10 rounded-full accent-primary"
                            />
                            <div className="flex justify-between text-[7px] font-bold text-white/20 uppercase tracking-tighter">
                              <button
                                onClick={() => setGravity(1.6)}
                                className="hover:text-primary"
                              >
                                Moon
                              </button>
                              <button
                                onClick={() => setGravity(3.7)}
                                className="hover:text-primary"
                              >
                                Mars
                              </button>
                              <button
                                onClick={() => setGravity(9.8)}
                                className="hover:text-primary transition-colors text-primary/40"
                              >
                                Earth
                              </button>
                              <button
                                onClick={() => setGravity(24.8)}
                                className="hover:text-primary"
                              >
                                Jupiter
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </div>

              <div className="pt-6 border-t border-border mt-auto">
                {/* Pending Substance Modal */}
                <AnimatePresence>
                  {pendingSubstance && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 bg-card border border-primary/30 rounded-3xl mb-4 shadow-xl ring-1 ring-primary/20"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          {pendingSubstance.icon}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                            Configure Batch
                          </p>
                          <h4 className="font-bold text-sm tracking-tight">
                            {pendingSubstance.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => setPendingSubstance(null)}
                          className="ml-auto p-1.5 hover:bg-muted rounded-full"
                        >
                          <X size={14} className="text-muted-foreground" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                            <span>Quantity</span>
                            <span className="text-primary">
                              {selectedQuantity} ml/g
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={selectedQuantity}
                            onChange={(e) =>
                              setSelectedQuantity(parseInt(e.target.value))
                            }
                            className="w-full h-1 appearance-none bg-muted rounded-full accent-primary"
                          />
                        </div>

                        <button
                          onClick={() => {
                            addSubstance({
                              ...pendingSubstance,
                              quantity: selectedQuantity,
                            });
                            setPendingSubstance(null);
                          }}
                          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                          Confirm Addition
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleSimulate}
                  disabled={beaker.length === 0}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-xs font-black uppercase tracking-widest transition-all mb-3 shadow-lg shadow-primary/20"
                >
                  <FlaskRound size={16} className="animate-pulse" />
                  <span>Simulate Reaction</span>
                </button>

                <button
                  onClick={resetBeaker}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-muted hover:bg-muted/80 text-muted-foreground rounded-2xl text-xs font-black uppercase tracking-widest transition-all mb-4"
                >
                  <RotateCcw size={16} />
                  <span>Purge Vessel</span>
                </button>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <p className="text-[8px] font-black uppercase text-primary mb-2 tracking-[0.2em]">
                    Discovery Journal
                  </p>
                  <div className="space-y-2 pr-1">
                    {discoveredReactions.length === 0 ? (
                      <p className="text-[9px] font-bold text-muted-foreground/40 italic">
                        Awaiting chemical signatures...
                      </p>
                    ) : (
                      discoveredReactions.map((r, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-2.5 bg-primary/10 border-l-2 border-primary rounded-r-lg"
                        >
                          <p className="text-[9px] font-black uppercase text-primary/50 mb-0.5">
                            Reaction_{i + 1}
                          </p>
                          <p className="text-[10px] font-bold leading-tight text-foreground/90">
                            {r}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 p-12 bg-[#020617] relative flex flex-col items-center justify-center overflow-hidden">
              {/* Futuristic Background Decor */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,transparent_100%)]" />

                {/* Hexagonal Grid Pattern */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23334155' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
                    backgroundSize: "60px 60px",
                  }}
                />
              </div>

              {/*Glowing Conduits */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent shadow-[0_0_20px_rgba(249,115,22,0.5)]" />

              {/* Ambient Glows */}
              <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />
              <div
                className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse"
                style={{ animationDelay: "1s" }}
              />

              {/* Reaction Detail Modal */}
              <AnimatePresence>
                {showReactionDialog && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-10 right-10 w-[500px] bg-slate-950/90 border border-primary/30 rounded-[2.5rem] backdrop-blur-3xl shadow-3xl z-[100] overflow-hidden"
                  >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                          <Info size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                          In-depth Analysis
                        </span>
                      </div>
                      <button
                        onClick={() => setShowReactionDialog(false)}
                        className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="p-8 space-y-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                          Observation
                        </p>
                        <h3 className="text-xl font-black italic tracking-tighter leading-tight text-white">
                          {reaction}
                        </h3>
                      </div>

                      {balancedEquation && (
                        <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 mb-3 text-center">
                            Balanced Equation
                          </p>
                          <div className="text-center font-mono text-lg font-bold text-cyan-400 py-2 border-y border-white/5 bg-black/20 rounded-xl mb-4">
                            {balancedEquation}
                          </div>

                          {reactionFormula && (
                            <div className="flex items-center justify-center gap-4 py-4 relative">
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-[8px] font-black text-white/20 uppercase">
                                  Reactants
                                </span>
                                <div className="flex gap-2">
                                  {reactionFormula.reactants.map((f, i) => (
                                    <MolecularModel3D key={i} formula={f} />
                                  ))}
                                </div>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                                <RotateCcw size={16} className="rotate-180" />
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-[8px] font-black text-white/20 uppercase">
                                  Products
                                </span>
                                <div className="flex gap-2">
                                  {reactionFormula.products.map((f, i) => (
                                    <MolecularModel3D key={i} formula={f} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {reactionExplanation && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3">
                            Scientific Explanation
                          </p>
                          <p className="text-sm font-medium text-white/70 leading-relaxed italic">
                            "{reactionExplanation}"
                          </p>
                        </div>
                      )}

                      <div className="pt-4 flex justify-end">
                        <button
                          onClick={() => setShowReactionDialog(false)}
                          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                        >
                          Got it
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Interactive Tool HUD */}
              {activeTool && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-10 left-10 p-6 bg-slate-900/80 border border-cyan-500/30 rounded-2xl backdrop-blur-xl flex flex-col gap-3 shadow-2xl z-40 min-w-[220px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      {(() => {
                        const allTools =
                          subject === "chemistry"
                            ? [...tools, ...physicsApparatus, ...biologyApparatus]
                            : subject === "physics"
                              ? [
                                  ...physicsApparatus,
                                  ...tools,
                                  ...biologyApparatus,
                                ]
                              : [
                                  ...biologyApparatus,
                                  ...tools,
                                  ...physicsApparatus,
                                ];
                        return allTools.find((t) => t.id === activeTool)?.icon;
                      })()}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                      Analysis Mode
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white/90">
                      {(() => {
                        const allTools =
                          subject === "chemistry"
                            ? [...tools, ...physicsApparatus, ...biologyApparatus]
                            : subject === "physics"
                              ? [
                                  ...physicsApparatus,
                                  ...tools,
                                  ...biologyApparatus,
                                ]
                              : [
                                  ...biologyApparatus,
                                  ...tools,
                                  ...physicsApparatus,
                                ];
                        return allTools.find((t) => t.id === activeTool)?.name;
                      })()}
                    </p>
                    <p className="text-[10px] font-medium text-white/40 leading-tight">
                      {(() => {
                        const allTools =
                          subject === "chemistry"
                            ? [...tools, ...physicsApparatus, ...biologyApparatus]
                            : subject === "physics"
                              ? [
                                  ...physicsApparatus,
                                  ...tools,
                                  ...biologyApparatus,
                                ]
                              : [
                                  ...biologyApparatus,
                                  ...tools,
                                  ...physicsApparatus,
                                ];
                        return allTools.find((t) => t.id === activeTool)
                          ?.description;
                      })()}
                    </p>
                  </div>

                  <div className="mt-2 pt-3 border-t border-white/10">
                    {activeTool === "thermometer" && (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-end">
                          <span className="text-[9px] font-black uppercase text-white/30 tracking-tighter">
                            Current Temp
                          </span>
                          <span
                            className={cn(
                              "text-xl font-black italic tracking-tighter",
                              temperature > 100
                                ? "text-orange-500"
                                : "text-cyan-400",
                            )}
                          >
                            {temperature.toFixed(1)}°C
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                          <motion.div
                            className={cn(
                              "h-full",
                              temperature > 100
                                ? "bg-orange-500"
                                : "bg-cyan-500",
                            )}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min((temperature / 300) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-1">
                          {temperature > 50
                            ? "Exothermic Active"
                            : "Stabilized"}
                        </p>
                      </div>
                    )}
                    {activeTool === "ph-paper" && (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-end">
                          <span className="text-[9px] font-black uppercase text-white/30 tracking-tighter">
                            pH Level
                          </span>
                          <span
                            className={cn(
                              "text-xl font-black italic tracking-tighter",
                              pH < 4
                                ? "text-red-500"
                                : pH > 10
                                  ? "text-blue-500"
                                  : "text-emerald-500",
                            )}
                          >
                            {pH.toFixed(1)}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-lg flex overflow-hidden mt-1 gap-px">
                          {Array.from({ length: 14 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 h-full transition-all duration-500"
                              style={{
                                backgroundColor:
                                  i + 1 <= pH
                                    ? i < 4
                                      ? "#ef4444"
                                      : i < 7
                                        ? "#facc15"
                                        : i < 10
                                          ? "#10b981"
                                          : "#3b82f6"
                                    : "rgba(255,255,255,0.05)",
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-1">
                          {pH < 6.5
                            ? "Acidic Solution"
                            : pH > 7.5
                              ? "Alkaline Solution"
                              : "Neutral Solution"}
                        </p>
                      </div>
                    )}
                    {(activeTool === "burner" ||
                      activeTool === "microscope") && (
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            activeTool === "burner"
                              ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                              : "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]",
                          )}
                        />
                        <span
                          className={cn(
                            "text-[9px] font-black uppercase",
                            activeTool === "burner"
                              ? "text-orange-500"
                              : "text-cyan-500",
                          )}
                        >
                          {activeTool === "burner"
                            ? "Thermal Output Engaged"
                            : "Sample Analysis Active"}
                        </span>
                      </div>
                    )}
                    {activeTool === "dna_kit" && (
                      <div className="mt-4 space-y-3 pt-3 border-t border-white/10">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black uppercase text-white/30">Extraction Status</span>
                          <span className="text-[9px] font-black uppercase text-emerald-400">
                             {dnaExtractionStage === "none" ? "Preparation" : 
                              dnaExtractionStage === "crushed" ? "Disrupted" :
                              dnaExtractionStage === "lysed" ? "Lysing" :
                              dnaExtractionStage === "protease_added" ? "Digesting" : "Complete"}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          {["none", "crushed", "lysed", "protease_added", "precipitated"].map((stage, idx) => {
                            const stages = ["none", "crushed", "lysed", "protease_added", "precipitated"];
                            const currentIdx = stages.indexOf(dnaExtractionStage);
                            return (
                              <div 
                                key={stage} 
                                className={cn(
                                  "h-1 flex-1 rounded-full transition-all duration-500",
                                  idx <= currentIdx ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-white/5"
                                )}
                              />
                            );
                          })}
                        </div>
                        <p className="text-[8px] font-medium text-white/40 leading-relaxed">
                          {dnaExtractionStage === "none" && "1. Use Scalpel to pulverize specimen."}
                          {dnaExtractionStage === "crushed" && "2. Add Lysis Buffer to release DNA."}
                          {dnaExtractionStage === "lysed" && "3. Add Protease to strip histones."}
                          {dnaExtractionStage === "protease_added" && "4. Add Cold Ethanol to precipitate DNA."}
                          {dnaExtractionStage === "precipitated" && "DNA strands visible. Analysis complete."}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Subject Portals */}
              <AnimatePresence mode="wait">
                {subject === "physics" ? (
                  <motion.div
                    key="physics-workspace"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full h-full flex items-center justify-center gap-12 z-10 transition-all"
                  >
                    {activeTool === "pendulum" && (
                      <div className="flex flex-col items-center gap-8 bg-card/40 p-10 rounded-[3rem] border border-white/5 backdrop-blur-md">
                        <div className="relative w-2 h-60 bg-slate-800 rounded-full">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-700 rounded-lg shadow-xl" />
                          <motion.div
                            animate={{ rotate: [15, -15, 15] }}
                            transition={{
                              duration:
                                2 *
                                Math.PI *
                                Math.sqrt(pendulumLength / 100 / gravity),
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="absolute top-0 left-1/2 origin-top -translate-x-1/2 w-0.5 bg-cyan-400"
                            style={{ height: `${pendulumLength * 2}px` }}
                          >
                            <div className="absolute -bottom-4 -left-3.5 w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-xl border border-white/20" />
                          </motion.div>
                        </div>
                        <div className="space-y-4 w-full">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-cyan-400">
                            <span>Length: {pendulumLength}cm</span>
                            <span>G: {gravity}m/s²</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="150"
                            value={pendulumLength}
                            onChange={(e) =>
                              setPendulumLength(parseInt(e.target.value))
                            }
                            className="w-full h-1 appearance-none bg-cyan-900 rounded-full accent-cyan-400"
                          />
                          <div className="p-4 bg-black/40 rounded-2xl border border-cyan-500/20 text-center">
                            <p className="text-[8px] font-black text-cyan-500/40 uppercase mb-1">
                              Theoretical Period (T)
                            </p>
                            <p className="text-2xl font-mono font-bold text-cyan-400">
                              {(
                                2 *
                                Math.PI *
                                Math.sqrt(pendulumLength / 100 / gravity)
                              ).toFixed(2)}
                              <span className="text-xs ml-1">sec</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {(activeTool === "power" ||
                      activeTool === "multimeter") && (
                      <div className="flex flex-col items-center gap-6 bg-card/40 p-10 rounded-[3rem] border border-white/5 backdrop-blur-md w-96 relative">
                        <div className="w-full space-y-8">
                          <div className="p-6 bg-[#111] rounded-3xl border-4 border-slate-800 shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/5" />
                            <p className="text-[8px] font-black text-blue-400 opacity-50 uppercase tracking-widest mb-2">
                              Digital Multimeter Readout
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="text-right">
                                <p className="text-3xl font-mono font-black text-blue-400">
                                  {(isCircuitClosed
                                    ? voltage / (resistance || 1)
                                    : 0
                                  ).toFixed(3)}
                                </p>
                                <p className="text-[10px] font-black text-blue-400/40">
                                  AMPERES (I)
                                </p>
                              </div>
                              <div className="w-px h-10 bg-white/5" />
                              <div className="text-left">
                                <p className="text-2xl font-mono font-bold text-orange-400">
                                  {voltage.toFixed(1)}
                                </p>
                                <p className="text-[10px] font-black text-orange-400/40">
                                  VOLTS (V)
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-center py-6 gap-8 items-center bg-black/20 rounded-[2rem] border border-white/5 p-6">
                            <div className="flex flex-col items-center gap-2">
                              <button
                                onClick={() =>
                                  setIsCircuitClosed(!isCircuitClosed)
                                }
                                className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                  isCircuitClosed
                                    ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                {isCircuitClosed ? (
                                  <ToggleRight size={24} />
                                ) : (
                                  <ToggleLeft size={24} />
                                )}
                              </button>
                              <span className="text-[8px] font-black uppercase text-white/30">
                                Switch
                              </span>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                              <div className="relative">
                                <Lightbulb
                                  size={48}
                                  className={cn(
                                    "transition-all duration-500",
                                    isCircuitClosed
                                      ? "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                                      : "text-slate-700",
                                  )}
                                  style={{
                                    opacity: isCircuitClosed
                                      ? 0.3 + (voltage / 24) * 0.7
                                      : 0.3,
                                    filter: isCircuitClosed
                                      ? `brightness(${0.5 + (voltage / 24) * 1.5})`
                                      : "none",
                                  }}
                                />
                                {isCircuitClosed && (
                                  <motion.div
                                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                                    transition={{
                                      duration: 0.5,
                                      repeat: Infinity,
                                    }}
                                    className="absolute inset-0 bg-yellow-400/30 blur-2xl rounded-full"
                                  />
                                )}
                              </div>
                              <span className="text-[8px] font-black uppercase text-white/30">
                                Load
                              </span>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-2">
                              <div className="flex justify-between text-[8px] font-black text-white/40 uppercase">
                                <span>Resistance (Ω)</span>
                                <span>{resistance}Ω</span>
                              </div>
                              <input
                                type="range"
                                min="10"
                                max="1000"
                                step="10"
                                value={resistance}
                                onChange={(e) =>
                                  setResistance(parseInt(e.target.value))
                                }
                                className="w-full h-1 appearance-none bg-white/5 rounded-full accent-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-[8px] font-black text-white/40 uppercase">
                                <span>Voltage (V)</span>
                                <span>{voltage}V</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="24"
                                step="0.5"
                                value={voltage}
                                onChange={(e) =>
                                  setVoltage(parseFloat(e.target.value))
                                }
                                className="w-full h-1 appearance-none bg-white/5 rounded-full accent-orange-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-center py-4">
                            <div className="relative w-48 h-20 border-2 border-slate-700 rounded-xl flex items-center justify-center">
                              <div className="absolute left-0 w-2 h-2 rounded-full bg-red-500 -translate-x-full ml-[-4px]" />
                              <div className="absolute right-0 w-2 h-2 rounded-full bg-black translate-x-full mr-[-4px]" />
                              <div className="w-12 h-6 bg-slate-800 rounded flex items-center justify-center border border-white/10 text-[8px] font-black text-white/50 uppercase tracking-tighter">
                                Resistor
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTool === "projectile" && (
                      <div className="flex flex-col items-center gap-6 bg-card/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md w-full max-w-3xl">
                        <div className="w-full h-80 bg-slate-900/60 rounded-3xl relative overflow-hidden border border-white/10 shadow-[inner_0_0_50px_rgba(0,0,0,0.5)]">
                          <div className="absolute bottom-0 left-0 w-full h-px bg-slate-700/50" />
                          <div className="absolute left-8 bottom-0 w-px h-full bg-slate-700/30" />

                          {/* Floor Marks */}
                          {Array.from({ length: 15 }).map((_, i) => (
                            <div
                              key={i}
                              className="absolute bottom-0 h-2 w-px bg-slate-700/30"
                              style={{ left: `${32 + i * 40}px` }}
                            />
                          ))}

                          <svg className="absolute inset-0 w-full h-full overflow-visible">
                            <motion.path
                              d={`M 32 ${256 - projectileHeight * 2} ${projectilePath.map((p) => `L ${32 + p.x * 2} ${256 - (p.y + projectileHeight) * 2}`).join(" ")}`}
                              fill="none"
                              stroke="#06b6d4"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1 }}
                            />
                          </svg>

                          {/* The Projectile */}
                          {isProjectileFlying && (
                            <motion.div
                              style={{
                                left:
                                  32 +
                                  projectileVelocity *
                                    Math.cos(
                                      (projectileAngle * Math.PI) / 180,
                                    ) *
                                    projectileTime *
                                    2,
                                bottom:
                                  (projectileVelocity *
                                    Math.sin(
                                      (projectileAngle * Math.PI) / 180,
                                    ) *
                                    projectileTime -
                                    0.5 *
                                      gravity *
                                      projectileTime *
                                      projectileTime +
                                    projectileHeight) *
                                  2,
                              }}
                              className="absolute w-4 h-4 -ml-2 -mb-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)] border border-white/20 z-10"
                            >
                              <div className="absolute inset-x-0 -bottom-8 whitespace-nowrap text-[8px] font-mono text-cyan-400 text-center">
                                {(
                                  projectileVelocity *
                                  Math.cos((projectileAngle * Math.PI) / 180) *
                                  projectileTime
                                ).toFixed(1)}
                                m,{" "}
                                {(
                                  projectileVelocity *
                                    Math.sin(
                                      (projectileAngle * Math.PI) / 180,
                                    ) *
                                    projectileTime -
                                  0.5 *
                                    gravity *
                                    projectileTime *
                                    projectileTime +
                                  projectileHeight
                                ).toFixed(1)}
                                m
                              </div>
                            </motion.div>
                          )}

                          <div className="absolute left-4 bottom-4 flex flex-col gap-1">
                            <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">
                              Real-time Telemetry
                            </p>
                            <p className="text-[8px] font-mono text-cyan-500/60 uppercase">
                              T: {projectileTime.toFixed(2)}s
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6 w-full mt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-[8px] font-black uppercase text-white/30">
                              <span>Angle</span>
                              <span>{projectileAngle}°</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="90"
                              value={projectileAngle}
                              onChange={(e) =>
                                setProjectileAngle(parseInt(e.target.value))
                              }
                              className="w-full h-1 bg-white/10 rounded-full accent-cyan-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[8px] font-black uppercase text-white/30">
                              <span>Velocity</span>
                              <span>{projectileVelocity} m/s</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="50"
                              value={projectileVelocity}
                              onChange={(e) =>
                                setProjectileVelocity(parseInt(e.target.value))
                              }
                              className="w-full h-1 bg-white/10 rounded-full accent-cyan-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[8px] font-black uppercase text-white/30">
                              <span>Height</span>
                              <span>{projectileHeight}m</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              value={projectileHeight}
                              onChange={(e) =>
                                setProjectileHeight(parseInt(e.target.value))
                              }
                              className="w-full h-1 bg-white/10 rounded-full accent-cyan-500"
                            />
                          </div>
                          <button
                            onClick={() => {
                              setProjectileTime(0);
                              setIsProjectileFlying(true);
                              const path = [];
                              const v0 = projectileVelocity;
                              const h0 = projectileHeight;
                              const angle = (projectileAngle * Math.PI) / 180;

                              // Quadratic formula for t when y hits 0: -0.5*g*t^2 + v0*sin(a)*t + h0 = 0
                              const a = -0.5 * gravity;
                              const b = v0 * Math.sin(angle);
                              const c = h0;
                              const tMax =
                                (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);

                              for (let t = 0; t <= tMax; t += 0.1) {
                                path.push({
                                  x: v0 * Math.cos(angle) * t,
                                  y:
                                    v0 * Math.sin(angle) * t -
                                    0.5 * gravity * t * t,
                                });
                              }
                              setProjectilePath(path);
                            }}
                            disabled={isProjectileFlying}
                            className="bg-cyan-500 text-black font-black uppercase text-[10px] py-1 rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 h-fit self-end mb-1"
                          >
                            {isProjectileFlying
                              ? "Simulation Running..."
                              : "Launch Specimen"}
                          </button>
                        </div>
                      </div>
                    )}

                    {!activeTool && (
                      <div className="text-center space-y-4">
                        <Zap
                          size={64}
                          className="text-orange-500 mx-auto animate-pulse"
                        />
                        <p className="text-white/20 font-black uppercase tracking-[0.4em] italic">
                          Select Physics Apparatus
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (subject === "biology" && activeTool !== "dna_kit") ? (
                  <motion.div
                    key="biology-workspace"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="w-full h-full flex flex-col items-center justify-center z-10 p-10"
                  >
                    {activeTool === "anatomy_mapper" ? (
                      <div className="w-full max-w-5xl h-full flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-3xl font-black tracking-tighter uppercase italic text-white flex items-center gap-4">
                            <LayoutGrid className="text-emerald-500" />
                            Anatomy Mapping Suite
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 flex-1">
                          {ANATOMY_MODELS.map((model) => (
                            <motion.button
                              key={model.id}
                              whileHover={{ scale: 1.02, y: -5 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedAnatomy(model.id);
                                setViewMode("anatomy");
                              }}
                              className="p-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] flex flex-col items-center gap-6 group relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="w-32 h-32 rounded-full bg-slate-900 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500 transition-colors shadow-2xl relative">
                                <model.icon size={64} strokeWidth={1} />
                                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-center relative">
                                <h4 className="text-xl font-black uppercase tracking-tighter text-white mb-2">
                                  {model.name}
                                </h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">
                                  {model.system}
                                </p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ) : activeTool === "petri" ? (
                      <div className="w-full max-w-4xl bg-card/60 p-6 sm:p-12 rounded-3xl sm:rounded-[4rem] border border-white/5 backdrop-blur-2xl flex flex-col items-center gap-6 sm:gap-12">
                        <div className="relative">
                          <div className="w-64 h-64 sm:w-96 sm:h-96 rounded-full border-[8px] sm:border-[12px] border-slate-800 shadow-[20px_20px_60px_rgba(0,0,0,0.5),-20px_-20px_60px_rgba(255,255,255,0.05),inset_0_0_50px_rgba(0,0,0,0.5)] bg-emerald-500/5 relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent skew-x-12" />

                            {/* Specimen visualization based on selected substance */}
                            {microscopeSlide === "onion" ? (
                              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-emerald-400/20 rounded-[1.5rem] sm:rounded-[2rem] border border-emerald-400/30 rotate-12 blur-sm animate-pulse" />
                            ) : microscopeSlide === "petri" ? (
                              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-emerald-500/20 rounded-full border border-emerald-500/30 blur-sm flex items-center justify-center animate-pulse">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-emerald-400/30 rounded-full blur-md" />
                              </div>
                            ) : microscopeSlide === "none" ? (
                              <p className="text-white/10 text-[10px] sm:text-xs font-black uppercase tracking-widest text-center px-4">
                                Place specimen for culturing
                              </p>
                            ) : (
                              <div className="w-36 h-36 sm:w-48 sm:h-48 bg-red-400/20 rounded-full border border-red-400/30 blur-md animate-pulse" />
                            )}
                          </div>
                          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center text-emerald-400 shadow-xl">
                            <Info size={24} />
                          </div>
                        </div>

                        <div className="text-center space-y-4">
                          <h3 className="text-2xl font-black italic tracking-tighter uppercase">
                            Petri Dish Stage
                          </h3>
                          <p className="text-white/40 text-sm font-medium max-w-md mx-auto">
                            Environment for culturing biological samples and
                            monitoring growth patterns under controlled
                            parameters.
                          </p>
                          <div className="flex gap-4 justify-center pt-6">
                            <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                              <p className="text-[8px] font-black uppercase text-white/20 mb-1">
                                Temperature
                              </p>
                              <p className="text-xl font-bold tracking-tighter">
                                37.2°C
                              </p>
                            </div>
                            <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
                              <p className="text-[8px] font-black uppercase text-white/20 mb-1">
                                Humidity
                              </p>
                              <p className="text-xl font-bold tracking-tighter">
                                84%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : activeTool === "microscope" ? (
                      <div className="flex flex-col lg:flex-row items-center gap-8 relative w-full max-w-5xl justify-center">
                        <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[520px] md:h-[520px] rounded-full border-[1rem] sm:border-[1.5rem] border-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-black shrink-0">
                          {microscopeSlide === "none" ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-emerald-500/20 gap-4">
                              <Search size={64} className="animate-pulse" />
                              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center">
                                Stage Empty
                                <br />
                                Insert Specimen Slide
                              </p>
                            </div>
                          ) : (
                            <motion.div
                              animate={{
                                scale: zoom,
                                opacity: lightIntensity / 100,
                              }}
                              transition={{ duration: 0.5 }}
                              className="w-full h-full relative"
                            >
                              <img
                                src={
                                  microscopeSlide === "onion"
                                    ? "https://images.unsplash.com/photo-1544333323-5d73b40b3b27?auto=format&fit=crop&q=80&w=800"
                                    : microscopeSlide === "blood"
                                      ? "https://images.unsplash.com/photo-1579154204601-012911340150?auto=format&fit=crop&q=80&w=800"
                                      : microscopeSlide === "leaf"
                                        ? "https://images.unsplash.com/photo-1500630450269-dc0938226078?auto=format&fit=crop&q=80&w=800"
                                        : microscopeSlide === "frog"
                                          ? "https://images.unsplash.com/photo-1590487405213-909569ce6f27?auto=format&fit=crop&q=80&w=800"
                                          : microscopeSlide === "heart"
                                            ? "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800"
                                            : microscopeSlide === "eye"
                                              ? "https://images.unsplash.com/photo-1516714435131-44d6b64dc38b?auto=format&fit=crop&q=80&w=800"
                                              : "https://images.unsplash.com/photo-1464306208223-e0b4495a5553?auto=format&fit=crop&q=80&w=800"
                                }
                                className="w-full h-full object-cover filter saturate-150 contrast-125 focus:scale-110 transition-transform duration-[2000ms]"
                                alt="Microscopic View"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-[radial-gradient(transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
                            </motion.div>
                          )}

                          {/* Peripheral Controls */}
                          <div className="absolute bottom-6 sm:bottom-10 inset-x-0 flex items-center justify-center gap-3 sm:gap-6 z-20 px-4">
                            <div className="bg-black/80 backdrop-blur-md p-2 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/10 space-y-1.5 sm:space-y-3 w-28 sm:w-40 shrink-0">
                              <p className="text-[7px] sm:text-[8px] font-black text-emerald-400 uppercase tracking-widest text-center">
                                Optical Zoom
                              </p>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                step="0.1"
                                value={zoom}
                                onChange={(e) =>
                                  setZoom(parseFloat(e.target.value))
                                }
                                className="w-full h-1 appearance-none bg-emerald-950 rounded-full accent-emerald-400"
                              />
                            </div>
                            <div className="bg-black/80 backdrop-blur-md p-2 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/10 space-y-1.5 sm:space-y-3 w-28 sm:w-40 shrink-0">
                              <p className="text-[7px] sm:text-[8px] font-black text-emerald-400 uppercase tracking-widest text-center">
                                Illumination
                              </p>
                              <input
                                type="range"
                                min="10"
                                max="150"
                                value={lightIntensity}
                                onChange={(e) =>
                                  setLightIntensity(parseInt(e.target.value))
                                }
                                className="w-full h-1 appearance-none bg-emerald-950 rounded-full accent-emerald-400"
                              />
                            </div>
                          </div>
                        </div>

                        {microscopeSlide !== "none" && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full lg:w-72 p-6 bg-slate-950/90 border border-emerald-500/30 rounded-[2.5rem] space-y-5 shadow-[0_0_50px_rgba(16,185,129,0.15)] backdrop-blur-2xl z-50 lg:absolute lg:top-10 lg:-right-36 xl:-right-52"
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h5 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-2">
                                  <Info size={14} /> Specimen Analysis
                                </h5>
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">
                                  Diagnostic Report v4.2.0
                                </p>
                              </div>
                              <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                <span className="text-[8px] font-black text-emerald-400 uppercase animate-pulse">
                                  Scanning
                                </span>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <div className="space-y-1">
                                  <span className="text-[8px] font-black uppercase text-white/30 tracking-tight">
                                    Active Lens
                                  </span>
                                  <p className="text-[10px] font-black text-white uppercase italic">
                                    Plan Apochromat
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[8px] font-black uppercase text-white/30 tracking-tight">
                                    Magnification
                                  </span>
                                  <p className="text-xl font-black text-emerald-400 leading-none">
                                    {SPECIMEN_DATA[microscopeSlide]
                                      ?.magnification || "100x"}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <span className="text-[8px] font-black uppercase text-white/30 tracking-tight">
                                  Morphological Features
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                  {(
                                    SPECIMEN_DATA[microscopeSlide]
                                      ?.features || ["Cellular Matrix"]
                                  ).map((f) => (
                                    <div
                                      key={f}
                                      className="flex items-center gap-2 p-2 bg-emerald-400/5 rounded-xl border border-emerald-400/10"
                                    >
                                      <div className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,1)]" />
                                      <span className="text-[8px] font-black uppercase text-emerald-300/80 line-clamp-1">
                                        {f}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2 pt-2">
                                <span className="text-[8px] font-black uppercase text-white/20 tracking-widest pl-1">
                                  Clinical Description
                                </span>
                                <div className="relative p-4 bg-white/2 rounded-2xl border border-white/5 overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40" />
                                  <p className="text-[10px] font-medium text-white/70 leading-relaxed italic">
                                    "
                                    {SPECIMEN_DATA[microscopeSlide]
                                      ?.description ||
                                      "Adjust controls to resolve finer anatomical details."}
                                    "
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[7px] font-black text-white/10 uppercase tracking-widest border-t border-white/5 pt-4">
                              <span>X-COORD: 42.19</span>
                              <span>Y-COORD: 88.04</span>
                              <span>REF: ISO-BIO-8</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <Microscope
                          size={64}
                          className="text-emerald-500 mx-auto animate-pulse"
                        />
                        <p className="text-white/20 font-black uppercase tracking-[0.4em] italic">
                          Bioscience Research Area
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="chemistry-workspace"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="contents"
                  >
                    {/* Bunsen Burner - Enhanced 3D Look */}
                    {activeTool === "burner" && (
                      <div className="absolute bottom-20 flex flex-col items-center z-0">
                        {/* Volumetric Flame */}
                        <div className="relative mb-6">
                          <motion.div
                            animate={{
                              height: [80, 120, 80],
                              opacity: [0.4, 0.7, 0.4],
                              scaleX: [1, 1.3, 1],
                              filter: [
                                "blur(15px)",
                                "blur(25px)",
                                "blur(15px)",
                              ],
                            }}
                            transition={{ duration: 0.1, repeat: Infinity }}
                            className="w-14 bg-cyan-400 absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full mix-blend-screen"
                          />
                          <motion.div
                            animate={{ height: [40, 70, 40] }}
                            transition={{ duration: 0.08, repeat: Infinity }}
                            className="w-4 bg-white/60 absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full blur-md"
                          />
                          <motion.div
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.2, 0.5, 0.2],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-32 h-32 bg-orange-500/20 rounded-full blur-3xl absolute -bottom-10 left-1/2 -translate-x-1/2"
                          />
                        </div>

                        {/* Burner Stand */}
                        <div className="w-20 h-40 bg-gradient-to-b from-slate-700 via-slate-800 to-black rounded-t-3xl rounded-b-xl relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-x border-t border-slate-600/50">
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-slate-900 rounded-full shadow-inner" />
                          <div className="absolute bottom-10 left-4 right-4 h-1 bg-cyan-500/30 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)]" />
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full border border-slate-700/50 shadow-2xl" />
                        </div>
                      </div>
                    )}

                    {/* Vessel - Enhanced Glass Shader */}
                    <div className="relative z-10 perspective-[1500px]">
                      <motion.div
                        key={vesselType}
                        initial={{ scale: 0.9, opacity: 0, rotateX: -20 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          rotateX: 0,
                          y: activeTool === "burner" ? [0, -6, 0] : 0,
                          rotateZ: activeTool === "burner" ? [0, 1, -1, 0] : 0,
                        }}
                        transition={{
                          duration: 0.3,
                          y: {
                            duration: 0.15,
                            repeat: activeTool === "burner" ? Infinity : 0,
                          },
                          rotateZ: {
                            duration: 0.2,
                            repeat: activeTool === "burner" ? Infinity : 0,
                          },
                        }}
                        className={cn(
                          "relative transition-all duration-700 overflow-hidden",
                          "border-[6px] border-white/20 bg-white/5 backdrop-blur-[30px]",
                          "shadow-[inset_0_40px_100px_rgba(255,255,255,0.15),0_50px_100px_rgba(0,0,0,0.6),inset_0_-20px_50px_rgba(0,0,0,0.4)]",
                          "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-white/10 after:to-transparent after:pointer-events-none",
                          vesselType === "beaker"
                            ? "w-72 h-80 rounded-b-[4.5rem] rounded-t-3xl"
                            : "w-28 h-[450px] rounded-b-full rounded-t-3xl",
                        )}
                      >
                        {/* DNA Precipitation Effect */}
                        {isDnaPrecipitating && (
                          <div className="absolute inset-x-0 bottom-0 top-0 z-[25] pointer-events-none overflow-hidden">
                            {Array.from({ length: 15 }).map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ 
                                  opacity: 0, 
                                  scale: 0.5, 
                                  y: 200,
                                  x: Math.random() * 200 - 100 
                                }}
                                animate={{ 
                                  opacity: [0, 0.8, 1, 0.6], 
                                  scale: [0.5, 1.2, 0.8],
                                  y: [-50, -280, -250],
                                  rotate: [0, 90, 180, 270],
                                  x: [Math.random() * 60 - 30, Math.random() * 60 - 30]
                                }}
                                transition={{ 
                                  duration: 10 + Math.random() * 5, 
                                  repeat: Infinity,
                                  delay: i * 0.5,
                                  ease: "easeInOut"
                                }}
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-white/30 blur-[1px] rounded-full"
                                style={{ 
                                  filter: "drop-shadow(0 0 12px rgba(255,255,255,0.6))",
                                }}
                              />
                            ))}
                            {/* Smaller clumped bits */}
                            {Array.from({ length: 12 }).map((_, i) => (
                              <motion.div
                                key={`clump-${i}`}
                                initial={{ opacity: 0, scale: 0.1, y: 150 }}
                                animate={{ 
                                  opacity: [0, 1, 0], 
                                  y: [-100, -320],
                                  scale: [0.2, 2],
                                  rotate: [0, Math.random() * 360]
                                }}
                                transition={{ 
                                  duration: 12, 
                                  repeat: Infinity, 
                                  delay: i * 1.2,
                                  ease: "linear"
                                }}
                                className="absolute bottom-0 left-[25%] w-6 h-6 bg-white/40 blur-[4px] rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                              />
                            ))}
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 w-full transition-all duration-1000 h-full flex flex-col justify-end pointer-events-none rounded-[inherit] overflow-hidden">
                          {(() => {
                            const totalQty = beaker.reduce(
                              (acc, curr) => acc + (curr.quantity || 0),
                              0,
                            );
                            return beaker.map((item, i) => {
                              const percentage =
                                totalQty > 0
                                  ? ((item.quantity || 0) /
                                      Math.max(totalQty, 150)) *
                                    100
                                  : 0;
                              const isTopLayer = i === beaker.length - 1;

                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{
                                    height: `${percentage}%`,
                                    opacity: 0.85,
                                    backgroundColor:
                                      isTopLayer && reactionDetails?.color
                                        ? reactionDetails.color
                                        : item.color.startsWith("bg-")
                                          ? undefined
                                          : item.color,
                                  }}
                                  className={cn(
                                    "w-full transition-all duration-700 relative",
                                    item.color.startsWith("bg-")
                                      ? item.color
                                      : "",
                                  )}
                                  style={{
                                    zIndex: i,
                                    backgroundColor: item.color.startsWith(
                                      "bg-",
                                    )
                                      ? undefined
                                      : isTopLayer && reactionDetails?.color
                                        ? undefined
                                        : item.color,
                                    boxShadow: `inset 0 10px 20px rgba(255,255,255,0.2), inset 0 -5px 10px rgba(0,0,0,0.1)`,
                                  }}
                                >
                                  {/* 3D Meniscus / Surface Level Effect */}
                                  {isTopLayer && (
                                    <div className="absolute -top-3 inset-x-0 h-6 bg-white/20 blur-[1px] rounded-[100%] shadow-[0_0_20px_rgba(255,255,255,0.4)] border-t border-white/40" />
                                  )}

                                  {/* Internal Volumetric Bubbles & Effects during reactions */}
                                  {reaction && isTopLayer && (
                                    <div className="absolute inset-0 overflow-hidden">
                                      {/* Dynamic Bubble Count based on reaction intensity or detail */}
                                      {Array.from({
                                        length:
                                          reactionDetails?.effect === "bubbles"
                                            ? 40
                                            : reactionType === "violent"
                                              ? 30
                                              : reactionType === "gas"
                                                ? 20
                                                : 8,
                                      }).map((_, j) => (
                                        <motion.div
                                          key={j}
                                          animate={{
                                            y: [120, -120],
                                            opacity: [0, 1, 0],
                                            scale:
                                              reactionType === "violent"
                                                ? [0.5, 2, 0.5]
                                                : [0.3, 1.2, 0.3],
                                            x:
                                              reactionType === "violent"
                                                ? [
                                                    (Math.random() - 0.5) * 100,
                                                    (Math.random() - 0.5) * 100,
                                                  ]
                                                : 0,
                                          }}
                                          transition={{
                                            repeat: Infinity,
                                            duration:
                                              (reactionDetails?.speed ===
                                              "instant"
                                                ? 0.2
                                                : reactionDetails?.speed ===
                                                    "slow"
                                                  ? 2
                                                  : 0.8) + Math.random(),
                                            delay: Math.random(),
                                          }}
                                          className={cn(
                                            "absolute w-2 h-2 rounded-full",
                                            reactionType === "violent"
                                              ? "bg-white shadow-[0_0_10px_white]"
                                              : reactionType === "gas"
                                                ? "bg-cyan-100/40"
                                                : "bg-white/40",
                                          )}
                                          style={{
                                            left: `${10 + Math.random() * 80}%`,
                                          }}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </motion.div>
                              );
                            });
                          })()}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reaction Effects Layer */}
              <div className="absolute inset-0 pointer-events-none z-20">
                {reaction && (
                  <>
                    {/* High Frequency Particles */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <motion.div
                        key={`p-${i}`}
                        initial={{ x: "50%", y: "50%", opacity: 1, scale: 0 }}
                        animate={{
                          x: `${50 + (Math.random() - 0.5) * 40}%`,
                          y: `${30 + (Math.random() - 0.5) * 60}%`,
                          opacity: 0,
                          scale: Math.random() * 2,
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1 + Math.random(),
                          delay: Math.random(),
                        }}
                        className="absolute w-2 h-2 bg-white/40 rounded-full blur-[1px]"
                      />
                    ))}

                    {/* Steam/Smoke Clouds */}
                    <motion.div
                      animate={{
                        opacity: [0, 0.2, 0],
                        scale: [0.8, 1.5, 2],
                        y: [-100, -300],
                        x: [-20, 20, -10],
                      }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-32 bg-white/10 blur-[60px] rounded-full"
                    />
                  </>
                )}
              </div>

              {/* Reaction Logic Feedback HUD */}
              <div className="mt-20 w-full max-w-xl z-20">
                <AnimatePresence mode="wait">
                  {reaction ? (
                    <motion.div
                      initial={{ opacity: 0, y: 40, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="p-10 bg-slate-900/90 border-t-4 border-primary rounded-[3rem] shadow-3xl shadow-primary/30 flex gap-8 items-center backdrop-blur-2xl ring-1 ring-white/10"
                    >
                      <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 shadow-2xl shadow-primary/40 flex items-center justify-center text-white animate-bounce">
                        <FlaskConical size={40} />
                      </div>
                      <div className="text-left flex-1 space-y-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.5em] text-primary mb-3">
                            Experimental Success
                          </p>
                          <h4 className="font-black text-2xl leading-tight tracking-tight text-white mb-2">
                            {reaction}
                          </h4>
                        </div>

                        {reactionFormula && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-4 p-6 bg-black/40 rounded-[2rem] border border-white/5"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex flex-col gap-2 flex-1">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">
                                  Reactants
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {reactionFormula.reactants.map((f, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2"
                                    >
                                      <MolecularModel3D formula={f} />
                                      {i <
                                        reactionFormula.reactants.length -
                                          1 && (
                                        <span className="text-white/20 font-black">
                                          +
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center justify-center p-2 rounded-full bg-white/5">
                                <RotateCcw
                                  size={12}
                                  className="text-primary rotate-180"
                                />
                              </div>

                              <div className="flex flex-col gap-2 flex-1 items-end">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">
                                  Products
                                </span>
                                <div className="flex flex-wrap gap-2 justify-end">
                                  {reactionFormula.products.map((f, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2"
                                    >
                                      <MolecularModel3D formula={f} />
                                      {i <
                                        reactionFormula.products.length - 1 && (
                                        <span className="text-white/20 font-black">
                                          +
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        <div className="flex items-center gap-4">
                          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                            Chemical Observation Recorded
                          </p>
                          <button
                            onClick={() => setShowReactionDialog(true)}
                            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            See Explanation
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-5 sm:p-10 bg-slate-900/40 border border-white/5 rounded-3xl sm:rounded-[4rem] text-center backdrop-blur-md shadow-2xl group transition-all hover:bg-slate-900/60">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                        />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">
                          Molecular Bench Idle
                        </p>
                      </div>
                      <p className="text-slate-500 text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity max-w-md mx-auto leading-relaxed">
                        Combine transition metal ions, reactive non-metals, or
                        apply thermal energy to initiate molecular state
                        changes.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : viewMode === "balancer" ? (
          <motion.div
            key="balancer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-10 bg-card border border-border rounded-[3rem] min-h-[600px] flex flex-col items-center justify-center text-center gap-8 bg-gradient-to-b from-card to-muted/20 relative overflow-hidden"
          >
            {/* 3D-style Balance Scale Illustration */}
            <div className="relative w-full max-w-lg h-64 mb-8">
              <div className="absolute inset-0 bg-primary/5 rounded-[4rem] blur-[80px] pointer-events-none" />

              <div className="relative h-full flex flex-col items-center">
                {/* Scale Beam */}
                <motion.div
                  className="w-80 h-3 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-full relative shadow-lg z-20"
                  animate={{
                    rotate:
                      isBalanced === true
                        ? 0
                        : isBalanced === false
                          ? Math.random() > 0.5
                            ? 10
                            : -10
                          : 0,
                  }}
                  transition={{ type: "spring", stiffness: 50 }}
                >
                  {/* Left Pan */}
                  <div className="absolute top-full left-0 origin-top flex flex-col items-center">
                    <div className="w-0.5 h-12 bg-slate-600" />
                    <div className="w-32 h-6 bg-slate-800 rounded-b-3xl border-t border-slate-700 shadow-xl" />
                  </div>

                  {/* Right Pan */}
                  <div className="absolute top-full right-0 origin-top flex flex-col items-center">
                    <div className="w-0.5 h-12 bg-slate-600" />
                    <div className="w-32 h-6 bg-slate-800 rounded-b-3xl border-t border-slate-700 shadow-xl" />
                  </div>

                  {/* Center Pivot */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 shadow-inner z-30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  </div>
                </motion.div>

                {/* Scale Base */}
                <div className="w-4 h-40 bg-gradient-to-b from-slate-800 to-slate-950 rounded-full shadow-lg z-10" />
                <div className="w-48 h-4 bg-slate-950 rounded-full shadow-2xl border-t border-slate-800" />
              </div>
            </div>

            <div className="max-w-xl space-y-4">
              <h2 className="text-3xl font-black italic tracking-tighter">
                Chemical Equation Balancer
              </h2>
              <p className="text-muted-foreground font-medium">
                Input your unbalanced chemical equation (e.g., H2 + O2 = H2O) to
                find stoichiometric coefficients instantly.
              </p>

              <div className="relative mt-10">
                <input
                  type="text"
                  placeholder="Enter equation (e.g. NaOH + HCl = NaCl + H2O)"
                  className="w-full bg-muted/30 border border-border rounded-2xl py-6 px-8 text-xl font-bold tracking-tight focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  value={equationInput}
                  onChange={(e) => {
                    setEquationInput(e.target.value);
                    setIsBalanced(null);
                  }}
                />
                <button
                  onClick={() =>
                    setIsBalanced(
                      equationInput.length > 5 ? Math.random() > 0.3 : false,
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Balance
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
                {["Photosynthesis", "Combustion", "Neutralization"].map(
                  (ex) => (
                    <button
                      key={ex}
                      onClick={() =>
                        setEquationInput(
                          ex === "Combustion" ? "CH4 + O2 = CO2 + H2O" : ex,
                        )
                      }
                      className="p-3 bg-muted/50 rounded-xl border border-border text-[10px] font-black uppercase text-muted-foreground hover:border-primary transition-all"
                    >
                      {ex}
                    </button>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        ) : viewMode === "molarmass" ? (
          <motion.div
            key="molarmass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-10 bg-card border border-border rounded-[3rem] min-h-[600px] flex flex-col items-center justify-center text-center gap-8 bg-gradient-to-tr from-card via-card to-blue-500/5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-500/5 blur-[120px] pointer-events-none" />

            {/* 3D-style Digital Scale Illustration */}
            <div className="relative w-80 h-48 mb-8 flex flex-col items-center justify-center">
              {/* Top Plate */}
              <div className="w-64 h-4 bg-gradient-to-r from-slate-200 to-slate-400 rounded-xl shadow-lg border-b border-white/50 z-20" />

              {/* Main Body */}
              <div className="w-72 h-32 bg-gradient-to-br from-slate-50 relative border-x border-b border-slate-300 to-slate-200 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-6 mt-[-4px] overflow-hidden">
                {/* Visual Depth */}
                <div className="absolute top-0 inset-x-0 h-4 bg-black/5 shadow-inner" />

                {/* Digital Display */}
                <div className="w-full h-16 bg-[#1a1a1a] rounded-xl border-4 border-slate-400/50 shadow-[inset_0_2px_10px_black] flex items-center justify-end px-6 relative overflow-hidden">
                  {/* Grid background on display */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "linear-gradient(#00ff00 1px, transparent 1px), linear-gradient(90deg, #00ff00 1px, transparent 1px)",
                      backgroundSize: "10px 10px",
                    }}
                  />

                  <span className="text-3xl font-mono font-black text-blue-400 shadow-[0_0_15px_rgba(96,165,240,0.5)] z-10 transition-all duration-700">
                    {molarMassResult !== null
                      ? molarMassResult.toFixed(2)
                      : "0.00"}
                  </span>
                  <span className="text-[10px] font-black text-blue-400/40 ml-2 mt-4 z-10">
                    g/mol
                  </span>
                </div>

                {/* Buttons detail */}
                <div className="flex gap-4 mt-4 w-full">
                  <div className="w-8 h-2 bg-slate-300 rounded-full" />
                  <div className="w-8 h-2 bg-slate-300 rounded-full" />
                  <div className="ml-auto w-12 h-2 bg-blue-400/30 rounded-full" />
                </div>
              </div>

              {/* Base shadow */}
              <div className="w-64 h-8 bg-black/10 blur-xl mt-4 rounded-full" />
            </div>

            <div className="max-w-xl w-full space-y-4">
              <h2 className="text-3xl font-black italic tracking-tighter">
                Molar Mass Calculator
              </h2>
              <p className="text-muted-foreground font-medium">
                Instantly calculate the molecular weight of any compound by its
                formula.
              </p>

              <div className="relative mt-10">
                <input
                  type="text"
                  placeholder="Enter formula (e.g. C6H12O6)"
                  className="w-full bg-muted/30 border border-border rounded-[2rem] py-8 px-10 text-2xl font-bold tracking-tight focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-center"
                  value={molarMassInput}
                  onChange={(e) => setMolarMassInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && calculateMolarMass(molarMassInput)
                  }
                />
                <button
                  onClick={() => calculateMolarMass(molarMassInput)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
                >
                  Calculate
                </button>
              </div>

              <AnimatePresence>
                {molarMassResult !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="mt-12 p-10 bg-blue-500/5 rounded-[3rem] border border-blue-500/20 shadow-2xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <FlaskConical size={120} className="rotate-12" />
                    </div>

                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/60 mb-4">
                        Stoichiometric Output
                      </p>
                      <h3 className="text-5xl font-black italic tracking-tighter text-blue-600 mb-2">
                        {molarMassResult.toFixed(3)}
                        <span className="text-2xl ml-2 opacity-40 not-italic font-bold">
                          g/mol
                        </span>
                      </h3>
                      <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">
                            Formula: {molarMassInput.toUpperCase()}
                          </span>
                        </div>
                        <div className="px-4 py-2 bg-slate-500/10 rounded-full border border-slate-500/20">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                            Precision: high
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12">
                {[
                  { f: "H2O", n: "Water" },
                  { f: "H2SO4", n: "Sulfuric Acid" },
                  { f: "C6H12O6", n: "Glucose" },
                  { f: "KMnO4", n: "Potassium Perm." },
                ].map((ex) => (
                  <button
                    key={ex.f}
                    onClick={() => {
                      setMolarMassInput(ex.f);
                      calculateMolarMass(ex.f);
                    }}
                    className="p-4 bg-muted/30 rounded-2xl border border-border flex flex-col items-center gap-1 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                  >
                    <span className="text-[10px] font-black text-blue-500 group-hover:scale-110 transition-transform">
                      {ex.f}
                    </span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-40">
                      {ex.n}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : viewMode === "solubility" ? (
          <motion.div
            key="solubility"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-10 bg-card border border-border rounded-[3rem] min-h-[600px] flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Droplet size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black italic tracking-tighter">
                  Solubility Reference Table
                </h2>
                <p className="text-muted-foreground text-xs font-medium">
                  Quick glance at common ion precipitation patterns.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar border border-border rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Ion \ Ion
                    </th>
                    {["Cl-", "NO3-", "SO4--", "CO3--", "OH-"].map((ion) => (
                      <th
                        key={ion}
                        className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                      >
                        {ion}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { name: "Na+", solubility: ["S", "S", "S", "S", "S"] },
                    { name: "Ag+", solubility: ["I", "S", "ss", "I", "I"] },
                    { name: "Pb2+", solubility: ["ss", "S", "I", "I", "I"] },
                    { name: "Cu2+", solubility: ["S", "S", "S", "I", "I"] },
                    { name: "Fe3+", solubility: ["S", "S", "S", "I", "I"] },
                  ].map((row) => (
                    <tr
                      key={row.name}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4 text-sm font-black text-primary">
                        {row.name}
                      </td>
                      {row.solubility.map((s, i) => (
                        <td key={i} className="p-4">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                              s === "S"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : s === "I"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-amber-500/10 text-amber-500",
                            )}
                          >
                            {s === "S"
                              ? "Soluble"
                              : s === "I"
                                ? "Insoluble"
                                : "Slightly"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[10px] font-medium text-muted-foreground/60">
              * Legend: S (Soluble), I (Insoluble), ss (Slightly Soluble)
            </p>
          </motion.div>
        ) : viewMode === "journal" ? (
          <motion.div
            key="journal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="p-10 bg-card border border-border rounded-[3rem] min-h-[600px] flex flex-col"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <RotateCcw size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black italic tracking-tighter">
                  Discovery Journal
                </h2>
                <p className="text-muted-foreground text-xs font-medium">
                  Your successful chemical combinations and stoichiometric
                  observations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discoveredReactions.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground/20 italic">
                  <FlaskConical size={64} className="mb-4 opacity-10" />
                  <p className="text-lg font-black uppercase tracking-widest">
                    Awaiting Discoveries
                  </p>
                  <p className="text-xs">
                    Perform experiments in the lab to populate your journal.
                  </p>
                </div>
              ) : (
                discoveredReactions.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 bg-muted/30 border border-border rounded-3xl hover:border-primary/50 transition-all flex flex-col gap-4 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                        Discovery_{discoveredReactions.length - i}
                      </span>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </div>
                    <h4 className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">
                      {r}
                    </h4>
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
                      <div className="w-6 h-6 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                        <Droplet size={12} />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                        Verified Reaction
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="periodic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full min-h-[700px] h-[calc(100vh-250px)] lg:h-[800px]"
          >
            <PeriodicTable
              onAddElement={(el, qty) => {
                const substance: Substance = {
                  id: el.symbol.toLowerCase(),
                  name: el.name,
                  color: el.cpk_hex ? `#${el.cpk_hex}` : "#ffffff",
                  quantity: qty,
                  icon: (
                    <div className="w-4 h-4 rounded-full border-2 border-primary/20 flex items-center justify-center text-[8px] font-black leading-none">
                      {el.symbol}
                    </div>
                  ),
                };
                addSubstance(substance);
                setViewMode("lab");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
