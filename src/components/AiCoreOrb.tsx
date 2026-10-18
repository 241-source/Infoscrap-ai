import React, { useEffect, useRef } from 'react';
import { AssistantStatus } from '../types/assistant';

interface AiCoreOrbProps {
  status: AssistantStatus;
  onClick?: () => void;
}

export const AiCoreOrb: React.FC<AiCoreOrbProps> = ({ status, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angleOuter = 0;
    let angleInner = 0;
    let pulsePhase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(centerX, centerY) * 0.72;

      // Color scheme based on status
      let primaryColor = '#06B6D4'; // cyan
      let glowColor = 'rgba(6, 182, 212, 0.4)';
      let speedOuter = 0.008;
      let speedInner = -0.012;
      let pulseFreq = 0.03;

      if (status === 'LISTENING') {
        primaryColor = '#22D3EE';
        glowColor = 'rgba(34, 211, 238, 0.65)';
        speedOuter = 0.015;
        speedInner = -0.02;
        pulseFreq = 0.08;
      } else if (status === 'THINKING') {
        primaryColor = '#A855F7'; // purple
        glowColor = 'rgba(168, 85, 247, 0.6)';
        speedOuter = 0.035;
        speedInner = -0.045;
        pulseFreq = 0.07;
      } else if (status === 'SPEAKING') {
        primaryColor = '#3B82F6'; // electric blue
        glowColor = 'rgba(59, 130, 246, 0.6)';
        speedOuter = 0.018;
        speedInner = -0.025;
        pulseFreq = 0.12;
      } else if (status === 'ERROR') {
        primaryColor = '#EF4444';
        glowColor = 'rgba(239, 68, 68, 0.6)';
      }

      angleOuter += speedOuter;
      angleInner += speedInner;
      pulsePhase += pulseFreq;

      const currentPulse = Math.sin(pulsePhase);
      const orbScale = 1 + currentPulse * (status === 'SPEAKING' || status === 'LISTENING' ? 0.14 : 0.05);

      // 1. Ambient Glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.2,
        centerX,
        centerY,
        baseRadius * 1.3
      );
      glowGrad.addColorStop(0, glowColor);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer Segmented Ring (JARVIS HUD)
      const outerSegments = 16;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = primaryColor;
      for (let i = 0; i < outerSegments; i++) {
        const segAngle = (i * (Math.PI * 2)) / outerSegments + angleOuter;
        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          baseRadius,
          segAngle,
          segAngle + (Math.PI * 2) / (outerSegments * 1.8)
        );
        ctx.stroke();
      }

      // 3. Middle Counter-Rotating Ring with Tick Marks
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#38BDF8';
      const middleRadius = baseRadius * 0.82;
      const ticks = 32;
      for (let t = 0; t < ticks; t++) {
        const tAngle = (t * (Math.PI * 2)) / ticks + angleInner;
        const tickLength = t % 4 === 0 ? 8 : 4;
        const x1 = centerX + Math.cos(tAngle) * middleRadius;
        const y1 = centerY + Math.sin(tAngle) * middleRadius;
        const x2 = centerX + Math.cos(tAngle) * (middleRadius - tickLength);
        const y2 = centerY + Math.sin(tAngle) * (middleRadius - tickLength);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 4. Radiating Audio Waveform Frequency Spikes (Active during SPEAKING or LISTENING)
      if (status === 'SPEAKING' || status === 'LISTENING') {
        const numBars = 36;
        for (let b = 0; b < numBars; b++) {
          const bAngle = (b * (Math.PI * 2)) / numBars + angleOuter * 0.5;
          const harmonic = Math.sin(pulsePhase * 2 + b * 0.6);
          const barHeight = Math.abs(harmonic) * (status === 'SPEAKING' ? 24 : 14) + 4;

          const sx = centerX + Math.cos(bAngle) * (baseRadius + 4);
          const sy = centerY + Math.sin(bAngle) * (baseRadius + 4);
          const ex = centerX + Math.cos(bAngle) * (baseRadius + 4 + barHeight);
          const ey = centerY + Math.sin(bAngle) * (baseRadius + 4 + barHeight);

          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
      }

      // 5. Glowing Central Sphere
      const sphereRadius = baseRadius * 0.44 * orbScale;
      const orbGrad = ctx.createRadialGradient(
        centerX - sphereRadius * 0.3,
        centerY - sphereRadius * 0.3,
        2,
        centerX,
        centerY,
        sphereRadius
      );
      orbGrad.addColorStop(0, '#FFFFFF');
      orbGrad.addColorStop(0.3, primaryColor);
      orbGrad.addColorStop(0.8, '#0A1224');
      orbGrad.addColorStop(1, 'rgba(10, 18, 36, 0.4)');

      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius, 0, Math.PI * 2);
      ctx.fill();

      // 6. Center Crosshair Reticle
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      const crossSize = 10 * orbScale;
      ctx.beginPath();
      ctx.moveTo(centerX - crossSize, centerY);
      ctx.lineTo(centerX + crossSize, centerY);
      ctx.moveTo(centerX, centerY - crossSize);
      ctx.lineTo(centerX, centerY + crossSize);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [status]);

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center justify-center cursor-pointer group select-none"
      title="Click to toggle voice interaction"
    >
      <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-full h-full drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]"
        />

        {/* Floating status label inside core */}
        <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-500/40 text-[11px] font-mono tracking-widest text-cyan-400 uppercase shadow-lg shadow-cyan-950/50 backdrop-blur-md">
          {status === 'IDLE' && '● STANDBY'}
          {status === 'LISTENING' && '▲ LISTENING...'}
          {status === 'THINKING' && '⚙ SYNTHESIZING...'}
          {status === 'SPEAKING' && '♫ TRANSMITTING...'}
          {status === 'ERROR' && '✕ CORE ERROR'}
          {status === 'OFFLINE' && '○ OFFLINE'}
        </div>
      </div>
    </div>
  );
};
