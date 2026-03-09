# ⚔️ StudyQuest RPG
## Plataforma de Estudos Gamificada para Ensino Superior

**PRODUCT REQUIREMENTS DOCUMENT (PRD)**  
Versão 1.0 • 2025

---

## Sumário Executivo

O StudyQuest RPG é uma plataforma web/mobile de estudos gamificada voltada para estudantes do ensino superior. A plataforma combina mecânicas de RPG (experiência, níveis, rankings, títulos) com ferramentas reais de produtividade acadêmica como sessões de estudo com timer Pomodoro, banco de provas, fórum de dúvidas e chat entre amigos. O objetivo é aumentar o engajamento e a consistência nos estudos por meio de recompensas progressivas e competição saudável.

---

## 1. Visão Geral do Produto

### 1.1 Problema

Estudantes universitários frequentemente carecem de disciplina, motivação e ferramentas integradas para organizar seus estudos. Apps genéricos de produtividade não atendem o contexto acadêmico e não oferecem engajamento social ou progressão visível.

### 1.2 Solução

Uma plataforma que une gamificação (XP, níveis, títulos, rankings) com ferramentas acadêmicas reais: sessões de estudo, banco de provas comentadas, fórum e chat. Quanto mais o aluno estuda, mais evolui dentro de um sistema de progressão inspirado em RPGs.

### 1.3 Proposta de Valor

- **Gamificação real:** XP e níveis que refletem horas reais de estudo
- **Social:** rankings entre amigos e globais por matéria
- **Acadêmico:** banco de provas antigas + resoluções colaborativas
- **Produtividade:** Pomodoro integrado com rastreamento automático de XP
- **Comunidade:** fórum de dúvidas e chat entre colegas

---

## 2. Cadastro e Perfil Acadêmico

### 2.1 Fluxo de Registro

O cadastro é dividido em **duas etapas** para não sobrecarregar o usuário logo de início:

**Etapa 1 — Conta básica**
- Nome completo
- Username (único, gerado automaticamente como sugestão)
- E-mail
- Senha (ou continuar com Google)

**Etapa 2 — Perfil acadêmico** *(obrigatório para completar o cadastro)*
- Instituição de ensino
- Curso
- Período/semestre atual *(opcional por ora, obrigatório em versão futura)*
- Turno: Matutino, Vespertino, Noturno, Integral *(opcional)*

---

### 2.2 Integração de Instituições (API de Universidades)

Para popular a lista de instituições no cadastro, utilizaremos a **API do MEC (e-MEC)**, que disponibiliza dados de todas as IES (Instituições de Ensino Superior) cadastradas no Brasil — públicas e privadas.

#### Fonte de dados

| Fonte | Cobertura | Endpoint |
|-------|-----------|----------|
| **e-MEC (MEC)** | Todas as IES brasileiras públicas e privadas credenciadas | `https://emec.mec.gov.br/emec/nova` |
| **IBGE** | Complemento geográfico (UF, município) | API pública IBGE |

> A API do e-MEC não possui uma REST API pública estável documentada. A estratégia recomendada para o MVP é fazer um **ETL (Extract, Transform, Load)** periódico: baixar os dados abertos do e-MEC (disponíveis em CSV/XML no portal dados.gov.br) e armazená-los no próprio banco PostgreSQL do StudyQuest, sincronizando mensalmente.

#### Estratégia de implementação

```
Fase MVP:
  1. Download dos dados abertos do e-MEC (dados.gov.br)
  2. ETL → tabelas institutions + courses no PostgreSQL
  3. Endpoint interno GET /institutions e GET /institutions/:id/courses
  4. Atualização mensal via cron job

Fase Futura:
  - Avaliar integração direta com API e-MEC se estabilizada
  - Permitir que usuários sugiram instituições não cadastradas
```

#### Dados armazenados por instituição

