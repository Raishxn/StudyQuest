# Contributing to StudyQuest RPG

## Pré-requisitos
- Node.js (v18+)
- pnpm (v9+)
- Docker e Docker Compose

## Setup local
1. Clone o repositório
2. Rode `pnpm install`
3. Copie `.env.example` para `.env`
4. Suba o banco de dados e o redis: `docker-compose up -d`
5. Em `apps/api`, rode `npx prisma db push` (ou pull/migrate) para preparar o banco
6. Rode o projeto: `pnpm dev`

## Convenção de Branches
Use os prefixos padrão:
- `feat/`: Novas funcionalidades
- `fix/`: Correções de bugs
- `chore/`: Alterações de base, tooling, dependências
- `docs/`: Documentação
- `refactor/`: Refatorações de código

## Conventional Commits
Use os seguintes escopos:
- `(auth)`: Autenticação
- `(xp)`: Sistema de experiência e progressão
- `(forum)`: Fórum e discussões
- `(bank)`: Sistema de moedas/economia
- `(chat)`: Comunicação em tempo real
- `(ranking)`: Sistema de classificação/leaderboard

Exemplo: `feat(auth): adiciona login com Google`

## Regras de PR
- **CI obrigatório**: Todos os checks do GitHub Actions devem passar (lint, type-check, test, build).
- **Testes**: Obrigatório incluir testes para nova lógica de negócio.
- **Console.log**: Não encorage `console.log` em código final. Use sistema de logs configurado ou remova.
