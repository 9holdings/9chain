import type { Dict } from '../en';

/**
 * Deutsch — maschinelle Übersetzung, nicht von einem Menschen geprüft.
 * Ausgangssprache ist Englisch (`../en.ts`); bei Abweichungen gilt die englische Fassung.
 *
 * 🔴 Diese drei Stellen nicht abschwächen: `reGenesis.*` (das Netzwerk wird gelöscht),
 * `deChain.soatMoTa` (Einbahntür), `chainCuaToi.thuHoiY*` (Widerruf gibt den Namen nicht zurück).
 * Sie sagen „dauerhaft" und „lässt sich nicht ändern", damit niemand sein Vermögen
 * verliert, weil er glaubt, es ließe sich rückgängig machen.
 */
export const de: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: 'Öffentliches Testnetz von 9Chain — ein eigenständiges Netzwerk auf der Avalanche-Engine',
    tagline: 'ein eigenständiges Netzwerk auf der Avalanche-Engine',
    walletRejected: 'Sie haben die Anfrage in Ihrer Wallet abgelehnt. Es hat sich nichts geändert.',
    noWalletMobile: 'Ein Handy-Browser kann keine Wallet-Erweiterung aufnehmen. Öffnen Sie diese Seite stattdessen in der MetaMask-App – ihr eingebauter Browser hat die Wallet.',
    openInMetaMask: 'In der MetaMask-App öffnen',
    loading: 'Wird geladen…',
    retry: 'Erneut versuchen',
    copy: 'Kopieren',
    copied: 'Kopiert',
    close: 'Schließen',
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    switchToDark: 'Zum dunklen Modus wechseln',
    switchToLight: 'Zum hellen Modus wechseln',
    skipToContent: 'Zum Hauptinhalt springen',
    stepDone: ' — fertig',
    stepRunning: ' — läuft',
    stepFailed: ' — fehlgeschlagen',
    stepPending: ' — offen',
  },

  presets: {
    standard: {
      name: 'Standard',
      desc: 'Eine gewöhnliche EVM-Chain. Der Eigentümer erhält alle Genesis-Token und das Recht, die Gebühren zu ändern.',
    },
    'zero-fee': {
      name: 'Nahezu keine Gebühren',
      desc: 'baseFee = 1 wei, eine Transaktion zahlt genau diese Untergrenze (eine Überweisung kostet 0,000000000000021 LOVE9). Gut für Spiele, Experimente und interne Chains. Der Preis: fast nichts hält Spam auf.',
    },
    'high-throughput': {
      name: 'Hoher Durchsatz',
      desc: 'Fünfmal so viele Transaktionen pro Block (gasLimit 60 Millionen statt 12 Millionen). Gut für Spiele, Börsen und alles mit einem stetigen Strom kleiner Transaktionen. Der Preis: schwerere Blöcke, und wer einen Node für diese Chain betreibt, braucht eine stärkere Maschine.',
    },
    mintable: {
      name: 'Nachprägbares Angebot',
      desc: 'Der Eigentümer kann jederzeit über das Precompile 0x0200000000000000000000000000000000000001 weitere native Token prägen. Das Angebot ist NICHT fest – jeder, der diese Chain nutzt, muss das wissen.',
    },
    'owner-deploy-only': {
      name: 'Vertragsbereitstellung nur durch den Eigentümer',
      desc: 'Alle anderen können weiterhin Transaktionen senden und bestehende Verträge nutzen, aber keine eigenen bereitstellen. Der Eigentümer vergibt dieses Recht über das Precompile 0x0200000000000000000000000000000000000000 an beliebige Adressen.',
    },
    permissioned: {
      name: 'Zugangsbeschränkt (nur freigegebene Absender)',
      desc: 'Nur gelistete Adressen können Transaktionen SENDEN. Geeignet für eine firmeninterne Chain. ⚠️ Das strengste Preset: Eine unbekannte Wallet kann hier gar nichts tun.',
    },
  },
  steps: {
    genesis: 'Genesis wird gebaut',
    subnet: 'Subnet + Blockchain werden auf der P-Chain angelegt',
    rpc: 'Warten auf Antwort des L1-RPC',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',
    banner: 'A1 wurde am {date} neu aufgebaut. Alle vorher entstandenen Guthaben und Chains existieren nicht mehr.',
    bannerLink: 'Was das bedeutet',
    badge: 'Neu aufgebaut',
    title: 'A1 wurde am {date} neu aufgebaut',
    desc:
      'Das Testnetz A1 wurde ab Block 0 neu aufgebaut. Chains, Guthaben und Transaktionsverlauf, ' +
      'die vor diesem Datum entstanden sind, existieren nicht mehr — nicht versteckt, sondern weg. ' +
      'Diese Seite erklärt, was Sie sehen und was zu tun ist.',
    willSeeTitle: 'Was Sie sehen werden',
    willSee1:
      'Ihre Wallet verbindet sich weiterhin, zeigt weiterhin den richtigen Netzwerknamen und dieselbe ' +
      'Chain ID {chainId} — das war Absicht. Aber Ihr Guthaben wird 0 sein.',
    willSee2:
      'Jede L1, die Sie gestartet haben, ist aus dem Verzeichnis verschwunden. Ihre Namen und Chain IDs ' +
      'sind wieder frei, und jeder kann sie beanspruchen.',
    willSee3:
      'Falls Sie eine Transaktion signiert, aber nie gesendet haben: senden Sie sie jetzt nicht — sie ' +
      'gehört zu einem Netzwerk, das es nicht mehr gibt.',
    toDoTitle: 'Was Sie tun müssen',
    toDo1: 'Fordern Sie erneut Test-Token beim Faucet an. Die Limits wurden für alle zurückgesetzt.',
    toDo2:
      'Entfernen Sie jede alte L1 einzeln aus Ihrer Wallet — sie haben eigene Chain IDs und zeigen ' +
      'jetzt ins Leere. Das Haupt-Netzwerk A1 muss NICHT entfernt werden; seine Einstellungen sind unverändert.',
    toDo3: 'Starten Sie Ihre Chain erneut, wenn Sie sie brauchen. Den alten Namen hat vielleicht jemand anderes genommen.',
    archiveTitle: 'Archiv des alten Netzwerks',
    archiveDesc:
      'Der Endzustand des Netzwerks vor dem Neuaufbau wurde exportiert und sein Hash veröffentlicht, ' +
      'damit jeder, der es prüfen möchte, das kann.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1 wird am {date} neu aufgebaut — alle vorher entstandenen Chains, Guthaben und Transaktionen werden gelöscht.',
    bannerLink: 'Details',
    badge: 'Neuaufbau steht bevor',
    title: 'A1 wird am {date} neu aufgebaut',
    desc:
      'Das gesamte Testnetz A1 wird ab Block 0 neu aufgebaut. Alles, was vor diesem Datum entstanden ' +
      'ist, verschwindet — nicht versteckt, sondern nicht mehr existent. Diese Seite sagt genau, was ' +
      'verloren geht und was Sie tun müssen.',
    whyTitle: 'Warum ein Neuaufbau nötig ist',
    why1:
      'Der Genesis eines Netzwerks ist unveränderlich. Genau das macht ihn vertrauenswürdig — niemand, ' +
      'auch nicht die Erbauer, kann eine Zahl ändern, die einmal in Block 0 geschrieben wurde.',
    why2:
      'Der Preis dafür: Eine Zahl im Genesis zu ändern lässt keine Wahl außer dem Neuaufbau des ' +
      'Netzwerks von Grund auf. A1 hat das Gesamtangebot auf 9.000.000.000 LOVE9 angehoben, und die ' +
      'gesamte Reihe der Staking-Parameter musste passend neu berechnet werden.',
    why3:
      'Dies ist ein Testnetz, und ein Neuaufbau gehört zu dem, was ein Testnetz tun darf. Genau dafür ' +
      'gibt es Testnetze: damit solche Änderungen hier passieren und nicht im Mainnet.',
    lostTitle: 'Was verloren geht',
    lostDesc: 'Alles, ohne Ausnahme:',
    lost1: 'Jede von Nutzern gestartete L1, auch Chains, die einwandfrei laufen.',
    lost2: 'Jedes LOVE9-Guthaben, einschließlich der vom Faucet erhaltenen Token.',
    lost3: 'Jede Transaktion, jeder Block und die gesamte Historie von C-Chain, P-Chain und X-Chain.',
    lost4: 'Jeder Validator und jede Delegation.',
    keptTitle: 'Was bleibt',
    keptDesc:
      'Vor der Löschung wird das gesamte auslaufende Netzwerk mit veröffentlichtem Hash exportiert, ' +
      'damit der Nachweis prüfbar bleibt. Was geschehen ist, lässt sich auch dann noch nachvollziehen, ' +
      'wenn das ausführende Netzwerk verschwunden ist. Der Archiv-Link wird am Tag des Neuaufbaus hier veröffentlicht.',
    toDoTitle: 'Was Sie tun müssen',
    toDoBefore: 'Vor dem Neuaufbau:',
    toDo1:
      'Bauen Sie jetzt nichts auf A1, das darauf angewiesen ist, dass Daten erhalten bleiben. Wenn Sie ' +
      'eine Idee ausprobieren, nur zu — behandeln Sie die aktuelle Chain nur nicht als Speicher.',
    toDoAfter: 'Nach dem Neuaufbau:',
    toDo2:
      'Entfernen Sie jede von Ihnen hinzugefügte L1 einzeln aus der Wallet — diese Chains gibt es nicht ' +
      'mehr, und eine Wallet, die auf sie zeigt, bleibt einfach untätig. Das Haupt-Netzwerk A1 muss ' +
      'nicht entfernt werden: Seine Einstellungen sind unverändert.',
    toDo3:
      'Wenn Ihre Wallet das A1-Netzwerk noch nicht hat, fügen Sie es über die Schaltfläche auf der ' +
      'Faucet-Seite hinzu, statt die Einstellungen von Hand einzutippen.',
    toDo4: 'Fordern Sie erneut Token beim Faucet an und starten Sie Ihre Chain neu, wenn Sie möchten.',
    silentTitle: 'Ihre Wallet wird Sie nicht warnen',
    silentDesc:
      'Das neue Netzwerk behält die Chain ID {chainId}, dieselbe RPC-Adresse und denselben Namen wie ' +
      'das alte. Das ist Absicht — damit jedes bereits veröffentlichte Dokument und jede Anleitung ' +
      'weiterhin stimmen. Der Preis ist, dass Ihre Wallet keinerlei Hinweis darauf hat, dass sie sich ' +
      'gerade mit einem anderen Netzwerk verbunden hat. Die beiden folgenden Dinge geschehen deshalb lautlos.',
    silent1:
      'Eine Wallet mit der alten Konfiguration verbindet sich weiterhin, zeigt weiterhin den richtigen ' +
      'Netzwerknamen und meldet ein Guthaben von 0. Diese Zahl ist RICHTIG: Ihre alten Token existieren ' +
      'nicht mehr, sie sind nicht versteckt. Sie müssen das Netzwerk nicht erneut hinzufügen — fordern ' +
      'Sie einfach neue Token beim Faucet an. Meldet Ihre Wallet eine hängende Transaktion oder eine ' +
      'falsche Sequenznummer, löschen Sie die Aktivitätsdaten dieses Netzwerks in der Wallet: Sie merkt ' +
      'sich noch den Transaktionszähler einer toten Chain, während die neue bei 0 beginnt.',
    silent2:
      'Wenn Sie noch eine signierte, nie gesendete Transaktion haben, verwerfen Sie sie. Die Signatur ' +
      'ist im neuen Netzwerk weiterhin gültig, weil sich die Chain ID nicht geändert hat. Solange die ' +
      'Wallet leer ist, schlägt sie fehl — aber in dem Moment, in dem Sie Token vom Faucet erhalten, ' +
      'wird sie ausführbar und kann zu einem Zeitpunkt durchgehen, mit dem Sie nicht rechnen.',
    repeatTitle: 'Wird das wieder passieren',
    repeatDesc:
      'Möglich. A1 ist weiterhin ein Testnetz, und solange die Community zwischen A1 und C1 keine ' +
      'Mainnet-Richtung gewählt hat, behalten wir uns vor, das Netzwerk neu aufzubauen, wenn etwas im ' +
      'Genesis geändert werden muss. Wir sagen zu, vorher zu informieren und klar zu benennen, was verloren geht.',
    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    alreadyTitle: 'Am 2026-08-27 bereits einmal neu aufgebaut',
    alreadyDesc:
      'A1 wurde am 2026-08-27 bereits einmal neu aufgebaut, vor dem unten genannten Datum. Wenn Sie davor Test-Token hatten, ist Ihr Guthaben jetzt 0 — das ist richtig und kein Fehler Ihrer Wallet. Es ging keine Nutzer-Chain verloren: im Verzeichnis standen damals nur automatisierte Test-Chains. Fordern Sie beim Faucet erneut Token an.',
    dateNote: 'Das Datum kann sich verschieben',
    dateNoteDesc:
      'Das Datum {date} hängt von einer vorgelagerten Freigabeprüfung ab. Verschiebt es sich, ändern ' +
      'wir das Datum auf dieser Seite, statt zu schweigen.',
  },

  footer: {
    tryIt: 'Ausprobieren',
    explore: 'Netzwerk ansehen',
    about: 'Über das Projekt',
    explorer: '9Scan-A1 Explorer',
    mainSite: '9Chain Hauptseite',
    opensNewTab: '(öffnet in einem neuen Tab)',
    navLabel: 'Fußzeilen-Links',
    rebuildPlan: 'Plan für den Netzwerk-Neuaufbau',
  },

  nav: {
    home: 'Startseite',
    faucet: 'Test-Token holen',
    launch: 'Chain starten',
    myChains: 'Meine Chains',
    compare: 'A1 ↔ C1',
    directory: 'L1-Verzeichnis',
    explorer: 'Explorer',
    explorerAria: '9Scan-A1 in neuem Tab öffnen',
    ceremony: "Zeremonie",
    // Footer / cross-page labels for the three "About" pages — copied from each page's own
    // `title` on 2026-09-05, when English was split per page: the footer must not read a
    // page's group, or that page's whole text rides in every other page's bundle.
    validators: "Einen Validator betreiben",
    docs: "Dokumentation",
    nineYears: "Neun Jahre, neun Milliarden",
  },

  home: {
    testnetBadge: 'Testnetz — die Token haben keinen realen Wert',
    primaryCta: 'Starten Sie Ihre Chain',
    secondaryCta: 'Holen Sie sich zuerst Test-Token',
    title: 'Starten Sie Ihre eigene Chain auf A1',
    subtitle: 'Eine eigene L1, im Besitz der Wallet, mit der Sie signieren, die wirklich im Testnetz läuft. Dauert etwa fünf Minuten.',
    tableCaption: 'Jede Zeile ist eine echte Chain, die auf A1 läuft, mit eigenem Besitzer.',
    colChain: 'Chain',
    colType: 'Typ',
    colOwner: 'Besitzer',
    systemDefault: 'Systemvorgabe',
    emptyTitle: 'Es läuft noch keine L1',
    emptyDesc: 'Sie wären die erste Person. Das Verzeichnis aktualisiert sich, sobald Ihre Chain läuft.',
    moreChains: 'Alle {count} Chains im Verzeichnis ansehen',
    disclosure: '9 der 11 Validatoren laufen auf demselben Server, beim selben Anbieter; die anderen beiden kamen von anderswo dazu, und nur einer von ihnen ist online — dezentral auf Protokollebene, noch nicht auf Infrastrukturebene.',
    idleBlocksNote: 'Avalanche erzeugt keine leeren Blöcke; eine stehende Blockhöhe ist daher normal, solange niemand Transaktionen sendet. Das Maß für Lebendigkeit ist die Validatorenzahl daneben.',
  },

  stats: {
    title: 'Das Netzwerk läuft',
    validators: 'Verbundene Validatoren',
    l1Count: 'Laufende L1',
    blockHeight: 'C-Chain-Block',
    measuring: 'Netzwerk wird gemessen…',
    cannotMeasure: 'Netzwerkstatistik konnte nicht gelesen werden',
    cannotMeasureDesc: 'Die Seite funktioniert weiterhin — dies ist nur die Statusanzeige.',
  },
  directory: {
    lede: 'Jede Chain im A1-Testnet und der tatsächliche Zustand jeder einzelnen.',
    howToTitle: 'Wie diese Tabelle zu lesen ist.',
    howToBody: 'Avalanche erzeugt keine leeren Blöcke — eine Chain erzeugt nur dann einen, wenn es eine Transaktion gibt. Ein Blockzähler, der stillsteht, ist also normal und bedeutet nicht, dass die Chain tot ist. Gefährlich ist der umgekehrte Fall: eine Chain ohne Validatoren antwortet weiterhin auf RPC, lässt weiterhin Guthaben lesen, und Wallets verbinden sich weiterhin — aber jede Transaktion hängt für immer. Das echte Lebenszeichen ist hier daher die Anzahl der Subnet-Validatoren, direkt von der P-Chain gelesen, nicht die Blockhöhe.',
    ownerTitle: 'Der Eigentümer (admin)',
    ownerBody: 'ist die Adresse, die beim Start der Chain angegeben wurde. Sie hält das gesamte Genesis-Angebot und das Recht, die Gebühren dieser Chain zu ändern — die Chain gehört ihr, nicht der Foundation. Chains, die vor Einführung dieses Feldes in der Konsole gestartet wurden, zeigen einen Systemstandard.',
    mainNetwork: 'HAUPTNETZ',
    mainNetworkDesc: 'Die C-Chain des A1-Testnets — dort arbeiten Faucet und Explorer.',
    running: 'LÄUFT',
    notAnswering: 'ANTWORTET NICHT',
    notAnsweringDesc: 'Der RPC antwortet nicht — möglicherweise verfolgt noch kein Node dieses Subnet.',
    unclear: 'UNKLAR',
    unclearDesc: 'Die Validatorenmenge konnte nicht von der P-Chain gelesen werden.',
    ownerAdmin: 'Eigentümer (admin)',
    blocks: 'Blöcke',
    subnetValidators: 'Subnet-Validatoren',
    created: 'Erstellt',
    revokedAt: 'Widerrufen am',
    copyOwner: 'Eigentümeradresse kopieren',
    revoked: 'WIDERRUFEN',
    revokedDesc: 'Diese Chain bedient nichts mehr: kein Node führt sie noch aus und ihr RPC antwortet nicht mehr. Wenn Sie dieses Netz einer Wallet hinzugefügt haben, entfernen Sie es — es dort zu lassen erzeugt nur Verbindungsfehler.',
    neverReissued: 'wird niemals an eine andere Chain neu vergeben',
    revokedGroup: 'Widerrufen ({count})',
    listError: 'Die Chain-Liste konnte nicht gelesen werden ({error}). Das Hauptnetz wird unten weiterhin angezeigt.',
    footSummary: '{count} L1 laufen + das Hauptnetz',
    footRevoked: '{count} widerrufen',
    footUpdated: 'aktualisiert um {time}',
    tileTotal: 'L1 im Verzeichnis',
    tileRunning: 'Gemessen laufend',
    tileAttention: 'Brauchen Aufmerksamkeit',
    tileRevoked: 'Widerrufen',
    sweepProgress: '{done} von {total} gemessen',
    measuringDesc: 'Wartet auf Messung.',
    howToToggle: 'So liest man diese Liste',
    searchLabel: 'Suchen',
    searchPlaceholder: 'Name, Chain ID, Besitzer oder Blockchain-ID',
    filterStatus: 'Status',
    filterAll: 'Alle',
    filterRunning: 'Laufend',
    filterAttention: 'Brauchen Aufmerksamkeit',
    filterRevoked: 'Widerrufen',
    filterType: 'Typ',
    filterTypeAll: 'Alle Typen',
    groupBy: 'Gruppieren nach',
    groupNone: 'Keine Gruppierung',
    groupOwner: 'Besitzer',
    groupType: 'Typ',
    groupStatus: 'Status',
    groupNoType: 'Kein Typ erfasst',
    groupCount: '{shown} von {total}',
    sortBy: 'Sortieren',
    sortNewest: 'Neueste zuerst',
    sortOldest: 'Älteste zuerst',
    sortName: 'Name',
    sortChainId: 'Chain ID',
    sortBlocks: 'Meiste Blöcke',
    refresh: 'Erneut messen',
    listCaption: 'Chains auf A1 mit dem gemessenen Zustand jeder einzelnen',
    showing: '{shown} von {total} angezeigt',
    showMore: '{count} weitere anzeigen',
    noMatchTitle: 'Keine Chain passt',
    noMatchDesc: 'Versuchen Sie einen anderen Begriff oder löschen Sie die Filter.',
    clearFilters: 'Filter löschen',
    showDetails: 'Details',
    hideDetails: 'Ausblenden',
    detailsOf: 'Details zu {name}',
    nativeToken: 'Nativer Token',
    mismatch: 'FALSCHE CHAIN',
    mismatchDesc: 'Der RPC antwortete mit Chain ID {got} statt {expected} — sehr wahrscheinlich ein Routing-Fehler, nicht diese Chain.',
  },
  ceremony: {
    badge: "Zeremonie",
    title: "Die Block-Adam-Zeremonie",
    desc: "In einer exakten Sekunde schreibt das Netzwerk drei benannte Blöcke. Diese Seite sagt, was passieren wird, was die Blöcke tragen und wie Sie es danach selbst prüfen können, ohne uns zu fragen.",
    momentLabel: "Der Zeitpunkt",
    countdownLabel: "Verbleibende Zeit",
    days: "Tage",
    hours: "Std.",
    minutes: "Min.",
    seconds: "Sek.",
    yourZone: "Ihre Zeitzone",
    blocksTitle: "Die drei Blöcke",
    adamDesc: "Der ERSTE Block, dessen Zeitstempel den Zeitpunkt erreicht — definiert über die Zeit, nicht über die Höhe. Wer diesen Block erzeugt, erzeugt ihn.",
    evaDesc: "Der Block unmittelbar nach Adam, nach Höhe.",
    unionDesc: "Zehn Blöcke nach Adam. Hier ist die 9S-Union-Nachricht verankert.",
    messagesTitle: "Was die Blöcke tragen",
    messagesDesc: "Adam und Eva tragen die beiden Sätze, die bei der Entstehung des Netzwerks bereits in Block 0 geschrieben wurden — die Zeremonie verweist auf dieselben Dateien, sie können also nicht auseinanderdriften. Jeder Digest unten wurde am 2026-09-03 eingefroren, vor der Zeremonie, und lässt sich mit sha256 über die Rohbytes reproduzieren.",
    quietTitle: "Eine stille Minute",
    quietDesc: "Die C-Chain erzeugt keine leeren Blöcke, deshalb wird der synthetische Verkehr, den wir auf der Live-Seite offenlegen, kurz vor dem Zeitpunkt gestoppt. Sonst müsste die Zeremonie mit einem automatischen Sender um ein Zwei-Sekunden-Fenster wettlaufen. Der Preis ist eine stille Minute; gekauft wird damit, dass diese Blöcke der Zeremonie gehören und nicht einem Bot.",
    strangerTitle: "Ein Fremder kann den Block bekommen, und der Eintrag gilt trotzdem",
    strangerDesc: "A1 ist ein öffentliches Testnetz, und in dieser Sekunde darf jeder eine Transaktion senden. Der Eintrag ist am Transaktions-Hash der Zeremonie verankert, nie an einer Blockhöhe — erreicht der Block einer anderen Person den Zeitpunkt zuerst, bleibt das Geschriebene wahr; die Zeremonie hat diesen Block dann nur nicht erzeugt.",
    checkTitle: "Selbst nachprüfen",
    checkDesc: "Fragen Sie irgendeinen A1-Knoten nach dem Block zum Zeitpunkt und lesen Sie dessen Zeitstempel. Nichts auf dieser Seite muss man uns glauben.",
    resultTitle: "Was festgehalten wurde",
    resultPending: "Noch nicht veröffentlicht. Das Beweispaket — der Zeitpunkt, der verwendete Versatz, der Hintergrundverkehr, die drei Transaktions-Hashes, die Blocknummern und das Ergebnis des Zurücklesens der Bytes aus der Kette — erscheint nach der Zeremonie hier.",
    resultBlock: "Block Adam",
    resultTimestamp: "Sein Zeitstempel",
    resultBundle: "Beweispaket",
    reachedNote: "Der Zeitpunkt ist vorbei. Der Eintrag ist hier noch nicht veröffentlicht — das geschieht, sobald die Bytes aus der Kette zurückgelesen und gegen die eingefrorenen Digests geprüft sind.",
  },
  validators: {
    title: "Einen Validator betreiben",
    desc: "Der Satz auf unserer Startseite — neun der Validatoren laufen auf einer Maschine bei einem Anbieter — ist die ehrliche Schwäche dieses Netzwerks, und jemand von außen mit einer freien Maschine ist das Einzige, was sie behebt. Diese Seite sagt, was das kostet und was es nicht einbringt.",
    liveTitle: "Die Menge gerade jetzt",
    liveTotal: "Validatoren",
    liveConnected: "Verbunden",
    liveMinBond: "Mindest-Eigeneinlage",
    liveAtMinimum: "Mit Mindesteinlage",
    measuredNote: "Beim Laden dieser Seite aus dem Netzwerk gelesen, nicht eingetippt. Die Mindesteinlage ist in die Node-Binärdatei kompiliert — bis wenige Stunden vor der Entstehung dieses Netzwerks waren es 25.000, eine Seite, die sie aus dem Gedächtnis zitiert, ist also einen Neuaufbau davon entfernt, sich beim Geld zu irren.",
    costTitle: "Was es kostet",
    costMachine: "Eine Maschine, die an bleibt, und eine öffentliche Adresse, deren Port 9651 von außen erreichbar ist. Keine Bewerbung, keine Freigabeliste, kein Berechtigungstor auf Protokollebene — die Betreiberrolle wird beim Genesis niemandem erteilt, also kann jedes gedeckte Konto beitreten.",
    costBond: "Eine Eigeneinlage, gesperrt für die von Ihnen gewählte Laufzeit: mindestens 24 Stunden, höchstens 365 Tage.",
    faucetTitle: "Woher das LOVE9 kommt — und die Falle in der Rechnung",
    faucetDesc: "Der Faucet ist der gesamte Finanzierungsweg: nichts zu beantragen, niemanden zu fragen. Aber neun Anfragen ergeben genau die Einlage, und genau die Einlage reicht NICHT: Die Transaktionen, die Ihr Guthaben von der C-Chain über die X-Chain zur P-Chain bringen, und die, die den Einsatz einreicht, werden aus demselben Guthaben bezahlt. Rechnen Sie mit zehn Anfragen und bis zu einer Stunde Wartezeit für das Limit pro IP. Wir sagen das hier und nicht am Ende, weil eine frühere Fassung unseres eigenen Leitfadens „neun reichen“ schrieb und sich dreihundert Zeilen später selbst korrigierte.",
    getTitle: "Was Sie bekommen",
    getRewards: "Belohnungen verlangen 80 % Verfügbarkeit über Ihre Laufzeit — bewusst lockerer als das Avalanche-Mainnet, weil Hardware aus der Community keine Rechenzentrums-Hardware ist.",
    getEnd: "Ihre Laufzeit endet, und nichts verlängert sich von selbst. Der Einsatz kommt bei Ablauf zurück; lesen Sie Ihre eigene Endzeit aus der Kette, statt sie auszurechnen.",
    getPrivacy: "Nichts zwingt Sie, einen RPC-Endpunkt offenzulegen, und uns wäre lieber, Sie öffneten Port 9650 gar nicht. Ihre Node gehört Ihnen.",
    honestTitle: "Was das nicht einbringt",
    honest1: "LOVE9 ist ein Test-Token. Es ist hier nichts wert und anderswo auch nicht, niemand kauft es, und es gibt kein Versprechen, dass daraus später etwas wird.",
    honest2: "A1 ist ein Testnetz und wurde bereits zweimal von Block 0 neu aufgebaut. Passiert das wieder, gehen Ihr Einsatz, Ihre Belohnungen und Ihre Node-Identität mit. Wir versprechen, es vorher zu sagen und klar zu benennen, was verloren geht — mehr ist das Versprechen nicht.",
    honest3: "Hinter einem Heimrouter bootet und validiert eine Node über Verbindungen, die sie selbst öffnet, und sieht vollkommen gesund aus, während sie von außen niemand erreichen kann. So beendete der erste externe Validator eine ganze Laufzeit mit 14 % Verfügbarkeit und verdiente nichts. Leiten Sie Port 9651 weiter und setzen Sie als öffentliche Adresse die, unter der diese Weiterleitung antwortet.",
    stepsTitle: "Der Weg in sechs Schritten",
    step1: "Quellen holen und den Fork neu bauen, dann den Tree-Hash selbst prüfen — und prüfen, dass eine absichtlich falsche Eingabe fehlschlägt, damit die erste Prüfung etwas bedeutet.",
    step2: "Das Node-Image bauen und den Commit einstempeln, aus dem Sie gebaut haben.",
    step3: "Genesis und eine Bootstrap-Adresse holen und den Genesis-Hash prüfen, bevor Sie irgendetwas starten.",
    step4: "Die Node starten. Ihre Identität sind drei Dateien auf der Platte: verlieren Sie sie, gehört Ihre Einlage einer Node, die es nicht mehr gibt.",
    step5: "Bestätigen Sie die richtige Kette, indem Sie Netzwerknamen und Chain-ID zurücklesen — nicht, indem Sie einer 200 vertrauen.",
    step6: "LOVE9 auf die P-Chain bringen und staken — und das Ergebnis auf der Kette prüfen, nicht in der Ausgabe des Werkzeugs.",
    guideCta: "Der vollständige Leitfaden, jeder Befehl",
    issuesCta: "Ein Problem melden",
    issuesNote: "Der Issue-Tracker ist der Kanal, und er ist absichtlich öffentlich: ein Validator-Problem ist fast immer eines, das jemand anderes auch treffen wird, und eine privat gegebene Antwort hilft einer einzigen Person. Sagen Sie uns, was Sie gemessen haben, nicht, was Sie geschlossen haben.",
  },
  docs: {
    title: "Dokumentation",
    desc: "Alles, was über die Arbeit mit A1 aufgeschrieben ist: wie man eine Chain startet, wie man einen Validator betreibt und wozu dieses Projekt da ist. Jedes Dokument ist dort verlinkt, wo es wirklich liegt — Sie lesen also die Fassung, die bearbeitet wird.",
    langNote: "Jedes Dokument ist in der Sprache, die in seiner Zeile steht, und die Dokumente selbst übersetzen wir nicht. Eine übersetzte Kopie bleibt nur so lange richtig, bis jemand im Original einen Befehl korrigiert — und falsch wird die Kopie, die niemand bearbeitet.",
    langLabel: "Sprache",
    alsoIn: "Auch auf",
    pdfLabel: "PDF",
    onSiteLabel: "Auf dieser Seite",
    opensGithub: "Öffnet auf GitHub",
  },
  nineYears: {
    title: "Neun Jahre, neun Milliarden",
    lede: "Am 2026-09-09 gehen zwei Sätze in den ersten Block von 9Chain, und neun Jahre beginnen zu zählen. Bis 2035 erwartet die UNO fast neun Milliarden Menschen auf der Erde. Das Ziel dieser neun Jahre: dass jeder von ihnen eine eigene Blockchain besitzt.",
    oneLine: "Meine KI muss um Erlaubnis fragen — und es gibt einen Ort, der festhält, dass sie gefragt hat. Dieser Ort gehört mir.",
    whatTitle: "Was gerade passiert",
    what1: "Mehr als eine Milliarde Menschen nutzen jede Woche KI. Heute antwortet die KI. Morgen handelt sie: sie bucht, zahlt, verhandelt, unterschreibt und vertritt Sie gegenüber der KI eines anderen.",
    what2: "Damit stellt sich eine Frage, die die Menschheit noch nie beantworten musste: Was darf meine KI, und wer hat die Beweise? Heute lautet die Antwort: das Unternehmen, das Ihnen die KI verkauft. Ihm gehören die Berechtigungen, ihm gehören die Protokolle, und es ist der Schiedsrichter, wenn etwas schiefgeht.",
    what3: "Ein Satz wie „gib nicht mehr als zwanzig Dollar aus“ ist keine Grenze — eine KI lässt sich täuschen, überreden, unterwandern. Eine echte Grenze liegt außerhalb der KI, an einem Ort, den sie nicht ändern kann, und dieser Ort gehört Ihnen.",
    promisesTitle: "Fünf Zusagen",
    promise1: "Souveränität — niemand, auch 9Chain nicht, kann Ihr Buch ändern, löschen oder sperren. Seine Regeln sind die, die Sie setzen.",
    promise2: "Beständigkeit — ein verlorenes Telefon ist kein verlorenes Buch. Es überdauert jedes Gerät und jede Firma.",
    promise3: "Nachprüfbarkeit — Sie können die Vergangenheit nicht heimlich umschreiben, und jeder kann das prüfen. Ihre Beweise liegen nicht bei der Gegenseite.",
    promise4: "Übertragbarkeit — wechseln Sie Hoster, Anbieter oder Land: Name und Verlauf kommen mit.",
    promise5: "Zusammenspiel — Ihr Buch spricht mit den Büchern anderer, mit Geschäften, mit Gemeinschaften.",
    promiseNot: "Eine Zusage machen wir nicht: dass Ihre Chain für immer läuft. Das muss sie nicht. Ihr Buch schläft, wenn Sie schlafen, und wer es lesen muss, liest die verankerte Kopie.",
    constitutionTitle: "Eine Verfassung, keine Anweisung",
    constitutionDesc: "Ihr Buch trägt einen laufenden Vertrag: welche KI für Sie unterschreiben darf, was sie darf, bis zu welchem Betrag, bis wann, und wann sie anhalten und erneut fragen muss. Mit einer Berührung widerrufbar, ohne jemandes Erlaubnis. Jede Handlung hinterlässt eine signierte Quittung mit Zeitstempel.",
    constitutionStd: "Ein Vertrag statt einer Anweisung, weil ein Vertrag das Einzige ist, an dem eine KI nicht vorbeireden kann. Er spricht die Standards, auf die die Welt ohnehin zuläuft, also kann die KI jedes Anbieters ihn lesen — wir haben dafür keine eigene Sprache erfunden.",
    treeTitle: "Ein Baum, kein Turm",
    treeDesc: "Neun Milliarden Bücher passen nicht in ein Netzwerk. Jede Ebene registriert und verankert die darunter und prüft Beweise, statt sie noch einmal auszuführen — so wächst der Baum durch neue Äste, nicht durch eine dickere Wurzel.",
    treeRoot: "Wurzel — klein, dauerhaft, bewusst langweilig. Hält Namen und Anker. 9Chain ist eine Wurzel unter vielen.",
    treeTrunk: "Stamm — eine Region, ein Land, ein Bündnis von Gemeinschaften.",
    treeBranch: "Ast — ein Verein, eine Schule, eine Firma, ein Viertel, betrieben von dieser Gemeinschaft selbst.",
    treeLeaf: "Blatt — Ihres. Neun Milliarden davon.",
    stagesTitle: "Neun Jahre, neun Stufen",
    stage2027: "Die ersten hundert echten Menschen, in einer echten Gemeinschaft, mit KI unter einer Verfassung.",
    stage2028: "Zehn Gemeinschaften betreiben ihre Chains selbst, auf drei Kontinenten. Bücher überleben verlorene Telefone.",
    stage2029: "Ein offener Standard und drei Umsetzungen, die nicht von uns sind.",
    stage2030: "Das erste Netzwerk auf diesem Standard, das 9Chain nicht betreibt. Eine Million Bücher.",
    stage2031: "Handelnde KI wird zur Norm — und KI ohne Autoritätswurzel wird zunehmend abgelehnt.",
    stage2032: "Viele Wurzeln, ein Standard. Die Verwaltung des Standards verlässt 9Chain.",
    stage2033: "Bücher reisen in Identitäts-Wallets, Telefonen, Messengern und KI-Plattformen mit.",
    stage2034: "Telefone kommen mit einem Buch ab Werk. Eine Milliarde im aktiven Gebrauch.",
    stage2035: "Eine Chain pro Person. Neun Jahre nach dem ersten Block.",
    stagesNote: "Vier Jahre bauen und beweisen; im fünften macht die Welt es notwendig; vier Jahre, in denen andere es weiter tragen, als wir es könnten. Der letzte Teil ist der Plan, nicht das Risiko.",
    commitTitle: "Was wir zusagen, nicht zu tun",
    commit1: "Wir speichern Ihre Daten nicht. Das Buch hält Belege, nicht Ihr Privatleben.",
    commit2: "Wir verlangen keine Papiere. Identität ist Sache zwischen Ihnen und Ihrer Gemeinschaft.",
    commit3: "Wir löschen nicht. Namen, Bücher und Verlauf sind dauerhaft; sie schlafen, sie sterben nicht.",
    commit4: "Wir zwingen Sie nicht, einen Token zu kaufen, um ein Buch zu haben. Der Standard ist offen; LOVE9 ist Treibstoff dieses Netzwerks, keine Eintrittskarte.",
    commit5: "Wir bauen keine eigene KI. Wir bleiben neutral, damit jede KI Ihnen auf demselben Buch dienen kann.",
    joinTitle: "Neun Jahre beginnen mit den ersten Menschen",
    joinDesc: "Heute ist dies ein laufendes Testnetz mit seinen ersten externen Validatoren und seinen ersten Gemeinschafts-Chains. Alles unten steht ab sofort jedem offen.",
    fullDoc: "Das vollständige Dokument",
  },






  loadTest: {
    badge: 'Lasttest',
    banner: 'Wir führen einen öffentlichen Lasttest durch — {tps} Transaktionen pro Sekunde, von uns erzeugt, nicht von echten Nutzern.',
    bannerLink: 'Live-Zahlen ansehen',
    title: 'Öffentlicher Lasttest',
    intro: 'A1 ist ein junges Testnetz mit sehr wenigen echten Nutzern; sich selbst überlassen erzeugt es fast keine Blöcke. Wir erzeugen einen stetigen Strom von Transaktionen, damit das Netzwerk durchgehend arbeitet und Sie ihm dabei zusehen können. Dieser Verkehr stammt von uns. Er ist keine Nutzung, und wir zählen ihn auch nicht als Nutzung — jede Adresse, die ihn sendet, ist unten aufgeführt, damit Sie sie herausrechnen können.',
    running: 'Läuft gerade',
    stopped: 'Läuft derzeit nicht',
    stoppedWhy: 'Erfasster Grund: {reason}',
    labelTps: 'Transaktionen pro Sekunde',
    labelBlockHeight: 'C-Chain-Block',
    labelSecondsPerBlock: 'Sekunden pro Block',
    labelTotal: 'Bestätigte Transaktionen seit Start',
    labelUptime: 'Läuft seit',
    committedNote: 'Diese Zahlen werden aus den Blöcken selbst gezählt, nicht aus dem, was wir zu senden versucht haben. Eine Transaktion, die das Netzwerk angenommen, aber nie in einen Block aufgenommen hat, zählt hier nicht.',
    addressesTitle: 'Die neun sendenden Adressen',
    addressesNote: 'Jede Transaktion von diesen Adressen wird von einer Maschine von uns erzeugt. Filtern Sie sie heraus, um zu sehen, welche echte Aktivität es gibt.',
    measuring: 'Status des Lasttests wird gelesen…',
    notMeasured: 'Status des Lasttests konnte nicht gelesen werden',
    notMeasuredMore: 'Die Seite funktioniert weiterhin — dies ist nur die Statusanzeige.',
  },

  launch: {
    title: 'Starten Sie Ihre Chain',
    desc: 'Eine eigene L1, im Besitz Ihrer Wallet. Sie signieren einmal, um zu belegen, wer Sie sind, prüfen — und das Netzwerk baut die Chain in etwa fünf Minuten.',
    connectWallet: 'Wallet verbinden',
    connecting: 'Verbinden…',
    signIn: 'Zum Anmelden signieren',
    signing: 'Warte auf Signatur…',
    yourWallet: 'Ihre Wallet',
    youWillOwn: 'Die Chain gehört dieser Wallet. Die Adresse stammt aus Ihrer Signatur — niemand tippt sie ein.',
    noWallet: 'In diesem Browser wurde keine Wallet gefunden. Installieren Sie MetaMask und laden Sie die Seite neu.',
    signRejected: 'Sie haben das Signieren abgelehnt. Es wurde nichts erstellt.',
    switchWallet: 'Andere Wallet verwenden',
    nameLabel: 'Chain-Name',
    namePlaceholder: 'Zum Beispiel: MeineChain',
    nameHelp: 'Buchstaben, Ziffern und Leerzeichen. 2–32 Zeichen. In diesem Netzwerk wird ein bereits verwendeter Name nie erneut vergeben — auch nicht für eine widerrufene Chain.',
    nameInvalid: 'Der Name darf nur Buchstaben, Ziffern und Leerzeichen enthalten, 2 bis 32 Zeichen lang.',
    typeLabel: 'Chain-Typ',
    typeHelp: 'Einmal gewählt, ist es fest — der Genesis einer Chain lässt sich nicht bearbeiten.',
    slotsLeft: 'Noch {left}/{total} Plätze',
    slotsFull: 'Keine Plätze mehr',
    slotsFullDesc:
      'Im aktuellen Modell verfolgt jeder Validator jede L1, und das Protokoll trennt einen Knoten, ' +
      'der mehr als 16 Subnetze angibt. Das ist eine harte Obergrenze und lässt sich nicht anheben. ' +
      'Der Widerruf einer Chain gibt einen Platz zurück.',
    reviewCta: 'Vor dem Absenden prüfen',
    reviewTitle: 'Prüfung — dies ist eine Einbahntür',
    reviewDesc:
      'Der Genesis einer gestarteten L1 ist UNVERÄNDERLICH. Nach diesem Schritt lassen sich Name, ' +
      'Chain-Typ und Besitzer nicht mehr ändern — und ein Widerruf gibt Name und Chain ID ebenfalls nicht zurück.',
    reviewRebuild:
      'Noch eines, bevor Sie drücken: A1 baut am {date} das gesamte Netzwerk neu auf. Die Chain, die ' +
      'Sie heute starten, wird zusammen mit dem alten Netzwerk gelöscht — nicht versteckt, sondern weg.',
    reviewName: 'Chain-Name',
    reviewType: 'Chain-Typ',
    reviewOwner: 'Besitzer',
    reviewBack: 'Zurück und bearbeiten',
    reviewConfirm: 'Ich habe geprüft — Chain starten',
    launching: 'Chain „{name}" wird gestartet',
    launchingDesc:
      'Die Knoten starten NACHEINANDER neu, damit das Netzwerk nie das Quorum verliert — deshalb ist ' +
      'es langsam, und das ist Absicht. Schließen Sie den Tab nicht; falls doch, wird die Chain trotzdem gebaut.',
    etaRemaining: 'Noch etwa {minutes} Minuten',
    preparing: 'Wird vorbereitet…',
    doneTitle: 'Fertig — Chain „{name}" läuft',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Chain zur Wallet hinzufügen',
    doneAdded: 'Zur Wallet hinzugefügt',
    doneActivate: 'Chain aktivieren (Block 1 öffnen)',
    doneActivated: 'Aktiviert',
    doneActivating: 'Warte auf Wallet…',
    doneAddWalletError: 'Die Chain konnte nicht zu Ihrer Wallet hinzugefügt werden. {detail}',
    doneActivateError: 'Die Chain konnte nicht aktiviert werden. {detail}',
    launchAnother: 'Weitere Chain starten',
    launchError: 'Die Chain konnte nicht gestartet werden. {detail}',
    unknownError: 'Nach Abschluss des Laufs erschien die Chain nicht im Verzeichnis.',
    noteTitle: 'Die erste Transaktion einer neuen Chain',
    noteHow: 'Vertrauen Sie der Gas-Schätzung der ersten Transaktion nicht. Am günstigsten öffnen Sie Block 1 mit einer gewöhnlichen Überweisung — drücken Sie unten „Chain aktivieren".',
  },

  myChains: {
    title: 'Meine Chains',
    desc: 'Die L1 im Besitz der Wallet, mit der Sie sich angemeldet haben. Sie lassen sich widerrufen, aber lesen Sie zuerst die Warnung.',
    connectWallet: 'Verbinden Sie Ihre Wallet, um Ihre Chains zu sehen',
    emptyTitle: 'Diese Wallet besitzt noch keine Chain',
    emptyDesc: 'Starten Sie eine und kommen Sie zurück — sie erscheint sofort hier.',
    emptyCta: 'Starten Sie Ihre Chain',
    colChain: 'Chain',
    colType: 'Typ',
    colStatus: 'Status',
    colActions: '',
    validatorCount: '{count} Validatoren',
    measuring: 'wird gemessen',
    cannotMeasure: 'Messung nicht möglich',
    statusHelp: 'Gemessen an der Validatorenzahl des Subnetzes, nicht an der Blockhöhe.',
    noValidators: '0 Validatoren',
    noValidatorsDesc:
      'Diese Chain kann KEINE Transaktion finalisieren: Das Subnetz hat keine Validatoren. Sie ' +
      'antwortet weiterhin auf RPC-Aufrufe, und Wallets verbinden sich weiterhin — es gibt also kein ' +
      'anderes sichtbares Zeichen.',
    walletSettings: 'Wallet-Einstellungen',
    addToWallet: 'Zur Wallet hinzufügen',
    addedToWallet: 'Hinzugefügt',
    addWalletError: 'Konnte nicht zu Ihrer Wallet hinzugefügt werden. {detail}',
    revoke: 'Widerrufen',
    revokeTitle: '„{name}" widerrufen?',
    revokeWarn1: 'Die Chain stellt den RPC-Dienst sofort ein und verschwindet aus dem öffentlichen Verzeichnis.',
    revokeWarn2:
      'Ein Widerruf löscht das Subnetz auf der P-Chain NICHT — was dort erzeugt wurde, lässt sich nicht ' +
      'entfernen, solange dieses Netzwerk läuft. Er entfernt das Netzwerk auch nicht aus den Wallets ' +
      'derer, die diese Chain bereits hinzugefügt haben.',
    revokeWarn3:
      'Name und Chain ID bleiben reserviert und werden in diesem Netzwerk NIEMALS an jemanden neu ' +
      'vergeben. Eine erneute Vergabe würde die Wallet eines früheren Nutzers stillschweigend auf die ' +
      'Chain einer anderen Person zeigen lassen.',
    revokeWarn4: 'Im Gegenzug wird einer der 15 Plätze zurückgegeben.',
    revokeTypeLabel: 'Geben Sie zur Bestätigung den Chain-Namen exakt ein',
    revokeNameMismatch: 'Das stimmt nicht mit dem Chain-Namen überein.',
    revokeConfirm: 'Endgültig widerrufen',
    revokeCancel: 'Abbrechen',
    revoking: '„{name}" wird widerrufen — etwa fünf Minuten',
    revokeDone: '„{name}" widerrufen. Noch {left}/{total} Plätze.',
    revokeError: 'Widerruf nicht möglich. {detail}',
    revokeUnknown: 'Nach Abschluss des Laufs steht die Chain weiterhin im Verzeichnis.',
    revokedBadge: 'Widerrufen',
    revokedDesc: 'Name und Chain ID bleiben in diesem Netzwerk reserviert.',
  },

  compare: {
    title: 'A1 ↔ C1 — Vergleich',
    desc:
      '9Chain betreibt ZWEI Testnetze desselben Produkts parallel, unterschieden durch die Engine: ' +
      'A1 auf der Avalanche-Engine, C1 auf der Cosmos-Engine. Diese Tabelle hält die Abwägungen ' +
      'zwischen beiden Richtungen fest, veröffentlicht, damit jede Person widersprechen kann — für die ' +
      'C1-Seite gibt es noch keine Live-Messungen.',
    selfScoreTitle: 'Die Punkte unten sind eine SELBSTEINSCHÄTZUNG des Teams, keine unabhängige Messung',
    selfScoreDesc:
      'Die Spalte „wie gemessen" sagt, wie jedes Kriterium geprüft wurde. Jedes Kriterium ohne datierte ' +
      'Messung ist ein Architektururteil, keine Zahl. Die Gewichte bestimmen Sie — die Punktzahl folgt.',
    colNo: 'Nr.',
    colCriterion: 'Kriterium',
    colKind: 'Typ',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Gewicht',
    kindArchitecture: 'Architektur',
    kindLiveData: 'Live-Daten',
    totalScore: 'Gesamtpunktzahl mit Ihren Gewichten',
    tied: 'Gleichstand',
    leads: 'führt',
    liveDataTitle: 'Live-Daten',
    a1Validators: 'A1 — verbundene Validatoren',
    a1Chains: 'A1 — laufende L1',
    a1Blocks: 'A1 — C-Chain-Block',
    c1Unreachable: 'C1 — nicht erreichbar',
    c1UnreachableDesc:
      'Die Cosmos-REST-URL von C1 (Port 1317) wird benötigt. Die Tabelle bleibt nutzbar: Die A1-Seite ' +
      'sind Live-Daten, die C1-Seite ist ein Architektururteil wie die übrigen Kriterien.',
    measuring: 'wird gemessen…',
    cannotMeasure: 'Messung nicht möglich',
    critDecentralisation: 'Dezentralisierung (Validator-Obergrenze)',
    noteDecentralisation: 'PROTOKOLL-Obergrenze: Snowman ~Tausende Knoten gegenüber CometBFT ~150. A1 HEUTE: 9 Knoten, eine Maschine, ein Anbieter',
    critFinality: 'Finalität',
    noteFinality: '~1–2s gegenüber ~5–6s',
    critEvmMaturity: 'Reife der EVM',
    noteEvmMaturity: 'coreth im Produktivbetrieb gegenüber Cosmos EVM vor v1',
    critWalletCompat: 'Kompatibilität mit Endkunden-Wallets und DeFi',
    noteWalletCompat: 'vollständiges MetaMask/EVM',
    critLaunchUx: 'Erlebnis beim Start einer Chain',
    noteLaunchUx: 'beide haben eine Konsole; bei A1 gemessen ~170s je Start',
    critInterop: 'Reichweite der Interoperabilität',
    noteInterop: 'Warp/ICM innerhalb des Ökosystems (A1 hat bereits Werte bewegt, M6.2) gegenüber der Reichweite von IBC',
    critOpCost: 'Betriebskosten je Chain',
    noteOpCost: 'Knoten + Plugin gegenüber K8s-Operator',
    critBootstrap: 'Anschub des Netzwerkeffekts',
    noteBootstrap: 'eine eigene Insel gegenüber IBC, das an der Cosmos-Wirtschaft hängt',
    critEconSecurity: 'Öffentliche ökonomische Sicherheit',
    noteEconSecurity: 'PoS token-besichert von Anfang an',
    critSwitchCost: 'Wechselkosten für das Team',
    noteSwitchCost: 'A1 ist neu gegenüber C1, das seit Monaten läuft',
  },

  faucet: {
    title: 'Test-Token holen',
    desc: 'LOVE9 im A1-Testnetz hat keinen realen Wert — es existiert, damit Sie beim Testen Gas bezahlen können. Geben Sie eine Wallet-Adresse ein, wir senden sofort.',
    addressLabel: 'Ihre Wallet-Adresse',
    addressFromWallet: 'Aus der verbundenen Wallet übernommen. Ändere sie, wenn die Token an eine andere Adresse gehen sollen.',
    useWalletAddress: 'Meine Wallet-Adresse verwenden',
    addressPlaceholder: '0x… (40 Hex-Zeichen)',
    requestCta: 'Schickt mir Token',
    sending: 'Wird gesendet…',
    addressHelp: 'Fügen Sie die Wallet-Adresse ein, die die Token erhalten soll. Drücken Sie oben „Netzwerk zur Wallet hinzufügen", falls noch nicht geschehen.',
    addNetwork: 'Netzwerk zur Wallet hinzufügen',
    addNetworkDone: 'Zur Wallet hinzugefügt',
    addNetworkRejected: 'Sie haben in Ihrer Wallet auf Ablehnen gedrückt. Drücken Sie erneut, wenn Sie das Netzwerk hinzufügen möchten.',
    addNetworkError: 'Ihre Wallet konnte das Netzwerk nicht hinzufügen. Fügen Sie es manuell mit den Einstellungen daneben hinzu — und senden Sie die Zeile unten an das Team:',
    noWallet: 'In diesem Browser wurde keine Wallet gefunden. Installieren Sie MetaMask und laden Sie die Seite neu.',
    quotaLabel: 'Verbleibendes Kontingent',
    quotaFormat: '{left}/{total} Anfragen pro {hours} Stunden',
    quotaExhausted: 'Sie haben Ihr gesamtes Kontingent verbraucht. Versuchen Sie es in {minutes} Minuten erneut.',
    quotaUnreadable: 'Ihr Kontingent konnte nicht gelesen werden — Sie können weiterhin anfragen, wissen nur nicht, wie viele übrig sind.',
    sentOk: '{count} {symbol} an {address} gesendet',
    viewTransaction: 'Transaktion ansehen',
    settingsTitle: 'Netzwerkeinstellungen',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Symbol',
    settingsDecimals: 'Dezimalstellen',
    settingsExplorer: 'Explorer',
    decimalsHelp:
      'Wallets zeigen 18 Dezimalstellen, weil die C-Chain die EVM ausführt. Auf der P/X-Chain wird ' +
      'LOVE9 mit 9 Dezimalstellen gezählt. Eine Münze, zwei Skalen — nicht zwei verschiedene Token.',
    genericError: 'Senden nicht möglich. {detail}',
  },

  langPicker: {
    label: 'Sprache',
    machineBadge: 'maschinell',
    machineNote: 'Nur die vietnamesische Fassung wurde von einem Menschen geprüft. Die übrigen Übersetzungen sind maschinell und können Fehler enthalten — die englische Fassung ist maßgeblich.',
    notAvailable: 'noch nicht verfügbar',
  },

  errors: {
    unreachable: 'Das Netzwerk war nicht erreichbar',
    unreachableDesc: 'Das Netzwerk ist vielleicht ausgelastet, oder Ihre Verbindung ist abgebrochen.',
    empty: 'Hier gibt es noch nichts',
    addressEmpty: '{label} darf nicht leer sein',
    addressFormat: '{label} muss 0x und danach 40 Hex-Zeichen sein',
    addressChecksum: '{label} scheitert an seiner EIP-55-Prüfsumme — am wahrscheinlichsten wurde ein Zeichen falsch getippt oder beim Einfügen verloren',
    addressZero: '{label} darf nicht die Null-Adresse sein — niemand hält deren Schlüssel',
    timeout: 'Keine Antwort nach {seconds}s',
    notJson: 'Die Antwort war kein JSON (HTTP {status}) — die Anfrage wurde wahrscheinlich falsch geroutet',
    noWallet: 'In diesem Browser wurde keine Wallet gefunden.',
  },

  notFound: {
    code: '404',
    title: 'Diese Seite existiert nicht',
    desc: 'Die aufgerufene Adresse existiert auf 9Chain Testnet A1 nicht. Vielleicht wurde sie umbenannt, oder der URL sind beim Kopieren ein paar Zeichen abhandengekommen.',
    topPagesTitle: 'Die drei meistgenutzten Seiten:',
    navLabel: 'Wohin als Nächstes',
    goHome: 'Zurück zur Startseite',
    goFaucet: 'Test-Token holen',
    goLaunch: 'Starten Sie Ihre Chain',
    lookingForTx: 'Suchen Sie eine Transaktion oder eine Adresse? Prüfen Sie den Hash und versuchen Sie es erneut.',
  },
};

export default de;