```prisma
model Institution {
  id         String   @id @default(cuid())
  emecCode   String   @unique       // Código e-MEC
  name       String                 // Nome oficial
  shortName  String?                // Sigla (ex: USP, UFMG, PUC-Rio)
  type       String                 // FEDERAL | ESTADUAL | MUNICIPAL | PRIVADA
  state      String                 // UF (ex: SP, RJ, MG)
  city       String
  active     Boolean  @default(true)
  courses    Course[]
  users      User[]
}
```

---

### 2.3 Integração de Cursos

Os cursos são vinculados às instituições. A base inicial vem do e-MEC, mas normalizada em uma tabela de cursos canônicos para evitar duplicatas.

```prisma
model Course {
  id            String      @id @default(cuid())
  name          String                           // Nome canônico (ex: Engenharia Civil)
  area          String                           // Grande área (ex: Engenharias)
  institutionId String
  institution   Institution @relation(fields: [institutionId], references: [id])
  users         User[]
}
```

#### Exemplos de grandes áreas de curso

| Área | Exemplos de cursos |
|------|--------------------|
| Exatas e da Terra | Matemática, Física, Química, Ciência da Computação |
| Engenharias | Eng. Civil, Eng. Elétrica, Eng. Mecânica, Eng. de Software |
| Saúde | Medicina, Enfermagem, Farmácia, Odontologia |
| Humanas | Direito, Psicologia, História, Filosofia |
| Sociais Aplicadas | Administração, Economia, Contabilidade, Jornalismo |
| Linguística e Artes | Letras, Pedagogia, Design, Arquitetura |

---

### 2.4 Período/Semestre

Campo opcional no cadastro, obrigatório em versão futura. Armazenado como dado simples no perfil do usuário.

- Valor: número inteiro de 1 a 12 (ou "Formando", "Intercâmbio")
- Exibido no perfil público como: "5º período" ou "3º semestre"
- Usado futuramente para: sugestão de matérias, rankings por período, mentoria

---

### 2.5 Perfil Público do Usuário

Com os dados acadêmicos, o perfil exibirá:

```
┌─────────────────────────────────────────────┐
│  🔥 João Silva              Nível 5 — Scholar │
│  @joaosilva                                  │
│                                              │
│  🏫 UFMG — Engenharia de Software            │
│  📅 6º período • Noturno                     │
│                                              │
│  ⚡ 4.820 XP  •  127h estudadas              │
│  🏆 Ranking Global: #142                     │
│                                              │
│  Conquistas: 🧮 Calculista  📤 Compartilhador │
└─────────────────────────────────────────────┘
```

---

### 2.6 Impacto nos Rankings

Com o dado de instituição e curso, surgem novos tipos de ranking:

| Ranking | Descrição |
|---------|-----------|
| 🏫 Ranking por Instituição | Top estudantes da mesma faculdade |
| 📘 Ranking por Curso | Top estudantes do mesmo curso (ex: todos os alunos de Direito do Brasil) |
| 🗺️ Ranking por Estado | Top estudantes por UF |

Esses rankings ficam para a **Fase 2** do roadmap.

---

## 3. Perfis de Usuário (Personas)

### 2.1 Estudante Competitivo
- Quer ver seu progresso e se comparar com colegas
- Motivado por rankings e conquistas
- Usa diariamente para registrar sessões de estudo

### 2.2 Estudante Colaborativo
- Compartilha provas antigas e resoluções
- Participa ativamente do fórum
- Usa o chat para grupos de estudo

### 2.3 Estudante Iniciante
- Busca material de estudo (banco de provas)
- Tem dúvidas pontuais e usa o fórum
- Se motiva ao ver a progressão de nível

---

## 3. Funcionalidades do Produto

### 3.1 Sistema RPG — XP, Níveis e Títulos

#### 3.1.1 Ganho de XP

| Ação | XP Ganho |
|------|----------|
| 1 minuto de sessão de estudo ativa | +1 XP |
| Sessão Pomodoro completa (25min) | +10 XP (bônus) |
| Upload de prova no banco | +50 XP |
| Resposta aceita no fórum | +20 XP |
| Streak diário (7 dias consecutivos) | +100 XP |
| Meta semanal atingida | +200 XP |

#### 3.1.2 Sistema de Níveis

