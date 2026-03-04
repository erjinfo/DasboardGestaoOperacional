/**
 * DashboardLayout — Layout principal com sidebar escura fixa
 * Design: Executive Analytics — Clean Slate com Acento Institucional
 * Sidebar: azul escuro #1E3A5F, conteúdo: fundo cinza-azulado claro
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Wrench, Headphones, LayoutGrid, Users, BarChart3,
  ChevronLeft, ChevronRight, Database, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';

const navItems = [
  {
    href: '/',
    label: 'Ordens de Serviço',
    shortLabel: 'OS',
    icon: Wrench,
    color: 'text-blue-400',
    activeColor: 'bg-blue-600/20 text-blue-300 border-blue-500',
    dataKey: 'osFile' as const,
  },
  {
    href: '/sac',
    label: 'SAC',
    shortLabel: 'SAC',
    icon: Headphones,
    color: 'text-emerald-400',
    activeColor: 'bg-emerald-600/20 text-emerald-300 border-emerald-500',
    dataKey: 'sacFile' as const,
  },
  {
    href: '/matrix',
    label: 'Matrix',
    shortLabel: 'MTX',
    icon: LayoutGrid,
    color: 'text-violet-400',
    activeColor: 'bg-violet-600/20 text-violet-300 border-violet-500',
    dataKey: 'matrixFile' as const,
  },
  {
    href: '/clientes',
    label: 'Clientes',
    shortLabel: 'CLI',
    icon: Users,
    color: 'text-amber-400',
    activeColor: 'bg-amber-600/20 text-amber-300 border-amber-500',
    dataKey: null,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const data = useData();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          'flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out',
          'bg-sidebar border-r border-sidebar-border',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center border-b border-sidebar-border h-16 flex-shrink-0',
          collapsed ? 'justify-center px-2' : 'px-4 gap-3'
        )}>
          <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sidebar-foreground font-bold text-sm leading-tight truncate">
                Performance
              </p>
              <p className="text-sidebar-foreground/50 text-xs truncate">Dashboard</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {!collapsed && (
            <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-widest px-2 mb-3">
              Módulos
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            const hasData = item.dataKey ? !!data[item.dataKey] : false;
            const isClientesReady = item.dataKey === null && (!!data.osFile || !!data.sacFile || !!data.matrixFile);

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center rounded-lg transition-all duration-150 cursor-pointer group',
                    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-sidebar-primary/20 border border-sidebar-primary/40'
                      : 'hover:bg-sidebar-accent border border-transparent'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn(
                    'w-4 h-4 flex-shrink-0 transition-colors',
                    isActive ? 'text-sidebar-primary' : item.color,
                    'group-hover:text-sidebar-primary'
                  )} />

                  {!collapsed && (
                    <>
                      <span className={cn(
                        'text-sm font-medium flex-1 truncate',
                        isActive ? 'text-sidebar-foreground' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
                      )}>
                        {item.label}
                      </span>
                      {(hasData || isClientesReady) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Status de dados */}
        {!collapsed && (
          <div className="px-3 pb-4 space-y-2">
            <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-widest px-1">
              Bases de Dados
            </p>
            {[
              { label: 'OS', file: data.osFile, color: 'bg-blue-400' },
              { label: 'SAC', file: data.sacFile, color: 'bg-emerald-400' },
              { label: 'Matrix', file: data.matrixFile, color: 'bg-violet-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-1">
                <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', item.file ? item.color : 'bg-sidebar-foreground/20')} />
                <span className="text-xs text-sidebar-foreground/50 flex-1 truncate">{item.label}</span>
                <span className="text-xs text-sidebar-foreground/30">
                  {item.file ? `${item.file.rowCount}` : '—'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Collapse button */}
        <div className="border-t border-sidebar-border p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full flex items-center rounded-lg p-2 transition-colors',
              'text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent',
              collapsed ? 'justify-center' : 'gap-2'
            )}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs">Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Conteúdo principal ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-card border-b border-border flex items-center px-6 gap-4">
          <div className="flex-1">
            {navItems.map((item) => {
              if (location !== item.href) return null;
              const Icon = item.icon;
              return (
                <div key={item.href} className="flex items-center gap-2">
                  <Icon className={cn('w-4 h-4', item.color.replace('text-', 'text-').replace('400', '600'))} />
                  <h1 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {item.label}
                  </h1>
                </div>
              );
            })}
          </div>

          {/* Data status badges */}
          <div className="flex items-center gap-2">
            {data.error && (
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Erro ao processar arquivo
              </Badge>
            )}
            {data.isLoading && (
              <Badge variant="secondary" className="text-xs">Processando...</Badge>
            )}
            {[
              { label: 'OS', file: data.osFile, color: 'bg-blue-500' },
              { label: 'SAC', file: data.sacFile, color: 'bg-emerald-500' },
              { label: 'Matrix', file: data.matrixFile, color: 'bg-violet-500' },
            ].map((item) => item.file && (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className={cn('w-1.5 h-1.5 rounded-full', item.color)} />
                {item.label}: {item.file.rowCount} reg.
              </div>
            ))}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
