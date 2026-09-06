import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sparkles, RotateCw, RefreshCw, Eye, Info, Maximize2, Layers } from 'lucide-react';

interface AtomData {
  element: string;
  x: number;
  y: number;
  z: number;
  color: number;
  radius: number;
}

interface BondData {
  start: number;
  end: number;
}

interface MoleculeModel {
  name: string;
  formula: string;
  category: string;
  description: string;
  atoms: AtomData[];
  bonds: BondData[];
}

const ELEMENT_INFO: Record<string, { name: string; mass: string; role: string }> = {
  H: { name: 'Hydrogen', mass: '1.008 u', role: 'Terminal bonding & polarity' },
  C: { name: 'Carbon', mass: '12.011 u', role: 'Organic structural backbone' },
  N: { name: 'Nitrogen', mass: '14.007 u', role: 'Base pairing & functional groups' },
  O: { name: 'Oxygen', mass: '15.999 u', role: 'Carbonyl & hydroxyl reactive sites' },
  P: { name: 'Phosphorus', mass: '30.974 u', role: 'Phosphate ester nucleic link' },
  S: { name: 'Sulfur', mass: '32.06 u', role: 'Disulfide bridges' },
};

const COLORS: Record<string, number> = {
  H: 0xf8fafc,  // White
  C: 0x334155,  // Slate / Dark Gray
  N: 0x3b82f6,  // Royal Blue
  O: 0xef4444,  // Red
  P: 0xf97316,  // Vibrant Orange
  S: 0xeab308,  // Gold Yellow
};

const RADIUS: Record<string, number> = {
  H: 0.38,
  C: 0.58,
  N: 0.54,
  O: 0.52,
  P: 0.68,
  S: 0.68,
};

// Generate Buckyball C60
function generateBuckyball(): MoleculeModel {
  const phi = (1 + Math.sqrt(5)) / 2;
  const rawCoords: [number, number, number][] = [];

  const addPermutations = (a: number, b: number, c: number) => {
    const signs = [-1, 1];
    for (const s1 of signs) {
      for (const s2 of signs) {
        for (const s3 of signs) {
          rawCoords.push([a * s1, b * s2, c * s3]);
        }
      }
    }
  };

  addPermutations(0, 1, 3 * phi);
  addPermutations(2, 1 + 2 * phi, phi);
  addPermutations(1, 2 + phi, 2 * phi);

  const scale = 1.25;
  const atoms: AtomData[] = rawCoords.map(([x, y, z]) => ({
    element: 'C',
    x: x * scale,
    y: y * scale,
    z: z * scale,
    color: COLORS.C,
    radius: RADIUS.C,
  }));

  const bonds: BondData[] = [];
  const cutoffSq = (2.45 * scale) ** 2;
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const dx = atoms[i].x - atoms[j].x;
      const dy = atoms[i].y - atoms[j].y;
      const dz = atoms[i].z - atoms[j].z;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < cutoffSq) {
        bonds.push({ start: i, end: j });
      }
    }
  }

  return {
    name: 'Buckyball',
    formula: 'C₆₀',
    category: 'Nanomaterials',
    description: 'Fullerene hollow carbon sphere composed of 20 hexagons and 12 pentagons.',
    atoms,
    bonds,
  };
}

// Generate DNA Double Helix segment
function generateDNA(): MoleculeModel {
  const atoms: AtomData[] = [];
  const bonds: BondData[] = [];
  const turns = 2.5;
  const pointsPerTurn = 14;
  const totalPoints = Math.floor(turns * pointsPerTurn);
  const radius = 4.8;
  const heightStep = 0.85;

  for (let i = 0; i < totalPoints; i++) {
    const angle = (i / pointsPerTurn) * Math.PI * 2;
    const z = (i - totalPoints / 2) * heightStep;

    const x1 = Math.cos(angle) * radius;
    const y1 = Math.sin(angle) * radius;
    atoms.push({ element: 'P', x: x1, y: y1, z, color: COLORS.P, radius: RADIUS.P });
    const p1Idx = atoms.length - 1;

    const x2 = Math.cos(angle + Math.PI) * radius;
    const y2 = Math.sin(angle + Math.PI) * radius;
    atoms.push({ element: 'O', x: x2, y: y2, z, color: COLORS.O, radius: RADIUS.O });
    const p2Idx = atoms.length - 1;

    const midX1 = x1 * 0.42;
    const midY1 = y1 * 0.42;
    atoms.push({ element: 'N', x: midX1, y: midY1, z, color: COLORS.N, radius: RADIUS.N });
    const n1Idx = atoms.length - 1;

    const midX2 = x2 * 0.42;
    const midY2 = y2 * 0.42;
    atoms.push({ element: 'C', x: midX2, y: midY2, z, color: COLORS.C, radius: RADIUS.C });
    const n2Idx = atoms.length - 1;

    bonds.push({ start: p1Idx, end: n1Idx });
    bonds.push({ start: p2Idx, end: n2Idx });
    bonds.push({ start: n1Idx, end: n2Idx });

    if (i > 0) {
      bonds.push({ start: p1Idx - 4, end: p1Idx });
      bonds.push({ start: p2Idx - 4, end: p2Idx });
    }
  }

  return {
    name: 'DNA Double Helix',
    formula: '(C₁₀H₁₃N₅O₆P)ₙ',
    category: 'Genetics',
    description: 'Anti-parallel double-helical polymer carrying genetic information.',
    atoms,
    bonds,
  };
}