| Nível | XP Necessário | Título | Insígnia |
|-------|--------------|--------|----------|
| 1 | 0 – 500 | 🎓 Calouro | Mochila |
| 2 | 501 – 1.500 | 📚 Aplicado | Livro aberto |
| 3 | 1.501 – 3.000 | 🧪 Pesquisador | Frasco |
| 4 | 3.001 – 6.000 | ⚡ Acadêmico | Raio |
| 5 | 6.001 – 12.000 | 🏆 Scholar | Troféu |
| 6 | 12.001 – 25.000 | 🌟 Mestre | Estrela |
| 7 | 25.001+ | 🔥 Lendário | Chama |

#### 3.1.3 Conquistas Especiais (Achievements)

| Conquista | Critério |
|-----------|---------|
| 🧮 "Calculista" | 100 horas estudando Cálculo |
| 🌙 "Insone" | Estudou após meia-noite por 10 dias |
| 🏃 "Maratonista" | 8 horas de estudo em um único dia |
| 📤 "Compartilhador" | 20 provas enviadas ao banco |
| ✅ "Solucionador" | 50 respostas aceitas no fórum |
| 👥 "Sociável" | 10 amigos adicionados |

---

### 3.2 Sessões de Estudo

Aba principal onde o usuário registra e inicia suas sessões de estudo com rastreamento automático de XP.

#### 3.2.1 Criação de Sessão
- Selecionar matéria (lista fixa + campo custom)
- Selecionar tema/tópico dentro da matéria
- Escolher modo: **Timer Avulso** ou **Pomodoro**
- Anotações opcionais antes de iniciar

#### 3.2.2 Modos de Timer
- **Pomodoro:** 25min foco + 5min pausa (padrão), configurável
- **Timer Avulso:** cronômetro livre, o usuário para quando quiser
- Ambos geram XP proporcionalmente ao tempo estudado
- Notificações push no fim de cada ciclo Pomodoro

#### 3.2.3 Histórico de Sessões
- Lista de todas as sessões com data, duração e matéria
- Gráfico semanal/mensal de horas por matéria
- Total de horas acumuladas por matéria

---

### 3.3 Fórum de Dúvidas

Espaço para postar dúvidas acadêmicas, com suporte a arquivos e organização por matéria.

#### 3.3.1 Criação de Post
- Título da dúvida
- Corpo da pergunta (texto rico com formatação básica)
- Matéria e tags de assunto
- Upload de arquivos: PDF, imagem, foto de questão (máx. 20MB)

#### 3.3.2 Interações
- Respostas em thread
- Upvotes em perguntas e respostas
- Marcar resposta como "solução aceita"
- Autor da solução aceita ganha XP bônus (+20 XP)

#### 3.3.3 Organização
- Filtros por matéria, tags, "sem resposta", "mais votados"
- Busca textual
- Notificação quando alguém responde sua pergunta

---

### 3.4 Chat entre Amigos

#### 3.4.1 Adição de Amigos
- Busca por username ou email
- Envio de solicitação de amizade
- Aceitar/recusar solicitações

#### 3.4.2 Funcionalidades do Chat
- Mensagens diretas (1 a 1)
- Grupos de estudo (até 20 pessoas)
- Compartilhar sessão de estudo em andamento
- Envio de arquivos e imagens
- Visualização de nível e título do amigo no chat

---

### 3.5 Banco de Questões e Provas

Repositório colaborativo de provas antigas e listas de exercícios, com comentários e resoluções da comunidade.

#### 3.5.1 Upload de Material
- Selecionar tipo: Prova, Lista de Exercícios, Gabarito
- Definir: Instituição, Curso, Matéria, Professor, Ano/Período
- Exemplo: `"P1 de Cálculo I — Ana Cláudia — 2025.1"`
- Upload de arquivo (PDF, imagem)
- Upload gera +50 XP para o contribuidor

#### 3.5.2 Visualização e Busca
- Busca por matéria, professor, período, instituição
- Filtros múltiplos combinados
- Preview inline do PDF
- Avaliação da qualidade do material (1–5 estrelas)

