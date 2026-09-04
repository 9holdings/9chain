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
  },

  home: {
    testnetBadge: 'Testnetz — die Token haben keinen realen Wert',
    primaryCta: 'Starten Sie Ihre Chain',
    secondaryCta: 'Holen Sie sich zuerst Test-Token',
    title: 'Starten Sie Ihre eigene Chain auf A1',
    subtitle: 'Eine eigene L1, im Besitz der Wallet, mit der Sie signieren, die wirklich im Testnetz läuft. Dauert etwa drei Minuten.',
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
    desc: 'Eine eigene L1, im Besitz Ihrer Wallet. Sie signieren einmal, um zu belegen, wer Sie sind, prüfen — und das Netzwerk baut die Chain in etwa drei Minuten.',
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
    revoking: '„{name}" wird widerrufen — etwa drei Minuten',
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
