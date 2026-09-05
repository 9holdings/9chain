import type { Dict } from '../en';

/**
 * Italiano — traduzione automatica, non verificata da una persona.
 * La lingua di partenza è l'inglese (`../en.ts`); in caso di divergenza vale la versione inglese.
 *
 * 🔴 Questi tre punti non vanno addolciti: `reGenesis.*` (la rete verrà cancellata),
 * `deChain.soatMoTa` (porta a senso unico), `chainCuaToi.thuHoiY*` (la revoca non restituisce
 * il nome). Dicono "definitivamente" e "non modificabile" perché nessuno perda beni credendo
 * che si possa tornare indietro.
 */
export const it: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: 'La testnet pubblica di 9Chain — una rete indipendente che gira sul motore Avalanche',
    tagline: 'una rete indipendente sul motore Avalanche',
    walletRejected: 'Hai rifiutato la richiesta nel tuo wallet. Non è cambiato nulla.',
    noWalletMobile: "Il browser di un telefono non può avere un'estensione portafoglio. Apri invece questa pagina dentro l'app MetaMask: il suo browser integrato ha già il portafoglio.",
    openInMetaMask: "Apri nell'app MetaMask",
    loading: 'Caricamento…',
    retry: 'Riprova',
    copy: 'Copia',
    copied: 'Copiato',
    close: 'Chiudi',
    openMenu: 'Apri il menu',
    closeMenu: 'Chiudi il menu',
    switchToDark: 'Passa alla modalità scura',
    switchToLight: 'Passa alla modalità chiara',
    skipToContent: 'Vai al contenuto principale',
    stepDone: ' — fatto',
    stepRunning: ' — in corso',
    stepFailed: ' — fallito',
    stepPending: ' — in attesa',
  },

  presets: {
    standard: {
      name: 'Standard',
      desc: 'Una chain EVM normale. Il proprietario riceve tutti i token del genesis e il diritto di modificare le commissioni.',
    },
    'zero-fee': {
      name: 'Commissioni quasi nulle',
      desc: 'baseFee = 1 wei, quindi una transazione paga esattamente quel minimo (un trasferimento costa 0,000000000000021 LOVE9). Adatta a giochi, esperimenti e chain interne. In cambio: quasi nulla frena lo spam.',
    },
    'high-throughput': {
      name: 'Alto throughput',
      desc: 'Cinque volte più transazioni per blocco (gasLimit 60 milioni invece di 12). Adatta a giochi, exchange e a tutto ciò che ha un flusso costante di piccole transazioni. In cambio: blocchi più pesanti, e chi gestisce un nodo per questa chain ha bisogno di una macchina più potente.',
    },
    mintable: {
      name: 'Offerta coniabile',
      desc: "Il proprietario può coniare altro token nativo in qualsiasi momento tramite il precompilato 0x0200000000000000000000000000000000000001. L'offerta NON è fissa: chiunque usi questa chain deve saperlo.",
    },
    'owner-deploy-only': {
      name: 'Deploy dei contratti riservato al proprietario',
      desc: 'Gli altri possono ancora inviare transazioni e usare i contratti esistenti, ma non fare il deploy dei propri. Il proprietario concede quel diritto a chiunque tramite il precompilato 0x0200000000000000000000000000000000000000.',
    },
    permissioned: {
      name: 'Con permessi (solo mittenti approvati)',
      desc: "Solo gli indirizzi in elenco possono INVIARE transazioni. Adatta alla chain interna di un'azienda. ⚠️ È il preset più rigido: un wallet sconosciuto che arriva qui non può fare nulla.",
    },
  },
  steps: {
    genesis: 'Costruzione del genesis',
    subnet: 'Creazione di subnet e blockchain sulla P-Chain',
    rpc: "In attesa della risposta dell'RPC della L1",
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',

    banner: 'A1 è stata ricostruita il {date}. Ogni saldo e ogni catena creati prima di quella data non esistono più.',
    bannerLink: 'Che cosa significa',
    badge: 'Ricostruita',

    title: 'A1 è stata ricostruita il {date}',
    desc:
      'La rete di test A1 è stata ricostruita dal blocco 0. Catene, saldi e cronologia delle ' +
      'transazioni creati prima di quella data non esistono più — non sono nascosti, sono spariti. ' +
      'Questa pagina spiega che cosa stai vedendo e che cosa fare.',

    willSeeTitle: 'Che cosa vedrai',
    willSee1:
      'Il tuo wallet si collega ancora, mostra ancora il nome di rete corretto e lo stesso Chain ID ' +
      '{chainId} — è stato voluto. Ma il tuo saldo sarà 0.',
    willSee2:
      'Ogni L1 che hai avviato è sparita dall’elenco. I loro nomi e Chain ID sono di nuovo liberi, ' +
      'e chiunque può prenderli.',
    willSee3:
      'Se hai firmato una transazione senza mai trasmetterla, non trasmetterla adesso — ' +
      'appartiene a una rete che non esiste più.',

    toDoTitle: 'Che cosa devi fare',
    toDo1: 'Richiedi di nuovo i token di test dal faucet. I limiti sono stati azzerati per tutti.',
    toDo2:
      'Rimuovi dal wallet ogni singola L1 — hanno Chain ID propri e ora non puntano a nulla. ' +
      'La rete principale A1 NON va rimossa; le sue impostazioni non sono cambiate.',
    toDo3: 'Riavvia la tua catena se ti serve. Qualcun altro potrebbe aver preso il vecchio nome.',

    archiveTitle: 'Archivio della vecchia rete',
    archiveDesc:
      'Lo stato finale della rete prima della ricostruzione è stato esportato e il suo hash ' +
      'pubblicato, così chi vuole verificarlo può farlo.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1 verrà ricostruita il {date} — ogni catena, saldo e transazione creati prima di allora saranno cancellati.',
    bannerLink: 'Dettagli',
    badge: 'Ricostruzione in arrivo',

    title: 'A1 verrà ricostruita il {date}',
    desc:
      'L’intera rete di test A1 verrà ricostruita dal blocco 0. Tutto ciò che è stato creato prima ' +
      'di quella data sparirà — non sarà nascosto, semplicemente non esisterà più. Questa pagina dice ' +
      'esattamente che cosa si perde e che cosa devi fare.',

    whyTitle: 'Perché la ricostruzione è necessaria',
    why1:
      'Il genesis di una rete è immutabile. È proprio questo a renderla affidabile — nessuno, ' +
      'nemmeno chi l’ha costruita, può cambiare un numero una volta che è stato scritto nel blocco 0.',
    why2:
      'Il prezzo è questo: cambiare un numero dentro il genesis non lascia altra scelta che ' +
      'ricostruire la rete da zero. A1 ha portato l’offerta totale a 9.000.000.000 LOVE9, e l’intera ' +
      'gamma dei parametri di staking ha dovuto essere ricalcolata di conseguenza.',
    why3:
      'Questa è una testnet, e ricostruirsi è una cosa che a una testnet è concessa. Anzi, è il ' +
      'motivo per cui le testnet esistono: perché cambiamenti come questo avvengano qui, non in mainnet.',

    lostTitle: 'Che cosa andrà perso',
    lostDesc: 'Tutto, senza eccezioni:',
    lost1: 'Ogni L1 avviata dagli utenti, comprese le catene che funzionano perfettamente.',
    lost2: 'Ogni saldo LOVE9, compresi i token ricevuti dal faucet.',
    lost3: 'Ogni transazione, ogni blocco, l’intera cronologia di C-Chain, P-Chain e X-Chain.',
    lost4: 'Ogni validatore e ogni delega.',

    keptTitle: 'Che cosa viene conservato',
    keptDesc:
      'Prima della cancellazione, l’intera rete morente verrà esportata con un hash pubblicato, così ' +
      'che il registro resti verificabile. Quel che è accaduto potrà ancora essere controllato, anche ' +
      'quando la rete che lo ha eseguito non ci sarà più. Il link all’archivio verrà pubblicato qui ' +
      'il giorno della ricostruzione.',

    toDoTitle: 'Che cosa devi fare',
    toDoBefore: 'Prima della ricostruzione:',
    toDo1:
      'Non costruire ora su A1 nulla che dipenda dalla sopravvivenza dei dati. Se stai provando ' +
      'un’idea, fai pure — solo, non trattare la catena attuale come un archivio.',
    toDoAfter: 'Dopo la ricostruzione:',
    toDo2:
      'Rimuovi dal wallet ogni singola L1 che avevi aggiunto — quelle catene non esistono più, e un ' +
      'wallet che punta lì resterà semplicemente fermo. La rete principale A1 non va rimossa: le sue ' +
      'impostazioni non sono cambiate.',
    toDo3:
      'Se il tuo wallet non ha ancora la rete A1, aggiungila con il pulsante nella pagina del faucet ' +
      'invece di digitare le impostazioni a mano.',
    toDo4: 'Richiedi di nuovo i token dal faucet e riavvia la tua catena se la vuoi.',

    silentTitle: 'Il tuo wallet non ti avviserà',
    silentDesc:
      'La nuova rete mantiene il Chain ID {chainId}, lo stesso indirizzo RPC e lo stesso nome della ' +
      'vecchia. È voluto — così ogni documento e ogni guida già pubblicati restano corretti. Il prezzo ' +
      'è che il tuo wallet non ha alcun segnale del fatto che si è appena collegato a una rete diversa. ' +
      'Le due cose qui sotto avverranno quindi in silenzio.',
    silent1:
      'Un wallet con la vecchia configurazione si collega ancora, mostra ancora il nome di rete ' +
      'corretto e riporterà un saldo di 0. Quel numero è CORRETTO: i tuoi vecchi token non esistono ' +
      'più, non sono nascosti. Non devi riaggiungere la rete — richiedi solo nuovi token dal faucet. ' +
      'Se il wallet segnala una transazione bloccata o un numero di sequenza sbagliato, cancella i ' +
      'dati di attività di quella rete nel wallet: ricorda ancora il conteggio delle transazioni di ' +
      'una catena morta, mentre la nuova catena conta da 0.',
    silent2:
      'Se hai ancora una transazione firmata e mai trasmessa, buttala. La firma è ancora valida sulla ' +
      'nuova rete, perché il Chain ID non è cambiato. Fallirà finché il wallet è vuoto — ma nel momento ' +
      'in cui richiedi token dal faucet diventa spendibile, e potrebbe passare in un momento che non ' +
      'ti aspetti.',

    repeatTitle: 'Succederà di nuovo',
    repeatDesc:
      'Possibile. A1 è ancora una testnet e, finché la comunità non sceglie una direzione di mainnet ' +
      'tra A1 e C1, ci riserviamo il diritto di ricostruire la rete quando qualcosa dentro il genesis ' +
      'deve cambiare. Quello che ci impegniamo a fare è avvisarti in anticipo e dire chiaramente che ' +
      'cosa si perde.',

    alreadyTitle: 'Già ricostruita una volta il 2026-08-27',
    alreadyDesc:
      'A1 è già stata ricostruita una volta il 2026-08-27, prima della data qui sotto. Se prima di allora avevi token di test, il tuo saldo ora è 0 — è corretto, non è un guasto del tuo wallet. Nessuna catena degli utenti è andata persa: l’elenco conteneva solo catene di test automatiche. Richiedi di nuovo i token dal faucet.',
    dateNote: 'La data può slittare',
    dateNoteDesc:
      'La data {date} dipende da un controllo go/no-go precedente. Se slitta, cambieremo la data su ' +
      'questa pagina invece di restare in silenzio.',
  },

  footer: {
    tryIt: 'Prova',
    explore: 'Esplora',
    about: 'Informazioni',
    explorer: 'Explorer 9Scan-A1',
    mainSite: 'Sito principale 9Chain',
    opensNewTab: '(si apre in una nuova scheda)',
    navLabel: 'Link a piè di pagina',
    rebuildPlan: 'Piano di ricostruzione della rete',
  },

  nav: {
    home: 'Home',
    faucet: 'Ottieni token di test',
    launch: 'Avvia una catena',
    myChains: 'Le mie catene',
    compare: 'A1 ↔ C1',
    directory: 'Elenco L1',
    explorer: 'Explorer',
    explorerAria: 'Apri 9Scan-A1 in una nuova scheda',
    ceremony: "Cerimonia",
  },

  home: {
    testnetBadge: 'Testnet — i token non hanno valore reale',
    primaryCta: 'Avvia la tua catena',
    secondaryCta: 'Prima ottieni token di test',

    title: 'Avvia la tua catena su A1',
    subtitle: 'Una L1 tutta tua, di proprietà del wallet con cui firmi, che gira davvero sulla rete di test. Richiede circa cinque minuti.',
    tableCaption: 'Ogni riga è una catena reale in funzione su A1, con un proprietario suo.',
    colChain: 'Catena',
    colType: 'Tipo',
    colOwner: 'Proprietario',
    systemDefault: 'predefinito di sistema',
    emptyTitle: 'Nessuna L1 è ancora in funzione',
    emptyDesc: 'Saresti il primo. L’elenco si aggiorna appena la tua catena è attiva.',
    moreChains: 'Vedi tutte le {count} chain nella directory',

    disclosure: '9 degli 11 validatori girano sullo stesso server, presso lo stesso fornitore; gli altri due si sono uniti da altrove e solo uno di loro è online — decentralizzato a livello di protocollo, non ancora a livello di infrastruttura.',
    idleBlocksNote: 'Avalanche non produce blocchi vuoti, quindi un’altezza di blocco che resta ferma mentre nessuno effettua transazioni è normale. La misura di attività è il numero di validatori accanto.',
  },

  stats: {
    title: 'La rete è attiva',
    validators: 'Validatori collegati',
    l1Count: 'L1 in funzione',
    blockHeight: 'Blocco C-Chain',
    measuring: 'Misurazione della rete…',
    cannotMeasure: 'Impossibile leggere le statistiche di rete',
    cannotMeasureDesc: 'La pagina funziona comunque — questo è solo il pannello di stato.',
  },
  directory: {
    lede: 'Ogni catena sulla testnet A1 e lo stato reale di ciascuna.',
    howToTitle: 'Come leggere questa tabella.',
    howToBody: 'Avalanche non produce blocchi vuoti: una catena ne produce uno solo quando c’è una transazione, quindi un contatore di blocchi fermo è normale e non significa che la catena sia morta. Il caso pericoloso è l’opposto: una catena senza validatori risponde ancora all’RPC, permette ancora di leggere i saldi e i portafogli si collegano ancora — ma ogni transazione resta appesa per sempre. Perciò il vero segno di vita qui è il numero di validatori della sottorete, letto direttamente dalla P-Chain, non l’altezza del blocco.',
    ownerTitle: 'Il proprietario (admin)',
    ownerBody: 'è l’indirizzo indicato al lancio della catena. Detiene tutta l’offerta di genesi e il diritto di modificare le commissioni di quella catena: la catena appartiene a lui, non alla fondazione. Le catene lanciate prima che la console avesse questo campo mostrano un valore predefinito di sistema.',
    mainNetwork: 'RETE PRINCIPALE',
    mainNetworkDesc: 'La C-Chain della testnet A1 — dove funzionano il faucet e l’explorer.',
    running: 'IN FUNZIONE',
    notAnswering: 'NON RISPONDE',
    notAnsweringDesc: 'L’RPC non risponde: forse nessun nodo sta ancora seguendo questa sottorete.',
    unclear: 'NON CHIARO',
    unclearDesc: 'Non è stato possibile leggere l’insieme dei validatori dalla P-Chain.',
    ownerAdmin: 'Proprietario (admin)',
    blocks: 'Blocchi',
    subnetValidators: 'Validatori della sottorete',
    created: 'Creata',
    revokedAt: 'Revocata il',
    copyOwner: 'Copia indirizzo del proprietario',
    revoked: 'REVOCATA',
    revokedDesc: 'Questa catena ha smesso di servire: nessun nodo la esegue più e il suo RPC non risponde. Se hai aggiunto questa rete a un portafoglio, rimuovila: lasciarla produce solo errori di connessione.',
    neverReissued: 'mai riassegnata a un’altra catena',
    revokedGroup: 'Revocate ({count})',
    listError: 'Non è stato possibile leggere l’elenco delle catene ({error}). La rete principale è ancora mostrata sotto.',
    footSummary: '{count} L1 in funzione + la rete principale',
    footRevoked: '{count} revocate',
    footUpdated: 'aggiornato alle {time}',
    tileTotal: 'L1 nella directory',
    tileRunning: 'Misurate in esecuzione',
    tileAttention: 'Richiedono attenzione',
    tileRevoked: 'Revocate',
    sweepProgress: 'Misurate {done} di {total}',
    measuringDesc: 'In coda per la misurazione.',
    howToToggle: 'Come leggere questo elenco',
    searchLabel: 'Cerca',
    searchPlaceholder: 'Nome, Chain ID, proprietario o blockchain ID',
    filterStatus: 'Stato',
    filterAll: 'Tutte',
    filterRunning: 'In esecuzione',
    filterAttention: 'Richiedono attenzione',
    filterRevoked: 'Revocate',
    filterType: 'Tipo',
    filterTypeAll: 'Tutti i tipi',
    groupBy: 'Raggruppa per',
    groupNone: 'Nessun raggruppamento',
    groupOwner: 'Proprietario',
    groupType: 'Tipo',
    groupStatus: 'Stato',
    groupNoType: 'Tipo non registrato',
    groupCount: '{shown} di {total}',
    sortBy: 'Ordina',
    sortNewest: 'Più recenti prima',
    sortOldest: 'Più vecchie prima',
    sortName: 'Nome',
    sortChainId: 'Chain ID',
    sortBlocks: 'Più blocchi',
    refresh: 'Misura di nuovo',
    listCaption: 'Chain su A1, con lo stato misurato di ciascuna',
    showing: 'Mostrate {shown} di {total}',
    showMore: 'Mostra altre {count}',
    noMatchTitle: 'Nessuna chain corrisponde',
    noMatchDesc: 'Prova un altro termine o azzera i filtri.',
    clearFilters: 'Azzera filtri',
    showDetails: 'Dettagli',
    hideDetails: 'Nascondi',
    detailsOf: 'Dettagli di {name}',
    nativeToken: 'Token nativo',
    mismatch: 'CHAIN SBAGLIATA',
    mismatchDesc: "L'RPC ha risposto con Chain ID {got} invece di {expected}: quasi certamente un errore di instradamento, non di questa chain.",
  },
  ceremony: {
    badge: "Cerimonia",
    title: "La cerimonia Block Adam",
    desc: "In un secondo esatto la rete scrive tre blocchi con un nome. Questa pagina dice cosa accadrà, cosa portano quei blocchi e come verificarlo dopo senza chiederlo a noi.",
    momentLabel: "L'istante",
    countdownLabel: "Tempo rimanente",
    days: "giorni",
    hours: "ore",
    minutes: "min",
    seconds: "sec",
    yourZone: "Il tuo fuso orario",
    blocksTitle: "I tre blocchi",
    adamDesc: "Il PRIMO blocco il cui timestamp raggiunge l'istante — definito dal tempo, non dall'altezza. Chiunque produca quel blocco, lo produce.",
    evaDesc: "Il blocco immediatamente successivo ad Adam, per altezza.",
    unionDesc: "Dieci blocchi dopo Adam. Qui è ancorato il messaggio 9S Union.",
    messagesTitle: "Cosa portano i blocchi",
    messagesDesc: "Adam ed Eva portano le due frasi già scritte nel blocco 0 quando la rete è stata creata: la cerimonia punta a quegli stessi file, quindi i due non possono divergere. Ogni digest qui sotto è stato congelato il 2026-09-03, prima della cerimonia, e si riproduce con sha256 sui byte grezzi.",
    quietTitle: "Un minuto di silenzio",
    quietDesc: "La C-Chain non produce blocchi vuoti, perciò il traffico sintetico che pubblichiamo sulla pagina in diretta viene fermato poco prima dell'istante. Altrimenti la cerimonia gareggerebbe con un mittente automatico per una finestra di due secondi. Il costo è un minuto di silenzio; ciò che compra è che questi blocchi appartengano alla cerimonia e non a un bot.",
    strangerTitle: "Uno sconosciuto può prendersi il blocco, e il registro regge lo stesso",
    strangerDesc: "A1 è una rete di test pubblica e in quel secondo chiunque può inviare una transazione. Il registro è ancorato all'hash della transazione della cerimonia, mai a un'altezza di blocco: se il blocco di qualcun altro raggiunge l'istante per primo, ciò che è stato scritto resta vero; semplicemente non è stata la cerimonia a produrre quel blocco.",
    checkTitle: "Verifica da solo",
    checkDesc: "Chiedi a un qualsiasi nodo A1 il blocco all'istante e leggine il timestamp. Nulla in questa pagina va preso per fiducia.",
    resultTitle: "Che cosa è stato registrato",
    resultPending: "Non ancora pubblicato. Il pacchetto di prove — l'istante, lo scostamento usato, il traffico di fondo, i tre hash di transazione, i numeri di blocco e il risultato della rilettura dei byte dalla catena — viene pubblicato qui dopo la cerimonia.",
    resultBlock: "Block Adam",
    resultTimestamp: "Il suo timestamp",
    resultBundle: "Pacchetto di prove",
    reachedNote: "L'istante è passato. Il registro non è ancora pubblicato qui: accade una volta riletti i byte dalla catena e confrontati con i digest congelati.",
  },
  validators: {
    title: "Far girare un validatore",
    desc: "La frase sulla nostra home — nove dei validatori su una sola macchina, presso un solo fornitore — è la debolezza onesta di questa rete, e qualcuno da fuori con una macchina libera è l'unica cosa che la corregge. Questa pagina dice quanto costa, e cosa non ripaga.",
    liveTitle: "L'insieme in questo momento",
    liveTotal: "Validatori",
    liveConnected: "Connessi",
    liveMinBond: "Cauzione minima",
    liveAtMinimum: "Al minimo",
    measuredNote: "Letto dalla rete al caricamento di questa pagina, non digitato. La cauzione minima è compilata nel binario del nodo — era 25.000 fino a poche ore prima della creazione di questa rete, quindi una pagina che la cita a memoria dista una ricostruzione dallo sbagliare su del denaro.",
    costTitle: "Cosa costa",
    costMachine: "Una macchina che resti accesa e un indirizzo pubblico con la porta 9651 raggiungibile dall'esterno. Nessuna domanda, nessuna lista di autorizzati, nessun cancello di permessi a livello di protocollo — il ruolo di operatore non è concesso a nessuno al genesis, quindi qualsiasi conto con fondi può unirsi.",
    costBond: "Una cauzione propria, bloccata per la durata che scegli: minimo 24 ore, massimo 365 giorni.",
    faucetTitle: "Da dove arriva il LOVE9, e la trappola nell'aritmetica",
    faucetDesc: "Il rubinetto è tutto il percorso di finanziamento: nulla da richiedere, nessuno a cui chiedere. Ma nove richieste fanno esattamente la cauzione, ed esattamente la cauzione NON basta: le transazioni che spostano il tuo saldo da C-Chain a X-Chain e poi a P-Chain, e quella che invia lo stake, si pagano dallo stesso saldo. Metti in conto dieci richieste e fino a un'ora di attesa per il limite per IP. Lo diciamo qui e non alla fine perché una versione precedente della nostra stessa guida scriveva «nove bastano» e si correggeva trecento righe dopo.",
    getTitle: "Cosa ottieni",
    getRewards: "Le ricompense richiedono l'80% di uptime lungo il periodo — volutamente più permissivo della mainnet Avalanche, perché l'hardware della comunità non è hardware da datacenter.",
    getEnd: "Il tuo periodo finisce e nulla si rinnova da solo. Lo stake torna alla scadenza; leggi la tua ora di fine dalla catena invece di calcolarla.",
    getPrivacy: "Nulla ti obbliga a esporre un RPC, e preferiremmo che non aprissi affatto la porta 9650. Il tuo nodo è tuo.",
    honestTitle: "Cosa non ripaga",
    honest1: "LOVE9 è un token di test. Non vale nulla qui né altrove, nessuno lo compra, e non c'è alcuna promessa che diventi qualcosa in futuro.",
    honest2: "A1 è una testnet ed è già stata ricostruita dal blocco 0 due volte. Se succede di nuovo, il tuo stake, le ricompense e l'identità del nodo se ne vanno con essa. Ciò che promettiamo è dirlo in anticipo e dire chiaramente cosa si perde — la promessa è tutta qui.",
    honest3: "Dietro un router domestico un nodo si avvia e valida sulle connessioni che apre lui stesso, e sembra perfettamente sano mentre nessuno da fuori riesce a raggiungerlo. È così che il primo validatore esterno ha chiuso un intero periodo al 14% di uptime senza guadagnare nulla. Inoltra la porta 9651 e imposta come indirizzo pubblico quello su cui quell'inoltro risponde.",
    stepsTitle: "Il percorso, in sei passi",
    step1: "Prendi il sorgente e ricostruisci il fork, poi verifica tu stesso l'hash dell'albero — e verifica che un input volutamente sbagliato fallisca, così il primo controllo significa qualcosa.",
    step2: "Costruisci l'immagine del nodo, imprimendoci il commit da cui hai compilato.",
    step3: "Ottieni il genesis e un indirizzo di bootstrap, e verifica l'hash del genesis prima di eseguire qualsiasi cosa.",
    step4: "Avvia il nodo. La sua identità sono tre file su disco: perderli significa lasciare la cauzione a un nodo che non esiste più.",
    step5: "Conferma di essere sulla catena giusta rileggendo il nome della rete e il chain ID, non fidandoti di un 200.",
    step6: "Porta il LOVE9 su P-Chain e fai stake — e verifica il risultato sulla catena, non nell'output dello strumento.",
    guideCta: "La guida completa, ogni comando",
    issuesCta: "Segnala un problema",
    issuesNote: "Il tracker delle issue è il canale, ed è pubblico di proposito: un problema di validatore è quasi sempre uno che capiterà anche ad altri, e una risposta data in privato aiuta una persona sola. Dicci cosa hai misurato, non cosa hai concluso.",
  },




  loadTest: {
    badge: 'Test di carico',
    banner: 'Stiamo eseguendo un test di carico pubblico — {tps} transazioni al secondo, generate da noi, non da utenti reali.',
    bannerLink: 'Vedi i numeri in tempo reale',
    title: 'Test di carico pubblico',
    intro: 'A1 è una rete di test giovane con pochissimi utenti reali, quindi lasciata a sé stessa non produce quasi nessun blocco. Generiamo un flusso costante di transazioni perché la rete sia sempre in funzione e perché tu possa vederla lavorare. Questo traffico è nostro. Non è utilizzo e non lo conteggiamo come tale: ogni indirizzo che lo invia è elencato qui sotto, così puoi sottrarlo.',
    running: 'In esecuzione',
    stopped: 'Non in esecuzione al momento',
    stoppedWhy: 'Motivo registrato: {reason}',
    labelTps: 'Transazioni al secondo',
    labelBlockHeight: 'Blocco C-Chain',
    labelSecondsPerBlock: 'Secondi per blocco',
    labelTotal: 'Transazioni confermate dall\'avvio',
    labelUptime: 'In funzione da',
    committedNote: 'Queste cifre sono contate dai blocchi stessi, non da ciò che abbiamo provato a inviare. Una transazione accettata dalla rete ma mai inclusa in un blocco non viene conteggiata qui.',
    addressesTitle: 'I nove indirizzi mittenti',
    addressesNote: 'Ogni transazione da questi indirizzi è generata da una nostra macchina. Filtrali per vedere l\'attività reale eventuale.',
    measuring: 'Lettura dello stato del test di carico…',
    notMeasured: 'Impossibile leggere lo stato del test di carico',
    notMeasuredMore: 'La pagina funziona comunque — questo è solo il pannello di stato.',
  },

  launch: {
    title: 'Avvia la tua catena',
    desc:
      'Una L1 dedicata, di proprietà del tuo wallet. Firmi una volta per dimostrare chi sei, ' +
      'controlli, e la rete costruisce la catena in circa cinque minuti.',

    connectWallet: 'Collega il wallet',
    connecting: 'Collegamento…',
    signIn: 'Accedi',
    signing: 'In attesa della firma…',
    yourWallet: 'Il tuo wallet',
    youWillOwn: 'La catena apparterrà a questo wallet. L’indirizzo deriva dalla tua firma — nessuno lo digita.',
    noWallet: 'Nessun wallet trovato in questo browser. Installa MetaMask e ricarica la pagina.',
    signRejected: 'Hai rifiutato di firmare. Non è stato creato nulla.',
    switchWallet: 'Usa un altro wallet',

    nameLabel: 'Nome della catena',
    namePlaceholder: 'Per esempio: MyChain',
    nameHelp:
      'Lettere, cifre e spazi. 2–32 caratteri. Su questa rete un nome già usato non viene mai ' +
      'riassegnato — nemmeno per una catena revocata.',
    nameInvalid: 'Il nome può contenere solo lettere, cifre e spazi, per una lunghezza di 2–32 caratteri.',
    typeLabel: 'Tipo di catena',
    typeHelp: 'Una volta scelto è fisso — il genesis di una catena non è modificabile.',
    slotsLeft: '{left}/{total} posti liberi',
    slotsFull: 'Nessun posto libero',
    slotsFullDesc:
      'Il modello attuale fa sì che ogni validatore segua ogni L1, e il protocollo espelle un nodo ' +
      'che dichiara più di 16 subnet. È un tetto rigido e non può essere alzato. Revocare una catena ' +
      'restituisce un posto.',
    reviewCta: 'Controlla prima di inviare',

    reviewTitle: 'Controllo — questa è una porta a senso unico',
    reviewDesc:
      'Il genesis di una L1 avviata è IMMUTABILE. Dopo questo passaggio nome, tipo di catena e ' +
      'proprietario non possono essere cambiati — e nemmeno la revoca restituirà nome e chain ID.',
    reviewRebuild:
      'Un’altra cosa da sapere prima di premere: A1 ricostruisce l’intera rete il {date}. La catena ' +
      'che avvii oggi verrà cancellata insieme alla vecchia rete — non nascosta, sparita.',
    reviewName: 'Nome della catena',
    reviewType: 'Tipo di catena',
    reviewOwner: 'Proprietario',
    reviewBack: 'Torna indietro e modifica',
    reviewConfirm: 'Ho controllato — avvia la catena',

    launching: 'Avvio della catena “{name}”',
    launchingDesc:
      'I nodi si riavviano UNO ALLA VOLTA perché la rete non perda mai il quorum — è per questo che ' +
      'è lento, ed è voluto. Non chiudere la scheda; se la chiudi, la catena viene comunque costruita.',
    etaRemaining: 'Circa {minutes} minuti rimasti',
    preparing: 'Preparazione…',

    doneTitle: 'Fatto — la catena “{name}” è attiva',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Aggiungi la catena al wallet',
    doneAdded: 'Aggiunta al wallet',
    doneActivate: 'Attiva la catena (apri il blocco 1)',
    doneActivated: 'Attivata',
    doneActivating: 'In attesa del wallet…',
    doneAddWalletError: 'Impossibile aggiungere la catena al tuo wallet. {detail}',
    doneActivateError: 'Impossibile attivare la catena. {detail}',

    launchAnother: 'Avvia un’altra catena',
    launchError: 'Impossibile avviare la catena. {detail}',
    unknownError: 'La catena non è comparsa nell’elenco al termine dell’operazione.',
    noteTitle: 'La prima transazione su una catena nuova',
    noteHow:
      'Non fidarti della stima del gas per la prima transazione. Il modo più economico per aprire il ' +
      'blocco 1 è un normale trasferimento — premi “Attiva la catena” qui sotto.',
  },

  myChains: {
    title: 'Le mie catene',
    desc: 'Le L1 di proprietà del wallet con cui hai effettuato l’accesso. Possono essere revocate, ma leggi prima l’avviso.',
    connectWallet: 'Collega il wallet per vedere le tue catene',
    emptyTitle: 'Questo wallet non possiede ancora alcuna catena',
    emptyDesc: 'Avviane una e torna qui — comparirà subito.',
    emptyCta: 'Avvia la tua catena',

    colChain: 'Catena',
    colType: 'Tipo',
    colStatus: 'Stato',
    colActions: '',

    validatorCount: '{count} validatori',
    measuring: 'misurazione',
    cannotMeasure: 'impossibile misurare',
    statusHelp: 'Misurato dal numero di validatori della subnet, non dall’altezza dei blocchi.',
    noValidators: '0 validatori',
    noValidatorsDesc:
      'Questa catena NON può finalizzare alcuna transazione: la subnet non ha validatori. Risponde ' +
      'comunque alle chiamate RPC e i wallet si collegano lo stesso, quindi non c’è nessun altro ' +
      'segno visibile.',

    walletSettings: 'Impostazioni del wallet',
    addToWallet: 'Aggiungi al wallet',
    addedToWallet: 'Aggiunta',
    addWalletError: 'Impossibile aggiungerla al tuo wallet. {detail}',

    revoke: 'Revoca',
    revokeTitle: 'Revocare “{name}”?',
    revokeWarn1: 'La catena smette subito di servire RPC e sparisce dall’elenco pubblico.',
    revokeWarn2:
      'La revoca NON elimina la subnet sulla P-Chain — ciò che è stato creato lì non può essere ' +
      'rimosso finché questa rete è in funzione. Non rimuove nemmeno la rete dai wallet di chi ha ' +
      'già aggiunto questa catena.',
    revokeWarn3:
      'Nome e Chain ID restano riservati e non vengono MAI riassegnati a nessuno su questa rete. ' +
      'Riassegnare un Chain ID permetterebbe al wallet di un ex utente di puntare in silenzio alla ' +
      'catena di qualcun altro.',
    revokeWarn4: 'In cambio, uno dei 15 posti viene restituito.',
    revokeTypeLabel: 'Digita esattamente il nome della catena per confermare',
    revokeNameMismatch: 'Non corrisponde al nome della catena.',
    revokeConfirm: 'Revoca definitivamente',
    revokeCancel: 'Annulla',
    revoking: 'Revoca di “{name}” — circa cinque minuti',
    revokeDone: '“{name}” revocata. {left}/{total} posti liberi.',
    revokeError: 'Impossibile revocare. {detail}',
    revokeUnknown: 'La catena è ancora nell’elenco al termine dell’operazione.',

    revokedBadge: 'Revocata',
    revokedDesc: 'Nome e Chain ID restano riservati su questa rete.',
  },

  compare: {
    title: 'A1 ↔ C1 — confronto',
    desc:
      '9Chain gestisce DUE testnet dello stesso prodotto affiancate, che differiscono per motore: ' +
      'A1 sul motore Avalanche, C1 sul motore Cosmos. Questa tabella registra i compromessi tra le ' +
      'due direzioni ed è pubblicata perché chiunque possa contestarla — il lato C1 non ha ancora ' +
      'misurazioni dal vivo.',

    selfScoreTitle: 'I punteggi qui sotto sono AUTOVALUTATI dal team, non misurati in modo indipendente',
    selfScoreDesc:
      'La colonna "come è stato misurato" indica come è stato verificato ogni criterio. Ogni criterio ' +
      'senza una misurazione datata è un giudizio architetturale, non un dato. I pesi li scegli tu — ' +
      'il punteggio ne consegue.',

    colNo: '#',
    colCriterion: 'Criterio',
    colKind: 'Tipo',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Peso',
    kindArchitecture: 'architettura',
    kindLiveData: 'dati dal vivo',

    totalScore: 'Punteggio totale con i tuoi pesi',
    tied: 'Pari',
    leads: 'in vantaggio',

    liveDataTitle: 'Dati dal vivo',
    a1Validators: 'A1 — validatori collegati',
    a1Chains: 'A1 — L1 in funzione',
    a1Blocks: 'A1 — blocco C-Chain',
    c1Unreachable: 'C1 — non raggiungibile',
    c1UnreachableDesc:
      'Serve l’URL REST Cosmos di C1 (porta 1317). La tabella funziona comunque: il lato A1 è dato ' +
      'dal vivo, il lato C1 è un giudizio architetturale come i criteri restanti.',
    measuring: 'misurazione…',
    cannotMeasure: 'impossibile misurare',
    critDecentralisation: 'Decentralizzazione (tetto dei validatori)',
    noteDecentralisation: 'Tetto del PROTOCOLLO: Snowman ~migliaia di nodi contro CometBFT ~150. A1 OGGI: 9 nodi, una macchina, un fornitore',
    critFinality: 'Finalità',
    noteFinality: '~1–2s contro ~5–6s',
    critEvmMaturity: 'Maturità della EVM',
    noteEvmMaturity: 'coreth in produzione contro Cosmos EVM pre-v1',
    critWalletCompat: 'Compatibilità con wallet e DeFi al dettaglio',
    noteWalletCompat: 'MetaMask/EVM completo',
    critLaunchUx: 'Esperienza di lancio di una catena',
    noteLaunchUx: 'entrambi hanno una console; su A1 misurati ~170s per lancio',
    critInterop: 'Ampiezza dell’interoperabilità',
    noteInterop: 'Warp/ICM dentro l’ecosistema (A1 ha già spostato asset, M6.2) contro la portata di IBC',
    critOpCost: 'Costo operativo per catena',
    noteOpCost: 'nodo + plugin contro operatore K8s',
    critBootstrap: 'Avvio dell’effetto rete',
    noteBootstrap: 'un’isola propria contro IBC collegato all’economia Cosmos',
    critEconSecurity: 'Sicurezza economica pubblica',
    noteEconSecurity: 'PoS garantito da token fin dall’inizio',
    critSwitchCost: 'Costo di passaggio per il team',
    noteSwitchCost: 'A1 è nuovo contro C1 in funzione da mesi',
  },

  faucet: {
    title: 'Ottieni token di test',
    desc:
      'LOVE9 sulla testnet A1 non ha valore reale — esiste perché tu possa pagare il gas durante le ' +
      'prove. Inserisci un indirizzo wallet e te ne inviamo subito un po’.',
    addressLabel: 'Il tuo indirizzo wallet',
    addressFromWallet: 'Compilato dal portafoglio che hai collegato. Modificalo se i token devono andare a un altro indirizzo.',
    useWalletAddress: 'Usa l’indirizzo del mio portafoglio',
    addressPlaceholder: '0x… (40 caratteri esadecimali)',
    requestCta: 'Inviami i token',
    sending: 'Invio…',
    addressHelp: 'Incolla l’indirizzo wallet che deve ricevere i token. Premi “Aggiungi la rete al wallet” qui sopra se non l’hai ancora fatto.',
    addNetwork: 'Aggiungi la rete al wallet',
    addNetworkDone: 'Aggiunta al wallet',
    addNetworkRejected: 'Hai premuto rifiuta nel wallet. Premi di nuovo se vuoi aggiungere la rete.',
    addNetworkError: 'Il tuo wallet non è riuscito ad aggiungere la rete. Aggiungila a mano con le impostazioni qui accanto — e invia al team la riga sottostante:',
    noWallet: 'Nessun wallet trovato in questo browser. Installa MetaMask e ricarica la pagina.',
    quotaLabel: 'Quota rimanente',
    quotaFormat: '{left}/{total} richieste ogni {hours} ore',
    quotaExhausted: 'Hai esaurito tutta la tua quota. Riprova tra {minutes} minuti.',
    quotaUnreadable: 'Impossibile leggere la tua quota — puoi comunque fare richiesta, semplicemente non saprai quante ne restano.',
    sentOk: 'Inviati {count} {symbol} a {address}',
    viewTransaction: 'Vedi la transazione',
    settingsTitle: 'Impostazioni di rete',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Simbolo',
    settingsDecimals: 'Decimali',
    settingsExplorer: 'Explorer',
    decimalsHelp:
      'I wallet mostrano 18 decimali perché la C-Chain esegue l’EVM. Sulla P/X-Chain LOVE9 si conta ' +
      'con 9 decimali. Una sola moneta, due scale — non due token diversi.',
    genericError: 'Invio non riuscito. {detail}',
  },

  langPicker: {
    label: 'Lingua',
    machineBadge: 'automatica',
    machineNote: 'Solo la versione vietnamita è stata verificata da una persona. Le altre traduzioni sono automatiche e possono contenere errori — la versione inglese è la fonte di riferimento.',
    notAvailable: 'non ancora disponibile',
  },

  errors: {
    unreachable: 'Impossibile raggiungere la rete',
    unreachableDesc: 'La rete potrebbe essere occupata, oppure la tua connessione è caduta.',
    empty: 'Qui non c’è ancora nulla',
    addressEmpty: '{label} non può essere vuoto',
    addressFormat: '{label} deve essere 0x seguito da 40 caratteri esadecimali',
    addressChecksum: '{label} non supera il suo checksum EIP-55: molto probabilmente un carattere è stato digitato male o perso incollando',
    addressZero: '{label} non può essere l’indirizzo zero: nessuno ne detiene la chiave',
    timeout: 'Nessuna risposta dopo {seconds}s',
    notJson: 'La risposta non era JSON (HTTP {status}): la richiesta è stata probabilmente instradata nel posto sbagliato',
    noWallet: 'Nessun portafoglio trovato in questo browser.',
  },

  notFound: {
    code: '404',
    title: 'Questa pagina non esiste',
    desc:
      'L’indirizzo che hai aperto non esiste su 9Chain Testnet A1. ' +
      'Potrebbe essere stato rinominato, oppure l’URL potrebbe aver perso qualche carattere nella copia.',
    topPagesTitle: 'Le tre pagine più usate:',
    navLabel: 'Dove andare adesso',
    goHome: 'Torna alla home',
    goFaucet: 'Ottieni token di test',
    goLaunch: 'Avvia la tua catena',
    lookingForTx: 'Cerchi una transazione o un indirizzo? Controlla l’hash e riprova.',
  },
};

export default it;
