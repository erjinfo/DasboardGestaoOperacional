/**
 * TechnicianCard — Card de técnico/agente com indicadores de performance
 * Clicável para abrir análise individual com plano de ação
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 */

import React from 'react';
import { TrendingUp, TrendingDown, Clock, RotateCcw, Star, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechnicianCardProps {
  nome: string;
  totalItems: number;
  resolvedItems: number;
  reopenedItems: number;
  tempoMedioMin: number;
  qualidadeDescricao: number;
  taxaRetrabalho: number;
  performanceScore: number;
  rank: number;
  moduleLabel: string;
  onClick: () => void;
  accentColor?: 'blue' | 'emerald' | 'violet';
}

const accentMap = {
  blue: {
    scoreBg: 'bg-blue-50',
    scoreText: 'text-blue-700',
    rankBg: 'bg-blue-600',
    border: 'hover:border-blue-300',
    progressBar: 'bg-blue-500',
  },
  emerald: {
    scoreBg: 'bg-emerald-50',
    scoreText: 'text-emerald-700',
    rankBg: 'bg-emerald-600',
    border: 'hover:border-emerald-300',
    progressBar: 'bg-emerald-500',
  },
  violet: {
    scoreBg: 'bg-violet-50',
    scoreText: 'text-violet-700',
    rankBg: 'bg-violet-600',
    border: 'hover:border-violet-300',
    progressBar: 'bg-violet-500',
  },
};

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBg(score: number) {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function getPriorityLabel(score: number): { label: string; color: string } {
  if (score < 70) return { label: 'Atenção', color: 'text-red-600 bg-red-50' };
  if (score < 85) return { label: 'Regular', color: 'text-amber-600 bg-amber-50' };
  return { label: 'Bom', color: 'text-emerald-600 bg-emerald-50' };
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function TechnicianCard({
  nome,
  totalItems,
  resolvedItems,
  reopenedItems,
  tempoMedioMin,
  qualidadeDescricao,
  taxaRetrabalho,
  performanceScore,
  rank,
  moduleLabel,
  onClick,
  accentColor = 'blue',
}: TechnicianCardProps) {
  const accent = accentMap[accentColor];
  const priority = getPriorityLabel(performanceScore);
  const taxaConclusao = totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card border border-border rounded-xl p-4 cursor-pointer card-hover',
        'transition-all duration-200',
        accent.border
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar + Rank */}
        <div className="relative flex-shrink-0">
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold', getAvatarColor(nome))}>
            {getInitials(nome)}
          </div>
          <div className={cn('absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold', accent.rankBg)}>
            {rank}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground truncate">{nome}</h3>
              <p className="text-xs text-muted-foreground">{totalItems} {moduleLabel}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', priority.color)}>
                {priority.label}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Performance Score */}
          <div className="mt-2 flex items-center gap-2">
            <div className={cn('flex items-center gap-1 px-2 py-1 rounded-lg border text-sm font-bold', getScoreBg(performanceScore), getScoreColor(performanceScore))}>
              <Star className="w-3 h-3" />
              {performanceScore}
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', accent.progressBar)}
                  style={{ width: `${performanceScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600">{taxaConclusao}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Conclusão</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5">
                <RotateCcw className="w-3 h-3 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600">{taxaRetrabalho}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Retrabalho</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5">
                <Clock className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-semibold text-blue-600">{tempoMedioMin}m</span>
              </div>
              <p className="text-xs text-muted-foreground">Tempo méd.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
