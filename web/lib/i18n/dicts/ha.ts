import type { Dict } from '../en';

/**
 * Hausa — fassarar na'ura, ba a bincika ta da mutum ba.
 * Harshen asali shine Turanci (`../en.ts`); idan aka sami bambanci, sigar Turanci ce ta tabbata.
 *
 * 🔴 Kada a laushe waɗannan wurare guda uku: `reGenesis.*` (za a share hanyar sadarwa),
 * `deChain.soatMoTa` (ƙofa ta hanya ɗaya), `chainCuaToi.thuHoiY*` (janyewa ba ya mayar da suna).
 * Suna cewa "har abada" da "ba za a iya canzawa ba" don kada wani ya rasa dukiyarsa yana zaton
 * ana iya mayar da ita.
 */
export const ha: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: 'Hanyar sadarwa ta gwaji ta jama’a ta 9Chain — hanyar sadarwa mai zaman kanta da ke gudana a injin Avalanche',
    tagline: 'hanyar sadarwa mai zaman kanta a injin Avalanche',
    walletRejected: 'Ka ƙi buƙatar a cikin walat ɗinka. Babu abin da ya canza.',
    loading: 'Ana loda…',
    retry: 'Sake gwadawa',
    copy: 'Kwafa',
    copied: 'An kwafa',
    close: 'Rufe',
    openMenu: 'Buɗe menu',
    closeMenu: 'Rufe menu',
    switchToDark: 'Canja zuwa yanayin duhu',
    switchToLight: 'Canja zuwa yanayin haske',
    skipToContent: 'Tsallake zuwa babban abun ciki',
    stepDone: ' — an gama',
    stepRunning: ' — yana gudana',
    stepFailed: ' — ya gaza',
    stepPending: ' — jira',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',

    banner: 'An sake gina A1 a {date}. Duk wani ma’auni da sarƙa da aka ƙirƙira kafin wannan ranar ba su nan kuma.',
    bannerLink: 'Menene ma’anar wannan',
    badge: 'An sake ginawa',

    title: 'An sake gina A1 a {date}',
    desc:
      'An sake gina hanyar gwaji ta A1 daga toshe 0. Sarƙoƙi, ma’aunai da tarihin mu’amaloli da aka ' +
      'ƙirƙira kafin wannan ranar ba su nan kuma — ba a ɓoye su ba, sun ɓace. ' +
      'Wannan shafin yana bayyana abin da kake gani da abin da ya kamata ka yi.',

    willSeeTitle: 'Abin da za ka gani',
    willSee1:
      'Walat ɗinka na ci gaba da haɗuwa, na ci gaba da nuna sunan hanyar sadarwa daidai da Chain ID ' +
      'iri ɗaya {chainId} — an yi haka da gangan. Amma ma’aunin ka zai zama 0.',
    willSee2:
      'Duk L1 da ka ƙaddamar ya ɓace daga jerin. Sunayensu da Chain ID ɗinsu sun sake zama a sake, ' +
      'kuma kowa na iya ɗaukar su.',
    willSee3:
      'Idan ka sa hannu kan mu’amala amma ba ka taɓa watsa ta ba, kada ka watsa ta yanzu — ' +
      'ta hanyar sadarwa ce da ba ta nan kuma.',

    toDoTitle: 'Abin da ya kamata ka yi',
    toDo1: 'Sake neman alamun gwaji daga famfon. An sake saita iyaka ga kowa.',
    toDo2:
      'Cire kowace L1 ɗaya bayan ɗaya daga walat ɗinka — suna da Chain ID nasu kuma yanzu ba sa nuna ' +
      'ko’ina. Babbar hanyar sadarwa ta A1 BA TA buƙatar cirewa; saitunanta ba su canza ba.',
    toDo3: 'Sake ƙaddamar da sarƙarka idan kana buƙatarta. Wataƙila wani ya riga ya ɗauki tsohon sunan.',

    archiveTitle: 'Adana tsohuwar hanyar sadarwa',
    archiveDesc:
      'An fitar da yanayin ƙarshe na hanyar sadarwa kafin sake ginawa aka kuma buga hashi nata, ' +
      'don duk wanda ke son bincika ya iya yi.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'Za a sake gina A1 a {date} — duk wata sarƙa, ma’auni da mu’amala da aka ƙirƙira kafin nan za a share su.',
    bannerLink: 'Cikakken bayani',
    badge: 'Sake ginawa na zuwa',

    title: 'Za a sake gina A1 a {date}',
    desc:
      'Za a sake gina duk hanyar gwaji ta A1 daga toshe 0. Duk abin da aka ƙirƙira kafin wannan ranar ' +
      'zai ɓace — ba a ɓoye shi ba, sai dai ba zai ƙara wanzuwa ba. Wannan shafin yana faɗi daidai abin ' +
      'da za a rasa da abin da ya kamata ka yi.',

    whyTitle: 'Me ya sa sake ginawa ya zama dole',
    why1:
      'Genesis na hanyar sadarwa ba ya canzawa. Wannan ne ainihin abin da ke sa ta abin dogaro — babu ' +
      'wanda zai iya canza lamba bayan an rubuta ta cikin toshe 0, har da waɗanda suka gina ta.',
    why2:
      'Farashin haka: canza lamba a cikin genesis ba ya barin wani zaɓi sai sake gina hanyar sadarwa ' +
      'daga farko. A1 ta ɗaga jimillar samarwa zuwa 9,000,000,000 LOVE9, kuma dole a sake ƙididdige ' +
      'dukkan kewayon sigogin staking don su dace.',
    why3:
      'Wannan hanyar gwaji ce, kuma sake ginawa abu ne da aka yarda wa hanyar gwaji ta yi. Hakika shi ' +
      'ya sa hanyoyin gwaji suke: don irin waɗannan canje-canje su faru a nan, ba a babbar hanyar sadarwa ba.',

    lostTitle: 'Abin da za a rasa',
    lostDesc: 'Komai, ba tare da wani banda ba:',
    lost1: 'Duk L1 da masu amfani suka ƙaddamar, har da sarƙoƙin da ke gudana lafiya ƙalau.',
    lost2: 'Duk ma’aunin LOVE9, har da alamun da aka karɓa daga famfon.',
    lost3: 'Kowace mu’amala, kowane toshe, duk tarihin C-Chain, P-Chain da X-Chain.',
    lost4: 'Kowane mai tabbatarwa da kowane wakilci.',

    keptTitle: 'Abin da za a adana',
    keptDesc:
      'Kafin sharewa, za a fitar da duk hanyar sadarwa mai mutuwa tare da buga hashi, don bayanan su ' +
      'ci gaba da yiwuwar tabbatarwa. Abin da ya faru zai ci gaba da yiwuwar bincike, ko da hanyar ' +
      'sadarwa da ta gudanar da shi ba ta nan. Za a saka mahaɗin adanawa a nan ranar sake ginawa.',

    toDoTitle: 'Abin da ya kamata ka yi',
    toDoBefore: 'Kafin sake ginawa:',
    toDo1:
      'Kada ka gina komai a A1 yanzu da ya dogara ga bayanai su wanzu. Idan kana gwada wani ra’ayi, ' +
      'ci gaba — kawai kada ka ɗauki sarƙar yanzu a matsayin wurin ajiya.',
    toDoAfter: 'Bayan sake ginawa:',
    toDo2:
      'Cire daga walat ɗinka kowace L1 da ka ƙara — waɗannan sarƙoƙin ba su nan kuma, kuma walat da ke ' +
      'nuna su zai tsaya cak kawai. Babbar hanyar sadarwa ta A1 ba ta buƙatar cirewa: saitunanta ba su ' +
      'canza ba.',
    toDo3:
      'Idan walat ɗinka bai riga ya sami hanyar sadarwa ta A1 ba, ƙara ta da maɓallin da ke shafin ' +
      'famfon maimakon buga saitunan da hannu.',
    toDo4: 'Sake neman alamu daga famfon, sannan ka sake ƙaddamar da sarƙarka idan kana so.',

    silentTitle: 'Walat ɗinka ba zai gargaɗe ka ba',
    silentDesc:
      'Sabuwar hanyar sadarwa tana riƙe da Chain ID {chainId}, adireshin RPC iri ɗaya da suna iri ɗaya ' +
      'da tsohuwar. An yi haka da gangan — don kowace takarda da jagora da aka riga aka buga su ci gaba ' +
      'da zama daidai. Farashinsa shine walat ɗinka ba shi da wata alama ko kaɗan cewa ya haɗu da wata ' +
      'hanyar sadarwa daban. Saboda haka abubuwa biyu da ke ƙasa za su faru shiru.',
    silent1:
      'Walat mai tsohon saiti na ci gaba da haɗuwa, na ci gaba da nuna sunan hanyar sadarwa daidai, ' +
      'kuma zai ba da rahoton ma’auni 0. Wannan lambar DAIDAI ce: tsofaffin alamunka ba su nan kuma, ' +
      'ba a ɓoye su ba. Ba sai ka sake ƙara hanyar sadarwa ba — kawai ka nemi sabbin alamu daga famfon. ' +
      'Idan walat ya ba da rahoton mu’amala da ta makale ko lambar jeri mara daidai, share bayanan ' +
      'ayyukan wannan hanyar sadarwa a cikin walat: har yanzu yana tuna adadin mu’amalar sarƙar da ta ' +
      'mutu, alhali sabuwar sarƙa tana ƙidaya daga 0.',
    silent2:
      'Idan har yanzu kana riƙe da mu’amala mai sa hannu da ba a taɓa watsa ta ba, ka jefar da ita. ' +
      'Sa hannun na nan da inganci a sabuwar hanyar sadarwa, domin Chain ID bai canza ba. Za ta gaza ' +
      'muddin walat ɗin babu komai — amma da zarar ka nemi alamu daga famfon, sai ta zama mai yiwuwar ' +
      'kashewa, kuma tana iya wucewa a lokacin da ba ka tsammani ba.',

    repeatTitle: 'Shin wannan zai sake faruwa',
    repeatDesc:
      'Yana yiwuwa. A1 har yanzu hanyar gwaji ce, kuma har sai al’umma ta zaɓi hanyar babbar sadarwa ' +
      'tsakanin A1 da C1, muna riƙe da haƙƙin sake gina hanyar sadarwa duk lokacin da wani abu a cikin ' +
      'genesis dole ya canza. Abin da muke alƙawari shine mu sanar da kai tun kafin lokaci, mu kuma faɗi ' +
      'a fili abin da za a rasa.',

    alreadyTitle: 'An riga an sake gina ta sau ɗaya a 2026-08-27',
    alreadyDesc:
      'An riga an sake gina A1 sau ɗaya a 2026-08-27, kafin ranar da ke ƙasa. Idan ka riƙe alamun gwaji kafin nan, ma’aunin ka yanzu 0 ne — hakan daidai ne, ba lalacewar walat ɗinka ba ce. Babu wata sarƙar mai amfani da ta ɓace: jerin yana ɗauke da sarƙoƙin gwaji na atomatik kaɗai. Sake neman alamu daga famfon.',
    dateNote: 'Ranar tana iya jinkirtawa',
    dateNoteDesc:
      'Ranar {date} ta dogara ga binciken go/no-go da ya gabata. Idan ta jinkirta, za mu canza ranar ' +
      'a wannan shafin maimakon mu yi shiru.',
  },

  footer: {
    tryIt: 'Gwada',
    explore: 'Bincika',
    about: 'Game da mu',
    explorer: 'Mai bincike na 9Scan-A1',
    mainSite: 'Babban shafin 9Chain',
    opensNewTab: '(yana buɗewa a sabon shafi)',
    navLabel: 'Hanyoyin ƙasan shafi',
    rebuildPlan: 'Shirin sake gina hanyar sadarwa',
  },

  nav: {
    home: 'Gida',
    faucet: 'Karɓi alamun gwaji',
    launch: 'Ƙaddamar da sarƙa',
    myChains: 'Sarƙoƙina',
    compare: 'A1 ↔ C1',
    directory: 'Jerin L1',
    explorer: 'Mai bincike',
    explorerAria: 'Buɗe 9Scan-A1 a sabon shafi',
  },

  home: {
    testnetBadge: 'Hanyar gwaji — alamun ba su da wata daraja ta gaske',
    primaryCta: 'Ƙaddamar da sarƙarka',
    secondaryCta: 'Fara da karɓar alamun gwaji',

    title: 'Ƙaddamar da sarƙarka a A1',
    subtitle: 'L1 naka, mallakin walat ɗin da kake sa hannu da shi, tana gudana da gaske a hanyar gwaji. Tana ɗaukar kusan minti uku.',
    tableCaption: 'Kowane layi sarƙa ce ta gaske da ke gudana a A1, tare da mai ita.',
    colChain: 'Sarƙa',
    colType: 'Nau’i',
    colOwner: 'Mai ita',
    systemDefault: 'tsoho na tsarin',
    emptyTitle: 'Babu wata L1 da ke gudana tukuna',
    emptyDesc: 'Kai za ka zama na farko. Jerin yana sabuntawa da zarar sarƙarka ta fara aiki.',

    disclosure: 'Duk masu tabbatarwa 9 a yanzu suna gudana a uwar garke ɗaya, da mai bayarwa ɗaya — an rarraba a matakin ka’ida, ba a matakin ababen more rayuwa ba tukuna.',
    idleBlocksNote: 'Avalanche ba ya samar da toshe fanko, don haka tsayin toshe da ya tsaya cak yayin da babu wanda ke yin mu’amala abu ne na yau da kullum. Ma’aunin rayuwa shine adadin masu tabbatarwa da ke gefensa.',
  },

  stats: {
    title: 'Hanyar sadarwa tana aiki',
    validators: 'Masu tabbatarwa da suka haɗu',
    l1Count: 'L1 masu gudana',
    blockHeight: 'Toshen C-Chain',
    measuring: 'Ana auna hanyar sadarwa…',
    cannotMeasure: 'Ba a iya karanta ƙididdigar hanyar sadarwa ba',
    cannotMeasureDesc: 'Shafin na ci gaba da aiki — wannan nuni na yanayi ne kawai.',
  },
  directory: {
    lede: 'Kowace sarƙa a kan gwajin sadarwa A1, da ainihin halin kowace ɗaya.',
    howToTitle: 'Yadda ake karanta wannan tebur.',
    howToBody: 'Avalanche ba ya samar da tubalan da babu komai a ciki — sarƙa tana samar da tubali ne kawai idan akwai ma’amala, don haka lissafin tubalan da ya tsaya cak abu ne na yau da kullum kuma ba yana nufin sarƙar ta mutu ba. Akasin haka ne mai hatsari: sarƙa da ba ta da masu tabbatarwa har yanzu tana amsa RPC, har yanzu tana ba da damar karanta ma’auni, kuma wallet suna haɗuwa da ita — amma kowace ma’amala tana rataye har abada. Saboda haka ainihin alamar rai a nan ita ce yawan masu tabbatarwa na ƙaramin sadarwa, wanda ake karantawa kai tsaye daga P-Chain, ba tsayin tubali ba.',
    ownerTitle: 'Mai ita (admin)',
    ownerBody: 'ita ce adireshin da aka bayar lokacin ƙaddamar da sarƙar. Yana riƙe da dukan kayan farko da kuma ikon canja kuɗin sarƙar — sarƙar tasa ce, ba ta gidauniya ba. Sarƙoƙin da aka ƙaddamar kafin dashboard ya sami wannan filin suna nuna tsoho na tsarin.',
    mainNetwork: 'BABBAN SADARWA',
    mainNetworkDesc: 'C-Chain na gwajin sadarwa A1 — inda famfo da mai bincike ke aiki.',
    running: 'TANA AIKI',
    notAnswering: 'BA TA AMSA',
    notAnsweringDesc: 'RPC ba ya amsa — mai yiwuwa babu wata kumburi da ke bin wannan ƙaramin sadarwa tukuna.',
    unclear: 'BAI BAYYANA BA',
    unclearDesc: 'An kasa karanta tarin masu tabbatarwa daga P-Chain.',
    ownerAdmin: 'Mai ita (admin)',
    blocks: 'Tubalan',
    subnetValidators: 'Masu tabbatarwa na ƙaramin sadarwa',
    created: 'An ƙirƙira',
    revokedAt: 'An janye a',
    copyOwner: 'Kwafi adireshin mai ita',
    revoked: 'AN JANYE',
    revokedDesc: 'Wannan sarƙa ta daina bayar da hidima: babu wata kumburi da ke gudanar da ita kuma RPC nata ba ya amsa. Idan ka ƙara wannan sadarwa cikin wallet, ka cire ta — barin ta kawai yana haifar da kurakuran haɗi.',
    neverReissued: 'ba a sake ba wa wata sarƙa ba',
    revokedGroup: 'An janye ({count})',
    listError: 'An kasa karanta jerin sarƙoƙi ({error}). Babban sadarwa har yanzu ana nuna shi ƙasa.',
    footSummary: 'L1 {count} suna aiki + babban sadarwa',
    footRevoked: '{count} an janye',
    footUpdated: 'an sabunta a {time}',
  },


  loadTest: {
    badge: 'Gwajin nauyi',
    banner: 'Muna gudanar da gwajin nauyi a fili — ma’amaloli {tps} a cikin dakika, mu ne muka ƙirƙire su, ba masu amfani na gaskiya ba.',
    bannerLink: 'Duba lambobin kai tsaye',
    title: 'Gwajin nauyi a fili',
    intro: 'A1 sabuwar hanyar sadarwa ce ta gwaji mai ƙalilan masu amfani na gaskiya, don haka idan aka bar ta kaɗai kusan ba ta samar da wani shingen bayanai. Muna ƙirƙirar ci gaba da ma’amaloli domin hanyar sadarwa ta ci gaba da aiki kuma ku iya ganin tana aiki. Wannan zirga-zirgar tamu ce. Ba amfani ba ne, kuma ba ma ƙidaya ta a matsayin amfani — kowane adireshi da ke aika ta yana ƙasa, domin ku iya cire shi.',
    running: 'Yana gudana yanzu',
    stopped: 'Ba ya gudana a yanzu',
    stoppedWhy: 'Dalilin da aka rubuta: {reason}',
    labelTps: 'Ma’amaloli a dakika',
    labelBlockHeight: 'Shingen C-Chain',
    labelSecondsPerBlock: 'Dakiku kowane shinge',
    labelTotal: 'Ma’amalolin da aka tabbatar tun farawa',
    labelUptime: 'Yana gudana tsawon',
    committedNote: 'An ƙidaya waɗannan lambobi daga shingayen kansu, ba daga abin da muka yi ƙoƙarin aikawa ba. Ma’amalar da hanyar sadarwa ta karɓa amma ba a taɓa saka ta cikin shinge ba ba a ƙidaya ta a nan.',
    addressesTitle: 'Adiresoshi tara masu aikawa',
    addressesNote: 'Kowace ma’amala daga waɗannan adireshi na’urarmu ce ta ƙirƙira. Tace su domin ganin ainihin ayyukan da ake yi.',
    measuring: 'Ana karanta halin gwajin nauyi…',
    notMeasured: 'An kasa karanta halin gwajin nauyi',
    notMeasuredMore: 'Shafin na ci gaba da aiki — wannan nuni na yanayi ne kawai.',
  },

  launch: {
    title: 'Ƙaddamar da sarƙarka',
    desc:
      'L1 keɓaɓɓe, mallakin walat ɗinka. Kana sa hannu sau ɗaya don tabbatar da wanene kai, ka duba, ' +
      'sannan hanyar sadarwa tana gina sarƙar cikin kusan minti uku.',

    connectWallet: 'Haɗa walat',
    connecting: 'Ana haɗawa…',
    signIn: 'Shiga',
    signing: 'Ana jiran sa hannu…',
    yourWallet: 'Walat ɗinka',
    youWillOwn: 'Sarƙar za ta zama ta wannan walat. Adireshin yana fitowa daga sa hannunka — babu wanda ke bugawa da hannu.',
    noWallet: 'Ba a sami walat a wannan burauzar ba. Girka MetaMask sannan ka sake loda shafin.',
    signRejected: 'Ka ƙi sa hannu. Ba a ƙirƙiri komai ba.',
    switchWallet: 'Yi amfani da wani walat',

    nameLabel: 'Sunan sarƙa',
    namePlaceholder: 'Misali: MyChain',
    nameHelp:
      'Haruffa, lambobi da sarari. Haruffa 2–32. A wannan hanyar sadarwa, sunan da aka taɓa amfani da ' +
      'shi ba a sake bayar da shi ko kaɗan — ko da ga sarƙar da aka janye.',
    nameInvalid: 'Sunan zai iya ƙunsar haruffa, lambobi da sarari kaɗai, tsawon haruffa 2–32.',
    typeLabel: 'Nau’in sarƙa',
    typeHelp: 'Da zarar an zaɓa, ya tsaya — ba a iya gyara genesis na sarƙa.',
    slotsLeft: 'Sauran wurare {left}/{total}',
    slotsFull: 'Babu sauran wuri',
    slotsFullDesc:
      'Tsarin na yanzu yana sa kowane mai tabbatarwa ya bi kowace L1, kuma ka’idar tana fitar da kumburin ' +
      'da ya bayyana fiye da subnet 16. Wannan iyaka ce mai tsauri kuma ba a iya ɗaga ta. Janye sarƙa ' +
      'yana mayar da wuri ɗaya.',
    reviewCta: 'Duba kafin ka aika',

    reviewTitle: 'Dubawa — wannan ƙofa ce ta hanya ɗaya',
    reviewDesc:
      'Genesis na L1 da aka ƙaddamar BA YA CANZAWA. Bayan wannan matakin, ba a iya canza suna, nau’in ' +
      'sarƙa da mai ita — kuma janyewa ma ba zai mayar da suna da chain ID ba.',
    reviewRebuild:
      'Wani abu kuma da ya kamata ka sani kafin ka danna: A1 tana sake gina duk hanyar sadarwa a {date}. ' +
      'Sarƙar da ka ƙaddamar yau za a share ta tare da tsohuwar hanyar sadarwa — ba a ɓoye ta ba, za ta ɓace.',
    reviewName: 'Sunan sarƙa',
    reviewType: 'Nau’in sarƙa',
    reviewOwner: 'Mai ita',
    reviewBack: 'Koma ka gyara',
    reviewConfirm: 'Na duba — ƙaddamar da sarƙar',

    launching: 'Ana ƙaddamar da sarƙar “{name}”',
    launchingDesc:
      'Kumburai suna sake farawa ƊAYA BAYAN ƊAYA don hanyar sadarwa kada ta taɓa rasa ƙuruma — shi ya sa ' +
      'yake jinkiri, kuma an yi haka da gangan. Kada ka rufe shafin; ko ka rufe, za a ci gaba da gina sarƙar.',
    etaRemaining: 'Sauran kusan minti {minutes}',
    preparing: 'Ana shirya…',

    doneTitle: 'An gama — sarƙar “{name}” tana gudana',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Ƙara sarƙa a walat',
    doneAdded: 'An ƙara a walat',
    doneActivate: 'Kunna sarƙa (buɗe toshe 1)',
    doneActivated: 'An kunna',
    doneActivating: 'Ana jiran walat…',
    doneAddWalletError: 'Ba a iya ƙara sarƙar a walat ɗinka ba. {detail}',
    doneActivateError: 'Ba a iya kunna sarƙar ba. {detail}',

    launchAnother: 'Ƙaddamar da wata sarƙa',
    launchError: 'Ba a iya ƙaddamar da sarƙar ba. {detail}',
    unknownError: 'Sarƙar ba ta bayyana a jerin ba bayan aikin ya kammala.',
    noteTitle: 'Mu’amala ta farko a sabuwar sarƙa',
    noteHow:
      'Kada ka amince da ƙiyasin gas na mu’amala ta farko. Hanya mafi arha ta buɗe toshe 1 ita ce ' +
      'canja wuri na yau da kullum — danna “Kunna sarƙa” a ƙasa.',
  },

  myChains: {
    title: 'Sarƙoƙina',
    desc: 'L1 ɗin da walat ɗin da ka shiga da shi ke mallaka. Ana iya janye su, amma ka fara karanta gargaɗin.',
    connectWallet: 'Haɗa walat ɗinka don ganin sarƙoƙinka',
    emptyTitle: 'Wannan walat bai mallaki wata sarƙa ba tukuna',
    emptyDesc: 'Ƙaddamar da ɗaya sannan ka dawo — za ta bayyana nan take.',
    emptyCta: 'Ƙaddamar da sarƙarka',

    colChain: 'Sarƙa',
    colType: 'Nau’i',
    colStatus: 'Yanayi',
    colActions: '',

    validatorCount: 'Masu tabbatarwa {count}',
    measuring: 'ana auna',
    cannotMeasure: 'ba a iya auna ba',
    statusHelp: 'Ana auna ta adadin masu tabbatarwa na subnet, ba ta tsayin toshe ba.',
    noValidators: 'Masu tabbatarwa 0',
    noValidatorsDesc:
      'Wannan sarƙar BA ZA TA IYA kammala kowace mu’amala ba: subnet ɗin ba shi da masu tabbatarwa. ' +
      'Har yanzu tana amsa kiran RPC kuma walat na ci gaba da haɗuwa, don haka babu wata alama a bayyane.',

    walletSettings: 'Saitunan walat',
    addToWallet: 'Ƙara a walat',
    addedToWallet: 'An ƙara',
    addWalletError: 'Ba a iya ƙara ta a walat ɗinka ba. {detail}',

    revoke: 'Janye',
    revokeTitle: 'A janye “{name}”?',
    revokeWarn1: 'Sarƙar tana daina bayar da RPC nan take kuma tana ɓacewa daga jerin jama’a.',
    revokeWarn2:
      'Janyewa BA YA share subnet a P-Chain — abin da aka ƙirƙira a can ba za a iya cire shi ba muddin ' +
      'wannan hanyar sadarwa tana gudana. Haka kuma ba ya cire hanyar sadarwa daga walat ɗin mutanen da ' +
      'suka riga suka ƙara wannan sarƙar.',
    revokeWarn3:
      'Suna da Chain ID suna nan a ajiye kuma BA A TAƁA sake bayar da su ga kowa a wannan hanyar sadarwa. ' +
      'Sake bayar da Chain ID zai bar walat ɗin tsohon mai amfani ya nuna sarƙar wani mutum a shiru.',
    revokeWarn4: 'A madadin haka, ana mayar da wuri ɗaya cikin 15.',
    revokeTypeLabel: 'Buga sunan sarƙar daidai don tabbatarwa',
    revokeNameMismatch: 'Wannan bai dace da sunan sarƙar ba.',
    revokeConfirm: 'Janye har abada',
    revokeCancel: 'Soke',
    revoking: 'Ana janye “{name}” — kusan minti uku',
    revokeDone: 'An janye “{name}”. Sauran wurare {left}/{total}.',
    revokeError: 'Ba a iya janyewa ba. {detail}',
    revokeUnknown: 'Sarƙar na nan a jerin bayan aikin ya kammala.',

    revokedBadge: 'An janye',
    revokedDesc: 'Suna da Chain ID suna nan a ajiye a wannan hanyar sadarwa.',
  },

  compare: {
    title: 'A1 ↔ C1 — kwatanci',
    desc:
      '9Chain tana gudanar da hanyoyin gwaji GUDA BIYU na kaya ɗaya gefe da gefe, waɗanda suka bambanta ' +
      'a injin: A1 a injin Avalanche, C1 a injin Cosmos. Wannan tebur yana rubuta cinikin da ke tsakanin ' +
      'hanyoyin biyu, an buga shi don kowa ya iya jayayya da shi — ɓangaren C1 bai riga ya sami ma’aunin ' +
      'kai tsaye ba.',

    selfScoreTitle: 'Maki da ke ƙasa ƘUNGIYA CE TA KIMANTA KANTA, ba a auna su da kansu ba',
    selfScoreDesc:
      'Ginshiƙin "yadda aka auna" yana faɗi yadda aka duba kowace ma’auni. Duk ma’aunin da ba shi da ' +
      'awo mai kwanan wata hukunci ne na gine-gine, ba bayanai ba. Kai ne za ka saita nauyi — maki na bin ' +
      'hakan.',

    colNo: '#',
    colCriterion: 'Ma’auni',
    colKind: 'Nau’i',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Nauyi',
    kindArchitecture: 'gine-gine',
    kindLiveData: 'bayanai kai tsaye',

    totalScore: 'Jimillar maki bisa nauyinka',
    tied: 'Kunnen doki',
    leads: 'na kan gaba',

    liveDataTitle: 'Bayanai kai tsaye',
    a1Validators: 'A1 — masu tabbatarwa da suka haɗu',
    a1Chains: 'A1 — L1 masu gudana',
    a1Blocks: 'A1 — toshen C-Chain',
    c1Unreachable: 'C1 — ba a iya isa gare ta ba',
    c1UnreachableDesc:
      'Ana buƙatar adireshin Cosmos REST na C1 (tashar 1317). Teburin na ci gaba da aiki: ɓangaren A1 ' +
      'bayanai ne kai tsaye, ɓangaren C1 kuwa hukunci ne na gine-gine kamar sauran ma’aunai.',
    measuring: 'ana auna…',
    cannotMeasure: 'ba a iya auna ba',
  },

  faucet: {
    title: 'Karɓi alamun gwaji',
    desc:
      'LOVE9 a hanyar gwaji ta A1 ba shi da daraja ta gaske — yana nan ne domin ka iya biyan gas yayin ' +
      'gwaji. Shigar da adireshin walat, mu kuwa mu aika maka wasu nan take.',
    addressLabel: 'Adireshin walat ɗinka',
    addressPlaceholder: '0x… (haruffa hex 40)',
    requestCta: 'Aiko min da alamu',
    sending: 'Ana aikawa…',
    addressHelp: 'Manna adireshin walat da ya kamata ya karɓi alamun. Danna “Ƙara hanyar sadarwa a walat” a sama idan ba ka riga ka yi ba.',
    addNetwork: 'Ƙara hanyar sadarwa a walat',
    addNetworkDone: 'An ƙara a walat',
    addNetworkRejected: 'Ka danna ƙi a walat ɗinka. Sake danna idan kana son a ƙara hanyar sadarwa.',
    addNetworkError: 'Walat ɗinka bai iya ƙara hanyar sadarwa ba. Ƙara ta da hannu ta amfani da saitunan da ke gefe — sannan ka aika wa ƙungiyar layin da ke ƙasa:',
    noWallet: 'Ba a sami walat a wannan burauzar ba. Girka MetaMask sannan ka sake loda shafin.',
    quotaLabel: 'Sauran ƙima',
    quotaFormat: 'Buƙatu {left}/{total} a kowace awa {hours}',
    quotaExhausted: 'Ka yi amfani da duk ƙimarka. Sake gwadawa bayan minti {minutes}.',
    quotaUnreadable: 'Ba a iya karanta ƙimarka ba — har yanzu kana iya nema, sai dai ba za ka san nawa ya rage ba.',
    sentOk: 'An aika {count} {symbol} zuwa {address}',
    viewTransaction: 'Duba mu’amalar',
    settingsTitle: 'Saitunan hanyar sadarwa',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Alama',
    settingsDecimals: 'Ma’auni na goma',
    settingsExplorer: 'Mai bincike',
    decimalsHelp:
      'Walat suna nuna ma’auni na goma 18 domin C-Chain tana gudanar da EVM. A P/X-Chain, ana ƙidaya ' +
      'LOVE9 da ma’auni na goma 9. Tsabar kuɗi ɗaya, ma’auni biyu — ba alamu biyu daban ba.',
    genericError: 'Ba a iya aikawa ba. {detail}',
  },

  langPicker: {
    label: 'Harshe',
    machineBadge: 'na’ura',
    machineNote: 'Sigar Vietnamese kaɗai ce mutum ya duba. Sauran fassarorin na’ura ce ta yi su kuma suna iya zama ba daidai ba — sigar Turanci ita ce tushen gaskiya.',
    notAvailable: 'ba ta samu ba tukuna',
  },

  errors: {
    unreachable: 'Ba a iya isa ga hanyar sadarwa ba',
    unreachableDesc: 'Wataƙila hanyar sadarwa tana da aiki mai yawa, ko kuma haɗinka ya yanke.',
    empty: 'Babu komai a nan tukuna',
    addressEmpty: '{label} ba zai iya kasancewa fanko ba',
    addressFormat: '{label} dole ya kasance 0x sannan haruffa 40 na heks',
    addressChecksum: '{label} bai ci jarrabawar EIP-55 checksum ba — mai yiwuwa an rubuta harafi ɗaya ba daidai ba ko ya ɓace lokacin liƙawa',
    addressZero: '{label} ba zai iya kasancewa adireshin sifili ba — babu wanda ke riƙe makullinsa',
    timeout: 'Babu amsa bayan {seconds}s',
    notJson: 'Amsar ba JSON ba ce (HTTP {status}) — mai yiwuwa an tura buƙatar wuri mara kyau',
    noWallet: 'Ba a sami wallet a wannan burauzar ba.',
  },

  notFound: {
    code: '404',
    title: 'Wannan shafin babu shi',
    desc:
      'Adireshin da ka buɗe babu shi a 9Chain Testnet A1. ' +
      'Wataƙila an canza masa suna, ko kuma URL ɗin ya rasa wasu haruffa yayin kwafi.',
    topPagesTitle: 'Shafuka uku da aka fi amfani da su:',
    navLabel: 'Ina za ka je yanzu',
    goHome: 'Koma gida',
    goFaucet: 'Karɓi alamun gwaji',
    goLaunch: 'Ƙaddamar da sarƙarka',
    lookingForTx: 'Kana neman mu’amala ko adireshi? Duba hashi sannan ka sake gwadawa.',
  },
};

export default ha;
