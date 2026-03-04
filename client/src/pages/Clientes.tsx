/**
 * Clientes — Página de Clientes Recorrentes (cruzamento OS + SAC + Matrix)
 * Identifica clientes com mais de 1 ocorrência nos últimos 3 meses
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Users, Search, AlertTriangle, TrendingUp, FileDown,
  Wrench, Headphones, LayoutGrid, ChevronRight, Loader2,
  Info, RefreshCw, Calendar, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData, type ClienteRecorrente } from '@/contexts/DataContext';
import { generateClienteActionPlan } from '@/lib/actionPlanGenerator';
import { exportClientePlanToPDF } from '@/lib/exportPDF';
import { toast } from 'sonner';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Ícones por fonte ─────────────────────────────────────────────────────────

const fonteConfig = {
  OS: { icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-800' },
  SAC: { icon: Headphones, color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-800' },
  Matrix: { icon: LayoutGrid, color: 'text-violet-600', bg: 'bg-violet-50', badge: 'bg-violet-100 text-violet-800' },
};

const priorityConfig = {
  Alta: { color: 'bg-red-100 text-red-800 border-red-300', border: 'border-l-red-500', dot: 'bg-red-500' },
  Média: { color: 'bg-amber-100 text-amber-800 border-amber-300', border: 'border-l-amber-500', dot: 'bg-amber-500' },
  Baixa: { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', border: 'border-l-emerald-500', dot: 'bg-emerald-500' },
};

// ─── Card de Cliente ──────────────────────────────────────────────────────────

function ClienteCard({ cliente, onClick }: { cliente: ClienteRecorrente; onClick: () => void }) {
  const pConfig = priorityConfig[cliente.prioridade];

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card border border-border border-l-4 rounded-xl p-4 cursor-pointer card-hover',
        pConfig.border
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground truncate">{cliente.nome}</h3>
          </div>
          {cliente.documento && cliente.documento !== cliente.nome && (
            <p className="text-xs text-muted-foreground mb-2">{cliente.documento}</p>
          )}

          {/* Fontes */}
          <div className="flex flex-wrap gap-1 mb-2">
            {cliente.fontes.map((fonte) => {
              const fc = fonteConfig[fonte];
              const Icon = fc.icon;
              return (
                <span key={fonte} className={cn('text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium', fc.badge)}>
                  <Icon className="w-3 h-3" />
                  {fonte}
                </span>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{cliente.totalOcorrencias}x</span>
              <span>ocorrências</span>
              {cliente.ultimaOcorrencia && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {cliente.ultimaOcorrencia}
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <Badge className={cn('text-xs whitespace-nowrap', pConfig.color)}>
          {cliente.prioridade}
        </Badge>
      </div>
    </div>
  );
}

// ─── Modal de Análise do Cliente ──────────────────────────────────────────────

function ClienteModal({ cliente, onClose }: { cliente: ClienteRecorrente | null; onClose: () => void }) {
  const [isExporting, setIsExporting] = useState(false);

  if (!cliente) return null;

  const plan = generateClienteActionPlan({
    nome: cliente.nome,
    totalOcorrencias: cliente.totalOcorrencias,
    fontes: cliente.fontes,
    ultimaOcorrencia: cliente.ultimaOcorrencia,
  });

  const pConfig = priorityConfig[cliente.prioridade];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportClientePlanToPDF(plan);
      toast.success(`PDF exportado para ${cliente.nome}`);
    } catch {
      toast.error('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={!!cliente} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="bg-sidebar px-6 py-4 flex-shrink-0">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-white text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {cliente.nome}
                </DialogTitle>
                <p className="text-white/60 text-sm mt-0.5">
                  {cliente.totalOcorrencias} ocorrências · {cliente.fontes.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn('text-xs', pConfig.color)}>
                  Prioridade {cliente.prioridade}
                </Badge>
                <Button
                  onClick={handleExport}
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
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Causa Raiz */}
          <Card className={cn('border-l-4 shadow-sm', pConfig.border)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className={cn('w-4 h-4 flex-shrink-0 mt-0.5',
                  cliente.prioridade === 'Alta' ? 'text-red-500' :
                  cliente.prioridade === 'Média' ? 'text-amber-500' : 'text-emerald-500'
                )} />
                <div>
                  <p className="text-sm font-semibold">Causa Raiz Identificada</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{plan.causaRaiz}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ações Recomendadas</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {plan.acoes.map((acao, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className={cn(
                      'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white',
                      cliente.prioridade === 'Alta' ? 'bg-red-500' :
                      cliente.prioridade === 'Média' ? 'bg-amber-500' : 'bg-emerald-500'
                    )}>
                      {idx + 1}
                    </span>
                    <span className="text-muted-foreground leading-relaxed">{acao}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Indicadores */}
          <Card className="shadow-sm bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Indicadores de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {plan.indicadores.map((ind, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-emerald-500">✓</span>
                    {ind}
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Responsável: {plan.responsavel}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Prazo: {plan.prazo}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Ocorrências */}
          {cliente.ocorrencias.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Histórico de Ocorrências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cliente.ocorrencias.map((oc, idx) => {
                    const fc = fonteConfig[oc.tipo];
                    const Icon = fc.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50">
                        <div className={cn('p-1.5 rounded-md flex-shrink-0', fc.bg)}>
                          <Icon className={cn('w-3 h-3', fc.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', fc.badge)}>{oc.tipo}</span>
                            {oc.data && <span className="text-xs text-muted-foreground">{oc.data}</span>}
                            {oc.tecnico && <span className="text-xs text-muted-foreground">· {oc.tecnico}</span>}
                          </div>
                          {oc.descricao && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{oc.descricao}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function Clientes() {
  const { clientesRecorrentes, osFile, sacFile, matrixFile } = useData();
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<'Todos' | 'Alta' | 'Média' | 'Baixa'>('Todos');
  const [selectedCliente, setSelectedCliente] = useState<ClienteRecorrente | null>(null);

  const hasAnyFile = !!(osFile || sacFile || matrixFile);
  const filesCount = [osFile, sacFile, matrixFile].filter(Boolean).length;

  const filtered = useMemo(() => {
    return clientesRecorrentes.filter(c => {
      const matchSearch = c.nome.toLowerCase().includes(search.toLowerCase()) ||
        c.documento.toLowerCase().includes(search.toLowerCase());
      const matchPriority = filterPriority === 'Todos' || c.prioridade === filterPriority;
      return matchSearch && matchPriority;
    });
  }, [clientesRecorrentes, search, filterPriority]);

  // KPIs
  const kpis = useMemo(() => {
    const alta = clientesRecorrentes.filter(c => c.prioridade === 'Alta').length;
    const media = clientesRecorrentes.filter(c => c.prioridade === 'Média').length;
    const baixa = clientesRecorrentes.filter(c => c.prioridade === 'Baixa').length;
    const maxOcorrencias = clientesRecorrentes.length > 0
      ? Math.max(...clientesRecorrentes.map(c => c.totalOcorrencias))
      : 0;
    return { alta, media, baixa, maxOcorrencias };
  }, [clientesRecorrentes]);

  // Pie chart data
  const pieData = [
    { name: 'Alta', value: kpis.alta, color: '#EF4444' },
    { name: 'Média', value: kpis.media, color: '#F59E0B' },
    { name: 'Baixa', value: kpis.baixa, color: '#10B981' },
  ].filter(d => d.value > 0);

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-amber-400" />
      </div>
      {!hasAnyFile ? (
        <>
          <h3 className="text-base font-semibold text-foreground mb-1">Nenhuma base carregada</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Carregue pelo menos um arquivo nas telas de OS, SAC ou Matrix para identificar clientes recorrentes
          </p>
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold text-foreground mb-1">Nenhum cliente recorrente encontrado</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Não foram identificados clientes com mais de 1 ocorrência nos arquivos carregados.
            Verifique se os arquivos possuem uma coluna de identificação do cliente.
          </p>
        </>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                Clientes Recorrentes
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Cruzamento dos 3 relatórios — clientes com mais de 1 ocorrência
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: 'OS', file: osFile, color: 'bg-blue-500' },
                { label: 'SAC', file: sacFile, color: 'bg-emerald-500' },
                { label: 'Matrix', file: matrixFile, color: 'bg-violet-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={cn('w-2 h-2 rounded-full', item.file ? item.color : 'bg-gray-300')} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        {hasAnyFile && (
          <CardContent>
            <div className={cn(
              'flex items-center gap-2 p-3 rounded-lg text-sm',
              filesCount === 3 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            )}>
              <Info className="w-4 h-4 flex-shrink-0" />
              {filesCount === 3
                ? 'Todos os 3 arquivos carregados. Cruzamento completo de dados.'
                : `${filesCount} de 3 arquivo(s) carregado(s). Carregue os demais para um cruzamento mais completo.`
              }
            </div>
          </CardContent>
        )}
      </Card>

      {clientesRecorrentes.length === 0 ? emptyState : (
        <>
          {/* ── KPIs ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Recorrentes', value: clientesRecorrentes.length, icon: Users, color: 'text-amber-600' },
              { label: 'Prioridade Alta', value: kpis.alta, icon: AlertTriangle, color: 'text-red-600' },
              { label: 'Prioridade Média', value: kpis.media, icon: TrendingUp, color: 'text-amber-600' },
              { label: 'Máx. Ocorrências', value: kpis.maxOcorrencias, icon: RefreshCw, color: 'text-violet-600' },
            ].map((kpi) => (
              <Card key={kpi.label} className="shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <kpi.icon className={cn('w-3.5 h-3.5', kpi.color)} />
                  </div>
                  <p className={cn('text-2xl font-bold', kpi.color)}>{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Gráfico de Prioridades ── */}
          {pieData.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Distribuição por Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [`${val} clientes`, '']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* ── Filtros ── */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex gap-1">
              {(['Todos', 'Alta', 'Média', 'Baixa'] as const).map((p) => (
                <Button
                  key={p}
                  variant={filterPriority === p ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 text-xs"
                  onClick={() => setFilterPriority(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {filtered.length} clientes · Clique para ver análise e plano de retenção
          </p>

          {/* ── Lista ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((cliente) => (
              <ClienteCard
                key={cliente.documento || cliente.nome}
                cliente={cliente}
                onClick={() => setSelectedCliente(cliente)}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Modal ── */}
      <ClienteModal
        cliente={selectedCliente}
        onClose={() => setSelectedCliente(null)}
      />
    </div>
  );
}