#### 3.5.3 Comentários e Resoluções
- Seção de comentários abaixo de cada prova
- Upload de resolução própria como resposta
- Upvote em resoluções
- Marcar resolução como "oficial/verificada" (moderadores)

---

### 3.6 Sistema de Rankings

#### 3.6.1 Tipos de Ranking

| Ranking | Descrição |
|---------|-----------|
| 🌍 Global | Top usuários por XP total |
| 📘 Por Matéria | Quem mais estudou cada disciplina |
| 👫 Entre Amigos | Posição entre seus amigos adicionados |
| 📊 Individual | Evolução pessoal ao longo do tempo por matéria |

#### 3.6.2 Períodos Disponíveis
- Semanal (reset toda segunda-feira)
- Mensal
- Geral (all-time)
- Por semestre letivo

#### 3.6.3 Visualização
- Top 3 destacados com pódio visual
- Posição atual do usuário sempre visível
- Comparativo: "Você está X posições atrás de [amigo]"

---

## 4. Arquitetura Técnica

### 4.1 Stack Tecnológica

#### 4.1.1 Frontend — Web

| Tecnologia | Uso |
|-----------|-----|
| **Next.js 14** (App Router) | Framework principal |
| **TypeScript** | Linguagem |
| **Tailwind CSS + shadcn/ui** | Estilização |
| **Zustand** | Estado global |
| **TanStack Query v5** | Cache e requisições |
| **React Hook Form + Zod** | Formulários e validação |
| **Framer Motion** | Animações |
| **Recharts** | Gráficos de progresso |
| **Socket.IO Client** | Real-time (chat) |

#### 4.1.2 Mobile

| Tecnologia | Uso |
|-----------|-----|
| **React Native + Expo SDK 51** | Framework mobile |
| **Expo Router** | Navegação |
| **NativeWind** | Tailwind para React Native |
| **Zustand** | Estado (compartilhado com web) |

#### 4.1.3 Backend

| Tecnologia | Uso |
|-----------|-----|
| **Node.js 20 LTS** | Runtime |
| **NestJS 10** | Framework |
| **TypeScript** | Linguagem |
| **Prisma 5** | ORM |
| **Socket.IO** | Real-time (chat) |
| **JWT + OAuth2 Google** | Autenticação |
| **Multer + Cloudflare R2** | Upload de arquivos |
| **BullMQ + Redis** | Filas de processamento |
| **Redis** | Cache |

#### 4.1.4 Banco de Dados

| Tecnologia | Uso |
|-----------|-----|
| **PostgreSQL 16** | Banco principal |
| **Redis 7** | Cache e sessões |
| **Elasticsearch** | Search avançado (futuro) |

#### 4.1.5 DevOps & Infra

| Tecnologia | Uso |
|-----------|-----|
| **Docker + Docker Compose** | Containerização |
| **GitHub Actions** | CI/CD |
| **Vercel** | Hospedagem frontend |
| **Railway ou Render** | Hospedagem backend (MVP) |
| **Cloudflare R2** | Storage de arquivos |
| **Sentry** | Monitoramento de erros |
| **Uptime Kuma** | Monitoramento de uptime |

---

## 5. Estrutura de Pastas do Projeto

### 5.1 Monorepo — Estrutura Raiz

```
studyquest/
├── apps/
│   ├── web/              # Next.js 14 (frontend web)
│   ├── mobile/           # React Native / Expo
│   └── api/              # NestJS (backend)
├── packages/
│   ├── ui/               # Componentes compartilhados
│   ├── types/            # Types TypeScript compartilhados
│   ├── utils/            # Funções utilitárias
│   └── config/           # Config ESLint, Tailwind, TSConfig
├── docker-compose.yml
├── package.json          # Workspace root (pnpm + turborepo)
└── turbo.json            # Turborepo config
```

### 5.2 Frontend Web — `apps/web/`

