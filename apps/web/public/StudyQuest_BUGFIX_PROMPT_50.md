# ⚔️ StudyQuest RPG — Prompt 50: Bugfix Geral + Badges + Missões
## Correção de 11 problemas reportados + melhorias de UX

---

# ════════════════════════════════════════════
# PROMPT 50 — BUGFIX GERAL + BADGES + MISSÕES
# ════════════════════════════════════════════

```
Use @nextjs-expert, @nestjs-expert, @prisma-expert e @react-patterns
para corrigir todos os problemas listados abaixo no StudyQuest RPG.

Repositório: https://github.com/Raishxn/StudyQuest

Leia ANTES de alterar qualquer arquivo:
- apps/api/src/modules/friends/ (bug de busca)
- apps/api/src/modules/ranking/ (bug de posição inconsistente)
- apps/api/src/modules/missions/ (bug de missões concluídas incorretamente)
- apps/web/src/app/(dashboard)/perfil/ (bug de crash)
- apps/web/src/app/(dashboard)/ranking/ (bug de crash nas abas)
- apps/web/src/components/ (logo e badges)
- apps/api/prisma/schema.prisma (para missões e meta semanal)

---

## BUG 1 — Busca de amigos: loading infinito

SINTOMA: Ao buscar pelo nome do usuário na aba de amigos, a busca fica
carregando infinitamente e nunca retorna resultados.

INVESTIGAR E CORRIGIR:

1. No endpoint GET /friends/search?q={query}:
   - Verificar se o endpoint existe e está registrado no FriendsController
   - Verificar se o guard JwtAuthGuard está aplicado corretamente
   - Verificar se a query Prisma está usando o campo correto (username vs name)
   - Adicionar índice no campo username se não existir:
     @@index([username]) no model User
   - Garantir que a busca usa: where: { username: { contains: query, mode: 'insensitive' } }
   - Adicionar limit padrão de 20 resultados
   - Excluir o próprio usuário dos resultados: where: { id: { not: userId } }
   - Excluir usuários já amigos dos resultados
   - Adicionar timeout de 5s na query (evitar hang)

2. No frontend (componente de busca de amigos):
   - Verificar se o debounce está funcionando (deve ser 300ms)
   - Verificar se a URL da query está correta (sem typo no endpoint)
   - Adicionar tratamento de erro: se a requisição falhar, mostrar
     "Erro ao buscar usuários. Tente novamente." em vez de loading eterno
   - Adicionar estado de "nenhum resultado encontrado" quando array vazio
   - Garantir que o estado de loading é resetado no finally do try/catch

---

## BUG 2 — Logo extremamente pequeno no header

SINTOMA: A logo no canto superior esquerdo está aparecendo muito pequena.

CORRIGIR em apps/web/src/components/layout/Sidebar.tsx (ou onde a logo está):

- Localizar o componente de logo no header/sidebar
- Verificar as dimensões atuais do next/image ou da tag img
- Corrigir para:
  - Logo horizontal (ícone + texto): width={160} height={40}
  - Apenas ícone (mobile/sidebar recolhida): width={36} height={36}
- Garantir que o container pai não tem overflow: hidden cortando a imagem
- Verificar se não há max-width ou transform: scale() reduzindo o tamanho
- Se a logo for SVG inline, verificar width e height do elemento SVG

---

## BUG 3 — Crash na página de edição de perfil

SINTOMA: Ao entrar na aba de perfil e clicar em "Editar perfil", ocorre:
"Application error: a client-side exception has occurred"

INVESTIGAR E CORRIGIR:

1. Abrir apps/web/src/app/(dashboard)/perfil/page.tsx (ou /profile/page.tsx)
2. Identificar a causa do crash:
   - Provavelmente: acesso a propriedade de objeto undefined/null
     (ex: user.institution.name quando institution é null)
   - Ou: hook chamado condicionalmente (violação das rules of hooks)
   - Ou: componente tentando renderizar antes dos dados carregarem

3. Aplicar optional chaining em TODOS os acessos de dados do usuário:
   user?.institution?.name ?? 'Não informado'
   user?.course ?? 'Não informado'
   user?.avatar ?? '/avatars/default-1.png'

4. Adicionar error boundary na página:
   Criar apps/web/src/app/(dashboard)/perfil/error.tsx:
   'use client'
   export default function ProfileError({ error, reset }) {
     return (
       <div>
         <h2>Erro ao carregar perfil</h2>
         <p>{error.message}</p>
         <button onClick={reset}>Tentar novamente</button>
       </div>
     )
   }

5. No formulário de edição de perfil:
   - Garantir que todos os campos têm valor default no useForm:
     defaultValues: {
       username: user?.username ?? '',
       bio: user?.bio ?? '',
       institution: user?.institutionId ?? '',
       course: user?.course ?? '',
     }
   - Adicionar loading state enquanto os dados do usuário não chegaram:
     if (!user) return <SkeletonProfile />

---

## BUG 4 — Missões da semana aparecem como concluídas incorretamente

SINTOMA: No dashboard, a missão "Completar 5 Pomodoros" aparece como
concluída mesmo sem ter feito nenhum pomodoro.

INVESTIGAR E CORRIGIR:

1. No backend (MissionsService):
   - Verificar a query que busca o progresso das missões do usuário
   - Verificar se o filtro de semana atual está correto:
     startedAt >= início da semana (segunda 00:00 UTC)
     startedAt <= fim da semana (domingo 23:59 UTC)
   - Se o progresso é calculado sem filtro de data, está somando histórico
     total em vez de apenas a semana atual — CORRIGIR o filtro

2. Verificar a lógica de "missão concluída":
   - completed: progress >= mission.target
   - Garantir que progress é o valor da SEMANA ATUAL, não total histórico

3. Se existe um campo UserMissionProgress no banco:
   - Verificar se o reset semanal está acontecendo (cron job toda segunda 00:00)
   - Se não existe reset: adicionar cron job:
     @Cron('0 0 * * 1') // toda segunda-feira 00:00
     resetWeeklyMissions() {
       await prisma.userMissionProgress.updateMany({
         data: { currentProgress: 0, completed: false }
       })
     }

4. No frontend:
   - Não confiar no campo completed do banco para exibir o checkmark
   - Recalcular no cliente: const isCompleted = mission.currentProgress >= mission.target
   - Isso evita estados desatualizados em cache

---

## BUG 5 — Ranking no dashboard mostra posição incorreta e aleatória

SINTOMA: No dashboard o usuário aparece como #70 global, mas na aba
de ranking está em #1. A posição muda a cada reload.

CAUSA PROVÁVEL: O widget de ranking no dashboard está fazendo uma query
diferente da aba de ranking (sem cache do Redis, ou com ordenação aleatória).

CORRIGIR:

1. No endpoint que o dashboard usa para buscar a posição do usuário:
   - Garantir que usa a MESMA lógica e MESMA fonte de dados que GET /ranking/global
   - Se o dashboard chama GET /users/me/stats e calcula a posição inline,
     substituir por GET /ranking/global/my-position que retorna apenas
     { position: number, total: number }

2. Criar endpoint dedicado se não existir:
   GET /ranking/my-position?type=global
   - Ler do cache Redis (ranking:global) — MESMA chave do ranking completo
   - Encontrar a posição do userId no array
   - Retornar { position, total, xp }
   - Se Redis indisponível: query direta no PostgreSQL com COUNT

3. No frontend do dashboard:
   - Substituir qualquer cálculo de posição local por chamada ao endpoint acima
   - Usar TanStack Query com staleTime: 60000 (1 min) — mesma cache do ranking

4. Garantir que NÃO há ORDER BY RANDOM() em nenhuma query de ranking

---

## BUG 6 — Badges com fundo branco (deve ser transparente)

SINTOMA: Os ícones de achievement estão com fundo branco quadrado
em vez de fundo transparente.

CORRIGIR:

1. Verificar o formato dos arquivos de badge em public/badges/ (ou onde estão):
   - Devem ser PNG com canal alpha (transparência)
   - Se foram convertidos para JPG em algum momento, o alpha foi perdido

2. No componente que exibe os badges:
   Localizar o componente AchievementBadge ou similar.
   Verificar se há background-color branco aplicado via CSS:
   - Remover qualquer: bg-white, backgroundColor: 'white', background: '#fff'
   - Se o container tem bg-white para contraste, mudar para bg-transparent
   - Garantir que o next/image não está aplicando placeholder="blur" com cor branca

3. Se os arquivos PNG realmente não têm transparência:
   - Os arquivos precisam ser regerados (ver seção de prompts de imagem abaixo)
   - Enquanto isso, aplicar: style={{ mixBlendMode: 'multiply' }} NÃO resolve,
     pois inverte cores escuras. A solução correta é PNG com alpha.

4. Para badges bloqueados (que ainda não foram conquistados):
   Aplicar: className="opacity-40 grayscale" no next/image
   NÃO aplicar background branco — manter transparência.

---

## BUG 7 — Todas as badges mostram o mesmo ícone (calculista.png)

SINTOMA: Todos os achievements estão usando a imagem do Calculista,
independente de qual achievement é.

CORRIGIR:

1. Localizar onde os badges são renderizados.
   Provavelmente há um mapeamento hardcoded ou errado:
   
   ERRADO (causa do bug):
   <Image src="/badges/calculista.png" ... />
   
   CORRETO:
   const BADGE_IMAGES: Record<string, string> = {
     'study_1h':        '/badges/primeiros-passos.png',
     'study_10h':       '/badges/dedicacao.png',
     'study_50h':       '/badges/estudante-focado.png',
     'study_100h':      '/badges/sabio.png',
     'study_500h':      '/badges/lenda-viva.png',
     'subject_10h':     '/badges/foco-inicial.png',
     'subject_50h':     '/badges/especialista.png',
     'subject_100h':    '/badges/mestre-da-materia.png',
     'calculus_100h':   '/badges/calculista.png',
     'pomodoro_10':     '/badges/foco-no-tomate.png',
     'pomodoro_100':    '/badges/maquina-de-foco.png',
     'marathon':        '/badges/maratonista.png',
     'night_owl':       '/badges/insone.png',
     'early_bird':      '/badges/madrugador.png',
     'streak_3':        '/badges/rotina.png',
     'streak_7':        '/badges/semana-perfeita.png',
     'streak_30':       '/badges/habito-de-ferro.png',
     'streak_100':      '/badges/imparavel.png',
     'first_upload':    '/badges/contribuidor-iniciante.png',
     'upload_10':       '/badges/ajudante.png',
     'upload_50':       '/badges/bibliotecario.png',
     'forum_reply':     '/badges/ajudando-o-proximo.png',
     'accepted_5':      '/badges/solucionador.png',
     'accepted_50':     '/badges/professor.png',
     'first_friend':    '/badges/nao-estamos-sos.png',
     'friends_10':      '/badges/sociavel.png',
     'rank_100':        '/badges/elite-100.png',
     'rank_10':         '/badges/top-10.png',
     'rank_1':          '/badges/o-melhor.png',
   }
   
   <Image src={BADGE_IMAGES[achievement.key] ?? '/badges/default.png'} ... />

2. Criar badge padrão /badges/default.png (ícone de interrogação ?) para
   achievements sem imagem ainda.

3. Verificar que o seed de achievements no banco usa exatamente as mesmas
   chaves (key) do mapeamento acima.

---

## SEÇÃO DE IMAGENS — Prompts para gerar os badges faltando

Gerar cada badge como PNG 512x512 fundo transparente.
Estilo base obrigatório para TODOS:
"Circular achievement badge illustration. Flat shading game art style.
Dark metallic outer ring with subtle gold highlights. [símbolo central específico].
Gold and purple color palette. Soft magical glow effect behind the symbol.
Transparent background. No text."

### 🌱 "Primeiros Passos" (1h de estudo):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a small glowing green sprout emerging from a golden open book, soft light rays around it. Green and gold color palette. Soft magical glow effect behind the symbol. Transparent background. No text.
```

