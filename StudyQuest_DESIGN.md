# 🎨 StudyQuest RPG — Design Document
## Sistema de Design, Temas e Interface

**Versão 1.0 • 2025**

---

## Sumário

1. [Filosofia de Design](#1-filosofia-de-design)
2. [Sistema de Temas](#2-sistema-de-temas)
3. [Paletas de Cores Completas](#3-paletas-de-cores-completas)
4. [Tipografia](#4-tipografia)
5. [Iconografia e Ilustrações](#5-iconografia-e-ilustrações)
6. [Componentes de UI](#6-componentes-de-ui)
7. [Sistema de Layout e Grid](#7-sistema-de-layout-e-grid)
8. [Responsividade e Breakpoints](#8-responsividade-e-breakpoints)
9. [Animações e Microinterações](#9-animações-e-microinterações)
10. [Elementos RPG Visuais](#10-elementos-rpg-visuais)
11. [Acessibilidade](#11-acessibilidade)
12. [Implementação Técnica dos Temas](#12-implementação-técnica-dos-temas)

---

## 1. Filosofia de Design

### 1.1 Princípios Centrais

O StudyQuest RPG tem uma identidade visual que equilibra a **seriedade acadêmica** com o **engajamento de um jogo**. O design nunca deve parecer infantil demais (afastaria universitários) nem seco demais (perderia o diferencial gamificado).

**Os quatro pilares visuais:**

| Pilar | Descrição | Aplicação |
|-------|-----------|-----------|
| **Imersão** | O usuário deve sentir que está "dentro" de um RPG enquanto estuda | Barras de XP animadas, efeitos de level-up, insígnias com brilho |
| **Clareza** | Informação acadêmica precisa ser fácil de ler e encontrar | Hierarquia tipográfica rígida, espaçamento generoso |
| **Personalização** | O usuário controla a aparência do ambiente | Sistema de temas dark/light com cores de destaque |
| **Responsividade** | A experiência deve ser igual no celular, tablet ou desktop | Layout fluido, componentes adaptativos por breakpoint |

### 1.2 Moodboard e Referências de Estilo

- **RPG de referência visual:** interface estilo Notion + elementos de Duolingo + atmosfera de jogos como Honkai: Star Rail
- **Tom:** sombrio elegante no dark mode, limpo e vibrante no light mode
- **Sensação:** "painel de herói estudante" — cada aba parece uma missão

---

## 2. Sistema de Temas

### 2.1 Estrutura do Sistema

O sistema de temas tem **duas dimensões independentes**:

```
Dimensão 1 — Modo:       DARK  ←→  LIGHT
Dimensão 2 — Cor base:   ROXO  |  AZUL  |  AMARELO
```

Combinando as duas dimensões, temos **6 temas possíveis**:

| # | Nome do Tema | Modo | Cor de Destaque |
|---|--------------|------|-----------------|
| 1 | `dark-purple` | Escuro | Roxo |
| 2 | `dark-blue` | Escuro | Azul |
| 3 | `dark-yellow` | Escuro | Amarelo |
| 4 | `light-purple` | Claro | Roxo |
| 5 | `light-blue` | Claro | Azul |
| 6 | `light-yellow` | Claro | Amarelo |

> O tema padrão ao se cadastrar é `dark-purple`.  
> A preferência é salva no banco de dados no perfil do usuário e aplicada em qualquer dispositivo ao fazer login.

### 2.2 Lógica de Troca de Tema

```
dark-purple  ←→  light-purple
dark-blue    ←→  light-blue
dark-yellow  ←→  light-yellow
```

- O **toggle de modo** (dark/light) troca apenas o modo, mantendo a cor de destaque.
- O **seletor de cor** troca apenas a cor, mantendo o modo atual.
- Ambas as configurações são independentes e salvas separadamente.

### 2.3 Preview dos Temas no Seletor

O seletor de tema (em configurações e no onboarding) exibe cards visuais:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ████  ░░░░░░ │  │ ████  ░░░░░░ │  │ ████  ░░░░░░ │
│ [Roxo]       │  │ [Azul]       │  │ [Amarelo]    │
│ ● Dark       │  │ ● Dark       │  │ ● Dark       │
│ ○ Light      │  │ ○ Light      │  │ ○ Light      │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 3. Paletas de Cores Completas

As paletas são definidas como **CSS Custom Properties** (variáveis CSS), aplicadas na tag `<html>` com o atributo `data-theme`.

### 3.1 Tokens de Cor (Nomes Semânticos)

Independente do tema ativo, os componentes sempre referenciam tokens semânticos:

```css
/* Tokens de background */
--bg-base          /* fundo principal da página */
--bg-surface       /* cards, painéis, modais */
--bg-elevated      /* dropdowns, tooltips, elementos sobre surface */
--bg-overlay       /* backdrop de modais */

/* Tokens de texto */
--text-primary     /* títulos, conteúdo principal */
--text-secondary   /* subtítulos, labels */
--text-muted       /* placeholders, texto desabilitado */
--text-inverse     /* texto sobre cor de destaque */

/* Tokens de destaque (accent) */
--accent-primary   /* botões primários, links, XP bar */
--accent-secondary /* hover states, bordas de foco */
--accent-muted     /* backgrounds suaves com a cor de destaque */
--accent-glow      /* sombra/brilho para efeitos RPG */

/* Tokens de status */
--success          /* conquistas, sessão concluída */
--warning          /* streak em risco, prazo próximo */
--danger           /* erro, sessão pausada há muito tempo */
--info             /* dicas, novidades */

/* Tokens de borda */
--border-subtle    /* separadores, bordas de card */
--border-strong    /* inputs em foco, elementos selecionados */
```

---

### 3.2 Tema: Dark Purple (Preto + Roxo)

```css
[data-theme="dark-purple"] {
  /* Backgrounds */
  --bg-base:          #0D0B14;   /* quase preto com leve tom púrpura */
  --bg-surface:       #161122;   /* cards e painéis */
  --bg-elevated:      #1E1832;   /* dropdowns, tooltips */
  --bg-overlay:       rgba(13, 11, 20, 0.85);

  /* Texto */
  --text-primary:     #F4F0FF;
  --text-secondary:   #B8ACDA;
  --text-muted:       #6B5F8A;
  --text-inverse:     #0D0B14;

  /* Destaque — Roxo */
  --accent-primary:   #9333EA;   /* roxo vibrante */
  --accent-secondary: #A855F7;   /* roxo mais claro para hover */
  --accent-muted:     #2D1B4E;   /* roxo escuro para backgrounds */
  --accent-glow:      rgba(147, 51, 234, 0.4);

  /* Status */
  --success:          #22C55E;
  --warning:          #F59E0B;
  --danger:           #EF4444;
  --info:             #818CF8;

  /* Bordas */
  --border-subtle:    rgba(147, 51, 234, 0.15);
  --border-strong:    rgba(147, 51, 234, 0.6);
}
```

---

### 3.3 Tema: Dark Blue (Preto + Azul)

```css
[data-theme="dark-blue"] {
  /* Backgrounds */
  --bg-base:          #090C14;   /* quase preto com leve tom azul */
  --bg-surface:       #0F1629;
  --bg-elevated:      #172038;
  --bg-overlay:       rgba(9, 12, 20, 0.85);

  /* Texto */
  --text-primary:     #EFF6FF;
  --text-secondary:   #93C5FD;
  --text-muted:       #3B5280;
  --text-inverse:     #090C14;

  /* Destaque — Azul */
  --accent-primary:   #2563EB;   /* azul royal */
  --accent-secondary: #3B82F6;
  --accent-muted:     #0F254D;
  --accent-glow:      rgba(37, 99, 235, 0.4);

  /* Status */
  --success:          #22C55E;
  --warning:          #F59E0B;
  --danger:           #EF4444;
  --info:             #60A5FA;

  /* Bordas */
  --border-subtle:    rgba(37, 99, 235, 0.15);
  --border-strong:    rgba(37, 99, 235, 0.6);
}
```

---

### 3.4 Tema: Dark Yellow (Preto + Amarelo)

```css
[data-theme="dark-yellow"] {
  /* Backgrounds */
  --bg-base:          #0D0C08;   /* quase preto com leve tom âmbar */
  --bg-surface:       #181508;
  --bg-elevated:      #241E0A;
  --bg-overlay:       rgba(13, 12, 8, 0.85);

  /* Texto */
  --text-primary:     #FFFBEB;
  --text-secondary:   #FCD34D;
  --text-muted:       #6B5B1A;
  --text-inverse:     #0D0C08;

  /* Destaque — Amarelo/Âmbar */
  --accent-primary:   #D97706;   /* âmbar escuro (não cansa a vista) */
  --accent-secondary: #F59E0B;
  --accent-muted:     #2D2005;
  --accent-glow:      rgba(217, 119, 6, 0.4);

  /* Status */
  --success:          #22C55E;
  --warning:          #FBBF24;
  --danger:           #EF4444;
  --info:             #FDE68A;

  /* Bordas */
  --border-subtle:    rgba(217, 119, 6, 0.15);
  --border-strong:    rgba(217, 119, 6, 0.6);
}
```

> **Nota sobre o amarelo:** o tom primário é âmbar (`#D97706`) e não amarelo puro (`#FFFF00`). Amarelo puro em fundo escuro cansa a visão rapidamente. O âmbar mantém o visual "dourado/lendário" sem prejudicar a leitura.

---

### 3.5 Tema: Light Purple (Branco + Roxo)

```css
[data-theme="light-purple"] {
  /* Backgrounds */
  --bg-base:          #FAFAFA;
  --bg-surface:       #FFFFFF;
  --bg-elevated:      #F3F0FF;
  --bg-overlay:       rgba(250, 250, 250, 0.9);

  /* Texto */
  --text-primary:     #1A0A2E;
  --text-secondary:   #4C3575;
  --text-muted:       #9D8FBA;
  --text-inverse:     #FFFFFF;

  /* Destaque — Roxo */
  --accent-primary:   #7C3AED;
  --accent-secondary: #8B5CF6;
  --accent-muted:     #EDE9FE;
  --accent-glow:      rgba(124, 58, 237, 0.25);

  /* Status */
  --success:          #16A34A;
  --warning:          #D97706;
  --danger:           #DC2626;
  --info:             #6366F1;

  /* Bordas */
  --border-subtle:    rgba(124, 58, 237, 0.12);
  --border-strong:    rgba(124, 58, 237, 0.5);
}
```

---

### 3.6 Tema: Light Blue (Branco + Azul)

```css
[data-theme="light-blue"] {
  /* Backgrounds */
  --bg-base:          #F8FAFF;
  --bg-surface:       #FFFFFF;
  --bg-elevated:      #EFF6FF;
  --bg-overlay:       rgba(248, 250, 255, 0.9);

  /* Texto */
  --text-primary:     #0A1628;
  --text-secondary:   #1E3A6E;
  --text-muted:       #7FA3D1;
  --text-inverse:     #FFFFFF;

  /* Destaque — Azul */
  --accent-primary:   #1D4ED8;
  --accent-secondary: #2563EB;
  --accent-muted:     #DBEAFE;
  --accent-glow:      rgba(29, 78, 216, 0.2);

  /* Status */
  --success:          #16A34A;
  --warning:          #D97706;
  --danger:           #DC2626;
  --info:             #3B82F6;

  /* Bordas */
  --border-subtle:    rgba(29, 78, 216, 0.12);
  --border-strong:    rgba(29, 78, 216, 0.5);
}
```

---

### 3.7 Tema: Light Yellow (Branco + Amarelo)

```css
[data-theme="light-yellow"] {
  /* Backgrounds */
  --bg-base:          #FFFDF5;
  --bg-surface:       #FFFFFF;
  --bg-elevated:      #FFFBEB;
  --bg-overlay:       rgba(255, 253, 245, 0.9);

  /* Texto */
  --text-primary:     #1A1200;
  --text-secondary:   #5C4206;
  --text-muted:       #B59A4A;
  --text-inverse:     #FFFFFF;

  /* Destaque — Âmbar */
  --accent-primary:   #B45309;
  --accent-secondary: #D97706;
  --accent-muted:     #FEF3C7;
  --accent-glow:      rgba(180, 83, 9, 0.2);

  /* Status */
  --success:          #16A34A;
  --warning:          #D97706;
  --danger:           #DC2626;
  --info:             #F59E0B;

  /* Bordas */
  --border-subtle:    rgba(180, 83, 9, 0.12);
  --border-strong:    rgba(180, 83, 9, 0.5);
}
```

---

## 4. Tipografia

### 4.1 Famílias Tipográficas

```css
/* Fonte principal — Texto e UI */
--font-sans: 'Inter', 'Segoe UI', system-ui, sans-serif;

/* Fonte de destaque — Títulos RPG, Nível, Conquistas */
--font-display: 'Cinzel', 'Playfair Display', Georgia, serif;
/* Cinzel tem estética medieval/épica, perfeita para títulos de nível */

/* Fonte monospace — Código, Timer, Estatísticas numéricas */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

> **Carregamento:** Inter e JetBrains Mono via Google Fonts. Cinzel também via Google Fonts. Usar `font-display: swap` para evitar FOUT.

### 4.2 Escala Tipográfica

| Token | Tamanho | Peso | Uso |
|-------|---------|------|-----|
| `--text-xs` | 11px | 400 | Labels de badge, tooltips |
| `--text-sm` | 13px | 400 | Texto de apoio, metadados |
| `--text-base` | 15px | 400 | Corpo de texto padrão |
| `--text-md` | 17px | 500 | Texto de destaque, leads |
| `--text-lg` | 20px | 600 | Subtítulos de seção |
| `--text-xl` | 24px | 700 | Títulos de página (sans) |
| `--text-2xl` | 30px | 700 | Títulos grandes |
| `--text-3xl` | 38px | 800 | Nome do usuário no perfil |
| `--text-hero` | 48px+ | 800 | Ranking #1, Level-up screen |

### 4.3 Usos Específicos por Fonte

**Inter (sans):**
- Navegação, botões, labels, corpo de texto, posts do fórum, chat

**Cinzel (display):**
- Título do nível: "🔥 Lendário", "⚡ Acadêmico"
- Conquistas desbloqueadas
- Tela de level-up
- Nome do site na splash screen

**JetBrains Mono (mono):**
- Timer do Pomodoro / timer avulso
- Contagens de XP no feed de atividade
- Estatísticas numéricas (horas estudadas, posição no ranking)
- Código em posts do fórum (matemática, algoritmos)

### 4.4 Linha de Base e Espaçamento

```css
--leading-tight:   1.25;   /* títulos */
--leading-normal:  1.5;    /* corpo de texto */
--leading-relaxed: 1.75;   /* posts longos do fórum */

--tracking-tight:  -0.02em; /* títulos grandes */
--tracking-normal:  0;
--tracking-wide:    0.05em; /* labels em maiúsculo */
--tracking-widest:  0.1em;  /* badges de conquista */
```

---

## 5. Iconografia e Ilustrações

### 5.1 Biblioteca de Ícones

**Biblioteca principal: [Lucide Icons](https://lucide.dev)**
- Consistente, open source, disponível como componente React
- Stroke-based (não filled) — visual mais refinado
- Tamanhos padrão: 16px (inline), 20px (navegação), 24px (ações principais)

**Ícones RPG e Conquistas:** emojis nativos do sistema
- Mantém consistência entre plataformas
- Renderização nativa é mais rápida que SVGs customizados
- Usar classe CSS para normalizar tamanho: `font-size: 1.2em; line-height: 1`

### 5.2 Insígnias de Nível (Level Badges)

Cada nível tem uma insígnia visual com forma hexagonal, seguindo a tradição de RPGs:

```
Nível 1 — 🎓 Calouro      Cor da borda: #94A3B8 (cinza/prata)
Nível 2 — 📚 Aplicado     Cor da borda: #78716C (bronze)
Nível 3 — 🧪 Pesquisador  Cor da borda: #6B7280 (ferro)
Nível 4 — ⚡ Acadêmico    Cor da borda: #16A34A (verde esmeralda)
Nível 5 — 🏆 Scholar      Cor da borda: #2563EB (azul safira)
Nível 6 — 🌟 Mestre       Cor da borda: #9333EA (roxo ametista)
Nível 7 — 🔥 Lendário     Cor da borda: #D97706 (ouro âmbar) + glow animado
```

O badge do nível Lendário tem uma animação de brilho rotativa (CSS keyframes) independente do tema.

### 5.3 Avatar do Usuário

- Foto de perfil: circular, com borda colorida na cor do nível
- Fallback sem foto: initials em fundo gerado por hash do username (cor consistente por usuário)
- Tamanhos: `sm` (32px), `md` (48px), `lg` (80px), `xl` (128px — perfil)

---

## 6. Componentes de UI

### 6.1 Botões

```
Variantes:
  primary   — fundo accent-primary, texto inverse
  secondary — fundo accent-muted, texto accent-primary
  ghost     — sem fundo, texto accent-primary
  danger    — fundo danger, texto branco
  icon      — apenas ícone, sem texto (quadrado ou circular)

Tamanhos:
  sm   — 32px altura, padding 12px, texto 13px
  md   — 40px altura, padding 16px, texto 15px (padrão)
  lg   — 48px altura, padding 24px, texto 17px

Estados:
  default → hover (brightness +10%) → active (scale 0.97) → disabled (opacity 40%)
  focus: outline 2px solid accent-primary, offset 2px
```

### 6.2 Cards

Cards são o componente mais usado na interface. Existem três elevações:

```
card-base:     background: var(--bg-surface)
               border: 1px solid var(--border-subtle)
               border-radius: 12px
               padding: 20px

card-elevated: background: var(--bg-elevated)
               border: 1px solid var(--border-strong)
               border-radius: 12px
               box-shadow: 0 4px 20px var(--accent-glow)

card-flat:     background: var(--bg-surface)
               sem borda, sem sombra
               border-radius: 8px
```

### 6.3 Inputs e Formulários

```
Estado normal:
  background: var(--bg-elevated)
  border: 1px solid var(--border-subtle)
  border-radius: 8px
  padding: 10px 14px
  color: var(--text-primary)

Estado focus:
  border-color: var(--accent-primary)
  box-shadow: 0 0 0 3px var(--accent-glow)
  outline: none

Estado error:
  border-color: var(--danger)
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2)

Label: var(--text-secondary), 13px, peso 500
Helper text: var(--text-muted), 12px
```

### 6.4 Barra de XP

Um dos componentes mais importantes da interface — aparece no header e no perfil.

```
Estrutura:
  [ícone de nível] [barra de progresso] [XP atual / XP para próximo nível]

Barra de progresso:
  height: 8px (header) / 12px (perfil)
  background: var(--accent-muted)
  fill: var(--accent-primary) com gradiente leve
  border-radius: 9999px
  transition: width 600ms cubic-bezier(0.34, 1.56, 0.64, 1)
  /* spring animation ao ganhar XP */

Ao ganhar XP:
  1. A barra cresce com animação spring
  2. Partículas flutuam para cima (+XP em verde)
  3. Se subiu de nível: modal de level-up
```

### 6.5 Timer (Pomodoro e Avulso)

```
Visual:
  Display circular (SVG stroke-dasharray animado)
  Número central com font-mono, text-hero
  Controles abaixo: Iniciar / Pausar / Encerrar
  Badge de modo: "POMODORO" ou "AVULSO" em tracking-widest

Cores por estado:
  Estudando: stroke = accent-primary
  Pausa:     stroke = success
  Pausado:   stroke = warning (pisca levemente)
  Encerrado: stroke = text-muted
```

### 6.6 Ranking — Tabela e Pódio

```
Top 3 — Pódio visual:
  #2: card menor, à esquerda, badge prata
  #1: card maior, ao centro elevado, badge ouro + glow dourado
  #3: card menor, à direita, badge bronze

Posição 4+: lista compacta com linhas alternadas de bg
  → Se o usuário logado está na lista: linha highlighted com accent-muted
  → Sempre mostrar a linha do usuário logado, mesmo fora do top visible
```

### 6.7 Notificações Toast

```
Posição: canto superior direito (desktop), topo centralizado (mobile)
Duração: 4s (info/success), 6s (warning), manual (error)

Variantes:
  success  → ícone check, borda esquerda success
  warning  → ícone alert, borda esquerda warning
  error    → ícone x, borda esquerda danger
  xp-gain  → ícone ⚡, cor accent, "+50 XP" em mono bold
  level-up → toma a tela inteira (modal especial, ver seção 10)
```

---

## 7. Sistema de Layout e Grid

### 7.1 Layout Principal (Desktop)

```
┌─────────────────────────────────────────────────────┐
│                    TOPBAR (64px)                    │
│  [Logo] [Busca]              [XP bar] [Avatar] [🔔]  │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   SIDEBAR    │           MAIN CONTENT               │
│   (240px)    │           (flex-1)                   │
│              │                                      │
│  • Dashboard │    ┌────────────────────────────┐   │
│  • Estudar   │    │        PAGE CONTENT        │   │
│  • Fórum     │    │    max-width: 900px        │   │
│  • Banco     │    │    margin: 0 auto          │   │
│  • Chat      │    └────────────────────────────┘   │
│  • Ranking   │                                      │
│  • Perfil    │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### 7.2 Grid de Conteúdo

```css
/* Grid principal do conteúdo */
.content-grid {
  display: grid;
  gap: 20px;
}

/* Dashboard — 3 colunas */
.dashboard-grid {
  grid-template-columns: 1fr 1fr 1fr;
}

/* Perfil — 2 colunas (info + atividade) */
.profile-grid {
  grid-template-columns: 320px 1fr;
}

/* Banco de provas — 2 colunas */
.bank-grid {
  grid-template-columns: 1fr 1fr;
}
```

### 7.3 Espaçamento

```css
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px

/* Border radius */
--radius-sm:   6px   /* badges, tags */
--radius-md:   10px  /* inputs, botões */
--radius-lg:   14px  /* cards */
--radius-xl:   20px  /* modais, painéis grandes */
--radius-full: 9999px /* avatares, progress bars */
```

---

## 8. Responsividade e Breakpoints

### 8.1 Breakpoints Definidos

```css
/* Mobile first — breakpoints em min-width */
--bp-sm:   480px   /* mobile grande */
--bp-md:   768px   /* tablet */
--bp-lg:   1024px  /* laptop */
--bp-xl:   1280px  /* desktop */
--bp-2xl:  1536px  /* widescreen */
```

No Tailwind, usar os prefixos padrão: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.

---

### 8.2 Mobile (< 768px)

**Navegação:**
```
┌────────────────────────────┐
│ [☰]  StudyQuest  [🔔][👤] │  ← Topbar minimalista
├────────────────────────────┤
│                            │
│       CONTEÚDO             │
│       (100% largura)       │
│                            │
├────────────────────────────┤
│  🏠   📚   💬   🏆   👤   │  ← Bottom Navigation Bar
└────────────────────────────┘
```

- Sidebar é substituída por **Bottom Navigation Bar** (5 ícones principais)
- Menu hamburger abre drawer lateral com todas as opções
- Cards ocupam 100% da largura (single column)
- Pódio do ranking vira stack vertical
- Timer Pomodoro ocupa tela inteira ao iniciar (foco total)
- Chat ocupa tela inteira

**Ajustes tipográficos no mobile:**
```css
--text-hero:  36px   /* reduzido de 48px */
--text-3xl:   28px
--text-2xl:   24px
```

---

### 8.3 Tablet (768px – 1023px)

**Navegação:**
```
┌─────────────────────────────────────────┐
│         TOPBAR (56px)                   │
├──────────┬──────────────────────────────┤
│ SIDEBAR  │        CONTEÚDO              │
│ (64px    │     (flex-1, single col)     │
│ ícones   │                              │
│ apenas)  │                              │
└──────────┴──────────────────────────────┘
```

- Sidebar colapsada (só ícones, sem labels)
- Hover ou clique no ícone expande a sidebar temporariamente
- Grids passam para 2 colunas máximo
- Banco de provas: 2 colunas
- Dashboard: 2 colunas (terceiro card vai pra segunda linha)
- Timer Pomodoro: modal centralizado

---

### 8.4 Desktop (≥ 1024px)

Layout completo conforme seção 7.1:
- Sidebar completa com labels (240px)
- Grids de 2 e 3 colunas
- Hover states mais ricos
- Tooltips habilitados
- Shortcuts de teclado ativos

---

### 8.5 Componentes por Dispositivo

| Componente | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Navegação | Bottom bar | Sidebar ícones | Sidebar completa |
| Dashboard grid | 1 col | 2 col | 3 col |
| Timer ativo | Tela cheia | Modal | Painel fixo direita |
| Chat | Tela cheia | Painel 60% | Painel lateral |
| Ranking pódio | Stack vertical | Horizontal | Horizontal + detalhes |
| Perfil | Stack vertical | 2 col simples | 2 col + aside |
| Banco de provas | 1 col | 2 col | 2 col + filtros sidebar |
| Fórum | 1 col | 1 col | 1 col (max 720px) |

---

## 9. Animações e Microinterações

### 9.1 Princípios de Animação

- **Duração:** rápidas (100–200ms) para feedback imediato, médias (300–500ms) para transições, longas (600–1000ms) para eventos especiais (level-up)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out) para a maioria; spring (`cubic-bezier(0.34, 1.56, 0.64, 1)`) para elementos que "saltam" (XP bar, badges)
- **Respeitar preferências:** sempre usar `@media (prefers-reduced-motion: reduce)` para desabilitar animações em quem precisar

### 9.2 Catálogo de Animações

**Ganho de XP:**
```
Trigger: sessão encerrada ou ação completada
1. Toast aparece: "+50 XP ⚡" (slide-in do canto)
2. Barra de XP no header cresce com spring animation (600ms)
3. Partículas douradas sobem por 800ms (canvas ou CSS)
4. Se level-up: ver seção 10.1
```

**Hover em card:**
```css
.card {
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--accent-glow);
}
```

**Abertura de modal:**
```css
/* Backdrop: fade-in 200ms */
/* Modal: scale(0.95) opacity(0) → scale(1) opacity(1), 250ms spring */
```

**Troca de tema:**
```css
/* Transição suave de todas as cores */
* {
  transition: background-color 300ms ease, color 200ms ease, border-color 200ms ease;
}
/* Desativado quando prefers-reduced-motion */
```

**Timer Pomodoro:**
```
Tick a cada segundo: suave (sem pulos visuais)
Fim do ciclo:
  - Vibração no mobile (navigator.vibrate([200, 100, 200]))
  - Som de sino suave (Web Audio API, desabilitável)
  - Animação de pulso no círculo do timer por 1s
```

**Conquista desbloqueada:**
```
1. Ícone de troféu aparece no canto (bounce-in, 400ms)
2. Card da conquista expande com detalhes
3. Partículas coloridas explodem do card
4. Após 3s: contrai para ícone pequeno no perfil
```

**Streak em risco:**
```
- Ícone de fogo no header pisca levemente (pulse animation)
- Badge de aviso amarelo "Seu streak vai quebrar em Xh"
```

---

## 10. Elementos RPG Visuais

### 10.1 Tela de Level-Up

Evento especial que toma a tela inteira por ~4 segundos:

```
┌─────────────────────────────────────┐
│                                     │
│        ✨ LEVEL UP! ✨               │  ← Cinzel, text-hero, pulsando
│                                     │
│    [Badge antigo] → [Badge novo]    │  ← Animação de transformação
│                                     │
│      ⚡ Acadêmico → 🏆 Scholar      │  ← Título novo em Cinzel
│                                     │
│   🎉 Você desbloqueou:              │
│   • Acesso ao Ranking por Curso     │
│   • Nova borda de avatar            │
│                                     │
│         [Continuar →]               │
└─────────────────────────────────────┘
```

- Fundo: bg-base com overlay escuro + partículas animadas (confetti ou estrelas)
- A cor das partículas segue o tema ativo
- Som de fanfarra curto (opcional, desabilitável)

### 10.2 Streak Tracker

Exibido no dashboard e no perfil:

```
🔥 Streak: 7 dias
[■][■][■][■][■][■][■]  ← 7 quadrados coloridos (dias consecutivos)
Seg Ter Qua Qui Sex Sab Dom
```

- Dias completos: preenchidos com accent-primary
- Dia atual em progresso: preenchido 50% + pulsando
- Dias perdidos: cinza
- Ao atingir 7, 14, 30 dias: animação especial + conquista

### 10.3 Feed de Atividade RPG

No dashboard, um feed estilo "log de aventura":

```
┌─────────────────────────────────────────┐
│ 📜 Log de Atividades                    │
│                                         │
│ ⚡ há 2min  +60 XP — Sessão de Cálculo  │
│ 📤 hoje     +50 XP — Upload: P1 2025.1  │
│ ✅ hoje     +20 XP — Resposta aceita    │
│ 🔥 ontem    +100 XP — Streak 7 dias!    │
│ 📚 ontem    +120 XP — 2h de Física      │
└─────────────────────────────────────────┘
```

Fonte mono para os valores de XP, fonte sans para as descrições.

### 10.4 Borda de Avatar por Nível

O avatar de cada usuário tem uma borda animada que varia por nível:

```
Nível 1–2: borda sólida, cor cinza/bronze
Nível 3–4: borda sólida, cor verde/azul
Nível 5–6: borda com gradiente suave
Nível 7:   borda com gradiente animado (conic-gradient girando)
           — efeito "aura lendária"
```

---

## 11. Acessibilidade

### 11.1 Contraste de Cores

Todos os temas foram projetados para atender **WCAG 2.1 AA** (mínimo):

| Par de cores | Razão mínima exigida | Meta do projeto |
|-------------|---------------------|-----------------|
| Texto primário / Bg base | 4.5:1 | ≥ 7:1 |
| Texto secundário / Bg surface | 4.5:1 | ≥ 5:1 |
| Accent / Bg base (ícones) | 3:1 | ≥ 4.5:1 |
| Texto inverse / Accent | 4.5:1 | ≥ 7:1 |

> Ferramenta de verificação recomendada: [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/) e `axe-core` nos testes automatizados.

### 11.2 Navegação por Teclado

- Todos os elementos interativos acessíveis por `Tab` em ordem lógica
- `Escape` fecha modais e dropdowns
- Sidebar com `aria-expanded` e atalhos de teclado documentados
- Timer: `Space` para pausar/retomar, `Enter` para confirmar ação
- Skip link `"Ir para o conteúdo principal"` visível ao receber foco

### 11.3 Screen Readers

```html
<!-- Exemplo de barra de XP acessível -->
<div
  role="progressbar"
  aria-valuenow="3200"
  aria-valuemin="1501"
  aria-valuemax="3000"
  aria-label="XP: 3200 de 6000 para o nível 5 — Scholar"
>
```

- Conquistas anunciadas via `aria-live="polite"` ao desbloquear
- Toast de XP anunciado via `aria-live="assertive"`
- Avatares com `alt` descritivo

### 11.4 Preferências do Sistema

```css
/* Respeitar preferência de movimento reduzido */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Respeitar preferência de alto contraste */
@media (prefers-contrast: high) {
  :root {
    --border-subtle: var(--border-strong);
  }
}
```

---

## 12. Implementação Técnica dos Temas

### 12.1 Estrutura no Next.js com Tailwind

O sistema de temas é implementado com CSS Custom Properties + atributo `data-theme` na tag `<html>`, sem necessidade de gerar classes Tailwind extras.

**Arquivo: `src/lib/theme.ts`**
```typescript
export type ThemeMode = 'dark' | 'light'
export type ThemeColor = 'purple' | 'blue' | 'yellow'

export interface Theme {
  mode: ThemeMode
  color: ThemeColor
}

export function getThemeId(theme: Theme): string {
  return `${theme.mode}-${theme.color}`
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', getThemeId(theme))
  // Salva localmente para aplicar antes do hydration (evita flash)
  localStorage.setItem('sq-theme', JSON.stringify(theme))
}

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('sq-theme')
    if (stored) return JSON.parse(stored)
  } catch {}
  return { mode: 'dark', color: 'purple' } // padrão
}
```

**Arquivo: `src/app/layout.tsx`**
```tsx
// Script inline no <head> para aplicar tema ANTES do render
// Evita flash de tema errado (FOUT de tema)
const themeScript = `
  (function() {
    try {
      var t = JSON.parse(localStorage.getItem('sq-theme') || '{}');
      var theme = (t.mode || 'dark') + '-' + (t.color || 'purple');
      document.documentElement.setAttribute('data-theme', theme);
    } catch(e) {
      document.documentElement.setAttribute('data-theme', 'dark-purple');
    }
  })();
`

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

**Arquivo: `src/stores/themeStore.ts`**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Theme, applyTheme } from '@/lib/theme'

interface ThemeStore {
  theme: Theme
  setMode: (mode: Theme['mode']) => void
  setColor: (color: Theme['color']) => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: { mode: 'dark', color: 'purple' },

      setMode: (mode) =>
        set((state) => {
          const next = { ...state.theme, mode }
          applyTheme(next)
          return { theme: next }
        }),

      setColor: (color) =>
        set((state) => {
          const next = { ...state.theme, color }
          applyTheme(next)
          return { theme: next }
        }),

      setTheme: (theme) => {
        applyTheme(theme)
        return set({ theme })
      },
    }),
    { name: 'sq-theme' }
  )
)
```

---

### 12.2 CSS Global com Todas as Variáveis

**Arquivo: `src/app/globals.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cinzel:wght@700;800&family=JetBrains+Mono:wght@400;700&display=swap');

/* === VARIÁVEIS BASE === */
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Cinzel', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Espaçamento */
  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 24px;
  --space-8: 32px; --space-10: 40px; --space-12: 48px;

  /* Border radius */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px;
  --radius-xl: 20px; --radius-full: 9999px;

  /* Transição padrão */
  --transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* === TEMAS (colados aqui da seção 3) === */
[data-theme="dark-purple"] { /* ... */ }
[data-theme="dark-blue"]   { /* ... */ }
[data-theme="dark-yellow"] { /* ... */ }
[data-theme="light-purple"]{ /* ... */ }
[data-theme="light-blue"]  { /* ... */ }
[data-theme="light-yellow"]{ /* ... */ }

/* === BASE STYLES === */
body {
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.5;
  transition: background-color 300ms ease, color 200ms ease;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 12.3 Tailwind Config

**Arquivo: `tailwind.config.js`**
```javascript
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Mapear tokens CSS para classes Tailwind
        bg: {
          base:     'var(--bg-base)',
          surface:  'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          inverse:   'var(--text-inverse)',
        },
        accent: {
          DEFAULT:   'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          muted:     'var(--accent-muted)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        status: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          danger:  'var(--danger)',
          info:    'var(--info)',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px var(--accent-glow)',
        'glow-sm': '0 0 10px var(--accent-glow)',
      },
      animation: {
        'xp-gain': 'xpGain 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        xpGain: {
          '0%':   { transform: 'scaleX(var(--xp-before))' },
          '100%': { transform: 'scaleX(var(--xp-after))' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
```

---

### 12.4 Componente de Seletor de Tema

**Arquivo: `src/components/ui/ThemeSwitcher.tsx`**
```tsx
import { useThemeStore } from '@/stores/themeStore'

const COLORS = [
  { id: 'purple', label: 'Roxo',    hex: '#9333EA' },
  { id: 'blue',   label: 'Azul',    hex: '#2563EB' },
  { id: 'yellow', label: 'Âmbar',   hex: '#D97706' },
] as const

export function ThemeSwitcher() {
  const { theme, setMode, setColor } = useThemeStore()

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle Dark/Light */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMode('dark')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition
            ${theme.mode === 'dark'
              ? 'bg-accent text-text-inverse'
              : 'bg-bg-elevated text-text-secondary'}`}
        >
          🌙 Escuro
        </button>
        <button
          onClick={() => setMode('light')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition
            ${theme.mode === 'light'
              ? 'bg-accent text-text-inverse'
              : 'bg-bg-elevated text-text-secondary'}`}
        >
          ☀️ Claro
        </button>
      </div>

      {/* Seletor de Cor */}
      <div className="flex gap-3">
        {COLORS.map((c) => (
          <button
            key={c.id}
            onClick={() => setColor(c.id)}
            title={c.label}
            className={`w-10 h-10 rounded-full border-2 transition-all
              ${theme.color === c.id
                ? 'scale-110 border-text-primary shadow-glow'
                : 'border-transparent hover:scale-105'}`}
            style={{ backgroundColor: c.hex }}
            aria-label={`Tema ${c.label}`}
            aria-pressed={theme.color === c.id}
          />
        ))}
      </div>
    </div>
  )
}
```

---

### 12.5 Sincronização do Tema com o Backend

A preferência de tema é salva no perfil do usuário para persistir entre dispositivos:

```typescript
// src/services/userService.ts

export async function syncThemeToServer(theme: Theme): Promise<void> {
  await api.patch('/users/me', {
    preferences: { theme }
  })
}

// Chamado no setTheme do store, com debounce de 1s
// para evitar muitas requisições ao alternar rápido
```

```prisma
// Adição ao model User no schema.prisma
model User {
  // ... campos existentes
  preferences Json @default("{}")
  // preferences.theme: { mode: 'dark'|'light', color: 'purple'|'blue'|'yellow' }
}
```

---

## Resumo de Decisões de Design

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Tema padrão | `dark-purple` | Mais imersivo para o contexto RPG |
| Amarelo no dark | Âmbar `#D97706`, não amarelo puro | Ergonomia visual — amarelo puro cansa |
| Fonte de títulos | Cinzel | Tom épico/medieval sem ser kitsch |
| Sistema de temas | CSS Custom Properties + `data-theme` | Zero bundle extra, transição CSS nativa |
| Mobile nav | Bottom bar | Thumb zone — mais acessível no celular |
| Timer mobile | Tela cheia | Maximiza o foco do usuário |
| Animações | Opt-out (prefers-reduced-motion) | Acessibilidade e performance |
| Breakpoints | Mobile-first (Tailwind padrão) | Maioria dos usuários em celular |
| Persistência do tema | localStorage + banco | Imediato localmente, sincronizado remotamente |

---

*StudyQuest RPG — Design Document v1.0 • 2025 • Confidencial*
