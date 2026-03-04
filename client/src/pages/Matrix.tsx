/**
 * Matrix — Página de Atendimentos de Agentes Internos (Matrix)
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 */

import React from 'react';
import { useData } from '@/contexts/DataContext';
import { PerformancePage } from '@/components/PerformancePage';

export default function Matrix() {
  const { matrixAgentes, matrixFile, uploadMatrixFile, isLoading } = useData();

  const technicians = matrixAgentes.map(t => ({
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
      title="Matrix"
      subtitle="Análise de performance dos agentes internos da Matrix"
      moduleType="Matrix"
      moduleLabel="Matrix"
      itemLabel="Atendimentos"
      technicians={technicians}
      uploadedFile={matrixFile}
      onUpload={uploadMatrixFile}
      isLoading={isLoading}
      accentColor="violet"
      uploadColor="violet"
    />
  );
}
