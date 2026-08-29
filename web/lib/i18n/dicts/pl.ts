import type { Tu } from '../en';

/**
 * Polski — tłumaczenie maszynowe, nieprzejrzane przez człowieka.
 * Językiem źródłowym jest angielski (`../en.ts`); w razie rozbieżności obowiązuje wersja angielska.
 *
 * 🔴 Tych trzech miejsc nie wolno łagodzić: `reGenesis.*` (sieć zostanie skasowana),
 * `deChain.soatMoTa` (drzwi w jedną stronę), `chainCuaToi.thuHoiY*` (cofnięcie nie zwraca nazwy).
 * Mówią „trwale" i „nie da się zmienić", żeby nikt nie stracił majątku, sądząc, że da się cofnąć.
 */
export const pl: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'Publiczna sieć testowa 9Chain — niezależna sieć działająca na silniku Avalanche',
    tagTitle: 'niezależna sieć na silniku Avalanche',
    viTuChoi: 'Odrzuciłeś żądanie w swoim portfelu. Nic się nie zmieniło.',
    dangTai: 'Wczytywanie…',
    thuLai: 'Spróbuj ponownie',
    saoChep: 'Kopiuj',
    daChep: 'Skopiowano',
    dong: 'Zamknij',
    moMenu: 'Otwórz menu',
    dongMenu: 'Zamknij menu',
    chuyenSangToi: 'Przełącz na tryb ciemny',
    chuyenSangSang: 'Przełącz na tryb jasny',
    boQuaToiNoiDung: 'Przejdź do treści głównej',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',

    bang: 'A1 została odbudowana {ngay}. Każde saldo i każdy łańcuch utworzone przed tą datą już nie istnieją.',
    bangNut: 'Co to oznacza',
    nhan: 'Odbudowana',

    tieuDe: 'A1 została odbudowana {ngay}',
    moTa:
      'Sieć testowa A1 została odbudowana od bloku 0. Łańcuchy, salda i historia transakcji ' +
      'utworzone przed tą datą już nie istnieją — nie są ukryte, po prostu ich nie ma. ' +
      'Ta strona wyjaśnia, co widzisz i co masz zrobić.',

    thayGiTieuDe: 'Co zobaczysz',
    thayGi1:
      'Twój portfel nadal się łączy, nadal pokazuje właściwą nazwę sieci i ten sam Chain ID ' +
      '{chainId} — było to zamierzone. Ale twoje saldo wyniesie 0.',
    thayGi2:
      'Każda uruchomiona przez ciebie sieć L1 zniknęła z katalogu. Ich nazwy i Chain ID są znów ' +
      'wolne i każdy może je zająć.',
    thayGi3:
      'Jeśli podpisałeś transakcję, ale nigdy jej nie rozgłosiłeś, nie rób tego teraz — ' +
      'należy ona do sieci, która już nie istnieje.',

    lamGiTieuDe: 'Co musisz zrobić',
    lamGi1: 'Poproś ponownie o tokeny testowe w kranie. Limity zostały wyzerowane dla wszystkich.',
    lamGi2:
      'Usuń z portfela każdą pojedynczą sieć L1 — mają własne Chain ID i teraz nie wskazują na nic. ' +
      'Głównej sieci A1 NIE trzeba usuwać; jej ustawienia się nie zmieniły.',
    lamGi3: 'Uruchom swój łańcuch ponownie, jeśli go potrzebujesz. Starą nazwę mógł zająć ktoś inny.',

    luuTieuDe: 'Archiwum starej sieci',
    luuMoTa:
      'Stan sieci sprzed odbudowy został wyeksportowany, a jego skrót opublikowany, ' +
      'żeby każdy, kto chce, mógł go sprawdzić.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'A1 zostanie odbudowana {ngay} — każdy łańcuch, saldo i transakcja utworzone wcześniej zostaną skasowane.',
    bangNut: 'Szczegóły',
    nhan: 'Nadchodzi odbudowa',

    tieuDe: 'A1 zostanie odbudowana {ngay}',
    moTa:
      'Cała sieć testowa A1 zostanie odbudowana od bloku 0. Wszystko, co powstało przed tą datą, ' +
      'zniknie — nie zostanie ukryte, lecz przestanie istnieć. Ta strona mówi dokładnie, co zostanie ' +
      'utracone i co masz zrobić.',

    viSaoTieuDe: 'Dlaczego odbudowa jest konieczna',
    viSao1:
      'Genesis sieci jest niezmienny. Właśnie to czyni ją godną zaufania — nikt, łącznie z jej ' +
      'twórcami, nie może zmienić liczby, gdy raz zostanie zapisana w bloku 0.',
    viSao2:
      'Cena jest taka: zmiana liczby wewnątrz genesis nie zostawia innej możliwości niż odbudowa ' +
      'sieci od zera. A1 podniosła całkowitą podaż do 9 000 000 000 LOVE9 i cały zakres parametrów ' +
      'stakingu trzeba było przeliczyć na nowo, żeby do tego pasował.',
    viSao3:
      'To jest sieć testowa, a odbudowa to coś, na co sieć testowa może sobie pozwolić. Właściwie ' +
      'po to sieci testowe istnieją: żeby takie zmiany działy się tutaj, a nie na sieci głównej.',

    matTieuDe: 'Co zostanie utracone',
    matMoTa: 'Wszystko, bez wyjątku:',
    mat1: 'Każda sieć L1 uruchomiona przez użytkownika, także te działające bez zarzutu.',
    mat2: 'Każde saldo LOVE9, łącznie z tokenami otrzymanymi z kranu.',
    mat3: 'Każda transakcja, każdy blok, cała historia C-Chain, P-Chain i X-Chain.',
    mat4: 'Każdy walidator i każda delegacja.',

    conTieuDe: 'Co zostanie zachowane',
    conMoTa:
      'Przed skasowaniem cała umierająca sieć zostanie wyeksportowana wraz z opublikowanym skrótem, ' +
      'żeby zapis pozostał weryfikowalny. To, co się wydarzyło, nadal będzie można sprawdzić, nawet ' +
      'gdy sieci, która to wykonywała, już nie będzie. Link do archiwum pojawi się tutaj w dniu odbudowy.',

    lamTieuDe: 'Co musisz zrobić',
    lamTruoc: 'Przed odbudową:',
    lam1:
      'Nie buduj teraz na A1 niczego, co zależy od przetrwania danych. Jeśli sprawdzasz jakiś pomysł ' +
      '— proszę bardzo, tylko nie traktuj obecnego łańcucha jako miejsca przechowywania.',
    lamSau: 'Po odbudowie:',
    lam2:
      'Usuń z portfela każdą dodaną wcześniej sieć L1 — te łańcuchy już nie istnieją, a portfel na nie ' +
      'wskazujący będzie po prostu stał. Głównej sieci A1 nie trzeba usuwać: jej ustawienia się nie zmieniły.',
    lam3:
      'Jeśli twój portfel nie ma jeszcze sieci A1, dodaj ją przyciskiem na stronie kranu, ' +
      'zamiast wpisywać ustawienia ręcznie.',
    lam4: 'Poproś ponownie o tokeny w kranie i uruchom swój łańcuch jeszcze raz, jeśli go chcesz.',

    imLangTieuDe: 'Twój portfel cię nie ostrzeże',
    imLangMoTa:
      'Nowa sieć zachowuje Chain ID {chainId}, ten sam adres RPC i tę samą nazwę co stara. To zamierzone ' +
      '— żeby każdy już opublikowany dokument i poradnik pozostał poprawny. Ceną jest to, że twój ' +
      'portfel nie ma żadnego sygnału, iż właśnie połączył się z inną siecią. Dlatego dwie poniższe ' +
      'rzeczy wydarzą się bezgłośnie.',
    imLang1:
      'Portfel ze starą konfiguracją nadal się połączy, nadal pokaże właściwą nazwę sieci i zgłosi ' +
      'saldo 0. Ta liczba jest PRAWIDŁOWA: twoje stare tokeny już nie istnieją, nie są ukryte. Nie ' +
      'musisz dodawać sieci ponownie — po prostu poproś o nowe tokeny w kranie. Jeśli portfel zgłasza ' +
      'zablokowaną transakcję albo błędny numer kolejny, wyczyść w nim dane aktywności tej sieci: ' +
      'pamięta jeszcze licznik transakcji martwego łańcucha, podczas gdy nowy łańcuch liczy od 0.',
    imLang2:
      'Jeśli nadal masz podpisaną, lecz nigdy nierozgłoszoną transakcję, wyrzuć ją. Podpis jest nadal ' +
      'ważny w nowej sieci, bo Chain ID się nie zmienił. Transakcja nie przejdzie, dopóki portfel jest ' +
      'pusty — ale w chwili, gdy poprosisz o tokeny w kranie, stanie się wykonalna i może przejść ' +
      'w momencie, którego się nie spodziewasz.',

    lapTieuDe: 'Czy to się powtórzy',
    lapMoTa:
      'Możliwe. A1 wciąż jest siecią testową i dopóki społeczność nie wybierze kierunku sieci głównej ' +
      'pomiędzy A1 a C1, zachowujemy prawo do odbudowy sieci, gdy coś wewnątrz genesis musi się zmienić. ' +
      'Zobowiązujemy się natomiast uprzedzić cię wcześniej i powiedzieć wprost, co zostanie utracone.',

    daXayRaTieuDe: 'Już raz odbudowana 2026-08-27',
    daXayRaMoTa:
      'A1 została już raz odbudowana 2026-08-27, przed datą podaną poniżej. Jeśli miałeś wcześniej tokeny testowe, twoje saldo wynosi teraz 0 — to jest prawidłowe, a nie usterka portfela. Żaden łańcuch użytkownika nie przepadł: w katalogu były wyłącznie automatyczne łańcuchy testowe. Poproś ponownie o tokeny w kranie.',
    ngayLuuY: 'Data może się przesunąć',
    ngayLuuYMoTa:
      'Data {ngay} zależy od wcześniejszej kontroli go/no-go. Jeśli się przesunie, zmienimy datę na ' +
      'tej stronie, zamiast milczeć.',
  },

  chanTrang: {
    dungThu: 'Wypróbuj',
    kham: 'Przeglądaj',
    veDuAn: 'O projekcie',
    explorer: 'Eksplorator 9Scan-A1',
    trangChinh: 'Główna strona 9Chain',
    moTabMoi: '(otwiera się w nowej karcie)',
    nhanNav: 'Odnośniki w stopce',
    reGenesis: 'Plan odbudowy sieci',
  },

  dieuHuong: {
    trangChu: 'Strona główna',
    faucet: 'Weź tokeny testowe',
    console: 'Uruchom łańcuch',
    chainCuaToi: 'Moje łańcuchy',
    bang: 'A1 ↔ C1',
    danhBa: 'Katalog L1',
    explorer: 'Eksplorator',
    banGiao: 'Otwórz 9Scan-A1 w nowej karcie',
  },

  trangChu: {
    nhanTestnet: 'Sieć testowa — tokeny nie mają realnej wartości',
    nutChinh: 'Uruchom swój łańcuch',
    nutPhu: 'Najpierw weź tokeny testowe',

    cTieuDe: 'Uruchom własny łańcuch na A1',
    cPhu: 'Własna sieć L1, należąca do portfela, którym podpisujesz, działająca naprawdę w sieci testowej. Zajmuje około trzech minut.',
    cBangChuThich: 'Każdy wiersz to prawdziwy łańcuch działający na A1, z własnym właścicielem.',
    cCot: 'Łańcuch',
    cCotKieu: 'Typ',
    cCotChu: 'Właściciel',
    cMacDinh: 'domyślne systemu',
    cTrong: 'Żadna sieć L1 jeszcze nie działa',
    cTrongMoTa: 'Byłbyś pierwszy. Katalog aktualizuje się, gdy tylko twój łańcuch wystartuje.',

    tuTo: 'Wszystkie 9 walidatorów działa obecnie na tym samym serwerze, u tego samego dostawcy — zdecentralizowane na poziomie protokołu, jeszcze nie na poziomie infrastruktury.',
    blockDungYen: 'Avalanche nie produkuje pustych bloków, więc wysokość bloku stojąca w miejscu, gdy nikt nie wykonuje transakcji, jest normalna. Miarą życia jest liczba walidatorów obok.',
  },

  soLieu: {
    tieuDe: 'Sieć działa',
    validator: 'Połączone walidatory',
    soL1: 'Działające L1',
    chieuCao: 'Blok C-Chain',
    dangDo: 'Pomiar sieci…',
    khongDo: 'Nie udało się odczytać statystyk sieci',
    khongDoMoTa: 'Strona nadal działa — to tylko wskaźnik stanu.',
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

  deChain: {
    tieuDe: 'Uruchom swój łańcuch',
    moTa:
      'Dedykowana sieć L1, należąca do twojego portfela. Podpisujesz raz, żeby udowodnić, kim jesteś, ' +
      'sprawdzasz dane, a sieć buduje łańcuch w około trzy minuty.',

    noiVi: 'Połącz portfel',
    dangNoi: 'Łączenie…',
    kyDeVao: 'Zaloguj się',
    dangKy: 'Czekam na podpis…',
    viCuaBan: 'Twój portfel',
    laChuChain: 'Łańcuch będzie należał do tego portfela. Adres pochodzi z twojego podpisu — nikt go nie wpisuje.',
    khongCoVi: 'Nie znaleziono portfela w tej przeglądarce. Zainstaluj MetaMask i odśwież stronę.',
    tuChoiKy: 'Odmówiłeś podpisu. Nic nie zostało utworzone.',
    doiVi: 'Użyj innego portfela',

    nhanTen: 'Nazwa łańcucha',
    goiYTen: 'Na przykład: MyChain',
    moTaTen:
      'Litery, cyfry i spacje. 2–32 znaki. W tej sieci nazwa raz użyta nigdy nie jest wydawana ' +
      'ponownie — nawet dla cofniętego łańcucha.',
    tenXau: 'Nazwa może zawierać wyłącznie litery, cyfry i spacje, o długości 2–32 znaków.',
    nhanKieu: 'Typ łańcucha',
    moTaKieu: 'Po wybraniu jest już stały — genesis łańcucha nie da się edytować.',
    conCho: 'Pozostało miejsc: {con}/{tong}',
    hetCho: 'Brak wolnych miejsc',
    hetChoMoTa:
      'W obecnym modelu każdy walidator śledzi każdą sieć L1, a protokół odrzuca węzeł deklarujący ' +
      'więcej niż 16 podsieci. To twardy limit, którego nie da się podnieść. Cofnięcie łańcucha ' +
      'zwraca jedno miejsce.',
    soatLai: 'Sprawdź przed wysłaniem',

    soatTieuDe: 'Sprawdzenie — to są drzwi w jedną stronę',
    soatMoTa:
      'Genesis uruchomionej sieci L1 jest NIEZMIENNY. Po tym kroku nazwy, typu łańcucha ani właściciela ' +
      'nie da się zmienić — a cofnięcie również nie zwróci nazwy ani chain ID.',
    soatReGenesis:
      'Jeszcze jedno, zanim naciśniesz: A1 odbudowuje całą sieć {ngay}. Łańcuch, który uruchomisz ' +
      'dzisiaj, zostanie skasowany razem ze starą siecią — nie ukryty, lecz usunięty.',
    soatTen: 'Nazwa łańcucha',
    soatKieu: 'Typ łańcucha',
    soatChu: 'Właściciel',
    soatQuayLai: 'Wróć i popraw',
    soatDongY: 'Sprawdziłem — uruchom łańcuch',

    dangDe: 'Uruchamianie łańcucha „{ten}"',
    dangDeMoTa:
      'Węzły restartują się PO KOLEI, żeby sieć nigdy nie straciła kworum — dlatego jest wolno, i jest ' +
      'to zamierzone. Nie zamykaj karty; jeśli ją zamkniesz, łańcuch i tak zostanie zbudowany.',
    conKhoang: 'Pozostało około {phut} minut',
    dangChuanBi: 'Przygotowywanie…',

    xongTieuDe: 'Gotowe — łańcuch „{ten}" działa',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Dodaj łańcuch do portfela',
    xongDaThem: 'Dodano do portfela',
    xongKichHoat: 'Aktywuj łańcuch (otwórz blok 1)',
    xongDaKichHoat: 'Aktywowany',
    xongDangKichHoat: 'Czekam na portfel…',
    xongThemViLoi: 'Nie udało się dodać łańcucha do portfela. {chiTiet}',
    xongKichHoatLoi: 'Nie udało się aktywować łańcucha. {chiTiet}',

    deTiep: 'Uruchom kolejny łańcuch',
    loiDe: 'Nie udało się uruchomić łańcucha. {chiTiet}',
    loiKhongRo: 'Po zakończeniu operacji łańcuch nie pojawił się w katalogu.',
    luuYTieuDe: 'Pierwsza transakcja na nowym łańcuchu',
    luuYCachLam:
      'Nie ufaj szacunkowi gazu przy pierwszej transakcji. Najtańszy sposób otwarcia bloku 1 to zwykły ' +
      'przelew — naciśnij poniżej „Aktywuj łańcuch".',
  },

  chainCuaToi: {
    tieuDe: 'Moje łańcuchy',
    moTa: 'Sieci L1 należące do portfela, którym się zalogowałeś. Można je cofnąć, ale najpierw przeczytaj ostrzeżenie.',
    noiVi: 'Połącz portfel, żeby zobaczyć swoje łańcuchy',
    trongTieuDe: 'Ten portfel nie ma jeszcze żadnego łańcucha',
    trongMoTa: 'Uruchom jeden i wróć — pojawi się tutaj natychmiast.',
    trongNut: 'Uruchom swój łańcuch',

    cotChain: 'Łańcuch',
    cotKieu: 'Typ',
    cotSong: 'Stan',
    cotViec: '',

    songDo: 'Walidatorów: {so}',
    songDangDo: 'pomiar',
    songKhongDo: 'nie udało się zmierzyć',
    songGiaiThich: 'Mierzone liczbą walidatorów podsieci, a nie wysokością bloku.',
    khongValidator: '0 walidatorów',
    khongValidatorMoTa:
      'Ten łańcuch NIE może sfinalizować żadnej transakcji: podsieć nie ma walidatorów. Nadal ' +
      'odpowiada na wywołania RPC, a portfele nadal się łączą, więc nie ma żadnego innego widocznego ' +
      'znaku.',

    thongSo: 'Ustawienia portfela',
    themVaoVi: 'Dodaj do portfela',
    daThemVaoVi: 'Dodano',
    themViLoi: 'Nie udało się dodać do portfela. {chiTiet}',

    thuHoi: 'Cofnij',
    thuHoiTieuDe: 'Cofnąć „{ten}"?',
    thuHoiY1: 'Łańcuch natychmiast przestaje obsługiwać RPC i znika z publicznego katalogu.',
    thuHoiY2:
      'Cofnięcie NIE usuwa podsieci na P-Chain — tego, co tam powstało, nie da się usunąć, dopóki ta ' +
      'sieć działa. Nie usuwa też sieci z portfeli osób, które już dodały ten łańcuch.',
    thuHoiY3:
      'Nazwa i Chain ID pozostają zarezerwowane i NIGDY nie są wydawane nikomu ponownie w tej sieci. ' +
      'Ponowne wydanie Chain ID pozwoliłoby portfelowi byłego użytkownika po cichu wskazywać cudzy ' +
      'łańcuch.',
    thuHoiY4: 'W zamian jedno z 15 miejsc wraca do puli.',
    thuHoiGoNhan: 'Wpisz dokładnie nazwę łańcucha, aby potwierdzić',
    thuHoiSaiTen: 'To nie zgadza się z nazwą łańcucha.',
    thuHoiXacNhan: 'Cofnij trwale',
    thuHoiHuy: 'Anuluj',
    thuHoiDangChay: 'Cofanie „{ten}" — około trzech minut',
    thuHoiXong: 'Cofnięto „{ten}". Pozostało miejsc: {con}/{tong}.',
    thuHoiLoi: 'Nie udało się cofnąć. {chiTiet}',
    thuHoiKhongRo: 'Po zakończeniu operacji łańcuch nadal jest w katalogu.',

    daThuHoi: 'Cofnięty',
    daThuHoiMoTa: 'Nazwa i Chain ID pozostają zarezerwowane w tej sieci.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — porównanie',
    moTa:
      '9Chain prowadzi obok siebie DWIE sieci testowe tego samego produktu, różniące się silnikiem: ' +
      'A1 na silniku Avalanche, C1 na silniku Cosmos. Ta tabela zapisuje kompromisy między dwoma ' +
      'kierunkami i jest opublikowana, żeby każdy mógł z nią polemizować — strona C1 nie ma jeszcze ' +
      'pomiarów na żywo.',

    tuChamTieuDe: 'Poniższe oceny są SAMOOCENĄ zespołu, nie zostały zmierzone niezależnie',
    tuChamMoTa:
      'Kolumna „jak zmierzono" mówi, w jaki sposób sprawdzono każde kryterium. Każde kryterium bez ' +
      'datowanego pomiaru jest oceną architektoniczną, a nie danymi. Wagi ustalasz sam — wynik z nich ' +
      'wynika.',

    cotSo: '#',
    cotTieuChi: 'Kryterium',
    cotLoai: 'Typ',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Waga',
    loaiKienTruc: 'architektura',
    loaiSong: 'dane na żywo',

    tongDiem: 'Wynik łączny przy twoich wagach',
    hoaNhau: 'Remis',
    dangDan: 'prowadzi',

    soLieuTieuDe: 'Dane na żywo',
    a1Validator: 'A1 — połączone walidatory',
    a1Chain: 'A1 — działające L1',
    a1Block: 'A1 — blok C-Chain',
    c1Vang: 'C1 — nieosiągalna',
    c1VangMoTa:
      'Potrzebny jest adres REST Cosmos sieci C1 (port 1317). Tabela nadal działa: strona A1 to dane ' +
      'na żywo, strona C1 to ocena architektoniczna, tak jak pozostałe kryteria.',
    dangDo: 'pomiar…',
    khongDo: 'nie udało się zmierzyć',
  },

  faucet: {
    tieuDe: 'Weź tokeny testowe',
    moTa:
      'LOVE9 w sieci testowej A1 nie ma realnej wartości — istnieje po to, żebyś mógł płacić za gaz ' +
      'podczas testów. Podaj adres portfela, a od razu coś wyślemy.',
    nhanDiaChi: 'Twój adres portfela',
    goiYDiaChi: '0x… (40 znaków szesnastkowych)',
    nutXin: 'Wyślij mi tokeny',
    dangGui: 'Wysyłanie…',
    danChoDiaChi: 'Wklej adres portfela, który ma otrzymać tokeny. Jeśli jeszcze tego nie zrobiłeś, naciśnij powyżej „Dodaj sieć do portfela".',
    themMang: 'Dodaj sieć do portfela',
    themMangXong: 'Dodano do portfela',
    themMangTuChoi: 'Nacisnąłeś odrzuć w portfelu. Naciśnij ponownie, jeśli chcesz dodać sieć.',
    themMangLoi: 'Twój portfel nie zdołał dodać sieci. Dodaj ją ręcznie, korzystając z ustawień obok — i wyślij zespołowi poniższą linijkę:',
    khongCoVi: 'Nie znaleziono portfela w tej przeglądarce. Zainstaluj MetaMask i odśwież stronę.',
    hanMucConLai: 'Pozostały limit',
    hanMucCachDoc: '{con}/{tong} żądań na {gio} godzin',
    hanMucHet: 'Wykorzystałeś cały swój limit. Spróbuj ponownie za {phut} minut.',
    hanMucKhongDoc: 'Nie udało się odczytać twojego limitu — nadal możesz poprosić, po prostu nie będziesz wiedzieć, ile zostało.',
    thanhCong: 'Wysłano {so} {kyHieu} na adres {diaChi}',
    xemGiaoDich: 'Zobacz transakcję',
    thongSoMang: 'Ustawienia sieci',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Symbol',
    thongSoThapPhan: 'Miejsca dziesiętne',
    thongSoExplorer: 'Eksplorator',
    thapPhanGiaiThich:
      'Portfele pokazują 18 miejsc po przecinku, bo C-Chain uruchamia EVM. Na P/X-Chain LOVE9 liczy ' +
      'się w 9 miejscach. Jedna moneta, dwie skale — nie dwa różne tokeny.',
    loiChung: 'Nie udało się wysłać. {chiTiet}',
  },

  chonNgonNgu: {
    nhan: 'Język',
    mayDich: 'maszynowo',
    mayDichGiaiThich: 'Tylko wersja wietnamska została przejrzana przez człowieka. Pozostałe tłumaczenia są maszynowe i mogą być błędne — źródłem prawdy jest wersja angielska.',
    chuaCo: 'jeszcze niedostępne',
  },

  loi: {
    khongKetNoi: 'Nie udało się połączyć z siecią',
    khongKetNoiMoTa: 'Sieć może być zajęta albo twoje połączenie zostało przerwane.',
    trongRong: 'Jeszcze nic tu nie ma',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'Ta strona nie istnieje',
    moTa:
      'Adres, który otworzyłeś, nie istnieje w 9Chain Testnet A1. ' +
      'Mógł zostać zmieniony albo przy kopiowaniu z adresu URL wypadło kilka znaków.',
    dayLaGi: 'Trzy najczęściej używane strony:',
    nhanNav: 'Dokąd dalej',
    veTrangChu: 'Wróć na stronę główną',
    diFaucet: 'Weź tokeny testowe',
    diDeChain: 'Uruchom swój łańcuch',
    timGiaoDich: 'Szukasz transakcji albo adresu? Sprawdź skrót i spróbuj ponownie.',
  },
};

export default pl;
