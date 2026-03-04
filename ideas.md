# Brainstorm de Design — Dashboard de Performance

## Abordagens Exploradas

<response>
<text>
**Design Movement:** Corporate Data Intelligence — Minimalismo Funcional com Hierarquia Visual Forte

**Core Principles:**
- Dados em primeiro lugar: cada elemento visual serve à leitura de informação
- Contraste tipográfico agressivo entre títulos e dados numéricos
- Sidebar fixa com navegação estrutural clara e indicadores de estado

**Color Philosophy:**
Paleta de azul petróleo escuro (#0F2744) como base, com acentos em âmbar (#F59E0B) para alertas e verde esmeralda (#10B981) para indicadores positivos. O fundo usa um cinza levemente azulado (#F1F5F9) para reduzir fadiga visual em sessões longas.

**Layout Paradigm:**
Sidebar fixa à esquerda (64px colapsada / 240px expandida) + área de conteúdo principal com header sticky. Cards de métricas em grid assimétrico — linha superior com KPIs grandes, abaixo tabelas e gráficos.

**Signature Elements:**
- Bordas esquerdas coloridas em cards para indicar prioridade (vermelho/amarelo/verde)
- Números de performance com fonte display monoespaçada grande
- Indicadores de tendência com setas animadas

**Interaction Philosophy:**
Clique em técnico abre drawer lateral com análise completa. Upload de arquivo com feedback visual de progresso. Filtros inline sem modais.

**Animation:**
Entrada suave de cards com stagger (50ms entre cada). Contadores numéricos animados ao carregar. Drawer desliza da direita.

**Typography System:**
- Display/Títulos: IBM Plex Sans Bold 700
- Dados numéricos: IBM Plex Mono 600
- Corpo: IBM Plex Sans 400/500
</text>
<probability>0.08</probability>
</response>

<response>
<text>
**Design Movement:** Operational Command Center — Dark Mode Industrial

**Core Principles:**
- Interface escura para ambientes de trabalho intenso
- Densidade de informação alta com espaçamento calibrado
- Status indicators sempre visíveis

**Color Philosophy:**
Fundo #0D1117 (quase preto), cards em #161B22, acentos em ciano elétrico (#00D4FF) e laranja operacional (#FF6B35). Verde #00FF88 para métricas positivas.

**Layout Paradigm:**
Top navigation com tabs principais + área de conteúdo em 2 colunas (70/30). Painel direito mostra detalhes contextuais.

**Signature Elements:**
- Linhas de grade sutis no fundo
- Badges de status com pulsação animada
- Gráficos com gradiente de preenchimento

**Interaction Philosophy:**
Hover em linha da tabela destaca toda a linha. Click abre modal centralizado com análise.

**Animation:**
Fade-in com blur ao abrir modais. Gráficos se constroem da esquerda para direita.

**Typography System:**
- Títulos: Space Grotesk Bold
- Dados: JetBrains Mono
- Corpo: Space Grotesk Regular
</text>
<probability>0.07</probability>
</response>

<response>
<text>
**Design Movement:** Executive Analytics — Clean Slate com Acento Institucional

**Core Principles:**
- Fundo branco puro com sombras suaves para profundidade
- Tipografia serifada nos títulos para autoridade institucional
- Cores de status semânticas e consistentes

**Color Philosophy:**
Branco (#FFFFFF) + cinza neutro (#F8FAFC) para fundos. Azul índigo (#3730A3) como cor primária institucional. Vermelho coral (#EF4444), âmbar (#F59E0B) e verde (#22C55E) para status. Sidebar em azul escuro (#1E3A5F).

**Layout Paradigm:**
Sidebar escura fixa à esquerda com ícones + labels. Header branco com breadcrumb. Conteúdo em grid responsivo com cards elevados (shadow-md).

**Signature Elements:**
- Avatar circular com iniciais coloridas por hash do nome
- Progress bars com gradiente de cor baseado no valor
- Separadores horizontais finos entre seções

**Interaction Philosophy:**
Clique em linha de técnico abre Sheet (drawer) lateral com análise completa e botão de exportar PDF. Upload com drag-and-drop visual.

**Animation:**
Transições de página com slide horizontal. Cards aparecem com fade+translateY(8px).

**Typography System:**
- Títulos principais: Playfair Display Bold (serifa)
- Subtítulos e UI: Outfit Medium/SemiBold
- Dados e tabelas: Outfit Regular/Mono
</text>
<probability>0.09</probability>
</response>

## Design Escolhido

**Executive Analytics — Clean Slate com Acento Institucional**

Paleta azul índigo + branco com sidebar escura. Tipografia Playfair Display para títulos + Outfit para UI. Cards elevados com sombras suaves. Drawer lateral para análise individual de técnicos.
