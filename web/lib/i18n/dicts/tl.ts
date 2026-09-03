import type { Tu } from '../en';

/**
 * Tagalog — salin ng makina, hindi pa nasusuri ng tao.
 * Ang pinagmulang wika ay Ingles (`../en.ts`); kapag may pagkakaiba, ang Ingles ang masusunod.
 *
 * 🔴 Huwag palambutin ang tatlong ito: `reGenesis.*` (buburahin ang network),
 * `deChain.soatMoTa` (pintuang isang direksyon), `chainCuaToi.thuHoiY*` (hindi ibinabalik ng
 * pagbawi ang pangalan). Sinasabi ng mga ito ang "permanente" at "hindi na mababago" upang
 * walang mawalan ng ari-arian dahil sa akalang maibabalik pa ito.
 */
export const tl: Tu = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: 'Pampublikong testnet ng 9Chain — isang malayang network na tumatakbo sa makinang Avalanche',
    tagline: 'isang malayang network sa makinang Avalanche',
    walletRejected: 'Tinanggihan mo ang kahilingan sa iyong wallet. Walang nabago.',
    loading: 'Naglo-load…',
    retry: 'Subukan muli',
    copy: 'Kopyahin',
    copied: 'Nakopya',
    close: 'Isara',
    openMenu: 'Buksan ang menu',
    closeMenu: 'Isara ang menu',
    switchToDark: 'Lumipat sa madilim na mode',
    switchToLight: 'Lumipat sa maliwanag na mode',
    skipToContent: 'Lumaktaw sa pangunahing nilalaman',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',

    banner: 'Muling itinayo ang A1 noong {ngay}. Ang bawat balanse at chain na nalikha bago ang petsang iyon ay wala na.',
    bannerLink: 'Ano ang ibig sabihin nito',
    badge: 'Muling itinayo',

    title: 'Muling itinayo ang A1 noong {ngay}',
    desc:
      'Muling itinayo ang test network na A1 mula sa block 0. Ang mga chain, balanse at kasaysayan ng ' +
      'transaksyon na nalikha bago ang petsang iyon ay wala na — hindi nakatago, kundi tuluyang nawala. ' +
      'Ipinapaliwanag ng pahinang ito kung ano ang nakikita mo at kung ano ang dapat gawin.',

    willSeeTitle: 'Ano ang makikita mo',
    willSee1:
      'Kumokonekta pa rin ang iyong wallet, ipinapakita pa rin ang tamang pangalan ng network at ang ' +
      'parehong Chain ID {chainId} — sinadya iyon. Ngunit magiging 0 ang iyong balanse.',
    willSee2:
      'Nawala na sa direktoryo ang bawat L1 na inilunsad mo. Malaya na muli ang kanilang mga pangalan ' +
      'at Chain ID, at maaari na itong kunin ninuman.',
    willSee3:
      'Kung may nilagdaan kang transaksyon ngunit hindi mo kailanman ipinadala, huwag mo nang ipadala ' +
      'ngayon — pag-aari iyon ng isang network na wala na.',

    toDoTitle: 'Ano ang kailangan mong gawin',
    toDo1: 'Humingi muli ng test token sa faucet. Na-reset na ang mga limitasyon para sa lahat.',
    toDo2:
      'Alisin sa iyong wallet ang bawat indibidwal na L1 — may sarili silang Chain ID at wala na silang ' +
      'itinuturo ngayon. HINDI kailangang alisin ang pangunahing network na A1; hindi nagbago ang mga ' +
      'setting nito.',
    toDo3: 'Ilunsad muli ang iyong chain kung kailangan mo. Maaaring nakuha na ng iba ang lumang pangalan.',

    archiveTitle: 'Arkibo ng lumang network',
    archiveDesc:
      'Na-export ang huling kalagayan ng network bago ang muling pagtatayo at inilathala ang hash nito, ' +
      'para masuri ito ng sinumang gustong magsiyasat.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'Muling itatayo ang A1 sa {ngay} — buburahin ang bawat chain, balanse at transaksyong nalikha bago noon.',
    bannerLink: 'Mga detalye',
    badge: 'Paparating na muling pagtatayo',

    title: 'Muling itatayo ang A1 sa {ngay}',
    desc:
      'Muling itatayo ang buong test network na A1 mula sa block 0. Mawawala ang lahat ng nalikha bago ' +
      'ang petsang iyon — hindi itatago, kundi tuluyang hindi na iiral. Sinasabi ng pahinang ito nang ' +
      'tiyak kung ano ang mawawala at kung ano ang dapat mong gawin.',

    whyTitle: 'Bakit kailangan ang muling pagtatayo',
    why1:
      'Hindi mababago ang genesis ng isang network. Iyon mismo ang dahilan kung bakit ito mapagkakatiwalaan ' +
      '— walang sinuman, pati na ang mga gumawa nito, ang makapagbabago ng isang numero kapag naisulat ' +
      'na ito sa block 0.',
    why2:
      'Ang halaga niyon: ang pagbabago ng isang numero sa loob ng genesis ay walang ibang naiiwang ' +
      'pagpipilian kundi ang muling itayo ang network mula sa simula. Itinaas ng A1 ang kabuuang supply ' +
      'sa 9,000,000,000 LOVE9, at kinailangang muling kalkulahin ang buong saklaw ng mga parameter ng ' +
      'staking para tumugma dito.',
    why3:
      'Isa itong testnet, at ang muling pagtatayo ay bagay na pinapayagan sa isang testnet. Sa katunayan ' +
      'iyon mismo ang dahilan kung bakit may mga testnet: para dito mangyari ang ganitong mga pagbabago, ' +
      'hindi sa mainnet.',

    lostTitle: 'Ano ang mawawala',
    lostDesc: 'Lahat, walang eksepsiyon:',
    lost1: 'Bawat L1 na inilunsad ng gumagamit, kasama ang mga chain na maayos na tumatakbo.',
    lost2: 'Bawat balanse ng LOVE9, kasama ang mga token na natanggap mula sa faucet.',
    lost3: 'Bawat transaksyon, bawat block, ang buong kasaysayan ng C-Chain, P-Chain at X-Chain.',
    lost4: 'Bawat validator at bawat delegasyon.',

    keptTitle: 'Ano ang itatago',
    keptDesc:
      'Bago ang pagbura, ie-export ang buong naghihingalong network kasama ang inilathalang hash, para ' +
      'manatiling masusuri ang talaan. Masisiyasat pa rin ang nangyari kahit wala na ang network na ' +
      'nagpatakbo nito. Ilalathala rito ang link ng arkibo sa mismong araw ng muling pagtatayo.',

    toDoTitle: 'Ano ang kailangan mong gawin',
    toDoBefore: 'Bago ang muling pagtatayo:',
    toDo1:
      'Huwag magtayo ngayon sa A1 ng anumang umaasa na mananatili ang data. Kung sinusubukan mo lang ang ' +
      'isang ideya, tuloy lang — huwag mo lang ituring na imbakan ang kasalukuyang chain.',
    toDoAfter: 'Pagkatapos ng muling pagtatayo:',
    toDo2:
      'Alisin sa iyong wallet ang bawat L1 na idinagdag mo — wala na ang mga chain na iyon, at ang wallet ' +
      'na nakaturo sa kanila ay basta na lang mananatiling tahimik. Hindi kailangang alisin ang ' +
      'pangunahing network na A1: hindi nagbago ang mga setting nito.',
    toDo3:
      'Kung wala pa sa iyong wallet ang network na A1, idagdag ito gamit ang button sa pahina ng faucet ' +
      'sa halip na i-type nang mano-mano ang mga setting.',
    toDo4: 'Humingi muli ng token sa faucet, at ilunsad muli ang iyong chain kung gusto mo.',

    silentTitle: 'Hindi ka bibigyan ng babala ng iyong wallet',
    silentDesc:
      'Pinananatili ng bagong network ang Chain ID {chainId}, ang parehong RPC address at ang parehong ' +
      'pangalan ng luma. Sinadya iyon — para manatiling tama ang bawat dokumento at gabay na nailathala ' +
      'na. Ang kapalit: wala ni katiting na senyas ang iyong wallet na kakakonekta lang nito sa ibang ' +
      'network. Kaya tahimik na mangyayari ang dalawang bagay sa ibaba.',
    silent1:
      'Ang wallet na may lumang configuration ay kumokonekta pa rin, ipinapakita pa rin ang tamang ' +
      'pangalan ng network, at mag-uulat ng balanseng 0. TAMA ang numerong iyon: wala na ang iyong ' +
      'lumang mga token, hindi sila nakatago. Hindi mo kailangang idagdag muli ang network — humingi ' +
      'lang ng bagong token sa faucet. Kung mag-ulat ang wallet ng natigil na transaksyon o maling ' +
      'sequence number, burahin sa wallet ang activity data ng network na iyon: naaalala pa nito ang ' +
      'bilang ng transaksyon ng isang patay nang chain, samantalang ang bagong chain ay nagbibilang ' +
      'mula 0.',
    silent2:
      'Kung may hawak ka pang nilagdaang transaksyon na hindi kailanman naipadala, itapon mo na. Wasto ' +
      'pa rin ang lagda sa bagong network dahil hindi nagbago ang Chain ID. Mabibigo ito habang walang ' +
      'laman ang wallet — ngunit sa mismong sandaling humingi ka ng token sa faucet ay magiging magagamit ' +
      'na ito, at maaaring dumaan sa oras na hindi mo inaasahan.',

    repeatTitle: 'Mauulit ba ito',
    repeatDesc:
      'Posible. Testnet pa rin ang A1, at hangga\'t hindi pumipili ang komunidad ng direksyon ng mainnet ' +
      'sa pagitan ng A1 at C1, pinanghahawakan namin ang karapatang muling itayo ang network kapag may ' +
      'kailangang baguhin sa loob ng genesis. Ang ipinapangako namin ay sabihin ito sa inyo nang maaga, ' +
      'at sabihin nang tahasan kung ano ang mawawala.',

    alreadyTitle: 'Muli nang naitayo minsan noong 2026-08-27',
    alreadyDesc:
      'Muli nang naitayo ang A1 minsan noong 2026-08-27, bago ang petsang nasa ibaba. Kung may hawak kang test token bago niyon, 0 na ang iyong balanse ngayon — tama iyon, hindi ito depekto ng iyong wallet. Walang chain ng gumagamit ang nawala: mga awtomatikong test chain lamang ang nasa direktoryo. Humingi muli ng token sa faucet.',
    dateNote: 'Maaaring maantala ang petsa',
    dateNoteDesc:
      'Nakasalalay ang petsang {ngay} sa isang naunang go/no-go na pagsusuri. Kung maantala ito, ' +
      'babaguhin namin ang petsa sa pahinang ito sa halip na manahimik.',
  },

  footer: {
    tryIt: 'Subukan',
    explore: 'Tuklasin',
    about: 'Tungkol dito',
    explorer: '9Scan-A1 explorer',
    mainSite: 'Pangunahing site ng 9Chain',
    opensNewTab: '(bubukas sa bagong tab)',
    navLabel: 'Mga link sa footer',
    rebuildPlan: 'Plano sa muling pagtatayo ng network',
  },

  nav: {
    home: 'Home',
    faucet: 'Kumuha ng test token',
    launch: 'Maglunsad ng chain',
    myChains: 'Aking mga chain',
    compare: 'A1 ↔ C1',
    directory: 'Direktoryo ng L1',
    explorer: 'Explorer',
    explorerAria: 'Buksan ang 9Scan-A1 sa bagong tab',
  },

  home: {
    testnetBadge: 'Testnet — walang tunay na halaga ang mga token',
    primaryCta: 'Ilunsad ang iyong chain',
    secondaryCta: 'Kumuha muna ng test token',

    title: 'Ilunsad ang sarili mong chain sa A1',
    subtitle: 'Sarili mong L1, pag-aari ng wallet na ipinanglagda mo, talagang tumatakbo sa test network. Umaabot ng mga tatlong minuto.',
    tableCaption: 'Ang bawat hanay ay tunay na chain na tumatakbo sa A1, na may sariling may-ari.',
    colChain: 'Chain',
    colType: 'Uri',
    colOwner: 'May-ari',
    systemDefault: 'default ng sistema',
    emptyTitle: 'Wala pang L1 na tumatakbo',
    emptyDesc: 'Ikaw ang magiging una. Nag-a-update ang direktoryo sa oras na umandar ang iyong chain.',

    disclosure: 'Lahat ng 9 validator ay kasalukuyang tumatakbo sa iisang server, sa iisang provider — desentralisado sa antas ng protocol, hindi pa sa antas ng imprastraktura.',
    idleBlocksNote: 'Hindi gumagawa ng walang lamang block ang Avalanche, kaya normal lang na hindi gumagalaw ang taas ng block kapag walang nagtatransaksyon. Ang sukatan ng buhay ay ang bilang ng validator sa tabi nito.',
  },

  stats: {
    title: 'Aktibo ang network',
    validators: 'Mga nakakonektang validator',
    l1Count: 'Mga tumatakbong L1',
    blockHeight: 'Block ng C-Chain',
    measuring: 'Sinusukat ang network…',
    cannotMeasure: 'Hindi nabasa ang istatistika ng network',
    cannotMeasureDesc: 'Gumagana pa rin ang pahina — ito lang ang pagpapakita ng katayuan.',
  },

  loadTest: {
    badge: 'Pagsubok sa load',
    banner: 'Nagpapatakbo kami ng pampublikong pagsubok sa load — {tps} transaksyon kada segundo, kami ang gumagawa nito, hindi tunay na gumagamit.',
    bannerLink: 'Tingnan ang live na datos',
    title: 'Pampublikong pagsubok sa load',
    intro: 'Bata pa ang A1 bilang test network at napakakaunti ng tunay na gumagamit, kaya kung iiwan mag-isa, halos walang block na nabubuo. Gumagawa kami ng tuloy-tuloy na daloy ng transaksyon para patuloy na gumana ang network at makita ninyo itong gumagana. Amin ang trapikong ito. Hindi ito paggamit at hindi rin namin binibilang bilang paggamit — nakalista sa ibaba ang bawat address na nagpapadala nito para mabawas ninyo.',
    running: 'Tumatakbo ngayon',
    stopped: 'Hindi tumatakbo ngayon',
    stoppedWhy: 'Naitalang dahilan: {reason}',
    labelTps: 'Transaksyon kada segundo',
    labelBlockHeight: 'Block ng C-Chain',
    labelSecondsPerBlock: 'Segundo kada block',
    labelTotal: 'Nakumpirmang transaksyon mula nang magsimula',
    labelUptime: 'Tumatakbo nang',
    committedNote: 'Mula mismo sa mga block binibilang ang mga numerong ito, hindi mula sa sinubukan naming ipadala. Ang transaksyong tinanggap ng network pero hindi kailanman isinama sa block ay hindi binibilang dito.',
    addressesTitle: 'Ang siyam na address na nagpapadala',
    addressesNote: 'Bawat transaksyon mula sa mga address na ito ay gawa ng makina namin. I-filter ang mga ito para makita ang tunay na aktibidad.',
    measuring: 'Binabasa ang katayuan ng pagsubok sa load…',
    notMeasured: 'Hindi mabasa ang katayuan ng pagsubok sa load',
    notMeasuredMore: 'Gumagana pa rin ang pahina — ito lang ang pagpapakita ng katayuan.',
  },

  launch: {
    title: 'Ilunsad ang iyong chain',
    desc:
      'Isang nakalaang L1, pag-aari ng iyong wallet. Isang beses kang lalagda para patunayan kung sino ' +
      'ka, susuriin mo, at itatayo ng network ang chain sa loob ng mga tatlong minuto.',

    connectWallet: 'Ikonekta ang wallet',
    connecting: 'Kumokonekta…',
    signIn: 'Mag-sign in',
    signing: 'Naghihintay ng lagda…',
    yourWallet: 'Ang iyong wallet',
    youWillOwn: 'Magiging pag-aari ng wallet na ito ang chain. Nagmumula ang address sa iyong lagda — walang nagta-type nito.',
    noWallet: 'Walang wallet na natagpuan sa browser na ito. Mag-install ng MetaMask at i-reload ang pahina.',
    signRejected: 'Tumanggi kang lumagda. Walang nalikha.',
    switchWallet: 'Gumamit ng ibang wallet',

    nameLabel: 'Pangalan ng chain',
    namePlaceholder: 'Halimbawa: MyChain',
    nameHelp:
      'Mga letra, numero at espasyo. 2–32 karakter. Sa network na ito, ang pangalang nagamit na ay hindi ' +
      'na muling ibinibigay — kahit para sa binawing chain.',
    nameInvalid: 'Maaari lamang maglaman ang pangalan ng mga letra, numero at espasyo, na may haba na 2–32 karakter.',
    typeLabel: 'Uri ng chain',
    typeHelp: 'Kapag napili na, nakapirmi na ito — hindi mae-edit ang genesis ng isang chain.',
    slotsLeft: '{con}/{tong} puwang ang natitira',
    slotsFull: 'Wala nang natitirang puwang',
    slotsFullDesc:
      'Sa kasalukuyang modelo, sinusubaybayan ng bawat validator ang bawat L1, at inaalis ng protocol ang ' +
      'node na nagdedeklara ng mahigit 16 subnet. Matigas na hangganan ito at hindi maaaring itaas. Ang ' +
      'pagbawi ng isang chain ay nagbabalik ng isang puwang.',
    reviewCta: 'Suriin bago isumite',

    reviewTitle: 'Pagsusuri — pintuang isang direksyon ito',
    reviewDesc:
      'HINDI MABABAGO ang genesis ng inilunsad nang L1. Pagkatapos ng hakbang na ito, hindi na mapapalitan ' +
      'ang pangalan, uri ng chain at may-ari — at hindi rin ibabalik ng pagbawi ang pangalan at chain ID.',
    reviewRebuild:
      'Isa pang dapat mong malaman bago pindutin: muling itatayo ng A1 ang buong network sa {ngay}. Ang ' +
      'chain na ilulunsad mo ngayon ay buburahin kasama ng lumang network — hindi itatago, kundi mawawala.',
    reviewName: 'Pangalan ng chain',
    reviewType: 'Uri ng chain',
    reviewOwner: 'May-ari',
    reviewBack: 'Bumalik at baguhin',
    reviewConfirm: 'Nasuri ko na — ilunsad ang chain',

    launching: 'Inilulunsad ang chain na “{ten}”',
    launchingDesc:
      'ISA-ISANG nagre-restart ang mga node para hindi kailanman mawalan ng quorum ang network — kaya ito ' +
      'mabagal, at sinadya ito. Huwag isara ang tab; kung isara mo man, maitatayo pa rin ang chain.',
    etaRemaining: 'Mga {phut} minuto na lang',
    preparing: 'Naghahanda…',

    doneTitle: 'Tapos na — tumatakbo na ang chain na “{ten}”',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Idagdag ang chain sa wallet',
    doneAdded: 'Naidagdag sa wallet',
    doneActivate: 'I-activate ang chain (buksan ang block 1)',
    doneActivated: 'Na-activate',
    doneActivating: 'Naghihintay sa wallet…',
    doneAddWalletError: 'Hindi naidagdag ang chain sa iyong wallet. {chiTiet}',
    doneActivateError: 'Hindi na-activate ang chain. {chiTiet}',

    launchAnother: 'Maglunsad ng isa pang chain',
    launchError: 'Hindi nailunsad ang chain. {chiTiet}',
    unknownError: 'Hindi lumitaw ang chain sa direktoryo pagkatapos matapos ang proseso.',
    noteTitle: 'Ang unang transaksyon sa bagong chain',
    noteHow:
      'Huwag pagkatiwalaan ang tantiya ng gas para sa unang transaksyon. Ang pinakamurang paraan para ' +
      'buksan ang block 1 ay ordinaryong paglilipat — pindutin ang “I-activate ang chain” sa ibaba.',
  },

  myChains: {
    title: 'Aking mga chain',
    desc: 'Ang mga L1 na pag-aari ng wallet na ipinang-sign in mo. Maaari silang bawiin, ngunit basahin muna ang babala.',
    connectWallet: 'Ikonekta ang iyong wallet para makita ang iyong mga chain',
    emptyTitle: 'Wala pang chain ang wallet na ito',
    emptyDesc: 'Maglunsad ng isa at bumalik — agad itong lilitaw dito.',
    emptyCta: 'Ilunsad ang iyong chain',

    colChain: 'Chain',
    colType: 'Uri',
    colStatus: 'Katayuan',
    colActions: '',

    validatorCount: '{so} validator',
    measuring: 'sinusukat',
    cannotMeasure: 'hindi masukat',
    statusHelp: 'Sinusukat sa bilang ng validator ng subnet, hindi sa taas ng block.',
    noValidators: '0 validator',
    noValidatorsDesc:
      'HINDI makakapagtapos ng anumang transaksyon ang chain na ito: walang validator ang subnet. ' +
      'Sumasagot pa rin ito sa mga tawag na RPC at kumokonekta pa rin ang mga wallet, kaya walang ibang ' +
      'nakikitang senyas.',

    walletSettings: 'Mga setting ng wallet',
    addToWallet: 'Idagdag sa wallet',
    addedToWallet: 'Naidagdag',
    addWalletError: 'Hindi ito naidagdag sa iyong wallet. {chiTiet}',

    revoke: 'Bawiin',
    revokeTitle: 'Bawiin ang “{ten}”?',
    revokeWarn1: 'Agad na hihinto ang chain sa paghahatid ng RPC at mawawala ito sa pampublikong direktoryo.',
    revokeWarn2:
      'HINDI binubura ng pagbawi ang subnet sa P-Chain — ang nalikha roon ay hindi maaalis hangga\'t ' +
      'tumatakbo ang network na ito. Hindi rin nito inaalis ang network sa wallet ng mga taong nakadagdag ' +
      'na ng chain na ito.',
    revokeWarn3:
      'Nananatiling nakalaan ang pangalan at Chain ID at HINDI KAILANMAN muling ibinibigay kaninuman sa ' +
      'network na ito. Ang muling pagbibigay ng Chain ID ay magpapahintulot sa wallet ng dating gumagamit ' +
      'na tahimik na tumuro sa chain ng iba.',
    revokeWarn4: 'Bilang kapalit, ibinabalik ang isa sa 15 puwang.',
    revokeTypeLabel: 'I-type nang eksakto ang pangalan ng chain para kumpirmahin',
    revokeNameMismatch: 'Hindi ito tumutugma sa pangalan ng chain.',
    revokeConfirm: 'Bawiin nang permanente',
    revokeCancel: 'Kanselahin',
    revoking: 'Binabawi ang “{ten}” — mga tatlong minuto',
    revokeDone: 'Nabawi ang “{ten}”. {con}/{tong} puwang ang natitira.',
    revokeError: 'Hindi nabawi. {chiTiet}',
    revokeUnknown: 'Nasa direktoryo pa rin ang chain pagkatapos matapos ang proseso.',

    revokedBadge: 'Nabawi',
    revokedDesc: 'Nananatiling nakalaan ang pangalan at Chain ID sa network na ito.',
  },

  compare: {
    title: 'A1 ↔ C1 — paghahambing',
    desc:
      'Nagpapatakbo ang 9Chain ng DALAWANG testnet ng iisang produkto nang magkatabi, na nagkakaiba sa ' +
      'makina: A1 sa makinang Avalanche, C1 sa makinang Cosmos. Itinatala ng talahanayang ito ang mga ' +
      'pagpapalitan sa pagitan ng dalawang direksyon, inilathala para may makapagtalo rito — wala pang ' +
      'live na sukat ang panig ng C1.',

    selfScoreTitle: 'Ang mga marka sa ibaba ay SARILING PAGTATAYA ng koponan, hindi malayang sinukat',
    selfScoreDesc:
      'Sinasabi ng kolum na "paano ito sinukat" kung paano sinuri ang bawat pamantayan. Ang anumang ' +
      'pamantayang walang may-petsang sukat ay paghatol sa arkitektura, hindi datos. Ikaw ang magtatakda ' +
      'ng mga timbang — susunod ang marka.',

    colNo: '#',
    colCriterion: 'Pamantayan',
    colKind: 'Uri',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Timbang',
    kindArchitecture: 'arkitektura',
    kindLiveData: 'live na datos',

    totalScore: 'Kabuuang marka gamit ang iyong mga timbang',
    tied: 'Tabla',
    leads: 'nangunguna',

    liveDataTitle: 'Live na datos',
    a1Validators: 'A1 — mga nakakonektang validator',
    a1Chains: 'A1 — mga tumatakbong L1',
    a1Blocks: 'A1 — block ng C-Chain',
    c1Unreachable: 'C1 — hindi maabot',
    c1UnreachableDesc:
      'Kailangan ang Cosmos REST URL ng C1 (port 1317). Gumagana pa rin ang talahanayan: live na datos ' +
      'ang panig ng A1, samantalang paghatol sa arkitektura ang panig ng C1 tulad ng iba pang pamantayan.',
    measuring: 'sinusukat…',
    cannotMeasure: 'hindi masukat',
  },

  faucet: {
    title: 'Kumuha ng test token',
    desc:
      'Walang tunay na halaga ang LOVE9 sa testnet ng A1 — umiiral ito para makabayad ka ng gas habang ' +
      'sumusubok. Maglagay ng address ng wallet at agad kaming magpapadala.',
    addressLabel: 'Address ng iyong wallet',
    addressPlaceholder: '0x… (40 hex na karakter)',
    requestCta: 'Padalhan ako ng token',
    sending: 'Ipinapadala…',
    addressHelp: 'I-paste ang address ng wallet na dapat tumanggap ng token. Pindutin ang “Idagdag ang network sa wallet” sa itaas kung hindi mo pa nagagawa.',
    addNetwork: 'Idagdag ang network sa wallet',
    addNetworkDone: 'Naidagdag sa wallet',
    addNetworkRejected: 'Pinindot mo ang tanggihan sa iyong wallet. Pindutin muli kung gusto mong idagdag ang network.',
    addNetworkError: 'Hindi naidagdag ng iyong wallet ang network. Idagdag ito nang mano-mano gamit ang mga setting sa tabi nito — at ipadala sa koponan ang linya sa ibaba:',
    noWallet: 'Walang wallet na natagpuan sa browser na ito. Mag-install ng MetaMask at i-reload ang pahina.',
    quotaLabel: 'Natitirang quota',
    quotaFormat: '{con}/{tong} kahilingan bawat {gio} oras',
    quotaExhausted: 'Nagamit mo na ang buong quota mo. Subukan muli pagkatapos ng {phut} minuto.',
    quotaUnreadable: 'Hindi nabasa ang iyong quota — puwede ka pa ring humingi, hindi mo lang malalaman kung ilan ang natitira.',
    sentOk: 'Naipadala ang {so} {kyHieu} sa {diaChi}',
    viewTransaction: 'Tingnan ang transaksyon',
    settingsTitle: 'Mga setting ng network',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Simbolo',
    settingsDecimals: 'Mga decimal',
    settingsExplorer: 'Explorer',
    decimalsHelp:
      'Nagpapakita ang mga wallet ng 18 decimal dahil nagpapatakbo ng EVM ang C-Chain. Sa P/X-Chain, ' +
      'binibilang ang LOVE9 sa 9 decimal. Iisang barya, dalawang sukatan — hindi dalawang magkaibang token.',
    genericError: 'Hindi naipadala. {chiTiet}',
  },

  langPicker: {
    label: 'Wika',
    machineBadge: 'makina',
    machineNote: 'Ang bersiyong Vietnamese lamang ang nasuri ng tao. Salin ng makina ang iba at maaaring mali — ang bersiyong Ingles ang pinagmumulan ng katotohanan.',
    notAvailable: 'wala pa',
  },

  errors: {
    unreachable: 'Hindi naabot ang network',
    unreachableDesc: 'Maaaring abala ang network, o naputol ang iyong koneksyon.',
    empty: 'Wala pang laman dito',
  },

  notFound: {
    code: '404',
    title: 'Wala ang pahinang ito',
    desc:
      'Ang address na binuksan mo ay wala sa 9Chain Testnet A1. ' +
      'Maaaring pinalitan ang pangalan nito, o nawalan ng ilang karakter ang URL nang kopyahin ito.',
    topPagesTitle: 'Ang tatlong pinakaginagamit na pahina:',
    navLabel: 'Saan susunod',
    goHome: 'Balik sa home',
    goFaucet: 'Kumuha ng test token',
    goLaunch: 'Ilunsad ang iyong chain',
    lookingForTx: 'Naghahanap ng transaksyon o address? Suriin ang hash at subukan muli.',
  },
};

export default tl;
