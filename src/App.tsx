/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, MouseEvent, PointerEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EyeballData, EyeStyle, GazeMode } from './types';
import Eyeball from './components/Eyeball';
import { EYE_PRESETS, synth, getRandomLabel } from './utils';
import {
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Moon,
  Sun,
  MousePointer,
  Activity,
  Shuffle,
  Volume,
  Tv,
  EyeClosed,
  Zap
} from 'lucide-react';

export default function App() {
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Core Eyeball State
  const [eyeballs, setEyeballs] = useState<EyeballData[]>([
    {
      id: 'eye-1',
      x: 42,
      y: 45,
      size: 110,
      style: 'anime',
      irisColor: '#ec4899',
      pupilColor: '#1e1b4b',
      expression: 'normal',
      blinkState: 'open',
      tension: 0.12,
      label: 'Sakura'
    },
    {
      id: 'eye-2',
      x: 58,
      y: 45,
      size: 110,
      style: 'anime',
      irisColor: '#3b82f6',
      pupilColor: '#1e1b4b',
      expression: 'normal',
      blinkState: 'open',
      tension: 0.12,
      label: 'Sora'
    }
  ]);

  // Selected config values for the next eyeball placed
  const [nextStyle, setNextStyle] = useState<EyeStyle>('classic');
  const [nextIrisColor, setNextIrisColor] = useState<string>('#059669');
  const [nextSize, setNextSize] = useState<number>(90);

  // Global settings
  const [gazeMode, setGazeMode] = useState<GazeMode>('normal');
  const [globalSizeMultiplier, setGlobalSizeMultiplier] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [crazyEyes, setCrazyEyes] = useState<boolean>(false);
  const [isWorkspaceDark, setIsWorkspaceDark] = useState<boolean>(true);

  // Real-time mouse stats to feed stats HUD
  const [hudCoords, setHudCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lastBlinkTime, setLastBlinkTime] = useState<string>('N/A');

  // Sync sound settings with Audio engine
  useEffect(() => {
    synth.enabled = soundEnabled;
  }, [soundEnabled]);

  // Global tracker for coordinates inside the workspace
  const handleWorkspacePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setHudCoords({ x, y });
  };

  // Add a custom eyeball when clicking on empty workspace space
  const handleAddEyeball = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel coordinate to viewport container percentage (0 to 100)
    const relX = Math.min(96, Math.max(4, (clickX / rect.width) * 100));
    const relY = Math.min(94, Math.max(6, (clickY / rect.height) * 100));

    const newId = `eye-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const randomLabel = getRandomLabel();

    const selectedPreset = EYE_PRESETS.find(p => p.id === nextStyle);
    const resolvedColor = nextStyle === 'classic' && nextIrisColor === '#059669' 
      ? '#000000' 
      : nextIrisColor;

    const newEye: EyeballData = {
      id: newId,
      x: relX,
      y: relY,
      size: nextSize,
      style: nextStyle,
      irisColor: resolvedColor,
      pupilColor: selectedPreset?.defaultPupilColor || '#000000',
      expression: 'normal',
      blinkState: 'open',
      tension: 0.12 + Math.random() * 0.08,
      label: randomLabel
    };

    setEyeballs(prev => [...prev, newEye]);
    synth.playPop();
  };

  const handleRemoveEye = (id: string) => {
    setEyeballs(prev => prev.filter(eye => eye.id !== id));
  };

  const handleUpdateEye = (id: string, updates: Partial<EyeballData>) => {
    setEyeballs(prev => prev.map(eye => eye.id === id ? { ...eye, ...updates } : eye));
  };

  // Clear workspace
  const handleResetAll = () => {
    synth.playSweep();
    setEyeballs([]);
  };

  // Preset configuration setups
  const applyPresetTemplate = (preset: 'binary-swarm' | 'oculon' | 'cyber-nest' | 'watcher-pair') => {
    synth.playWink();
    
    if (preset === 'watcher-pair') {
      setEyeballs([
        {
          id: 'watch-1',
          x: 40,
          y: 45,
          size: 140,
          style: 'classic',
          irisColor: '#D97706',
          pupilColor: '#000000',
          expression: 'normal',
          blinkState: 'open',
          tension: 0.14,
          label: 'Gorgon'
        },
        {
          id: 'watch-2',
          x: 60,
          y: 45,
          size: 140,
          style: 'classic',
          irisColor: '#D97706',
          pupilColor: '#000000',
          expression: 'normal',
          blinkState: 'open',
          tension: 0.14,
          label: 'Lilith'
        }
      ]);
    } else if (preset === 'oculon') {
      // Large scattered swarm of tiny reactive eyes
      const swarm: EyeballData[] = Array.from({ length: 14 }).map((_, idx) => {
        const styles: EyeStyle[] = ['classic', 'anime', 'reptile', 'clockwork'];
        const chosenStyle = styles[Math.floor(Math.random() * styles.length)];
        const presetObj = EYE_PRESETS.find(p => p.id === chosenStyle)!;
        const color = presetObj.colors[Math.floor(Math.random() * presetObj.colors.length)];
        
        return {
          id: `swarm-${idx}`,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
          size: 45 + Math.random() * 45,
          style: chosenStyle,
          irisColor: color,
          pupilColor: presetObj.defaultPupilColor,
          expression: Math.random() < 0.3 ? 'sleepy' : 'normal',
          blinkState: 'open',
          tension: 0.08 + Math.random() * 0.15,
          label: getRandomLabel()
        };
      });
      setEyeballs(swarm);
    } else if (preset === 'cyber-nest') {
      // Hex/digital glowing cybernetic surveillance array
      setEyeballs([
        { id: 'cy-1', x: 25, y: 25, size: 75, style: 'cybernet', irisColor: '#06b6d4', pupilColor: '#000000', expression: 'normal', blinkState: 'open', tension: 0.2, label: 'Camera Alpha' },
        { id: 'cy-2', x: 75, y: 25, size: 75, style: 'cybernet', irisColor: '#06b6d4', pupilColor: '#000000', expression: 'normal', blinkState: 'open', tension: 0.2, label: 'Camera Beta' },
        { id: 'cy-3', x: 50, y: 50, size: 120, style: 'cybernet', irisColor: '#ec4899', pupilColor: '#000000', expression: 'shocked', blinkState: 'open', tension: 0.25, label: 'Mainframe Gaze' },
        { id: 'cy-4', x: 25, y: 75, size: 75, style: 'cybernet', irisColor: '#06b6d4', pupilColor: '#000000', expression: 'normal', blinkState: 'open', tension: 0.2, label: 'Camera Gamma' },
        { id: 'cy-5', x: 75, y: 75, size: 75, style: 'cybernet', irisColor: '#06b6d4', pupilColor: '#000000', expression: 'normal', blinkState: 'open', tension: 0.2, label: 'Camera Delta' }
      ]);
    } else if (preset === 'binary-swarm') {
      // Chaos mesh
      const mix: EyeballData[] = Array.from({ length: 18 }).map((_, idx) => {
        const styles: EyeStyle[] = ['reptile', 'clockwork'];
        const chosenStyle = styles[Math.floor(Math.random() * styles.length)];
        const presetObj = EYE_PRESETS.find(p => p.id === chosenStyle)!;
        const color = presetObj.colors[Math.floor(Math.random() * presetObj.colors.length)];
        return {
          id: `mix-${idx}`,
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 80,
          size: 60 + Math.random() * 60,
          style: chosenStyle,
          irisColor: color,
          pupilColor: presetObj.defaultPupilColor,
          expression: 'normal',
          blinkState: 'open',
          tension: 0.15,
          label: getRandomLabel()
        };
      });
      setEyeballs(mix);
    }
  };

  // Mass Trigger Wink
  const handleMassWink = () => {
    synth.playPop();
    setLastBlinkTime(new Date().toLocaleTimeString());
    setEyeballs(prev => prev.map(eye => ({ ...eye, blinkState: 'winking' })));
    setTimeout(() => {
      setEyeballs(prev => prev.map(eye => ({ ...eye, blinkState: 'open' })));
    }, 280);
  };

  // Sleep/Awake toggle
  const handleToggleSleep = () => {
    synth.playWink();
    const isAnySleeping = eyeballs.some(e => e.blinkState === 'closed');
    setEyeballs(prev => prev.map(eye => ({
      ...eye,
      blinkState: isAnySleeping ? 'open' : 'closed',
      expression: isAnySleeping ? 'normal' : 'sleepy'
    })));
  };

  // Sclera expression override
  const handleMassExpression = (expression: 'normal' | 'shocked' | 'sleepy' | 'giddy') => {
    synth.playSquish();
    setEyeballs(prev => prev.map(eye => ({ ...eye, expression })));
  };

  // Scramble coordinates to have fun movement
  const handleScrambleAll = () => {
    synth.playTick();
    setEyeballs(prev => prev.map(eye => ({
      ...eye,
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70
    })));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans flex flex-col relative overflow-hidden antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Mesh Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="h-20 shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between px-10 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Iris Tracker</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">Precision Optic Engine v4.2</p>
          </div>
        </div>

        {/* Global Control Toggles */}
        <div className="flex items-center gap-4">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                setTimeout(() => synth.playTick(), 50);
              }
            }}
            className={`cursor-pointer px-4 py-2 rounded-full border font-mono text-xs flex items-center gap-2 transition-all duration-300 ${
              soundEnabled
                ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            {soundEnabled ? 'BOUND SOUND ON' : 'SOUND MUTED'}
          </button>

          {/* Sclera light/dark contrast */}
          <button
            onClick={() => setIsWorkspaceDark(!isWorkspaceDark)}
            className="cursor-pointer bg-white/5 hover:bg-white/15 border border-white/10 p-2.5 rounded-full text-slate-300 transition-all duration-300 shadow-md"
            title="Toggle workspace atmosphere contrast"
          >
            {isWorkspaceDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      {/* Primary Workspace Mesh */}
      <main className="flex-1 flex flex-col lg:flex-row p-8 gap-8 overflow-hidden z-10">
        
        {/* Play Space Canvas Zone */}
        <div className="flex-1 flex flex-col min-h-[500px] relative overflow-hidden bg-black/40 backdrop-blur-md border border-white/5 rounded-[3rem] shadow-2xl">
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          
          {/* Crosshair UI */}
          <div className="absolute w-full h-[1px] bg-white/5 top-1/2 pointer-events-none" />
          <div className="absolute h-full w-[1px] bg-white/5 left-1/2 pointer-events-none" />

          {/* Atmosphere Grid Header Indicator */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur pointer-events-none shadow-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase font-semibold">
              Sandbox Area • Click space to plant eyes
            </span>
          </div>

          {/* Interactive sandbox */}
          <div
            ref={workspaceRef}
            onClick={handleAddEyeball}
            onPointerMove={handleWorkspacePointerMove}
            className={`flex-1 relative transition-colors duration-500 overflow-hidden cursor-crosshair select-none ${
              isWorkspaceDark 
                ? 'bg-transparent' 
                : 'bg-stone-300/20'
            }`}
          >
            {/* Visual Instruction Banner */}
            {eyeballs.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/5 border border-white/10 rounded-[2rem] p-8 max-w-sm shadow-2xl backdrop-blur-xl"
                >
                  <Eye className="w-12 h-12 text-indigo-400 mx-auto mb-4 animate-[pulse_2s_infinite]" />
                  <h3 className="text-xs font-bold text-white font-mono mb-2 tracking-widest uppercase">SEEDING THE VOID</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click anywhere on this surface grid to sprout precision customizable optical eyes that track your cursor dynamic vectors in real-time.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        applyPresetTemplate('watcher-pair');
                      }}
                      className="pointer-events-auto cursor-pointer bg-white/5 hover:bg-indigo-500/20 text-[10px] font-mono text-slate-200 border border-white/10 px-3 py-1.5 rounded-full transition-all duration-300 hover:border-indigo-500/30"
                    >
                      Spawn Gorgon Pair
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        applyPresetTemplate('oculon');
                      }}
                      className="pointer-events-auto cursor-pointer bg-white/5 hover:bg-indigo-500/20 text-[10px] font-mono text-slate-200 border border-white/10 px-3 py-1.5 rounded-full transition-all duration-300 hover:border-indigo-500/30"
                    >
                      Spawn Oculon Swarm
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Active Eyeball Canvas Mesh */}
            <AnimatePresence>
              {eyeballs.map((eye) => (
                <Eyeball
                  key={eye.id}
                  data={eye}
                  gazeMode={gazeMode}
                  globalSizeMultiplier={globalSizeMultiplier}
                  crazyEyes={crazyEyes}
                  onRemove={handleRemoveEye}
                  onUpdate={handleUpdateEye}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Interactive Live Stats HUD Strip */}
          <footer className="bg-white/5 border-t border-white/5 px-6 py-3 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-slate-400 z-10 select-none backdrop-blur-md">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <MousePointer className="w-3.5 h-3.5 text-slate-500" />
                <span>COORDS:</span>
                <strong className="text-indigo-400">X: {hudCoords.x}PX, Y: {hudCoords.y}PX</strong>
              </span>
              <span className="hidden sm:inline-flex items-center gap-2 border-l border-white/10 pl-6">
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                <span>CONFIDENCE:</span>
                <strong className="text-indigo-400 font-mono">99.8%</strong>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span>ASSEMBLAGES: <strong className="text-indigo-400">{eyeballs.length}</strong></span>
              <span className="hidden md:inline border-l border-white/10 pl-4 py-0.5 text-[10px]">
                WINK TIMESTAMP: <span className="text-stone-300">{lastBlinkTime}</span>
              </span>
            </div>
          </footer>
        </div>

        {/* Tactile Sidebar Control Deck */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 flex flex-col gap-6 shadow-2xl">
            
            {/* Eyeball Seeding Configuration Module */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold font-mono text-slate-400 tracking-wider uppercase">
                  1. Spawning Metric
                </h2>
                <span className="text-[9px] text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 font-mono px-2 py-0.5 rounded-full">
                  CONFIG
                </span>
              </div>

              {/* Next eyeball style selectors */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 select-none block font-semibold">Eye Genesis Style</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {EYE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setNextStyle(p.id);
                        setNextIrisColor(p.colors[0]);
                        synth.playTick();
                      }}
                      className={`cursor-pointer text-left p-3 rounded-xl border text-xs font-mono transition-all duration-300 ${
                        nextStyle === p.id
                          ? 'bg-indigo-500/10 border-indigo-400 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-bold text-[11px] text-white">{p.name}</div>
                      <div className="text-[9px] text-slate-500 truncate lowercase">{p.id}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct next-eye color selector based on style preset available colors */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-300 select-none font-semibold">Iris Pigment Color</label>
                  <span className="text-[10px] font-mono text-indigo-400">{nextIrisColor}</span>
                </div>
                <div className="flex gap-2 flex-wrap bg-white/5 p-2.5 rounded-xl border border-white/10">
                  {EYE_PRESETS.find(p => p.id === nextStyle)?.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setNextIrisColor(color);
                        synth.playTick();
                      }}
                      style={{ backgroundColor: color }}
                      className={`cursor-pointer w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                        nextIrisColor === color 
                          ? 'scale-110 rotate-12 border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' 
                          : 'border-white/10 hover:scale-105 opacity-80'
                      }`}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Next size slider */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Sprouting Diameter</span>
                  <span className="text-indigo-400 font-bold">{nextSize}px</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="180"
                  value={nextSize}
                  onChange={(e) => setNextSize(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-indigo-400 outline-none"
                />
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* Gaze Vector physics adjustments */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold font-mono text-slate-400 tracking-wider uppercase">
                2. Gaze Physics
              </h2>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 select-none block font-semibold">Tracking Vector Mode</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'normal', title: 'Focus Hunt', desc: 'Symmetrical pupil lock to exact coordinates' },
                    { id: 'evade', title: 'Shy Flee', desc: 'Eyes actively dodge and slip away from pointer' },
                    { id: 'laggy', title: 'Viscous Gel', desc: 'Dreamy low-frequency inertia glide delay' },
                    { id: 'anxious', title: 'Paranoid Jitter', desc: 'Jittery, hyper-reactive nervous rapid saccades' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setGazeMode(mode.id as GazeMode);
                        synth.playWink();
                      }}
                      className={`cursor-pointer w-full text-left p-3 rounded-xl border flex gap-3 transition-all duration-300 ${
                        gazeMode === mode.id
                          ? 'bg-indigo-500/10 border-indigo-400 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 text-[10px] font-mono">
                        {gazeMode === mode.id ? '●' : ''}
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono text-white">{mode.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{mode.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Global Sizing Multiplier Slider */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold font-mono">Global Scale</span>
                  <span className="text-indigo-400 font-bold">{globalSizeMultiplier.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.2"
                  step="0.1"
                  value={globalSizeMultiplier}
                  onChange={(e) => setGlobalSizeMultiplier(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-indigo-400 outline-none"
                />
              </div>

              {/* Crazy eyes toggle */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs text-slate-300 select-none block font-semibold">Paranoid Spasm</span>
                  <span className="text-[9px] text-slate-400 block">Induce constant eye shake tremors</span>
                </div>
                <button
                  onClick={() => {
                    setCrazyEyes(!crazyEyes);
                    synth.playPop();
                  }}
                  className={`cursor-pointer px-3 py-1.5 rounded-full border font-mono text-[10px] transition-all duration-300 ${
                    crazyEyes
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  }`}
                >
                  {crazyEyes ? 'SPASM ON' : 'SPASM OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Spawn Templates Module */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 flex flex-col gap-4 shadow-2xl">
            <h2 className="text-xs font-bold font-mono text-slate-400 tracking-wider uppercase">
              3. Quick Creativity Sets
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => applyPresetTemplate('watcher-pair')}
                className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-left p-3 rounded-2xl transition-all duration-300 hover:border-indigo-500/20 group"
              >
                <div className="text-[11px] font-bold text-white font-mono flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-amber-400 group-hover:animate-pulse" /> Gothic Pair
                </div>
                <div className="text-[9px] text-slate-400 leading-tight mt-1">2 colossal classic pupils</div>
              </button>

              <button
                onClick={() => applyPresetTemplate('oculon')}
                className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-left p-3 rounded-2xl transition-all duration-300 hover:border-indigo-500/20 group"
              >
                <div className="text-[11px] font-bold text-white font-mono flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400 group-hover:animate-ping" /> Oculon Swarm
                </div>
                <div className="text-[9px] text-slate-400 leading-tight mt-1">14 tiny glittering reactive eyes</div>
              </button>

              <button
                onClick={() => applyPresetTemplate('cyber-nest')}
                className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-left p-3 rounded-2xl transition-all duration-300 hover:border-indigo-500/20 group"
              >
                <div className="text-[11px] font-bold text-white font-mono flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-cyan-400" /> Cyber Array
                </div>
                <div className="text-[9px] text-slate-400 leading-tight mt-1">Symmetrical camera surveillance nest</div>
              </button>

              <button
                onClick={() => applyPresetTemplate('binary-swarm')}
                className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-left p-3 rounded-2xl transition-all duration-300 hover:border-indigo-500/20 group"
              >
                <div className="text-[11px] font-bold text-white font-mono flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-lime-400 group-hover:rotate-180 transition-transform duration-500" /> Primal Feral
                </div>
                <div className="text-[9px] text-slate-400 leading-tight mt-1">18 mechanical + lizard eyes</div>
              </button>
            </div>
          </div>

          {/* Mass Actions Deck */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 flex flex-col gap-4 shadow-2xl mb-8">
            <h2 className="text-xs font-bold font-mono text-slate-400 tracking-wider uppercase">
              4. Coordinated Actions
            </h2>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                
                {/* Coordinated Blink */}
                <button
                  onClick={handleMassWink}
                  disabled={eyeballs.length === 0}
                  className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-mono text-xs font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <EyeClosed className="w-3.5 h-3.5 text-indigo-400" />
                  Wink All
                </button>

                {/* Sleep All / Wake */}
                <button
                  onClick={handleToggleSleep}
                  disabled={eyeballs.length === 0}
                  className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-mono text-xs font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Nap/Wake
                </button>
              </div>

              {/* Expressive states */}
              <div className="bg-black/30 p-3 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[9px] text-slate-400 font-mono block tracking-wider uppercase">Set Global Gaze Girth</span>
                <div className="grid grid-cols-4 gap-1">
                  {(['normal', 'shocked', 'sleepy', 'giddy'] as const).map((expr) => (
                    <button
                      key={expr}
                      disabled={eyeballs.length === 0}
                      onClick={() => handleMassExpression(expr)}
                      className="cursor-pointer text-[10px] font-mono py-1 rounded-md bg-white/5 hover:bg-indigo-500/20 border border-white/10 text-slate-300 capitalize text-center leading-none transition-all duration-300 disabled:opacity-30"
                    >
                      {expr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scramble All Coordinates */}
              <button
                onClick={handleScrambleAll}
                disabled={eyeballs.length === 0}
                className="cursor-pointer w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-mono text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
                Scramble Locations
              </button>

              {/* Reset Canvas */}
              <button
                onClick={handleResetAll}
                disabled={eyeballs.length === 0}
                className="cursor-pointer w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 font-mono text-xs py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                Clear All Eyeballs
              </button>
            </div>
          </div>

        </aside>
      </main>

      {/* Bottom status bar */}
      <footer className="h-12 shrink-0 bg-white/5 border-t border-white/10 backdrop-blur-md px-10 flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-widest z-20">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> SYSTEM STATUS: ONLINE</span>
          <span className="hidden sm:flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> THERMAL: 32°C</span>
        </div>
        <div className="flex items-center gap-6">
          <span>IRIS ENGINE: V4.2</span>
          <span className="hidden xs:inline text-slate-200 font-semibold">NEURAL CALIBRATION ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