### 📘 "Dedicação" (10h de estudo):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a glowing blue hardcover book with a small flame bookmark, golden pages fanning out slightly. Blue and gold color palette. Soft magical glow effect behind the symbol. Transparent background. No text.
```

### 🔥 "Estudante Focado" (50h de estudo):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: an intense orange and purple flame shaped like a brain or neural network. Orange, purple and gold color palette. Soft magical glow effect. Transparent background. No text.
```

### 🧠 "Sábio" (100h de estudo):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a glowing golden brain with small purple lightning bolts emanating from it, ethereal wisps of knowledge. Gold and deep purple color palette. Soft magical glow effect. Transparent background. No text.
```

### 👑 "Lenda Viva" (500h de estudo):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with ornate gold filigree highlights. In the center: a radiant golden crown floating above an open ancient tome, divine light rays bursting outward. Rich gold, white and royal purple color palette. Brilliant magical glow effect. Transparent background. No text.
```

### 🎯 "Foco Inicial" (10h na mesma matéria):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a glowing golden archery target with a purple arrow perfectly centered in the bullseye. Gold and purple color palette. Soft magical glow effect. Transparent background. No text.
```

### 🎓 "Especialista" (50h na mesma matéria):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a glowing golden graduation cap with small purple stars orbiting around it. Gold and purple color palette. Soft magical glow effect. Transparent background. No text.
```