const MOLECULES_CATALOG: MoleculeModel[] = [
  {
    name: 'Caffeine',
    formula: 'C₈H₁₀N₄O₂',
    category: 'Neuro-stimulant',
    description: 'Central nervous system stimulant that blocks adenosine receptors.',
    atoms: [
      { element: 'N', x: -1.2, y: 1.1, z: 0.0, color: COLORS.N, radius: RADIUS.N },
      { element: 'C', x: -0.1, y: 1.8, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'O', x: -0.1, y: 3.0, z: 0.0, color: COLORS.O, radius: RADIUS.O },
      { element: 'N', x: 1.1, y: 1.1, z: 0.0, color: COLORS.N, radius: RADIUS.N },
      { element: 'C', x: 1.2, y: -0.3, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'O', x: 2.3, y: -0.8, z: 0.0, color: COLORS.O, radius: RADIUS.O },
      { element: 'N', x: 0.0, y: -1.0, z: 0.0, color: COLORS.N, radius: RADIUS.N },
      { element: 'C', x: -1.2, y: -0.3, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'C', x: -2.3, y: -1.0, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'N', x: -1.9, y: -2.3, z: 0.0, color: COLORS.N, radius: RADIUS.N },
      { element: 'C', x: -0.6, y: -2.3, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'C', x: -2.5, y: 1.8, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'C', x: 2.3, y: 1.8, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'H', x: -3.2, y: 1.4, z: 0.7, color: COLORS.H, radius: RADIUS.H },
      { element: 'H', x: -2.4, y: 2.8, z: 0.2, color: COLORS.H, radius: RADIUS.H },
      { element: 'H', x: 2.2, y: 2.8, z: 0.2, color: COLORS.H, radius: RADIUS.H },
      { element: 'H', x: 3.1, y: 1.4, z: -0.5, color: COLORS.H, radius: RADIUS.H },
      { element: 'H', x: -3.3, y: -0.6, z: 0.0, color: COLORS.H, radius: RADIUS.H },
    ],
    bonds: [
      { start: 0, end: 1 }, { start: 1, end: 2 }, { start: 1, end: 3 },
      { start: 3, end: 4 }, { start: 4, end: 5 }, { start: 4, end: 6 },
      { start: 6, end: 7 }, { start: 7, end: 0 }, { start: 7, end: 8 },
      { start: 8, end: 9 }, { start: 9, end: 10 }, { start: 10, end: 6 },
      { start: 0, end: 11 }, { start: 3, end: 12 }, { start: 11, end: 13 },
      { start: 11, end: 14 }, { start: 12, end: 15 }, { start: 12, end: 16 },
      { start: 8, end: 17 }
    ]
  },
  {
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    category: 'Biochemistry',
    description: 'Simple alcohol compound produced by fermentation.',
    atoms: [
      { element: 'C', x: -1.2, y: 0.0, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'C', x: 0.3, y: 0.0, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'O', x: 1.0, y: 1.2, z: 0.0, color: COLORS.O, radius: RADIUS.O },
      { element: 'H', x: 1.9, y: 1.1, z: 0.0, color: COLORS.H, radius: RADIUS.H },
      { element: 'H', x: -1.6, y: 0.5, z: 0.9, color: COLORS.H, radius: RADIUS.H },
      { element: 'H', x: -1.6, y: 0.5, z: -0.9, color: COLORS.H, radius: RADIUS.H },
      { element: 'H', x: -1.6, y: -1.0, z: 0.0, color: COLORS.H, radius: RADIUS.H },
      { element: 'H', x: 0.7, y: -0.5, z: 0.9, color: COLORS.H, radius: RADIUS.H },
      { element: 'H', x: 0.7, y: -0.5, z: -0.9, color: COLORS.H, radius: RADIUS.H },
    ],
    bonds: [
      { start: 0, end: 1 }, { start: 1, end: 2 }, { start: 2, end: 3 },
      { start: 0, end: 4 }, { start: 0, end: 5 }, { start: 0, end: 6 },
      { start: 1, end: 7 }, { start: 1, end: 8 }
    ]
  },
  {
    name: 'Aspirin',
    formula: 'C₉H₈O₄',
    category: 'Pharmacology',
    description: 'Acetylsalicylic acid used to treat pain, fever, or inflammation.',
    atoms: [
      { element: 'C', x: 0.0, y: 1.4, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'C', x: 1.2, y: 0.7, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'C', x: 1.2, y: -0.7, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'C', x: 0.0, y: -1.4, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'C', x: -1.2, y: -0.7, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'C', x: -1.2, y: 0.7, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'C', x: 2.5, y: 1.4, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'O', x: 3.5, y: 0.8, z: 0.0, color: COLORS.O, radius: RADIUS.O },
      { element: 'O', x: 2.5, y: 2.7, z: 0.0, color: COLORS.O, radius: RADIUS.O },
      { element: 'H', x: 4.3, y: 1.3, z: 0.0, color: COLORS.H, radius: RADIUS.H },
      { element: 'O', x: -2.4, y: 1.4, z: 0.0, color: COLORS.O, radius: RADIUS.O },
      { element: 'C', x: -3.5, y: 0.7, z: 0.0, color: COLORS.C, radius: RADIUS.C },
      { element: 'O', x: -3.6, y: -0.5, z: 0.0, color: COLORS.O, radius: RADIUS.O },
      { element: 'C', x: -4.7, y: 1.6, z: 0.0, color: COLORS.C, radius: RADIUS.C },
    ],
    bonds: [
      { start: 0, end: 1 }, { start: 1, end: 2 }, { start: 2, end: 3 },
      { start: 3, end: 4 }, { start: 4, end: 5 }, { start: 5, end: 0 },
      { start: 1, end: 6 }, { start: 6, end: 7 }, { start: 6, end: 8 },
      { start: 7, end: 9 }, { start: 5, end: 10 }, { start: 10, end: 11 },
      { start: 11, end: 12 }, { start: 11, end: 13 }
    ]
  },
  generateBuckyball(),
  generateDNA()
];

