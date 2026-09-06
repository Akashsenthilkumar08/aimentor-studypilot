import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sparkles, RotateCw, Type, Maximize2, Palette } from 'lucide-react';

interface ThreeTextTitleProps {
  initialText?: string;
}

const COLOR_THEMES = [
  { name: 'Indigo Glow', hex: 0x6366f1, contour: 0x38bdf8 },
  { name: 'Purple Neon', hex: 0xa855f7, contour: 0xf472b6 },
  { name: 'Emerald Cyan', hex: 0x10b981, contour: 0x38bdf8 },
  { name: 'Rose Sunset', hex: 0xf43f5e, contour: 0xfbbf24 },
];

export const ThreeTextTitle: React.FC<ThreeTextTitleProps> = ({
  initialText = 'StudyPilot AI'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [textInput, setTextInput] = useState<string>(initialText);
  const [activeText, setActiveText] = useState<string>(initialText);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [themeIndex, setThemeIndex] = useState<number>(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const fontRef = useRef<any>(null);

  const presets = [
    'StudyPilot AI',
    'Adaptive Learning',
    'Feynman Teach-Back',
    'Cognitive Engine'
  ];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 320;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    camera.position.set(0, 0, 420);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 1.2;
    controls.zoomSpeed = 1.2;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x818cf8, 2.8);
    dirLight.position.set(100, 100, 200);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xc084fc, 2.2, 800);
    pointLight.position.set(0, 0, 250);
    scene.add(pointLight);

    // 6. Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // 7. Background Particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 140;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 900;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 3.5,
      color: 0x818cf8,
      transparent: true,
      opacity: 0.65,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 8. Load Font
    const fontLoader = new FontLoader();
    fontLoader.load(
      'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
      (font) => {
        fontRef.current = font;
        render3DText(activeText, font, COLOR_THEMES[themeIndex]);
      },
      undefined,
      (err) => {
        console.error('Font load error:', err);
      }
    );

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (controlsRef.current) {
        controlsRef.current.autoRotate = isRotating;
        controlsRef.current.update();
      }

      particles.rotation.y = time * 0.04;

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
      controls.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const render3DText = (textStr: string, font: any, theme: { hex: number; contour: number }) => {
    const root = rootGroupRef.current;
    if (!root || !font) return;

    while (root.children.length > 0) {
      const child = root.children[0];
      if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Group) {
        if ('geometry' in child && child.geometry) (child.geometry as any).dispose();
        root.remove(child);
      } else {
        root.remove(child);
      }
    }

    const size = 64;
    const shapes = font.generateShapes(textStr, size);
    const geometry = new THREE.ShapeGeometry(shapes);
    geometry.computeBoundingBox();

    if (!geometry.boundingBox) return;
    const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    const yMid = -0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);
    geometry.translate(xMid, yMid, 0);

    // 1. Semi-transparent Mesh Fill
    const matMesh = new THREE.MeshPhongMaterial({
      color: theme.hex,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      shininess: 120,
      specular: 0xffffff,
    });

    const textMesh = new THREE.Mesh(geometry, matMesh);
    textMesh.position.z = -10;
    root.add(textMesh);

    // 2. Line Contour Outlines
    const holeShapes: any[] = [];
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      if (shape.holes && shape.holes.length > 0) {
        for (let j = 0; j < shape.holes.length; j++) {
          holeShapes.push(shape.holes[j]);
        }
      }
    }
    const allShapes = [...shapes, ...holeShapes];

    const matLine = new THREE.LineBasicMaterial({
      color: theme.contour,
      linewidth: 2,
      side: THREE.DoubleSide,
    });

    const lineTextGroup = new THREE.Group();

    for (let i = 0; i < allShapes.length; i++) {
      const shape = allShapes[i];
      const points = shape.getPoints();
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      lineGeo.translate(xMid, yMid, 0);

      const lineMesh = new THREE.Line(lineGeo, matLine);
      lineTextGroup.add(lineMesh);
    }

    root.add(lineTextGroup);

    if (cameraRef.current && controlsRef.current) {
      const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      const targetZ = Math.max(360, textWidth * 0.95);
      cameraRef.current.position.set(0, 0, targetZ);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    if (fontRef.current) {
      render3DText(activeText, fontRef.current, COLOR_THEMES[themeIndex]);
    }
  }, [activeText, themeIndex]);

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      setActiveText(textInput.trim());
    }
  };

  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.reset();
      cameraRef.current.position.set(0, 0, 400);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-5 sm:p-7 shadow-xl transition-all duration-300">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md">
            <Type className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
              3D WebGL Text Geometry Visualizer
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Interactive 3D shape contours & mesh rendering with Three.js
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Color Theme Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <Palette className="h-3.5 w-3.5 text-slate-500 ml-1.5" />
            {COLOR_THEMES.map((theme, idx) => (
              <button
                key={theme.name}
                onClick={() => setThemeIndex(idx)}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  themeIndex === idx
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {theme.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
              isRotating
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <RotateCw className={`h-3.5 w-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>{isRotating ? 'Rotating' : 'Paused'}</span>
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

      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-[260px] sm:h-[320px] rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden cursor-grab active:cursor-grabbing border border-slate-800/80 shadow-inner flex items-center justify-center"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />

        {/* Drag Hint */}
        <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-slate-900/85 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-slate-300 border border-slate-700/60 shadow-md">
          <span>Left-Click Drag: 360° Rotate • Scroll: Zoom • Right-Click: Pan</span>
        </div>
      </div>

      {/* Interactive Custom Text Input & Presets */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <form onSubmit={handleSubmitText} className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type custom text to generate 3D model..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:from-indigo-500 hover:to-cyan-500 transition-all cursor-pointer"
          >
            Render 3D Text
          </button>
        </form>

        {/* Preset Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-2">
            Presets:
          </span>
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setTextInput(preset);
                setActiveText(preset);
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeText === preset
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md scale-105 ring-2 ring-indigo-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
