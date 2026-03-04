/**
 * Gerador de Planos de Ação Personalizados
 * Adaptado da skill personalized-action-plans para o Dashboard de Performance
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 */

export interface PerformanceMetrics {
  name: string;
  performanceScore: number;
  descriptionQuality: number;
  reworkRate: number;
  averageExecutionTime: number; // em minutos
  totalItems: number;
  resolvedItems: number;
  reopenedItems: number;
  moduleType: 'OS' | 'SAC' | 'Matrix';
}

export interface ActionPlanMilestone {
  id: number;
  title: string;
  description: string;
  scheduledDate: string;
  responsible: string;
}

export interface ActionPlanMetric {
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
}

export interface GeneratedActionPlan {
  id?: string;
  name: string;
  title: string;
  description: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  focusArea: string;
  duration: string;
  startDate: string;
  endDate: string;
  metrics: ActionPlanMetric[];
  milestones: ActionPlanMilestone[];
  nextSteps: string[];
  moduleType: 'OS' | 'SAC' | 'Matrix';
}

function identifyWeakestArea(metrics: PerformanceMetrics) {
  const moduleLabel = metrics.moduleType === 'OS' ? 'Ordens de Serviço' :
    metrics.moduleType === 'SAC' ? 'SAC' : 'Matrix';

  const areas = [
    {
      name: 'Qualidade de Descrição',
      score: metrics.descriptionQuality,
      description: `Melhorar a qualidade e clareza das descrições nos atendimentos de ${moduleLabel}`,
    },
    {
      name: 'Taxa de Retrabalho',
      score: 100 - metrics.reworkRate,
      description: `Reduzir a necessidade de retrabalho e reabertura de chamados em ${moduleLabel}`,
    },
    {
      name: 'Tempo de Execução',
      score: Math.max(0, 100 - (metrics.averageExecutionTime / 480) * 100),
      description: `Otimizar o tempo médio de atendimento em ${moduleLabel}`,
    },
  ];

  return areas.reduce((weakest, current) =>
    current.score < weakest.score ? current : weakest
  );
}