```
apps/web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Layout principal com sidebar
│   │   │   ├── page.tsx              # Home/Dashboard
│   │   │   ├── study/
│   │   │   │   ├── page.tsx          # Sessões de estudo
│   │   │   │   └── [sessionId]/
│   │   │   ├── forum/
│   │   │   │   ├── page.tsx          # Lista de posts
│   │   │   │   ├── new/page.tsx      # Criar post
│   │   │   │   └── [postId]/page.tsx # Post individual
│   │   │   ├── bank/
│   │   │   │   ├── page.tsx          # Banco de provas
│   │   │   │   ├── upload/page.tsx
│   │   │   │   └── [examId]/page.tsx # Prova + comentários
│   │   │   ├── chat/
│   │   │   │   ├── page.tsx          # Lista de conversas
│   │   │   │   └── [chatId]/page.tsx # Conversa
│   │   │   ├── ranking/
│   │   │   │   └── page.tsx
│   │   │   └── profile/
│   │   │       ├── page.tsx          # Perfil próprio
│   │   │       └── [userId]/page.tsx # Perfil de outro usuário
│   │   └── api/                      # API Routes (auth callbacks)
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/                   # Sidebar, Navbar, Footer
│   │   ├── study/                    # Timer, PomodoroWidget
│   │   ├── forum/                    # PostCard, ReplyForm
│   │   ├── bank/                     # ExamCard, UploadModal
│   │   ├── chat/                     # ChatWindow, MessageBubble
│   │   ├── ranking/                  # RankingTable, Podium
│   │   └── rpg/                      # XPBar, LevelBadge, AchievementCard
│   ├── hooks/
│   │   ├── useTimer.ts
│   │   ├── usePomodoro.ts
│   │   ├── useSocket.ts
│   │   └── useXP.ts
│   ├── stores/                       # Zustand stores
│   │   ├── authStore.ts
│   │   ├── studyStore.ts
│   │   └── chatStore.ts
│   ├── services/                     # Chamadas à API
│   │   ├── api.ts                    # Axios/fetch config base
│   │   ├── studyService.ts
│   │   ├── forumService.ts
│   │   ├── bankService.ts
│   │   └── rankingService.ts
│   ├── lib/
│   │   ├── xp.ts                     # Cálculos de XP e nível
│   │   └── formatters.ts
│   └── types/
├── public/
│   ├── icons/                        # Ícones de nível/conquistas
│   └── sounds/                       # Sons Pomodoro
├── next.config.js
├── tailwind.config.js
└── package.json
```

### 5.3 Backend — `apps/api/`

```
apps/api/
├── src/
│   ├── main.ts                       # Bootstrap NestJS
│   ├── app.module.ts
│   ├── modules/
│   │   ├── auth/                     # Autenticação JWT + OAuth
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/           # JWT, Google
│   │   │   └── guards/
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   └── users.service.ts
│   │   ├── study/
│   │   │   ├── study.module.ts
│   │   │   ├── study.controller.ts   # POST /study/sessions
│   │   │   ├── study.service.ts
│   │   │   └── dto/
│   │   ├── forum/
│   │   │   ├── forum.module.ts
│   │   │   ├── posts.controller.ts
│   │   │   ├── replies.controller.ts
│   │   │   └── forum.service.ts
│   │   ├── bank/
│   │   │   ├── bank.module.ts
│   │   │   ├── bank.controller.ts
│   │   │   └── bank.service.ts
│   │   ├── chat/
│   │   │   ├── chat.module.ts
│   │   │   ├── chat.gateway.ts       # Socket.IO Gateway
│   │   │   └── chat.service.ts
│   │   ├── friends/
│   │   ├── ranking/
│   │   │   ├── ranking.module.ts
│   │   │   ├── ranking.controller.ts
│   │   │   └── ranking.service.ts
│   │   ├── xp/
│   │   │   ├── xp.module.ts
│   │   │   ├── xp.service.ts         # Lógica central de XP
│   │   │   └── achievements.service.ts
│   │   ├── upload/
│   │   │   ├── upload.module.ts
│   │   │   └── upload.service.ts     # S3/R2
│   │   └── notifications/
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── common/
│       ├── decorators/
│       ├── filters/                  # Exception filters
│       ├── guards/
│       ├── interceptors/
│       └── pipes/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── Dockerfile
└── package.json
```

