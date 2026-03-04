/**
 * Exportador de PDF — Planos de Ação e Compromissos de Melhoria
 * Usa jsPDF + jspdf-autotable para geração profissional
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { GeneratedActionPlan } from './actionPlanGenerator';
import type { ClienteActionPlan } from './actionPlanGenerator';

function getPriorityColor(priority: string): [number, number, number] {
  switch (priority) {
    case 'Alta': return [220, 53, 69];
    case 'Média': return [245, 158, 11];
    case 'Baixa': return [34, 197, 94];
    default: return [55, 48, 163];
  }
}

const INDIGO: [number, number, number] = [55, 48, 163];
const DARK_NAVY: [number, number, number] = [30, 58, 95];
const TEXT: [number, number, number] = [30, 30, 50];
const LIGHT_GRAY: [number, number, number] = [248, 250, 252];

// ─── PDF de Plano de Ação para Técnico ───────────────────────────────────────

export async function exportTechnicianPlanToPDF(
  plan: GeneratedActionPlan,
  personName: string
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  const priorityColor = getPriorityColor(plan.priority);
  const moduleLabel = plan.moduleType === 'OS' ? 'Ordens de Serviço' :
    plan.moduleType === 'SAC' ? 'SAC' : 'Matrix';

  // ── Cabeçalho ──
  doc.setFillColor(...DARK_NAVY);
  doc.rect(0, 0, pageWidth, 45, 'F');

  doc.setFillColor(...priorityColor);
  doc.rect(0, 45, pageWidth, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PLANO DE AÇÃO PERSONALIZADO', margin, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Módulo: ${moduleLabel}`, margin, 28);
  doc.text(`Técnico/Agente: ${personName}`, margin, 36);

  doc.setFontSize(10);
  doc.text(`Prioridade: ${plan.priority}`, pageWidth - margin - 45, 28);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 45, 36);

  y = 58;

  // ── Informações Gerais ──
  doc.setTextColor(...TEXT);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Informações Gerais', margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Campo', 'Valor']],
    body: [
      ['Objetivo', plan.title],
      ['Área de Foco', plan.focusArea],
      ['Duração', plan.duration],
      ['Início', new Date(plan.startDate).toLocaleDateString('pt-BR')],
      ['Término', new Date(plan.endDate).toLocaleDateString('pt-BR')],
    ],
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: INDIGO, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { textColor: TEXT, fontSize: 9 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Descrição ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Descrição do Plano', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const descLines = doc.splitTextToSize(plan.description, pageWidth - 2 * margin);
  doc.setTextColor(...TEXT);
  doc.text(descLines, margin, y);
  y += descLines.length * 4.5 + 8;

  // ── Métricas de Sucesso ──
  if (y > pageHeight - 70) { doc.addPage(); y = margin; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...TEXT);
  doc.text('Métricas de Sucesso', margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Métrica', 'Atual', 'Meta', 'Unidade']],
    body: plan.metrics.map(m => [m.title, String(m.current), String(m.target), m.unit]),
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: INDIGO, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { textColor: TEXT, fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 0: { cellWidth: 100 }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' } },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Marcos ──
  if (y > pageHeight - 80) { doc.addPage(); y = margin; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...TEXT);
  doc.text('Cronograma de Marcos', margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['#', 'Marco', 'Data', 'Responsável']],
    body: plan.milestones.map(m => [String(m.id), m.title, new Date(m.scheduledDate).toLocaleDateString('pt-BR'), m.responsible]),
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: INDIGO, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { textColor: TEXT, fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 0: { cellWidth: 8, halign: 'center' }, 2: { cellWidth: 25, halign: 'center' }, 3: { cellWidth: 35 } },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Próximos Passos ──
  if (y > pageHeight - 60) { doc.addPage(); y = margin; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...TEXT);
  doc.text('Próximos Passos', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  for (const step of plan.nextSteps) {
    const lines = doc.splitTextToSize(`• ${step}`, pageWidth - 2 * margin - 5);
    if (y + lines.length * 4.5 > pageHeight - 30) { doc.addPage(); y = margin; }
    doc.text(lines, margin + 3, y);
    y += lines.length * 4.5 + 2;
  }

  y += 10;

  // ── Seção de Assinatura ──
  if (y > pageHeight - 55) { doc.addPage(); y = margin; }

  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 50, 3, 3, 'F');
  doc.setDrawColor(...INDIGO);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 50, 3, 3, 'S');

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK_NAVY);
  doc.text('COMPROMISSO DE MELHORIA', pageWidth / 2, y, { align: 'center' });

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT);
  const commitText = `Eu, ${personName}, declaro ciência do presente Plano de Ação e me comprometo a cumprir as metas e marcos estabelecidos, buscando a melhoria contínua da minha performance em ${moduleLabel}.`;
  const commitLines = doc.splitTextToSize(commitText, pageWidth - 2 * margin - 10);
  doc.text(commitLines, pageWidth / 2, y, { align: 'center' });

  y += commitLines.length * 4.5 + 8;

  const colW = (pageWidth - 2 * margin - 10) / 2;
  doc.setDrawColor(...TEXT);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, y + 8, margin + 5 + colW, y + 8);
  doc.line(margin + 5 + colW + 10, y + 8, pageWidth - margin - 5, y + 8);

  doc.setFontSize(8);
  doc.text(`${personName}`, margin + 5 + colW / 2, y + 12, { align: 'center' });
  doc.text('Técnico/Agente', margin + 5 + colW / 2, y + 16, { align: 'center' });
  doc.text('Gestor Responsável', margin + 5 + colW + 10 + colW / 2, y + 12, { align: 'center' });
  doc.text(`Data: ___/___/______`, margin + 5 + colW + 10 + colW / 2, y + 16, { align: 'center' });

  // ── Rodapé ──
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 160);
    doc.text(`Dashboard de Performance — Plano de Ação | Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
  }

  const filename = `Plano_Acao_${personName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

// ─── PDF de Plano de Ação para Cliente ───────────────────────────────────────

export async function exportClientePlanToPDF(plan: ClienteActionPlan): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  const priorityColor = getPriorityColor(plan.priority);

  // ── Cabeçalho ──
  doc.setFillColor(...DARK_NAVY);
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setFillColor(...priorityColor);
  doc.rect(0, 45, pageWidth, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PLANO DE RETENÇÃO DE CLIENTE', margin, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente: ${plan.nome}`, margin, 28);
  doc.text(`Responsável: ${plan.responsavel}`, margin, 36);
  doc.setFontSize(10);
  doc.text(`Prioridade: ${plan.priority}`, pageWidth - margin - 45, 28);
  doc.text(`Prazo: ${plan.prazo}`, pageWidth - margin - 45, 36);

  y = 58;

  // ── Descrição ──
  doc.setTextColor(...TEXT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Contexto', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const descLines = doc.splitTextToSize(plan.description, pageWidth - 2 * margin);
  doc.text(descLines, margin, y);
  y += descLines.length * 4.5 + 8;

  // ── Causa Raiz ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Causa Raiz Identificada', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setFillColor(...LIGHT_GRAY);
  const causaLines = doc.splitTextToSize(plan.causaRaiz, pageWidth - 2 * margin - 10);
  doc.roundedRect(margin, y - 2, pageWidth - 2 * margin, causaLines.length * 4.5 + 6, 2, 2, 'F');
  doc.text(causaLines, margin + 5, y + 2);
  y += causaLines.length * 4.5 + 12;

  // ── Ações ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...TEXT);
  doc.text('Ações Recomendadas', margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['#', 'Ação']],
    body: plan.acoes.map((a, i) => [String(i + 1), a]),
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: INDIGO, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { textColor: TEXT, fontSize: 8 },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: { 0: { cellWidth: 8, halign: 'center' } },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Indicadores ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...TEXT);
  doc.text('Indicadores de Sucesso', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  for (const ind of plan.indicadores) {
    doc.text(`✓ ${ind}`, margin + 3, y);
    y += 5;
  }

  y += 10;

  // ── Assinatura ──
  if (y > pageHeight - 50) { doc.addPage(); y = margin; }

  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 45, 3, 3, 'F');
  doc.setDrawColor(...INDIGO);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 45, 3, 3, 'S');

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...DARK_NAVY);
  doc.text('REGISTRO DE AÇÃO', pageWidth / 2, y, { align: 'center' });

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT);
  const commitText = `Plano de retenção elaborado para o cliente ${plan.nome}. Prazo de resolução: ${plan.prazo}. Responsável pelo acompanhamento: ${plan.responsavel}.`;
  const commitLines = doc.splitTextToSize(commitText, pageWidth - 2 * margin - 10);
  doc.text(commitLines, pageWidth / 2, y, { align: 'center' });

  y += commitLines.length * 4.5 + 8;

  const colW = (pageWidth - 2 * margin - 10) / 2;
  doc.setDrawColor(...TEXT);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, y + 8, margin + 5 + colW, y + 8);
  doc.line(margin + 5 + colW + 10, y + 8, pageWidth - margin - 5, y + 8);

  doc.setFontSize(8);
  doc.text('Gestor de Relacionamento', margin + 5 + colW / 2, y + 12, { align: 'center' });
  doc.text(`Data: ___/___/______`, margin + 5 + colW / 2, y + 16, { align: 'center' });
  doc.text('Diretor / Supervisor', margin + 5 + colW + 10 + colW / 2, y + 12, { align: 'center' });
  doc.text(`Data: ___/___/______`, margin + 5 + colW + 10 + colW / 2, y + 16, { align: 'center' });

  // ── Rodapé ──
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 160);
    doc.text(`Dashboard de Performance — Plano de Retenção | Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
  }

  const filename = `Plano_Retencao_${plan.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
