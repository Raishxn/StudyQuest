# ⚔️ StudyQuest RPG

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![Turbo](https://img.shields.io/badge/Monorepo-Turborepo-ef4444)
![Next.js](https://img.shields.io/badge/Web-Next.js_14-black?logo=next.js)
![Expo](https://img.shields.io/badge/Mobile-Expo_51-white?logo=expo&logoColor=black)
![NestJS](https://img.shields.io/badge/API-NestJS_10-red?logo=nestjs)
![Prisma](https://img.shields.io/badge/ORM-Prisma_5-blue?logo=prisma)

> **Plataforma de Estudos Gamificada para Ensino Superior**
> O StudyQuest RPG transforma sua rotina de estudos acadêmicos em uma jornada épica. Ganhe XP, suba de nível, conquiste títulos e dispute rankings enquanto aprende de verdade!

---

## 📖 Ideia do Projeto (Visão Geral)
A vida acadêmica pode ser densa e carente de disciplina constante. Apps genéricos não atendem especificidades do ensino superior e dificilmente promovem engajamento no longo prazo.

O **StudyQuest RPG** é uma plataforma que une ferramentas reais de produtividade acadêmica com mecânicas de jogos RPG.
Ao estudar por Pomodoro, enviar provas antigas, ou ajudar colegas no fórum, o aluno ganha pontos de Experiência (XP). Isso destrava novos níveis, insígnias, títulos e o coloca na disputa de rankings globais, por curso e por instituição.

### 🌟 Funcionalidades Principais
- **Mecânicas RPG**: Sistema de níveis, recompensas (XP), conquistas e títulos.
- **Temporizador Inteligente**: Sessões avulsas ou Pomodoro que registram XP de acordo com o tempo real de foco na matéria.
- **Banco de Provas**: Repositório colaborativo estruturado por Instituição, Curso, Disciplina e Professor.
- **Fórum de Dúvidas**: Área interativa para resoluções de questões e networking.
- **Interações Sociais**: Chat direto com amigos, grupos de estudos em tempo real e rankings competitivos.

---

## 🛠️ Tecnologias Utilizadas (Stack)

O projeto está estruturado em um **Monorepo** utilizando o **Turborepo** gerenciado pelo **pnpm (v9+)**.

### 🎨 Frontend Web (`apps/web`)
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Requisições/Cache**: TanStack Query v5 + Axios
- **Outros**: React Hook Form, Zod, Framer Motion, Socket.IO Client, Recharts, React PDF

### 📱 Frontend Mobile (`apps/mobile`)
- **Framework**: React Native com Expo SDK 51
- **Roteamento**: Expo Router
- **Estilização**: NativeWind
- **State Management**: Zustand compartilhando lógica

### ⚙️ Backend API (`apps/api`)
- **Framework**: NestJS 10 (Node.js 20)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL 16
- **ORM**: Prisma 5
- **Cache & Filas**: Redis 7 + BullMQ
- **Uploads de Arquivos**: Cloudflare R2 / AWS S3 SDK
- **Websockets**: Socket.IO
- **Segurança & Autenticação**: Autenticação JWT completa + Passport + OAuth Google

---

## 🏗️ Estrutura do Monorepo

```bash
studyquest/
├── apps/
│   ├── web/        # Plataforma Frontend Web
│   ├── mobile/     # Plataforma Mobile (iOS & Android)
│   └── api/        # Backend REST API + Websockets
├── packages/
│   ├── ui/         # Componentes React compartilhados (shadcn)
│   ├── types/      # Tipagens TypeScript base
│   ├── utils/      # Funções utilitárias comuns
│   └── config/     # Configurações globais (Tailwind, ESLint, TSConfig)
├── .github/        # Workflows do CI/CD de deploy automatizado
├── package.json
└── turbo.json
```

---

## 🚀 Como Rodar o Projeto

Verifique as diretrizes recomendadas no arquivo [CONTRIBUTING.md](./CONTRIBUTING.md).

1. Clone o repositório.
2. Na raiz do projeto, instale os pacotes e dependências em lock:
   ```bash
   pnpm install
   ```
3. Crie os arquivos de ambiente `.env` baseado nos templates `.env.example`.
4. Faça o setup inicial da infraestrutura de dados (Postgres e Redis):
   ```bash
   docker-compose up -d
   ```
5. Inicie o projeto e divirta-se subindo os workspaces em série:
   ```bash
   pnpm dev
   ```

---

## 🛣️ Roadmap & Status Atual (O que faremos no futuro)

### Fase 1: Fundação & Autenticação (Setup Inicial)
- [x] Definição de regras de Negócio, PRD e Userflows
- [x] Initial Monorepo Setup (Turborepo + pnpm)
- [x] Criação da Action CI/CD GitHub e scaffolding dos apps (`api`, `web`, `mobile`)
- [ ] Construir arquitetura base do DB no Prisma (Schema completo)
- [ ] Implementar sistema de login básico (JWT)
- [ ] Criar sincronização inicial das IES (Instituições)

### Fase 2: Mecânicas de Jogo e UI Core
- [ ] Layout base App Web (temas customizados e dark/light modes implementados centralmente)
- [ ] Lógicas globais e Contextos de Estado do Usuário (Nível, XP, Título)
- [ ] Telas de controle do usuário, menu de configurações e profile dashboard
- [ ] Sistema de Cronômetro (Sessão normal e sistema Pomodoro) capturando o rendimento

### Fase 3: Networking e Colaboração Acadêmica
- [ ] Estruturação das regras de upload com cloud/S3 de Arquivos e Provas
- [ ] Telas de Navegação no Banco de Provas Colaborativo
- [ ] Fórum interativo, englobando envio de dúvidas de arquivos com respostas análogas ao StackOverflow
- [ ] Ranking UI, pontuação social, adicionar Amigos (Envio de Friend Requests)

### Fase 4: Lapidação Mobile e Real Time
- [ ] Refatoração das Views Web para as telas Native do Mobile App
- [ ] Implementação de Websockets Socket.io (Chat em Real-Time na DM de amigos)
- [ ] Push Notifications para encorajamentos e fins de ciclo de Pomodoro
- [ ] Correções, polimentos, homologação V1 Beta e Deploy em Produção

---

<p align="center">
  Desenvolvido com 💜 por um gamer que ama estudar. Que comecem os jogos acadêmicos!
</p>