### 🌟 "Mestre da Matéria" (100h na mesma matéria):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with ornate gold highlights. In the center: a brilliant glowing gold and white star with purple energy wisps swirling around it, radiating mastery. Gold, white and purple palette. Strong magical glow effect. Transparent background. No text.
```

### 🍅 "Foco no Tomate" (10 ciclos Pomodoro):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a stylized glowing red tomato with a golden timer face on it, small focus sparkles around it. Red, gold and purple color palette. Soft magical glow effect. Transparent background. No text.
```

### 🦾 "Máquina de Foco" (100 ciclos Pomodoro):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a powerful glowing mechanical arm made of gold and purple energy, gears visible, steam of concentration rising. Gold, purple and steel color palette. Intense magical glow effect. Transparent background. No text.
```

### 🏃 "Maratonista" (8h em um dia):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a glowing golden silhouette of a runner in motion with a purple speed trail and small clock behind them. Gold, purple and orange color palette. Soft magical glow effect. Transparent background. No text.
```

### 🌙 "Insone" (estudou após meia-noite 10 dias):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a glowing crescent moon with a small open eye in its curve, silver and indigo stars floating around it. Deep blue, silver and purple color palette. Mysterious magical glow effect. Transparent background. No text.
```

### 🌅 "Madrugador" (começou antes das 6h, 10 vezes):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a glowing golden sunrise with warm rays breaking through purple clouds, a small silhouette of a person with a book at the horizon. Gold, orange and purple color palette. Warm magical glow effect. Transparent background. No text.
```