### 5.4 Mobile — `apps/mobile/`

```
apps/mobile/
├── app/                              # Expo Router
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Tab navigation
│   │   ├── index.tsx                 # Dashboard
│   │   ├── study.tsx
│   │   ├── forum.tsx
│   │   ├── bank.tsx
│   │   ├── chat.tsx
│   │   └── ranking.tsx
│   └── _layout.tsx
├── components/
├── hooks/
├── stores/
├── services/
├── app.json
└── package.json
```

---

## 6. Schema do Banco de Dados (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  username        String    @unique
  passwordHash    String?
  avatarUrl       String?
  xp              Int       @default(0)
  level           Int       @default(1)
  title           String    @default("Calouro")

  // Perfil acadêmico
  institutionId   String?
  institution     Institution? @relation(fields: [institutionId], references: [id])
  courseId        String?
  course          Course?      @relation(fields: [courseId], references: [id])
  semester        Int?         // período atual (1–12)
  shift           String?      // MORNING | AFTERNOON | NIGHT | FULL

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  sessions        StudySession[]
  posts           ForumPost[]
  replies         ForumReply[]
  sentMessages    ChatMessage[]
  friendsFrom     Friendship[]      @relation("friendsFrom")
  friendsTo       Friendship[]      @relation("friendsTo")
  achievements    UserAchievement[]
  uploads         BankItem[]
  xpHistory       XPTransaction[]
}

model Institution {
  id         String   @id @default(cuid())
  emecCode   String   @unique       // Código e-MEC
  name       String                 // Nome oficial
  shortName  String?                // Sigla (ex: USP, UFMG, PUC-Rio)
  type       String                 // FEDERAL | ESTADUAL | MUNICIPAL | PRIVADA
  state      String                 // UF (ex: SP, RJ, MG)
  city       String
  active     Boolean  @default(true)
  courses    Course[]
  users      User[]
}

model Course {
  id            String      @id @default(cuid())
  name          String                           // Nome canônico
  area          String                           // Grande área do conhecimento
  institutionId String
  institution   Institution @relation(fields: [institutionId], references: [id])
  users         User[]

  @@index([institutionId])
  @@index([area])
}

model StudySession {
  id         String   @id @default(cuid())
  userId     String
  subject    String
  topic      String?
  mode       String   // POMODORO | FREE
  duration   Int      // minutos
  xpGained   Int
  startedAt  DateTime
  endedAt    DateTime
  user       User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([subject])
}

model BankItem {
  id           String        @id @default(cuid())
  title        String
  type         String        // EXAM | EXERCISE | ANSWER
  subject      String
  professor    String?
  institution  String?
  course       String?
  period       String?       // ex: 2025.1
  fileUrl      String
  uploadedBy   String
  rating       Float         @default(0)
  ratingCount  Int           @default(0)
  createdAt    DateTime      @default(now())
  uploader     User          @relation(fields: [uploadedBy], references: [id])
  comments     BankComment[]

  @@index([subject])
  @@index([professor])
}

model BankComment {
  id         String   @id @default(cuid())
  bankItemId String
  authorId   String
  body       String
  fileUrl    String?
  upvotes    Int      @default(0)
  createdAt  DateTime @default(now())
  bankItem   BankItem @relation(fields: [bankItemId], references: [id])
}

model ForumPost {
  id        String       @id @default(cuid())
  title     String
  body      String
  subject   String
  tags      String[]
  fileUrl   String?
  authorId  String
  upvotes   Int          @default(0)
  solved    Boolean      @default(false)
  createdAt DateTime     @default(now())
  author    User         @relation(fields: [authorId], references: [id])
  replies   ForumReply[]

  @@index([subject])
  @@index([authorId])
}

model ForumReply {
  id         String    @id @default(cuid())
  postId     String
  authorId   String
  body       String
  fileUrl    String?
  upvotes    Int       @default(0)
  isAccepted Boolean   @default(false)
  createdAt  DateTime  @default(now())
  post       ForumPost @relation(fields: [postId], references: [id])
  author     User      @relation(fields: [authorId], references: [id])
}

