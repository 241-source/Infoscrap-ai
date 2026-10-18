import React from 'react';
import {
  Play,
  Search,
  Code2,
  ScanText,
  Languages,
  FileText,
  Cpu,
  Mic,
  ArrowDownCircle,
  HelpCircle
} from 'lucide-react';

interface QuickActionToolbarProps {
  onActionClick: (prompt: string, actionType?: string) => void;
  disabled?: boolean;
}

export const QuickActionToolbar: React.FC<QuickActionToolbarProps> = ({
  onActionClick,
  disabled = false,
}) => {
  const actions = [
    {
      label: 'Open YouTube',
      prompt: 'Open YouTube',
      icon: <Play className="w-3.5 h-3.5 text-red-400" />,
      color: 'hover:border-red-500/50',
    },
    {
      label: 'Search Web',
      prompt: 'Search the web for the latest breakthrough in artificial intelligence',
      icon: <Search className="w-3.5 h-3.5 text-cyan-400" />,
      color: 'hover:border-cyan-500/50',
    },
    {
      label: 'Write Code',
      prompt: 'Write a clean Kotlin coroutine function for Android with retry backoff and error handling',
      icon: <Code2 className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'hover:border-emerald-500/50',
    },
    {
      label: 'Read Screen',
      prompt: 'Read the text on my screen',
      icon: <ScanText className="w-3.5 h-3.5 text-blue-400" />,
      color: 'hover:border-blue-500/50',
    },
    {
      label: 'Translate Hindi',
      prompt: 'Translate this into Hindi: InfoScrap AI is your personal neural assistant ready to automate tasks.',
      icon: <Languages className="w-3.5 h-3.5 text-amber-400" />,
      color: 'hover:border-amber-500/50',
    },
    {
      label: 'Summarize',
      prompt: 'Summarize the advantages of Jetpack Compose compared to legacy Android XML layouts.',
      icon: <FileText className="w-3.5 h-3.5 text-indigo-400" />,
      color: 'hover:border-indigo-500/50',
    },
    {
      label: 'Solve Problem',
      prompt: 'Help me fix this error: java.lang.SecurityException: Permission Denial: startForeground requires FOREGROUND_SERVICE',
      icon: <HelpCircle className="w-3.5 h-3.5 text-purple-400" />,
      color: 'hover:border-purple-500/50',
    },
    {
      label: 'Scroll Down',
      prompt: 'Scroll down',
      icon: <ArrowDownCircle className="w-3.5 h-3.5 text-cyan-300" />,
      color: 'hover:border-cyan-400/50',
    },
    {
      label: 'Ask AI Status',
      prompt: 'Hello InfoScrap. Provide a diagnostic report of your active neural subsystems and readiness.',
      icon: <Cpu className="w-3.5 h-3.5 text-sky-400" />,
      color: 'hover:border-sky-500/50',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          QUICK PROTOCOLS & DEVICE ACTIONS
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {actions.map((act, idx) => (
          <button
            key={idx}
            disabled={disabled}
            onClick={() => onActionClick(act.prompt, act.label)}
            className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-hud text-slate-200 transition-all shadow-sm hover:bg-slate-800/80 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${act.color}`}
          >
            {act.icon}
            <span>{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
