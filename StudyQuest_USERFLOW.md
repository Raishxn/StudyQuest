# 🗺️ StudyQuest RPG — User Flow & Wireframes
## Jornadas do Usuário e Estrutura de Telas

**Versão 1.0 • 2025**

---

## Sumário

1. [Mapa Geral de Navegação](#1-mapa-geral-de-navegação)
2. [Fluxo de Onboarding](#2-fluxo-de-onboarding)
3. [Dashboard — Tela Principal](#3-dashboard--tela-principal)
4. [Sessão de Estudo](#4-sessão-de-estudo)
5. [Fórum de Dúvidas](#5-fórum-de-dúvidas)
6. [Banco de Provas](#6-banco-de-provas)
7. [Chat](#7-chat)
8. [Rankings](#8-rankings)
9. [Perfil do Usuário](#9-perfil-do-usuário)
10. [Configurações](#10-configurações)
11. [Fluxos de Estado Especiais](#11-fluxos-de-estado-especiais)

---

## 1. Mapa Geral de Navegação

```
[Não autenticado]
        │
        ├── /login ──────────────────────────────────────────────────┐
        └── /register                                                 │
              ├── Etapa 1: Dados básicos                             │
              └── Etapa 2: Perfil acadêmico                         │
                          │                                          │
                          ▼                                          ▼
[Autenticado] ────────────────────────────────────────────────────────
                          │
              ┌───────────┼────────────────┬──────────────┐
              ▼           ▼                ▼              ▼
         /dashboard    /study           /forum         /bank
              │           │                │              │
              │      ├── /study/new    ├── /forum/new  ├── /bank/upload
              │      └── /study/:id   └── /forum/:id  └── /bank/:id
              │
              ├── /chat
              │     └── /chat/:id
              │
              ├── /ranking
              │     ├── ?tab=global
              │     ├── ?tab=subject
              │     ├── ?tab=friends
              │     └── ?tab=institution
              │
              ├── /profile (próprio)
              │     └── /profile/:username (outros)
              │
              └── /settings
                    ├── ?tab=account
                    ├── ?tab=appearance
                    ├── ?tab=notifications
                    └── ?tab=privacy
```

---

## 2. Fluxo de Onboarding

### 2.1 Tela de Boas-Vindas / Landing (`/`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ⚔️  STUDYQUEST RPG                                    │
│   Transforme seus estudos em uma aventura               │
│                                                         │
│   [Criar conta grátis]    [Já tenho conta → Login]      │
│                                                         │
│   ──────────────────────────────────────────────────    │
│   Preview: XP bar • Rankings • Timer Pomodoro           │
│   (mockups animados do produto)                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Decisão de navegação:**
- Usuário já logado → redireciona para `/dashboard` automaticamente.

---

### 2.2 Registro — Etapa 1 (`/register`)

```
┌─────────────────────────────────────────────────────────┐
│  ← Voltar          Criar sua conta          1 ●  2 ○   │
│                                                         │
│  Nome completo                                          │
│  [________________________________]                     │
│                                                         │
│  Username                                               │
│  [@_____________________________]  ✓ disponível         │
│                                                         │
│  E-mail                                                 │
│  [________________________________]                     │
│                                                         │
│  Senha                                                  │
│  [________________________________]  [👁]               │
│  ████░░░░  Força da senha: Média                        │
│                                                         │
│  ─────────────────── ou ──────────────────────          │
│  [G  Continuar com Google]                              │
│                                                         │
│  [Continuar →]                                          │
│                                                         │
│  Ao criar conta você concorda com os                    │
│  [Termos de Uso] e a [Política de Privacidade]          │
└─────────────────────────────────────────────────────────┘
```

**Validações inline (ao sair do campo):**
- Username: verificação de disponibilidade via `GET /users/check-username?u=joao` com debounce de 500ms.
- E-mail: formato válido.
- Senha: indicador de força em tempo real.

---

### 2.3 Registro — Etapa 2 (`/register/academic`)

```
┌─────────────────────────────────────────────────────────┐
│  ← Voltar        Perfil acadêmico           1 ✓  2 ●   │
│                                                         │
│  Quase lá! Isso personaliza sua experiência             │
│                                                         │
│  Sua instituição                                        │
│  [🔍 Buscar universidade ou faculdade...    ▼]          │
│                                                         │
│  > Resultado da busca:                                  │
│  │ UFMG — Universidade Federal de Minas Gerais          │
│  │ USP — Universidade de São Paulo                      │
│  │ PUC-Rio — Pontifícia Universidade Católica           │
│                                                         │
│  Seu curso  (aparece após selecionar a instituição)     │
│  [🔍 Buscar curso...                        ▼]          │
│                                                         │
│  Período atual  (opcional)                              │
│  [  1º  ▼]                                              │
│                                                         │
│  Turno  (opcional)                                      │
│  ○ Matutino  ○ Vespertino  ● Noturno  ○ Integral        │
│                                                         │
│  [Pular por enquanto]      [Começar aventura! ⚔️]       │
└─────────────────────────────────────────────────────────┘
```

**Lógica de busca:**
- Campo de instituição: busca `GET /institutions?q=ufmg` com debounce de 300ms.
- Campo de curso só é habilitado após selecionar a instituição.
- Busca de curso: `GET /institutions/:id/courses?q=engenharia`.

---

### 2.4 Verificação de E-mail

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│          📬  Verifique seu e-mail                       │
│                                                         │
│  Enviamos um link para                                  │
│  j***@gmail.com                                         │
│                                                         │
│  Clique no link para ativar sua conta.                  │
│  O link expira em 24 horas.                             │
│                                                         │
│  Não recebeu?                                           │
│  [Reenviar e-mail]   (disponível após 60s)              │
│                                                         │
│  [Entrar assim mesmo →]  (acesso limitado)              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Dashboard — Tela Principal (`/dashboard`)

```
┌──────────────────────────────────────────────────────────────────┐
│ TOPBAR                                                           │
│ ⚔️ StudyQuest   [🔍 Buscar]        [🔥7] [⚡3.2k XP ████░ L4]  [🔔] [👤]│
├──────────────┬───────────────────────────────────────────────────┤
│ SIDEBAR      │  BOM DIA, JOÃO! ☀️                                │
│              │  Você está no nível 4 — ⚡ Acadêmico              │
│ 🏠 Dashboard │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  │
│ 📚 Estudar   │                                                   │
│ 💬 Fórum     │  ┌──────────────┐ ┌──────────────┐ ┌──────────┐  │
│ 📁 Banco     │  │ HOJE         │ │ ESTA SEMANA  │ │ STREAK   │  │
│ 💬 Chat      │  │ 1h 23min     │ │ 8h 45min     │ │ 🔥 7 dias│  │
│ 🏆 Ranking   │  │ estudados    │ │ estudadas    │ │          │  │
│ 👤 Perfil    │  └──────────────┘ └──────────────┘ └──────────┘  │
│              │                                                   │
│ ─────────    │  ┌─────────────────────────────────────────────┐  │
│              │  │ 📚 INICIAR SESSÃO                     [→]   │  │
│ ⚙️ Config    │  │ Matéria: [Cálculo ▼]  Modo: [Pomodoro ▼]    │  │
│              │  └─────────────────────────────────────────────┘  │
│              │                                                   │
│              │  ┌───────────────────┐  ┌───────────────────┐    │
│              │  │ 📜 ATIVIDADE      │  │ 🏆 RANKING        │    │
│              │  │                   │  │ AMIGOS            │    │
│              │  │ ⚡ +60 XP Cálculo │  │ #1 Ana     4.200  │    │
│              │  │ 📤 +50 XP Upload  │  │ #2 Pedro   3.800  │    │
│              │  │ ✅ +20 XP Fórum   │  │ #3 → Você  3.200  │    │
│              │  │ [Ver tudo]        │  │ [Ver ranking]     │    │
│              │  └───────────────────┘  └───────────────────┘    │
│              │                                                   │
│              │  ┌─────────────────────────────────────────────┐  │
│              │  │ 💬 FÓRUM — Perguntas sem resposta     [Ver] │  │
│              │  │ • "Como resolver integrais por partes?"      │  │
│              │  │ • "Dúvida na prova da Ana Cláudia 2024.2"   │  │
│              │  └─────────────────────────────────────────────┘  │
└──────────────┴───────────────────────────────────────────────────┘
```

---

## 4. Sessão de Estudo

### 4.1 Tela de Sessões (`/study`)

```
┌─────────────────────────────────────────────────────────────────┐
│  📚 Sessões de Estudo                    [+ Nova Sessão]        │
│                                                                 │
│  ─── SESSÃO ATIVA ─────────────────────────────────────────    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Cálculo II — Integrais                                 │   │
│  │  ⏱ 00:23:14   🍅 Pomodoro #1          [Pausar] [Parar] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─── HISTÓRICO ─────────────────────────────────────────────   │
│                                                                 │
│  Hoje                                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Física II        1h 15min    Pomodoro    +85 XP  09:00 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Ontem                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Cálculo II       2h 00min    Pomodoro   +130 XP  20:30 │   │
│  │  Algoritmos       0h 45min    Avulso      +45 XP  14:00 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Gráfico de horas por matéria — últimos 7 dias]                │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Tela de Sessão Ativa — Timer (`/study/:id`) — Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Voltar         📚 Cálculo II — Integrais                     │
│                                                                 │
│               ┌─────────────────────────────┐                  │
│               │                             │                  │
│               │       🍅 POMODORO #1        │                  │
│               │                             │                  │
│               │          24:47              │                  │
│               │      (SVG circular)         │                  │
│               │                             │                  │
│               └─────────────────────────────┘                  │
│                                                                 │
│               [  ⏸ Pausar  ]    [⏹ Encerrar]                   │
│                                                                 │
│  ────────────────────────────────────────────────────────────  │
│  XP ao encerrar (estimado): ~+35 XP                            │
│  Tempo ativo: 00:25:13                                          │
│                                                                 │
│  ┌─ Anotações da sessão ───────────────────────────────────┐   │
│  │  [Campo de texto livre — notas do que estudou]          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Timer no Mobile — Tela cheia:**
```
┌──────────────────────┐
│                      │
│  Cálculo II          │
│  🍅 Pomodoro #1      │
│                      │
│       24:47          │
│   (SVG circular      │
│    ocupa 60% da      │
│    tela)             │
│                      │
│  XP estimado: ~35    │
│                      │
│  [ ⏸ ]    [ ⏹ ]     │
│                      │
└──────────────────────┘
```

---

### 4.3 Modal de Nova Sessão

```
┌─────────────────────────────────────────────────────┐
│  Nova Sessão de Estudo                          [×] │
│                                                     │
│  Matéria *                                          │
│  [Cálculo II                              ▼]        │
│  + Adicionar matéria personalizada                  │
│                                                     │
│  Tópico (opcional)                                  │
│  [Integrais por substituição               ]        │
│                                                     │
│  Modo de timer                                      │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │ 🍅 POMODORO      │  │ ⏱ AVULSO         │         │
│  │ 25min + pausas   │  │ Tempo livre      │         │
│  │ [selecionado]    │  │                  │         │
│  └──────────────────┘  └──────────────────┘         │
│                                                     │
│  Duração do ciclo: [25 ▼] min + pausa [5 ▼] min    │
│                                                     │
│  Anotação inicial (opcional)                        │
│  [                                         ]        │
│                                                     │
│  [Cancelar]                [🚀 Iniciar sessão]      │
└─────────────────────────────────────────────────────┘
```

---

### 4.4 Modal de Encerramento de Sessão

```
┌─────────────────────────────────────────────────────┐
│  Encerrar sessão?                               [×] │
│                                                     │
│  📊 Resumo da sessão:                               │
│  • Tempo estudado: 47 min                           │
│  • Pomodoros completos: 1                           │
│  • Matéria: Cálculo II                              │
│                                                     │
│  ⚡ XP a ganhar: +57 XP                             │
│  (+47 base + 10 bônus Pomodoro)                     │
│                                                     │
│  [Continuar estudando]    [Encerrar e ganhar XP]    │
└─────────────────────────────────────────────────────┘
```

---

## 5. Fórum de Dúvidas

### 5.1 Lista de Posts (`/forum`)

```
┌─────────────────────────────────────────────────────────────────┐
│  💬 Fórum                               [+ Nova Pergunta]       │
│                                                                 │
│  [🔍 Buscar no fórum...            ]                            │
│                                                                 │
│  Filtros: [Todas ▼]  [Matéria ▼]  [Sem resposta]  [Mais votados]│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✅ RESOLVIDA                                            │   │
│  │ Como resolver integrais por substituição trigonométrica?│   │
│  │ Cálculo II  •  @joaosilva  •  há 2h  •  3 respostas    │   │
│  │ ▲ 12 votos                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ❓ SEM RESPOSTA                                         │   │
│  │ Dúvida na questão 3 da prova da Prof. Ana Cláudia       │   │
│  │ Cálculo I  •  @maria.edu  •  há 5min  •  0 respostas   │   │
│  │ ▲ 2 votos                                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Carregar mais...]                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Post Individual (`/forum/:id`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Voltar ao fórum                                              │
│                                                                 │
│  ❓ Como resolver integrais por substituição trigonométrica?    │
│  Cálculo II  •  #integral  •  #trigonometria                    │
│  @joaosilva  •  há 5min                        ▲ 2  [Denunciar]│
│                                                                 │
│  ─── PERGUNTA ──────────────────────────────────────────────   │
│  Estou com dúvida na resolução de integrais do tipo...          │
│  [imagem anexada: questao.png]                                  │
│                                                                 │
│  ─── 2 RESPOSTAS ───────────────────────────────────────────   │
│                                                                 │
│  ✅ SOLUÇÃO ACEITA                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ @pedro.math  •  há 2h                       ▲ 8         │   │
│  │ Para este tipo de integral, você deve...                 │   │
│  │ [pdf: resolucao_completa.pdf]                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ @ana.calc  •  há 1h                         ▲ 3         │   │
│  │ Outra abordagem seria...                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─── SUA RESPOSTA ──────────────────────────────────────────   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Escreva sua resposta aqui...               ]           │   │
│  │ [📎 Anexar arquivo]          [Enviar resposta →]        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5.3 Criar Post (`/forum/new`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Voltar         Nova Pergunta                                 │
│                                                                 │
│  Título *                                                       │
│  [Como calcular a derivada de funções compostas?       ]        │
│  45/200 caracteres                                              │
│                                                                 │
│  Matéria *                                                      │
│  [Cálculo I                                           ▼]        │
│                                                                 │
│  Tags (opcional)                                                │
│  [derivada] [regra da cadeia] [+ adicionar]                     │
│                                                                 │
│  Descrição *                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ B  I  `  [imagem]  [link]                               │   │
│  │ ─────────────────────────────────────────────────────   │   │
│  │ Estou com dificuldades em...                            │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│  123/10000 caracteres                                           │
│                                                                 │
│  Anexo (opcional)                                               │
│  [📎 Arrastar arquivo ou clicar para selecionar]                │
│  PDF, JPG, PNG — máx. 20MB                                      │
│                                                                 │
│  [Cancelar]                           [Publicar pergunta →]     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Banco de Provas

### 6.1 Lista do Banco (`/bank`)

```
┌─────────────────────────────────────────────────────────────────┐
│  📁 Banco de Provas                        [+ Enviar material]  │
│                                                                 │
│  ┌── FILTROS ──────────────────────────────────────────────┐   │
│  │ Matéria: [Todas ▼]   Professor: [Todos ▼]               │   │
│  │ Período: [Todos ▼]   Tipo: [Todos ▼]   [Aplicar]        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [🔍 Buscar provas, professores, matérias...          ]         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📄 P1 de Cálculo I — 2025.1                            │   │
│  │ Prof. Ana Cláudia  •  Engenharia  •  ⭐ 4.8  •  12 💬  │   │
│  │ Enviado por @joaosilva  •  há 3 dias                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📋 Lista de Algoritmos — 2024.2                        │   │
│  │ Prof. Carlos Mendes  •  Computação  •  ⭐ 4.5  •  5 💬 │   │
│  │ Enviado por @maria.edu  •  há 1 semana                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Item do Banco (`/bank/:id`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Banco de Provas                                              │
│                                                                 │
│  📄 P1 de Cálculo I — 2025.1                                    │
│  Prof. Ana Cláudia  •  UFMG  •  Engenharia Civil  •  2025.1    │
│  ⭐⭐⭐⭐⭐ 4.8 (23 avaliações)    [Avaliar]    [Denunciar]      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │         [Preview inline do PDF]                         │   │
│  │         (usando react-pdf ou iframe)                    │   │
│  │                                                         │   │
│  │         Página 1/4        [⬇️ Download]                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─── 12 COMENTÁRIOS / RESOLUÇÕES ───────────────────────────   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✅ MELHOR RESOLUÇÃO  •  @pedro.math  •  há 2 dias  ▲ 18│   │
│  │ Resolução completa da prova:                            │   │
│  │ [📄 resolucao_p1_calc.pdf]                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌── Deixar comentário ────────────────────────────────────┐   │
│  │ [Escreva um comentário ou envie sua resolução...]        │   │
│  │ [📎 Anexar arquivo]              [Publicar comentário]  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6.3 Upload de Material (`/bank/upload`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Voltar         Enviar Material                               │
│                                                                 │
│  Tipo de material *                                             │
│  ● Prova/Avaliação   ○ Lista de Exercícios   ○ Gabarito         │
│                                                                 │
│  Arquivo *                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │   📎  Arraste o arquivo aqui ou clique para selecionar  │   │
│  │        PDF, JPG, PNG — máx. 20MB                        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Título descritivo *                                            │
│  [P1 de Cálculo I — Turma A                           ]         │
│                                                                 │
│  Matéria *          Instituição *                               │
│  [Cálculo I   ▼]    [UFMG — pré-selecionada          ▼]        │
│                                                                 │
│  Curso *            Professor (opcional)                        │
│  [Eng. Civil  ▼]    [Ana Cláudia                      ]         │
│                                                                 │
│  Período (opcional)                                             │
│  Ano: [2025]   Semestre: [● 1º  ○ 2º]                          │
│                                                                 │
│  ℹ️ Você ganhará +50 XP ao enviar                               │
│                                                                 │
│  [Cancelar]                          [Enviar material →]        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Chat

### 7.1 Lista de Conversas (`/chat`)

```
┌─────────────────────────────────────────────────────────────────┐
│  💬 Mensagens                          [+ Nova conversa]        │
│                                                                 │
│  [🔍 Buscar conversa...                ]                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 👥 Grupo de Cálculo (4)          há 2min  ● 3 não lidas │   │
│  │ Pedro: "Alguém fez a questão 5?"                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ @pedro.math    ⚡ Acadêmico       há 1h                 │   │
│  │ "Valeu pelo link da prova!"                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ @ana.calc      🏆 Scholar         ontem                 │   │
│  │ Você: "Ok, te vejo na prova!"                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 7.2 Conversa Individual (`/chat/:id`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Voltar    @pedro.math  ⚡ Acadêmico  •  Online    [⋮]        │
│                                                                 │
│  ─────────────────── Hoje ────────────────────────────────     │
│                                                                 │
│  ┌──────────────────────────┐                                   │
│  │ Você tem a P1 de Calc?   │ 14:20 ✓✓                         │
│  └──────────────────────────┘                                   │
│                           ┌──────────────────────────────────┐  │
│                           │ Tenho sim, vou mandar agora!  ✓✓ │  │
│                           └──────────────────────────────────┘  │
│                           ┌──────────────────────────────────┐  │
│                           │ 📎 P1_Calc_2025.1.pdf         ✓✓ │  │
│                           └──────────────────────────────────┘  │
│                                                                 │
│  📚 Pedro está estudando Física II (sessão ativa)               │
│                                                                 │
│  ─────────────────────────────────────────────────────────     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Escreva uma mensagem...                    ] [📎] [➤]  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Rankings

### 8.1 Tela de Rankings (`/ranking`)

```
┌─────────────────────────────────────────────────────────────────┐
│  🏆 Rankings                                                    │
│                                                                 │
│  [Global] [Por Matéria] [Amigos] [Minha Faculdade]              │
│  ──────────────────────────────────────────────────────────     │
│  Período: [● Semanal]  [Mensal]  [Geral]                        │
│                                                                 │
│  ─── TOP 3 ─────────────────────────────────────────────────   │
│                                                                 │
│      ┌─────────┐                                                │
│      │  🥇 #1  │                                                │
│   ┌──┤ @pedro  ├──┐                                            │
│   │🥈│  4.800  │🥉│                                            │
│   │#2│   XP    │#3│                                            │
│   │   └─────────┘  │                                            │
│   │@ana    @carlos │                                            │
│   │3.900   3.200   │                                            │
│   └────────────────┘                                            │
│                                                                 │
│  ─── RANKING ───────────────────────────────────────────────   │
│  #4   @maria.edu    🧪 Pesquisador    3.050 XP                  │
│  #5   @lucas.br     📚 Aplicado       2.800 XP                  │
│  ...                                                            │
│  ─────────────────────────────────────────────────────────     │
│  #47  → Você        ⚡ Acadêmico      1.200 XP  [↑ 3 posições] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Perfil do Usuário

### 9.1 Perfil Próprio (`/profile`)

```
┌─────────────────────────────────────────────────────────────────┐
│  👤 Meu Perfil                               [✏️ Editar perfil] │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  [Avatar 96px]  João Silva          🔥 Lendário (L7)       │ │
│  │  com borda ouro │ @joaosilva                               │ │
│  │                 │ UFMG — Engenharia de Software • 6º per.  │ │
│  │                 │ ⚡ 25.400 XP  •  342h estudadas          │ │
│  │                 │ [+ Adicionar amigo]  [💬 Mensagem]       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ─── ESTATÍSTICAS ────────────────────────────────────────     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 342h     │ │ 🔥 23d   │ │ #47 🌍   │ │ 18 🏆    │          │
│  │ estudadas│ │ streak   │ │ global   │ │ conquist.│          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  ─── CONQUISTAS ──────────────────────────────────────────     │
│  🧮 Calculista   🏃 Maratonista   📤 Compartilhador   [Ver +15]│
│                                                                 │
│  ─── HORAS POR MATÉRIA ───────────────────────────────────     │
│  Cálculo II    ████████████████░░  128h                        │
│  Física II     ████████░░░░░░░░░░   78h                        │
│  Algoritmos    █████░░░░░░░░░░░░░   45h                        │
│                                                                 │
│  ─── SESSÕES RECENTES ─────────────────────────────────────    │
│  • Cálculo II — 2h 15min — hoje                                │
│  • Física II — 1h 00min — ontem                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Configurações

### 10.1 Tela de Configurações (`/settings`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚙️ Configurações                                               │
│                                                                 │
│  [Conta] [Aparência] [Notificações] [Privacidade]               │
│                                                                 │
│  ─── ABA: APARÊNCIA ──────────────────────────────────────     │
│                                                                 │
│  Modo                                                           │
│  [🌙 Escuro]    [☀️ Claro]                                      │
│                                                                 │
│  Cor de destaque                                                │
│  ● Roxo  ○ Azul  ○ Amarelo                                     │
│  (esferas coloridas clicáveis com preview em tempo real)        │
│                                                                 │
│  Preview:                                                       │
│  ┌──────────────────────────────────┐                          │
│  │ [Miniatura da interface com o    │                          │
│  │  tema selecionado aplicado]      │                          │
│  └──────────────────────────────────┘                          │
│                                                                 │
│  Sons do Pomodoro                                               │
│  [● Ativado    ○ Desativado]  Volume: [████░] 80%               │
│                                                                 │
│  Animações                                                      │
│  [● Ativadas   ○ Reduzidas]                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Fluxos de Estado Especiais

### 11.1 Fluxo de Level-Up

```
Sessão encerrada
      │
      ▼
XP calculado e adicionado
      │
      ├── Não subiu de nível → Toast "+57 XP ⚡" (3s)
      │
      └── Subiu de nível →
              │
              ▼
    ┌─────────────────────────────┐
    │                             │
    │   ✨ LEVEL UP! ✨            │
    │                             │
    │   [Badge antigo] → [novo]   │
    │   ⚡ Acadêmico → 🏆 Scholar │
    │                             │
    │   Desbloqueado:             │
    │   • Nova borda de avatar    │
    │   • Ranking por Instituição │
    │                             │
    │      [Continuar →]          │
    │                             │
    └─────────────────────────────┘
              │
              ▼
    Retorna para o contexto anterior
```

---

### 11.2 Fluxo de Conquista Desbloqueada

```
Evento dispara verificação (async)
      │
      ▼
Conquista ainda não desbloqueada?
      │
      ├── Não → ignorar
      │
      └── Sim →
          ┌─────────────────────────────────────┐
          │  🏆 Conquista desbloqueada!          │  ← aparece no canto
          │  🧮 Calculista                       │    (bounce-in)
          │  "100h estudando Cálculo"            │
          │  +300 XP                             │
          └─────────────────────────────────────┘
          (some após 5s, fica no perfil permanentemente)
```

---

### 11.3 Fluxo de Sessão Interrompida (Heartbeat Perdido)

```
App reabre / usuário volta
      │
      ▼
Sessão ABANDONED encontrada?
      │
      ├── Não → Tela normal
      │
      └── Sim →
          ┌───────────────────────────────────────┐
          │  Sessão interrompida detectada        │
          │                                       │
          │  Sua sessão de Cálculo II foi         │
          │  interrompida.                        │
          │                                       │
          │  Tempo registrado: 34min              │
          │  XP ganho: +34 XP ✓ (já creditado)   │
          │                                       │
          │  [Ok, entendi]                        │
          └───────────────────────────────────────┘
```

---

### 11.4 Fluxo de Denúncia de Conteúdo

```
Usuário clica em [Denunciar]
      │
      ▼
┌───────────────────────────────────┐
│  Por que está denunciando?    [×] │
│                                   │
│  ○ Conteúdo inapropriado          │
│  ○ Spam ou propaganda             │
│  ● Violação de direitos autorais  │
│  ○ Informação incorreta           │
│  ○ Outro                          │
│                                   │
│  Detalhes (opcional):             │
│  [                              ] │
│                                   │
│  [Cancelar]      [Enviar denúncia]│
└───────────────────────────────────┘
      │
      ▼
Toast: "Denúncia enviada. Obrigado!"
Conteúdo entra na fila de moderação
```

---

*StudyQuest RPG — User Flow & Wireframes v1.0 • 2025 • Confidencial*
