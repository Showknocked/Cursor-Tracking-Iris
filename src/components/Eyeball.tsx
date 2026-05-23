import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EyeballData, GazeMode, EyeStyle } from '../types';
import { synth } from '../utils';
import { Sparkles, Cpu, EyeOff, Radio } from 'lucide-react';

interface EyeballProps {
  key?: string | number;
  data: EyeballData;
  gazeMode: GazeMode;
  globalSizeMultiplier: number;
  crazyEyes: boolean;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<EyeballData>) => void;
}

export default function Eyeball({
  data,
  gazeMode,
  globalSizeMultiplier,
  crazyEyes,
  onRemove,
  onUpdate,
}: EyeballProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const pupilContainerRef = useRef<HTMLDivElement>(null);
  const lidTopRef = useRef<HTMLDivElement>(null);
  const lidBottomRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [internalBlink, setInternalBlink] = useState(false);
  const [isPokeShaking, setIsPokeShaking] = useState(false);

  // Apply actual visual sizing
  const currentSize = data.size * globalSizeMultiplier;

  // Track the mouse cursor and animate pupil container
  useEffect(() => {
    let animationFrameId: number;
    // Current animated pupil offset offset X/Y
    let currentX = 0;
    let currentY = 0;
    // Current animated gear rotation (for clockwork style)
    let currentRotation = 0;

    // Track state to trigger organic blinks. Randomly blinks every 3-8 seconds
    let nextBlinkTime = Date.now() + 3000 + Math.random() * 5000;

    // Saccade tracking (micro eye movements)
    let saccadeTargetX = 0;
    let saccadeTargetY = 0;
    let nextSaccadeTime = Date.now() + Math.random() * 2000;

    // Current global coordinates of the cursor
    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      clientX = e.clientX;
      clientY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const updateEyeGaze = () => {
      const now = Date.now();

      // 1. Check for random organic blinking
      if (now > nextBlinkTime && data.blinkState === 'open') {
        setInternalBlink(true);
        // Play click sound occasionally or let it be purely visual
        setTimeout(() => setInternalBlink(false), 140);
        nextBlinkTime = now + 4000 + Math.random() * 6000;
      }

      // 2. Generate small natural saccades (tiny sudden eye adjustments)
      if (now > nextSaccadeTime) {
        if (Math.random() < 0.7) {
          saccadeTargetX = (Math.random() - 0.5) * 8;
          saccadeTargetY = (Math.random() - 0.5) * 8;
        } else {
          saccadeTargetX = 0;
          saccadeTargetY = 0;
        }
        nextSaccadeTime = now + 700 + Math.random() * 1500;
      }

      const eyeEl = eyeRef.current;
      const pupilEl = pupilContainerRef.current;

      if (eyeEl && pupilEl) {
        const rect = eyeEl.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        let dx = clientX - eyeCenterX;
        let dy = clientY - eyeCenterY;

        // Apply interactive behavior adjustments
        if (gazeMode === 'evade') {
          // Look away from the cursor
          dx = -dx;
          dy = -dy;
        }

        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Limit the dynamic layout radius
        const maxRadius = currentSize * 0.24;

        // Dilation calculation: pupils expand if cursor is extremely close (curiousity/shock),
        // or contract slightly when far away
        const pupilRadiusFactor = Math.max(0.7, Math.min(1.4, 1.2 - (distance / (currentSize * 4))));

        let targetPupilX = 0;
        let targetPupilY = 0;

        // Anxious/Shaking Gaze modifier
        const shakeAmp = crazyEyes ? 8 : (gazeMode === 'anxious' ? 5 : 0);
        const shakeX = shakeAmp > 0 ? (Math.random() - 0.5) * shakeAmp : 0;
        const shakeY = shakeAmp > 0 ? (Math.random() - 0.5) * shakeAmp : 0;

        if (distance > 1) {
          // Restrict absolute pupil travel radius
          const travel = Math.min(distance * 0.15, maxRadius);
          targetPupilX = Math.cos(angle) * travel + shakeX;
          targetPupilY = Math.sin(angle) * travel + shakeY;
        } else {
          targetPupilX = shakeX;
          targetPupilY = shakeY;
        }

        // Add small organic micro-movements
        targetPupilX += saccadeTargetX;
        targetPupilY += saccadeTargetY;

        // Apply laggy/smooth spring interpolation
        let spring = data.tension || 0.14;
        if (gazeMode === 'laggy') {
          spring = 0.05; // Extra smooth laggy glide
        } else if (gazeMode === 'anxious') {
          spring = 0.28; // Rapid jittery tracking
        }

        currentX += (targetPupilX - currentX) * spring;
        currentY += (targetPupilY - currentY) * spring;

        // Clockwork gear rotation tracking angle
        const targetRotation = angle * (180 / Math.PI);
        currentRotation += (targetRotation - currentRotation) * 0.2;

        // Direct DOM updates for ultra performance
        pupilEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

        // Custom styling modifiers per EyeStyle via CSS custom properties
        pupilEl.style.setProperty('--dilation', pupilRadiusFactor.toString());
        pupilEl.style.setProperty('--gear-rotate', `${currentRotation}deg`);
      }

      animationFrameId = requestAnimationFrame(updateEyeGaze);
    };

    animationFrameId = requestAnimationFrame(updateEyeGaze);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [data.tension, gazeMode, currentSize, data.blinkState, crazyEyes]);

  // Handle eyeball poke interaction (blink + sound)
  const handlePoke = () => {
    if (data.blinkState === 'closed') {
      // If sleeping, wake up!
      onUpdate(data.id, { blinkState: 'open', expression: 'normal' });
      synth.playWink();
      return;
    }

    // Trigger instant rapid closing blink & pop wobble
    onUpdate(data.id, { blinkState: 'winking' });
    setIsPokeShaking(true);
    synth.playSquish();

    setTimeout(() => {
      setIsPokeShaking(false);
      onUpdate(data.id, { blinkState: 'open' });
    }, 250);
  };

  // Generate iris styles based on selected eye themes
  const renderEyeArt = () => {
    const defaultColor = data.irisColor;

    switch (data.style) {
      case 'cybernet':
        return (
          <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden" style={{ background: `radial-gradient(circle, ${defaultColor}88 0%, #020617 100%)` }}>
            {/* Glowing Circuit Lines */}
            <svg className="absolute inset-0 w-full h-full text-cyan-400 opacity-40 animate-pulse" viewBox="0 0 100 100" style={{ transform: 'rotate(var(--gear-rotate))' }}>
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="3 3" />
              <line x1="50" y1="8" x2="50" y2="25" stroke="currentColor" strokeWidth="1.5" />
              <line x1="50" y1="92" x2="50" y2="75" stroke="currentColor" strokeWidth="1.5" />
              <line x1="8" y1="50" x2="25" y2="50" stroke="currentColor" strokeWidth="1.5" />
              <line x1="92" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="50" cy="25" r="2.5" fill="currentColor" />
              <circle cx="50" cy="75" r="2.5" fill="currentColor" />
            </svg>
            
            {/* Pulsing Iris Layer */}
            <div className="w-[70%] h-[70%] rounded-full relative flex items-center justify-center" style={{ backgroundColor: `${defaultColor}44`, boxShadow: `0 0 16px ${defaultColor}` }}>
              {/* Digital Reticle Crosshair */}
              <div className="absolute inset-0 rounded-full border border-dashed text-cyan-500 opacity-60 flex items-center justify-center" style={{ borderColor: defaultColor, transform: 'rotate(calc(-1 * var(--gear-rotate)))' }} />
              
              {/* Actual Cyber Pupil */}
              <div 
                className="w-[45%] h-[45%] rounded-full bg-slate-950 border-2 flex items-center justify-center transition-all duration-75"
                style={{ 
                  transform: 'scale(var(--dilation))', 
                  borderColor: defaultColor,
                  boxShadow: `inset 0 0 8px ${defaultColor}`
                }}
              >
                {/* Micro Digital core glow dot */}
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: defaultColor, boxShadow: `0 0 8px ${defaultColor}` }} />
              </div>
            </div>
          </div>
        );

      case 'reptile':
        return (
          <div 
            className="absolute inset-x-2 inset-y-2 rounded-full overflow-hidden flex items-center justify-center border-4 border-[#071302]"
            style={{ 
              background: `radial-gradient(circle, ${defaultColor}F0 20%, #1a3a08 60%, #030701 100%)` 
            }}
          >
            {/* Reptilian fibrous texture lines inside Iris */}
            <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" style={{ transform: 'rotate(var(--gear-rotate))' }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={50 + 40 * Math.cos((i * Math.PI) / 8)}
                  y2={50 + 40 * Math.sin((i * Math.PI) / 8)}
                  stroke="#1a1c02"
                  strokeWidth="1.5"
                />
              ))}
              <circle cx="50" cy="50" r="30" fill="none" stroke="#facc15" strokeWidth="1" opacity="0.3" />
            </svg>

            {/* Glowing Slit Pupil */}
            <div 
              className="w-[18%] h-[68%] bg-black transition-all duration-75 ease-out shadow-2xl relative"
              style={{
                borderRadius: '50% / 15%',
                transform: 'scaleX(var(--dilation)) scaleY(0.95)',
                boxShadow: '0 0 12px rgba(0,0,0,0.9)'
              }}
            >
              {/* Slit inner depth shine */}
              <div className="absolute top-[20%] left-[30%] w-[40%] h-[30%] bg-white/20 rounded-full" />
            </div>
          </div>
        );

      case 'anime':
        return (
          <div 
            className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${defaultColor} 10%, #1e1b4b 90%)`,
              boxShadow: 'inset 0 4px 12px rgba(255,255,255,0.4), inset 0 -4px 12px rgba(0,0,0,0.6)'
            }}
          >
            {/* Multi-layered soft gradient rings */}
            <div className="absolute rounded-full w-[85%] h-[85%] border border-white/20" />
            
            {/* Star Highlight sparkles within iris */}
            <div className="absolute w-[80%] h-[80%] rounded-full overflow-hidden relative" style={{ transform: 'rotate(15deg)' }}>
              <div className="absolute top-[10%] left-[10%] w-4 h-4 bg-white rounded-full opacity-90 blur-[0.3px]" />
              <div className="absolute bottom-[20%] right-[20%] w-2 h-2 bg-white rounded-full opacity-70" />
              <div className="absolute bottom-[10%] left-[30%] w-1.5 h-1.5 bg-white/50 rounded-full" />
              <div className="absolute top-[40%] right-[10%] w-3 h-3 bg-white/80 rounded-full" />
              
              {/* Colorful light reflection crescents */}
              <div className="absolute bottom-1 inset-x-2 h-4 bg-purple-400/30 rounded-full blur-[2px]" />
            </div>

            {/* Deep Navy Cute Pupil */}
            <div 
              className="w-[45%] h-[45%] rounded-full bg-[#03001e] flex items-center justify-center transition-all duration-75 overflow-hidden"
              style={{ transform: 'scale(calc(var(--dilation) * 0.95))' }}
            >
              {/* Cute heart-shaped sparkle or star placeholder within pupil */}
              <div className="w-2.5 h-2.5 bg-white rounded-full absolute top-1 left-2 opacity-80" />
            </div>
          </div>
        );

      case 'clockwork':
        return (
          <div 
            className="absolute inset-1 rounded-full overflow-hidden flex items-center justify-center border-2 border-amber-800"
            style={{ 
              background: 'radial-gradient(circle, #f59e0b 0%, #78350f 70%, #451a03 100%)',
              boxShadow: 'inset 0 0 16px rgba(0,0,0,0.8)'
            }}
          >
            {/* Brass clockwork gears tracking movement */}
            <svg className="absolute inset-0 w-full h-full text-amber-500/40" viewBox="0 0 100 100" style={{ transform: 'rotate(var(--gear-rotate))' }}>
              <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2.5" fill="none" />
              {Array.from({ length: 12 }).map((_, i) => {
                const angleRad = (i * Math.PI) / 6;
                return (
                  <path
                    key={i}
                    d={`M ${50 + 30 * Math.cos(angleRad)} ${50 + 30 * Math.sin(angleRad)} 
                       L ${50 + 36 * Math.cos(angleRad)} ${50 + 36 * Math.sin(angleRad)}`}
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                );
              })}
              {/* Inner Gear Ring */}
              <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 3" />
            </svg>

            {/* Ornate Brass central wheel (Pupil) */}
            <div 
              className="w-[48%] h-[48%] rounded-full bg-stone-900 border-4 border-amber-600 flex items-center justify-center transition-all duration-75 relative"
              style={{ 
                transform: 'scale(var(--dilation)) rotate(calc(-1.5 * var(--gear-rotate)))',
                boxShadow: '0 4px 10px rgba(0,0,0,0.6)'
              }}
            >
              {/* Golden Crosshair Spokes */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-amber-500 absolute" />
                <div className="h-full w-0.5 bg-amber-500 absolute" />
              </div>
              
              {/* Center pointer hub */}
              <div className="w-4 h-4 bg-amber-400 rounded-full border border-stone-900 flex items-center justify-center z-10">
                <div className="w-1.5 h-1.5 bg-stone-900 rounded-full" />
              </div>
            </div>
          </div>
        );

      case 'classic':
      default:
        // Elegant minimal classic contrast eye
        return (
          <div 
            className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center transition-colors duration-500"
            style={{ 
              backgroundColor: defaultColor,
              boxShadow: 'inset 0 6px 12px rgba(255,255,255,0.25), inset 0 -6px 12px rgba(0,0,0,0.3)'
            }}
          >
            {/* Shiny glossy refraction vector */}
            <div className="absolute top-[10%] left-[10%] w-[80%] h-[35%] bg-gradient-to-b from-white/30 to-white/0 rounded-full" />
            
            {/* White iris highlight vector */}
            <div className="absolute top-[8%] left-[15%] w-4 h-4 rounded-full bg-white opacity-95 pointer-events-none" />
            <div className="absolute bottom-[22%] right-[22%] w-2.5 h-2.5 rounded-full bg-white/70 pointer-events-none" />

            {/* Black Deep Pupil */}
            <div 
              className="w-[45%] h-[45%] rounded-full bg-slate-950 flex items-center justify-center transition-all duration-75 relative"
              style={{ transform: 'scale(var(--dilation))' }}
            >
              {/* Tiny gleam dot */}
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white opacity-80" />
            </div>
          </div>
        );
    }
  };

  // Determine blinking states
  const isEyeBlinking = data.blinkState === 'closed' || data.blinkState === 'winking' || internalBlink;

  // Determine emotional eyelashes/eyelids curves based on state expression
  const getScleraBorderRadius = () => {
    if (data.expression === 'shocked') {
      return 'rounded-full border-red-500'; // Wide round circle
    }
    if (data.expression === 'giddy') {
      return 'rounded-[80%_40%_80%_40%]'; // Cute slant
    }
    if (data.expression === 'sleepy') {
      return 'rounded-[90%_90%_70%_70%] scale-y-[0.85]'; // Squashed oval
    }
    return 'rounded-[65%_35%]'; // Classic natural asymmetrical organic cat-eye shape
  };

  return (
    <motion.div
      style={{
        left: `${data.x}%`,
        top: `${data.y}%`,
        width: `${currentSize}px`,
        height: `${currentSize}px`,
        marginLeft: `-${currentSize / 2}px`,
        marginTop: `-${currentSize / 2}px`,
      }}
      className={`absolute select-none cursor-pointer group active:scale-95 transition-all outline-none ${
        isPokeShaking ? 'animate-[shake_0.25s_infinite_alternate]' : ''
      }`}
      initial={{ scale: 0, opacity: 0, rotate: -45 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0, rotate: 45 }}
      transition={{ type: 'spring', damping: 15, stiffness: 120 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        // Prevent clicking eye from placing a new eye on parent playground
        e.stopPropagation();
        handlePoke();
      }}
    >
      {/* Sclera (The white of the eye) Container */}
      <div
        ref={eyeRef}
        className={`w-full h-full relative border-2 border-stone-800 bg-stone-50 overflow-hidden flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 ${getScleraBorderRadius()}`}
      >
        {/* Subtle sclera details (veins or electronic patterns for different modes) */}
        {data.style === 'cybernet' && (
          <div className="absolute inset-0 bg-[radial-gradient(#22d3ee08_1px,transparent_1px)] [background-size:6px_6px] opacity-60" />
        )}
        {data.style === 'reptile' && (
          <div className="absolute inset-0 bg-amber-500/5 mix-blend-color-burn" />
        )}
        {data.style === 'clockwork' && (
          <div className="absolute inset-0 rounded-full border border-orange-200/20" />
        )}

        {/* Dynamic Inner Pupil/Iris Canvas (DOM optimized) */}
        <div
          ref={pupilContainerRef}
          className="w-[60%] h-[60%] rounded-full relative transition-[transform] duration-75 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ willChange: 'transform' }}
        >
          {renderEyeArt()}
        </div>

        {/* Eyelid Top (Slide Down) */}
        <div
          ref={lidTopRef}
          className="absolute top-0 left-0 w-full bg-stone-900 border-b border-stone-800 origin-top flex items-end justify-center transition-transform duration-100 ease-[cubic-bezier(0.1,0.9,0.2,1)]"
          style={{
            height: '50.1%',
            transform: isEyeBlinking 
              ? 'scaleY(1)' 
              : data.expression === 'sleepy' 
                ? 'scaleY(0.55)' 
                : 'scaleY(0)'
          }}
        >
          {/* Eyelashes representation or neon strip */}
          <div className={`w-full h-[3px] absolute bottom-0 ${data.style === 'cybernet' ? 'bg-cyan-400' : 'bg-stone-700'}`} />
        </div>

        {/* Eyelid Bottom (Slide Up) */}
        <div
          ref={lidBottomRef}
          className="absolute bottom-0 left-0 w-full bg-stone-900 border-t border-stone-800 origin-bottom flex items-start justify-center transition-transform duration-100 ease-[cubic-bezier(0.1,0.9,0.2,1)]"
          style={{
            height: '50.1%',
            transform: isEyeBlinking 
              ? 'scaleY(1)' 
              : data.expression === 'sleepy' 
                ? 'scaleY(0.4)' 
                : 'scaleY(0)'
          }}
        >
          <div className={`w-full h-[3px] absolute top-0 ${data.style === 'cybernet' ? 'bg-cyan-400' : 'bg-stone-700'}`} />
        </div>
      </div>

      {/* Floating Hover Controls & Nickname Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white rounded-md px-2 py-1 text-[10px] font-mono whitespace-nowrap z-30 shadow-lg flex items-center gap-1.5"
          >
            {/* Style Indicator Icon */}
            {data.style === 'cybernet' && <Cpu className="w-3 h-3 text-cyan-400" />}
            {data.style === 'anime' && <Sparkles className="w-3 h-3 text-pink-400" />}
            {data.style === 'reptile' && <Radio className="w-3 h-3 text-lime-400" />}
            
            <span className="text-stone-300 font-semibold">{data.label || 'Spectator'}</span>
            <span className="text-[9px] text-stone-500">({data.size}px)</span>
            
            {/* Direct individual deletion button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                synth.playSweep();
                onRemove(data.id);
              }}
              className="ml-1 bg-stone-800 hover:bg-red-950 hover:text-red-400 rounded p-1 transition-colors"
              title="Release eye"
            >
              <EyeOff className="w-2.5 h-2.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