function calculateMilestoneDates(startDate: Date, durationDays: number): string[] {
  const dates: string[] = [];
  const interval = Math.floor(durationDays / 4);
  for (let i = 1; i <= 4; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + interval * i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

export function generateActionPlan(metrics: PerformanceMetrics): GeneratedActionPlan {
  const weakestArea = identifyWeakestArea(metrics);
  const today = new Date();
  const durationDays = 30;
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + durationDays);
  const milestoneDates = calculateMilestoneDates(today, durationDays);

  let priority: 'Alta' | 'Média' | 'Baixa' = 'Média';
  if (metrics.performanceScore < 70) priority = 'Alta';
  if (metrics.performanceScore >= 85) priority = 'Baixa';

  const moduleLabel = metrics.moduleType === 'OS' ? 'Ordens de Serviço' :
    metrics.moduleType === 'SAC' ? 'SAC' : 'Matrix';

  const taxaConclusao = metrics.totalItems > 0
    ? Math.round((metrics.resolvedItems / metrics.totalItems) * 100)
    : 0;

  const successMetrics: ActionPlanMetric[] = [
    {
      title: `Elevar performance geral de ${metrics.performanceScore} para ${Math.min(100, metrics.performanceScore + 20)} pontos`,
      description: `Aumentar o score de performance em ${moduleLabel} em 20 pontos`,
      target: Math.min(100, metrics.performanceScore + 20),
      current: metrics.performanceScore,
      unit: 'pts',
    },
    {
      title: `Melhorar ${weakestArea.name} — área mais crítica identificada`,
      description: weakestArea.description,
      target: Math.min(100, Math.round(weakestArea.score + 25)),
      current: Math.round(weakestArea.score),
      unit: 'pts',
    },
    {
      title: `Aumentar taxa de conclusão de ${taxaConclusao}% para ${Math.min(100, taxaConclusao + 15)}%`,
      description: 'Reduzir reabertura e aumentar resolução definitiva dos atendimentos',
      target: Math.min(100, taxaConclusao + 15),
      current: taxaConclusao,
      unit: '%',
    },
  ];

  const milestones: ActionPlanMilestone[] = [
    {
      id: 1,
      title: 'Diagnóstico e Alinhamento',
      description: `Reunião de apresentação dos dados de performance em ${moduleLabel} e definição de metas individuais`,
      scheduledDate: milestoneDates[0],
      responsible: 'Gestor',
    },
    {
      id: 2,
      title: 'Treinamento Focado',
      description: `Capacitação específica em ${weakestArea.name}: workshops, materiais e acompanhamento prático`,
      scheduledDate: milestoneDates[1],
      responsible: 'Instrutor / Gestor',
    },
    {
      id: 3,
      title: 'Implementação e Monitoramento',
      description: `Aplicação das melhorias no dia a dia com acompanhamento semanal dos indicadores`,
      scheduledDate: milestoneDates[2],
      responsible: metrics.name,
    },
    {
      id: 4,
      title: 'Avaliação Final e Feedback',
      description: 'Revisão dos resultados, comparação com metas e definição de próximos passos',
      scheduledDate: milestoneDates[3],
      responsible: 'Gestor',
    },
  ];

  const nextSteps: string[] = [
    `Agendar reunião com ${metrics.name} para apresentar este plano (até ${today.toLocaleDateString('pt-BR')})`,
    `Compartilhar relatório de performance atual e explicar os indicadores de ${moduleLabel}`,
    'Obter assinatura do compromisso de melhoria e definir metas acordadas',
    `Iniciar treinamento em ${weakestArea.name} conforme cronograma`,
    'Realizar check-ins semanais para monitorar progresso e ajustar o plano',
    `Avaliar resultados finais em ${endDate.toLocaleDateString('pt-BR')} e documentar evolução`,
  ];

  return {
    name: metrics.name,
    title: `Plano de Melhoria — ${weakestArea.name}`,
    description: `Plano estruturado para ${metrics.name} melhorar ${weakestArea.name.toLowerCase()} nos atendimentos de ${moduleLabel}. Foco em elevar performance de ${metrics.performanceScore} para ${Math.min(100, metrics.performanceScore + 20)} pontos em 30 dias.`,
    priority,
    focusArea: weakestArea.name,
    duration: `${Math.floor(durationDays / 7)} semanas e ${durationDays % 7} dias`,
    startDate: today.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    metrics: successMetrics,
    milestones,
    nextSteps,
    moduleType: metrics.moduleType,
  };
}

// ─── Gerador de plano para clientes recorrentes ───────────────────────────────

export interface ClienteMetrics {
  nome: string;
  totalOcorrencias: number;
  fontes: string[];
  ultimaOcorrencia: string;
}

export interface ClienteActionPlan {
  nome: string;
  title: string;
  description: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  causaRaiz: string;
  acoes: string[];
  responsavel: string;
  prazo: string;
  indicadores: string[];
}

export function generateClienteActionPlan(cliente: ClienteMetrics): ClienteActionPlan {
  const priority: 'Alta' | 'Média' | 'Baixa' =
    cliente.totalOcorrencias >= 5 ? 'Alta' :
    cliente.totalOcorrencias >= 3 ? 'Média' : 'Baixa';

  const prazoDate = new Date();
  prazoDate.setDate(prazoDate.getDate() + (priority === 'Alta' ? 7 : priority === 'Média' ? 14 : 21));

  const fontesStr = cliente.fontes.join(', ');

  const causas: Record<string, string> = {
    'Alta': 'Problema recorrente não resolvido na origem — possível falha sistêmica ou de processo',
    'Média': 'Solução parcial ou temporária aplicada nas ocorrências anteriores',
    'Baixa': 'Ocorrências pontuais que podem indicar necessidade de orientação ao cliente',
  };

  const acoes: Record<string, string[]> = {
    'Alta': [
      `Contato imediato com ${cliente.nome} para entender a raiz do problema`,
      `Análise das ${cliente.totalOcorrencias} ocorrências em ${fontesStr} para identificar padrão`,
      'Escalação para equipe especializada com prazo de resolução definitiva',
      'Acompanhamento diário até resolução completa',
      'Reunião de alinhamento com gestores das áreas envolvidas',
    ],
    'Média': [
      `Revisão das ocorrências anteriores de ${cliente.nome} em ${fontesStr}`,
      'Identificar se há falha no processo de atendimento ou no produto/serviço',
      'Propor solução definitiva e comunicar prazo ao cliente',
      'Monitoramento semanal por 30 dias após resolução',
    ],
    'Baixa': [
      `Entrar em contato com ${cliente.nome} para entender necessidades recorrentes`,
      'Verificar se há oportunidade de treinamento ou orientação proativa',
      'Documentar padrão de ocorrências para análise futura',
    ],
  };

  return {
    nome: cliente.nome,
    title: `Plano de Retenção — ${cliente.nome}`,
    description: `Cliente com ${cliente.totalOcorrencias} ocorrências registradas em ${fontesStr}. Última ocorrência: ${cliente.ultimaOcorrencia || 'N/A'}. Prioridade ${priority} de resolução.`,
    priority,
    causaRaiz: causas[priority],
    acoes: acoes[priority],
    responsavel: 'Gestor de Relacionamento',
    prazo: prazoDate.toLocaleDateString('pt-BR'),
    indicadores: [
      'Zero novas ocorrências nos próximos 30 dias',
      'NPS do cliente ≥ 8 após resolução',
      'Confirmação de satisfação em follow-up',
    ],
  };
}