### 🔄 "Rotina" (3 dias seguidos):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: three glowing golden circular arrows forming a cycle, small calendar icons between them. Gold and green color palette. Soft magical glow effect. Transparent background. No text.
```

### 📅 "Semana Perfeita" (7 dias seguidos):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a glowing golden calendar showing a full week with all 7 days marked with golden checkmarks, purple energy surrounding it. Gold and purple color palette. Soft magical glow effect. Transparent background. No text.
```

### ⚔️ "Hábito de Ferro" (30 dias seguidos):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a glowing iron and gold sword with a small flame at its tip, battle-worn but unbroken, 30 small marks on the blade. Steel, gold and purple color palette. Powerful magical glow effect. Transparent background. No text.
```

### 🚀 "Imparável" (100 dias seguidos):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with ornate gold highlights. In the center: a blazing golden rocket launching upward leaving a purple and orange fire trail, unstoppable energy. Gold, purple, and bright orange color palette. Explosive magical glow effect. Transparent background. No text.
```

### 📤 "Contribuidor Iniciante" (primeiro upload):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a glowing golden document with an upward arrow, small sparkles of contribution around it. Gold and teal color palette. Soft magical glow effect. Transparent background. No text.
```

### 📚 "Ajudante" (10 uploads):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a stack of 3 glowing golden books with small upward arrows rising from them, warm glow of helpfulness. Gold and warm amber color palette. Soft magical glow effect. Transparent background. No text.
```

### 🏛️ "Bibliotecário" (50 uploads):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with ornate gold highlights. In the center: a glowing miniature golden library or archive building with purple light emanating from its windows, countless knowledge. Gold, stone and purple color palette. Grand magical glow effect. Transparent background. No text.
```

### 🤝 "Ajudando o Próximo" (primeira resposta no fórum):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: two glowing hands reaching toward each other over an open book, golden light at the point of connection. Gold and warm white color palette. Warm magical glow effect. Transparent background. No text.
```

### ✅ "Solucionador" (5 respostas aceitas):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a large glowing golden checkmark inside a speech bubble, small purple stars of approval surrounding it. Gold and green color palette. Soft magical glow effect. Transparent background. No text.
```

### 🧑‍🏫 "Professor" (50 respostas aceitas):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a glowing golden teacher's pointer or staff touching a glowing chalkboard/book, wisdom light rays emanating outward. Gold and royal blue color palette. Academic magical glow effect. Transparent background. No text.
```

### 👥 "Não Estamos Sós" (primeiro amigo):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: two small glowing golden silhouetted figures standing side by side, purple connection beam between them. Gold and warm purple color palette. Soft magical glow effect. Transparent background. No text.
```

### 🎉 "Sociável" (10 amigos):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: a circle of small glowing golden silhouetted figures holding hands, festive purple and gold energy between them. Gold and festive purple color palette. Joyful magical glow effect. Transparent background. No text.
```

### 💯 "Elite 100" (top 100 global):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with subtle gold highlights. In the center: glowing bold number "100" in gold with a purple laurel wreath around it, competitive energy sparks. Gold and purple color palette. Competitive magical glow effect. Transparent background. No text.
```

### 🎖️ "Top 10" (top 10 global):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with ornate gold highlights. In the center: glowing gold medal with the number "10" engraved, decorated with purple and gold ribbons, elite glow. Rich gold and deep purple color palette. Prestigious magical glow effect. Transparent background. No text.
```

### 🏆 "O Melhor" (top 1 global):
```
Circular achievement badge illustration. Flat shading game art style. Dark metallic outer ring with elaborate ornate gold filigree. In the center: a magnificent glowing golden trophy with number "1" and a radiant star on top, divine light beams bursting outward in all directions, the ultimate achievement. Pure gold, white and royal purple color palette. Transcendent legendary glow effect. Transparent background. No text.
```

---

## BUG 8 — Perfil e aba de amigos demoram para carregar

SINTOMA: A aba de perfil e a aba de amigos têm latência muito alta.

CORRIGIR:

1. No endpoint GET /users/me/profile (ou GET /users/:username):
   Auditar a query Prisma — provavelmente está fazendo N+1:

   ERRADO:
   const user = await prisma.user.findUnique({ include: { achievements: true, sessions: true, friends: true } })
   // Isso carrega TUDO de uma vez, podendo trazer milhares de sessões

   CORRETO — separar em queries otimizadas:
   const [user, stats, recentAchievements, topSubjects] = await Promise.all([
     prisma.user.findUnique({ where: { id }, select: { id, username, avatar, bio, level, xp, ... } }),
     prisma.studySession.aggregate({ where: { userId: id, status: 'COMPLETED' }, _sum: { duration: true }, _count: true }),
     prisma.userAchievement.findMany({ where: { userId: id }, take: 6, orderBy: { unlockedAt: 'desc' }, include: { achievement: true } }),
     prisma.studySession.groupBy({ by: ['subject'], where: { userId: id }, _sum: { duration: true }, orderBy: { _sum: { duration: 'desc' } }, take: 5 }),
   ])

