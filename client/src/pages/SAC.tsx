/**
 * SAC — Página de Atendimentos SAC (Internos)
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 */

import React from 'react';
import { useData } from '@/contexts/DataContext';
import { PerformancePage } from '@/components/PerformancePage';

export default function SAC() {
  const { sacTecnicos, sacFile, uploadSACFile, isLoading } = useData();

  const technicians = sacTecnicos.map(t => ({
    nome: t.nome,
    totalItems: t.totalAtendimentos,
    resolvedItems: t.atendimentosResolvidos,
    reopenedItems: t.atendimentosReabertos,
    tempoMedioMin: t.tempoMedioMin,
    qualidadeDescricao: t.qualidadeDescricao,
    taxaRetrabalho: t.taxaRetrabalho,
    performanceScore: t.performanceScore,
  }));

  return (
    <PerformancePage
      title="SAC"
      subtitle="Análise de performance dos atendimentos internos de SAC"
      moduleType="SAC"
      moduleLabel="SAC"
      itemLabel="Atendimentos"
      technicians={technicians}
      uploadedFile={sacFile}
      onUpload={uploadSACFile}
      isLoading={isLoading}
      accentColor="emerald"
      uploadColor="emerald"
    />
  );
}
