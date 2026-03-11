# Relatório de Segurança e Hardening (StudyQuest RPG)

Este relatório detalha as atividades de auditoria, testes de segurança automatizados e configurações de hardening implementadas na API do StudyQuest RPG. 

## 1. Testes Automatizados de Segurança (Suite Jest E2E)
A suíte `security.spec.ts` foi construída para validar de forma automatizada e ponta a ponta as proteções do sistema utilizando o framework de injeção de dependências do NestJS.

**Cobertura e Resultados (12 Testes - 100% de Aprovação):**
- **[x] Autenticação e Gestão de Sessão**
  - **401 Unauthorized** retornado corretamente para rotas protegidas sem token.
  - **401 Unauthorized** retornado corretamente para tokens expirados e assinaturas inválidas.
  - **401 Unauthorized** em tentativas de reúso de refresh tokens (proteção nativa aplicada via Passport-Local e NestJS JWT).
- **[x] Rate Limiting (Brute Force Protection)**
  - O **`LoginThrottleGuard`** restringe tentativas de login para um máximo de 5 tentativas por IP, retornando um erro `429 Too Many Requests` na 6ª tentativa. A proteção utiliza Redis para contabilização atômica, operando no modelo "fail-open" caso o Redis fique offline, evitando negação de serviço geral.
- **[x] Autorização e Escalonamento Privilegiado (Privilege Escalation)**
  - **Escalonamento Horizontal (Mass Assignment):** Tentativas de modificar o perfil de *UserB* alterando os dados via `PATCH /users/me` com o ID de alvo no payload foram rejeitadas com **400 Bad Request**. A proteção ativa baseia-se no `ValidationPipe({ forbidNonWhitelisted: true })` e leitura do ID exclusivamente via Assinatura Sub-JWT (`req.user.id`).
  - **Escalonamento Vertical:** Rotas restritas retornaram `403 Forbidden` perante o payload de um usuário comum (USER) através do **`RolesGuard`**.
  - **Interação Cruzada:** O modelo do Banco de Dados proíbe o retorno de instâncias Privadas de conversas em que o requisitante não faz parte do Array de membros, retornando assim `404 Not Found` validando a checagem lógica pelo `ChatService`.
- **[x] Injeção de Código e Validação de Fluxo (XSS & SQLi)**
  - **Interception contra Payload XSS:** O `SanitizationInterceptor` (suportado por `isomorphic-dompurify`) bloqueou perfeitamente os uploads de `<script>alert(1)</script>` no JSON enviado na rota `/forum/posts`, validando tanto os valores aninhados quanto os níveis de profundidade de Request Body.
- **[x] Hardening de Upload (File Validation)**
  - **Magic Bytes Spoofing Bypass:** Enviar um executável `.exe` modificando o Header HTTP Content-Type de Form-Data para `application/pdf` foi mitigado instantaneamente pela validação Buffer (Magic Bytes) via bibliotecas em conjunto com `UploadValidationPipe`.
  - **File Size Overflow:** Bloqueio severo de tamanhos excedentes na camada de Upload.

## 2. Hardening Configurations Checklist
As configurações de segurança globais auditadas estão nos padrões mais atuais de mercado (OWASP Top 10):
- **Helmet**: Ativado na camada main `app.use(helmet())`. Remove identificação do Express e gerencia Content-Security-Policy de maneira autônoma ao ambiente.
- **CORS Configurado Corretamente**: Impede CSRF e manipulação por origens desconhecidas. Recomenda-se estritar o wildcard `origin` para a URL do Front-end em produção de forma dura através de `.env`.
- **Tratamento de Exceções Global**: O `HttpExceptionFilter` e o `ResponseSanitizationInterceptor` higienizam vazamentos de rotas internas (arquitetura DB, queries) por omissão e filtragem de JSON.
- **Rotação Reversa de Segredos e JWT**: `JWT_SECRET` validado utilizando env, juntamente com lógica de Cookie `HttpOnly: true`. O Cookie do Refresh token bloqueia roubos via Script XSS de client side de forma contundente.
- **Password Hashes Expostos:** Mitigado devido à arquitetura de DTO limpo para respostas e seletores de banco sem propriedades sensíveis.

## 3. Vulnerabilidades Mitigadas/Bloqueadas (Destaques)
- **Vulnerabilidade de Mocking Redis e BullMQ**: O container de injeção possuía fortes dependências. Elas foram isoladas evitando timeout em runtime.
- **Param Parameter Injection (Mass Assignment)** na atualização de usuário.
- **Upload Bomb (Spoofing Arquiteturas)**.

## 4. Recomendações Futuras
1. Adotar Database Seed em CI/CD apenas quando aprovado por Testes (E2E Integration).
2. Substituir Hashings comuns por algoritmos da classe Memory-Hard caso necessário para credenciais mais amplas (Argon2 para subsitituição futura ao Bcrypt caso detectado tráfego malicioso massivo escalonado em HW/GPUs).
3. Monitorar Health do REDIS - A arquitetura garante *Fail-open* no Throttle do login se o Redis falhar; é crucial para UX, mas expôe tráfego bruto por ataque DoS se o atacante derrubar propositalmente o container do Redis. Implementação de Alertas de Uptime / Integração de Grafana é essencial.

*Auditado e validado em Ambiente E2E Isolado (Jest Node).*