2. Adicionar cache Redis para perfis:
   Chave: profile:{userId} TTL: 5 minutos
   Invalidar quando: usuário edita perfil, ganha XP, sobe de nível

3. No endpoint GET /friends:
   Adicionar paginação: { skip: page * 20, take: 20 }
   Retornar apenas os campos necessários (avatar, username, level, xp)
   NÃO carregar histórico de sessões dos amigos

4. No frontend:
   Adicionar Skeleton loader no perfil e na lista de amigos
   (componentes SkeletonProfile e SkeletonFriendList)
   Para que a UI apareça imediatamente e os dados preencham depois

---

## BUG 9 — Sistema de missões: gerar 100 semanas e adicionar contador de reset

### 9A — Gerar pool de 100 missões semanais

CRIAR apps/api/prisma/missions-seed.ts com pool de 100 missões variadas.
Cada semana sorteia 3 missões aleatórias deste pool.

Categorias e exemplos:

CATEGORIA: ESTUDO GERAL (25 missões)
{ title: "Primeiro Passo", description: "Estude por pelo menos 30 minutos", target: 30, unit: "minutes", xpReward: 50 }
{ title: "Hora do Saber", description: "Complete 1 hora de estudo", target: 60, unit: "minutes", xpReward: 80 }
{ title: "Bloco de Estudo", description: "Complete 3 horas de estudo esta semana", target: 180, unit: "minutes", xpReward: 150 }
{ title: "Meio Dia de Foco", description: "Acumule 6 horas de estudo", target: 360, unit: "minutes", xpReward: 250 }
{ title: "Dia Inteiro de Conhecimento", description: "Acumule 8 horas de estudo", target: 480, unit: "minutes", xpReward: 320 }
{ title: "Maratona Acadêmica", description: "Estude 12 horas nesta semana", target: 720, unit: "minutes", xpReward: 450 }
{ title: "Estudante Elite", description: "Atinja 20 horas de estudo", target: 1200, unit: "minutes", xpReward: 700 }
{ title: "Consistência é Poder", description: "Estude ao menos 1 hora por dia, 3 dias seguidos", target: 3, unit: "consecutive_days", xpReward: 200 }
{ title: "Semana Sem Falhas", description: "Registre uma sessão de estudo todos os 7 dias", target: 7, unit: "study_days", xpReward: 400 }
{ title: "Sessão Rápida", description: "Inicie e conclua 3 sessões de estudo diferentes", target: 3, unit: "sessions", xpReward: 120 }
{ title: "Multi-Sessão", description: "Complete 5 sessões de estudo", target: 5, unit: "sessions", xpReward: 180 }
{ title: "Dez Sessões", description: "Complete 10 sessões esta semana", target: 10, unit: "sessions", xpReward: 300 }
{ title: "Ritmo Constante", description: "Faça pelo menos 1 sessão por dia por 5 dias", target: 5, unit: "study_days", xpReward: 280 }
{ title: "Foco Matinal", description: "Inicie uma sessão antes das 9h da manhã", target: 1, unit: "morning_sessions", xpReward: 100 }
{ title: "Estudo Noturno", description: "Complete uma sessão após as 20h", target: 1, unit: "night_sessions", xpReward: 100 }
{ title: "Foco das 6", description: "Inicie uma sessão antes das 7h", target: 1, unit: "early_sessions", xpReward: 150 }
{ title: "Variedade de Matérias", description: "Estude ao menos 3 matérias diferentes", target: 3, unit: "unique_subjects", xpReward: 200 }
{ title: "Especialização", description: "Dedique 5 horas a uma única matéria", target: 300, unit: "minutes_single_subject", xpReward: 220 }
{ title: "Duas Frentes", description: "Estude pelo menos 2 horas em 2 matérias diferentes", target: 2, unit: "subjects_2h_each", xpReward: 250 }
{ title: "XP Semanal Básico", description: "Ganhe 200 XP esta semana", target: 200, unit: "xp", xpReward: 100 }
{ title: "XP Intermediário", description: "Ganhe 500 XP esta semana", target: 500, unit: "xp", xpReward: 200 }
{ title: "XP Avançado", description: "Ganhe 1000 XP nesta semana", target: 1000, unit: "xp", xpReward: 400 }
{ title: "Sem Pausas Longas", description: "Complete uma sessão de 1h sem pausar", target: 60, unit: "minutes_no_pause", xpReward: 180 }
{ title: "Sessão de Resistência", description: "Complete uma sessão contínua de 2 horas", target: 120, unit: "minutes_no_pause", xpReward: 280 }
{ title: "Explorador de Horários", description: "Faça sessões em 3 períodos distintos (manhã, tarde, noite)", target: 3, unit: "time_periods", xpReward: 220 }