model ChatMessage {
  id        String   @id @default(cuid())
  chatId    String
  senderId  String
  body      String?
  fileUrl   String?
  createdAt DateTime @default(now())
  sender    User     @relation(fields: [senderId], references: [id])

  @@index([chatId])
}

model Friendship {
  id         String   @id @default(cuid())
  fromId     String
  toId       String
  status     String   // PENDING | ACCEPTED | BLOCKED
  createdAt  DateTime @default(now())
  from       User     @relation("friendsFrom", fields: [fromId], references: [id])
  to         User     @relation("friendsTo", fields: [toId], references: [id])

  @@unique([fromId, toId])
}

model Achievement {
  id          String            @id @default(cuid())
  key         String            @unique
  name        String
  description String
  iconUrl     String?
  xpReward    Int               @default(0)
  users       UserAchievement[]
}

model UserAchievement {
  id            String      @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime    @default(now())
  user          User        @relation(fields: [userId], references: [id])
  achievement   Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
}

model XPTransaction {
  id        String   @id @default(cuid())
  userId    String
  amount    Int
  source    String   // SESSION | UPLOAD | REPLY | STREAK | ACHIEVEMENT
  refId     String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
}
```

---

## 7. Principais Endpoints da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/auth/register` | Cadastro — etapa 1 (conta básica) |
| `POST` | `/auth/register/academic` | Cadastro — etapa 2 (perfil acadêmico) |
| `POST` | `/auth/login` | Login com JWT |
| `POST` | `/auth/refresh` | Renovar access token |
| `GET` | `/auth/google` | Iniciar OAuth Google |
| `POST` | `/auth/logout` | Logout + invalidar refresh token |

### Instituições e Cursos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/institutions` | Listar instituições (busca por nome/estado) |
| `GET` | `/institutions/:id` | Dados de uma instituição |
| `GET` | `/institutions/:id/courses` | Cursos disponíveis na instituição |
| `GET` | `/courses` | Buscar cursos por nome ou área |

### Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/users/me` | Perfil do usuário logado |
| `PATCH` | `/users/me` | Atualizar perfil |
| `GET` | `/users/:id` | Perfil público de outro usuário |

### Sessões de Estudo

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/study/sessions` | Iniciar sessão de estudo |
| `PATCH` | `/study/sessions/:id/end` | Finalizar sessão + ganhar XP |
| `GET` | `/study/sessions` | Histórico de sessões do usuário |
| `GET` | `/study/stats` | Estatísticas por matéria |

### Fórum

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/forum/posts` | Criar post no fórum |
| `GET` | `/forum/posts` | Listar posts (filtros/busca) |
| `GET` | `/forum/posts/:id` | Post + respostas |
| `POST` | `/forum/posts/:id/replies` | Responder post |
| `PATCH` | `/forum/replies/:id/accept` | Marcar como solução |
| `POST` | `/forum/posts/:id/upvote` | Upvotar post |

### Banco de Provas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/bank/upload` | Upload de prova/lista |
| `GET` | `/bank` | Buscar no banco de provas |
| `GET` | `/bank/:id` | Prova + comentários |
| `POST` | `/bank/:id/comments` | Comentar/enviar resolução |
| `POST` | `/bank/:id/rate` | Avaliar material |

### Chat

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/chat` | Listar conversas |
| `POST` | `/chat` | Criar conversa ou grupo |
| `GET` | `/chat/:id/messages` | Histórico de mensagens |

> O envio de mensagens em tempo real ocorre via **Socket.IO** (evento `chat:message`).

### Rankings

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/ranking/global` | Ranking global (paginado) |
| `GET` | `/ranking/subject/:subject` | Ranking por matéria |
| `GET` | `/ranking/friends` | Ranking entre amigos |
| `GET` | `/ranking/me` | Posições do usuário logado |

### Amigos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/friends/request` | Enviar solicitação |
| `PATCH` | `/friends/:id/accept` | Aceitar amizade |
| `DELETE` | `/friends/:id` | Remover amigo |
| `GET` | `/friends` | Listar amigos |