export const Molecule3DViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedMoleculeIndex, setSelectedMoleculeIndex] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [renderMode, setRenderMode] = useState<'ball_stick' | 'space_fill' | 'wireframe'>('ball_stick');
  const [hoveredAtomInfo, setHoveredAtomInfo] = useState<{ element: string; name: string; mass: string; role: string } | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const currentMolecule = MOLECULES_CATALOG[selectedMoleculeIndex];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. OrbitControls for Buttery Smooth Drag/Rotate/Zoom/Pan
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 1.2;
    controls.zoomSpeed = 1.2;
    controls.autoRotate = isAutoRotating;
    controls.autoRotateSpeed = 2.2;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(12, 12, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 1.8);
    dirLight2.position.set(-12, -12, -8);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xc084fc, 1.5, 60);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // 6. Root Molecule Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // 7. Raycaster Mouse move listener for Atom Hover Tooltips
    const handlePointerMove = (event: PointerEvent) => {
      if (!container || !cameraRef.current || !rootGroupRef.current) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(rootGroupRef.current.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.element) {
          const el = hit.userData.element;
          const info = ELEMENT_INFO[el] || { name: el, mass: 'N/A', role: 'Molecular constituent' };
          setHoveredAtomInfo({ element: el, name: info.name, mass: info.mass, role: info.role });
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredAtomInfo(null);
      container.style.cursor = 'grab';
    };

    container.addEventListener('pointermove', handlePointerMove);

    // 8. Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.autoRotate = isAutoRotating;
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      controls.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Re-build 3D Molecule Mesh when selected molecule or render mode changes
  useEffect(() => {
    const root = rootGroupRef.current;
    if (!root) return;

    while (root.children.length > 0) {
      const child = root.children[0];
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      root.remove(child);
    }

    const mol = MOLECULES_CATALOG[selectedMoleculeIndex];
    if (!mol) return;

    const center = new THREE.Vector3();
    mol.atoms.forEach(atom => center.add(new THREE.Vector3(atom.x, atom.y, atom.z)));
    center.divideScalar(mol.atoms.length);

    const sphereGeometry = new THREE.IcosahedronGeometry(1, 4);
    const cylinderGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1, 16);

    const scaleMult = renderMode === 'space_fill' ? 2.3 : 1.3;

    // Render Atoms
    mol.atoms.forEach((atom) => {
      const material = new THREE.MeshPhongMaterial({
        color: atom.color,
        shininess: 100,
        specular: 0x555555,
        wireframe: renderMode === 'wireframe',
      });

      const mesh = new THREE.Mesh(sphereGeometry, material);
      mesh.position.set(atom.x - center.x, atom.y - center.y, atom.z - center.z);
      mesh.scale.setScalar(atom.radius * scaleMult);
      mesh.userData = { element: atom.element };

      root.add(mesh);
    });

    // Render Bonds (if not space filling mode)
    if (renderMode !== 'space_fill') {
      mol.bonds.forEach((bond) => {
        const atomA = mol.atoms[bond.start];
        const atomB = mol.atoms[bond.end];
        if (!atomA || !atomB) return;

        const posA = new THREE.Vector3(atomA.x - center.x, atomA.y - center.y, atomA.z - center.z);
        const posB = new THREE.Vector3(atomB.x - center.x, atomB.y - center.y, atomB.z - center.z);

        const distance = posA.distanceTo(posB);
        const midPoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);

        const bondMaterial = new THREE.MeshPhongMaterial({
          color: renderMode === 'wireframe' ? 0x818cf8 : 0xe2e8f0,
          shininess: 60,
          wireframe: renderMode === 'wireframe',
        });

        const bondMesh = new THREE.Mesh(cylinderGeometry, bondMaterial);
        bondMesh.position.copy(midPoint);
        bondMesh.scale.set(1, distance, 1);

        const orientation = new THREE.Matrix4();
        orientation.lookAt(posA, posB, new THREE.Vector3(0, 1, 0));

        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationX(Math.PI / 2);
        orientation.multiply(rotationMatrix);

        bondMesh.setRotationFromMatrix(orientation);
        root.add(bondMesh);
      });
    }

    if (cameraRef.current && controlsRef.current) {
      if (mol.name.includes('DNA')) {
        cameraRef.current.position.set(0, 0, 24);
      } else if (mol.name.includes('Buckyball')) {
        cameraRef.current.position.set(0, 0, 22);
      } else {
        cameraRef.current.position.set(0, 0, 15);
      }
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [selectedMoleculeIndex, renderMode]);

  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.reset();
      cameraRef.current.position.set(0, 0, 16);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-5 sm:p-7 shadow-xl transition-all duration-300">
      {/* Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                {currentMolecule.name}
              </span>
              <span className="rounded-lg bg-indigo-100 dark:bg-indigo-950/80 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                {currentMolecule.formula}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
              {currentMolecule.description}
            </span>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Render Mode Toggle */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => setRenderMode('ball_stick')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                renderMode === 'ball_stick'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Ball & Stick
            </button>
            <button
              onClick={() => setRenderMode('space_fill')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                renderMode === 'space_fill'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Space Filling
            </button>
            <button
              onClick={() => setRenderMode('wireframe')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                renderMode === 'wireframe'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Wireframe
            </button>
          </div>

          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
              isAutoRotating
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <RotateCw className={`h-3.5 w-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
            <span>{isAutoRotating ? 'Rotating' : 'Paused'}</span>
          </button>

          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Reset Camera View"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-[340px] sm:h-[400px] rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden cursor-grab active:cursor-grabbing border border-slate-800/80 shadow-inner flex items-center justify-center"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/15 via-transparent to-transparent" />

        {/* Hover Atom Info Tooltip */}
        {hoveredAtomInfo && (
          <div className="pointer-events-none absolute top-4 left-4 z-20 flex items-center gap-3 rounded-2xl bg-slate-900/90 backdrop-blur-md p-3 text-white border border-indigo-500/40 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-extrabold">
              {hoveredAtomInfo.element}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{hoveredAtomInfo.name}</span>
                <span className="text-[10px] font-medium text-indigo-300 bg-indigo-950 px-1.5 py-0.5 rounded-md border border-indigo-800">
                  {hoveredAtomInfo.mass}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block">{hoveredAtomInfo.role}</span>
            </div>
          </div>
        )}

        {/* Controls Overlay Hint */}
        <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-slate-900/85 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-slate-300 border border-slate-700/60 shadow-md">
          <Eye className="h-3.5 w-3.5 text-indigo-400" />
          <span>Left-Click Drag: Rotate • Scroll: Zoom • Right-Click: Pan</span>
        </div>
      </div>

      {/* Molecule Selector Pills */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-2">
            Preset Models:
          </span>
          {MOLECULES_CATALOG.map((mol, idx) => (
            <button
              key={mol.name}
              onClick={() => setSelectedMoleculeIndex(idx)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedMoleculeIndex === idx
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-105 ring-2 ring-indigo-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {mol.name} <span className="opacity-80 font-semibold text-[10px] ml-1">({mol.formula})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