CATEGORIA: POMODORO (15 missões)
{ title: "Primeiro Tomate", description: "Complete 1 ciclo Pomodoro", target: 1, unit: "pomodoros", xpReward: 60 }
{ title: "Colheita de Tomates", description: "Complete 5 ciclos Pomodoro", target: 5, unit: "pomodoros", xpReward: 150 }
{ title: "Granja de Foco", description: "Complete 10 ciclos Pomodoro", target: 10, unit: "pomodoros", xpReward: 250 }
{ title: "Forno de Pomodoro", description: "Complete 15 ciclos Pomodoro", target: 15, unit: "pomodoros", xpReward: 350 }
{ title: "Pomodoro Mestre", description: "Complete 20 ciclos Pomodoro nesta semana", target: 20, unit: "pomodoros", xpReward: 450 }
{ title: "Quatro Rodadas", description: "Complete um ciclo completo de 4 Pomodoros seguidos", target: 4, unit: "consecutive_pomodoros", xpReward: 200 }
{ title: "Dia de Pomodoros", description: "Complete 8 Pomodoros em um único dia", target: 8, unit: "pomodoros_single_day", xpReward: 300 }
{ title: "Técnica Perfeita", description: "Complete 3 ciclos sem pular a pausa", target: 3, unit: "full_pomodoro_cycles", xpReward: 180 }
{ title: "Tomate Duplo", description: "Complete Pomodoros em 2 matérias diferentes", target: 2, unit: "pomodoro_subjects", xpReward: 160 }
{ title: "Tomate Triplo", description: "Complete Pomodoros em 3 matérias diferentes", target: 3, unit: "pomodoro_subjects", xpReward: 220 }
{ title: "Madrugada Pomodoro", description: "Complete um Pomodoro antes das 8h", target: 1, unit: "morning_pomodoros", xpReward: 130 }
{ title: "Pomodoro Noturno", description: "Complete um Pomodoro após as 22h", target: 1, unit: "late_pomodoros", xpReward: 130 }
{ title: "Sequência de Foco", description: "Complete Pomodoros por 3 dias seguidos", target: 3, unit: "pomodoro_days", xpReward: 240 }
{ title: "Semana do Tomate", description: "Complete ao menos 1 Pomodoro todos os dias da semana", target: 7, unit: "pomodoro_days", xpReward: 380 }
{ title: "Desafio dos 25", description: "Complete 25 ciclos Pomodoro", target: 25, unit: "pomodoros", xpReward: 550 }

CATEGORIA: COMUNIDADE (20 missões)
{ title: "Compartilhe seu Saber", description: "Envie 1 material ao banco de provas", target: 1, unit: "uploads", xpReward: 100 }
{ title: "Doador de Conhecimento", description: "Envie 3 materiais ao banco", target: 3, unit: "uploads", xpReward: 220 }
{ title: "Contribuidor da Semana", description: "Envie 5 materiais ao banco", target: 5, unit: "uploads", xpReward: 350 }
{ title: "Pergunta no Fórum", description: "Crie 1 post no fórum", target: 1, unit: "forum_posts", xpReward: 80 }
{ title: "Ativo no Fórum", description: "Crie 3 posts no fórum", target: 3, unit: "forum_posts", xpReward: 180 }
{ title: "Responda e Ajude", description: "Responda 1 pergunta no fórum", target: 1, unit: "forum_replies", xpReward: 70 }
{ title: "Ajudante da Semana", description: "Responda 5 perguntas no fórum", target: 5, unit: "forum_replies", xpReward: 250 }
{ title: "Mentor em Ação", description: "Tenha 1 resposta aceita como solução", target: 1, unit: "accepted_solutions", xpReward: 150 }
{ title: "Novo Aliado", description: "Adicione 1 amigo", target: 1, unit: "new_friends", xpReward: 80 }
{ title: "Faça Amigos", description: "Adicione 3 amigos", target: 3, unit: "new_friends", xpReward: 180 }
{ title: "Upvote Generoso", description: "Dê upvote em 5 materiais do banco", target: 5, unit: "upvotes_given", xpReward: 60 }
{ title: "Curador do Banco", description: "Avalie 10 materiais do banco", target: 10, unit: "upvotes_given", xpReward: 100 }
{ title: "Comentarista", description: "Comente em 3 materiais do banco", target: 3, unit: "bank_comments", xpReward: 90 }
{ title: "Visita ao Banco", description: "Acesse o banco de provas e visualize 5 materiais", target: 5, unit: "bank_views", xpReward: 50 }
{ title: "Explorador do Fórum", description: "Leia e vote em 10 posts do fórum", target: 10, unit: "forum_interactions", xpReward: 70 }
{ title: "Solicitação de Amizade", description: "Envie 2 solicitações de amizade", target: 2, unit: "friend_requests_sent", xpReward: 60 }
{ title: "Engajamento Total", description: "Faça 1 post, 1 resposta e 1 upload na mesma semana", target: 3, unit: "community_actions", xpReward: 300 }
{ title: "Parceria de Estudos", description: "Troque mensagens com 3 amigos diferentes", target: 3, unit: "chat_contacts", xpReward: 120 }
{ title: "Semana Social", description: "Interaja com o fórum por 5 dias diferentes", target: 5, unit: "forum_active_days", xpReward: 280 }
{ title: "Grande Contribuidor", description: "Some 5 uploads + 5 respostas no fórum", target: 10, unit: "total_contributions", xpReward: 400 }

