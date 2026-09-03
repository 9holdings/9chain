import type { Dict } from '../en';

/**
 * Nederlands — machinevertaling, niet door een mens nagekeken.
 * De brontaal is Engels (`../en.ts`); bij verschillen geldt de Engelse versie.
 *
 * 🔴 Deze drie plekken niet afzwakken: `reGenesis.*` (het netwerk wordt gewist),
 * `deChain.soatMoTa` (eenrichtingsdeur), `chainCuaToi.thuHoiY*` (intrekken geeft de naam
 * niet terug). Ze zeggen "definitief" en "kan niet worden gewijzigd", zodat niemand bezit
 * verliest in de veronderstelling dat het terug te draaien is.
 */
export const nl: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: 'Het publieke testnet van 9Chain — een zelfstandig netwerk op de Avalanche-engine',
    tagline: 'een zelfstandig netwerk op de Avalanche-engine',
    walletRejected: 'Je hebt het verzoek in je wallet geweigerd. Er is niets veranderd.',
    loading: 'Laden…',
    retry: 'Opnieuw proberen',
    copy: 'Kopiëren',
    copied: 'Gekopieerd',
    close: 'Sluiten',
    openMenu: 'Menu openen',
    closeMenu: 'Menu sluiten',
    switchToDark: 'Naar donkere modus',
    switchToLight: 'Naar lichte modus',
    skipToContent: 'Naar hoofdinhoud',
    stepDone: ' — klaar',
    stepRunning: ' — bezig',
    stepFailed: ' — mislukt',
    stepPending: ' — wachtend',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',

    banner: 'A1 is op {date} opnieuw opgebouwd. Elk saldo en elke chain van vóór die datum bestaat niet meer.',
    bannerLink: 'Wat dit betekent',
    badge: 'Opnieuw opgebouwd',

    title: 'A1 is op {date} opnieuw opgebouwd',
    desc:
      'Het A1-testnetwerk is vanaf blok 0 opnieuw opgebouwd. Chains, saldi en transactiegeschiedenis ' +
      'van vóór die datum bestaan niet meer — niet verborgen, maar weg. ' +
      'Deze pagina legt uit wat je ziet en wat je moet doen.',

    willSeeTitle: 'Wat je zult zien',
    willSee1:
      'Je wallet maakt nog steeds verbinding, toont nog steeds de juiste netwerknaam en hetzelfde ' +
      'Chain ID {chainId} — dat was opzet. Maar je saldo zal 0 zijn.',
    willSee2:
      'Elke L1 die je hebt gestart is uit de lijst verdwenen. Hun namen en Chain ID’s zijn weer vrij, ' +
      'en iedereen kan ze claimen.',
    willSee3:
      'Heb je een transactie ondertekend maar nooit uitgezonden, doe dat nu dan niet — ' +
      'die hoort bij een netwerk dat niet meer bestaat.',

    toDoTitle: 'Wat je moet doen',
    toDo1: 'Vraag opnieuw testtokens aan bij de kraan. De limieten zijn voor iedereen gereset.',
    toDo2:
      'Verwijder elke afzonderlijke L1 uit je wallet — ze hebben eigen Chain ID’s en wijzen nu nergens ' +
      'meer heen. Het hoofdnetwerk A1 hoeft NIET verwijderd te worden; de instellingen zijn ongewijzigd.',
    toDo3: 'Start je chain opnieuw als je hem nodig hebt. Iemand anders kan de oude naam hebben genomen.',

    archiveTitle: 'Archief van het oude netwerk',
    archiveDesc:
      'De eindtoestand van het netwerk vóór de heropbouw is geëxporteerd en de hash daarvan ' +
      'gepubliceerd, zodat iedereen die het wil controleren dat kan.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1 wordt op {date} opnieuw opgebouwd — elke chain, elk saldo en elke transactie van daarvóór wordt gewist.',
    bannerLink: 'Details',
    badge: 'Heropbouw komt eraan',

    title: 'A1 wordt op {date} opnieuw opgebouwd',
    desc:
      'Het volledige A1-testnetwerk wordt vanaf blok 0 opnieuw opgebouwd. Alles wat vóór die datum is ' +
      'gemaakt zal weg zijn — niet verborgen, maar niet langer bestaand. Deze pagina zegt precies wat ' +
      'er verloren gaat en wat je moet doen.',

    whyTitle: 'Waarom heropbouw nodig is',
    why1:
      'De genesis van een netwerk is onveranderlijk. Juist dat maakt het betrouwbaar — niemand, ook ' +
      'de bouwers niet, kan een getal nog wijzigen zodra het in blok 0 is geschreven.',
    why2:
      'De prijs daarvan: een getal binnen de genesis wijzigen laat geen andere mogelijkheid dan het ' +
      'netwerk vanaf nul opnieuw opbouwen. A1 heeft het totale aanbod verhoogd naar 9.000.000.000 ' +
      'LOVE9, en het hele bereik aan stakingparameters moest daarop opnieuw worden doorgerekend.',
    why3:
      'Dit is een testnet, en opnieuw opgebouwd worden is iets wat een testnet mag doen. Sterker nog, ' +
      'daarom bestaan testnetten: zodat dit soort veranderingen hier gebeurt, en niet op mainnet.',

    lostTitle: 'Wat verloren gaat',
    lostDesc: 'Alles, zonder uitzondering:',
    lost1: 'Elke door gebruikers gestarte L1, ook chains die prima draaien.',
    lost2: 'Elk LOVE9-saldo, inclusief tokens die je van de kraan hebt gekregen.',
    lost3: 'Elke transactie, elk blok, de volledige geschiedenis van C-Chain, P-Chain en X-Chain.',
    lost4: 'Elke validator en elke delegatie.',

    keptTitle: 'Wat bewaard blijft',
    keptDesc:
      'Vóór het wissen wordt het hele stervende netwerk geëxporteerd met een gepubliceerde hash, zodat ' +
      'het verslag verifieerbaar blijft. Wat er is gebeurd kan nog worden gecontroleerd, ook wanneer ' +
      'het netwerk dat het uitvoerde er niet meer is. De archieflink wordt hier op de dag van de ' +
      'heropbouw geplaatst.',

    toDoTitle: 'Wat je moet doen',
    toDoBefore: 'Vóór de heropbouw:',
    toDo1:
      'Bouw nu niets op A1 dat ervan afhangt dat data blijft bestaan. Ben je een idee aan het ' +
      'uitproberen, ga gerust je gang — behandel de huidige chain alleen niet als opslag.',
    toDoAfter: 'Na de heropbouw:',
    toDo2:
      'Verwijder uit je wallet elke afzonderlijke L1 die je had toegevoegd — die chains bestaan niet ' +
      'meer, en een wallet die ernaar wijst blijft simpelweg stilstaan. Het hoofdnetwerk A1 hoeft niet ' +
      'verwijderd te worden: de instellingen zijn ongewijzigd.',
    toDo3:
      'Heeft je wallet het A1-netwerk nog niet, voeg het dan toe met de knop op de kraanpagina in ' +
      'plaats van de instellingen met de hand in te typen.',
    toDo4: 'Vraag opnieuw tokens aan bij de kraan, en start je chain opnieuw als je hem wilt.',

    silentTitle: 'Je wallet zal je niet waarschuwen',
    silentDesc:
      'Het nieuwe netwerk behoudt Chain ID {chainId}, hetzelfde RPC-adres en dezelfde naam als het ' +
      'oude. Dat is opzet — zodat elk reeds gepubliceerd document en elke handleiding correct blijft. ' +
      'De prijs is dat je wallet geen enkel signaal heeft dat hij zojuist met een ander netwerk ' +
      'verbonden is. De twee dingen hieronder gebeuren daarom geruisloos.',
    silent1:
      'Een wallet met de oude configuratie maakt nog steeds verbinding, toont nog steeds de juiste ' +
      'netwerknaam en meldt een saldo van 0. Dat getal is JUIST: je oude tokens bestaan niet meer, ze ' +
      'zijn niet verborgen. Je hoeft het netwerk niet opnieuw toe te voegen — vraag gewoon nieuwe ' +
      'tokens bij de kraan. Meldt je wallet een vastgelopen transactie of een verkeerd volgnummer, wis ' +
      'dan de activiteitsgegevens van dat netwerk in de wallet: hij onthoudt nog het transactieaantal ' +
      'van een dode chain, terwijl de nieuwe chain vanaf 0 telt.',
    silent2:
      'Heb je nog een ondertekende transactie die nooit is uitgezonden, gooi hem dan weg. De ' +
      'handtekening is nog geldig op het nieuwe netwerk, omdat het Chain ID niet is veranderd. Hij ' +
      'mislukt zolang de wallet leeg is — maar op het moment dat je tokens bij de kraan aanvraagt ' +
      'wordt hij besteedbaar, en hij kan doorgaan op een moment dat je niet verwacht.',

    repeatTitle: 'Gebeurt dit opnieuw',
    repeatDesc:
      'Mogelijk. A1 is nog steeds een testnet, en tot de gemeenschap tussen A1 en C1 een mainnet-richting ' +
      'kiest, houden we het recht om het netwerk opnieuw op te bouwen wanneer er iets binnen de genesis ' +
      'moet veranderen. Wat we wel beloven is je vooraf te waarschuwen en duidelijk te zeggen wat er ' +
      'verloren gaat.',

    alreadyTitle: 'Al één keer opnieuw opgebouwd op 2026-08-27',
    alreadyDesc:
      'A1 is al één keer opnieuw opgebouwd op 2026-08-27, vóór de datum hieronder. Had je daarvóór testtokens, dan is je saldo nu 0 — dat klopt, het is geen storing in je wallet. Er is geen enkele gebruikerschain verloren gegaan: de lijst bevatte alleen automatische testchains. Vraag opnieuw tokens aan bij de kraan.',
    dateNote: 'De datum kan opschuiven',
    dateNoteDesc:
      'De datum {date} hangt af van een eerdere go/no-go-controle. Schuift die op, dan wijzigen we de ' +
      'datum op deze pagina in plaats van te zwijgen.',
  },

  footer: {
    tryIt: 'Uitproberen',
    explore: 'Verkennen',
    about: 'Over',
    explorer: '9Scan-A1 explorer',
    mainSite: 'Hoofdsite 9Chain',
    opensNewTab: '(opent in een nieuw tabblad)',
    navLabel: 'Links in de voettekst',
    rebuildPlan: 'Plan voor netwerkheropbouw',
  },

  nav: {
    home: 'Home',
    faucet: 'Testtokens halen',
    launch: 'Een chain starten',
    myChains: 'Mijn chains',
    compare: 'A1 ↔ C1',
    directory: 'L1-lijst',
    explorer: 'Explorer',
    explorerAria: 'Open 9Scan-A1 in een nieuw tabblad',
  },

  home: {
    testnetBadge: 'Testnet — tokens hebben geen echte waarde',
    primaryCta: 'Start je chain',
    secondaryCta: 'Haal eerst testtokens',

    title: 'Start je eigen chain op A1',
    subtitle: 'Een eigen L1, in bezit van de wallet waarmee je ondertekent, die echt draait op het testnetwerk. Duurt ongeveer drie minuten.',
    tableCaption: 'Elke rij is een echte chain die op A1 draait, met een eigen eigenaar.',
    colChain: 'Chain',
    colType: 'Type',
    colOwner: 'Eigenaar',
    systemDefault: 'systeemstandaard',
    emptyTitle: 'Er draait nog geen L1',
    emptyDesc: 'Jij zou de eerste zijn. De lijst wordt bijgewerkt zodra je chain draait.',

    disclosure: '9 van de 10 validators draaien op dezelfde server, bij dezelfde aanbieder; de tiende sloot zich van elders aan en is slechts met tussenpozen online — gedecentraliseerd op protocolniveau, nog niet op infrastructuurniveau.',
    idleBlocksNote: 'Avalanche produceert geen lege blokken, dus een blokhoogte die stilstaat terwijl niemand transacties doet is normaal. De maat voor leven is het aantal validators ernaast.',
  },

  stats: {
    title: 'Netwerk draait',
    validators: 'Verbonden validators',
    l1Count: 'Draaiende L1’s',
    blockHeight: 'C-Chain-blok',
    measuring: 'Netwerk meten…',
    cannotMeasure: 'Kon netwerkstatistieken niet lezen',
    cannotMeasureDesc: 'De pagina werkt gewoon — dit is alleen de statusweergave.',
  },
  directory: {
    lede: 'Elke chain op het A1-testnet en de werkelijke staat van elk ervan.',
    howToTitle: 'Hoe je deze tabel leest.',
    howToBody: 'Avalanche maakt geen lege blokken — een chain maakt er alleen een als er een transactie is, dus een blokteller die stilstaat is normaal en betekent niet dat de chain dood is. Het omgekeerde geval is het gevaarlijke: een chain zonder validators antwoordt nog steeds op RPC, laat saldi nog steeds lezen en wallets verbinden er nog steeds mee — maar elke transactie blijft eeuwig hangen. Het echte teken van leven is hier dus het aantal subnet-validators, direct van de P-Chain gelezen, niet de blokhoogte.',
    ownerTitle: 'De eigenaar (admin)',
    ownerBody: 'is het adres dat bij het starten van de chain is opgegeven. Het houdt de volledige genesis-voorraad en het recht om de kosten van die chain te wijzigen — de chain hoort bij hen, niet bij de foundation. Chains die zijn gestart voordat de console dit veld had, tonen een systeemstandaard.',
    mainNetwork: 'HOOFDNETWERK',
    mainNetworkDesc: 'De C-Chain van het A1-testnet — waar de faucet en de explorer werken.',
    running: 'ACTIEF',
    notAnswering: 'ANTWOORDT NIET',
    notAnsweringDesc: 'De RPC antwoordt niet — misschien volgt nog geen node dit subnet.',
    unclear: 'ONDUIDELIJK',
    unclearDesc: 'De validatorenset kon niet van de P-Chain gelezen worden.',
    ownerAdmin: 'Eigenaar (admin)',
    blocks: 'Blokken',
    subnetValidators: 'Subnet-validators',
    created: 'Aangemaakt',
    revokedAt: 'Ingetrokken op',
    copyOwner: 'Eigenaarsadres kopiëren',
    revoked: 'INGETROKKEN',
    revokedDesc: 'Deze chain dient niets meer: geen enkele node draait hem nog en zijn RPC antwoordt niet meer. Als je dit netwerk aan een wallet hebt toegevoegd, verwijder het dan — laten staan levert alleen verbindingsfouten op.',
    neverReissued: 'wordt nooit opnieuw aan een andere chain uitgegeven',
    revokedGroup: 'Ingetrokken ({count})',
    listError: 'De chainlijst kon niet gelezen worden ({error}). Het hoofdnetwerk wordt hieronder nog steeds getoond.',
    footSummary: '{count} L1 actief + het hoofdnetwerk',
    footRevoked: '{count} ingetrokken',
    footUpdated: 'bijgewerkt om {time}',
  },


  loadTest: {
    badge: 'Belastingtest',
    banner: 'We voeren een openbare belastingtest uit — {tps} transacties per seconde, door ons gegenereerd, niet door echte gebruikers.',
    bannerLink: 'Bekijk de live cijfers',
    title: 'Openbare belastingtest',
    intro: 'A1 is een jong testnetwerk met heel weinig echte gebruikers, dus vanzelf produceert het bijna geen blokken. Wij genereren een gestage stroom transacties zodat het netwerk voortdurend werkt en je het aan het werk kunt zien. Dit verkeer is van ons. Het is geen gebruik en we tellen het ook niet als gebruik — elk adres dat het verstuurt staat hieronder, zodat je het eraf kunt trekken.',
    running: 'Draait nu',
    stopped: 'Draait momenteel niet',
    stoppedWhy: 'Vastgelegde reden: {reason}',
    labelTps: 'Transacties per seconde',
    labelBlockHeight: 'C-Chain-blok',
    labelSecondsPerBlock: 'Seconden per blok',
    labelTotal: 'Bevestigde transacties sinds de start',
    labelUptime: 'Draait al',
    committedNote: 'Deze cijfers worden geteld uit de blokken zelf, niet uit wat we probeerden te versturen. Een transactie die het netwerk accepteerde maar nooit in een blok opnam, telt hier niet mee.',
    addressesTitle: 'De negen verzendende adressen',
    addressesNote: 'Elke transactie van deze adressen wordt door een machine van ons gegenereerd. Filter ze eruit om te zien welke echte activiteit er is.',
    measuring: 'Status van de belastingtest wordt gelezen…',
    notMeasured: 'Status van de belastingtest kon niet worden gelezen',
    notMeasuredMore: 'De pagina werkt gewoon — dit is alleen de statusweergave.',
  },

  launch: {
    title: 'Start je chain',
    desc:
      'Een eigen L1, in bezit van je wallet. Je tekent één keer om te bewijzen wie je bent, je ' +
      'controleert alles, en het netwerk bouwt de chain in ongeveer drie minuten.',

    connectWallet: 'Wallet verbinden',
    connecting: 'Verbinden…',
    signIn: 'Inloggen',
    signing: 'Wachten op handtekening…',
    yourWallet: 'Jouw wallet',
    youWillOwn: 'De chain wordt eigendom van deze wallet. Het adres komt uit je handtekening — niemand typt het in.',
    noWallet: 'Geen wallet gevonden in deze browser. Installeer MetaMask en herlaad de pagina.',
    signRejected: 'Je hebt geweigerd te ondertekenen. Er is niets aangemaakt.',
    switchWallet: 'Een andere wallet gebruiken',

    nameLabel: 'Naam van de chain',
    namePlaceholder: 'Bijvoorbeeld: MyChain',
    nameHelp:
      'Letters, cijfers en spaties. 2–32 tekens. Op dit netwerk wordt een naam die ooit is gebruikt ' +
      'nooit opnieuw uitgegeven — ook niet voor een ingetrokken chain.',
    nameInvalid: 'De naam mag alleen letters, cijfers en spaties bevatten, met een lengte van 2–32 tekens.',
    typeLabel: 'Type chain',
    typeHelp: 'Eenmaal gekozen ligt dit vast — de genesis van een chain kan niet worden bewerkt.',
    slotsLeft: '{left}/{total} plekken over',
    slotsFull: 'Geen plekken meer',
    slotsFullDesc:
      'In het huidige model volgt elke validator elke L1, en het protocol verwijdert een node die meer ' +
      'dan 16 subnetten declareert. Dit is een harde bovengrens die niet verhoogd kan worden. Een chain ' +
      'intrekken geeft één plek terug.',
    reviewCta: 'Controleer voor het verzenden',

    reviewTitle: 'Controle — dit is een eenrichtingsdeur',
    reviewDesc:
      'De genesis van een gestarte L1 is ONVERANDERLIJK. Na deze stap kunnen de naam, het type chain ' +
      'en de eigenaar niet meer worden gewijzigd — en intrekken geeft de naam en het chain ID ook niet ' +
      'terug.',
    reviewRebuild:
      'Nog iets om te weten voordat je drukt: A1 bouwt het hele netwerk opnieuw op op {date}. De chain ' +
      'die je vandaag start wordt samen met het oude netwerk gewist — niet verborgen, maar weg.',
    reviewName: 'Naam van de chain',
    reviewType: 'Type chain',
    reviewOwner: 'Eigenaar',
    reviewBack: 'Terug en aanpassen',
    reviewConfirm: 'Ik heb het gecontroleerd — start de chain',

    launching: 'Chain “{name}" wordt gestart',
    launchingDesc:
      'De nodes herstarten ÉÉN VOOR ÉÉN zodat het netwerk nooit het quorum verliest — daarom duurt het ' +
      'lang, en dat is opzet. Sluit het tabblad niet; doe je dat toch, dan wordt de chain alsnog gebouwd.',
    etaRemaining: 'Nog ongeveer {minutes} minuten',
    preparing: 'Voorbereiden…',

    doneTitle: 'Klaar — chain “{name}" draait',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Chain aan wallet toevoegen',
    doneAdded: 'Toegevoegd aan wallet',
    doneActivate: 'Chain activeren (blok 1 openen)',
    doneActivated: 'Geactiveerd',
    doneActivating: 'Wachten op wallet…',
    doneAddWalletError: 'Kon de chain niet aan je wallet toevoegen. {detail}',
    doneActivateError: 'Kon de chain niet activeren. {detail}',

    launchAnother: 'Nog een chain starten',
    launchError: 'Kon de chain niet starten. {detail}',
    unknownError: 'De chain verscheen na afloop niet in de lijst.',
    noteTitle: 'De eerste transactie op een nieuwe chain',
    noteHow:
      'Vertrouw de gasschatting voor de eerste transactie niet. De goedkoopste manier om blok 1 te ' +
      'openen is een gewone overboeking — druk hieronder op “Chain activeren".',
  },

  myChains: {
    title: 'Mijn chains',
    desc: 'De L1’s die eigendom zijn van de wallet waarmee je bent ingelogd. Ze kunnen worden ingetrokken, maar lees eerst de waarschuwing.',
    connectWallet: 'Verbind je wallet om je chains te zien',
    emptyTitle: 'Deze wallet bezit nog geen enkele chain',
    emptyDesc: 'Start er een en kom terug — hij verschijnt hier meteen.',
    emptyCta: 'Start je chain',

    colChain: 'Chain',
    colType: 'Type',
    colStatus: 'Status',
    colActions: '',

    validatorCount: '{count} validators',
    measuring: 'meten',
    cannotMeasure: 'kon niet meten',
    statusHelp: 'Gemeten aan het aantal validators van het subnet, niet aan de blokhoogte.',
    noValidators: '0 validators',
    noValidatorsDesc:
      'Deze chain kan GEEN enkele transactie afronden: het subnet heeft geen validators. Hij ' +
      'beantwoordt nog steeds RPC-aanroepen en wallets maken nog steeds verbinding, dus er is geen ' +
      'ander zichtbaar teken.',

    walletSettings: 'Wallet-instellingen',
    addToWallet: 'Toevoegen aan wallet',
    addedToWallet: 'Toegevoegd',
    addWalletError: 'Kon het niet aan je wallet toevoegen. {detail}',

    revoke: 'Intrekken',
    revokeTitle: '“{name}" intrekken?',
    revokeWarn1: 'De chain stopt onmiddellijk met RPC en verdwijnt uit de openbare lijst.',
    revokeWarn2:
      'Intrekken verwijdert het subnet op de P-Chain NIET — wat daar is aangemaakt kan niet worden ' +
      'verwijderd zolang dit netwerk draait. Het haalt het netwerk ook niet weg uit de wallets van ' +
      'mensen die deze chain al hadden toegevoegd.',
    revokeWarn3:
      'De naam en het Chain ID blijven gereserveerd en worden op dit netwerk NOOIT opnieuw aan iemand ' +
      'uitgegeven. Een Chain ID opnieuw uitgeven zou de wallet van een vroegere gebruiker geruisloos ' +
      'naar de chain van iemand anders laten wijzen.',
    revokeWarn4: 'In ruil daarvoor komt één van de 15 plekken terug.',
    revokeTypeLabel: 'Typ de naam van de chain exact om te bevestigen',
    revokeNameMismatch: 'Dat komt niet overeen met de naam van de chain.',
    revokeConfirm: 'Definitief intrekken',
    revokeCancel: 'Annuleren',
    revoking: '“{name}" wordt ingetrokken — ongeveer drie minuten',
    revokeDone: '“{name}" ingetrokken. {left}/{total} plekken over.',
    revokeError: 'Kon niet intrekken. {detail}',
    revokeUnknown: 'De chain staat na afloop nog steeds in de lijst.',

    revokedBadge: 'Ingetrokken',
    revokedDesc: 'Naam en Chain ID blijven gereserveerd op dit netwerk.',
  },

  compare: {
    title: 'A1 ↔ C1 — vergelijking',
    desc:
      '9Chain draait TWEE testnetten van hetzelfde product naast elkaar, met een verschillende engine: ' +
      'A1 op de Avalanche-engine, C1 op de Cosmos-engine. Deze tabel legt de afwegingen tussen beide ' +
      'richtingen vast en is gepubliceerd zodat iedereen ertegenin kan gaan — de C1-kant heeft nog ' +
      'geen live metingen.',

    selfScoreTitle: 'De scores hieronder zijn een ZELFBEOORDELING door het team, niet onafhankelijk gemeten',
    selfScoreDesc:
      'De kolom "hoe het is gemeten" vertelt hoe elk criterium is gecontroleerd. Elk criterium zonder ' +
      'gedateerde meting is een architectuuroordeel, geen data. De wegingen bepaal je zelf — de score ' +
      'volgt daaruit.',

    colNo: '#',
    colCriterion: 'Criterium',
    colKind: 'Type',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Weging',
    kindArchitecture: 'architectuur',
    kindLiveData: 'live data',

    totalScore: 'Totaalscore met jouw wegingen',
    tied: 'Gelijk',
    leads: 'voorop',

    liveDataTitle: 'Live data',
    a1Validators: 'A1 — verbonden validators',
    a1Chains: 'A1 — draaiende L1’s',
    a1Blocks: 'A1 — C-Chain-blok',
    c1Unreachable: 'C1 — niet bereikbaar',
    c1UnreachableDesc:
      'De Cosmos REST-URL van C1 (poort 1317) is nodig. De tabel werkt gewoon: de A1-kant is live data, ' +
      'de C1-kant is een architectuuroordeel, net als de overige criteria.',
    measuring: 'meten…',
    cannotMeasure: 'kon niet meten',
    critDecentralisation: 'Decentralisatie (bovengrens aantal validators)',
    noteDecentralisation: 'Plafond van het PROTOCOL: Snowman ~duizenden nodes tegenover CometBFT ~150. A1 VANDAAG: 9 nodes, één machine, één aanbieder',
    critFinality: 'Finaliteit',
    noteFinality: '~1–2s tegenover ~5–6s',
    critEvmMaturity: 'Volwassenheid van de EVM',
    noteEvmMaturity: 'coreth in productie tegenover Cosmos EVM vóór v1',
    critWalletCompat: 'Compatibiliteit met consumentenwallets en DeFi',
    noteWalletCompat: 'volledig MetaMask/EVM',
    critLaunchUx: 'Ervaring bij het starten van een chain',
    noteLaunchUx: 'beide hebben een console; bij A1 gemeten op ~170s per keer',
    critInterop: 'Breedte van interoperabiliteit',
    noteInterop: 'Warp/ICM binnen het ecosysteem (A1 heeft al waarde verplaatst, M6.2) tegenover het bereik van IBC',
    critOpCost: 'Bedrijfskosten per chain',
    noteOpCost: 'node + plugin tegenover K8s-operator',
    critBootstrap: 'Op gang brengen van netwerkeffecten',
    noteBootstrap: 'een eigen eiland tegenover IBC dat in de Cosmos-economie steekt',
    critEconSecurity: 'Publieke economische veiligheid',
    noteEconSecurity: 'PoS met tokendekking vanaf het begin',
    critSwitchCost: 'Overstapkosten voor het team',
    noteSwitchCost: 'A1 is nieuw tegenover C1 dat al maanden draait',
  },

  faucet: {
    title: 'Testtokens halen',
    desc:
      'LOVE9 op het A1-testnet heeft geen echte waarde — het bestaat zodat je gas kunt betalen tijdens ' +
      'het testen. Voer een walletadres in en we sturen meteen wat.',
    addressLabel: 'Jouw walletadres',
    addressPlaceholder: '0x… (40 hextekens)',
    requestCta: 'Stuur me tokens',
    sending: 'Versturen…',
    addressHelp: 'Plak het walletadres dat de tokens moet ontvangen. Druk hierboven op “Netwerk aan wallet toevoegen" als je dat nog niet hebt gedaan.',
    addNetwork: 'Netwerk aan wallet toevoegen',
    addNetworkDone: 'Toegevoegd aan wallet',
    addNetworkRejected: 'Je hebt in je wallet op weigeren gedrukt. Druk opnieuw als je het netwerk wilt toevoegen.',
    addNetworkError: 'Je wallet kon het netwerk niet toevoegen. Voeg het handmatig toe met de instellingen hiernaast — en stuur onderstaande regel naar het team:',
    noWallet: 'Geen wallet gevonden in deze browser. Installeer MetaMask en herlaad de pagina.',
    quotaLabel: 'Resterend quotum',
    quotaFormat: '{left}/{total} aanvragen per {hours} uur',
    quotaExhausted: 'Je hebt je hele quotum gebruikt. Probeer het over {minutes} minuten opnieuw.',
    quotaUnreadable: 'Kon je quotum niet lezen — je kunt nog steeds aanvragen, je weet alleen niet hoeveel er over is.',
    sentOk: '{count} {symbol} gestuurd naar {address}',
    viewTransaction: 'Transactie bekijken',
    settingsTitle: 'Netwerkinstellingen',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Symbool',
    settingsDecimals: 'Decimalen',
    settingsExplorer: 'Explorer',
    decimalsHelp:
      'Wallets tonen 18 decimalen omdat de C-Chain de EVM draait. Op de P/X-Chain telt LOVE9 in 9 ' +
      'decimalen. Eén munt, twee schalen — geen twee verschillende tokens.',
    genericError: 'Versturen mislukt. {detail}',
  },

  langPicker: {
    label: 'Taal',
    machineBadge: 'machine',
    machineNote: 'Alleen de Vietnamese versie is door een mens nagekeken. De andere vertalingen zijn machinaal gemaakt en kunnen fout zijn — de Engelse versie is de bron van waarheid.',
    notAvailable: 'nog niet beschikbaar',
  },

  errors: {
    unreachable: 'Kon het netwerk niet bereiken',
    unreachableDesc: 'Het netwerk is mogelijk druk, of je verbinding is weggevallen.',
    empty: 'Hier is nog niets',
    addressEmpty: '{label} mag niet leeg zijn',
    addressFormat: '{label} moet 0x zijn, gevolgd door 40 hexadecimale tekens',
    addressChecksum: '{label} haalt zijn EIP-55-controlesom niet — waarschijnlijk is één teken verkeerd getypt of bij het plakken verloren',
    addressZero: '{label} mag niet het nuladres zijn — niemand heeft daarvan de sleutel',
    timeout: 'Geen antwoord na {seconds}s',
    notJson: 'Het antwoord was geen JSON (HTTP {status}) — het verzoek is waarschijnlijk naar de verkeerde plek gerouteerd',
    noWallet: 'Geen wallet gevonden in deze browser.',
  },

  notFound: {
    code: '404',
    title: 'Deze pagina bestaat niet',
    desc:
      'Het adres dat je hebt geopend bestaat niet op 9Chain Testnet A1. ' +
      'Misschien is het hernoemd, of zijn er bij het kopiëren een paar tekens uit de URL weggevallen.',
    topPagesTitle: 'De drie meestgebruikte pagina’s:',
    navLabel: 'Waarheen nu',
    goHome: 'Terug naar home',
    goFaucet: 'Testtokens halen',
    goLaunch: 'Start je chain',
    lookingForTx: 'Zoek je een transactie of een adres? Controleer de hash en probeer het opnieuw.',
  },
};

export default nl;
