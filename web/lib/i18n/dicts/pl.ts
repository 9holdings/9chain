import type { Dict } from '../en';

/**
 * Polski — tłumaczenie maszynowe, nieprzejrzane przez człowieka.
 * Językiem źródłowym jest angielski (`../en.ts`); w razie rozbieżności obowiązuje wersja angielska.
 *
 * 🔴 Tych trzech miejsc nie wolno łagodzić: `reGenesis.*` (sieć zostanie skasowana),
 * `deChain.soatMoTa` (drzwi w jedną stronę), `chainCuaToi.thuHoiY*` (cofnięcie nie zwraca nazwy).
 * Mówią „trwale" i „nie da się zmienić", żeby nikt nie stracił majątku, sądząc, że da się cofnąć.
 */
export const pl: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: 'Publiczna sieć testowa 9Chain — niezależna sieć działająca na silniku Avalanche',
    tagline: 'niezależna sieć na silniku Avalanche',
    walletRejected: 'Odrzuciłeś żądanie w swoim portfelu. Nic się nie zmieniło.',
    noWalletMobile: 'Przeglądarka w telefonie nie obsługuje rozszerzeń portfela. Otwórz tę stronę w aplikacji MetaMask — jej wbudowana przeglądarka ma portfel.',
    openInMetaMask: 'Otwórz w aplikacji MetaMask',
    loading: 'Wczytywanie…',
    retry: 'Spróbuj ponownie',
    copy: 'Kopiuj',
    copied: 'Skopiowano',
    close: 'Zamknij',
    openMenu: 'Otwórz menu',
    closeMenu: 'Zamknij menu',
    switchToDark: 'Przełącz na tryb ciemny',
    switchToLight: 'Przełącz na tryb jasny',
    skipToContent: 'Przejdź do treści głównej',
    stepDone: ' — gotowe',
    stepRunning: ' — trwa',
    stepFailed: ' — nieudane',
    stepPending: ' — oczekuje',
  },

  presets: {
    standard: {
      name: 'Standardowy',
      desc: 'Zwykły łańcuch EVM. Właściciel otrzymuje wszystkie tokeny z genesis i prawo zmiany opłat.',
    },
    'zero-fee': {
      name: 'Niemal zerowe opłaty',
      desc: 'baseFee = 1 wei, więc transakcja płaci dokładnie to minimum (przelew kosztuje 0,000000000000021 LOVE9). Dobre do gier, eksperymentów i łańcuchów wewnętrznych. Cena: prawie nic nie powstrzymuje spamu.',
    },
    'high-throughput': {
      name: 'Wysoka przepustowość',
      desc: 'Pięć razy więcej transakcji na blok (gasLimit 60 mln zamiast 12 mln). Dobre do gier, giełd i wszystkiego ze stałym strumieniem małych transakcji. Cena: cięższe bloki, a kto prowadzi węzeł tego łańcucha, potrzebuje mocniejszej maszyny.',
    },
    mintable: {
      name: 'Dobijalna podaż',
      desc: 'Właściciel może w każdej chwili wybić więcej natywnego tokena przez prekompilat 0x0200000000000000000000000000000000000001. Podaż NIE jest stała — każdy, kto używa tego łańcucha, musi o tym wiedzieć.',
    },
    'owner-deploy-only': {
      name: 'Wdrażanie kontraktów tylko przez właściciela',
      desc: 'Pozostali nadal mogą wysyłać transakcje i korzystać z istniejących kontraktów, ale nie mogą wdrażać własnych. Właściciel nadaje to prawo komukolwiek przez prekompilat 0x0200000000000000000000000000000000000000.',
    },
    permissioned: {
      name: 'Z uprawnieniami (tylko zatwierdzeni nadawcy)',
      desc: 'Tylko adresy z listy mogą WYSYŁAĆ transakcje. Odpowiednie dla wewnętrznego łańcucha firmy. ⚠️ To najsurowszy preset: nieznany portfel nie zrobi tu nic.',
    },
  },
  steps: {
    genesis: 'Budowanie genesis',
    subnet: 'Tworzenie podsieci i łańcucha na P-Chain',
    rpc: 'Oczekiwanie na odpowiedź RPC tego L1',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',

    banner: 'A1 została odbudowana {date}. Każde saldo i każdy łańcuch utworzone przed tą datą już nie istnieją.',
    bannerLink: 'Co to oznacza',
    badge: 'Odbudowana',

    title: 'A1 została odbudowana {date}',
    desc:
      'Sieć testowa A1 została odbudowana od bloku 0. Łańcuchy, salda i historia transakcji ' +
      'utworzone przed tą datą już nie istnieją — nie są ukryte, po prostu ich nie ma. ' +
      'Ta strona wyjaśnia, co widzisz i co masz zrobić.',

    willSeeTitle: 'Co zobaczysz',
    willSee1:
      'Twój portfel nadal się łączy, nadal pokazuje właściwą nazwę sieci i ten sam Chain ID ' +
      '{chainId} — było to zamierzone. Ale twoje saldo wyniesie 0.',
    willSee2:
      'Każda uruchomiona przez ciebie sieć L1 zniknęła z katalogu. Ich nazwy i Chain ID są znów ' +
      'wolne i każdy może je zająć.',
    willSee3:
      'Jeśli podpisałeś transakcję, ale nigdy jej nie rozgłosiłeś, nie rób tego teraz — ' +
      'należy ona do sieci, która już nie istnieje.',

    toDoTitle: 'Co musisz zrobić',
    toDo1: 'Poproś ponownie o tokeny testowe w kranie. Limity zostały wyzerowane dla wszystkich.',
    toDo2:
      'Usuń z portfela każdą pojedynczą sieć L1 — mają własne Chain ID i teraz nie wskazują na nic. ' +
      'Głównej sieci A1 NIE trzeba usuwać; jej ustawienia się nie zmieniły.',
    toDo3: 'Uruchom swój łańcuch ponownie, jeśli go potrzebujesz. Starą nazwę mógł zająć ktoś inny.',

    archiveTitle: 'Archiwum starej sieci',
    archiveDesc:
      'Stan sieci sprzed odbudowy został wyeksportowany, a jego skrót opublikowany, ' +
      'żeby każdy, kto chce, mógł go sprawdzić.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1 zostanie odbudowana {date} — każdy łańcuch, saldo i transakcja utworzone wcześniej zostaną skasowane.',
    bannerLink: 'Szczegóły',
    badge: 'Nadchodzi odbudowa',

    title: 'A1 zostanie odbudowana {date}',
    desc:
      'Cała sieć testowa A1 zostanie odbudowana od bloku 0. Wszystko, co powstało przed tą datą, ' +
      'zniknie — nie zostanie ukryte, lecz przestanie istnieć. Ta strona mówi dokładnie, co zostanie ' +
      'utracone i co masz zrobić.',

    whyTitle: 'Dlaczego odbudowa jest konieczna',
    why1:
      'Genesis sieci jest niezmienny. Właśnie to czyni ją godną zaufania — nikt, łącznie z jej ' +
      'twórcami, nie może zmienić liczby, gdy raz zostanie zapisana w bloku 0.',
    why2:
      'Cena jest taka: zmiana liczby wewnątrz genesis nie zostawia innej możliwości niż odbudowa ' +
      'sieci od zera. A1 podniosła całkowitą podaż do 9 000 000 000 LOVE9 i cały zakres parametrów ' +
      'stakingu trzeba było przeliczyć na nowo, żeby do tego pasował.',
    why3:
      'To jest sieć testowa, a odbudowa to coś, na co sieć testowa może sobie pozwolić. Właściwie ' +
      'po to sieci testowe istnieją: żeby takie zmiany działy się tutaj, a nie na sieci głównej.',

    lostTitle: 'Co zostanie utracone',
    lostDesc: 'Wszystko, bez wyjątku:',
    lost1: 'Każda sieć L1 uruchomiona przez użytkownika, także te działające bez zarzutu.',
    lost2: 'Każde saldo LOVE9, łącznie z tokenami otrzymanymi z kranu.',
    lost3: 'Każda transakcja, każdy blok, cała historia C-Chain, P-Chain i X-Chain.',
    lost4: 'Każdy walidator i każda delegacja.',

    keptTitle: 'Co zostanie zachowane',
    keptDesc:
      'Przed skasowaniem cała umierająca sieć zostanie wyeksportowana wraz z opublikowanym skrótem, ' +
      'żeby zapis pozostał weryfikowalny. To, co się wydarzyło, nadal będzie można sprawdzić, nawet ' +
      'gdy sieci, która to wykonywała, już nie będzie. Link do archiwum pojawi się tutaj w dniu odbudowy.',

    toDoTitle: 'Co musisz zrobić',
    toDoBefore: 'Przed odbudową:',
    toDo1:
      'Nie buduj teraz na A1 niczego, co zależy od przetrwania danych. Jeśli sprawdzasz jakiś pomysł ' +
      '— proszę bardzo, tylko nie traktuj obecnego łańcucha jako miejsca przechowywania.',
    toDoAfter: 'Po odbudowie:',
    toDo2:
      'Usuń z portfela każdą dodaną wcześniej sieć L1 — te łańcuchy już nie istnieją, a portfel na nie ' +
      'wskazujący będzie po prostu stał. Głównej sieci A1 nie trzeba usuwać: jej ustawienia się nie zmieniły.',
    toDo3:
      'Jeśli twój portfel nie ma jeszcze sieci A1, dodaj ją przyciskiem na stronie kranu, ' +
      'zamiast wpisywać ustawienia ręcznie.',
    toDo4: 'Poproś ponownie o tokeny w kranie i uruchom swój łańcuch jeszcze raz, jeśli go chcesz.',

    silentTitle: 'Twój portfel cię nie ostrzeże',
    silentDesc:
      'Nowa sieć zachowuje Chain ID {chainId}, ten sam adres RPC i tę samą nazwę co stara. To zamierzone ' +
      '— żeby każdy już opublikowany dokument i poradnik pozostał poprawny. Ceną jest to, że twój ' +
      'portfel nie ma żadnego sygnału, iż właśnie połączył się z inną siecią. Dlatego dwie poniższe ' +
      'rzeczy wydarzą się bezgłośnie.',
    silent1:
      'Portfel ze starą konfiguracją nadal się połączy, nadal pokaże właściwą nazwę sieci i zgłosi ' +
      'saldo 0. Ta liczba jest PRAWIDŁOWA: twoje stare tokeny już nie istnieją, nie są ukryte. Nie ' +
      'musisz dodawać sieci ponownie — po prostu poproś o nowe tokeny w kranie. Jeśli portfel zgłasza ' +
      'zablokowaną transakcję albo błędny numer kolejny, wyczyść w nim dane aktywności tej sieci: ' +
      'pamięta jeszcze licznik transakcji martwego łańcucha, podczas gdy nowy łańcuch liczy od 0.',
    silent2:
      'Jeśli nadal masz podpisaną, lecz nigdy nierozgłoszoną transakcję, wyrzuć ją. Podpis jest nadal ' +
      'ważny w nowej sieci, bo Chain ID się nie zmienił. Transakcja nie przejdzie, dopóki portfel jest ' +
      'pusty — ale w chwili, gdy poprosisz o tokeny w kranie, stanie się wykonalna i może przejść ' +
      'w momencie, którego się nie spodziewasz.',

    repeatTitle: 'Czy to się powtórzy',
    repeatDesc:
      'Możliwe. A1 wciąż jest siecią testową i dopóki społeczność nie wybierze kierunku sieci głównej ' +
      'pomiędzy A1 a C1, zachowujemy prawo do odbudowy sieci, gdy coś wewnątrz genesis musi się zmienić. ' +
      'Zobowiązujemy się natomiast uprzedzić cię wcześniej i powiedzieć wprost, co zostanie utracone.',

    alreadyTitle: 'Już raz odbudowana 2026-08-27',
    alreadyDesc:
      'A1 została już raz odbudowana 2026-08-27, przed datą podaną poniżej. Jeśli miałeś wcześniej tokeny testowe, twoje saldo wynosi teraz 0 — to jest prawidłowe, a nie usterka portfela. Żaden łańcuch użytkownika nie przepadł: w katalogu były wyłącznie automatyczne łańcuchy testowe. Poproś ponownie o tokeny w kranie.',
    dateNote: 'Data może się przesunąć',
    dateNoteDesc:
      'Data {date} zależy od wcześniejszej kontroli go/no-go. Jeśli się przesunie, zmienimy datę na ' +
      'tej stronie, zamiast milczeć.',
  },

  footer: {
    tryIt: 'Wypróbuj',
    explore: 'Przeglądaj',
    about: 'O projekcie',
    explorer: 'Eksplorator 9Scan-A1',
    mainSite: 'Główna strona 9Chain',
    opensNewTab: '(otwiera się w nowej karcie)',
    navLabel: 'Odnośniki w stopce',
    rebuildPlan: 'Plan odbudowy sieci',
  },

  nav: {
    home: 'Strona główna',
    faucet: 'Weź tokeny testowe',
    launch: 'Uruchom łańcuch',
    myChains: 'Moje łańcuchy',
    compare: 'A1 ↔ C1',
    directory: 'Katalog L1',
    explorer: 'Eksplorator',
    explorerAria: 'Otwórz 9Scan-A1 w nowej karcie',
    ceremony: "Ceremonia",
    // Footer / cross-page labels for the three "About" pages — copied from each page's own
    // `title` on 2026-09-05, when English was split per page: the footer must not read a
    // page's group, or that page's whole text rides in every other page's bundle.
    validators: "Uruchom walidatora",
    docs: "Dokumentacja",
    nineYears: "Dziewięć lat, dziewięć miliardów",
  },

  home: {
    testnetBadge: 'Sieć testowa — tokeny nie mają realnej wartości',
    primaryCta: 'Uruchom swój łańcuch',
    secondaryCta: 'Najpierw weź tokeny testowe',

    title: 'Uruchom własny łańcuch na A1',
    subtitle: 'Własna sieć L1, należąca do portfela, którym podpisujesz, działająca naprawdę w sieci testowej. Zajmuje około pięciu minut.',
    tableCaption: 'Każdy wiersz to prawdziwy łańcuch działający na A1, z własnym właścicielem.',
    colChain: 'Łańcuch',
    colType: 'Typ',
    colOwner: 'Właściciel',
    systemDefault: 'domyślne systemu',
    emptyTitle: 'Żadna sieć L1 jeszcze nie działa',
    emptyDesc: 'Byłbyś pierwszy. Katalog aktualizuje się, gdy tylko twój łańcuch wystartuje.',
    moreChains: 'Zobacz wszystkie {count} łańcuchów w katalogu',

    disclosure: '9 z 11 walidatorów działa na tym samym serwerze i u tego samego dostawcy; pozostałe dwa dołączyły skądinąd i tylko jeden z nich jest online — zdecentralizowane na poziomie protokołu, jeszcze nie na poziomie infrastruktury.',
    idleBlocksNote: 'Avalanche nie produkuje pustych bloków, więc wysokość bloku stojąca w miejscu, gdy nikt nie wykonuje transakcji, jest normalna. Miarą życia jest liczba walidatorów obok.',
  },

  stats: {
    title: 'Sieć działa',
    validators: 'Połączone walidatory',
    l1Count: 'Działające L1',
    blockHeight: 'Blok C-Chain',
    measuring: 'Pomiar sieci…',
    cannotMeasure: 'Nie udało się odczytać statystyk sieci',
    cannotMeasureDesc: 'Strona nadal działa — to tylko wskaźnik stanu.',
  },
  directory: {
    lede: 'Każdy łańcuch w sieci testowej A1 i rzeczywisty stan każdego z nich.',
    howToTitle: 'Jak czytać tę tabelę.',
    howToBody: 'Avalanche nie tworzy pustych bloków — łańcuch tworzy blok tylko wtedy, gdy jest transakcja, więc nieruchomy licznik bloków to norma i nie znaczy, że łańcuch jest martwy. Groźny jest przypadek odwrotny: łańcuch bez walidatorów wciąż odpowiada na RPC, wciąż pozwala czytać salda, a portfele wciąż się z nim łączą — ale każda transakcja wisi w nieskończoność. Dlatego prawdziwym znakiem życia jest tu liczba walidatorów podsieci, czytana wprost z P-Chain, a nie wysokość bloku.',
    ownerTitle: 'Właściciel (admin)',
    ownerBody: 'to adres podany przy uruchomieniu łańcucha. Trzyma całą podaż genezy i prawo do zmiany opłat tego łańcucha — łańcuch należy do niego, nie do fundacji. Łańcuchy uruchomione przed dodaniem tego pola w konsoli pokazują domyślną wartość systemu.',
    mainNetwork: 'SIEĆ GŁÓWNA',
    mainNetworkDesc: 'C-Chain sieci testowej A1 — tam działają kran i eksplorator.',
    running: 'DZIAŁA',
    notAnswering: 'NIE ODPOWIADA',
    notAnsweringDesc: 'RPC nie odpowiada — możliwe, że żaden węzeł jeszcze nie śledzi tej podsieci.',
    unclear: 'NIEJASNE',
    unclearDesc: 'Nie udało się odczytać zbioru walidatorów z P-Chain.',
    ownerAdmin: 'Właściciel (admin)',
    blocks: 'Bloki',
    subnetValidators: 'Walidatorzy podsieci',
    created: 'Utworzono',
    revokedAt: 'Cofnięto',
    copyOwner: 'Kopiuj adres właściciela',
    revoked: 'COFNIĘTY',
    revokedDesc: 'Ten łańcuch przestał służyć: żaden węzeł go już nie uruchamia, a jego RPC nie odpowiada. Jeśli dodałeś tę sieć do portfela, usuń ją — pozostawienie daje tylko błędy połączenia.',
    neverReissued: 'nigdy nie wydawany ponownie innemu łańcuchowi',
    revokedGroup: 'Cofnięte ({count})',
    listError: 'Nie udało się odczytać listy łańcuchów ({error}). Sieć główna jest nadal pokazana poniżej.',
    footSummary: '{count} L1 działa + sieć główna',
    footRevoked: '{count} cofnięte',
    footUpdated: 'zaktualizowano o {time}',
    tileTotal: 'L1 w katalogu',
    tileRunning: 'Zmierzone, działają',
    tileAttention: 'Wymagają uwagi',
    tileRevoked: 'Odwołane',
    sweepProgress: 'Zmierzono {done} z {total}',
    measuringDesc: 'W kolejce do pomiaru.',
    howToToggle: 'Jak czytać tę listę',
    searchLabel: 'Szukaj',
    searchPlaceholder: 'Nazwa, Chain ID, właściciel lub blockchain ID',
    filterStatus: 'Stan',
    filterAll: 'Wszystkie',
    filterRunning: 'Działają',
    filterAttention: 'Wymagają uwagi',
    filterRevoked: 'Odwołane',
    filterType: 'Typ',
    filterTypeAll: 'Wszystkie typy',
    groupBy: 'Grupuj według',
    groupNone: 'Bez grupowania',
    groupOwner: 'Właściciel',
    groupType: 'Typ',
    groupStatus: 'Stan',
    groupNoType: 'Brak zapisanego typu',
    groupCount: '{shown} z {total}',
    sortBy: 'Sortuj',
    sortNewest: 'Najnowsze najpierw',
    sortOldest: 'Najstarsze najpierw',
    sortName: 'Nazwa',
    sortChainId: 'Chain ID',
    sortBlocks: 'Najwięcej bloków',
    refresh: 'Zmierz ponownie',
    listCaption: 'Łańcuchy na A1 wraz ze zmierzonym stanem każdego',
    showing: 'Pokazano {shown} z {total}',
    showMore: 'Pokaż kolejne {count}',
    noMatchTitle: 'Żaden łańcuch nie pasuje',
    noMatchDesc: 'Spróbuj innego hasła lub wyczyść filtry.',
    clearFilters: 'Wyczyść filtry',
    showDetails: 'Szczegóły',
    hideDetails: 'Ukryj',
    detailsOf: 'Szczegóły {name}',
    nativeToken: 'Token natywny',
    mismatch: 'ZŁY ŁAŃCUCH',
    mismatchDesc: 'RPC odpowiedział Chain ID {got} zamiast {expected} — najpewniej błąd routingu, nie tego łańcucha.',
  },
  ceremony: {
    badge: "Ceremonia",
    title: "Ceremonia Block Adam",
    desc: "W jednej dokładnej sekundzie sieć zapisuje trzy nazwane bloki. Ta strona mówi, co się wydarzy, co niosą te bloki i jak sprawdzić to potem samodzielnie, bez pytania nas.",
    momentLabel: "Moment",
    countdownLabel: "Pozostały czas",
    days: "dni",
    hours: "godz.",
    minutes: "min",
    seconds: "s",
    yourZone: "Twoja strefa czasowa",
    blocksTitle: "Trzy bloki",
    adamDesc: "PIERWSZY blok, którego znacznik czasu sięga momentu — definiowany przez czas, nie przez wysokość. Kto wyprodukuje ten blok, ten go wyprodukował.",
    evaDesc: "Blok bezpośrednio po Adamie, według wysokości.",
    unionDesc: "Dziesięć bloków po Adamie. Tutaj zakotwiczona jest wiadomość 9S Union.",
    messagesTitle: "Co niosą bloki",
    messagesDesc: "Adam i Eva niosą te same dwa zdania, które zapisano w bloku 0 przy tworzeniu sieci — ceremonia wskazuje na te same pliki, więc nie mogą się rozejść. Każdy skrót poniżej zamrożono 2026-09-03, przed ceremonią, i można go odtworzyć przez sha256 na surowych bajtach.",
    quietTitle: "Jedna cicha minuta",
    quietDesc: "C-Chain nie produkuje pustych bloków, dlatego ruch syntetyczny, o którym otwarcie piszemy na stronie na żywo, jest zatrzymywany krótko przed momentem. Inaczej ceremonia ścigałaby się z automatycznym nadawcą o dwusekundowe okno. Ceną jest minuta ciszy; kupuje ona to, że te bloki należą do ceremonii, a nie do bota.",
    strangerTitle: "Ktoś obcy może zabrać ten blok, a zapis i tak się broni",
    strangerDesc: "A1 to publiczna sieć testowa i w tej sekundzie każdy może wysłać transakcję. Zapis jest zakotwiczony w haszu transakcji ceremonii, nigdy w wysokości bloku — jeśli więc cudzy blok pierwszy sięgnie momentu, to, co zapisano, pozostaje prawdą; ceremonia po prostu nie wyprodukowała tego bloku.",
    checkTitle: "Sprawdź samodzielnie",
    checkDesc: "Poproś dowolny węzeł A1 o blok w tym momencie i odczytaj jego znacznik czasu. Nic na tej stronie nie wymaga wiary na słowo.",
    resultTitle: "Co zostało zapisane",
    resultPending: "Jeszcze nieopublikowane. Pakiet dowodowy — moment, użyte przesunięcie, ruch tła, trzy hasze transakcji, numery bloków i wynik odczytania bajtów z łańcucha — zostanie opublikowany tutaj po ceremonii.",
    resultBlock: "Block Adam",
    resultTimestamp: "Jego znacznik czasu",
    resultBundle: "Pakiet dowodowy",
    reachedNote: "Moment minął. Zapis nie jest tu jeszcze opublikowany — nastąpi to po odczytaniu bajtów z łańcucha i porównaniu ich z zamrożonymi skrótami.",
  },
  validators: {
    title: "Uruchom walidatora",
    desc: "Zdanie z naszej strony głównej — dziewięciu walidatorów na jednej maszynie u jednego dostawcy — to uczciwa słabość tej sieci, a ktoś z zewnątrz z wolną maszyną jest jedyną rzeczą, która ją naprawia. Ta strona mówi, ile to kosztuje i czego nie zwraca.",
    liveTitle: "Zbiór walidatorów w tej chwili",
    liveTotal: "Walidatorzy",
    liveConnected: "Połączeni",
    liveMinBond: "Minimalny wkład własny",
    liveAtMinimum: "Na minimum",
    measuredNote: "Odczytane z sieci przy wczytywaniu tej strony, nie wpisane ręcznie. Minimalny wkład jest wkompilowany w binarkę węzła — do godzin przed powstaniem tej sieci wynosił 25 000, więc strona cytująca go z pamięci jest o jedną przebudowę od pomyłki w sprawie pieniędzy.",
    costTitle: "Ile to kosztuje",
    costMachine: "Maszyna, która pozostaje włączona, i publiczny adres z portem 9651 osiągalnym z zewnątrz. Żadnego wniosku, żadnej listy dozwolonych, żadnej bramki uprawnień na poziomie protokołu — rola operatora nie została w genezie przyznana nikomu, więc dołączyć może każde konto ze środkami.",
    costBond: "Własny wkład, zablokowany na wybrany przez ciebie okres: najkrócej 24 godziny, najdłużej 365 dni.",
    faucetTitle: "Skąd bierze się LOVE9 i pułapka w arytmetyce",
    faucetDesc: "Kran to cała ścieżka finansowania — nie ma o co wnioskować ani kogo prosić. Ale dziewięć żądań daje dokładnie wkład, a dokładnie wkład NIE wystarcza: transakcje przenoszące saldo z C-Chain na X-Chain, a potem na P-Chain, oraz ta składająca stawkę, opłacane są z tego samego salda. Zaplanuj dziesięć żądań i do godziny oczekiwania na limit na IP. Mówimy o tym tutaj, a nie na końcu, bo wcześniejsza wersja naszego własnego przewodnika pisała „dziewięć wystarczy” i prostowała się trzysta linijek dalej.",
    getTitle: "Co dostajesz",
    getRewards: "Nagrody wymagają 80% dostępności przez cały okres — celowo łagodniej niż w mainnecie Avalanche, bo sprzęt społeczności to nie sprzęt centrum danych.",
    getEnd: "Twój okres się kończy i nic nie odnawia się samo. Stawka wraca po wygaśnięciu; własny czas zakończenia odczytaj z łańcucha, zamiast liczyć go na kartce.",
    getPrivacy: "Nic nie zmusza cię do wystawiania RPC, a wolelibyśmy, żebyś w ogóle nie otwierał portu 9650. Twój węzeł jest twój.",
    honestTitle: "Czego to nie zwraca",
    honest1: "LOVE9 to token testowy. Nie jest nic wart ani tutaj, ani nigdzie indziej, nikt go nie kupuje i nie ma obietnicy, że kiedyś zamieni się w cokolwiek.",
    honest2: "A1 to sieć testowa i była już dwukrotnie odbudowywana od bloku 0. Jeśli zdarzy się to znowu, twoja stawka, nagrody i tożsamość węzła odejdą razem z nią. Obiecujemy uprzedzić i jasno powiedzieć, co ginie — to cała obietnica.",
    honest3: "Za domowym routerem węzeł startuje i waliduje na połączeniach, które sam otwiera, i wygląda całkiem zdrowo, choć z zewnątrz nikt nie może go dosięgnąć. Właśnie tak pierwszy zewnętrzny walidator zakończył okres z 14% dostępności i nie zarobił nic. Przekieruj port 9651 i jako adres publiczny ustaw ten, na którym to przekierowanie odpowiada.",
    stepsTitle: "Droga w sześciu krokach",
    step1: "Weź źródła i przebuduj fork, potem sam sprawdź hash drzewa — i sprawdź, że celowo błędne wejście się nie powiedzie, żeby pierwsze sprawdzenie coś znaczyło.",
    step2: "Zbuduj obraz węzła, wbijając w niego commit, z którego budowałeś.",
    step3: "Pobierz genesis i adres bootstrap, a hash genesis sprawdź, zanim cokolwiek uruchomisz.",
    step4: "Uruchom węzeł. Jego tożsamość to trzy pliki na dysku: gubiąc je, zostawiasz wkład węzłowi, który już nie istnieje.",
    step5: "Potwierdź, że jesteś we właściwym łańcuchu, odczytując z powrotem nazwę sieci i chain ID, a nie ufając kodowi 200.",
    step6: "Przenieś LOVE9 na P-Chain i postaw stawkę — a wynik sprawdź w łańcuchu, nie w wyjściu narzędzia.",
    guideCta: "Pełny przewodnik, każde polecenie",
    issuesCta: "Zgłoś problem",
    issuesNote: "Tracker zgłoszeń jest kanałem i jest publiczny celowo: problem walidatora niemal zawsze spotka też kogoś innego, a odpowiedź udzielona prywatnie pomaga jednej osobie. Napisz, co zmierzyłeś, a nie co z tego wywnioskowałeś.",
  },
  docs: {
    title: "Dokumentacja",
    desc: "Wszystko, co spisano o pracy na A1: jak uruchomić łańcuch, jak postawić walidatora i po co ten projekt istnieje. Każdy dokument prowadzi tam, gdzie naprawdę mieszka, więc czytasz tę kopię, którą się edytuje.",
    langNote: "Każdy dokument jest w języku podanym w jego wierszu, a samych dokumentów nie tłumaczymy. Przetłumaczona kopia jest poprawna tylko do chwili, gdy ktoś poprawi polecenie w oryginale — a błędna staje się ta kopia, której nikt nie edytuje.",
    langLabel: "Język",
    alsoIn: "Także w",
    pdfLabel: "PDF",
    onSiteLabel: "Na tej stronie",
    opensGithub: "Otwiera się na GitHubie",
  },
  nineYears: {
    title: "Dziewięć lat, dziewięć miliardów",
    lede: "2026-09-09 dwa zdania trafiają do pierwszego bloku 9Chain i zaczyna się odliczanie dziewięciu lat. Do 2035 roku ONZ spodziewa się na Ziemi blisko dziewięciu miliardów ludzi. Celem tych dziewięciu lat jest, by każdy z nich miał własny blockchain.",
    oneLine: "Moja SI musi poprosić o zgodę — i istnieje miejsce, które zapisuje, że poprosiła. To miejsce jest moje.",
    whatTitle: "Co się dzieje",
    what1: "Ponad miliard ludzi korzysta z SI co tydzień. Dziś SI odpowiada. Jutro działa: rezerwuje, płaci, negocjuje, podpisuje i reprezentuje cię wobec cudzej SI.",
    what2: "Rodzi to pytanie, na które ludzkość nigdy nie musiała odpowiadać: co wolno mojej SI i kto trzyma dowody? Dziś odpowiedź brzmi: firma, która sprzedała ci SI. To ona ma uprawnienia, ona ma logi i to ona jest sędzią, gdy coś pójdzie źle.",
    what3: "Polecenie „nie wydawaj więcej niż dwadzieścia dolarów” nie jest limitem — SI można oszukać, przekonać, wstrzyknąć jej instrukcję. Prawdziwy limit żyje poza SI, w miejscu, którego nie może zmienić, i należy do ciebie.",
    promisesTitle: "Pięć obietnic",
    promise1: "Suwerenność — nikt, nawet 9Chain, nie może zmienić, usunąć ani zablokować twojej księgi. Jej reguły to te, które ustawisz.",
    promise2: "Trwałość — utrata telefonu to nie utrata księgi. Przetrwa każde urządzenie i każdą firmę.",
    promise3: "Weryfikowalność — nie przepiszesz po cichu przeszłości, a każdy może to sprawdzić. Twoje dowody nie są u drugiej strony.",
    promise4: "Przenośność — zmień hosta, dostawcę albo kraj: imię i historia idą z tobą.",
    promise5: "Interoperacyjność — twoja księga rozmawia z księgami innych, ze sklepami, ze wspólnotami.",
    promiseNot: "Jednej rzeczy nie obiecujemy: że twój łańcuch będzie działał wiecznie. Nie musi. Twoja księga śpi, kiedy ty śpisz, a kto musi ją przeczytać, czyta zakotwiczoną kopię.",
    constitutionTitle: "Konstytucja, nie polecenie",
    constitutionDesc: "Twoja księga nosi działającą umowę: która SI może podpisywać w twoim imieniu, co jej wolno, do jakiej kwoty, do kiedy i kiedy musi się zatrzymać i zapytać ponownie. Odwoływalna jednym dotknięciem, bez niczyjej zgody. Każde działanie zostawia podpisane, ostemplowane czasem pokwitowanie.",
    constitutionStd: "Umowa, a nie instrukcja, bo umowa jest jedyną rzeczą, której SI nie obgada. Mówi standardami, ku którym świat i tak zmierza, więc SI dowolnej firmy potrafi ją odczytać — nie wymyśliliśmy do tego własnego języka.",
    treeTitle: "Drzewo, nie wieża",
    treeDesc: "Dziewięć miliardów ksiąg nie zmieści się w jednej sieci. Każdy poziom rejestruje i kotwiczy ten poniżej oraz weryfikuje dowody, zamiast je powtarzać — dlatego drzewo rośnie przez dokładanie gałęzi, a nie pogrubianie korzenia.",
    treeRoot: "Korzeń — mały, trwały, celowo nudny. Trzyma nazwy i kotwice. 9Chain jest jednym z wielu korzeni.",
    treeTrunk: "Pień — region, kraj, sojusz wspólnot.",
    treeBranch: "Gałąź — klub, szkoła, firma, dzielnica; prowadzi ją sama ta wspólnota.",
    treeLeaf: "Liść — twój. Dziewięć miliardów liści.",
    stagesTitle: "Dziewięć lat, dziewięć etapów",
    stage2027: "Pierwszych stu prawdziwych ludzi w jednej prawdziwej wspólnocie, z SI działającą pod konstytucją.",
    stage2028: "Dziesięć wspólnot na trzech kontynentach prowadzi własne łańcuchy. Księgi przeżywają zgubione telefony.",
    stage2029: "Otwarty standard i trzy wdrożenia, które nie są nasze.",
    stage2030: "Pierwsza sieć działająca na tym standardzie, której 9Chain nie prowadzi. Milion ksiąg.",
    stage2031: "Działająca SI staje się normą — a SI bez korzenia uprawnień zaczyna być odrzucana.",
    stage2032: "Wiele korzeni, jeden standard. Zarządzanie standardem opuszcza 9Chain.",
    stage2033: "Księgi podróżują w portfelach tożsamości, telefonach, komunikatorach i platformach SI.",
    stage2034: "Telefony wychodzą z fabryki z księgą. Miliard w realnym użyciu.",
    stage2035: "Jeden łańcuch na osobę. Dziewięć lat od pierwszego bloku.",
    stagesNote: "Cztery lata na budowę i dowody; w piątym świat czyni to koniecznością; przez cztery ostatnie inni niosą to dalej, niż my byśmy zdołali. Ta ostatnia część to plan, nie ryzyko.",
    commitTitle: "Czego zobowiązujemy się nie robić",
    commit1: "Nie przechowujemy twoich danych. Księga trzyma dowody, nie twoje życie prywatne.",
    commit2: "Nie prosimy o dokumenty. Tożsamość to sprawa między tobą a twoją wspólnotą.",
    commit3: "Nie usuwamy. Nazwy, księgi i historia są trwałe; śpią, nie umierają.",
    commit4: "Nie każemy kupować tokena, żeby mieć księgę. Standard jest otwarty; LOVE9 to paliwo tej sieci, nie bilet przy wejściu.",
    commit5: "Nie budujemy własnej SI. Zostajemy neutralni, żeby każda SI mogła służyć ci na tej samej księdze.",
    joinTitle: "Dziewięć lat zaczyna się od pierwszych ludzi",
    joinDesc: "Dziś to działająca sieć testowa z pierwszymi walidatorami z zewnątrz i pierwszymi łańcuchami wspólnot. Wszystko poniżej jest otwarte, teraz, dla każdego.",
    fullDoc: "Pełny dokument",
  },






  loadTest: {
    badge: 'Test obciążeniowy',
    banner: 'Prowadzimy publiczny test obciążeniowy — {tps} transakcji na sekundę, generowanych przez nas, a nie przez prawdziwych użytkowników.',
    bannerLink: 'Zobacz dane na żywo',
    title: 'Publiczny test obciążeniowy',
    intro: 'A1 to młoda sieć testowa z bardzo niewielką liczbą prawdziwych użytkowników, więc pozostawiona sama sobie niemal nie tworzy bloków. Generujemy stały strumień transakcji, aby sieć nieprzerwanie pracowała i abyś mógł zobaczyć ją w działaniu. Ten ruch jest nasz. To nie jest użycie i nie liczymy go jako użycie — każdy adres, który go wysyła, jest wymieniony poniżej, żebyś mógł go odjąć.',
    running: 'Działa teraz',
    stopped: 'Obecnie nie działa',
    stoppedWhy: 'Zapisany powód: {reason}',
    labelTps: 'Transakcji na sekundę',
    labelBlockHeight: 'Blok C-Chain',
    labelSecondsPerBlock: 'Sekund na blok',
    labelTotal: 'Potwierdzone transakcje od startu',
    labelUptime: 'Działa od',
    committedNote: 'Te liczby są liczone z samych bloków, a nie z tego, co próbowaliśmy wysłać. Transakcja przyjęta przez sieć, ale nigdy niewłączona do bloku, nie jest tu liczona.',
    addressesTitle: 'Dziewięć adresów nadawczych',
    addressesNote: 'Każda transakcja z tych adresów jest generowana maszynowo przez nas. Odfiltruj je, aby zobaczyć rzeczywistą aktywność.',
    measuring: 'Odczyt stanu testu obciążeniowego…',
    notMeasured: 'Nie udało się odczytać stanu testu obciążeniowego',
    notMeasuredMore: 'Strona nadal działa — to tylko wskaźnik stanu.',
  },

  launch: {
    title: 'Uruchom swój łańcuch',
    desc:
      'Dedykowana sieć L1, należąca do twojego portfela. Podpisujesz raz, żeby udowodnić, kim jesteś, ' +
      'sprawdzasz dane, a sieć buduje łańcuch w około pięć minut.',

    connectWallet: 'Połącz portfel',
    connecting: 'Łączenie…',
    signIn: 'Zaloguj się',
    signing: 'Czekam na podpis…',
    yourWallet: 'Twój portfel',
    youWillOwn: 'Łańcuch będzie należał do tego portfela. Adres pochodzi z twojego podpisu — nikt go nie wpisuje.',
    noWallet: 'Nie znaleziono portfela w tej przeglądarce. Zainstaluj MetaMask i odśwież stronę.',
    signRejected: 'Odmówiłeś podpisu. Nic nie zostało utworzone.',
    switchWallet: 'Użyj innego portfela',

    nameLabel: 'Nazwa łańcucha',
    namePlaceholder: 'Na przykład: MyChain',
    nameHelp:
      'Litery, cyfry i spacje. 2–32 znaki. W tej sieci nazwa raz użyta nigdy nie jest wydawana ' +
      'ponownie — nawet dla cofniętego łańcucha.',
    nameInvalid: 'Nazwa może zawierać wyłącznie litery, cyfry i spacje, o długości 2–32 znaków.',
    typeLabel: 'Typ łańcucha',
    typeHelp: 'Po wybraniu jest już stały — genesis łańcucha nie da się edytować.',
    slotsLeft: 'Pozostało miejsc: {left}/{total}',
    slotsFull: 'Brak wolnych miejsc',
    slotsFullDesc:
      'W obecnym modelu każdy walidator śledzi każdą sieć L1, a protokół odrzuca węzeł deklarujący ' +
      'więcej niż 16 podsieci. To twardy limit, którego nie da się podnieść. Cofnięcie łańcucha ' +
      'zwraca jedno miejsce.',
    reviewCta: 'Sprawdź przed wysłaniem',

    reviewTitle: 'Sprawdzenie — to są drzwi w jedną stronę',
    reviewDesc:
      'Genesis uruchomionej sieci L1 jest NIEZMIENNY. Po tym kroku nazwy, typu łańcucha ani właściciela ' +
      'nie da się zmienić — a cofnięcie również nie zwróci nazwy ani chain ID.',
    reviewRebuild:
      'Jeszcze jedno, zanim naciśniesz: A1 odbudowuje całą sieć {date}. Łańcuch, który uruchomisz ' +
      'dzisiaj, zostanie skasowany razem ze starą siecią — nie ukryty, lecz usunięty.',
    reviewName: 'Nazwa łańcucha',
    reviewType: 'Typ łańcucha',
    reviewOwner: 'Właściciel',
    reviewBack: 'Wróć i popraw',
    reviewConfirm: 'Sprawdziłem — uruchom łańcuch',

    launching: 'Uruchamianie łańcucha „{name}"',
    launchingDesc:
      'Węzły restartują się PO KOLEI, żeby sieć nigdy nie straciła kworum — dlatego jest wolno, i jest ' +
      'to zamierzone. Nie zamykaj karty; jeśli ją zamkniesz, łańcuch i tak zostanie zbudowany.',
    etaRemaining: 'Pozostało około {minutes} minut',
    preparing: 'Przygotowywanie…',

    doneTitle: 'Gotowe — łańcuch „{name}" działa',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Dodaj łańcuch do portfela',
    doneAdded: 'Dodano do portfela',
    doneActivate: 'Aktywuj łańcuch (otwórz blok 1)',
    doneActivated: 'Aktywowany',
    doneActivating: 'Czekam na portfel…',
    doneAddWalletError: 'Nie udało się dodać łańcucha do portfela. {detail}',
    doneActivateError: 'Nie udało się aktywować łańcucha. {detail}',

    launchAnother: 'Uruchom kolejny łańcuch',
    launchError: 'Nie udało się uruchomić łańcucha. {detail}',
    unknownError: 'Po zakończeniu operacji łańcuch nie pojawił się w katalogu.',
    noteTitle: 'Pierwsza transakcja na nowym łańcuchu',
    noteHow:
      'Nie ufaj szacunkowi gazu przy pierwszej transakcji. Najtańszy sposób otwarcia bloku 1 to zwykły ' +
      'przelew — naciśnij poniżej „Aktywuj łańcuch".',
  },

  myChains: {
    title: 'Moje łańcuchy',
    desc: 'Sieci L1 należące do portfela, którym się zalogowałeś. Można je cofnąć, ale najpierw przeczytaj ostrzeżenie.',
    connectWallet: 'Połącz portfel, żeby zobaczyć swoje łańcuchy',
    emptyTitle: 'Ten portfel nie ma jeszcze żadnego łańcucha',
    emptyDesc: 'Uruchom jeden i wróć — pojawi się tutaj natychmiast.',
    emptyCta: 'Uruchom swój łańcuch',

    colChain: 'Łańcuch',
    colType: 'Typ',
    colStatus: 'Stan',
    colActions: '',

    validatorCount: 'Walidatorów: {count}',
    measuring: 'pomiar',
    cannotMeasure: 'nie udało się zmierzyć',
    statusHelp: 'Mierzone liczbą walidatorów podsieci, a nie wysokością bloku.',
    noValidators: '0 walidatorów',
    noValidatorsDesc:
      'Ten łańcuch NIE może sfinalizować żadnej transakcji: podsieć nie ma walidatorów. Nadal ' +
      'odpowiada na wywołania RPC, a portfele nadal się łączą, więc nie ma żadnego innego widocznego ' +
      'znaku.',

    walletSettings: 'Ustawienia portfela',
    addToWallet: 'Dodaj do portfela',
    addedToWallet: 'Dodano',
    addWalletError: 'Nie udało się dodać do portfela. {detail}',

    revoke: 'Cofnij',
    revokeTitle: 'Cofnąć „{name}"?',
    revokeWarn1: 'Łańcuch natychmiast przestaje obsługiwać RPC i znika z publicznego katalogu.',
    revokeWarn2:
      'Cofnięcie NIE usuwa podsieci na P-Chain — tego, co tam powstało, nie da się usunąć, dopóki ta ' +
      'sieć działa. Nie usuwa też sieci z portfeli osób, które już dodały ten łańcuch.',
    revokeWarn3:
      'Nazwa i Chain ID pozostają zarezerwowane i NIGDY nie są wydawane nikomu ponownie w tej sieci. ' +
      'Ponowne wydanie Chain ID pozwoliłoby portfelowi byłego użytkownika po cichu wskazywać cudzy ' +
      'łańcuch.',
    revokeWarn4: 'W zamian jedno z 15 miejsc wraca do puli.',
    revokeTypeLabel: 'Wpisz dokładnie nazwę łańcucha, aby potwierdzić',
    revokeNameMismatch: 'To nie zgadza się z nazwą łańcucha.',
    revokeConfirm: 'Cofnij trwale',
    revokeCancel: 'Anuluj',
    revoking: 'Cofanie „{name}" — około pięciu minut',
    revokeDone: 'Cofnięto „{name}". Pozostało miejsc: {left}/{total}.',
    revokeError: 'Nie udało się cofnąć. {detail}',
    revokeUnknown: 'Po zakończeniu operacji łańcuch nadal jest w katalogu.',

    revokedBadge: 'Cofnięty',
    revokedDesc: 'Nazwa i Chain ID pozostają zarezerwowane w tej sieci.',
  },

  compare: {
    title: 'A1 ↔ C1 — porównanie',
    desc:
      '9Chain prowadzi obok siebie DWIE sieci testowe tego samego produktu, różniące się silnikiem: ' +
      'A1 na silniku Avalanche, C1 na silniku Cosmos. Ta tabela zapisuje kompromisy między dwoma ' +
      'kierunkami i jest opublikowana, żeby każdy mógł z nią polemizować — strona C1 nie ma jeszcze ' +
      'pomiarów na żywo.',

    selfScoreTitle: 'Poniższe oceny są SAMOOCENĄ zespołu, nie zostały zmierzone niezależnie',
    selfScoreDesc:
      'Kolumna „jak zmierzono" mówi, w jaki sposób sprawdzono każde kryterium. Każde kryterium bez ' +
      'datowanego pomiaru jest oceną architektoniczną, a nie danymi. Wagi ustalasz sam — wynik z nich ' +
      'wynika.',

    colNo: '#',
    colCriterion: 'Kryterium',
    colKind: 'Typ',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Waga',
    kindArchitecture: 'architektura',
    kindLiveData: 'dane na żywo',

    totalScore: 'Wynik łączny przy twoich wagach',
    tied: 'Remis',
    leads: 'prowadzi',

    liveDataTitle: 'Dane na żywo',
    a1Validators: 'A1 — połączone walidatory',
    a1Chains: 'A1 — działające L1',
    a1Blocks: 'A1 — blok C-Chain',
    c1Unreachable: 'C1 — nieosiągalna',
    c1UnreachableDesc:
      'Potrzebny jest adres REST Cosmos sieci C1 (port 1317). Tabela nadal działa: strona A1 to dane ' +
      'na żywo, strona C1 to ocena architektoniczna, tak jak pozostałe kryteria.',
    measuring: 'pomiar…',
    cannotMeasure: 'nie udało się zmierzyć',
    critDecentralisation: 'Decentralizacja (górny pułap liczby walidatorów)',
    noteDecentralisation: 'Pułap PROTOKOŁU: Snowman ~tysiące węzłów wobec CometBFT ~150. A1 DZIŚ: 9 węzłów, jedna maszyna, jeden dostawca',
    critFinality: 'Finalność',
    noteFinality: '~1–2s wobec ~5–6s',
    critEvmMaturity: 'Dojrzałość EVM',
    noteEvmMaturity: 'coreth na produkcji wobec Cosmos EVM przed v1',
    critWalletCompat: 'Zgodność z portfelami detalicznymi i DeFi',
    noteWalletCompat: 'pełne MetaMask/EVM',
    critLaunchUx: 'Doświadczenie uruchamiania łańcucha',
    noteLaunchUx: 'oba mają konsolę; w A1 zmierzono ~170s na uruchomienie',
    critInterop: 'Szerokość interoperacyjności',
    noteInterop: 'Warp/ICM wewnątrz ekosystemu (A1 przeniósł już aktywa, M6.2) wobec zasięgu IBC',
    critOpCost: 'Koszt utrzymania jednego łańcucha',
    noteOpCost: 'węzeł + wtyczka wobec operatora K8s',
    critBootstrap: 'Rozruch efektu sieciowego',
    noteBootstrap: 'własna wyspa wobec IBC wpiętego w gospodarkę Cosmos',
    critEconSecurity: 'Publiczne bezpieczeństwo ekonomiczne',
    noteEconSecurity: 'PoS zabezpieczony tokenem od początku',
    critSwitchCost: 'Koszt zmiany dla zespołu',
    noteSwitchCost: 'A1 jest nowy wobec C1 działającego od miesięcy',
  },

  faucet: {
    title: 'Weź tokeny testowe',
    desc:
      'LOVE9 w sieci testowej A1 nie ma realnej wartości — istnieje po to, żebyś mógł płacić za gaz ' +
      'podczas testów. Podaj adres portfela, a od razu coś wyślemy.',
    addressLabel: 'Twój adres portfela',
    addressFromWallet: 'Wypełnione z podłączonego portfela. Zmień, jeśli tokeny mają trafić na inny adres.',
    useWalletAddress: 'Użyj adresu mojego portfela',
    addressPlaceholder: '0x… (40 znaków szesnastkowych)',
    requestCta: 'Wyślij mi tokeny',
    sending: 'Wysyłanie…',
    addressHelp: 'Wklej adres portfela, który ma otrzymać tokeny. Jeśli jeszcze tego nie zrobiłeś, naciśnij powyżej „Dodaj sieć do portfela".',
    addNetwork: 'Dodaj sieć do portfela',
    addNetworkDone: 'Dodano do portfela',
    addNetworkRejected: 'Nacisnąłeś odrzuć w portfelu. Naciśnij ponownie, jeśli chcesz dodać sieć.',
    addNetworkError: 'Twój portfel nie zdołał dodać sieci. Dodaj ją ręcznie, korzystając z ustawień obok — i wyślij zespołowi poniższą linijkę:',
    noWallet: 'Nie znaleziono portfela w tej przeglądarce. Zainstaluj MetaMask i odśwież stronę.',
    quotaLabel: 'Pozostały limit',
    quotaFormat: '{left}/{total} żądań na {hours} godzin',
    quotaExhausted: 'Wykorzystałeś cały swój limit. Spróbuj ponownie za {minutes} minut.',
    quotaUnreadable: 'Nie udało się odczytać twojego limitu — nadal możesz poprosić, po prostu nie będziesz wiedzieć, ile zostało.',
    sentOk: 'Wysłano {count} {symbol} na adres {address}',
    viewTransaction: 'Zobacz transakcję',
    settingsTitle: 'Ustawienia sieci',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Symbol',
    settingsDecimals: 'Miejsca dziesiętne',
    settingsExplorer: 'Eksplorator',
    decimalsHelp:
      'Portfele pokazują 18 miejsc po przecinku, bo C-Chain uruchamia EVM. Na P/X-Chain LOVE9 liczy ' +
      'się w 9 miejscach. Jedna moneta, dwie skale — nie dwa różne tokeny.',
    genericError: 'Nie udało się wysłać. {detail}',
  },

  langPicker: {
    label: 'Język',
    machineBadge: 'maszynowo',
    machineNote: 'Tylko wersja wietnamska została przejrzana przez człowieka. Pozostałe tłumaczenia są maszynowe i mogą być błędne — źródłem prawdy jest wersja angielska.',
    notAvailable: 'jeszcze niedostępne',
  },

  errors: {
    unreachable: 'Nie udało się połączyć z siecią',
    unreachableDesc: 'Sieć może być zajęta albo twoje połączenie zostało przerwane.',
    empty: 'Jeszcze nic tu nie ma',
    addressEmpty: '{label} nie może być puste',
    addressFormat: '{label} musi być 0x, a po nim 40 znaków szesnastkowych',
    addressChecksum: '{label} nie przechodzi swojej sumy kontrolnej EIP-55 — najprawdopodobniej jeden znak został błędnie wpisany albo zgubiony przy wklejaniu',
    addressZero: '{label} nie może być adresem zerowym — nikt nie ma do niego klucza',
    timeout: 'Brak odpowiedzi po {seconds}s',
    notJson: 'Odpowiedź nie była JSON-em (HTTP {status}) — żądanie najprawdopodobniej trafiło w złe miejsce',
    noWallet: 'W tej przeglądarce nie znaleziono portfela.',
  },

  notFound: {
    code: '404',
    title: 'Ta strona nie istnieje',
    desc:
      'Adres, który otworzyłeś, nie istnieje w 9Chain Testnet A1. ' +
      'Mógł zostać zmieniony albo przy kopiowaniu z adresu URL wypadło kilka znaków.',
    topPagesTitle: 'Trzy najczęściej używane strony:',
    navLabel: 'Dokąd dalej',
    goHome: 'Wróć na stronę główną',
    goFaucet: 'Weź tokeny testowe',
    goLaunch: 'Uruchom swój łańcuch',
    lookingForTx: 'Szukasz transakcji albo adresu? Sprawdź skrót i spróbuj ponownie.',
  },
};

export default pl;
