import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  Volume2,
  VolumeX,
  RotateCcw,
  Terminal,
  Bot,
  User,
  ExternalLink,
  Code2
} from 'lucide-react';
import { ChatMessage } from '../types/assistant';

interface ConversationPanelProps {
  messages: ChatMessage[];
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
  isSpeaking: boolean;
  onRegenerate?: () => void;
  onClearHistory?: () => void;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  messages,
  onSpeak,
  onStopSpeaking,
  isSpeaking,
  onRegenerate,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareText = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'InfoScrap AI Response',
        text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Response copied to clipboard for sharing!');
    }
  };

  // Simple Markdown & Code block parser
  const renderMessageContent = (text: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }

      // Code block
      parts.push({
        type: 'code',
        language: match[1] || 'code',
        content: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-3">
        {parts.map((part, idx) => {
          if (part.type === 'code') {
            return (
              <div
                key={idx}
                className="my-2.5 rounded-lg border border-cyan-500/30 bg-slate-950 overflow-hidden font-mono text-xs shadow-md"
              >
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-cyan-500/20 text-slate-400">
                  <div className="flex items-center gap-1.5 text-[11px] text-cyan-400">
                    <Code2 className="w-3.5 h-3.5" />
                    <span className="uppercase">{part.language || 'KOTLIN / SCRIPT'}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(part.content, `code-${idx}`)}
                    className="flex items-center gap-1 text-[11px] hover:text-cyan-300 transition-colors"
                  >
                    {copiedId === `code-${idx}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-emerald-300/90 leading-relaxed scrollbar-thin">
                  <code>{part.content}</code>
                </pre>
              </div>
            );
          }

          // Format basic inline code and bolding
          const formattedText = part.content
            .split('\n')
            .map((line, lineIdx) => {
              if (line.startsWith('### ')) {
                return (
                  <h3 key={lineIdx} className="text-cyan-300 font-semibold text-sm mt-2 mb-1">
                    {line.replace('### ', '')}
                  </h3>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h2 key={lineIdx} className="text-cyan-400 font-bold text-base mt-3 mb-1">
                    {line.replace('## ', '')}
                  </h2>
                );
              }
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                  <li key={lineIdx} className="ml-4 list-disc text-slate-300 text-xs md:text-sm">
                    {line.replace(/^[-*]\s/, '')}
                  </li>
                );
              }
              return (
                <p key={lineIdx} className="text-xs md:text-sm leading-relaxed text-slate-200">
                  {line}
                </p>
              );
            });

          return <div key={idx} className="space-y-1">{formattedText}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-xl border border-cyan-500/20 backdrop-blur-md overflow-hidden">
      {/* Feed Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-500/20 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase">
            NEURAL TRANSMISSION FEED
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 font-mono border border-cyan-500/30">
            {messages.length} ENTRIES
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onRegenerate && messages.length > 1 && (
            <button
              onClick={onRegenerate}
              title="Regenerate last response"
              className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          {onClearHistory && (
            <button
              onClick={onClearHistory}
              title="Clear transmission history"
              className="text-[11px] font-mono px-2 py-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-slate-800 transition-colors"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono tracking-wider">
                {isUser ? (
                  <>
                    <span className="text-blue-400 font-semibold">COMMANDER</span>
                    <User className="w-3 h-3 text-blue-400" />
                  </>
                ) : isSystem ? (
                  <>
                    <span className="text-red-400 font-semibold">SYSTEM FAULT</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-400 font-semibold">INFOSCRAP AI</span>
                  </>
                )}
                <span className="text-slate-600">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <div
                className={`w-full max-w-2xl rounded-xl p-3.5 transition-all text-left shadow-lg ${
                  isUser
                    ? 'bg-blue-950/40 border border-blue-500/40 text-blue-100'
                    : isSystem
                    ? 'bg-red-950/30 border border-red-500/40 text-red-200'
                    : 'bg-slate-900/85 border border-cyan-500/30 text-slate-100'
                }`}
              >
                {renderMessageContent(msg.text)}

                {/* Subsystem Action Badge if triggered */}
                {msg.actionExecuted && (
                  <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                    <span className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Executed Subsystem: {msg.actionExecuted}
                    </span>
                  </div>
                )}

                {/* Assistant response action buttons */}
                {!isUser && !isSystem && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2 text-slate-400">
                    <button
                      onClick={() => {
                        if (isSpeaking) onStopSpeaking();
                        else onSpeak(msg.text);
                      }}
                      className="p-1.5 rounded hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
                      title={isSpeaking ? 'Stop speaking' : 'Speak answer (Masculine voice)'}
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-3.5 h-3.5 text-purple-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="p-1.5 rounded hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => shareText(msg.text)}
                      className="p-1.5 rounded hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
                      title="Share response"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
