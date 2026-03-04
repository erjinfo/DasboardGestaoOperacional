/**
 * PerformancePage — Componente reutilizável para OS, SAC e Matrix
 * Inclui upload de arquivo, KPIs, ranking e análise individual
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search, Users, TrendingUp, BarChart2, Clock,
  Trophy, AlertTriangle, ArrowUpDown, SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileUploadZone } from './FileUploadZone';
import { TechnicianCard } from './TechnicianCard';
import { TechnicianAnalysisModal } from './TechnicianAnalysisModal';
import type { DataFile } from '@/contexts/DataContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface TechnicianData {
  nome: string;
  totalItems: number;
  resolvedItems: number;
  reopenedItems: number;
  tempoMedioMin: number;
  qualidadeDescricao: number;
  taxaRetrabalho: number;
  performanceScore: number;
  reincidencias?: {
    cliente: string;
    numeroOS: string[];
    datas: { data: string; tecnico: string }[];
  }[];
}

interface PerformancePageProps {
  title: string;
  subtitle: string;
  moduleType: 'OS' | 'SAC' | 'Matrix';
  moduleLabel: string;
  itemLabel: string;
  technicians: TechnicianData[];
  uploadedFile: DataFile | null;
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  accentColor: 'blue' | 'emerald' | 'violet';
  uploadColor: 'blue' | 'emerald' | 'violet';
}

type SortKey = 'performanceScore' | 'totalItems' | 'taxaRetrabalho' | 'tempoMedioMin';

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'totalItems', label: 'Total de Itens' },
  { key: 'performanceScore', label: 'Performance' },
  { key: 'taxaRetrabalho', label: 'Retrabalho' },
  { key: 'tempoMedioMin', label: 'Tempo Médio' },
];

export function PerformancePage({
  title,
  subtitle,
  moduleType,
  moduleLabel,
  itemLabel,
  technicians,
  uploadedFile,
  onUpload,
  isLoading,
  accentColor,
  uploadColor,
}: PerformancePageProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('totalItems');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedTech, setSelectedTech] = useState<TechnicianData | null>(null);

  const filtered = useMemo(() => {
    let list = technicians.filter(t =>
      t.nome.toLowerCase().includes(search.toLowerCase())
    );
    list = [...list].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortAsc ? diff : -diff;
    });
    return list;
  }, [technicians, search, sortKey, sortAsc]);

  // KPIs
  const kpis = useMemo(() => {
    if (technicians.length === 0) return null;
    const total = technicians.reduce((s, t) => s + t.totalItems, 0);
    const avgScore = Math.round(technicians.reduce((s, t) => s + t.performanceScore, 0) / technicians.length);
    const avgRetrabalho = Math.round(technicians.reduce((s, t) => s + t.taxaRetrabalho, 0) / technicians.length);
    const avgTempo = Math.round(technicians.reduce((s, t) => s + t.tempoMedioMin, 0) / technicians.length);
    const atencao = technicians.filter(t => t.performanceScore < 70).length;
    return { total, avgScore, avgRetrabalho, avgTempo, atencao };
  }, [technicians]);

  // Chart data (top 10)
  const chartData = useMemo(() => {
    return [...technicians]
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 10)
      .map(t => ({
        name: t.nome.split(' ')[0],
        score: t.performanceScore,
        total: t.totalItems,
      }));
  }, [technicians]);

  const chartColors = {
    blue: '#3730A3',
    emerald: '#059669',
    violet: '#7C3AED',
  };

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
        accentColor === 'blue' ? 'bg-blue-50' :
        accentColor === 'emerald' ? 'bg-emerald-50' : 'bg-violet-50'
      )}>
        <Users className={cn('w-8 h-8',
          accentColor === 'blue' ? 'text-blue-400' :
          accentColor === 'emerald' ? 'text-emerald-400' : 'text-violet-400'
        )} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">Nenhum dado carregado</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Faça o upload do arquivo de {title} para visualizar os dados dos técnicos
      </p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* ── Upload ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                {title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
            {uploadedFile && (
              <Badge variant="secondary" className="text-xs">
                {uploadedFile.rowCount.toLocaleString('pt-BR')} registros
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <FileUploadZone
            label={`Base de Dados — ${title}`}
            description={`Arquivo CSV ou Excel com os dados de ${title.toLowerCase()}`}
            onUpload={onUpload}
            uploadedFile={uploadedFile}
            isLoading={isLoading}
            color={uploadColor}
          />
        </CardContent>
      </Card>

      {technicians.length === 0 ? emptyState : (
        <>
          {/* ── KPIs ── */}
          {kpis && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: `Total ${itemLabel}`, value: kpis.total.toLocaleString('pt-BR'), icon: BarChart2, color: accentColor === 'blue' ? 'text-blue-600' : accentColor === 'emerald' ? 'text-emerald-600' : 'text-violet-600' },
                { label: 'Score Médio', value: kpis.avgScore, icon: TrendingUp, color: kpis.avgScore >= 80 ? 'text-emerald-600' : kpis.avgScore >= 60 ? 'text-amber-600' : 'text-red-600' },
                { label: 'Retrabalho Médio', value: `${kpis.avgRetrabalho}%`, icon: AlertTriangle, color: kpis.avgRetrabalho > 20 ? 'text-red-600' : 'text-amber-600' },
                { label: 'Tempo Médio', value: `${kpis.avgTempo}m`, icon: Clock, color: 'text-blue-600' },
                { label: 'Precisam Atenção', value: kpis.atencao, icon: AlertTriangle, color: kpis.atencao > 0 ? 'text-red-600' : 'text-emerald-600' },
              ].map((kpi) => (
                <Card key={kpi.label} className="shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      <kpi.icon className={cn('w-3.5 h-3.5', kpi.color)} />
                    </div>
                    <p className={cn('text-xl font-bold', kpi.color)}>{kpi.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── Gráfico ── */}
          {chartData.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Top 10 — Score de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val) => [`${val} pts`, 'Score']}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.score >= 80 ? '#10B981' : entry.score >= 60 ? '#F59E0B' : '#EF4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* ── Lista de Técnicos ── */}
          <div className="space-y-3">
            {/* Controles */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Buscar ${moduleType === 'OS' ? 'técnico' : 'agente'}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground h-9"
                >
                  {sortOptions.map(o => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2"
                  onClick={() => setSortAsc(!sortAsc)}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {filtered.length} {moduleType === 'OS' ? 'técnicos' : 'agentes'} · Clique para ver análise individual
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((tech, idx) => (
                <TechnicianCard
                  key={tech.nome}
                  nome={tech.nome}
                  totalItems={tech.totalItems}
                  resolvedItems={tech.resolvedItems}
                  reopenedItems={tech.reopenedItems}
                  tempoMedioMin={tech.tempoMedioMin}
                  qualidadeDescricao={tech.qualidadeDescricao}
                  taxaRetrabalho={tech.taxaRetrabalho}
                  performanceScore={tech.performanceScore}
                  rank={idx + 1}
                  moduleLabel={itemLabel}
                  onClick={() => setSelectedTech(tech)}
                  accentColor={accentColor}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Modal de Análise ── */}
      <TechnicianAnalysisModal
        open={!!selectedTech}
        onClose={() => setSelectedTech(null)}
        technician={selectedTech}
        moduleType={moduleType}
        moduleLabel={moduleLabel}
        accentColor={accentColor}
      />
    </div>
  );
}
