import type { Dict } from '../en';

/**
 * Kiswahili — tafsiri ya mashine, haijakaguliwa na binadamu.
 * Lugha ya chanzo ni Kiingereza (`../en.ts`); zikitofautiana, toleo la Kiingereza ndilo sahihi.
 *
 * 🔴 Sehemu hizi tatu zisilainishwe: `reGenesis.*` (mtandao utafutwa),
 * `deChain.soatMoTa` (mlango wa njia moja), `chainCuaToi.thuHoiY*` (kubatilisha hakurudishi jina).
 * Zinasema "kabisa" na "haiwezi kubadilishwa" ili mtu asipoteze mali akidhani inaweza kurudishwa.
 */
export const sw: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: 'Mtandao wa majaribio wa umma wa 9Chain — mtandao huru unaoendeshwa kwa injini ya Avalanche',
    tagline: 'mtandao huru kwenye injini ya Avalanche',
    walletRejected: 'Ulikataa ombi kwenye pochi yako. Hakuna kilichobadilika.',
    noWalletMobile: 'Kivinjari cha simu hakiwezi kuwa na kiendelezi cha pochi. Badala yake fungua ukurasa huu ndani ya programu ya MetaMask — kivinjari chake cha ndani kina pochi.',
    openInMetaMask: 'Fungua kwenye programu ya MetaMask',
    loading: 'Inapakia…',
    retry: 'Jaribu tena',
    copy: 'Nakili',
    copied: 'Imenakiliwa',
    close: 'Funga',
    openMenu: 'Fungua menyu',
    closeMenu: 'Funga menyu',
    switchToDark: 'Badilisha kwenda hali ya giza',
    switchToLight: 'Badilisha kwenda hali ya mwanga',
    skipToContent: 'Rukia hadi maudhui makuu',
    stepDone: ' — imekamilika',
    stepRunning: ' — inaendesha',
    stepFailed: ' — imeshindikana',
    stepPending: ' — inasubiri',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',

    banner: 'A1 ilijengwa upya tarehe {date}. Kila salio na kila mnyororo vilivyoundwa kabla ya tarehe hiyo havipo tena.',
    bannerLink: 'Maana yake ni nini',
    badge: 'Imejengwa upya',

    title: 'A1 ilijengwa upya tarehe {date}',
    desc:
      'Mtandao wa majaribio wa A1 umejengwa upya kuanzia kizuizi 0. Minyororo, salio na historia ya ' +
      'miamala vilivyoundwa kabla ya tarehe hiyo havipo tena — havijafichwa, vimetoweka. ' +
      'Ukurasa huu unaeleza unachokiona na unachopaswa kufanya.',

    willSeeTitle: 'Utakachokiona',
    willSee1:
      'Pochi yako bado inaunganishwa, bado inaonyesha jina sahihi la mtandao na Chain ID ile ile ' +
      '{chainId} — hilo lilikusudiwa. Lakini salio lako litakuwa 0.',
    willSee2:
      'Kila L1 uliyoizindua imetoweka kwenye orodha. Majina yao na Chain ID zao ziko huru tena, ' +
      'na mtu yeyote anaweza kuzichukua.',
    willSee3:
      'Kama ulisaini muamala lakini hukuwahi kuutangaza, usiutangaze sasa — ' +
      'ni wa mtandao ambao haupo tena.',

    toDoTitle: 'Unachopaswa kufanya',
    toDo1: 'Omba tena tokeni za majaribio kwenye bomba. Vikomo vimewekwa upya kwa kila mtu.',
    toDo2:
      'Ondoa kila L1 moja moja kwenye pochi yako — zina Chain ID zao wenyewe na sasa haziashirii ' +
      'popote. Mtandao mkuu wa A1 HAUHITAJI kuondolewa; mipangilio yake haijabadilika.',
    toDo3: 'Zindua mnyororo wako tena ukiuhitaji. Mtu mwingine anaweza kuwa amechukua jina la zamani.',

    archiveTitle: 'Kumbukumbu ya mtandao wa zamani',
    archiveDesc:
      'Hali ya mwisho ya mtandao kabla ya kujengwa upya ilihamishwa na hashi yake ikachapishwa, ' +
      'ili yeyote anayetaka kuthibitisha aweze kufanya hivyo.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1 itajengwa upya tarehe {date} — kila mnyororo, salio na muamala vilivyoundwa kabla ya hapo vitafutwa.',
    bannerLink: 'Maelezo',
    badge: 'Ujenzi upya unakuja',

    title: 'A1 itajengwa upya tarehe {date}',
    desc:
      'Mtandao mzima wa majaribio wa A1 utajengwa upya kuanzia kizuizi 0. Kila kitu kilichoundwa kabla ' +
      'ya tarehe hiyo kitatoweka — hakitafichwa, bali hakitakuwapo tena. Ukurasa huu unaeleza kwa usahihi ' +
      'kitakachopotea na unachopaswa kufanya.',

    whyTitle: 'Kwa nini ujenzi upya ni lazima',
    why1:
      'Genesis ya mtandao haibadiliki. Hicho ndicho hasa kinachoufanya uaminike — hakuna mtu, wakiwemo ' +
      'walioujenga, anayeweza kubadilisha namba baada ya kuandikwa kwenye kizuizi 0.',
    why2:
      'Gharama yake: kubadilisha namba ndani ya genesis hakuachi njia nyingine isipokuwa kujenga upya ' +
      'mtandao kuanzia mwanzo. A1 iliongeza jumla ya usambazaji hadi 9,000,000,000 LOVE9, na safu nzima ' +
      'ya vigezo vya staking ilibidi ihesabiwe upya ili ilingane.',
    why3:
      'Huu ni mtandao wa majaribio, na kujengwa upya ni jambo linaloruhusiwa kwa mtandao wa majaribio. ' +
      'Kwa kweli ndiyo sababu mitandao ya majaribio ipo: ili mabadiliko kama haya yatokee hapa, wala si ' +
      'kwenye mtandao mkuu.',

    lostTitle: 'Kitakachopotea',
    lostDesc: 'Kila kitu, bila ubaguzi:',
    lost1: 'Kila L1 iliyozinduliwa na watumiaji, ikiwemo minyororo inayofanya kazi vizuri kabisa.',
    lost2: 'Kila salio la LOVE9, pamoja na tokeni zilizopokelewa kutoka kwenye bomba.',
    lost3: 'Kila muamala, kila kizuizi, historia yote ya C-Chain, P-Chain na X-Chain.',
    lost4: 'Kila mthibitishaji na kila ukabidhi.',

    keptTitle: 'Kitakachohifadhiwa',
    keptDesc:
      'Kabla ya kufutwa, mtandao mzima unaokufa utahamishwa pamoja na hashi iliyochapishwa, ili ' +
      'kumbukumbu ibaki inayoweza kuthibitishwa. Kilichotokea bado kitaweza kuchunguzwa, hata mtandao ' +
      'ulioendesha ukiwa hauko tena. Kiungo cha kumbukumbu kitawekwa hapa siku ya ujenzi upya.',

    toDoTitle: 'Unachopaswa kufanya',
    toDoBefore: 'Kabla ya ujenzi upya:',
    toDo1:
      'Usijenge sasa kitu chochote kwenye A1 kinachotegemea data kubaki. Kama unajaribu wazo tu, ' +
      'endelea — ila usichukulie mnyororo wa sasa kama hifadhi.',
    toDoAfter: 'Baada ya ujenzi upya:',
    toDo2:
      'Ondoa kwenye pochi yako kila L1 uliyoiongeza — minyororo hiyo haipo tena, na pochi inayoiashiria ' +
      'itakaa tu bila kufanya kitu. Mtandao mkuu wa A1 hauhitaji kuondolewa: mipangilio yake haijabadilika.',
    toDo3:
      'Kama pochi yako bado haina mtandao wa A1, iongeze kwa kitufe kilichopo kwenye ukurasa wa bomba ' +
      'badala ya kuandika mipangilio kwa mkono.',
    toDo4: 'Omba tena tokeni kwenye bomba, na uzindue mnyororo wako tena ukiutaka.',

    silentTitle: 'Pochi yako haitakuonya',
    silentDesc:
      'Mtandao mpya unabaki na Chain ID {chainId}, anwani ile ile ya RPC na jina lile lile la ule wa ' +
      'zamani. Hilo lilikusudiwa — ili kila hati na mwongozo vilivyokwisha chapishwa vibaki sahihi. ' +
      'Gharama yake ni kwamba pochi yako haina ishara yoyote kwamba imeunganishwa na mtandao tofauti. ' +
      'Kwa hiyo mambo mawili yaliyo hapa chini yatatokea kimyakimya.',
    silent1:
      'Pochi yenye usanidi wa zamani bado itaunganishwa, bado itaonyesha jina sahihi la mtandao, na ' +
      'itaripoti salio la 0. Namba hiyo ni SAHIHI: tokeni zako za zamani hazipo tena, hazijafichwa. ' +
      'Huhitaji kuongeza mtandao upya — omba tu tokeni mpya kwenye bomba. Kama pochi ikiripoti muamala ' +
      'uliokwama au namba ya mfuatano isiyo sahihi, futa data ya shughuli ya mtandao huo kwenye pochi: ' +
      'bado inakumbuka hesabu ya miamala ya mnyororo uliokufa, ilhali mnyororo mpya unahesabu kuanzia 0.',
    silent2:
      'Kama bado unashikilia muamala uliosainiwa ambao haukuwahi kutangazwa, uteme. Sahihi bado ni halali ' +
      'kwenye mtandao mpya, kwa sababu Chain ID haikubadilika. Utashindwa muda wote pochi ikiwa tupu — ' +
      'lakini mara tu utakapoomba tokeni kwenye bomba, utakuwa unaweza kutumika, na waweza kupita wakati ' +
      'usiotarajia.',

    repeatTitle: 'Je, hili litatokea tena',
    repeatDesc:
      'Inawezekana. A1 bado ni mtandao wa majaribio, na hadi jamii itakapochagua mwelekeo wa mtandao mkuu ' +
      'kati ya A1 na C1, tunabaki na haki ya kujenga upya mtandao pale kitu ndani ya genesis kinapohitaji ' +
      'kubadilika. Tunachoahidi ni kukuambia mapema, na kusema wazi kitakachopotea.',

    alreadyTitle: 'Tayari ilijengwa upya mara moja tarehe 2026-08-27',
    alreadyDesc:
      'A1 tayari ilijengwa upya mara moja tarehe 2026-08-27, kabla ya tarehe iliyo hapa chini. Kama ulikuwa na tokeni za majaribio kabla ya hapo, salio lako sasa ni 0 — hiyo ni sahihi, si hitilafu ya pochi yako. Hakuna mnyororo wa mtumiaji uliopotea: orodha ilikuwa na minyororo ya majaribio ya kiotomatiki pekee. Omba tena tokeni kwenye bomba.',
    dateNote: 'Tarehe inaweza kusogezwa',
    dateNoteDesc:
      'Tarehe {date} inategemea ukaguzi wa go/no-go uliotangulia. Ikisogezwa, tutabadilisha tarehe ' +
      'kwenye ukurasa huu badala ya kunyamaza.',
  },

  footer: {
    tryIt: 'Jaribu',
    explore: 'Chunguza',
    about: 'Kuhusu',
    explorer: 'Kichunguzi cha 9Scan-A1',
    mainSite: 'Tovuti kuu ya 9Chain',
    opensNewTab: '(inafunguka kwenye kichupo kipya)',
    navLabel: 'Viungo vya chini ya ukurasa',
    rebuildPlan: 'Mpango wa kujenga upya mtandao',
  },

  nav: {
    home: 'Mwanzo',
    faucet: 'Pata tokeni za majaribio',
    launch: 'Zindua mnyororo',
    myChains: 'Minyororo yangu',
    compare: 'A1 ↔ C1',
    directory: 'Orodha ya L1',
    explorer: 'Kichunguzi',
    explorerAria: 'Fungua 9Scan-A1 kwenye kichupo kipya',
  },

  home: {
    testnetBadge: 'Mtandao wa majaribio — tokeni hazina thamani halisi',
    primaryCta: 'Zindua mnyororo wako',
    secondaryCta: 'Pata tokeni za majaribio kwanza',

    title: 'Zindua mnyororo wako mwenyewe kwenye A1',
    subtitle: 'L1 yako mwenyewe, inayomilikiwa na pochi unayotumia kusaini, ikiendeshwa kikweli kwenye mtandao wa majaribio. Huchukua takriban dakika tatu.',
    tableCaption: 'Kila safu ni mnyororo halisi unaoendeshwa kwenye A1, wenye mmiliki wake.',
    colChain: 'Mnyororo',
    colType: 'Aina',
    colOwner: 'Mmiliki',
    systemDefault: 'chaguo-msingi la mfumo',
    emptyTitle: 'Hakuna L1 inayoendeshwa bado',
    emptyDesc: 'Ungekuwa wa kwanza. Orodha husasishwa mara tu mnyororo wako unapoanza kufanya kazi.',
    moreChains: 'Tazama chain zote {count} kwenye orodha',

    disclosure: 'Wathibitishaji 9 kati ya 11 wanaendeshwa kwenye seva ile ile, kwa mtoa huduma yule yule; wengine wawili walijiunga kutoka mahali pengine na ni mmoja tu kati yao aliye mtandaoni — imegatuliwa katika kiwango cha itifaki, bado si katika kiwango cha miundombinu.',
    idleBlocksNote: 'Avalanche haitengenezi vizuizi vitupu, kwa hiyo urefu wa kizuizi kubaki palepale wakati hakuna anayefanya muamala ni jambo la kawaida. Kipimo cha uhai ni idadi ya wathibitishaji iliyo kando yake.',
  },

  stats: {
    title: 'Mtandao unafanya kazi',
    validators: 'Wathibitishaji walioungana',
    l1Count: 'L1 zinazoendeshwa',
    blockHeight: 'Kizuizi cha C-Chain',
    measuring: 'Inapima mtandao…',
    cannotMeasure: 'Takwimu za mtandao hazikusomeka',
    cannotMeasureDesc: 'Ukurasa bado unafanya kazi — hii ni onyesho la hali tu.',
  },
  directory: {
    lede: 'Kila mnyororo katika mtandao wa majaribio A1, na hali yake ya kweli.',
    howToTitle: 'Jinsi ya kusoma jedwali hili.',
    howToBody: 'Avalanche haitengenezi vitalu vitupu — mnyororo hutengeneza kitalu tu wakati kuna muamala, kwa hivyo hesabu ya vitalu inayosimama ni ya kawaida na haimaanishi mnyororo umekufa. Hali ya kinyume ni hatari: mnyororo bila wathibitishaji bado hujibu RPC, bado huruhusu kusoma salio, na pochi bado zinaungana nao — lakini kila muamala hukwama milele. Kwa hivyo ishara ya kweli ya uhai hapa ni idadi ya wathibitishaji wa mtandao mdogo, inayosomwa moja kwa moja kutoka P-Chain, sio urefu wa kitalu.',
    ownerTitle: 'Mmiliki (admin)',
    ownerBody: 'ni anwani iliyotolewa mnyororo ulipoanzishwa. Anashikilia ugavi wote wa mwanzo na haki ya kubadilisha ada za mnyororo huo — mnyororo ni wake, sio wa msingi. Minyororo iliyoanzishwa kabla dashibodi kuwa na sehemu hii inaonyesha chaguo-msingi la mfumo.',
    mainNetwork: 'MTANDAO MKUU',
    mainNetworkDesc: 'C-Chain ya mtandao wa majaribio A1 — mahali bomba na kichunguzi vinafanya kazi.',
    running: 'INAENDESHA',
    notAnswering: 'HAIJIBU',
    notAnsweringDesc: 'RPC haijibu — inawezekana hakuna nodi inayofuatilia mtandao huu mdogo bado.',
    unclear: 'HAIJULIKANI',
    unclearDesc: 'Haikuwezekana kusoma seti ya wathibitishaji kutoka P-Chain.',
    ownerAdmin: 'Mmiliki (admin)',
    blocks: 'Vitalu',
    subnetValidators: 'Wathibitishaji wa mtandao mdogo',
    created: 'Iliundwa',
    revokedAt: 'Ilibatilishwa',
    copyOwner: 'Nakili anwani ya mmiliki',
    revoked: 'IMEBATILISHWA',
    revokedDesc: 'Mnyororo huu umeacha kutoa huduma: hakuna nodi inayouendesha tena na RPC yake haijibu. Kama uliongeza mtandao huu kwenye pochi, uondoe — kuuacha huzalisha makosa ya muunganisho tu.',
    neverReissued: 'haitolewi tena kwa mnyororo mwingine',
    revokedGroup: 'Iliyobatilishwa ({count})',
    listError: 'Haikuwezekana kusoma orodha ya minyororo ({error}). Mtandao mkuu bado unaonyeshwa chini.',
    footSummary: 'L1 {count} zinaendesha + mtandao mkuu',
    footRevoked: '{count} zimebatilishwa',
    footUpdated: 'imesasishwa saa {time}',
    tileTotal: 'L1 kwenye orodha',
    tileRunning: 'Zilizopimwa, zinaendesha',
    tileAttention: 'Zinahitaji umakini',
    tileRevoked: 'Zilizobatilishwa',
    sweepProgress: 'Zimepimwa {done} kati ya {total}',
    measuringDesc: 'Kwenye foleni ya kupimwa.',
    howToToggle: 'Jinsi ya kusoma orodha hii',
    searchLabel: 'Tafuta',
    searchPlaceholder: 'Jina, Chain ID, mmiliki au blockchain ID',
    filterStatus: 'Hali',
    filterAll: 'Zote',
    filterRunning: 'Zinaendesha',
    filterAttention: 'Zinahitaji umakini',
    filterRevoked: 'Zilizobatilishwa',
    filterType: 'Aina',
    filterTypeAll: 'Aina zote',
    groupBy: 'Panga kwa',
    groupNone: 'Bila kupanga',
    groupOwner: 'Mmiliki',
    groupType: 'Aina',
    groupStatus: 'Hali',
    groupNoType: 'Aina haikurekodiwa',
    groupCount: '{shown} kati ya {total}',
    sortBy: 'Panga',
    sortNewest: 'Mpya kwanza',
    sortOldest: 'Za zamani kwanza',
    sortName: 'Jina',
    sortChainId: 'Chain ID',
    sortBlocks: 'Bloku nyingi zaidi',
    refresh: 'Pima tena',
    listCaption: 'Chain kwenye A1, pamoja na hali iliyopimwa ya kila moja',
    showing: 'Inaonyesha {shown} kati ya {total}',
    showMore: 'Onyesha {count} zaidi',
    noMatchTitle: 'Hakuna chain inayolingana',
    noMatchDesc: 'Jaribu neno lingine, au futa vichujio.',
    clearFilters: 'Futa vichujio',
    showDetails: 'Maelezo',
    hideDetails: 'Ficha',
    detailsOf: 'Maelezo ya {name}',
    nativeToken: 'Tokeni asilia',
    mismatch: 'CHAIN ISIYO SAHIHI',
    mismatchDesc: 'RPC ilijibu kwa Chain ID {got} badala ya {expected} — kuna uwezekano mkubwa ni hitilafu ya uelekezaji, si chain hii.',
  },


  loadTest: {
    badge: 'Jaribio la mzigo',
    banner: 'Tunaendesha jaribio la mzigo la hadharani — miamala {tps} kwa sekunde, iliyotengenezwa nasi, si watumiaji halisi.',
    bannerLink: 'Tazama takwimu za moja kwa moja',
    title: 'Jaribio la mzigo la hadharani',
    intro: 'A1 ni mtandao mchanga wa majaribio wenye watumiaji halisi wachache sana, hivyo ukiachwa peke yake hautoi vitalu vyovyote karibu. Tunatengeneza mtiririko wa kudumu wa miamala ili mtandao ufanye kazi bila kukoma na uweze kuuona ukifanya kazi. Trafiki hii ni yetu. Si matumizi, na hatuihesabu kama matumizi — kila anwani inayoituma imeorodheshwa hapa chini ili uweze kuiondoa.',
    running: 'Inaendeshwa sasa',
    stopped: 'Haiendeshwi kwa sasa',
    stoppedWhy: 'Sababu iliyorekodiwa: {reason}',
    labelTps: 'Miamala kwa sekunde',
    labelBlockHeight: 'Kitalu cha C-Chain',
    labelSecondsPerBlock: 'Sekunde kwa kitalu',
    labelTotal: 'Miamala iliyothibitishwa tangu kuanza',
    labelUptime: 'Imeendeshwa kwa',
    committedNote: 'Takwimu hizi zinahesabiwa kutoka kwenye vitalu vyenyewe, si kutoka kile tulichojaribu kutuma. Muamala ambao mtandao uliukubali lakini haukuuweka kwenye kitalu hauhesabiwi hapa.',
    addressesTitle: 'Anwani tisa zinazotuma',
    addressesNote: 'Kila muamala kutoka anwani hizi umetengenezwa na mashine yetu. Zichuje ili uone shughuli halisi zilizopo.',
    measuring: 'Inasoma hali ya jaribio la mzigo…',
    notMeasured: 'Imeshindwa kusoma hali ya jaribio la mzigo',
    notMeasuredMore: 'Ukurasa bado unafanya kazi — hii ni onyesho la hali tu.',
  },

  launch: {
    title: 'Zindua mnyororo wako',
    desc:
      'L1 maalum, inayomilikiwa na pochi yako. Unasaini mara moja kuthibitisha wewe ni nani, unakagua, ' +
      'na mtandao hujenga mnyororo ndani ya takriban dakika tatu.',

    connectWallet: 'Unganisha pochi',
    connecting: 'Inaunganisha…',
    signIn: 'Ingia',
    signing: 'Inasubiri sahihi…',
    yourWallet: 'Pochi yako',
    youWillOwn: 'Mnyororo utakuwa wa pochi hii. Anwani hutokana na sahihi yako — hakuna anayeiandika.',
    noWallet: 'Hakuna pochi iliyopatikana kwenye kivinjari hiki. Sakinisha MetaMask kisha upakie ukurasa upya.',
    signRejected: 'Ulikataa kusaini. Hakuna kilichoundwa.',
    switchWallet: 'Tumia pochi nyingine',

    nameLabel: 'Jina la mnyororo',
    namePlaceholder: 'Kwa mfano: MyChain',
    nameHelp:
      'Herufi, tarakimu na nafasi. Herufi 2–32. Kwenye mtandao huu jina lililowahi kutumika halitolewi ' +
      'tena kamwe — hata kwa mnyororo uliobatilishwa.',
    nameInvalid: 'Jina linaweza kuwa na herufi, tarakimu na nafasi pekee, lenye urefu wa herufi 2–32.',
    typeLabel: 'Aina ya mnyororo',
    typeHelp: 'Ikishachaguliwa haibadiliki — genesis ya mnyororo haiwezi kuhaririwa.',
    slotsLeft: 'Nafasi {left}/{total} zimebaki',
    slotsFull: 'Hakuna nafasi iliyobaki',
    slotsFullDesc:
      'Muundo wa sasa hufanya kila mthibitishaji afuatilie kila L1, na itifaki huondoa nodi inayotangaza ' +
      'zaidi ya subneti 16. Hiki ni kiwango kigumu na hakiwezi kupandishwa. Kubatilisha mnyororo hurudisha ' +
      'nafasi moja.',
    reviewCta: 'Kagua kabla ya kuwasilisha',

    reviewTitle: 'Ukaguzi — huu ni mlango wa njia moja',
    reviewDesc:
      'Genesis ya L1 iliyozinduliwa HAIBADILIKI. Baada ya hatua hii, jina, aina ya mnyororo na mmiliki ' +
      'haviwezi kubadilishwa — na kubatilisha pia hakutarudisha jina wala chain ID.',
    reviewRebuild:
      'Jambo moja zaidi la kujua kabla hujabonyeza: A1 hujenga upya mtandao mzima tarehe {date}. ' +
      'Mnyororo unaouzindua leo utafutwa pamoja na mtandao wa zamani — hautafichwa, utatoweka.',
    reviewName: 'Jina la mnyororo',
    reviewType: 'Aina ya mnyororo',
    reviewOwner: 'Mmiliki',
    reviewBack: 'Rudi na uhariri',
    reviewConfirm: 'Nimekagua — zindua mnyororo',

    launching: 'Inazindua mnyororo “{name}”',
    launchingDesc:
      'Nodi huanzishwa upya MOJA BAADA YA NYINGINE ili mtandao usipoteze akidi kamwe — ndiyo maana ni ' +
      'polepole, na hilo limekusudiwa. Usifunge kichupo; ukikifunga, mnyororo bado utajengwa.',
    etaRemaining: 'Zimebaki takriban dakika {minutes}',
    preparing: 'Inajiandaa…',

    doneTitle: 'Imekamilika — mnyororo “{name}” unafanya kazi',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Ongeza mnyororo kwenye pochi',
    doneAdded: 'Umeongezwa kwenye pochi',
    doneActivate: 'Washa mnyororo (fungua kizuizi 1)',
    doneActivated: 'Umewashwa',
    doneActivating: 'Inasubiri pochi…',
    doneAddWalletError: 'Mnyororo haukuweza kuongezwa kwenye pochi yako. {detail}',
    doneActivateError: 'Mnyororo haukuweza kuwashwa. {detail}',

    launchAnother: 'Zindua mnyororo mwingine',
    launchError: 'Mnyororo haukuweza kuzinduliwa. {detail}',
    unknownError: 'Mnyororo haukuonekana kwenye orodha baada ya kazi kukamilika.',
    noteTitle: 'Muamala wa kwanza kwenye mnyororo mpya',
    noteHow:
      'Usiamini kadirio la gesi kwa muamala wa kwanza. Njia rahisi zaidi ya kufungua kizuizi 1 ni ' +
      'uhamisho wa kawaida — bonyeza “Washa mnyororo” hapa chini.',
  },

  myChains: {
    title: 'Minyororo yangu',
    desc: 'L1 zinazomilikiwa na pochi uliyotumia kuingia. Zinaweza kubatilishwa, lakini soma onyo kwanza.',
    connectWallet: 'Unganisha pochi yako ili kuona minyororo yako',
    emptyTitle: 'Pochi hii bado haimiliki mnyororo wowote',
    emptyDesc: 'Zindua mmoja kisha urudi — utaonekana hapa mara moja.',
    emptyCta: 'Zindua mnyororo wako',

    colChain: 'Mnyororo',
    colType: 'Aina',
    colStatus: 'Hali',
    colActions: '',

    validatorCount: 'Wathibitishaji {count}',
    measuring: 'inapima',
    cannotMeasure: 'haikupimika',
    statusHelp: 'Hupimwa kwa idadi ya wathibitishaji wa subneti, si kwa urefu wa kizuizi.',
    noValidators: 'Wathibitishaji 0',
    noValidatorsDesc:
      'Mnyororo huu HAUWEZI kukamilisha muamala wowote: subneti haina wathibitishaji. Bado hujibu wito ' +
      'wa RPC na pochi bado huunganishwa, kwa hiyo hakuna dalili nyingine inayoonekana.',

    walletSettings: 'Mipangilio ya pochi',
    addToWallet: 'Ongeza kwenye pochi',
    addedToWallet: 'Umeongezwa',
    addWalletError: 'Haikuweza kuongezwa kwenye pochi yako. {detail}',

    revoke: 'Batilisha',
    revokeTitle: 'Batilisha “{name}”?',
    revokeWarn1: 'Mnyororo huacha mara moja kutoa RPC na hutoweka kwenye orodha ya umma.',
    revokeWarn2:
      'Kubatilisha HAKUFUTI subneti kwenye P-Chain — kilichoundwa hapo hakiwezi kuondolewa muda wote ' +
      'mtandao huu unapoendelea kufanya kazi. Pia hakuondoi mtandao kwenye pochi za watu waliokwisha ' +
      'ongeza mnyororo huu.',
    revokeWarn3:
      'Jina na Chain ID hubaki vimehifadhiwa na HAVITOLEWI KAMWE tena kwa mtu yeyote kwenye mtandao huu. ' +
      'Kutoa tena Chain ID kungeruhusu pochi ya mtumiaji wa zamani kuashiria kimyakimya mnyororo wa mtu ' +
      'mwingine.',
    revokeWarn4: 'Kwa kubadilishana, nafasi moja kati ya 15 hurudishwa.',
    revokeTypeLabel: 'Andika jina la mnyororo kwa usahihi ili kuthibitisha',
    revokeNameMismatch: 'Hilo halilingani na jina la mnyororo.',
    revokeConfirm: 'Batilisha kabisa',
    revokeCancel: 'Ghairi',
    revoking: 'Inabatilisha “{name}” — takriban dakika tatu',
    revokeDone: '“{name}” imebatilishwa. Nafasi {left}/{total} zimebaki.',
    revokeError: 'Haikuweza kubatilishwa. {detail}',
    revokeUnknown: 'Mnyororo bado uko kwenye orodha baada ya kazi kukamilika.',

    revokedBadge: 'Imebatilishwa',
    revokedDesc: 'Jina na Chain ID hubaki vimehifadhiwa kwenye mtandao huu.',
  },

  compare: {
    title: 'A1 ↔ C1 — ulinganisho',
    desc:
      '9Chain huendesha mitandao MIWILI ya majaribio ya bidhaa ile ile kwa pamoja, ikitofautiana kwa ' +
      'injini: A1 kwenye injini ya Avalanche, C1 kwenye injini ya Cosmos. Jedwali hili hunakili ' +
      'ubadilishanaji kati ya njia mbili, limechapishwa ili yeyote aweze kulipinga — upande wa C1 bado ' +
      'hauna vipimo vya moja kwa moja.',

    selfScoreTitle: 'Alama zilizo hapa chini ni TATHMINI BINAFSI ya timu, si vipimo huru',
    selfScoreDesc:
      'Safuwima ya "jinsi kilivyopimwa" inaeleza jinsi kila kigezo kilivyokaguliwa. Kigezo chochote kisicho ' +
      'na kipimo chenye tarehe ni hukumu ya usanifu, si data. Uzito wa vigezo unauamua wewe — alama ' +
      'hufuata.',

    colNo: '#',
    colCriterion: 'Kigezo',
    colKind: 'Aina',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Uzito',
    kindArchitecture: 'usanifu',
    kindLiveData: 'data ya moja kwa moja',

    totalScore: 'Jumla ya alama kwa uzito wako',
    tied: 'Sare',
    leads: 'inaongoza',

    liveDataTitle: 'Data ya moja kwa moja',
    a1Validators: 'A1 — wathibitishaji walioungana',
    a1Chains: 'A1 — L1 zinazoendeshwa',
    a1Blocks: 'A1 — kizuizi cha C-Chain',
    c1Unreachable: 'C1 — haifikiki',
    c1UnreachableDesc:
      'URL ya Cosmos REST ya C1 (mlango 1317) inahitajika. Jedwali bado linafanya kazi: upande wa A1 ni ' +
      'data ya moja kwa moja, upande wa C1 ni hukumu ya usanifu kama vigezo vingine vilivyobaki.',
    measuring: 'inapima…',
    cannotMeasure: 'haikupimika',
    critDecentralisation: 'Ugatuzi (kiwango cha juu cha wathibitishaji)',
    noteDecentralisation: 'Kikomo cha ITIFAKI: Snowman ~maelfu ya nodi dhidi ya CometBFT ~150. A1 LEO: nodi 9, mashine moja, mtoa huduma mmoja',
    critFinality: 'Ukamilifu',
    noteFinality: 'takriban sekunde 1–2 dhidi ya takriban sekunde 5–6',
    critEvmMaturity: 'Ukomavu wa EVM',
    noteEvmMaturity: 'coreth iko kwenye uzalishaji dhidi ya Cosmos EVM kabla ya v1',
    critWalletCompat: 'Uoanifu na pochi za watumiaji na DeFi',
    noteWalletCompat: 'MetaMask/EVM kamili',
    critLaunchUx: 'Uzoefu wa kuanzisha mnyororo',
    noteLaunchUx: 'zote mbili zina konsoli; kwenye A1 vilipimwa sekunde ~170 kwa kila mara',
    critInterop: 'Upana wa ushirikiano',
    noteInterop: 'Warp/ICM ndani ya mfumo (A1 imeshahamisha mali, M6.2) dhidi ya ufikaji wa IBC',
    critOpCost: 'Gharama ya uendeshaji kwa kila mnyororo',
    noteOpCost: 'nodi + programu-jalizi dhidi ya opereta wa K8s',
    critBootstrap: 'Kuanzisha athari ya mtandao',
    noteBootstrap: 'kisiwa chake dhidi ya IBC iliyounganishwa na uchumi wa Cosmos',
    critEconSecurity: 'Usalama wa kiuchumi wa hadharani',
    noteEconSecurity: 'imelindwa na tokeni ya PoS tangu mwanzo',
    critSwitchCost: 'Gharama ya kuhama kwa timu',
    noteSwitchCost: 'A1 ni mpya dhidi ya C1 iliyokuwa ikifanya kazi kwa miezi',
  },

  faucet: {
    title: 'Pata tokeni za majaribio',
    desc:
      'LOVE9 kwenye mtandao wa majaribio wa A1 haina thamani halisi — ipo ili uweze kulipia gesi ' +
      'unapojaribu. Weka anwani ya pochi nasi tutatuma kiasi mara moja.',
    addressLabel: 'Anwani ya pochi yako',
    addressPlaceholder: '0x… (herufi 40 za hex)',
    requestCta: 'Nitumie tokeni',
    sending: 'Inatuma…',
    addressHelp: 'Bandika anwani ya pochi inayopaswa kupokea tokeni. Bonyeza “Ongeza mtandao kwenye pochi” hapo juu kama hujafanya hivyo.',
    addNetwork: 'Ongeza mtandao kwenye pochi',
    addNetworkDone: 'Umeongezwa kwenye pochi',
    addNetworkRejected: 'Ulibonyeza kataa kwenye pochi yako. Bonyeza tena ukitaka kuongeza mtandao.',
    addNetworkError: 'Pochi yako haikuweza kuongeza mtandao. Uongeze kwa mkono ukitumia mipangilio iliyo kando — na utumie timu mstari ulio hapa chini:',
    noWallet: 'Hakuna pochi iliyopatikana kwenye kivinjari hiki. Sakinisha MetaMask kisha upakie ukurasa upya.',
    quotaLabel: 'Kiasi kilichobaki',
    quotaFormat: 'Maombi {left}/{total} kwa kila saa {hours}',
    quotaExhausted: 'Umetumia kiasi chako chote. Jaribu tena baada ya dakika {minutes}.',
    quotaUnreadable: 'Kiasi chako hakikusomeka — bado unaweza kuomba, ila hutajua kimebaki kiasi gani.',
    sentOk: 'Zimetumwa {count} {symbol} kwenda {address}',
    viewTransaction: 'Tazama muamala',
    settingsTitle: 'Mipangilio ya mtandao',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Alama',
    settingsDecimals: 'Desimali',
    settingsExplorer: 'Kichunguzi',
    decimalsHelp:
      'Pochi huonyesha desimali 18 kwa sababu C-Chain huendesha EVM. Kwenye P/X-Chain, LOVE9 huhesabiwa ' +
      'kwa desimali 9. Sarafu moja, vipimo viwili — si tokeni mbili tofauti.',
    genericError: 'Haikuweza kutumwa. {detail}',
  },

  langPicker: {
    label: 'Lugha',
    machineBadge: 'mashine',
    machineNote: 'Toleo la Kivietinamu pekee ndilo lililokaguliwa na binadamu. Tafsiri nyingine zimefanywa na mashine na zaweza kuwa na makosa — toleo la Kiingereza ndilo chanzo cha ukweli.',
    notAvailable: 'bado haipatikani',
  },

  errors: {
    unreachable: 'Mtandao haukufikika',
    unreachableDesc: 'Mtandao waweza kuwa na shughuli nyingi, au muunganisho wako umekatika.',
    empty: 'Bado hakuna kitu hapa',
    addressEmpty: '{label} haiwezi kuwa tupu',
    addressFormat: '{label} lazima liwe 0x likifuatiwa na herufi 40 za heksadesimali',
    addressChecksum: '{label} haipiti hesabu yake ya ukaguzi ya EIP-55 — kuna uwezekano mkubwa herufi moja iliandikwa vibaya au ilipotea ulipobandika',
    addressZero: '{label} haiwezi kuwa anwani sifuri — hakuna mtu anayeshikilia ufunguo wake',
    timeout: 'Hakuna jibu baada ya sekunde {seconds}',
    notJson: 'Jibu hakikuwa JSON (HTTP {status}) — kuna uwezekano mkubwa ombi lilielekezwa mahali pasipo sahihi',
    noWallet: 'Hakuna pochi iliyopatikana katika kivinjari hiki.',
  },

  notFound: {
    code: '404',
    title: 'Ukurasa huu haupo',
    desc:
      'Anwani uliyoifungua haipo kwenye 9Chain Testnet A1. ' +
      'Yawezekana ilibadilishwa jina, au URL ilipoteza herufi chache wakati wa kunakiliwa.',
    topPagesTitle: 'Kurasa tatu zinazotumika zaidi:',
    navLabel: 'Uende wapi sasa',
    goHome: 'Rudi mwanzo',
    goFaucet: 'Pata tokeni za majaribio',
    goLaunch: 'Zindua mnyororo wako',
    lookingForTx: 'Unatafuta muamala au anwani? Kagua hashi kisha ujaribu tena.',
  },
};

export default sw;
