Se você passou mais de dez minutos no Twitter ou no Hacker News em abril de 2026, provavelmente viu alguém postar print do repositório Hermes Agent com um número absurdo de estrelas no GitHub. No dia em que escrevo isto, o [repositório oficial](https://github.com/NousResearch/hermes-agent) já passa de 160 mil. Seis semanas antes, era zero.

Isso não é só curiosidade de open source. Em 10 de maio, o Hermes apareceu no topo do ranking **diário** de tokens da [OpenRouter](http://www.techtimes.com/articles/316694/20260515/nous-researchs-hermes-agent-dethrones-openclaw-worlds-most-used-open-source-ai-agent.htm) com cerca de 224 bilhões de tokens processados num único dia, à frente do OpenClaw. Desenvolvedores estão votando com compute, não só com star.

A pergunta que importa pra quem mantém código de verdade: isso é ferramenta que vale instalar esta semana, ou mais um ciclo de hype que vai cansar quando surgir o próximo agente com README bonito?

## Antes de tudo: Hermes Agent não é o mesmo que Hermes 3

A Nous Research usa o nome Hermes em duas linhas diferentes, e a confusão alimenta metade do barulho.

**Hermes 3** é a família de modelos instruct lançada em agosto de 2024. São fine-tunes de Llama 3.1 (8B, 70B, 405B) com foco em function calling, RAG e uso agentic. Os pesos estão no [Hugging Face](https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B); o [technical report](https://nousresearch.com/wp-content/uploads/2024/08/Hermes-3-Technical-Report.pdf) descreve steerability forte via system prompt e integração com o padrão Hermes Function Calling.

**Hermes Agent** é outra coisa: framework open source em Python (MIT) para rodar um agente autônomo 24/7, com memória persistente, skills reutilizáveis e gateway em dezenas de canais. Lançado em **25 de fevereiro de 2026**. O hype de 2026 é quase todo sobre o Agent.

Se alguém te mandou "testa o Hermes" sem contexto, pergunte qual dos dois. Rodar `Hermes-3-Llama-3.1-8B` no Ollama é experimento de modelo. Clonar `hermes-agent` é mudar como você opera automação no dia a dia.

## O que o Hermes Agent promete (e como tenta cumprir)

O pitch central da [Nous Research](https://github.com/NousResearch/hermes-agent) é contrário ao chat que reinicia a cada sessão: **o agente deveria ficar melhor quanto mais você usa**, não resetar o contexto como se nada tivesse acontecido.

Na prática isso se decompõe em três mecanismos que aparecem tanto no README quanto no [relatório Hermes Atlas de abril](https://hermesatlas.com/reports/state-of-hermes-april-2026):

**Loop de aprendizado com skills.** Depois de tarefas complexas (debug de microserviço, refatoração, pesquisa repetitiva), o agente pode sintetizar um documento de skill em Markdown seguindo o padrão [agentskills.io](https://agentskills.io). Na próxima vez que um problema parecido aparecer, ele carrega a skill em vez de raciocinar do zero. Existe até um projeto irmão, [hermes-agent-self-evolution](https://github.com/NousResearch/hermes-agent-self-evolution), que usa DSPy + GEPA para evoluir skills e prompts com avaliação (~US$ 2–10 por run, segundo a doc). A promessa de "self-improving" ainda depende de benchmarks públicos; hoje a evidência mais forte é anedótica e arquivos `.md` que você pode abrir no disco.

**Memória em camadas, com limite deliberado.** O agente mantém `MEMORY.md` (notas do agente) e `USER.md` (perfil do usuário) com tetos rígidos (por volta de 2.200 e 1.375 caracteres no relatório Atlas). Abaixo disso, sessões em SQLite com FTS5 para buscar conversas antigas. Acima, plugins de memória externa (Honcho, Mem0, Hindsight, Supermemory, entre outros listados no ecossistema). A aposta da Nous é oposta ao "joga tudo no contexto": **memória limitada força consolidação**, e consolidação deveria gerar priors melhores. Faz sentido teoricamente; na prática você só sente depois de duas ou três semanas de uso contínuo, como relatos em fóruns descrevem.

**Gateway unificado.** Um daemon pode atender CLI, Telegram, Discord, Slack, WhatsApp, Signal, Matrix, Mattermost e mais, com a mesma sessão e a mesma memória. Você começa no terminal, continua no Telegram, pede para avisar o time no Slack. Para quem quer agente "sempre ligado" fora do laptop, isso pesa mais que mais 10 mil stars.

O runtime é agnóstico de modelo: OpenRouter (200+), Nous Portal, Anthropic, OpenAI, Gemini, Ollama, vLLM, NIM da NVIDIA. Backends de execução vão de processo local a Docker, Modal, Daytona. A [NVIDIA destacou o agente](https://blogs.nvidia.com/blog/rtx-ai-garage-hermes-agent-dgx-spark/) rodando local em RTX e DGX Spark com modelos compactos tipo Qwen 3.6 35B, o que reforça o ângulo "agente na sua máquina", não só na nuvem.

## Os números por trás do hype (e o que eles não provam)

Números chamam atenção. Interpretação errada gera decisão ruim.

| Sinal | Ordem de grandeza (maio 2026) | O que sugere | O que não prova |
|-------|------------------------------|--------------|-----------------|
| GitHub stars | 57k em ~6 semanas (Atlas); 160k+ depois | Interesse da comunidade, forks, PRs | Produção estável no seu repo |
| Crescimento semanal de stars | ~9,5k/semana vs ~3k OpenClaw (Atlas) | Momento de adoção | Sustentação em 12 meses |
| Tokens OpenRouter (dia) | 224B Hermes vs 186B OpenClaw (10/mai) | Workload novo indo para Hermes | OpenClaw ainda lidera acumulado (~9T vs ~6T) |
| Ecossistema | 80+ repos satélite (Atlas) | Network effect inicial | Qualidade e segurança de cada skill community |

Stars são proxy de narrativa. Tokens diários na OpenRouter são proxy mais forte de **uso real com API paga ou roteada**, mas ainda assim agregado: não diz nada sobre seu caso (monorepo legado, compliance, time pequeno).

O timing ajudou. Em abril, a Anthropic restringiu OpenClaw em assinaturas Claude Code; a Nous respondeu com ferramenta de migração (`hermes claw migrate`) e tweet que viralizou. Crise de confiança num concorrente + produto que já estava quente = inflexão visível nos gráficos. Isso é estratégia de mercado, não prova técnica definitiva.

## Hermes, OpenClaw e Claude Code: três ferramentas, três jobs

A comunidade insiste em frame "quem vence". O quadro útil é outro.

**Claude Code** continua sendo o melhor par programador dentro do IDE quando você quer fluxo de código focado com integração profunda no editor. Não compete com "agente rodando no VPS mandando mensagem no Telegram".

**OpenClaw** ainda ganha em amplitude de canais (22+) e marketplace maduro de skills estáticas (milhares no ClawHub). Arquitetura gateway-first em Node encaixa bem em operações de time que querem um bot em todo lugar.

**Hermes Agent** empurha o diferencial no **loop de aprendizado** e memória curada para trabalho de longo prazo: cron, tarefas noturnas, automações que acumulam skill específica do seu fluxo.

O consenso que aparece em análises como o [State of Hermes](https://hermesatlas.com/reports/state-of-hermes-april-2026) e reviews práticos: são **complementares**. Setup típico citado: Claude Code no IDE, Hermes para automação pessoal que aprende, OpenClaw ou bots nativos para ops ampla do time.

Se você só precisa de autocomplete melhor no VS Code, nenhum dos três resolve sua dor principal. Se você quer um processo que roda de madrugada e lembra como você gosta de PR description, Hermes entra no radar.

## Segurança: onde o hype encontra a parede

Agente com shell, filesystem e 14 superfícies de mensagem não é brinquedo. A documentação de [segurança do Hermes](https://hermes-agent.nousresearch.com/docs/user-guide/security) é mais explícita que muitos projetos concorrentes: sete camadas (allowlist de usuário, aprovação de comandos perigosos, isolamento em container, filtro de credenciais MCP, scan de injeção em arquivos de contexto, isolamento entre sessões, sanitização de paths).

Mesmo assim, a superfície de ataque é grande.

A [Cloud Security Alliance](https://labs.cloudsecurityalliance.org/research/csa-research-note-hermes-agent-cves-20260504-csa-styled/) listou CVEs em componentes (path traversal em adaptadores, symlink em file tools, WebUI antes de v0.50.34) com CVSS moderado, e contrastou com a crise de CVEs críticos do OpenClaw em março. Auditoria independente em v0.8.0 (abril) reportou achados Critical/High em config default sem CVE atribuído ainda.

Issue pública [#30882](https://github.com/NousResearch/hermes-agent/issues/30882) descreve cenário grave: `approvals.mode: manual` **silenciosamente ignorado** em gateway sem TTY (Feishu, Telegram, etc.), com bypass adicional via `execute_code` que não passa pelos regex de comandos perigosos. Para quem pensa em bot exposto na internet, isso é showstopper até patch e config fail-closed.

Lições operacionais que valem independente do hype:

**Backend em container** (`docker`, `modal`, `daytona`) para produção, não processo local no laptop com credenciais reais.

**Gateway com allowlist apertada** e DM pairing; nunca `GATEWAY_ALLOW_ALL` em ambiente sério.

**Tratar skills de terceiros como código não confiável** (o projeto até menciona scan de pacotes comprometidos no venv).

**Assumir que o LLM adversarial é o modelo de ameaça**, não só "usuário malicioso". A frase da doc resume: a única fronteira forte contra LLM adversarial é o sistema operacional isolado.

Comparar com OpenClaw não é "Hermes é seguro, OpenClaw não". Os dois exigem operador paranoico. A diferença é que Hermes documenta o deployment que a maioria das pessoas realmente faz (VPS + Telegram), enquanto parte do ecossistema OpenClaw passou meses tratando hardening como escopo opcional até os CVEs forçarem a conversa.

## O que eu faria se estivesse avaliando agora

Não instalaria Hermes Agent no mesmo host que guarda secrets de produção na primeira tarde. Trataria como **experimento de duas semanas** em VM descartável ou máquina local sem acesso à rede interna.

Passo a passo enxuto:

1. Clonar [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) e ler a doc de security antes do quick start.
2. Subir com backend containerizado e modelo barato via OpenRouter ou Ollama local.
3. Rodar uma tarefa repetitiva real (ex.: gerar changelog a partir de commits, triagem de issues, relatório de CI) pelo menos cinco vezes e inspecionar se skills novas em `~/.hermes/skills` realmente economizam tokens/tempo.
4. Medir latência: relatos citam queda brutal de tokens/s quando o harness adiciona camadas vs modelo direto no LM Studio. Se ficar em 1–2 tok/s, o gargalo é o runtime, não o modelo.
5. Só então conectar um canal externo (Telegram) com allowlist de um único user ID.

Se após duas semanas as skills acumuladas não mudarem nada mensurável, você aprendeu que o hype era UX de memória, não ganho de produtividade. Se mudarem, você tem um ativo portável (Markdown agentskills.io) que sobrevive a troca de modelo.

## Hype justificado ou narrativa adiantada?

Hermes Agent chegou num momento em que devs estão cansados de agentes que esquecem tudo. A Nous apostou em memória **limitada e curada** em vez de contexto infinito, e a comunidade respondeu com velocidade rara de stars e tokens.

Isso é real o suficiente para prestar atenção. Não é real o suficiente para substituir revisão humana em código crítico, nem para ignorar CVEs e issues de approval em gateway.

O hype do Hermes, para mim, é menos "o agente que mata o OpenClaw" e mais **primeiro framework grande que trata aprendizado entre sessões como feature de primeira classe**, com ecossistema crescendo em velocidade de startup e dívida técnica de startup.

Se você trabalha com IA no dia a dia, vale clonar, testar em sandbox e decidir com números do seu fluxo. Se você só quer acompanhar o mercado, acompanhe os tokens diários da OpenRouter e os advisories de segurança: são sinais melhores que estrela no GitHub.

**Próximo passo:** escolha uma tarefa chata que você repete toda semana, rode no Hermes por dez dias com memória ligada, e compare tempo e custo de tokens com o mesmo prompt no Claude Code ou no Cursor sem agente persistente. O resultado dessa planilha vale mais que qualquer thread viral.

### Fontes

- [Hermes Agent (GitHub)](https://github.com/NousResearch/hermes-agent)
- [State of Hermes Agent — April 2026](https://hermesatlas.com/reports/state-of-hermes-april-2026)
- [Security — Hermes Agent docs](https://hermes-agent.nousresearch.com/docs/user-guide/security)
- [NVIDIA Blog — Hermes Agent](https://blogs.nvidia.com/blog/rtx-ai-garage-hermes-agent-dgx-spark/)
- [Hermes 3 — Hugging Face](https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B)
- [Issue #30882 — approvals bypass](https://github.com/NousResearch/hermes-agent/issues/30882)
- [CSA — Hermes Agent CVEs note](https://labs.cloudsecurityalliance.org/research/csa-research-note-hermes-agent-cves-20260504-csa-styled/)