CATEGORIA: DESAFIO ESPECIAL (20 missões — mais difíceis, mais XP)
{ title: "Dia Lendário", description: "Estude por 10 horas em um único dia", target: 600, unit: "minutes_single_day", xpReward: 500 }
{ title: "Noite de Gala", description: "Complete 3 horas de estudo após as 22h", target: 180, unit: "late_night_minutes", xpReward: 350 }
{ title: "Amanhecer do Guerreiro", description: "Estude 2 horas antes das 8h em um mesmo dia", target: 120, unit: "early_morning_minutes", xpReward: 350 }
{ title: "Domínio da Matéria", description: "Passe 8 horas estudando a mesma matéria nesta semana", target: 480, unit: "minutes_single_subject", xpReward: 500 }
{ title: "XP Semanal Máximo", description: "Atinja o cap diário de XP em 3 dias diferentes", target: 3, unit: "cap_days", xpReward: 600 }
{ title: "Enciclopédia Viva", description: "Envie materiais de 3 matérias diferentes", target: 3, unit: "upload_subjects", xpReward: 400 }
{ title: "O Infalível", description: "Estude todos os 7 dias E complete 5 Pomodoros", target: 2, unit: "dual_challenge", xpReward: 600 }
{ title: "Guru do Fórum", description: "Tenha 3 respostas aceitas como solução na mesma semana", target: 3, unit: "accepted_solutions", xpReward: 500 }
{ title: "Desafio do Centurião", description: "Ganhe 1000 XP apenas de sessões de estudo", target: 1000, unit: "session_xp", xpReward: 700 }
{ title: "Polímata", description: "Estude 5 matérias diferentes nesta semana", target: 5, unit: "unique_subjects", xpReward: 450 }
{ title: "Sessão Épica", description: "Complete uma sessão contínua de 3 horas", target: 180, unit: "minutes_no_pause", xpReward: 400 }
{ title: "Combo Perfeito", description: "Faça upload, post no fórum e 8 Pomodoros", target: 3, unit: "combo_actions", xpReward: 550 }
{ title: "Rei dos Tomates", description: "Complete 30 Pomodoros em uma semana", target: 30, unit: "pomodoros", xpReward: 650 }
{ title: "Monge Estudante", description: "Estude por 4 horas seguidas sem pausas", target: 240, unit: "minutes_no_pause", xpReward: 500 }
{ title: "Lenda Semanal", description: "Ganhe 2000 XP nesta semana", target: 2000, unit: "xp", xpReward: 800 }
{ title: "Desafio da Madrugada", description: "Complete 2 horas após meia-noite", target: 120, unit: "midnight_minutes", xpReward: 300 }
{ title: "Produtividade Máxima", description: "Complete sessões nos 3 períodos do dia (manhã/tarde/noite) no mesmo dia", target: 3, unit: "day_periods", xpReward: 350 }
{ title: "Inquebrável", description: "Não perca nenhuma missão semanal por 3 semanas seguidas", target: 3, unit: "perfect_weeks", xpReward: 750 }
{ title: "Ascensão", description: "Suba de nível esta semana", target: 1, unit: "level_ups", xpReward: 600 }
{ title: "Lendário da Semana", description: "Seja o 1º do ranking semanal ao fim da semana", target: 1, unit: "weekly_rank_1", xpReward: 1000 }

Criar seed que:
1. Apaga todas as missões antigas
2. Insere as 100 missões acima no model Mission
3. A cada segunda-feira 00:00 (cron job), sorteia 3 missões aleatórias
   (1 de cada categoria: fácil, médio, difícil) e cria WeeklyMissionSet
   vinculado à semana atual

### 9B — Contador de reset das missões

CRIAR componente MissionResetCountdown (src/components/missions/MissionResetCountdown.tsx):

Lógica:
- Calcular próxima segunda-feira às 00:00 (horário do usuário)
- Mostrar countdown: "Novas missões em: 2d 14h 32m"
- Atualizar a cada minuto (setInterval 60s)
- Quando chegar a 0: refetch das missões automaticamente

Visual:
- Texto pequeno abaixo das missões no dashboard: "🔄 Renova em: Xd Xh Xm"
- Se faltar menos de 1h: mudar cor para amarelo (urgência)
- Se faltar menos de 5 min: "Renovando em instantes..." com loading spinner

---

## BUG 9C — Meta semanal editável no dashboard

ADICIONAR botão de editar meta semanal:

Backend:
PATCH /users/me/weekly-goal
Body: { weeklyGoalMinutes: number } (mín: 60, máx: 3600 — 1h a 60h)
Salvar em User.weeklyGoalMinutes (adicionar campo ao schema se não existir)
Padrão: 600 (10 horas)

