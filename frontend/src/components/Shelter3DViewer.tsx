import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Box as BoxIcon, Compass } from 'lucide-react';
import type { ShelterInputs } from '../types/shelter';

interface Shelter3DViewerProps {
  inputs: ShelterInputs;
  maxIndoorTemp?: number;
}

export const Shelter3DViewer: React.FC<Shelter3DViewerProps> = ({ inputs, maxIndoorTemp = 20 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const shelterGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Simple mouse drag rotation state
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 280;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 16);
    camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Clear previous children if re-rendering
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffb74d, 1.2);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x64b5f6, 0.4);
    fillLight.position.set(-15, -10, -15);
    scene.add(fillLight);

    // 5. Grid Floor & Compass Ring
    const gridHelper = new THREE.GridHelper(30, 30, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Shelter Group
    const shelterGroup = new THREE.Group();
    scene.add(shelterGroup);
    shelterGroupRef.current = shelterGroup;

    // North Indicator Arrow on floor
    const arrowDir = new THREE.Vector3(0, 0, -1);
    const arrowOrigin = new THREE.Vector3(0, 0.05, 8);
    const arrowHelper = new THREE.ArrowHelper(arrowDir, arrowOrigin, 3, 0xef4444, 0.8, 0.5);
    scene.add(arrowHelper);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (shelterGroupRef.current && !isDragging.current) {
        shelterGroupRef.current.rotation.y += 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Mouse Interaction Handlers for rotation
    const dom = containerRef.current;
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !shelterGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      shelterGroupRef.current.rotation.y += deltaX * 0.01;
      shelterGroupRef.current.rotation.x += deltaY * 0.005;

      // Restrict pitch
      shelterGroupRef.current.rotation.x = Math.max(-0.5, Math.min(0.8, shelterGroupRef.current.rotation.x));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 280;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
    };
  }, []);

  // Update Shelter 3D geometry when inputs change
  useEffect(() => {
    if (!shelterGroupRef.current) return;
    const group = shelterGroupRef.current;
    
    // Clear old meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    const { length_m, width_m, height_m, orientation, window_wall_ratio_pct } = inputs;

    // Scale dimensions for visual rendering
    const l = length_m;
    const w = width_m;
    const h = height_m;

    // Color Tint according to max indoor temperature
    let wallColor = 0x0284c7; // default cool blue
    if (maxIndoorTemp > 26) {
      wallColor = 0xe11d48; // hot red
    } else if (maxIndoorTemp >= 18) {
      wallColor = 0x059669; // comfortable green
    } else if (maxIndoorTemp < 10) {
      wallColor = 0x0284c7; // cold ice blue
    }

    // 1. Walls Box
    const wallGeo = new THREE.BoxGeometry(l, h, w);
    const wallMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = h / 2;
    group.add(wallMesh);

    // Wall Edges
    const edges = new THREE.EdgesGeometry(wallGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    wireframe.position.y = h / 2;
    group.add(wireframe);

    // 2. Roof Sloped / Flat Cap
    const roofGeo = new THREE.BoxGeometry(l + 0.4, 0.25, w + 0.4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = h + 0.125;
    group.add(roofMesh);

    // 3. Glass Windows based on WWR
    const winRatio = Math.max(0.05, Math.min(0.5, window_wall_ratio_pct / 100));
    const winWidth = l * winRatio * 0.8;
    const winHeight = h * 0.4;
    const winGeo = new THREE.PlaneGeometry(winWidth, winHeight);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });

    // Front Window (South facing by default)
    const winFront = new THREE.Mesh(winGeo, winMat);
    winFront.position.set(0, h / 2, w / 2 + 0.02);
    group.add(winFront);

    // 4. Orientation Rotation of group
    let angle = 0;
    if (orientation === 'South') angle = 0;
    else if (orientation === 'East') angle = Math.PI / 2;
    else if (orientation === 'North') angle = Math.PI;
    else if (orientation === 'West') angle = -Math.PI / 2;

    group.rotation.y = angle;
  }, [inputs, maxIndoorTemp]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <BoxIcon className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white font-mono">3D Interactive Shelter Visualizer</h2>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-mono font-semibold bg-rose-950/60 border border-rose-900 px-2 py-0.5 rounded">
          <Compass className="w-3.5 h-3.5" />
          <span>Facing {inputs.orientation}</span>
        </div>
      </div>

      {/* 3D Canvas Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-64 rounded-lg bg-slate-950 cursor-grab active:cursor-grabbing overflow-hidden border border-slate-800 relative"
      />

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-3">
        <span>Click & drag to rotate view • Heat Tint: {maxIndoorTemp > 26 ? 'Overheating' : maxIndoorTemp >= 18 ? 'Comfortable' : 'Cold Zone'}</span>
        <span className="text-cyan-400">Dimensions: {inputs.length_m}m × {inputs.width_m}m × {inputs.height_m}m</span>
      </div>
    </div>
  );
};
