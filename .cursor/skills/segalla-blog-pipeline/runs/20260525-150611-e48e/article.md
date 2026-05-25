## Por que agente local parece barato e quebra na terceira ferramenta

Semana passada eu estava testando um fluxo agentic rodando Ministral 8B via Ollama numa máquina que aguenta o modelo sem suar. Primeiro passo: ler um arquivo de config. Segundo: gerar um patch pequeno. Terceiro: rodar um comando no terminal. Na demo mental, funciona. Na prática, o agente inventou um flag que não existe, o terminal retornou erro, e o loop seguiu como se tivesse dado certo.

Isso não é raro. É o comportamento default de modelos pequenos em workflows multi-step. A conta de API fica zerada, mas o tempo que você gasta debugando o debug do agente compensa qualquer economia.

O Hacker News explodiu essa semana com o [Forge](https://github.com/antoinezambelli/forge), framework open source que promete levar um modelo 8B de cerca de 53% para 99% em tarefas agentic **sem trocar o modelo**. Só mudando o sistema ao redor dele: guardrails, parsing de tool calls quebrados, retry com contexto, enforcement de passos obrigatórios.

Soou exagerado quando li. Depois bati com a matemática que eu tinha ignorado.

## A matemática que ninguém faz na planilha

Agente de código não falha num único passo isolado. Ele falha numa **cadeia** de passos. Se cada chamada de ferramenta tem 90% de chance de acertar (número otimista para modelo local em task real), um workflow de cinco etapas termina com:

`0,9 × 0,9 × 0,9 × 0,9 × 0,9 = 0,59`

Ou seja, **41% de chance de falhar** em algum ponto. Não importa se o modelo "parece inteligente" no chat. Importa se ele sustenta cinco decisões seguidas sem se perder.

Antoine Zambelli, autor do Forge, descreve exatamente esse problema no [Show HN](https://news.ycombinator.com/item?id=48192383): queria agentes always-on no portfólio, não queria pagar frontier API o tempo todo, e bateu na parede da confiabilidade mecânica. Nenhum framework popular parecia tratar isso como problema de engenharia. Tratavam como problema de prompt.

O paper aceito no ACM CAIS 2026 (apresentação 26–29 de maio em San Jose) testou 97 configurações de modelo/backend, 18 cenários, 50 runs cada. Os números que circularam na discussão: Ministral 8B com Forge chegou perto de 99%, enquanto o mesmo modelo sem guardrails ficava na faixa de 53%. Vale ler o thread com ceticismo, mas a direção faz sentido: **infraestrutura de confiabilidade importa mais que tamanho do modelo** quando o assunto é tool calling local.

## O que são guardrails de verdade

Guardrail não é "colocar no system prompt que o modelo deve ser cuidadoso". Isso todo mundo já tentou.

No Forge, guardrail é código que intercepta o loop agentic:

**Rescue parsing:** quando o modelo devolve JSON malformado ou tool call inválido, o framework tenta recuperar em vez de passar lixo adiante.

**Retry nudges:** após erro de ferramenta, o agente recebe contexto estruturado para tentar de novo, não um stack trace cru que modelo pequeno ignora.

**Step enforcement:** você pode marcar passos obrigatórios (`required_steps`, `terminal_tool`) quando o fluxo não pode pular etapa.

**Context compaction consciente de VRAM:** Ollama e Llamafile caem pra CPU sem avisar quando estouram memória. Forge trata budget de contexto como constraint de hardware, não detalhe.

Três formas de usar, conforme o [repositório](https://github.com/antoinezambelli/forge):

**Proxy mode:** `python -m forge.proxy` fica entre seu client (Continue, aider, OpenCode) e o servidor local. O client acha que fala com um modelo mais competente. É o entry point mais popular.

**WorkflowRunner:** você define tools, escolhe backend (Ollama, llama.cpp, Anthropic), e deixa o Forge gerenciar o loop completo.

**Middleware:** pluga guardrails num agente que você já tem via `GuardrailsAgent`.

O ponto não é "Forge resolve tudo". O ponto é que **confiabilidade agentic virou camada de produto**, assim como observabilidade virou camada depois que microserviços saíram do hype.

## Plano antes de código: o outro guardrail que falta no seu workflow

Guardrail no loop de execução resolve uma fatia. Outra fatia é **nunca deixar o agente codar antes de você concordar com o plano**.

Microsoft e VS Code empurraram isso de forma explícita em 2026. O [Plan agent](https://code.visualstudio.com/docs/copilot/agents/planning) no VS Code gera plano de implementação e verificação antes de tocar arquivo. Você itera no plano, responde perguntas de clarificação, e só então manda implementar. Atalho: `/plan` seguido da tarefa.

No Visual Studio, o fluxo é parecido: plano salvo em `.copilot/plans/plan-{titulo}.md`, editável no editor, compartilhável com o time. Implementação só quando você clica em "Implement plan". Nada de diff surpresa no meio do almoço.

Isso parece burocracia até você lembrar quantas vezes um agente refatorou o arquivo errado porque interpretou mal o escopo. Plano é guardrail de **intenção**. Forge é guardrail de **execução**. Os dois juntos cobrem metade do que times maduros fazem em code review humano.

## Agent ops mínimo que funciona em time pequeno

Ferramenta nova não substitui hábito velho. [Jenuel Dev](https://dev.to/jenueldev/ai-coding-agents-are-growing-up-most-workflows-are-not-4khn) resume bem: agentes cresceram, workflows da maioria não.

O pacote mínimo que eu uso e recomendo:

**Branch dedicada** pra qualquer sessão agentic. Nunca `main` direto.

**Diff antes de rodar.** Ler o patch como se fosse PR de estagiário confiante.

**Secrets fora do alcance.** `.env` fora de contexto, MCP servers com permissão mínima. Quem usa MCP em produção já descobriu que um agente pode queimar 80% do budget diário sozinho; [quotas por agente](https://dev.to/muskan_8abedcc7e12/per-agent-quotas-for-mcp-the-token-budget-that-stopped-one-agent-from-burning-80-of-the-daily-38o7) deixaram de ser luxo.

**Testes rodados por humano** antes de merge. Agente que "passou nos testes" muitas vezes rodou o comando errado e interpretou stdout com criatividade.

**Log do que aconteceu.** Langfuse, traces do próprio IDE, ou anotação manual. Quando quebra em prod, você precisa saber qual tool call iniciou a cascata.

Enquanto isso, open source apanha do lado oposto. O time da [Archestra](https://archestra.ai/blog/only-responsible-ai) documentou issue com bounty de $900 virando 253 comentários, a maioria lixo de bot. PRs sem teste, planos de implementação genéricos, maintainers gastando meio dia por semana limpando spam. A solução deles foi drástica: onboarding com CAPTCHA, whitelist de contribuidores, commit `--author` pra elevar quem passou no processo a "prior contributor" no GitHub.

Não é só irritante. É risco de segurança. Prompt injection escondido em issue ou README pode instruir um agente a exportar variável de ambiente. Isso já deixou de ser teoria.

## Limitações e o que ainda é hype

Ser honesto sobre o que este artigo **não** diz:

Os números do Forge vêm do eval do próprio projeto. Independentemente de metodologia sólida (paper peer-reviewed ajuda), reproduza no **seu** repo antes de apostar produção nele.

Modelo local continua pior em raciocínio longo, arquitetura distribuída, e código que exige contexto de negócio que não está no repositório.

Guardrail não corrige prompt ruim. Se você pede "melhora o sistema" sem critério de aceite, o agente vai melhorar algo. Talvez não o que importa.

Plan agent e Forge são peças de um quebra-cabeça maior. [Arquitetura code-first](https://sdtimes.com/ai/from-llm-first-to-code-first-lessons-from-building-enterprise-ai-systems/) (validação determinística, schema, contratos) ainda ganha de "deixa o LLM decidir tudo" em sistema enterprise. IA fica dentro de boundary, não no volante.

E sim, parte do barulho em maio de 2026 ainda é hype de "8B bate frontier". Leia o thread inteiro, não só o título. O que ficou comigo não foi marketing. Foi a ideia de que **confiabilidade composta** merece engenharia dedicada.

## O que testar amanhã no seu repo

Se você já roda agente local ou paga API frontier com tool calling, três experimentos concretos:

**1. Meça a taxa de sucesso por passo.** Pegue as últimas 20 sessões agentic. Quantas ferramentas foram chamadas? Quantas falharam? Faça a conta composta. O número assusta.

**2. Separe plano de implementação.** No VS Code, `/plan` numa refatoração real. Edite o markdown gerado. Só implemente depois de concordar com cada passo.

**3. Prova o Forge em proxy mode** se você usa Ollama ou llama.cpp. Um fim de semana, um repo side project, mesmo client de sempre. Compare diff quality e taxa de retry antes/depois.

O mercado brasileiro já refletiu a mudança de expectativa: [vagas pedem IA generativa](https://vaganerd.com/artigos/inteligencia-artificial-desenvolvedores-2026/), mas continuam pedindo arquitetura, segurança e julgamento. Velocidade de digitação virou commodity. Saber **o que aceitar, o que rejeitar e o que testar** é o que separa quem usa agente de quem depende de agente.

Modelo local barato sem guardrail é economia falsa. Frontier caro sem plano e sem review é aposta falsa. O meio termo chato, com branch, diff, quota e framework de confiabilidade, é onde o trabalho real está em 2026.

Se quiser trocar setup de agente ou revisar workflow de time, estou no [LinkedIn](https://www.linkedin.com/in/gabrielrsegalla/).
