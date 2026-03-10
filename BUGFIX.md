# Bug Fixes — 10/03/2026

## BUG 1 — Login com e-mail/senha retornava 500

**Causa raiz:**
1. `LoginDto` usava `@IsEmail()`, rejeitando login com username (400 do ValidationPipe).
2. `LoginThrottleGuard` criava conexão Redis raw no construtor — se Redis indisponível, lançava erro não tratado (500).
3. `HttpExceptionFilter` só capturava `HttpException`, deixando erros de Redis/Prisma vazarem como 500 puro.

**Correção:**
- `login.dto.ts` — Removido `@IsEmail()`, campo renomeado para `emailOrUsername` com `@IsString()` + `@MinLength(3)`.
- `auth.service.ts` — `login()` agora resolve usuário por email (se contém `@`) ou username.
- `authStore.ts` (frontend) — Payload do login alterado de `{ email }` para `{ emailOrUsername }`.
- `login-throttle.guard.ts` — Conexão Redis com `lazyConnect`, `connectTimeout: 3000ms`, e fail-open em caso de erro.
- `http-exception.filter.ts` — `@Catch()` agora captura TODOS os erros; erros não-HTTP retornam 500 genérico com log interno.

---

## BUG 2 — Login com Google retornava 500

**Causa raiz:**
1. `GoogleStrategy` passava `'missing_google_id'` ao Google OAuth quando env vars ausentes — causava erro criptográfico.
2. `findOrCreateGoogleUser` usava `findUnique` + `create` separados — se email já existia (cadastrado via e-mail/senha), violava constraint unique.

**Correção:**
- `google.strategy.ts` — Validação de env vars no construtor; se ausentes, loga erro claro e usa placeholder (app não crasha, mas OAuth não funciona).
- `auth.service.ts` — `findOrCreateGoogleUser` agora usa `prisma.user.upsert()` para criar ou atualizar o usuário atomicamente.

---

## BUG 3 — Cadastro ficava carregando infinitamente ao buscar faculdades

**Causa raiz:**
- `RegisterForm.tsx` linha 7: fallback do `API_URL` era `http://localhost:3000` (porta do **frontend**) ao invés de `http://localhost:3001` (porta da **API**). O fetch batia no Next.js, recebia HTML, `res.json()` falhava, e o spinner nunca parava.

**Correção:**
- `RegisterForm.tsx` — Fallback corrigido para `http://localhost:3001`.
- Adicionado `isError` + botão "Tentar novamente" no dropdown de instituições.
- Adicionado `retry: 2` ao `useQuery` para tentativas automáticas.
