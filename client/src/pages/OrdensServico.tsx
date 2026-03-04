/**
 * OrdensServico — Página de Ordens de Serviço (Time Técnico Externo)
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 */

import React from 'react';
import { useData } from '@/contexts/DataContext';
import { PerformancePage } from '@/components/PerformancePage';

export default function OrdensServico() {
  const { osTecnicos, osFile, uploadOSFile, isLoading, error } = useData();

  const technicians = osTecnicos.map(t => ({
    nome: t.nome,
    totalItems: t.totalOS,
    resolvedItems: t.osConcluidas,
    reopenedItems: t.osReabertas,
    tempoMedioMin: t.tempoMedioMin,
    qualidadeDescricao: t.qualidadeDescricao,
    taxaRetrabalho: t.taxaRetrabalho,
    performanceScore: t.performanceScore,
    reincidencias: t.reincidencias,
  }));

  return (
    <PerformancePage
      title="Ordens de Serviço"
      subtitle="Análise de performance do time técnico externo"
      moduleType="OS"
      moduleLabel="Ordens de Serviço"
      itemLabel="OS"
      technicians={technicians}
      uploadedFile={osFile}
      onUpload={uploadOSFile}
      isLoading={isLoading}
      accentColor="blue"
      uploadColor="blue"
    />
  );
}
