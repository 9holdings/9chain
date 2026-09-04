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
  },

  home: {
    testnetBadge: 'Sieć testowa — tokeny nie mają realnej wartości',
    primaryCta: 'Uruchom swój łańcuch',
    secondaryCta: 'Najpierw weź tokeny testowe',

    title: 'Uruchom własny łańcuch na A1',
    subtitle: 'Własna sieć L1, należąca do portfela, którym podpisujesz, działająca naprawdę w sieci testowej. Zajmuje około trzech minut.',
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
      'sprawdzasz dane, a sieć buduje łańcuch w około trzy minuty.',

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
    revoking: 'Cofanie „{name}" — około trzech minut',
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