---

## 8. Roadmap de Desenvolvimento

### Fase 1 — MVP (0–3 meses)
- [ ] Autenticação (cadastro 2 etapas, login, OAuth Google)
- [ ] ETL inicial dos dados do e-MEC → banco de instituições e cursos
- [ ] Seleção de instituição e curso no cadastro (etapa 2)
- [ ] Sessões de estudo com timer livre e Pomodoro
- [ ] Sistema de XP e níveis básico (níveis 1–7)
- [ ] Fórum simples (posts, respostas, upload de arquivo)
- [ ] Banco de provas (upload, busca, comentários)
- [ ] Ranking global e por matéria

### Fase 2 — Engajamento Social (3–6 meses)
- [ ] Sistema de amizades
- [ ] Chat 1:1 e grupos
- [ ] Conquistas e achievements
- [ ] Ranking de amigos
- [ ] Ranking por instituição, curso e estado
- [ ] Campo de período/semestre obrigatório no perfil
- [ ] Notificações push
- [ ] Perfis públicos com histórico de conquistas

### Fase 3 — Escala e Retenção (6–12 meses)
- [ ] App mobile (React Native / Expo)
- [ ] Streaks diários e metas semanais
- [ ] Integração com calendário acadêmico
- [ ] Modo multiplayer: "Estudar junto" em tempo real
- [ ] Dashboard analytics para o usuário
- [ ] Moderação de conteúdo e sistema de denúncias

---

## 9. Guia de Inicialização do Projeto

### 9.1 Pré-requisitos

- Node.js 20 LTS
- pnpm 9+
- Docker e Docker Compose
- Git

### 9.2 Comandos de Setup

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/studyquest.git
cd studyquest

# 2. Instalar dependências (monorepo com pnpm)
pnpm install

# 3. Subir PostgreSQL e Redis via Docker
docker-compose up -d

# 4. Configurar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 5. Rodar migrations do banco
cd apps/api && pnpm prisma migrate dev

# 6. Iniciar todos os apps em dev
cd ../.. && pnpm dev

# Web estará em:    http://localhost:3000
# API estará em:    http://localhost:3001
# Swagger docs:     http://localhost:3001/api
```

### 9.3 Variáveis de Ambiente — API (`apps/api/.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/studyquest
REDIS_URL=redis://localhost:6379

JWT_SECRET=seu_jwt_secret_aqui
JWT_REFRESH_SECRET=seu_refresh_secret_aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

R2_BUCKET_NAME=studyquest-files
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_PUBLIC_URL=https://pub-xxx.r2.dev

FRONTEND_URL=http://localhost:3000
```

### 9.4 Variáveis de Ambiente — Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXTAUTH_SECRET=seu_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 9.5 Docker Compose

```yaml
# docker-compose.yml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: studyquest
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## 10. Considerações de Segurança e Performance

### 10.1 Segurança

- Senhas com **bcrypt** (cost factor 12)
- JWT com expiração curta (15min) + Refresh Token (7 dias)
- Rate limiting por IP e por usuário (NestJS Throttler)
- Validação de uploads: tipo MIME + tamanho máximo (20MB)
- Sanitização de HTML no fórum (DOMPurify)
- CORS configurado por domínio permitido
- Headers de segurança via Helmet (NestJS)

### 10.2 Performance

- Rankings calculados via **cron job** e cacheados no Redis (TTL: 5min)
- Imagens e PDFs servidos via CDN (Cloudflare)
- Paginação em todos os endpoints de listagem (cursor-based)
- Índices no PostgreSQL: `userId`, `subject`, `createdAt`
- Lazy loading de componentes pesados no frontend
- Otimistic updates no frontend (TanStack Query)

### 10.3 Escalabilidade Futura

- Separar o serviço de XP em microserviço independente
- Adicionar réplica de leitura no PostgreSQL para queries de ranking
- Implementar Elasticsearch para busca full-text no banco de provas e fórum
- CDN para assets estáticos e uploads

---

*StudyQuest RPG — PRD v1.0 • 2025 • Confidencial*
