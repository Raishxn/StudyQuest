# 🔒 StudyQuest RPG — Documento de Segurança
## Autenticação, Autorização e Proteção de Dados (LGPD)

**Versão 1.0 • 2025**

---

## Sumário

1. [Autenticação](#1-autenticação)
2. [Autorização e Controle de Acesso](#2-autorização-e-controle-de-acesso)
3. [Proteção de Dados em Trânsito e em Repouso](#3-proteção-de-dados-em-trânsito-e-em-repouso)
4. [Upload e Armazenamento de Arquivos](#4-upload-e-armazenamento-de-arquivos)
5. [Proteção contra Ataques Comuns](#5-proteção-contra-ataques-comuns)
6. [LGPD — Lei Geral de Proteção de Dados](#6-lgpd--lei-geral-de-proteção-de-dados)
7. [Auditoria e Logs](#7-auditoria-e-logs)
8. [Plano de Resposta a Incidentes](#8-plano-de-resposta-a-incidentes)
9. [Checklist de Segurança por Release](#9-checklist-de-segurança-por-release)

---

## 1. Autenticação

### 1.1 Cadastro com E-mail e Senha

**Senha:**
- Comprimento mínimo: **8 caracteres**.
- Deve conter ao menos: 1 letra maiúscula, 1 minúscula, 1 número.
- Hash com **bcrypt**, cost factor **12** (aprox. 300ms por hash — equilíbrio entre segurança e UX).
- A senha em texto plano **jamais é logada, armazenada em cache ou enviada por e-mail**.
- Em nenhum endpoint a senha é retornada — nem em formato hash.

**Verificação de e-mail:**
- Ao cadastrar, um token de verificação é gerado (UUID v4), armazenado com TTL de **24 horas**.
- O e-mail só é considerado verificado após o usuário clicar no link.
- Contas não verificadas em 24h são marcadas como `UNVERIFIED` e podem ser limpas por cron job após 7 dias.
- Usuários não verificados podem usar o app com limitações: sem upload no banco, sem posts no fórum.

**Reenvio de e-mail de verificação:**
- Rate limit: máximo **3 reenvios por hora** por e-mail.

### 1.2 Login

- Endpoint: `POST /auth/login` com `{ email, password }`.
- Em caso de e-mail ou senha inválidos, a resposta é **sempre a mesma mensagem genérica**: `"E-mail ou senha inválidos"`. Jamais indicar qual dos dois está errado (previne enumeração de usuários).
- **Rate limit de login:** 5 tentativas falhas por IP em 15 minutos → bloqueio temporário de 15 minutos.
- **Rate limit por conta:** 10 tentativas falhas na mesma conta em 1 hora → conta bloqueada temporariamente por 30 minutos + e-mail de aviso ao usuário.

### 1.3 JWT (JSON Web Tokens)

```
Access Token:
  - Expiração: 15 minutos
  - Payload: { sub: userId, role: 'user'|'moderator'|'admin', iat, exp }
  - Algoritmo: RS256 (assimétrico — chave pública pode ser distribuída)

Refresh Token:
  - Expiração: 7 dias
  - Armazenado: banco de dados (tabela refresh_tokens) + cookie HttpOnly
  - Rotação: a cada uso, o refresh token antigo é invalidado e um novo é emitido
  - Se refresh token inválido/expirado: usuário redirecionado para login
```

**Blacklist de tokens:**
- Ao fazer logout, o refresh token é deletado do banco.
- Access tokens expiram naturalmente (15 min) — não há blacklist de access tokens por performance.
- Em caso de comprometimento de conta (relatado pelo usuário), todos os refresh tokens do usuário são deletados imediatamente.

### 1.4 OAuth com Google

- Implementado com Passport.js (estratégia `passport-google-oauth20`).
- O `access_token` do Google **não é armazenado** — apenas o `googleId` e e-mail são salvos.
- Se o e-mail do Google já existe no banco (cadastro local), as contas são **vinculadas automaticamente**.
- Escopo solicitado ao Google: apenas `email` e `profile` — nunca permissões além do necessário.

### 1.5 Troca de Senha

- Fluxo "Esqueci minha senha":
  1. Usuário informa e-mail.
  2. Se o e-mail existe, um token de reset (SHA-256, 32 bytes aleatórios) é gerado com TTL de **1 hora**.
  3. Resposta ao usuário é **sempre a mesma**, independente de o e-mail existir ou não (previne enumeração).
  4. Link de reset enviado por e-mail aponta para `/auth/reset-password?token=XXX`.
  5. Token é de **uso único** — invalidado imediatamente após uso.
- Após trocar a senha, **todos os refresh tokens do usuário são invalidados** (sessions logout forçado).

### 1.6 Autenticação em Dois Fatores (2FA) — Fase 2

- TOTP (Google Authenticator / Authy) via biblioteca `otplib`.
- Opcional para todos os usuários, obrigatório para moderadores e admins.
- Códigos de backup: 8 códigos gerados no setup, exibidos uma única vez.

---

## 2. Autorização e Controle de Acesso

### 2.1 Roles de Usuário

| Role | Descrição |
|------|-----------|
| `user` | Usuário padrão — acesso às funcionalidades do app |
| `moderator` | Pode remover conteúdo, banir usuários temporariamente, aprovar uploads sinalizados |
| `admin` | Acesso total, incluindo painel administrativo, gestão de moderadores, dados agregados |

### 2.2 Matriz de Permissões

| Ação | user | moderator | admin |
|------|------|-----------|-------|
| Ver próprio perfil | ✅ | ✅ | ✅ |
| Editar próprio perfil | ✅ | ✅ | ✅ |
| Ver perfil público de outros | ✅ | ✅ | ✅ |
| Criar sessão de estudo | ✅ | ✅ | ✅ |
| Postar no fórum | ✅ | ✅ | ✅ |
| Upload no banco | ✅ | ✅ | ✅ |
| Denunciar conteúdo | ✅ | ✅ | ✅ |
| Remover post/upload de outros | ❌ | ✅ | ✅ |
| Banir usuário | ❌ | Temporário (até 7 dias) | Permanente |
| Ver dados de todos os usuários | ❌ | ❌ | ✅ |
| Promover a moderador | ❌ | ❌ | ✅ |
| Acessar painel admin | ❌ | ❌ | ✅ |

### 2.3 Implementação no NestJS

```typescript
// Guard de autenticação em todas as rotas protegidas
@UseGuards(JwtAuthGuard)

// Guard de role para rotas específicas
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('moderator', 'admin')

// Decorator para capturar o usuário autenticado
@CurrentUser() user: UserPayload
```

### 2.4 Regras de Ownership

- Um usuário só pode editar/deletar seus próprios recursos (posts, respostas, uploads, sessões).
- A validação de ownership é feita no **service layer**, não apenas no guard.
- Exemplo: `PATCH /forum/posts/:id` verifica se `post.authorId === currentUser.id` antes de prosseguir.
- Moderadores e admins passam por guards de role mas ainda têm a verificação de ownership bypassada explicitamente (não silenciosamente).

---

## 3. Proteção de Dados em Trânsito e em Repouso

### 3.1 Em Trânsito (HTTPS)

- **Todo tráfego via HTTPS/TLS 1.2+**. Redirecionar HTTP → HTTPS em nível de infraestrutura (Vercel e Railway fazem isso automaticamente).
- Certificados SSL gerenciados automaticamente (Let's Encrypt via plataformas de hospedagem).
- Headers de segurança via **Helmet.js** (NestJS):

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "https://*.r2.dev"],
      connectSrc: ["'self'", "wss://api.studyquest.com.br"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' }, // Previne clickjacking
}))
```

### 3.2 Em Repouso (Banco de Dados)

- Senhas: **bcrypt** (nunca texto plano, nunca MD5/SHA1).
- Tokens de verificação e reset: armazenados como **SHA-256 do token original** — o token em texto plano existe apenas no e-mail enviado.
- Dados sensíveis (e-mail) não são expostos em logs.
- Backups do PostgreSQL: encriptados em repouso (Railway/Render fazem isso automaticamente via AES-256).

### 3.3 Variáveis de Ambiente

- **Nenhum segredo no código-fonte** — todas as credenciais via variáveis de ambiente.
- `.env` no `.gitignore` — jamais commitado.
- Em produção: segredos gerenciados via Railway Variables ou AWS Secrets Manager.
- Rotação periódica de segredos: a cada **90 dias** para JWT secrets; imediata em caso de suspeita de comprometimento.

---

## 4. Upload e Armazenamento de Arquivos

### 4.1 Validação de Upload

- **Validação de tipo MIME** no backend (não confiar no Content-Type do cliente):
  ```typescript
  import * as fileType from 'file-type'
  const { mime } = await fileType.fromBuffer(buffer)
  if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(mime)) {
    throw new BadRequestException('Tipo de arquivo não permitido')
  }
  ```
- **Tamanho máximo:** 20MB por arquivo. Rejeitar antes de processar com `multer({ limits: { fileSize: 20 * 1024 * 1024 } })`.
- **Varredura de malware:** integrar ClamAV ou VirusTotal API para PDFs em produção (Fase 2).

### 4.2 Armazenamento no Cloudflare R2

- Arquivos enviados com **ACL privada** — acesso apenas via URLs pré-assinadas.
- URLs pré-assinadas expiram em **1 hora**. Ao exibir um PDF/imagem, o frontend solicita uma URL fresca ao backend.
- O nome do arquivo armazenado é o **UUID do registro** (não o nome original do arquivo) — evita path traversal e colisões.
- Estrutura de pastas no bucket:
  ```
  /bank/{uuid}.pdf
  /forum-attachments/{uuid}.jpg
  /avatars/{userId}.webp
  ```

### 4.3 Geração de URLs Pré-Assinadas

```typescript
// src/modules/upload/upload.service.ts
async getSignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  })
  return getSignedUrl(this.s3Client, command, { expiresIn: 3600 })
}
```

---

## 5. Proteção contra Ataques Comuns

### 5.1 Rate Limiting

Implementado com **@nestjs/throttler** + Redis como store:

```typescript
// Limites globais
ThrottlerModule.forRoot({
  ttl: 60,    // janela de 60 segundos
  limit: 100, // máximo 100 requisições por IP por minuto
})

// Limites específicos por endpoint (sobrescrevem o global)
@Throttle(5, 900)  // 5 tentativas em 15 min (login)
@Post('login')

@Throttle(10, 3600) // 10 uploads por hora
@Post('bank/upload')
```

### 5.2 Injeção SQL

- **Prisma ORM** usa queries parametrizadas por padrão — imune a SQL injection em queries normais.
- Queries com `$queryRaw` (se necessárias) usam template literals seguros do Prisma.
- Nunca concatenar strings do usuário em queries SQL.

### 5.3 XSS (Cross-Site Scripting)

- Conteúdo de posts e comentários é **sanitizado** antes de salvar no banco:
  ```typescript
  import DOMPurify from 'isomorphic-dompurify'
  const clean = DOMPurify.sanitize(userInput, { ALLOWED_TAGS: ['b', 'i', 'code', 'pre'] })
  ```
- No frontend, Next.js escapa HTML por padrão em JSX — nunca usar `dangerouslySetInnerHTML` com conteúdo do usuário.

### 5.4 CSRF (Cross-Site Request Forgery)

- API é **stateless com JWT** — não usa cookies de sessão, portanto CSRF não se aplica às rotas de API.
- O refresh token é em cookie `HttpOnly; SameSite=Strict` — protegido contra CSRF por `SameSite`.
- Endpoint de refresh: verifica o cookie + valida o token no banco.

### 5.5 Enumeração de Usuários

- Login: mesma mensagem de erro para e-mail inexistente e senha errada.
- Recuperação de senha: mesma mensagem independente de o e-mail existir.
- Busca de usuários: retorna apenas perfis públicos; não confirma existência de e-mails via API.

### 5.6 CORS

```typescript
app.enableCors({
  origin: [
    'https://studyquest.com.br',
    'https://www.studyquest.com.br',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
})
```

### 5.7 Websocket (Socket.IO)

- Autenticação no handshake: o cliente envia o access token JWT no header de conexão.
- Conexões sem token válido são recusadas imediatamente.
- Rate limit de mensagens no chat: máximo **30 mensagens por minuto** por conexão.

---

## 6. LGPD — Lei Geral de Proteção de Dados

### 6.1 Dados Coletados e Finalidade

| Dado | Finalidade | Base Legal (LGPD) |
|------|-----------|-------------------|
| Nome e e-mail | Identificação e comunicação | Execução de contrato (Art. 7º, V) |
| Senha (hash) | Autenticação | Execução de contrato |
| Instituição e curso | Personalização e rankings | Legítimo interesse + consentimento |
| Sessões de estudo | Cálculo de XP e rankings | Execução de contrato |
| Endereço IP (logs) | Segurança e anti-fraude | Legítimo interesse (Art. 7º, IX) |
| Fuso horário | Cálculo correto de streaks | Execução de contrato |
| Conteúdo de posts/uploads | Funcionalidade da plataforma | Execução de contrato |

### 6.2 Direitos dos Titulares (Art. 18 LGPD)

Os usuários têm direito a:

| Direito | Como exercer | Prazo de resposta |
|---------|-------------|-------------------|
| Acesso aos dados | `GET /users/me/data-export` | 15 dias |
| Correção | Edição no perfil / suporte | Imediato / 5 dias |
| Eliminação | `DELETE /users/me` ou suporte | 30 dias |
| Portabilidade | `GET /users/me/data-export` (JSON) | 15 dias |
| Revogação de consentimento | Configurações → Privacidade | Imediato |
| Informação sobre compartilhamento | Política de Privacidade pública | — |

### 6.3 Exportação de Dados (Data Export)

O endpoint `GET /users/me/data-export` gera um arquivo JSON com todos os dados do usuário:

```json
{
  "profile": { "name", "email", "username", "createdAt", ... },
  "academicProfile": { "institution", "course", "semester" },
  "studySessions": [ { "subject", "duration", "startedAt", ... } ],
  "forumPosts": [ ... ],
  "bankUploads": [ ... ],
  "xpHistory": [ ... ],
  "achievements": [ ... ],
  "preferences": { "theme", "notifications", ... }
}
```

O arquivo é gerado assincronamente (via fila) e enviado por e-mail ao usuário em até 15 minutos.

### 6.4 Exclusão de Conta

Ao solicitar exclusão (`DELETE /users/me`):

1. Conta é marcada como `DELETION_REQUESTED` imediatamente.
2. Período de carência: **7 dias** (o usuário pode cancelar a solicitação).
3. Após 7 dias, processo de exclusão:
   - Dados pessoais identificáveis removidos (nome, e-mail, avatar).
   - Conteúdo público (posts, uploads, comentários) passa para autoria `[usuário deletado]` — preserva a integridade do conteúdo colaborativo.
   - Sessões de estudo, XP e conquistas são deletados.
   - Registro anonimizado mantido para estatísticas agregadas (sem identificação).

### 6.5 Cookies e Consentimento

Cookies utilizados:

| Cookie | Tipo | Finalidade | TTL |
|--------|------|-----------|-----|
| `refresh_token` | HttpOnly, Secure, SameSite=Strict | Autenticação | 7 dias |
| `sq-theme` | Normal | Preferência de tema | 1 ano |
| Analytics (futuro) | Requer consentimento | Métricas de uso | 1 ano |

- Banner de consentimento de cookies no primeiro acesso (para cookies não essenciais).
- Consentimento registrado com timestamp e versão da política.

### 6.6 Retenção de Dados

| Tipo de dado | Retenção |
|-------------|---------|
| Dados de conta ativa | Enquanto a conta existir |
| Logs de acesso (IP) | 90 dias |
| Tokens de sessão (refresh) | 7 dias ou até logout |
| Tokens de verificação/reset | 24h / 1h após uso |
| Dados de conta deletada (anonimizados) | 5 anos (obrigação legal) |
| Backups | 30 dias após rotação |

### 6.7 DPO e Contato

- Indicar um **DPO (Data Protection Officer)** ou ponto de contato: `privacidade@studyquest.com.br`.
- A Política de Privacidade e os Termos de Uso devem ser aceitos explicitamente no cadastro (checkbox separado, não agrupado).
- Versões da política devem ser versionadas e o histórico mantido.

---

## 7. Auditoria e Logs

### 7.1 O Que Deve Ser Logado

```
✅ Logar:
  - Tentativas de login (sucesso e falha) com IP e timestamp
  - Criação e exclusão de conta
  - Troca de senha e e-mail
  - Ações de moderação (quem removeu o quê)
  - Uploads de arquivos (hash, tamanho, tipo)
  - Erros de autenticação e autorização (401, 403)
  - Uso de endpoints de exportação e exclusão de dados

❌ Nunca logar:
  - Senhas (mesmo em hash)
  - Tokens JWT completos
  - Conteúdo de mensagens de chat
  - Dados pessoais sensíveis em texto plano
```

### 7.2 Estrutura de Log

```typescript
// Formato estruturado JSON para facilitar indexação
{
  "timestamp": "2025-03-01T14:22:00Z",
  "level": "warn",
  "event": "auth.login.failed",
  "userId": null,
  "ip": "192.168.1.1",
  "email": "***@gmail.com", // parcialmente mascarado
  "reason": "invalid_password",
  "attemptCount": 3
}
```

### 7.3 Monitoramento

- **Sentry:** captura de erros em tempo real (frontend e backend).
- **Uptime Kuma:** monitoramento de disponibilidade dos endpoints críticos.
- Alertas automáticos para:
  - Taxa de erros 5xx acima de 1% em 5 minutos.
  - Mais de 50 tentativas de login falhas por minuto (possível ataque).
  - Uso de CPU/memória acima de 85%.

---

## 8. Plano de Resposta a Incidentes

### 8.1 Classificação de Incidentes

| Nível | Descrição | Exemplos | Tempo de resposta |
|-------|-----------|---------|-------------------|
| P1 — Crítico | Comprometimento de dados ou indisponibilidade total | Vazamento de senhas, banco de dados exposto | < 1h |
| P2 — Alto | Funcionalidade crítica comprometida | Login fora do ar, uploads bloqueados | < 4h |
| P3 — Médio | Funcionalidade parcial afetada | Rankings desatualizados, notificações atrasadas | < 24h |
| P4 — Baixo | Bug minor sem impacto de segurança | UI quebrada em navegador específico | < 72h |

### 8.2 Procedimento para Vazamento de Dados (P1)

1. **Detecção** → alertas automáticos ou report de usuário.
2. **Contenção imediata:** revogar todos os refresh tokens ativos (`DELETE FROM refresh_tokens`), forçar logout global.
3. **Avaliação:** identificar quais dados foram expostos e quantos usuários afetados.
4. **Notificação à ANPD:** obrigatório em até **72 horas** após a ciência do incidente (Art. 48 LGPD).
5. **Notificação aos usuários afetados:** e-mail com descrição do ocorrido, dados afetados e medidas tomadas.
6. **Remediação:** corrigir a vulnerabilidade, auditar código relacionado.
7. **Post-mortem:** documento interno com linha do tempo, causa raiz e ações preventivas.

---

## 9. Checklist de Segurança por Release

Antes de cada deploy em produção, verificar:

### Código
- [ ] Nenhum segredo hardcoded (usar `grep -r "password\|secret\|token" --include="*.ts"`)
- [ ] Dependências atualizadas (`npm audit` sem vulnerabilidades críticas)
- [ ] Todos os inputs validados com Zod/class-validator
- [ ] Sanitização de HTML em todos os campos de texto livre
- [ ] Rate limiting aplicado em endpoints sensíveis

### Autenticação
- [ ] JWT secrets diferentes para access e refresh token
- [ ] Refresh token rotacionado a cada uso
- [ ] Refresh token em cookie HttpOnly, não no body
- [ ] Logout invalida o refresh token no banco

### Dados
- [ ] `.env` não commitado no repositório
- [ ] Migrations revisadas (sem colunas sensíveis sem proteção)
- [ ] Logs não expõem dados pessoais

### Infraestrutura
- [ ] HTTPS habilitado e funcionando
- [ ] Headers de segurança (Helmet) ativos
- [ ] CORS restrito aos domínios corretos
- [ ] Backups automáticos do banco funcionando

### LGPD
- [ ] Política de Privacidade atualizada se houve mudança no tratamento de dados
- [ ] Endpoint de exportação de dados funcionando
- [ ] Endpoint de exclusão de conta funcionando

---

*StudyQuest RPG — Documento de Segurança v1.0 • 2025 • Confidencial*
