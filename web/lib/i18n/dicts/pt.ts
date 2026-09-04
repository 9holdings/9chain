import type { Dict } from '../en';

/**
 * Português — tradução automática, sem revisão humana.
 * O idioma de origem é o inglês (`../en.ts`); em caso de divergência, o inglês prevalece.
 *
 * 🔴 Não suavize estes três trechos: `reGenesis.*` (a rede será apagada),
 * `deChain.soatMoTa` (porta de mão única), `chainCuaToi.thuHoiY*` (revogar não devolve
 * o nome). Eles dizem "permanente" e "não pode ser alterado" para impedir que alguém
 * perca seus ativos achando que dá para voltar atrás.
 */
export const pt: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: 'Testnet pública da 9Chain — uma rede independente rodando o motor Avalanche',
    tagline: 'uma rede independente no motor Avalanche',
    walletRejected: 'Você recusou a solicitação na sua carteira. Nada mudou.',
    loading: 'Carregando…',
    retry: 'Tentar de novo',
    copy: 'Copiar',
    copied: 'Copiado',
    close: 'Fechar',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    switchToDark: 'Mudar para o modo escuro',
    switchToLight: 'Mudar para o modo claro',
    skipToContent: 'Pular para o conteúdo principal',
    stepDone: ' — concluído',
    stepRunning: ' — em curso',
    stepFailed: ' — falhou',
    stepPending: ' — pendente',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',
    banner: 'A A1 foi reconstruída em {date}. Todos os saldos e cadeias criados antes dessa data não existem mais.',
    bannerLink: 'O que isso significa',
    badge: 'Reconstruída',
    title: 'A A1 foi reconstruída em {date}',
    desc:
      'A rede de testes A1 foi reconstruída a partir do bloco 0. Cadeias, saldos e histórico de ' +
      'transações criados antes dessa data não existem mais — não estão ocultos, sumiram. ' +
      'Esta página explica o que você está vendo e o que fazer.',
    willSeeTitle: 'O que você vai ver',
    willSee1:
      'Sua carteira ainda conecta, ainda mostra o nome de rede correto e o mesmo Chain ID ' +
      '{chainId} — isso foi proposital. Mas seu saldo será 0.',
    willSee2:
      'Todas as L1 que você lançou sumiram do diretório. Os nomes e Chain IDs delas ficaram livres ' +
      'de novo, e qualquer pessoa pode pegá-los.',
    willSee3:
      'Se você assinou uma transação e nunca a transmitiu, não a transmita agora — ela pertence a ' +
      'uma rede que não existe mais.',
    toDoTitle: 'O que você precisa fazer',
    toDo1: 'Peça tokens de teste na torneira de novo. Os limites foram zerados para todos.',
    toDo2:
      'Remova da sua carteira cada L1 antiga separadamente — elas têm Chain IDs próprios e agora ' +
      'apontam para o vazio. A rede principal A1 NÃO precisa ser removida; as configurações dela não mudaram.',
    toDo3: 'Lance sua cadeia de novo se precisar dela. Outra pessoa pode ter pegado o nome antigo.',
    archiveTitle: 'Arquivo da rede antiga',
    archiveDesc:
      'O estado final da rede antes da reconstrução foi exportado e o hash publicado, para que ' +
      'qualquer pessoa que queira conferir possa fazê-lo.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A A1 será reconstruída em {date} — todas as cadeias, saldos e transações criados antes disso serão apagados.',
    bannerLink: 'Detalhes',
    badge: 'Reconstrução a caminho',
    title: 'A A1 será reconstruída em {date}',
    desc:
      'Toda a rede de testes A1 será reconstruída a partir do bloco 0. Tudo que foi criado antes ' +
      'dessa data desaparecerá — não ficará oculto, deixará de existir. Esta página diz exatamente ' +
      'o que se perde e o que você precisa fazer.',
    whyTitle: 'Por que a reconstrução é necessária',
    why1:
      'O genesis de uma rede é imutável. É exatamente isso que a torna confiável — ninguém, nem ' +
      'quem a construiu, consegue mudar um número depois de escrito no bloco 0.',
    why2:
      'O preço disso: mudar um número dentro do genesis não deixa outra opção senão reconstruir a ' +
      'rede do zero. A A1 elevou o fornecimento total para 9.000.000.000 LOVE9, e toda a faixa de ' +
      'parâmetros de staking teve que ser recalculada para bater.',
    why3:
      'Isto é uma testnet, e reconstruir é algo que uma testnet pode fazer. Na verdade é por isso ' +
      'que testnets existem: para que mudanças assim aconteçam aqui, e não na mainnet.',
    lostTitle: 'O que será perdido',
    lostDesc: 'Tudo, sem exceção:',
    lost1: 'Toda L1 lançada por usuários, inclusive cadeias que estão funcionando muito bem.',
    lost2: 'Todo saldo de LOVE9, inclusive os tokens recebidos da torneira.',
    lost3: 'Toda transação, todo bloco e o histórico inteiro da C-Chain, da P-Chain e da X-Chain.',
    lost4: 'Todo validador e toda delegação.',
    keptTitle: 'O que fica',
    keptDesc:
      'Antes da exclusão, toda a rede que vai morrer será exportada com um hash publicado, para que ' +
      'o registro continue verificável. O que aconteceu ainda poderá ser conferido, mesmo depois que ' +
      'a rede que o executou tiver sumido. O link do arquivo será publicado aqui no dia da reconstrução.',
    toDoTitle: 'O que você precisa fazer',
    toDoBefore: 'Antes da reconstrução:',
    toDo1:
      'Não construa nada na A1 agora que dependa de os dados sobreviverem. Se você está testando ' +
      'uma ideia, vá em frente — só não trate a cadeia atual como armazenamento.',
    toDoAfter: 'Depois da reconstrução:',
    toDo2:
      'Remova da sua carteira cada L1 que você adicionou — aquelas cadeias não existem mais, e uma ' +
      'carteira apontando para elas vai simplesmente ficar parada. A rede principal A1 não precisa ' +
      'ser removida: as configurações dela não mudaram.',
    toDo3:
      'Se sua carteira ainda não tem a rede A1, adicione-a com o botão da página da torneira em vez ' +
      'de digitar as configurações à mão.',
    toDo4: 'Peça tokens na torneira de novo e lance sua cadeia outra vez, se quiser.',
    silentTitle: 'Sua carteira não vai avisar',
    silentDesc:
      'A nova rede mantém o Chain ID {chainId}, o mesmo endereço RPC e o mesmo nome da antiga. Isso ' +
      'foi proposital — para que todo documento e guia já publicados continuem corretos. O preço é ' +
      'que sua carteira não tem sinal nenhum de que acabou de se conectar a uma rede diferente. ' +
      'Por isso as duas coisas abaixo acontecerão em silêncio.',
    silent1:
      'Uma carteira com a configuração antiga ainda conecta, ainda mostra o nome de rede correto e ' +
      'vai informar saldo 0. Esse número está CORRETO: seus tokens antigos não existem mais, não ' +
      'estão escondidos. Você não precisa readicionar a rede — basta pedir tokens novos na torneira. ' +
      'Se sua carteira informar transação travada ou número de sequência errado, limpe os dados de ' +
      'atividade daquela rede na carteira: ela ainda lembra o contador de transações de uma cadeia ' +
      'morta, enquanto a nova conta a partir de 0.',
    silent2:
      'Se você ainda guarda uma transação assinada que nunca foi transmitida, descarte-a. A assinatura ' +
      'continua válida na rede nova, porque o Chain ID não mudou. Ela vai falhar enquanto a carteira ' +
      'estiver vazia — mas no momento em que você pedir tokens na torneira ela se torna executável, ' +
      'e pode passar numa hora que você não espera.',
    repeatTitle: 'Isso vai acontecer de novo',
    repeatDesc:
      'É possível. A A1 ainda é uma testnet e, até a comunidade escolher uma direção de mainnet entre ' +
      'A1 e C1, mantemos o direito de reconstruir a rede quando algo dentro do genesis precisar mudar. ' +
      'O que assumimos é avisar com antecedência e dizer claramente o que se perde.',
    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    alreadyTitle: 'Já foi reconstruída uma vez em 2026-08-27',
    alreadyDesc:
      'A A1 já foi reconstruída uma vez em 2026-08-27, antes da data abaixo. Se você tinha tokens de teste antes disso, seu saldo agora é 0 — isso está correto, não é falha da sua carteira. Nenhuma cadeia de usuário foi perdida: o diretório continha apenas cadeias de teste automatizadas. Peça tokens na torneira de novo.',
    dateNote: 'A data pode escorregar',
    dateNoteDesc:
      'A data {date} depende de uma verificação anterior. Se ela atrasar, mudaremos a data nesta ' +
      'página em vez de ficar em silêncio.',
  },

  footer: {
    tryIt: 'Experimente',
    explore: 'Explorar',
    about: 'Sobre',
    explorer: 'Explorador 9Scan-A1',
    mainSite: 'Site principal da 9Chain',
    opensNewTab: '(abre em uma nova aba)',
    navLabel: 'Links do rodapé',
    rebuildPlan: 'Plano de reconstrução da rede',
  },

  nav: {
    home: 'Início',
    faucet: 'Obter tokens de teste',
    launch: 'Lançar uma cadeia',
    myChains: 'Minhas cadeias',
    compare: 'A1 ↔ C1',
    directory: 'Diretório de L1',
    explorer: 'Explorador',
    explorerAria: 'Abrir 9Scan-A1 em uma nova aba',
  },

  home: {
    testnetBadge: 'Testnet — os tokens não têm valor real',
    primaryCta: 'Lance sua cadeia',
    secondaryCta: 'Pegue tokens de teste primeiro',
    title: 'Lance sua própria cadeia na A1',
    subtitle: 'Uma L1 sua, de propriedade da carteira com que você assina, rodando de verdade na rede de testes. Leva cerca de três minutos.',
    tableCaption: 'Cada linha é uma cadeia real rodando na A1, com dono próprio.',
    colChain: 'Cadeia',
    colType: 'Tipo',
    colOwner: 'Dono',
    systemDefault: 'padrão do sistema',
    emptyTitle: 'Nenhuma L1 rodando ainda',
    emptyDesc: 'Você seria o primeiro. O diretório atualiza assim que sua cadeia estiver no ar.',
    moreChains: 'Ver todas as {count} chains no diretório',
    disclosure: '9 dos 11 validadores correm no mesmo servidor e no mesmo fornecedor; os outros dois juntaram-se a partir de outro lugar e só um deles está em linha — descentralizado ao nível do protocolo, ainda não ao nível da infraestrutura.',
    idleBlocksNote: 'A Avalanche não produz blocos vazios, então uma altura de bloco parada enquanto ninguém transaciona é normal. A medida de atividade é a contagem de validadores ao lado.',
  },

  stats: {
    title: 'A rede está no ar',
    validators: 'Validadores conectados',
    l1Count: 'L1 rodando',
    blockHeight: 'Bloco da C-Chain',
    measuring: 'Medindo a rede…',
    cannotMeasure: 'Não foi possível ler as estatísticas da rede',
    cannotMeasureDesc: 'A página continua funcionando — isto é só o painel de estado.',
  },
  directory: {
    lede: 'Todas as cadeias na testnet A1 e o estado real de cada uma.',
    howToTitle: 'Como ler esta tabela.',
    howToBody: 'A Avalanche não produz blocos vazios — uma cadeia só produz um quando há uma transação, por isso uma contagem de blocos que não se move é normal e não significa que a cadeia está morta. O caso perigoso é o inverso: uma cadeia sem validadores continua a responder ao RPC, continua a deixar ler saldos, e as carteiras continuam a ligar-se — mas cada transação fica pendurada para sempre. Portanto o verdadeiro sinal de vida aqui é o número de validadores da sub-rede, lido diretamente da P-Chain, e não a altura do bloco.',
    ownerTitle: 'O proprietário (admin)',
    ownerBody: 'é o endereço indicado quando a cadeia foi lançada. Detém toda a oferta de génese e o direito de alterar as taxas dessa cadeia — a cadeia pertence-lhe, não à fundação. As cadeias lançadas antes de a consola ter este campo mostram um valor predefinido do sistema.',
    mainNetwork: 'REDE PRINCIPAL',
    mainNetworkDesc: 'A C-Chain da testnet A1 — onde o faucet e o explorador funcionam.',
    running: 'A FUNCIONAR',
    notAnswering: 'NÃO RESPONDE',
    notAnsweringDesc: 'O RPC não está a responder — pode ainda não haver um nó a seguir esta sub-rede.',
    unclear: 'SEM CLAREZA',
    unclearDesc: 'Não foi possível ler o conjunto de validadores da P-Chain.',
    ownerAdmin: 'Proprietário (admin)',
    blocks: 'Blocos',
    subnetValidators: 'Validadores da sub-rede',
    created: 'Criada',
    revokedAt: 'Revogada em',
    copyOwner: 'Copiar endereço do proprietário',
    revoked: 'REVOGADA',
    revokedDesc: 'Esta cadeia deixou de servir: nenhum nó a executa e o seu RPC já não responde. Se adicionou esta rede a uma carteira, remova-a — deixá-la lá só produz erros de ligação.',
    neverReissued: 'nunca reatribuída a outra cadeia',
    revokedGroup: 'Revogadas ({count})',
    listError: 'Não foi possível ler a lista de cadeias ({error}). A rede principal continua a ser mostrada abaixo.',
    footSummary: '{count} L1 a funcionar + a rede principal',
    footRevoked: '{count} revogadas',
    footUpdated: 'atualizado às {time}',
    tileTotal: 'L1 no diretório',
    tileRunning: 'Medidas em execução',
    tileAttention: 'Precisam de atenção',
    tileRevoked: 'Revogadas',
    sweepProgress: 'Medidas {done} de {total}',
    measuringDesc: 'Na fila para medição.',
    howToToggle: 'Como ler esta lista',
    searchLabel: 'Buscar',
    searchPlaceholder: 'Nome, Chain ID, proprietário ou blockchain ID',
    filterStatus: 'Estado',
    filterAll: 'Todas',
    filterRunning: 'Em execução',
    filterAttention: 'Precisam de atenção',
    filterRevoked: 'Revogadas',
    filterType: 'Tipo',
    filterTypeAll: 'Todos os tipos',
    groupBy: 'Agrupar por',
    groupNone: 'Sem agrupar',
    groupOwner: 'Proprietário',
    groupType: 'Tipo',
    groupStatus: 'Estado',
    groupNoType: 'Tipo não registrado',
    groupCount: '{shown} de {total}',
    sortBy: 'Ordenar',
    sortNewest: 'Mais recentes primeiro',
    sortOldest: 'Mais antigas primeiro',
    sortName: 'Nome',
    sortChainId: 'Chain ID',
    sortBlocks: 'Mais blocos',
    refresh: 'Medir novamente',
    listCaption: 'Chains na A1, com o estado medido de cada uma',
    showing: 'Mostrando {shown} de {total}',
    showMore: 'Mostrar mais {count}',
    noMatchTitle: 'Nenhuma chain corresponde',
    noMatchDesc: 'Tente outro termo ou limpe os filtros.',
    clearFilters: 'Limpar filtros',
    showDetails: 'Detalhes',
    hideDetails: 'Ocultar',
    detailsOf: 'Detalhes de {name}',
    nativeToken: 'Token nativo',
    mismatch: 'CHAIN ERRADA',
    mismatchDesc: 'O RPC respondeu com o Chain ID {got} em vez de {expected} — quase certamente uma falha de roteamento, não desta chain.',
  },


  loadTest: {
    badge: 'Teste de carga',
    banner: 'Estamos a executar um teste de carga público — {tps} transações por segundo, geradas por nós, não por utilizadores reais.',
    bannerLink: 'Ver os números ao vivo',
    title: 'Teste de carga público',
    intro: 'A A1 é uma rede de teste jovem com muito poucos utilizadores reais, por isso, deixada sozinha, quase não produz blocos. Geramos um fluxo constante de transações para que a rede esteja continuamente em funcionamento e para que possa vê-la a trabalhar. Este tráfego é nosso. Não é utilização e não o contamos como tal — cada endereço que o envia está listado abaixo, para que o possa subtrair.',
    running: 'A decorrer agora',
    stopped: 'Não está a decorrer neste momento',
    stoppedWhy: 'Motivo registado: {reason}',
    labelTps: 'Transações por segundo',
    labelBlockHeight: 'Bloco da C-Chain',
    labelSecondsPerBlock: 'Segundos por bloco',
    labelTotal: 'Transações confirmadas desde o início',
    labelUptime: 'A funcionar há',
    committedNote: 'Estes números são contados a partir dos próprios blocos, não daquilo que tentámos enviar. Uma transação que a rede aceitou mas nunca incluiu num bloco não é contada aqui.',
    addressesTitle: 'Os nove endereços remetentes',
    addressesNote: 'Cada transação destes endereços é gerada por uma máquina nossa. Filtre-os para ver a atividade real que exista.',
    measuring: 'A ler o estado do teste de carga…',
    notMeasured: 'Não foi possível ler o estado do teste de carga',
    notMeasuredMore: 'A página continua funcionando — isto é só o painel de estado.',
  },

  launch: {
    title: 'Lance sua cadeia',
    desc: 'Uma L1 dedicada, de propriedade da sua carteira. Você assina uma vez para provar quem é, revisa, e a rede constrói a cadeia em cerca de três minutos.',
    connectWallet: 'Conectar carteira',
    connecting: 'Conectando…',
    signIn: 'Assinar para entrar',
    signing: 'Aguardando a assinatura…',
    yourWallet: 'Sua carteira',
    youWillOwn: 'A cadeia pertencerá a esta carteira. O endereço vem da sua assinatura — ninguém digita.',
    noWallet: 'Nenhuma carteira encontrada neste navegador. Instale a MetaMask e recarregue a página.',
    signRejected: 'Você recusou assinar. Nada foi criado.',
    switchWallet: 'Usar outra carteira',
    nameLabel: 'Nome da cadeia',
    namePlaceholder: 'Por exemplo: MinhaCadeia',
    nameHelp: 'Letras, dígitos e espaços. 2–32 caracteres. Nesta rede, um nome já usado nunca é reemitido — nem para uma cadeia revogada.',
    nameInvalid: 'O nome só pode conter letras, dígitos e espaços, com 2 a 32 caracteres.',
    typeLabel: 'Tipo de cadeia',
    typeHelp: 'Uma vez escolhido, fica fixo — o genesis de uma cadeia não pode ser editado.',
    slotsLeft: 'Restam {left}/{total} vagas',
    slotsFull: 'Sem vagas',
    slotsFullDesc:
      'O modelo atual faz cada validador acompanhar todas as L1, e o protocolo derruba um nó que ' +
      'declare mais de 16 sub-redes. Este é um teto rígido e não pode ser elevado. Revogar uma cadeia ' +
      'devolve uma vaga.',
    reviewCta: 'Revise antes de enviar',
    reviewTitle: 'Revisão — esta é uma porta de mão única',
    reviewDesc:
      'O genesis de uma L1 lançada é IMUTÁVEL. Depois deste passo o nome, o tipo de cadeia e o dono ' +
      'não podem ser alterados — e revogar também não devolve o nome nem o Chain ID.',
    reviewRebuild:
      'Mais uma coisa antes de apertar: a A1 reconstrói a rede inteira em {date}. A cadeia que você ' +
      'lançar hoje será apagada junto com a rede antiga — não escondida, sumida.',
    reviewName: 'Nome da cadeia',
    reviewType: 'Tipo de cadeia',
    reviewOwner: 'Dono',
    reviewBack: 'Voltar e editar',
    reviewConfirm: 'Eu revisei — lançar a cadeia',
    launching: 'Lançando a cadeia “{name}”',
    launchingDesc:
      'Os nós reiniciam UM DE CADA VEZ para a rede nunca perder o quórum — é por isso que é lento, e ' +
      'é proposital. Não feche a aba; se fechar, a cadeia é construída mesmo assim.',
    etaRemaining: 'Faltam cerca de {minutes} minutos',
    preparing: 'Preparando…',
    doneTitle: 'Pronto — a cadeia “{name}” está rodando',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Adicionar a cadeia à carteira',
    doneAdded: 'Adicionada à carteira',
    doneActivate: 'Ativar a cadeia (abrir o bloco 1)',
    doneActivated: 'Ativada',
    doneActivating: 'Aguardando a carteira…',
    doneAddWalletError: 'Não foi possível adicionar a cadeia à sua carteira. {detail}',
    doneActivateError: 'Não foi possível ativar a cadeia. {detail}',
    launchAnother: 'Lançar outra cadeia',
    launchError: 'Não foi possível lançar a cadeia. {detail}',
    unknownError: 'A cadeia não apareceu no diretório depois que a execução terminou.',
    noteTitle: 'A primeira transação de uma cadeia nova',
    noteHow: 'Não confie na estimativa de gas da primeira transação. O jeito mais barato de abrir o bloco 1 é uma transferência comum — aperte “Ativar a cadeia” abaixo.',
  },

  myChains: {
    title: 'Minhas cadeias',
    desc: 'As L1 pertencentes à carteira com que você entrou. Podem ser revogadas, mas leia o aviso antes.',
    connectWallet: 'Conecte sua carteira para ver suas cadeias',
    emptyTitle: 'Esta carteira ainda não possui nenhuma cadeia',
    emptyDesc: 'Lance uma e volte — ela aparecerá aqui na hora.',
    emptyCta: 'Lance sua cadeia',
    colChain: 'Cadeia',
    colType: 'Tipo',
    colStatus: 'Estado',
    colActions: '',
    validatorCount: '{count} validadores',
    measuring: 'medindo',
    cannotMeasure: 'não foi possível medir',
    statusHelp: 'Medido pela contagem de validadores da sub-rede, não pela altura do bloco.',
    noValidators: '0 validadores',
    noValidatorsDesc:
      'Esta cadeia NÃO consegue finalizar nenhuma transação: a sub-rede não tem validadores. Ela ainda ' +
      'responde a chamadas RPC e as carteiras ainda conectam, então não há outro sinal visível.',
    walletSettings: 'Configurações da carteira',
    addToWallet: 'Adicionar à carteira',
    addedToWallet: 'Adicionada',
    addWalletError: 'Não foi possível adicioná-la à sua carteira. {detail}',
    revoke: 'Revogar',
    revokeTitle: 'Revogar “{name}”?',
    revokeWarn1: 'A cadeia para de servir RPC imediatamente e some do diretório público.',
    revokeWarn2:
      'Revogar NÃO apaga a sub-rede na P-Chain — o que foi criado ali não pode ser removido enquanto ' +
      'esta rede estiver no ar. Também não remove a rede das carteiras de quem já adicionou esta cadeia.',
    revokeWarn3:
      'O nome e o Chain ID ficam reservados e NUNCA são reemitidos a ninguém nesta rede. Reemitir um ' +
      'Chain ID faria a carteira de um usuário antigo apontar em silêncio para a cadeia de outra pessoa.',
    revokeWarn4: 'Em troca, uma das 15 vagas é devolvida.',
    revokeTypeLabel: 'Digite o nome exato da cadeia para confirmar',
    revokeNameMismatch: 'Isso não confere com o nome da cadeia.',
    revokeConfirm: 'Revogar permanentemente',
    revokeCancel: 'Cancelar',
    revoking: 'Revogando “{name}” — cerca de três minutos',
    revokeDone: '“{name}” revogada. Restam {left}/{total} vagas.',
    revokeError: 'Não foi possível revogar. {detail}',
    revokeUnknown: 'A cadeia ainda está no diretório depois que a execução terminou.',
    revokedBadge: 'Revogada',
    revokedDesc: 'Nome e Chain ID continuam reservados nesta rede.',
  },

  compare: {
    title: 'A1 ↔ C1 — comparação',
    desc:
      'A 9Chain roda DUAS testnets do mesmo produto lado a lado, diferindo no motor: A1 no motor ' +
      'Avalanche, C1 no motor Cosmos. Esta tabela registra as escolhas entre as duas direções, ' +
      'publicada para que qualquer um possa contestar — o lado C1 ainda não tem medições reais.',
    selfScoreTitle: 'As notas abaixo são AUTOAVALIADAS pela equipe, não medidas de forma independente',
    selfScoreDesc:
      'A coluna “como é medido” diz como cada critério foi verificado. Qualquer critério sem uma ' +
      'medição datada é um julgamento de arquitetura, não um dado. Os pesos são seus — a nota acompanha.',
    colNo: '#',
    colCriterion: 'Critério',
    colKind: 'Tipo',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Peso',
    kindArchitecture: 'arquitetura',
    kindLiveData: 'dados reais',
    totalScore: 'Nota total com seus pesos',
    tied: 'Empate',
    leads: 'na frente',
    liveDataTitle: 'Dados ao vivo',
    a1Validators: 'A1 — validadores conectados',
    a1Chains: 'A1 — L1 rodando',
    a1Blocks: 'A1 — bloco da C-Chain',
    c1Unreachable: 'C1 — inacessível',
    c1UnreachableDesc:
      'É necessária a URL REST Cosmos da C1 (porta 1317). A tabela continua útil: o lado A1 são dados ' +
      'ao vivo, o lado C1 é um julgamento de arquitetura como os demais critérios.',
    measuring: 'medindo…',
    cannotMeasure: 'não foi possível medir',
    critDecentralisation: 'Descentralização (limite de validadores)',
    noteDecentralisation: 'Limite do PROTOCOLO: Snowman ~milhares de nós face a CometBFT ~150. A1 HOJE: 9 nós, uma máquina, um fornecedor',
    critFinality: 'Finalidade',
    noteFinality: '~1–2s face a ~5–6s',
    critEvmMaturity: 'Maturidade da EVM',
    noteEvmMaturity: 'coreth em produção face a Cosmos EVM pré-v1',
    critWalletCompat: 'Compatibilidade com carteiras e DeFi de retalho',
    noteWalletCompat: 'MetaMask/EVM completo',
    critLaunchUx: 'Experiência de lançamento de cadeia',
    noteLaunchUx: 'ambos têm consola; no A1 medem-se ~170s por lançamento',
    critInterop: 'Amplitude da interoperabilidade',
    noteInterop: 'Warp/ICM dentro do ecossistema (o A1 já moveu activos, M6.2) face ao alcance do IBC',
    critOpCost: 'Custo de operação por cadeia',
    noteOpCost: 'nó + plugin face a operador K8s',
    critBootstrap: 'Arranque do efeito de rede',
    noteBootstrap: 'uma ilha própria face ao IBC ligado à economia Cosmos',
    critEconSecurity: 'Segurança económica pública',
    noteEconSecurity: 'PoS garantido por token desde o início',
    critSwitchCost: 'Custo de mudança para a equipa',
    noteSwitchCost: 'o A1 é novo face ao C1 a correr há meses',
  },

  faucet: {
    title: 'Obter tokens de teste',
    desc: 'O LOVE9 na testnet A1 não tem valor real — ele existe para você pagar gas enquanto testa. Informe um endereço de carteira e enviamos na hora.',
    addressLabel: 'Seu endereço de carteira',
    addressPlaceholder: '0x… (40 caracteres hexadecimais)',
    requestCta: 'Envie tokens para mim',
    sending: 'Enviando…',
    addressHelp: 'Cole o endereço da carteira que deve receber os tokens. Aperte “Adicionar a rede à carteira” acima se ainda não fez isso.',
    addNetwork: 'Adicionar a rede à carteira',
    addNetworkDone: 'Adicionada à carteira',
    addNetworkRejected: 'Você apertou recusar na carteira. Aperte de novo se quiser adicionar a rede.',
    addNetworkError: 'Sua carteira não conseguiu adicionar a rede. Adicione manualmente com as configurações ao lado — e envie a linha abaixo para a equipe:',
    noWallet: 'Nenhuma carteira encontrada neste navegador. Instale a MetaMask e recarregue a página.',
    quotaLabel: 'Cota restante',
    quotaFormat: '{left}/{total} pedidos a cada {hours} horas',
    quotaExhausted: 'Você usou toda a sua cota. Tente de novo em {minutes} minutos.',
    quotaUnreadable: 'Não foi possível ler sua cota — você ainda pode pedir, só não vai saber quantos restam.',
    sentOk: 'Enviados {count} {symbol} para {address}',
    viewTransaction: 'Ver a transação',
    settingsTitle: 'Configurações de rede',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Símbolo',
    settingsDecimals: 'Casas decimais',
    settingsExplorer: 'Explorador',
    decimalsHelp:
      'As carteiras mostram 18 casas decimais porque a C-Chain roda a EVM. Na P/X-Chain, o LOVE9 é ' +
      'contado em 9 casas. Uma moeda só, duas escalas — não são dois tokens diferentes.',
    genericError: 'Não foi possível enviar. {detail}',
  },

  langPicker: {
    label: 'Idioma',
    machineBadge: 'automática',
    machineNote: 'Só o vietnamita foi revisado por uma pessoa. As demais traduções são automáticas e podem conter erros — o inglês é a versão de referência.',
    notAvailable: 'ainda não disponível',
  },

  errors: {
    unreachable: 'Não foi possível alcançar a rede',
    unreachableDesc: 'A rede pode estar ocupada, ou sua conexão pode ter caído.',
    empty: 'Nada aqui ainda',
    addressEmpty: '{label} não pode estar vazio',
    addressFormat: '{label} tem de ser 0x seguido de 40 caracteres hexadecimais',
    addressChecksum: '{label} não passa a sua soma de verificação EIP-55 — o mais provável é que um carácter tenha sido mal escrito ou perdido ao colar',
    addressZero: '{label} não pode ser o endereço zero — ninguém detém a sua chave',
    timeout: 'Sem resposta após {seconds}s',
    notJson: 'A resposta não era JSON (HTTP {status}) — o pedido foi provavelmente encaminhado para o lugar errado',
    noWallet: 'Não foi encontrada nenhuma carteira neste navegador.',
  },

  notFound: {
    code: '404',
    title: 'Esta página não existe',
    desc: 'O endereço que você abriu não existe na 9Chain Testnet A1. Ele pode ter sido renomeado, ou a URL pode ter perdido alguns caracteres na cópia.',
    topPagesTitle: 'As três páginas mais usadas:',
    navLabel: 'Para onde ir',
    goHome: 'Voltar ao início',
    goFaucet: 'Obter tokens de teste',
    goLaunch: 'Lance sua cadeia',
    lookingForTx: 'Procurando uma transação ou um endereço? Confira o hash e tente de novo.',
  },
};

export default pt;
