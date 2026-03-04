/**
 * ActionPlanDisplay — Exibição de Plano de Ação Personalizado
 * Adaptado do template da skill personalized-action-plans
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock, Target, Calendar, User } from 'lucide-react';
import type { GeneratedActionPlan } from '@/lib/actionPlanGenerator';

interface ActionPlanDisplayProps {
  plan: GeneratedActionPlan;
  personName: string;
}

const priorityConfig = {
  Alta: {
    color: 'bg-red-100 text-red-800 border-red-300',
    bgColor: 'bg-red-50',
    accentColor: 'border-red-500',
    barColor: 'bg-red-500',
    icon: AlertCircle,
    label: 'Prioridade Alta',
  },
  Média: {
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    bgColor: 'bg-amber-50',
    accentColor: 'border-amber-500',
    barColor: 'bg-amber-500',
    icon: Clock,
    label: 'Prioridade Média',
  },
  Baixa: {
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bgColor: 'bg-emerald-50',
    accentColor: 'border-emerald-500',
    barColor: 'bg-emerald-500',
    icon: CheckCircle2,
    label: 'Prioridade Baixa',
  },
};

export function ActionPlanDisplay({ plan, personName }: ActionPlanDisplayProps) {
  const config = priorityConfig[plan.priority];
  const PriorityIcon = config.icon;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const calcProgress = (current: number, target: number) =>
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div className="space-y-4 w-full">
      {/* ── Cabeçalho ── */}
      <Card className={`border-l-4 ${config.accentColor} shadow-sm`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Plano de Ação
                </span>
              </div>
              <CardTitle className="text-lg leading-tight">{plan.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            </div>
            <Badge className={`${config.color} flex items-center gap-1 whitespace-nowrap text-xs`}>
              <PriorityIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Área de Foco', value: plan.focusArea },
              { label: 'Duração', value: plan.duration },
              { label: 'Início', value: formatDate(plan.startDate) },
              { label: 'Término', value: formatDate(plan.endDate) },
            ].map((item) => (
              <div key={item.label} className={`p-2.5 rounded-lg ${config.bgColor}`}>
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Métricas de Sucesso ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Métricas de Sucesso</CardTitle>
          <p className="text-xs text-muted-foreground">Indicadores monitorados durante o plano</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.metrics.map((metric, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold leading-tight">{metric.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{metric.description}</p>
                </div>
                <Badge variant="outline" className="text-xs whitespace-nowrap ml-2">
                  {metric.current} → {metric.target} {metric.unit}
                </Badge>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`${config.barColor} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${calcProgress(metric.current, metric.target)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Marcos ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cronograma de Marcos</CardTitle>
          <p className="text-xs text-muted-foreground">Etapas para atingir os objetivos</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plan.milestones.map((milestone, idx) => (
              <div
                key={milestone.id}
                className={`relative pl-8 pb-3 ${idx < plan.milestones.length - 1 ? 'border-l-2 border-gray-200 ml-3' : 'ml-3'}`}
              >
                <div className="absolute -left-3.5 top-0 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                  {milestone.id}
                </div>
                <div className="bg-gray-50 rounded-lg p-3 ml-2">
                  <h4 className="text-sm font-semibold">{milestone.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{milestone.description}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(milestone.scheduledDate)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      {milestone.responsible}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Próximos Passos ── */}
      <Card className={`border-l-4 ${config.accentColor} shadow-sm`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {plan.nextSteps.map((step, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className={`flex-shrink-0 w-5 h-5 rounded-full ${config.bgColor} flex items-center justify-center text-xs font-bold`}>
                  {idx + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

export default ActionPlanDisplay;
