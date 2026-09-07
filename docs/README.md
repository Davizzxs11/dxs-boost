# DXS Boost 0.8.1

Aplicativo local para Windows 10/11, em português, com C# e WPF sobre .NET Framework 4.8.

Abra **DXSBoost-Setup-0.8.1.exe** e siga a instalação. O app fica disponível no menu Iniciar; o atalho da área de trabalho é opcional. Requer Windows 10/11 de 64 bits e .NET Framework 4.8 ou posterior.

O instalador usa `%LOCALAPPDATA%\Programs\DXSBoost`, somente para sua conta, e registra a desinstalação em Aplicativos instalados do Windows. Preferências, biblioteca e histórico ficam separados em `%LOCALAPPDATA%\DXSBoost` e são preservados ao atualizar ou desinstalar. Iniciar com o Windows continua opcional. Uma escolha já feita na cópia portátil é mantida e o atalho é direcionado à instalação.

Para atualizar, saia do DXS e execute o novo instalador. Uma versão antiga não substitui uma mais recente na mesma pasta. O instalador e o app principal não pedem administrador; o auxiliar da captura de FPS pede quando necessário.

**Atualizações pela aba Sobre:** o verificador está implementado, mas esta edição de teste ainda não tem canal publicado. Nenhum aviso de atualização online será oferecido até o autor distribuir uma versão com esse endereço. A busca ao abrir é opcional. Quando houver canal, o download abre no navegador e o usuário escolhe quando instalar.

**Distribuição para teste:** o instalador ainda não tem assinatura digital. Nenhuma proteção do Windows precisa ser desativada pelo app. O código-fonte e os testes acompanham o arquivo separado de código-fonte, incluindo os scripts em `installer` para gerar outras versões.

No pacote de código-fonte também é possível abrir `DXSBoost.exe` diretamente, mantendo `lib`, `tools` e o `.config` na mesma pasta.

## Novidades desta versão

### Alertas durante o jogo

Em **Opções → Alertas discretos de temperatura e FPS**, ative os avisos e defina seus limites. O padrão é GPU acima de 85 °C ou FPS abaixo de 45 durante pelo menos 8 segundos, com intervalo mínimo de 120 segundos entre avisos. Os avisos ficam seis segundos na tela, sem som, sem tomar foco e sem bloquear cliques.

Ativar inicia o monitoramento da aba Jogos. A captura de FPS pode pedir permissão para o auxiliar elevado. Avisos dependem de leituras válidas e do aplicativo acompanhado em primeiro plano. Alt-Tab, troca de processo, falta de dados e interrupções da amostragem reiniciam a contagem de persistência. Os limites são preferências pessoais, não uma avaliação de segurança do hardware. A temperatura disponível é a da GPU. Jogos em tela cheia exclusiva podem ocultar os avisos; use janela ou janela sem bordas.

### Consumo de CPU e RAM

A nova aba **Consumo** lista até 40 processos por ordem de uso de CPU ou memória. Atualiza a cada dois segundos enquanto a aba está aberta. CPU considera todos os núcleos e precisa de duas leituras; RAM representa memória residente, incluindo partes compartilhadas.

**Fechar** pede confirmação e solicita o fechamento normal de um aplicativo com janela. Salve seus documentos e partidas antes. O programa pode pedir para salvar ou permanecer aberto. O DXS não força o encerramento, não fecha processos automaticamente e verifica novamente a identidade antes da solicitação. Processos protegidos, sem janela, do Windows, de outra sessão ou o próprio DXS não oferecem essa ação.

### Biblioteca com favoritos e histórico

Em **Game On**, busque pelo nome, filtre por loja ou exiba só favoritos. A estrela fica salva e é preservada ao buscar novamente as instalações.

**Detalhes** abre a página do jogo com o perfil atual do Game On, a instalação, as sessões acompanhadas e os resumos dos benchmarks. O histórico de partidas cobre o período acompanhado com Game On ativo; não reconstrói horas jogadas antes de abrir o DXS. Os benchmarks gravados em Jogos são associados pelo caminho do executável, independentemente de o Game On estar ligado. Cadastre o jogo antes de gravar. São mantidos até 300 registros locais no total; a página exibe os 40 mais recentes daquele jogo. Sessões interrompidas sem encerramento registrado não recebem uma duração final inventada.

O perfil de otimização continua sendo Alto desempenho quando disponível e prioridade Acima do normal quando permitida, com restauração ao terminar. Esta versão não inclui novos perfis individuais nem comparação automática entre benchmarks.

### Iniciar com o Windows

Em **Opções → Iniciar com o Windows, na bandeja**, ative se desejar. A opção começa desligada e cria somente um atalho do DXS na pasta Inicializar da sua conta. Ela também ativa a bandeja. Desativar remove esse atalho, sem mexer em outros programas.

Escolha uma pasta fixa antes de ativar. Se mover o DXS ou extrair uma nova versão em outra pasta, ative novamente na nova cópia para atualizar o caminho. O Windows pode suspender o início automático em Aplicativos de inicialização. Game On, contador e alertas seguem suas preferências; habilitar a inicialização não liga automaticamente a otimização nem os alertas. A opção funciona ao entrar na conta, não como um serviço do sistema.

## Funções preservadas

Limpeza com análise e confirmação, planos de energia com restauração, diagnóstico de configurações, FPS e estatísticas de quadros, benchmark e CSV, sensores da GPU e ventoinhas, biblioteca Steam/Epic/GOG/Ubisoft, temas claro/escuro/Windows, tela cheia, animações, contador configurável e atividade local.

Limpeza recupera espaço em disco. Não há garantia de aumento de FPS ou de RAM livre. Ventoinhas são apenas lidas; nenhuma curva é alterada. O app principal continua sem exigir administrador; somente `tools/DXSFps.exe`, usado na captura de FPS, solicita essa permissão.

## Dados e privacidade

Preferências e registros ficam em `%LOCALAPPDATA%/DXSBoost`. O arquivo novo `biblioteca-historico.xml` guarda os resumos por jogo. Favoritos ficam em `game-on-jogos.xml`; os limites dos alertas, em `opcoes.xml`. Não há conta, envio de telemetria ou serviço instalado. O CSV do benchmark é salvo no local escolhido pelo usuário. A migração da marca antiga permanece compatível.

## Compilar e testar

No PowerShell, na pasta extraída:

```powershell
.\compilar.ps1
.\compilar.ps1 -Testar -DiretorioTestes 'C:\pasta\testes-dxs'
```

Os testes usam pastas próprias, energia e prioridades simuladas. O fechamento normal é verificado apenas sobre um processo filho criado pelo teste. Os testes de inicialização escrevem atalhos em pastas de teste, sem cadastrar o DXS no início real do Windows. A suíte precisa permitir comunicação local entre processos; ambientes isolados podem bloquear os canais do auxiliar. Os resultados desta entrega estão em `VALIDACAO.txt`.

Novos fontes: `GameAlerts.cs`, `ProcessUsage.cs`, `Startup.cs`, `LibraryHub.cs` e `ExtrasUi.cs`.
