/**
 * FileUploadZone — Componente de upload com drag-and-drop
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 */

import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DataFile } from '@/contexts/DataContext';

interface FileUploadZoneProps {
  label: string;
  description: string;
  accept?: string;
  onUpload: (file: File) => Promise<void>;
  uploadedFile: DataFile | null;
  isLoading?: boolean;
  color?: 'blue' | 'emerald' | 'violet';
}

const colorMap = {
  blue: {
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200 hover:border-blue-500',
    badge: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-600',
  },
  emerald: {
    icon: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200 hover:border-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-600',
  },
  violet: {
    icon: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200 hover:border-violet-500',
    badge: 'bg-violet-100 text-violet-800',
    dot: 'bg-violet-600',
  },
};

export function FileUploadZone({
  label,
  description,
  accept = '.csv,.xlsx,.xls',
  onUpload,
  uploadedFile,
  isLoading = false,
  color = 'blue',
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const colors = colorMap[color];

  const handleFile = async (file: File) => {
    if (file) await onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {uploadedFile && (
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1', colors.badge)}>
            <CheckCircle2 className="w-3 h-3" />
            Carregado
          </span>
        )}
      </div>

      <div
        className={cn(
          'upload-zone rounded-lg p-4 text-center cursor-pointer transition-all',
          colors.border,
          isDragOver && 'drag-over',
          uploadedFile ? colors.bg : 'bg-white'
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <RefreshCw className={cn('w-6 h-6 animate-spin', colors.icon)} />
            <p className="text-xs text-muted-foreground">Processando...</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', colors.bg)}>
              <FileSpreadsheet className={cn('w-5 h-5', colors.icon)} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {uploadedFile.rowCount.toLocaleString('pt-BR')} registros · {uploadedFile.uploadedAt}
              </p>
            </div>
            <div className={cn('w-2 h-2 rounded-full flex-shrink-0', colors.dot)} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <Upload className={cn('w-6 h-6', colors.icon)} />
            <div>
              <p className="text-xs font-medium text-foreground">Clique ou arraste o arquivo</p>
              <p className="text-xs text-muted-foreground mt-0.5">CSV, XLSX ou XLS</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
