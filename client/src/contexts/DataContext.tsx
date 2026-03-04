/**
 * DataContext — Contexto global de dados do Dashboard de Performance
 * Gerencia os 3 arquivos de base de dados e os dados processados de cada módulo.
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// ─── Tipos de dados ────────────────────────────────────────────────────────────

export interface OSTecnico {
  nome: string;
  totalOS: number;
  osConcluidas: number;
  osReabertas: number;
  tempoMedioMin: number;
  qualidadeDescricao: number; // 0-100
  taxaRetrabalho: number; // 0-100
  performanceScore: number; // calculado
  reincidencias: {
    cliente: string; // nome_razaosocial
    numeroOS: string[];
    datas: { data: string; tecnico: string }[];
  }[];
}

export interface SACTecnico {
  nome: string;
  totalAtendimentos: number;
  atendimentosResolvidos: number;
  atendimentosReabertos: number;
  tempoMedioMin: number;
  qualidadeDescricao: number;
  taxaRetrabalho: number;
  performanceScore: number;
}

export interface MatrixAgente {
  nome: string;
  totalAtendimentos: number;
  atendimentosResolvidos: number;
  atendimentosReabertos: number;
  tempoMedioMin: number;
  qualidadeDescricao: number;
  taxaRetrabalho: number;
  performanceScore: number;
}

export interface ClienteRecorrente {
  nome: string;
  documento: string; // CPF/CNPJ
  totalOcorrencias: number;
  fontes: ('OS' | 'SAC' | 'Matrix')[];
  ocorrencias: {
    data: string;
    tipo: 'OS' | 'SAC' | 'Matrix';
    descricao: string;
    tecnico: string;
  }[];
  ultimaOcorrencia: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
}

export interface DataFile {
  name: string;
  uploadedAt: string;
  rowCount: number;
  raw: Record<string, string | number>[];
}

interface DataContextType {
  // Arquivos carregados
  osFile: DataFile | null;
  sacFile: DataFile | null;
  matrixFile: DataFile | null;

  // Dados processados
  osTecnicos: OSTecnico[];
  sacTecnicos: SACTecnico[];
  matrixAgentes: MatrixAgente[];
  clientesRecorrentes: ClienteRecorrente[];

  // Funções de upload
  uploadOSFile: (file: File) => Promise<void>;
  uploadSACFile: (file: File) => Promise<void>;
  uploadMatrixFile: (file: File) => Promise<void>;

  // Estado de carregamento
  isLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | null>(null);

// ─── Funções de parsing ────────────────────────────────────────────────────────

async function parseFile(file: File): Promise<Record<string, string | number>[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result) => resolve(result.data as Record<string, string | number>[]),
        error: (err) => reject(err),
      });
    });
  } else if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, string | number>[];
  }

  throw new Error('Formato de arquivo não suportado. Use CSV, XLSX ou XLS.');
}

// ─── Funções de normalização de colunas ───────────────────────────────────────

function normalizeKey(key: string): string {
  return key.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function findColumn(row: Record<string, string | number>, candidates: string[]): string | number {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const found = keys.find(k => normalizeKey(k) === normalizeKey(candidate) ||
      normalizeKey(k).includes(normalizeKey(candidate)));
    if (found !== undefined) return row[found];
  }
  return '';
}

function toNumber(val: string | number, fallback = 0): number {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const n = parseFloat(String(val).replace(',', '.'));
  return isNaN(n) ? fallback : n;
}

function calcPerformanceScore(
  concluidas: number,
  total: number,
  retrabalho: number,
  qualidade: number
): number {
  if (total === 0) return 0;
  const taxaConclusao = (concluidas / total) * 100;
  const taxaRetrabalhoInv = Math.max(0, 100 - retrabalho);
  return Math.round((taxaConclusao * 0.4 + taxaRetrabalhoInv * 0.3 + qualidade * 0.3));
}

// ─── Processamento de OS ──────────────────────────────────────────────────────

function processOSData(raw: Record<string, string | number>[]): OSTecnico[] {
  const tecnicosMap = new Map<string, {
    totalOS: number; osConcluidas: number; osReabertas: number;
    tempoTotal: number; qualidadeTotal: number; retrabalhoTotal: number; count: number;
    clienteOSMap: Map<string, { numeroOS: Set<string>; datas: { data: string; tecnico: string }[] }>;
  }>();

  // Primeiro passo: agrupar dados por técnico
  for (const row of raw) {
    const nome = String(findColumn(row, ['tecnico', 'nome', 'responsavel', 'executor', 'name']) || 'Desconhecido').trim();
    if (!nome || nome === 'Desconhecido') continue;

    const status = String(findColumn(row, ['status', 'situacao', 'estado']) || '').toLowerCase();
    const concluida = status.includes('conclu') || status.includes('fechad') || status.includes('resolv') ? 1 : 0;
    const reaberta = status.includes('reabr') || status.includes('reopen') ? 1 : 0;
    const tempo = toNumber(findColumn(row, ['tempo', 'duracao', 'duration', 'minutos', 'minutes', 'horas']));
    const qualidade = toNumber(findColumn(row, ['qualidade', 'quality', 'nota', 'score', 'avaliacao']), 70);
    const retrabalho = toNumber(findColumn(row, ['retrabalho', 'rework', 'retorno']));
    const cliente = String(findColumn(row, ['cliente', 'nome_razaosocial', 'solicitante', 'nomecliente']) || '').trim();
    const numeroOS = String(findColumn(row, ['numero_ordem_servico', 'numero_os', 'os', 'id']) || '').trim();
    const data = String(findColumn(row, ['data', 'date', 'abertura', 'criacao']) || '').trim();

    if (!tecnicosMap.has(nome)) {
      tecnicosMap.set(nome, {
        totalOS: 0, osConcluidas: 0, osReabertas: 0, tempoTotal: 0, qualidadeTotal: 0, retrabalhoTotal: 0, count: 0,
        clienteOSMap: new Map(),
      });
    }
    const t = tecnicosMap.get(nome)!;
    t.totalOS++;
    t.osConcluidas += concluida;
    t.osReabertas += reaberta;
    t.tempoTotal += tempo > 0 ? tempo : 60;
    t.qualidadeTotal += qualidade > 0 ? qualidade : 70;
    t.retrabalhoTotal += retrabalho;
    t.count++;

    // Rastrear reincidências de cliente
    if (cliente && numeroOS) {
      if (!t.clienteOSMap.has(cliente)) {
        t.clienteOSMap.set(cliente, { numeroOS: new Set(), datas: [] });
      }
      const clienteData = t.clienteOSMap.get(cliente)!;
      clienteData.numeroOS.add(numeroOS);
      clienteData.datas.push({ data, tecnico: nome });
    }
  }

  return Array.from(tecnicosMap.entries()).map(([nome, d]) => {
    const qualidadeDescricao = Math.min(100, Math.round(d.qualidadeTotal / d.count));
    const taxaRetrabalho = d.osReabertas > 0
      ? Math.min(100, Math.round((d.osReabertas / d.totalOS) * 100))
      : Math.min(100, Math.round(d.retrabalhoTotal / d.count));
    const tempoMedioMin = Math.round(d.tempoTotal / d.count);
    const performanceScore = calcPerformanceScore(d.osConcluidas, d.totalOS, taxaRetrabalho, qualidadeDescricao);

    // Filtrar apenas clientes com mais de uma OS
    const reincidencias = Array.from(d.clienteOSMap.entries())
      .filter(([_, data]) => data.numeroOS.size > 1)
      .map(([cliente, data]) => ({
        cliente,
        numeroOS: Array.from(data.numeroOS),
        datas: data.datas,
      }));

    return {
      nome,
      totalOS: d.totalOS,
      osConcluidas: d.osConcluidas,
      osReabertas: d.osReabertas,
      tempoMedioMin,
      qualidadeDescricao,
      taxaRetrabalho,
      performanceScore,
      reincidencias,
    };
  }).sort((a, b) => b.totalOS - a.totalOS);
}

// ─── Processamento de SAC ─────────────────────────────────────────────────────

function processSACData(raw: Record<string, string | number>[]): SACTecnico[] {
  const map = new Map<string, {
    total: number; resolvidos: number; reabertos: number;
    tempoTotal: number; qualidadeTotal: number; retrabalhoTotal: number; count: number;
  }>();

  for (const row of raw) {
    // Usar usuario_fechamento em vez de nome_razaosocial
    const nome = String(findColumn(row, ['usuario_fechamento', 'tecnico', 'atendente', 'agente', 'operador', 'nome', 'responsavel', 'name']) || 'Desconhecido').trim();
    if (!nome || nome === 'Desconhecido') continue;

    const status = String(findColumn(row, ['status', 'situacao', 'estado']) || '').toLowerCase();
    const resolvido = status.includes('resolv') || status.includes('fechad') || status.includes('conclu') ? 1 : 0;
    const reaberto = status.includes('reabr') || status.includes('reopen') ? 1 : 0;
    const tempo = toNumber(findColumn(row, ['tempo', 'duracao', 'duration', 'minutos', 'tma']));
    const qualidade = toNumber(findColumn(row, ['qualidade', 'quality', 'nota', 'score', 'csat', 'avaliacao']), 70);
    const retrabalho = toNumber(findColumn(row, ['retrabalho', 'rework', 'retorno']));

    if (!map.has(nome)) {
      map.set(nome, { total: 0, resolvidos: 0, reabertos: 0, tempoTotal: 0, qualidadeTotal: 0, retrabalhoTotal: 0, count: 0 });
    }
    const t = map.get(nome)!;
    t.total++;
    t.resolvidos += resolvido;
    t.reabertos += reaberto;
    t.tempoTotal += tempo > 0 ? tempo : 15;
    t.qualidadeTotal += qualidade > 0 ? qualidade : 70;
    t.retrabalhoTotal += retrabalho;
    t.count++;
  }

  return Array.from(map.entries()).map(([nome, d]) => {
    const qualidadeDescricao = Math.min(100, Math.round(d.qualidadeTotal / d.count));
    const taxaRetrabalho = d.reabertos > 0
      ? Math.min(100, Math.round((d.reabertos / d.total) * 100))
      : Math.min(100, Math.round(d.retrabalhoTotal / d.count));
    const tempoMedioMin = Math.round(d.tempoTotal / d.count);
    const performanceScore = calcPerformanceScore(d.resolvidos, d.total, taxaRetrabalho, qualidadeDescricao);
    return { nome, totalAtendimentos: d.total, atendimentosResolvidos: d.resolvidos, atendimentosReabertos: d.reabertos, tempoMedioMin, qualidadeDescricao, taxaRetrabalho, performanceScore };
  }).sort((a, b) => b.totalAtendimentos - a.totalAtendimentos);
}

// ─── Processamento de Matrix ──────────────────────────────────────────────────

function processMatrixData(raw: Record<string, string | number>[]): MatrixAgente[] {
  return processSACData(raw).map(t => ({
    nome: t.nome,
    totalAtendimentos: t.totalAtendimentos,
    atendimentosResolvidos: t.atendimentosResolvidos,
    atendimentosReabertos: t.atendimentosReabertos,
    tempoMedioMin: t.tempoMedioMin,
    qualidadeDescricao: t.qualidadeDescricao,
    taxaRetrabalho: t.taxaRetrabalho,
    performanceScore: t.performanceScore,
  }));
}

// ─── Cruzamento de clientes ───────────────────────────────────────────────────

function crossClients(
  osRaw: Record<string, string | number>[],
  sacRaw: Record<string, string | number>[],
  matrixRaw: Record<string, string | number>[]
): ClienteRecorrente[] {
  const clienteMap = new Map<string, ClienteRecorrente>();

  const processSource = (raw: Record<string, string | number>[], tipo: 'OS' | 'SAC' | 'Matrix') => {
    for (const row of raw) {
      const clienteNome = String(
        findColumn(row, ['cliente', 'client', 'solicitante', 'nome cliente', 'razao social', 'nomecliente']) || ''
      ).trim();
      const doc = String(
        findColumn(row, ['cpf', 'cnpj', 'documento', 'doc', 'cpfcnpj']) || clienteNome
      ).trim();
      const data = String(
        findColumn(row, ['data', 'date', 'abertura', 'criacao', 'dataabertura']) || ''
      ).trim();
      const descricao = String(
        findColumn(row, ['descricao', 'description', 'assunto', 'subject', 'problema']) || ''
      ).trim();
      const tecnico = String(
        findColumn(row, ['tecnico', 'atendente', 'agente', 'responsavel']) || ''
      ).trim();

      if (!clienteNome || clienteNome.length < 2) continue;

      const key = doc || clienteNome;

      if (!clienteMap.has(key)) {
        clienteMap.set(key, {
          nome: clienteNome,
          documento: doc,
          totalOcorrencias: 0,
          fontes: [],
          ocorrencias: [],
          ultimaOcorrencia: data,
          prioridade: 'Baixa',
        });
      }

      const c = clienteMap.get(key)!;
      c.totalOcorrencias++;
      if (!c.fontes.includes(tipo)) c.fontes.push(tipo);
      c.ocorrencias.push({ data, tipo, descricao: descricao.slice(0, 100), tecnico });
      if (data > c.ultimaOcorrencia) c.ultimaOcorrencia = data;
    }
  };

  processSource(osRaw, 'OS');
  processSource(sacRaw, 'SAC');
  processSource(matrixRaw, 'Matrix');

  // Filtrar apenas clientes com mais de 1 ocorrência
  const recorrentes: ClienteRecorrente[] = [];
  for (const c of Array.from(clienteMap.values())) {
    if (c.totalOcorrencias > 1) {
      c.prioridade = c.totalOcorrencias >= 5 ? 'Alta' : c.totalOcorrencias >= 3 ? 'Média' : 'Baixa';
      recorrentes.push(c);
    }
  }

  return recorrentes.sort((a, b) => b.totalOcorrencias - a.totalOcorrencias);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [osFile, setOsFile] = useState<DataFile | null>(null);
  const [sacFile, setSacFile] = useState<DataFile | null>(null);
  const [matrixFile, setMatrixFile] = useState<DataFile | null>(null);

  const [osTecnicos, setOsTecnicos] = useState<OSTecnico[]>([]);
  const [sacTecnicos, setSacTecnicos] = useState<SACTecnico[]>([]);
  const [matrixAgentes, setMatrixAgentes] = useState<MatrixAgente[]>([]);
  const [clientesRecorrentes, setClientesRecorrentes] = useState<ClienteRecorrente[]>([]);

  const [osRaw, setOsRaw] = useState<Record<string, string | number>[]>([]);
  const [sacRaw, setSacRaw] = useState<Record<string, string | number>[]>([]);
  const [matrixRaw, setMatrixRaw] = useState<Record<string, string | number>[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadOSFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await parseFile(file);
      setOsRaw(raw);
      setOsFile({ name: file.name, uploadedAt: new Date().toLocaleString('pt-BR'), rowCount: raw.length, raw });
      setOsTecnicos(processOSData(raw));
      // Recalcular clientes se outros arquivos já estiverem carregados
      setClientesRecorrentes(crossClients(raw, sacRaw, matrixRaw));
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }, [sacRaw, matrixRaw]);

  const uploadSACFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await parseFile(file);
      setSacRaw(raw);
      setSacFile({ name: file.name, uploadedAt: new Date().toLocaleString('pt-BR'), rowCount: raw.length, raw });
      setSacTecnicos(processSACData(raw));
      setClientesRecorrentes(crossClients(osRaw, raw, matrixRaw));
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }, [osRaw, matrixRaw]);

  const uploadMatrixFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await parseFile(file);
      setMatrixRaw(raw);
      setMatrixFile({ name: file.name, uploadedAt: new Date().toLocaleString('pt-BR'), rowCount: raw.length, raw });
      setMatrixAgentes(processMatrixData(raw));
      setClientesRecorrentes(crossClients(osRaw, sacRaw, raw));
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }, [osRaw, sacRaw]);

  return (
    <DataContext.Provider value={{
      osFile, sacFile, matrixFile,
      osTecnicos, sacTecnicos, matrixAgentes, clientesRecorrentes,
      uploadOSFile, uploadSACFile, uploadMatrixFile,
      isLoading, error,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de DataProvider');
  }
  return context;
}
