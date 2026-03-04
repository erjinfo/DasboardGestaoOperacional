/**
 * TechnicianAnalysisModal — Modal de análise individual do técnico/agente
 * Exibe métricas detalhadas + plano de ação + reincidências + botão exportar PDF
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileDown, BarChart2, Target, Star, TrendingUp, TrendingDown,
  Clock, RotateCcw, CheckCircle2, AlertTriangle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionPlanDisplay } from './ActionPlanDisplay';
import { generateActionPlan, type PerformanceMetrics, type GeneratedActionPlan } from '@/lib/actionPlanGenerator';
import { exportTechnicianPlanToPDF } from '@/lib/exportPDF';
import { toast } from 'sonner';

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

interface TechnicianAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  technician: TechnicianData | null;
  moduleType: 'OS' | 'SAC' | 'Matrix';
  moduleLabel: string;
  accentColor?: 'blue' | 'emerald' | 'violet';
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className={cn('text-2xl font-bold mt-1', color)}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={cn('p-2 rounded-lg bg-gray-50')}>
            <Icon className={cn('w-4 h-4', color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TechnicianAnalysisModal({
  open,
  onClose,
  technician,
  moduleType,
  moduleLabel,
  accentColor = 'blue',
}: TechnicianAnalysisModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!technician) return null;

  const metrics: PerformanceMetrics = {
    name: technician.nome,
    performanceScore: technician.performanceScore,
    descriptionQuality: technician.qualidadeDescricao,
    reworkRate: technician.taxaRetrabalho,
    averageExecutionTime: technician.tempoMedioMin,
    totalItems: technician.totalItems,
    resolvedItems: technician.resolvedItems,
    reopenedItems: technician.reopenedItems,
    moduleType,
  };

  const plan: GeneratedActionPlan = generateActionPlan(metrics);

  const taxaConclusao = technician.totalItems > 0
    ? Math.round((technician.resolvedItems / technician.totalItems) * 100)
    : 0;

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportTechnicianPlanToPDF(plan, technician.nome);
      toast.success(`PDF exportado para ${technician.nome}`);
    } catch (e) {
      toast.error('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const scoreColor = technician.performanceScore >= 80 ? 'text-emerald-600' :
    technician.performanceScore >= 60 ? 'text-amber-600' : 'text-red-600';

  const accentColors = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    violet: 'text-violet-600',
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="bg-sidebar px-6 py-4 flex-shrink-0">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-white text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {technician.nome}
                </DialogTitle>
                <p className="text-white/60 text-sm mt-0.5">{moduleLabel} · Análise Individual</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  'text-sm font-bold px-3 py-1',
                  technician.performanceScore >= 80 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  technician.performanceScore >= 60 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  'bg-red-500/20 text-red-300 border-red-500/40'
                )}>
                  <Star className="w-3 h-3 mr-1" />
                  Score: {technician.performanceScore}
                </Badge>
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 border"
                >
                  {isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Exportar PDF
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Tabs defaultValue="metricas">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="metricas" className="flex-1 gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" />
                Métricas
              </TabsTrigger>
              <TabsTrigger value="plano" className="flex-1 gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Plano de Ação
              </TabsTrigger>
              {technician.reincidencias && technician.reincidencias.length > 0 && (
                <TabsTrigger value="reincidencias" className="flex-1 gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Reincidências
                </TabsTrigger>
              )}
            </TabsList>

            {/* ── Aba Métricas ── */}
            <TabsContent value="metricas" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="Total de Itens"
                  value={technician.totalItems}
                  icon={BarChart2}
                  color={accentColors[accentColor]}
                />
                <StatCard
                  label="Taxa de Conclusão"
                  value={`${taxaConclusao}%`}
                  sub={`${technician.resolvedItems} resolvidos`}
                  icon={CheckCircle2}
                  color="text-emerald-600"
                />
                <StatCard
                  label="Taxa de Retrabalho"
                  value={`${technician.taxaRetrabalho}%`}
                  sub={`${technician.reopenedItems} reabertos`}
                  icon={RotateCcw}
                  color={technician.taxaRetrabalho > 20 ? 'text-red-600' : 'text-amber-600'}
                />
                <StatCard
                  label="Tempo Médio"
                  value={`${technician.tempoMedioMin}m`}
                  icon={Clock}
                  color="text-blue-600"
                />
              </div>

              {/* Barras de indicadores */}
              <Card className="shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-sm font-semibold">Análise de Indicadores</h3>

                  {[
                    {
                      label: 'Performance Geral',
                      value: technician.performanceScore,
                      color: technician.performanceScore >= 80 ? 'bg-emerald-500' :
                        technician.performanceScore >= 60 ? 'bg-amber-500' : 'bg-red-500',
                    },
                    {
                      label: 'Qualidade de Descrição',
                      value: technician.qualidadeDescricao,
                      color: technician.qualidadeDescricao >= 80 ? 'bg-emerald-500' :
                        technician.qualidadeDescricao >= 60 ? 'bg-amber-500' : 'bg-red-500',
                    },
                    {
                      label: 'Taxa de Conclusão',
                      value: taxaConclusao,
                      color: taxaConclusao >= 80 ? 'bg-emerald-500' :
                        taxaConclusao >= 60 ? 'bg-amber-500' : 'bg-red-500',
                    },
                    {
                      label: 'Eficiência (sem retrabalho)',
                      value: Math.max(0, 100 - technician.taxaRetrabalho),
                      color: (100 - technician.taxaRetrabalho) >= 80 ? 'bg-emerald-500' :
                        (100 - technician.taxaRetrabalho) >= 60 ? 'bg-amber-500' : 'bg-red-500',
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="font-bold text-foreground">{item.value}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', item.color)}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Diagnóstico */}
              <Card className={cn(
                'shadow-sm border-l-4',
                plan.priority === 'Alta' ? 'border-red-500' :
                plan.priority === 'Média' ? 'border-amber-500' : 'border-emerald-500'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    {plan.priority === 'Alta' ? (
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : plan.priority === 'Média' ? (
                      <TrendingDown className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">
                        Área Crítica Identificada: <span className="text-primary">{plan.focusArea}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Aba Plano de Ação ── */}
            <TabsContent value="plano" className="mt-0">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Plano gerado automaticamente com base nos indicadores de performance
                </p>
                <Button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                >
                  {isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  Exportar PDF
                </Button>
              </div>
              <ActionPlanDisplay plan={plan} personName={technician.nome} />
            </TabsContent>

            {/* ── Aba Reincidências ── */}
            {technician.reincidencias && technician.reincidencias.length > 0 && (
              <TabsContent value="reincidencias" className="mt-0 space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Clientes com Reincidência</p>
                    <p className="text-xs text-red-700 mt-0.5">
                      {technician.reincidencias.length} cliente(s) com mais de uma OS resolvida por este técnico
                    </p>
                  </div>
                </div>

                {technician.reincidencias.map((reincidencia, idx) => (
                  <Card key={idx} className="shadow-sm border-l-4 border-red-500">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-bold text-foreground">{reincidencia.cliente}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {reincidencia.numeroOS.length} Ordens de Serviço
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-foreground">Histórico:</p>
                          {reincidencia.datas.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                              <div className="flex-1">
                                <p className="text-foreground font-medium">{item.data}</p>
                                <p className="text-muted-foreground">Técnico: {item.tecnico}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">
                            ⚠️ Este cliente teve múltiplas ocorrências. Investigar causa raiz e implementar solução definitiva.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