Frontend:
No widget de meta semanal do dashboard:
- Adicionar ícone de lápis ✏️ ao lado do título "Meta da Semana"
- Ao clicar: abrir inline edit (não modal) com input numérico
- Input em HORAS (converter para minutos ao salvar): "Meta: [10] horas"
- Botões: ✓ salvar | ✗ cancelar
- Após salvar: recalcular a barra de progresso imediatamente
- Toast: "Meta atualizada para {X} horas semanais ⚡"
- Mostrar também: "Esta semana: Xh Xmin de {meta}h"

---

## BUG 10 — Crash nos rankings de Streak e outros

SINTOMA: Ao tentar acessar qualquer aba de ranking além do global,
ocorre "Application error: a client-side exception has occurred"

INVESTIGAR E CORRIGIR:

1. Abrir apps/web/src/app/(dashboard)/ranking/page.tsx
2. Identificar onde o crash ocorre — provavelmente:
   - Endpoint /ranking/streak não existe ainda no backend
   - Frontend tenta acessar data.users.map() mas data é undefined
   - Falta tratamento de erro no fetch das tabs

3. Para CADA aba de ranking, verificar se o endpoint existe:
   GET /ranking/global         ← provavelmente ok
   GET /ranking/streak         ← pode não existir
   GET /ranking/hours-week     ← pode não existir
   GET /ranking/hours-month    ← pode não existir
   GET /ranking/uploads        ← pode não existir
   GET /ranking/institution    ← pode não existir
   GET /ranking/course         ← pode não existir

4. Para endpoints faltando, criar no RankingController:

GET /ranking/streak:
Ordenar por User.currentStreak DESC (ou calcular do histórico)
Cache Redis: ranking:streak, TTL 10 min

GET /ranking/hours-week:
Somar StudySession.duration onde startedAt >= início da semana
Agrupar por userId, ordenar por soma DESC
Cache Redis: ranking:hours_week, TTL 5 min

GET /ranking/hours-month:
Mesma lógica mas para os últimos 30 dias

GET /ranking/uploads:
Contar BankItem por uploadedBy, ordenar por count DESC

5. No frontend, adicionar tratamento de erro em CADA tab:
   const { data, isLoading, isError } = useQuery(...)
   if (isError) return <div>Erro ao carregar ranking. <button onClick={refetch}>Tentar novamente</button></div>
   if (!data?.users?.length) return <EmptyState />
   
   NUNCA fazer: data.users.map() sem verificar se data e data.users existem primeiro.

Após implementar todos os endpoints, verificar que as tabs de ranking
carregam corretamente sem crash.

---

## CHECKLIST DE VERIFICAÇÃO FINAL

Após implementar todas as correções, testar manualmente:

[ ] Buscar usuário por nome → resultados aparecem em < 1s
[ ] Logo visível e proporcional no header
[ ] Editar perfil → salva sem crash
[ ] Dashboard: missões mostram progresso correto (zerado se não fez nada)
[ ] Dashboard: posição no ranking é consistente com a aba de ranking
[ ] Badges: cada achievement mostra seu próprio ícone (não calculista)
[ ] Badges: fundo transparente (sem quadrado branco)
[ ] Perfil carrega em < 2s
[ ] Aba de amigos carrega em < 2s
[ ] Todas as abas de ranking carregam sem crash
[ ] Contador de reset das missões aparece e faz contagem regressiva
[ ] Meta semanal pode ser editada inline
[ ] Após editar meta: barra de progresso atualiza

Criar todos os arquivos necessários agora.
Não criar mocks — todos os dados devem vir da API real.
```

---

## PARTE 2 — APÓS GERAR OS BADGES COM IA DE IMAGEM

Depois de gerar todas as 27 imagens de badge com os prompts acima,
salvar cada arquivo com exatamente este nome em public/badges/:

| Achievement | Nome do arquivo |
|---|---|
| Primeiros Passos | primeiros-passos.png |
| Dedicação | dedicacao.png |
| Estudante Focado | estudante-focado.png |
| Sábio | sabio.png |
| Lenda Viva | lenda-viva.png |
| Foco Inicial | foco-inicial.png |
| Especialista | especialista.png |
| Mestre da Matéria | mestre-da-materia.png |
| Calculista | calculista.png (já existe) |
| Foco no Tomate | foco-no-tomate.png |
| Máquina de Foco | maquina-de-foco.png |
| Maratonista | maratonista.png |
| Insone | insone.png |
| Madrugador | madrugador.png |
| Rotina | rotina.png |
| Semana Perfeita | semana-perfeita.png |
| Hábito de Ferro | habito-de-ferro.png |
| Imparável | imparavel.png |
| Contribuidor Iniciante | contribuidor-iniciante.png |
| Ajudante | ajudante.png |
| Bibliotecário | bibliotecario.png |
| Ajudando o Próximo | ajudando-o-proximo.png |
| Solucionador | solucionador.png |
| Professor | professor.png |
| Não Estamos Sós | nao-estamos-sos.png |
| Sociável | sociavel.png |
| Elite 100 | elite-100.png |
| Top 10 | top-10.png |
| O Melhor | o-melhor.png |
| Default (fallback) | default.png |

*StudyQuest RPG — Prompt 50: Bugfix Geral v1.0 • 2025*
