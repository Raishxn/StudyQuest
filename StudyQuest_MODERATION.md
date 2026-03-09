# 🛡️ StudyQuest RPG — Plano de Moderação de Conteúdo
## Fórum e Banco de Provas

**Versão 1.0 • 2025**

---

## Sumário

1. [Filosofia de Moderação](#1-filosofia-de-moderação)
2. [O Que é Proibido](#2-o-que-é-proibido)
3. [Sistema de Denúncias](#3-sistema-de-denúncias)
4. [Papéis e Responsabilidades](#4-papéis-e-responsabilidades)
5. [Fluxo de Moderação](#5-fluxo-de-moderação)
6. [Penalidades e Sanções](#6-penalidades-e-sanções)
7. [Moderação Automatizada](#7-moderação-automatizada)
8. [Banco de Provas — Regras Específicas](#8-banco-de-provas--regras-específicas)
9. [Fórum — Regras Específicas](#9-fórum--regras-específicas)
10. [Painel de Moderação](#10-painel-de-moderação)
11. [Métricas e Revisão](#11-métricas-e-revisão)

---

## 1. Filosofia de Moderação

O StudyQuest é uma plataforma acadêmica colaborativa. A moderação existe para **proteger a qualidade do conteúdo e a segurança dos usuários**, não para censurar debates legítimos ou opiniões divergentes sobre conteúdo acadêmico.

**Princípios:**

- **Presunção de boa-fé:** a maioria dos usuários tem intenções legítimas. Punições devem ser proporcionais e graduais.
- **Transparência:** o usuário sempre sabe por que seu conteúdo foi removido ou por que foi suspenso.
- **Apelação:** toda penalidade pode ser contestada através de um canal específico.
- **Contexto acadêmico:** o que seria spam em uma rede social pode ser legítimo aqui (ex: postar várias resoluções da mesma prova).
- **Erros são humanos:** moderadores podem errar; o sistema de apelação existe para corrigir isso.

---

## 2. O Que é Proibido

### 2.1 Proibido no Fórum e no Banco de Provas

**Nível Crítico — Remoção imediata + suspensão:**
- Conteúdo sexual ou pornográfico
- Conteúdo que incite violência, ódio ou discriminação (por raça, gênero, orientação sexual, religião, etc.)
- Divulgação de dados pessoais de terceiros (doxing)
- Conteúdo ilegal (ex: pirataria de software, fraude acadêmica organizada)

**Nível Alto — Remoção + aviso:**
- Spam (conteúdo repetido, links externos sem contexto)
- Publicidade de serviços pagos de "cola" ou "trabalhos prontos"
- Falsas atribuições de autoria (dizer que resolveu uma questão sem ter feito)
- Conteúdo claramente incorreto apresentado como certeza (ex: gabarito errado como definitivo)

**Nível Médio — Aviso + pedido de edição:**
- Grosseria ou ofensas pessoais entre usuários
- Perguntas fora de contexto acadêmico (ex: posts sobre política, entretenimento)
- Metadados claramente incorretos no banco de provas (professor errado, período errado)

### 2.2 Permitido (Não é violação)

- Críticas a professores ou instituições, desde que fundamentadas e sem ofensas pessoais
- Discussões sobre dificuldade de provas ou qualidade de disciplinas
- Compartilhar a mesma prova que já está no banco (sistema detecta duplicata automaticamente)
- Resolução alternativa diferente da marcada como correta
- Perguntas "simples" ou "óbvias" — não existe pergunta proibida por ser "fácil"

---

## 3. Sistema de Denúncias

### 3.1 Como Denunciar

Qualquer usuário autenticado pode denunciar qualquer conteúdo público usando o botão **[Denunciar]** disponível em:
- Posts do fórum
- Respostas do fórum
- Itens do banco de provas
- Comentários no banco de provas
- Perfis de usuário (para conteúdo do avatar ou bio)

### 3.2 Categorias de Denúncia

| Categoria | Descrição | Prioridade gerada |
|-----------|-----------|-------------------|
| Conteúdo inapropriado | Sexual, violento, discriminatório | P1 — Crítico |
| Spam | Conteúdo repetido, propaganda | P2 — Alto |
| Doxing / privacidade | Dados pessoais de terceiros | P1 — Crítico |
| Violação de direitos autorais | Material copiado sem permissão | P2 — Alto |
| Informação incorreta | Gabarito/resolução errada | P3 — Médio |
| Metadados incorretos | Professor/período/matéria errados | P4 — Baixo |
| Outro | Campo de texto livre | P3 — Médio |

### 3.3 Proteção contra Denúncias Maliciosas

- Um usuário pode denunciar o mesmo conteúdo **apenas uma vez**.
- Usuários com padrão de denúncias rejeitadas (>70% em 30 dias) têm sua capacidade de denúncia **limitada temporariamente**.
- Denúncias em massa coordenadas (muitas denúncias do mesmo IP em pouco tempo) são agrupadas e tratadas como uma única.
- Moderadores identificam e sinalizam usuários que abusam do sistema de denúncias.

### 3.4 Feedback ao Denunciante

O usuário que denunciou recebe notificação sobre o resultado:
- "Sua denúncia foi analisada e o conteúdo foi removido." (denúncia procedente)
- "Sua denúncia foi analisada e o conteúdo foi mantido." (denúncia improcedente)
- Sem detalhes sobre a penalidade aplicada ao denunciado (privacidade).

---

## 4. Papéis e Responsabilidades

### 4.1 Hierarquia de Moderação

```
Admin
  └── Gerencia moderadores, define políticas, acesso total ao painel
       │
Moderador Sênior
  └── Trata casos P1/P2, decide apelações, gerencia moderadores júnior
       │
Moderador Júnior
  └── Trata casos P3/P4, aplica avisos, encaminha P1/P2 para sênior
       │
Usuário Comum
  └── Pode denunciar; conteúdo próprio pode ser sinalizado como melhor
       resolução (fórum)
```

### 4.2 Seleção de Moderadores

- Moderadores são selecionados entre usuários ativos (nível 4+, mínimo 3 meses de conta).
- Nenhum moderador pode moderar conteúdo de **sua própria instituição** (conflito de interesse).
- Moderadores passam por onboarding com este documento e um quiz de casos práticos.
- Moderadores inativos por 30 dias têm o role removido automaticamente.

### 4.3 Limites dos Moderadores

O que moderadores **podem** fazer:
- Remover posts, respostas, comentários e uploads
- Aplicar avisos e suspensões temporárias (até 7 dias)
- Editar metadados incorretos no banco de provas
- Marcar resoluções como "verificadas"

O que moderadores **não podem** fazer:
- Suspensões permanentes (apenas admins)
- Ver dados privados dos usuários (e-mail, IP)
- Acessar mensagens de chat
- Moderar conteúdo de suas próprias denúncias (conflito de interesse)

---

## 5. Fluxo de Moderação

### 5.1 Fluxo Geral

```
Denúncia recebida
      │
      ▼
Sistema classifica prioridade automaticamente
      │
      ├── P1 Crítico ──► Notificação imediata para moderador de plantão
      │                   Conteúdo ocultado preventivamente
      │                   SLA: 1 hora
      │
      ├── P2 Alto ──────► Fila de alta prioridade
      │                   SLA: 4 horas
      │
      ├── P3 Médio ─────► Fila padrão
      │                   SLA: 24 horas
      │
      └── P4 Baixo ─────► Fila de baixa prioridade
                          SLA: 72 horas
```

### 5.2 Decisão do Moderador

Para cada item na fila, o moderador vê:
- O conteúdo denunciado com contexto (post completo, thread, perfil do autor)
- Histórico de moderação do autor (avisos anteriores, suspensões)
- Categoria e texto da denúncia
- Quantas denúncias o item recebeu e de quem

Ações disponíveis:

| Ação | Quando usar |
|------|-------------|
| **Manter** — denúncia improcedente | Conteúdo não viola as regras |
| **Avisar** — manter + notificar autor | Violação leve, primeira ocorrência |
| **Editar metadados** | Banco de provas com dados incorretos |
| **Remover conteúdo** | Viola as regras; com ou sem suspensão |
| **Remover + suspender** | Violação grave ou reincidência |
| **Escalar para sênior** | Caso ambíguo ou de alta sensibilidade |

### 5.3 Notificação ao Autor do Conteúdo Removido

Quando um conteúdo é removido, o autor recebe notificação obrigatória com:
- Qual conteúdo foi removido (título ou trecho)
- Motivo da remoção (categoria de violação)
- Se houve suspensão associada, por quanto tempo
- Link para contestar a decisão

Exemplo de mensagem:
```
Seu post "Como burlar a prova de Cálculo" foi removido.
Motivo: Incentivo a fraude acadêmica.
Penalidade: Aviso registrado (1/3 antes de suspensão).
Discorda desta decisão? [Contestar →]
```

### 5.4 Processo de Contestação (Apelação)

```
Usuário clica em [Contestar]
      │
      ▼
Formulário: motivo da contestação (texto livre, máx. 500 chars)
      │
      ▼
Caso vai para moderador SÊNIOR diferente do que tomou a decisão
      │
      ├── Contestação procedente → conteúdo restaurado, aviso removido
      │
      └── Contestação improcedente → penalidade mantida
                                     Usuário notificado com explicação
```

- Prazo para contestar: **7 dias** após a remoção.
- Cada usuário pode contestar **1 decisão por semana**.
- Decisão de contestação é **final** — não há segunda apelação.

---

## 6. Penalidades e Sanções

### 6.1 Sistema de Avisos

O sistema usa um modelo de 3 avisos antes de suspensão:

```
1º aviso → Notificação, sem restrição
2º aviso → Notificação + restrição de upload por 48h
3º aviso → Notificação + suspensão automática de 7 dias
```

Avisos expiram após **90 dias** sem nova infração.

### 6.2 Tipos de Suspensão

| Tipo | Duração | Quem aplica | Motivos |
|------|---------|-------------|---------|
| Temporária leve | 1–3 dias | Moderador | 3º aviso, spam persistente |
| Temporária grave | 4–7 dias | Moderador | Conteúdo inapropriado, reincidência |
| Temporária extendida | 8–30 dias | Moderador Sênior | Violações graves repetidas |
| Permanente | Indefinida | Admin | Crimes, doxing, múltiplas suspensões |

**Durante a suspensão:**
- Usuário pode fazer login e ler o conteúdo.
- Não pode: postar no fórum, comentar no banco, fazer uploads, enviar mensagens.
- Pode: completar sessões de estudo (XP é preservado, acesso ao conteúdo é mantido).
- Pode: contestar a suspensão via formulário.

### 6.3 Banimento Permanente

Casos que resultam em banimento permanente direto (sem escala de avisos):
- Doxing (exposição de dados pessoais de terceiros)
- Conteúdo sexual envolvendo menores
- Ameaças de violência explícitas
- Venda ou promoção de serviços de fraude acadêmica organizada
- Múltiplas suspensões temporárias (mais de 3 em 6 meses)

Banimentos permanentes são registrados com evidências e só podem ser revertidos por admin.

---

## 7. Moderação Automatizada

### 7.1 Filtros Automáticos (Pré-publicação)

Conteúdo passa por verificações automáticas **antes de ser publicado**:

**Filtro de spam:**
- Detecta texto idêntico ou muito similar publicado nos últimos 30 minutos pelo mesmo usuário.
- Detecta links externos suspeitos (domínios de serviços de cola/cheating conhecidos).
- Rate limiting: máximo 5 posts/hora no fórum, 10 uploads/dia no banco.

**Filtro de palavras:**
- Lista de termos proibidos (linguagem ofensiva, slurs).
- Conteúdo com termos da lista é **retido para revisão manual** (não publicado automaticamente).
- Falsos positivos são liberados pelo moderador em até 4h.
- A lista de termos é mantida internamente e atualizada mensalmente.

**Filtro de duplicata (banco de provas):**
- Hash SHA-256 do arquivo comparado com todos os uploads existentes.
- Duplicata exata: bloqueada automaticamente com mensagem ao usuário.
- Arquivos muito similares (>90% de similaridade via perceptual hash): sinalizado para revisão.

### 7.2 Ações Automáticas por Limiar de Denúncias

| Limiar | Ação automática |
|--------|----------------|
| 3 denúncias em 1h | Conteúdo ocultado preventivamente + P1 na fila |
| 5 denúncias de usuários distintos | Ocultado + notificação push para moderador |
| 10 denúncias | Removido automaticamente + revisão retroativa pelo moderador |

Conteúdo ocultado preventivamente ainda é visível para o autor (ele não sabe que foi ocultado) até a decisão do moderador.

### 7.3 Detecção de Comportamento Suspeito

O sistema monitora e sinaliza automaticamente:
- Mesmo usuário criando múltiplas contas (por IP e fingerprint do device).
- Usuários que upvotam mutuamente de forma sistemática (possível farm de upvotes).
- Picos de atividade incomuns (ex: 50 posts em 10 minutos).
- Contas novas com comportamento imediatamente agressivo (provável conta alternativa de usuário banido).

---

## 8. Banco de Provas — Regras Específicas

### 8.1 O Que Pode Ser Enviado

✅ **Permitido:**
- Provas e avaliações de disciplinas universitárias
- Listas de exercícios distribuídas por professores
- Gabaritos oficiais
- Resoluções comentadas (próprias)
- Exercícios de livros didáticos (com identificação clara da fonte)

❌ **Proibido:**
- Provas de concursos públicos com restrição de uso (verificar edital)
- Material claramente privado e não distribuído (ex: provas com marca d'água "CONFIDENCIAL")
- Trabalhos individuais de outros alunos (TCC, monografias, relatórios)
- Provas com gabaritos intencionalmente errados para prejudicar colegas

### 8.2 Direitos Autorais

- Provas criadas por professores são, em tese, obras intelectuais deles. Na prática, há uma **cultura acadêmica estabelecida** de compartilhamento de provas antigas para estudo.
- A plataforma opera na zona de "uso justo educacional" (Art. 46, III da Lei 9.610/98 — citação para fins de ensino).
- Caso um professor ou instituição solicite a remoção de material específico: remover em até **48 horas** após verificação.
- Canal para solicitações de remoção por professores/instituições: `dmca@studyquest.com.br`.

### 8.3 Qualidade do Conteúdo

- Moderadores podem **editar metadados** (sem remover o arquivo) quando professor, matéria ou período estiverem incorretos.
- Material de baixíssima qualidade (foto borrada ilegível, arquivo corrompido): pode ser removido com aviso ao autor para reenviar com melhor qualidade.
- Resoluções podem ser marcadas como **"verificada"** por moderadores que sejam da área do conteúdo.

---

## 9. Fórum — Regras Específicas

### 9.1 Qualidade das Perguntas

- O sistema incentiva boas perguntas mas **não remove perguntas por serem "simples"**.
- Posts marcados como off-topic (não acadêmicos) por 3 moderadores diferentes são movidos para arquivo após 7 dias.
- Perguntas duplicadas recebem aviso e link para a questão original; não são removidas automaticamente.

### 9.2 Respostas e Soluções

- Moderadores **não podem desmarcar** uma solução aceita — apenas o autor do post pode.
- Se uma solução aceita for provada incorreta nos comentários, o moderador pode adicionar uma **nota de aviso** ao post (não remover a marcação).
- Resoluções com erros graves (não apenas abordagem diferente, mas conceitualmente errados) podem ser sinalizadas por moderadores com banner: "⚠️ Esta resolução pode conter erros. Verifique os comentários."

### 9.3 Debates Acadêmicos

- Discordâncias sobre métodos de resolução são **encorajadas** e não são motivo de moderação.
- Debates sobre dificuldade de provas, qualidade de professores ou de disciplinas são **permitidos**, desde que sem ofensas pessoais.
- Críticas construtivas a professores são diferentes de ofensas — moderadores devem avaliar o tom, não o conteúdo da crítica.

---

## 10. Painel de Moderação

### 10.1 Funcionalidades do Painel (`/admin/moderation`)

**Visão geral:**
- Contagem de itens por prioridade na fila (P1/P2/P3/P4)
- Tempo médio de resolução nas últimas 24h
- Denúncias recebidas hoje vs. média dos últimos 7 dias

**Fila de moderação:**
- Lista ordenada por prioridade + tempo na fila
- Filtros: por tipo de conteúdo, por moderador responsável, por status
- Cada item mostra: conteúdo, autor, denúncias, histórico do autor

**Histórico de ações:**
- Log imutável de todas as ações tomadas por moderadores
- Pesquisável por usuário, tipo de ação, data

**Gestão de usuários:**
- Busca por username/e-mail
- Ver histórico de infrações e suspensões
- Aplicar/remover suspensões (dentro dos limites do role)
- Ver uploads e posts do usuário

### 10.2 Estrutura de Dados para Moderação

```prisma
model ModerationReport {
  id          String   @id @default(cuid())
  reporterId  String
  contentType String   // POST | REPLY | BANK_ITEM | COMMENT | USER
  contentId   String
  category    String
  description String?
  status      String   @default("PENDING") // PENDING | REVIEWED | RESOLVED
  priority    String   // P1 | P2 | P3 | P4
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?
  resolvedBy  String?
  action      String?  // KEPT | WARNED | REMOVED | SUSPENDED
  reporter    User     @relation(fields: [reporterId], references: [id])
}

model ModerationAction {
  id           String   @id @default(cuid())
  moderatorId  String
  targetUserId String
  contentType  String?
  contentId    String?
  action       String   // WARN | REMOVE | SUSPEND | UNBAN | EDIT_METADATA
  reason       String
  duration     Int?     // dias de suspensão, se aplicável
  notes        String?  // notas internas do moderador
  createdAt    DateTime @default(now())
  moderator    User     @relation("moderatorActions", fields: [moderatorId], references: [id])
  targetUser   User     @relation("receivedActions", fields: [targetUserId], references: [id])
}

model UserSuspension {
  id        String    @id @default(cuid())
  userId    String
  reason    String
  startAt   DateTime  @default(now())
  endAt     DateTime?  // null = permanente
  appealId  String?
  createdBy String
  user      User      @relation(fields: [userId], references: [id])
}
```

---

## 11. Métricas e Revisão

### 11.1 KPIs de Moderação

| Métrica | Meta | Frequência de review |
|---------|------|---------------------|
| Tempo médio de resolução P1 | < 1h | Diário |
| Tempo médio de resolução P2 | < 4h | Diário |
| Tempo médio de resolução P3/P4 | < 24h / 72h | Semanal |
| Taxa de apelações procedentes | < 10% | Mensal |
| Denúncias resolvidas / total | > 95% em 7 dias | Semanal |
| Falsos positivos do filtro automático | < 5% | Mensal |

### 11.2 Revisão das Políticas

- Este documento é revisado a cada **3 meses** ou após incidentes significativos.
- Moderadores podem sugerir ajustes via canal interno.
- Mudanças que afetam os usuários são comunicadas com **7 dias de antecedência** via banner na plataforma e e-mail para usuários ativos.

### 11.3 Transparência

A plataforma publica **relatórios semestrais de transparência** com:
- Total de denúncias recebidas por categoria
- Total de conteúdos removidos
- Total de contas suspensas e banidas
- Taxa de apelações e resultados

Sem identificação de usuários específicos — apenas dados agregados.

---

*StudyQuest RPG — Plano de Moderação v1.0 • 2025 • Confidencial*
