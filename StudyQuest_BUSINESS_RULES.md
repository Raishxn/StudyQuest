# ⚙️ StudyQuest RPG — Regras de Negócio
## Sistema de XP, Conquistas, Rankings e Sessões

**Versão 1.0 • 2025**

---

## Sumário

1. [Sessões de Estudo](#1-sessões-de-estudo)
2. [Sistema de XP](#2-sistema-de-xp)
3. [Sistema de Níveis e Títulos](#3-sistema-de-níveis-e-títulos)
4. [Conquistas (Achievements)](#4-conquistas-achievements)
5. [Streaks](#5-streaks)
6. [Rankings](#6-rankings)
7. [Banco de Provas](#7-banco-de-provas)
8. [Fórum](#8-fórum)
9. [Amizades](#9-amizades)
10. [Edge Cases e Decisões de Design](#10-edge-cases-e-decisões-de-design)

---

## 1. Sessões de Estudo

### 1.1 Criação de Sessão

- Uma sessão só é criada no banco quando o usuário **clicar em "Iniciar"** — não ao abrir a tela.
- Campos obrigatórios: `subject` (matéria). Campo `topic` é opcional.
- Um usuário **não pode ter duas sessões ativas simultaneamente**. Se tentar iniciar uma segunda, o sistema exibe alerta perguntando se deseja encerrar a anterior.
- O `startedAt` é registrado no servidor no momento em que o endpoint `POST /study/sessions` é chamado — não no cliente — para evitar manipulação.

### 1.2 Modos de Timer

**Modo Pomodoro:**
- Ciclo padrão: 25 min foco + 5 min pausa curta.
- A cada 4 ciclos completos: pausa longa de 15 min.
- O usuário pode customizar os tempos (mín. 5 min foco, máx. 90 min foco).
- Cada ciclo de foco completado integralmente conta como **"Pomodoro completo"** para fins de XP e conquistas.
- Pausas **não geram XP** — apenas o tempo de foco conta.

**Modo Timer Avulso:**
- Cronômetro crescente sem limite pré-definido.
- O usuário encerra manualmente.
- Não há conceito de "ciclo" — todo o tempo ativo gera XP.

### 1.3 Pausa de Sessão

- O usuário pode pausar a sessão a qualquer momento.
- Tempo em pausa **não é contabilizado** para XP nem para o total de horas.
- Pausa máxima permitida: **2 horas**. Se exceder, a sessão é **automaticamente encerrada** e o XP é calculado sobre o tempo ativo até então.
- Sessão pausada por mais de 2h é marcada com status `AUTO_ENDED`.

### 1.4 Encerramento de Sessão

- O usuário clica em "Encerrar" → confirma em modal → `PATCH /study/sessions/:id/end` é chamado.
- O `endedAt` é registrado no servidor.
- `duration` = `endedAt - startedAt - tempoEmPausa` (em minutos, arredondado para baixo).
- **Sessão mínima para ganhar XP: 1 minuto**. Sessões com menos de 1 minuto são salvas mas não geram XP.
- Após encerrar, o XP é calculado, salvo em `XPTransaction` e adicionado ao total do usuário.

### 1.5 Sessão com Perda de Conexão / Fechamento do Navegador

- O cliente envia um **heartbeat** a cada 60 segundos para o servidor (`PATCH /study/sessions/:id/heartbeat`).
- Se o servidor não receber heartbeat por **5 minutos**, a sessão é marcada como `ABANDONED`.
- Sessões `ABANDONED` **ganham XP** pelo tempo ativo registrado até o último heartbeat.
- Ao reabrir o app com sessão `ABANDONED`, o usuário vê modal: *"Detectamos que sua sessão anterior foi interrompida. Você ganhou X XP pelo tempo registrado."*
- O usuário **não pode retomar** uma sessão `ABANDONED` — precisa criar uma nova.

### 1.6 Sessões Retroativas

- **Não são permitidas.** O usuário não pode registrar sessões no passado.
- Toda sessão deve ser iniciada e encerrada em tempo real.
- Isso garante a integridade dos rankings e XP.

---

## 2. Sistema de XP

### 2.1 Fontes de XP e Valores

| Ação | XP | Condições |
|------|----|-----------|
| 1 minuto de sessão ativa | +1 XP | Mínimo 1 min; tempo em pausa não conta |
| Pomodoro completo (ciclo de foco) | +10 XP (bônus) | Apenas ciclos completados integralmente |
| Upload no banco de provas | +50 XP | Apenas na primeira aprovação do material |
| Resposta aceita no fórum | +20 XP | Apenas quando marcada como solução |
| Streak de 7 dias | +100 XP | Uma vez por sequência de 7 dias |
| Streak de 30 dias | +500 XP | Uma vez por sequência de 30 dias |
| Meta semanal atingida | +200 XP | Uma vez por semana (reset segunda-feira 00:00) |
| Conquista desbloqueada | variável | Depende da conquista (ver seção 4) |
| Primeiro login do dia | +5 XP | Uma vez por dia |

### 2.2 Cálculo do XP de uma Sessão

```
xp_sessao = floor(duration_minutos * 1)
           + (pomodoros_completos * 10)   // se modo Pomodoro
```

**Exemplo:** sessão Pomodoro de 52 min com 2 ciclos completos:
- Tempo ativo: 52 min → 52 XP base
- 2 Pomodoros completos → +20 XP bônus
- **Total: 72 XP**

### 2.3 Anti-Abuso de XP

- **Cap diário de XP por sessão:** máximo de **600 XP por sessão única** (equivale a ~10h contínuas). Sessões acima disso são encerradas automaticamente ao atingir o cap.
- **Cap diário total de XP:** máximo de **1.200 XP por dia** por usuário. XP adicional além disso é descartado silenciosamente (sem notificação de cap para não frustrar).
- **Velocidade mínima:** sessões com duração registrada impossível (ex: 500 min em 10 min de tempo real) são invalidadas e marcadas para revisão.
- Todas as transações de XP são imutáveis e auditáveis — nunca deletadas, apenas adicionadas.

### 2.4 Subtração de XP

- **XP nunca é subtraído** — o sistema é só de progressão positiva.
- Denúncias de fraude resultam em **banimento da conta**, não em subtração de XP.
- Isso evita frustrações e mantém o engajamento mesmo após erros do sistema.

### 2.5 XP por Matéria

- Cada sessão registra o `subject`, permitindo calcular **XP por matéria** separadamente.
- O XP total do usuário é a soma de todo XP ganho, independente da fonte.
- O XP por matéria considera apenas o XP gerado em sessões dessa matéria (uploads e fórum não somam ao XP de matéria).

---

## 3. Sistema de Níveis e Títulos

### 3.1 Tabela de Níveis

| Nível | XP Acumulado | Título | XP para próximo |
|-------|-------------|--------|-----------------|
| 1 | 0 | 🎓 Calouro | 500 |
| 2 | 500 | 📚 Aplicado | 1.000 |
| 3 | 1.500 | 🧪 Pesquisador | 1.500 |
| 4 | 3.000 | ⚡ Acadêmico | 3.000 |
| 5 | 6.000 | 🏆 Scholar | 6.000 |
| 6 | 12.000 | 🌟 Mestre | 13.000 |
| 7 | 25.000 | 🔥 Lendário | ∞ |

### 3.2 Regras de Nível

- O nível é **sempre calculado** com base no XP total acumulado — não é armazenado diretamente. O campo `level` no banco é um cache atualizado a cada ganho de XP.
- **Não existe regressão de nível.** Uma vez que o usuário atinge um nível, ele não volta.
- Level-up pode acontecer no meio de uma sessão. Nesse caso, a notificação aparece ao **encerrar a sessão** (não durante, para não interromper o foco).
- Se uma sessão causar múltiplos level-ups de uma vez (ex: nível 2 → nível 4), mostra a tela de level-up apenas para o nível **mais alto atingido**.

### 3.3 Título Personalizado (Futuro)

- A partir do nível 5, o usuário poderá escolher exibir qualquer título que já desbloqueou.
- O título atual ainda será exibido como "título ativo" no ranking.

---

## 4. Conquistas (Achievements)

### 4.1 Regras Gerais

- Conquistas são verificadas de forma **assíncrona** via fila (BullMQ) após cada evento relevante.
- Uma conquista só pode ser desbloqueada **uma vez por usuário**.
- Conquistas não expiram e não podem ser perdidas.
- O XP de conquistas é creditado **no momento do desbloqueio**.

### 4.2 Catálogo Completo de Conquistas

**Conquistas de Estudo:**

| Chave | Nome | Critério | XP |
|-------|------|----------|----|
| `study_1h` | Primeiros Passos | Completar 1h total de estudo | 10 |
| `study_10h` | Dedicado | Completar 10h total de estudo | 50 |
| `study_50h` | Incansável | Completar 50h total de estudo | 150 |
| `study_100h` | Centurião | Completar 100h total de estudo | 300 |
| `study_500h` | Lenda Acadêmica | Completar 500h total de estudo | 1000 |
| `subject_10h` | Especialista Iniciante | 10h em uma única matéria | 75 |
| `subject_50h` | Especialista | 50h em uma única matéria | 200 |
| `subject_100h` | Mestre da Matéria | 100h em uma única matéria | 500 |
| `calculus_100h` | Calculista | 100h estudando Cálculo especificamente | 300 |
| `marathon` | Maratonista | 8h de estudo em um único dia | 200 |
| `night_owl` | Coruja | Estudar após 00:00 por 10 dias diferentes | 100 |
| `early_bird` | Madrugador | Iniciar sessão antes das 07:00 por 5 dias | 100 |
| `pomodoro_10` | Método | Completar 10 Pomodoros | 30 |
| `pomodoro_100` | Disciplinado | Completar 100 Pomodoros | 150 |

**Conquistas de Comunidade:**

| Chave | Nome | Critério | XP |
|-------|------|----------|----|
| `first_upload` | Contribuidor | Fazer o primeiro upload no banco | 50 |
| `upload_10` | Compartilhador | 10 uploads aprovados no banco | 200 |
| `upload_50` | Biblioteca Viva | 50 uploads aprovados no banco | 500 |
| `first_reply` | Solidário | Responder pela primeira vez no fórum | 20 |
| `accepted_5` | Prestativo | 5 respostas aceitas no fórum | 100 |
| `accepted_50` | Solucionador | 50 respostas aceitas no fórum | 400 |
| `friends_1` | Sociável | Adicionar o primeiro amigo | 20 |
| `friends_10` | Popular | Ter 10 amigos | 100 |

**Conquistas de Streak:**

| Chave | Nome | Critério | XP |
|-------|------|----------|----|
| `streak_3` | Consistente | Streak de 3 dias | 30 |
| `streak_7` | Semanal | Streak de 7 dias | 100 |
| `streak_30` | Mensal | Streak de 30 dias | 500 |
| `streak_100` | Inabalável | Streak de 100 dias | 2000 |

**Conquistas de Ranking:**

| Chave | Nome | Critério | XP |
|-------|------|----------|----|
| `rank_top100` | Destaque | Entrar no top 100 global | 200 |
| `rank_top10` | Elite | Entrar no top 10 global | 500 |
| `rank_1` | O Escolhido | Ser #1 no ranking global (snapshot semanal) | 1000 |

### 4.3 Verificação de Conquistas

```
Evento: sessão encerrada
→ Verificar: study_Xh, subject_Xh, marathon, night_owl, early_bird,
             pomodoro_X, streak_X

Evento: upload aprovado
→ Verificar: first_upload, upload_X

Evento: resposta aceita
→ Verificar: first_reply, accepted_X

Evento: amizade aceita
→ Verificar: friends_X

Evento: ranking calculado (cron semanal)
→ Verificar: rank_topX, rank_1
```

---

## 5. Streaks

### 5.1 Definição de Streak

- Um dia conta para o streak se o usuário **completou pelo menos 1 sessão de estudo** com duração mínima de **5 minutos** naquele dia.
- O "dia" é definido pelo **fuso horário do usuário** (capturado no cadastro ou pelo browser).
- Streak é incrementado uma vez por dia — múltiplas sessões no mesmo dia não incrementam mais de uma vez.

### 5.2 Manutenção e Quebra

- O streak **quebra se o usuário não estudar em um dia completo** (00:00 às 23:59 no fuso do usuário).
- **Grace period:** o usuário tem até **23:59 do dia seguinte** para recuperar um streak quebrado uma vez por semana (máximo 1 uso a cada 7 dias). Isso evita punição severa por esquecimentos pontuais.
- Ao usar o grace period, o streak é mantido mas uma notificação avisa que ele foi usado.

### 5.3 Notificações de Streak

| Horário | Condição | Mensagem |
|---------|----------|---------|
| 20:00 | Não estudou hoje | "🔥 Seu streak de X dias está em risco! Você tem 4h." |
| 22:00 | Ainda não estudou | "⚠️ Última chance! Streak quebra em 2h." |
| Qualquer hora | Streak quebrado | "💔 Seu streak de X dias foi quebrado. Comece um novo hoje!" |

---

## 6. Rankings

### 6.1 Tipos de Ranking e Fontes de Dados

| Ranking | Métrica | Período | Atualização |
|---------|---------|---------|-------------|
| Global | XP total | Semanal / Mensal / All-time | A cada 5 min (cache Redis) |
| Por Matéria | Minutos estudados na matéria | Semanal / All-time | A cada 5 min |
| Por Instituição | XP total (apenas users da IES) | Semanal / All-time | A cada 10 min |
| Por Curso | XP total (mesmo curso) | Semanal / All-time | A cada 10 min |
| Entre Amigos | XP total | Semanal / All-time | A cada 5 min |

### 6.2 Cálculo e Cache

- Rankings são calculados por **cron job** (a cada 5 ou 10 min) e armazenados no **Redis** com TTL correspondente.
- O cron job agrega dados do PostgreSQL e grava o resultado serializado no Redis.
- Consultas de ranking **nunca vão direto ao PostgreSQL** em produção — sempre leem do Redis.
- Em caso de cache miss (Redis indisponível), o sistema lê diretamente do banco com query limitada (top 100).

### 6.3 Empates

- Em caso de empate de XP, o desempate é pela **data de cadastro** (quem se cadastrou antes fica acima).
- Para rankings por matéria (em minutos), o desempate é pelo maior número de sessões.

### 6.4 Período Semanal

- Semana começa sempre na **segunda-feira às 00:00 UTC**.
- Reset do ranking semanal: segunda-feira às 00:00 UTC via cron job.
- O histórico de rankings semanais passados é preservado (tabela `RankingSnapshot`).

### 6.5 Exibição da Posição do Usuário

- O usuário sempre vê sua posição atual, mesmo que não esteja no top visível.
- Se ele estiver fora do top 100 exibido, sua linha aparece separada ao final da lista com destaque.
- Posição mínima exibida: **a posição real** (sem arredondamentos tipo "100+").

### 6.6 Usuários Inativos

- Usuários sem nenhuma atividade nos **últimos 90 dias** são excluídos do ranking semanal e mensal (mas não do all-time).
- Isso evita que o ranking fique poluído com contas antigas inativas.

---

## 7. Banco de Provas

### 7.1 Upload

- Formatos aceitos: **PDF e imagens** (JPG, PNG, WebP).
- Tamanho máximo por arquivo: **20 MB**.
- Um usuário pode fazer no máximo **10 uploads por dia** (anti-spam).
- O mesmo arquivo (verificação por hash SHA-256) **não pode ser enviado duas vezes**. Se detectado duplicata, o sistema avisa o usuário e não salva.

### 7.2 Metadados Obrigatórios e Opcionais

| Campo | Obrigatoriedade | Observação |
|-------|-----------------|------------|
| Tipo (Prova / Lista / Gabarito) | Obrigatório | |
| Matéria | Obrigatório | |
| Instituição | Obrigatório | Vinculada à instituição do usuário por padrão, mas editável |
| Curso | Obrigatório | |
| Professor | Opcional | Campo texto livre |
| Período (ex: 2025.1) | Opcional | Formato: YYYY.S (S = 1 ou 2) |
| Título descritivo | Obrigatório | Mín. 10 caracteres |

### 7.3 XP pelo Upload

- O XP de upload (+50) é creditado **imediatamente** ao enviar.
- Se o material for removido por moderação, o XP **não é revertido** (boa-fé presumida).
- Reuploads do mesmo conteúdo (após remoção por moderação) **não geram XP novamente**.

### 7.4 Comentários e Resoluções

- Comentários têm limite de **2.000 caracteres**.
- Upload de resolução em comentário: mesmas regras do upload principal (20MB, PDF/imagem).
- Um usuário pode ter no máximo **20 comentários por dia** em um mesmo item do banco.
- Upvotes em resoluções: máximo **1 upvote por usuário por resolução**. Não há downvote.

---

## 8. Fórum

### 8.1 Criação de Post

- Título: mínimo 10 caracteres, máximo 200.
- Corpo: mínimo 30 caracteres, máximo 10.000.
- Um usuário pode criar no máximo **5 posts por hora**.
- Um post só pode ser editado pelo autor nas **primeiras 24 horas** após a criação.

### 8.2 Respostas

- Respostas: mínimo 20 caracteres, máximo 5.000.
- Máximo de **20 respostas por hora** por usuário.
- Respostas podem ser editadas pelo autor nas **primeiras 24 horas**.

### 8.3 Solução Aceita

- Apenas o **autor do post** pode marcar uma resposta como solução.
- Só pode haver **uma solução aceita** por post.
- É possível **desmarcar** e marcar outra resposta como solução (sem limite de trocas).
- Ao marcar como solução:
  1. O autor da resposta recebe **+20 XP**.
  2. Verificação de conquistas `accepted_X` é disparada.
  3. O post é marcado como `solved = true`.
  4. O post continua aberto para novas respostas (alguém pode ter uma solução melhor).

### 8.4 Upvotes

- 1 upvote por usuário por post/resposta.
- O autor **não pode upvotar** o próprio post ou resposta.
- Upvotes **não geram XP** — são apenas sinais de qualidade.

---

## 9. Amizades

### 9.1 Solicitações

- Um usuário pode enviar no máximo **20 solicitações de amizade por dia**.
- Solicitações pendentes expiram após **30 dias** sem resposta.
- Não é possível enviar solicitação para alguém que já bloqueou você.

### 9.2 Limites

- Máximo de **500 amigos** por conta.
- Ao atingir o limite, o botão de adicionar amigo é desabilitado e exibe mensagem explicativa.

### 9.3 Bloqueio

- Bloquear um usuário: remove a amizade (se existir), cancela solicitações pendentes, impede o bloqueado de ver o perfil e de aparecer nos rankings de amigos do bloqueador.
- O bloqueio é **silencioso** — o usuário bloqueado não recebe notificação.

---

## 10. Edge Cases e Decisões de Design

Esta seção documenta situações ambíguas e a decisão tomada para cada uma.

### 10.1 Sessões

| Situação | Decisão |
|----------|---------|
| Usuário fecha o app sem encerrar | Heartbeat para; após 5 min sem heartbeat, sessão vira `ABANDONED` com XP proporcional |
| Usuário deixa o timer rodando a noite toda | Cap de 600 XP por sessão + encerramento automático ao atingir cap |
| Dois dispositivos com sessão aberta | Não permitido — ao iniciar sessão em novo dispositivo, a anterior é encerrada automaticamente com XP proporcional |
| Usuário muda o horário do sistema para ganhar mais XP | `startedAt` e `endedAt` são definidos pelo servidor, não pelo cliente |
| Sessão Pomodoro: usuário encerra na metade de um ciclo | O ciclo parcial conta apenas como tempo avulso (sem bônus de Pomodoro) |
| Sessão de exatamente 0 minutos (iniciou e encerrou) | Salva sem XP; não conta para streak |

### 10.2 XP e Níveis

| Situação | Decisão |
|----------|---------|
| Usuário atinge dois níveis de uma vez | Mostra tela de level-up apenas para o nível mais alto |
| XP de conquista causa level-up | Level-up é processado normalmente |
| Usuário no nível 7 (máximo) | XP continua acumulando normalmente; exibe "MAX LEVEL" na barra |
| Dois usuários com XP idêntico no ranking | Desempate por data de cadastro (mais antigo fica acima) |
| Cap diário atingido silenciosamente | Usuário não é notificado do cap para evitar frustração |

### 10.3 Conquistas

| Situação | Decisão |
|----------|---------|
| Conquista de matéria específica (`calculus_100h`) com matéria escrita diferente | Sistema normaliza nomes de matéria (Cálculo = Cálculo I = Calculus → mesma chave) |
| Conquista já desbloqueada é triggerada novamente | Ignorada silenciosamente (idempotente) |
| Conquista de ranking (`rank_1`) e usuário empata em 1º | Ambos recebem a conquista |
| Upload removido por moderação após gerar conquista `first_upload` | Conquista **mantida** |

### 10.4 Streaks

| Situação | Decisão |
|----------|---------|
| Usuário em fuso diferente do servidor | Streak calculado no fuso do usuário (salvo no perfil) |
| Usuário estuda às 23:59 e à 00:01 | Contam para dias diferentes — duas entradas no streak |
| Usuário usa grace period e quebra streak no mesmo dia | Grace period não está mais disponível por 7 dias |
| Mudança de fuso horário pelo usuário | Novo fuso vale a partir do dia seguinte |

### 10.5 Banco de Provas

| Situação | Decisão |
|----------|---------|
| Mesmo PDF enviado por dois usuários diferentes | Segundo upload é bloqueado (hash duplicado); primeiro uploader mantém o XP |
| Arquivo corrompido | Upload é rejeitado com mensagem de erro; XP não é creditado |
| Usuário deleta o próprio upload | Arquivo removido do storage; XP não é revertido |
| Upload com metadados incorretos (professor errado) | Qualquer usuário pode sugerir correção; moderador aprova |

---

*StudyQuest RPG — Regras de Negócio v1.0 • 2025 • Confidencial*
