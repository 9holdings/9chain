import type { Tu } from '../en';

/**
 * Deutsch — maschinelle Übersetzung, nicht von einem Menschen geprüft.
 * Ausgangssprache ist Englisch (`../en.ts`); bei Abweichungen gilt die englische Fassung.
 *
 * 🔴 Diese drei Stellen nicht abschwächen: `reGenesis.*` (das Netzwerk wird gelöscht),
 * `deChain.soatMoTa` (Einbahntür), `chainCuaToi.thuHoiY*` (Widerruf gibt den Namen nicht zurück).
 * Sie sagen „dauerhaft" und „lässt sich nicht ändern", damit niemand sein Vermögen
 * verliert, weil er glaubt, es ließe sich rückgängig machen.
 */
export const de: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'Öffentliches Testnetz von 9Chain — ein eigenständiges Netzwerk auf der Avalanche-Engine',
    tagTitle: 'ein eigenständiges Netzwerk auf der Avalanche-Engine',
    viTuChoi: 'Sie haben die Anfrage in Ihrer Wallet abgelehnt. Es hat sich nichts geändert.',
    dangTai: 'Wird geladen…',
    thuLai: 'Erneut versuchen',
    saoChep: 'Kopieren',
    daChep: 'Kopiert',
    dong: 'Schließen',
    moMenu: 'Menü öffnen',
    dongMenu: 'Menü schließen',
    chuyenSangToi: 'Zum dunklen Modus wechseln',
    chuyenSangSang: 'Zum hellen Modus wechseln',
    boQuaToiNoiDung: 'Zum Hauptinhalt springen',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',
    bang: 'A1 wurde am {ngay} neu aufgebaut. Alle vorher entstandenen Guthaben und Chains existieren nicht mehr.',
    bangNut: 'Was das bedeutet',
    nhan: 'Neu aufgebaut',
    tieuDe: 'A1 wurde am {ngay} neu aufgebaut',
    moTa:
      'Das Testnetz A1 wurde ab Block 0 neu aufgebaut. Chains, Guthaben und Transaktionsverlauf, ' +
      'die vor diesem Datum entstanden sind, existieren nicht mehr — nicht versteckt, sondern weg. ' +
      'Diese Seite erklärt, was Sie sehen und was zu tun ist.',
    thayGiTieuDe: 'Was Sie sehen werden',
    thayGi1:
      'Ihre Wallet verbindet sich weiterhin, zeigt weiterhin den richtigen Netzwerknamen und dieselbe ' +
      'Chain ID {chainId} — das war Absicht. Aber Ihr Guthaben wird 0 sein.',
    thayGi2:
      'Jede L1, die Sie gestartet haben, ist aus dem Verzeichnis verschwunden. Ihre Namen und Chain IDs ' +
      'sind wieder frei, und jeder kann sie beanspruchen.',
    thayGi3:
      'Falls Sie eine Transaktion signiert, aber nie gesendet haben: senden Sie sie jetzt nicht — sie ' +
      'gehört zu einem Netzwerk, das es nicht mehr gibt.',
    lamGiTieuDe: 'Was Sie tun müssen',
    lamGi1: 'Fordern Sie erneut Test-Token beim Faucet an. Die Limits wurden für alle zurückgesetzt.',
    lamGi2:
      'Entfernen Sie jede alte L1 einzeln aus Ihrer Wallet — sie haben eigene Chain IDs und zeigen ' +
      'jetzt ins Leere. Das Haupt-Netzwerk A1 muss NICHT entfernt werden; seine Einstellungen sind unverändert.',
    lamGi3: 'Starten Sie Ihre Chain erneut, wenn Sie sie brauchen. Den alten Namen hat vielleicht jemand anderes genommen.',
    luuTieuDe: 'Archiv des alten Netzwerks',
    luuMoTa:
      'Der Endzustand des Netzwerks vor dem Neuaufbau wurde exportiert und sein Hash veröffentlicht, ' +
      'damit jeder, der es prüfen möchte, das kann.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'A1 wird am {ngay} neu aufgebaut — alle vorher entstandenen Chains, Guthaben und Transaktionen werden gelöscht.',
    bangNut: 'Details',
    nhan: 'Neuaufbau steht bevor',
    tieuDe: 'A1 wird am {ngay} neu aufgebaut',
    moTa:
      'Das gesamte Testnetz A1 wird ab Block 0 neu aufgebaut. Alles, was vor diesem Datum entstanden ' +
      'ist, verschwindet — nicht versteckt, sondern nicht mehr existent. Diese Seite sagt genau, was ' +
      'verloren geht und was Sie tun müssen.',
    viSaoTieuDe: 'Warum ein Neuaufbau nötig ist',
    viSao1:
      'Der Genesis eines Netzwerks ist unveränderlich. Genau das macht ihn vertrauenswürdig — niemand, ' +
      'auch nicht die Erbauer, kann eine Zahl ändern, die einmal in Block 0 geschrieben wurde.',
    viSao2:
      'Der Preis dafür: Eine Zahl im Genesis zu ändern lässt keine Wahl außer dem Neuaufbau des ' +
      'Netzwerks von Grund auf. A1 hat das Gesamtangebot auf 9.000.000.000 LOVE9 angehoben, und die ' +
      'gesamte Reihe der Staking-Parameter musste passend neu berechnet werden.',
    viSao3:
      'Dies ist ein Testnetz, und ein Neuaufbau gehört zu dem, was ein Testnetz tun darf. Genau dafür ' +
      'gibt es Testnetze: damit solche Änderungen hier passieren und nicht im Mainnet.',
    matTieuDe: 'Was verloren geht',
    matMoTa: 'Alles, ohne Ausnahme:',
    mat1: 'Jede von Nutzern gestartete L1, auch Chains, die einwandfrei laufen.',
    mat2: 'Jedes LOVE9-Guthaben, einschließlich der vom Faucet erhaltenen Token.',
    mat3: 'Jede Transaktion, jeder Block und die gesamte Historie von C-Chain, P-Chain und X-Chain.',
    mat4: 'Jeder Validator und jede Delegation.',
    conTieuDe: 'Was bleibt',
    conMoTa:
      'Vor der Löschung wird das gesamte auslaufende Netzwerk mit veröffentlichtem Hash exportiert, ' +
      'damit der Nachweis prüfbar bleibt. Was geschehen ist, lässt sich auch dann noch nachvollziehen, ' +
      'wenn das ausführende Netzwerk verschwunden ist. Der Archiv-Link wird am Tag des Neuaufbaus hier veröffentlicht.',
    lamTieuDe: 'Was Sie tun müssen',
    lamTruoc: 'Vor dem Neuaufbau:',
    lam1:
      'Bauen Sie jetzt nichts auf A1, das darauf angewiesen ist, dass Daten erhalten bleiben. Wenn Sie ' +
      'eine Idee ausprobieren, nur zu — behandeln Sie die aktuelle Chain nur nicht als Speicher.',
    lamSau: 'Nach dem Neuaufbau:',
    lam2:
      'Entfernen Sie jede von Ihnen hinzugefügte L1 einzeln aus der Wallet — diese Chains gibt es nicht ' +
      'mehr, und eine Wallet, die auf sie zeigt, bleibt einfach untätig. Das Haupt-Netzwerk A1 muss ' +
      'nicht entfernt werden: Seine Einstellungen sind unverändert.',
    lam3:
      'Wenn Ihre Wallet das A1-Netzwerk noch nicht hat, fügen Sie es über die Schaltfläche auf der ' +
      'Faucet-Seite hinzu, statt die Einstellungen von Hand einzutippen.',
    lam4: 'Fordern Sie erneut Token beim Faucet an und starten Sie Ihre Chain neu, wenn Sie möchten.',
    imLangTieuDe: 'Ihre Wallet wird Sie nicht warnen',
    imLangMoTa:
      'Das neue Netzwerk behält die Chain ID {chainId}, dieselbe RPC-Adresse und denselben Namen wie ' +
      'das alte. Das ist Absicht — damit jedes bereits veröffentlichte Dokument und jede Anleitung ' +
      'weiterhin stimmen. Der Preis ist, dass Ihre Wallet keinerlei Hinweis darauf hat, dass sie sich ' +
      'gerade mit einem anderen Netzwerk verbunden hat. Die beiden folgenden Dinge geschehen deshalb lautlos.',
    imLang1:
      'Eine Wallet mit der alten Konfiguration verbindet sich weiterhin, zeigt weiterhin den richtigen ' +
      'Netzwerknamen und meldet ein Guthaben von 0. Diese Zahl ist RICHTIG: Ihre alten Token existieren ' +
      'nicht mehr, sie sind nicht versteckt. Sie müssen das Netzwerk nicht erneut hinzufügen — fordern ' +
      'Sie einfach neue Token beim Faucet an. Meldet Ihre Wallet eine hängende Transaktion oder eine ' +
      'falsche Sequenznummer, löschen Sie die Aktivitätsdaten dieses Netzwerks in der Wallet: Sie merkt ' +
      'sich noch den Transaktionszähler einer toten Chain, während die neue bei 0 beginnt.',
    imLang2:
      'Wenn Sie noch eine signierte, nie gesendete Transaktion haben, verwerfen Sie sie. Die Signatur ' +
      'ist im neuen Netzwerk weiterhin gültig, weil sich die Chain ID nicht geändert hat. Solange die ' +
      'Wallet leer ist, schlägt sie fehl — aber in dem Moment, in dem Sie Token vom Faucet erhalten, ' +
      'wird sie ausführbar und kann zu einem Zeitpunkt durchgehen, mit dem Sie nicht rechnen.',
    lapTieuDe: 'Wird das wieder passieren',
    lapMoTa:
      'Möglich. A1 ist weiterhin ein Testnetz, und solange die Community zwischen A1 und C1 keine ' +
      'Mainnet-Richtung gewählt hat, behalten wir uns vor, das Netzwerk neu aufzubauen, wenn etwas im ' +
      'Genesis geändert werden muss. Wir sagen zu, vorher zu informieren und klar zu benennen, was verloren geht.',
    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    daXayRaTieuDe: 'Am 2026-08-27 bereits einmal neu aufgebaut',
    daXayRaMoTa:
      'A1 wurde am 2026-08-27 bereits einmal neu aufgebaut, vor dem unten genannten Datum. Wenn Sie davor Test-Token hatten, ist Ihr Guthaben jetzt 0 — das ist richtig und kein Fehler Ihrer Wallet. Es ging keine Nutzer-Chain verloren: im Verzeichnis standen damals nur automatisierte Test-Chains. Fordern Sie beim Faucet erneut Token an.',
    ngayLuuY: 'Das Datum kann sich verschieben',
    ngayLuuYMoTa:
      'Das Datum {ngay} hängt von einer vorgelagerten Freigabeprüfung ab. Verschiebt es sich, ändern ' +
      'wir das Datum auf dieser Seite, statt zu schweigen.',
  },

  chanTrang: {
    dungThu: 'Ausprobieren',
    kham: 'Netzwerk ansehen',
    veDuAn: 'Über das Projekt',
    explorer: '9Scan-A1 Explorer',
    trangChinh: '9Chain Hauptseite',
    moTabMoi: '(öffnet in einem neuen Tab)',
    nhanNav: 'Fußzeilen-Links',
    reGenesis: 'Plan für den Netzwerk-Neuaufbau',
  },

  dieuHuong: {
    trangChu: 'Startseite',
    faucet: 'Test-Token holen',
    console: 'Chain starten',
    chainCuaToi: 'Meine Chains',
    bang: 'A1 ↔ C1',
    danhBa: 'L1-Verzeichnis',
    explorer: 'Explorer',
    banGiao: '9Scan-A1 in neuem Tab öffnen',
  },

  trangChu: {
    nhanTestnet: 'Testnetz — die Token haben keinen realen Wert',
    nutChinh: 'Starten Sie Ihre Chain',
    nutPhu: 'Holen Sie sich zuerst Test-Token',
    cTieuDe: 'Starten Sie Ihre eigene Chain auf A1',
    cPhu: 'Eine eigene L1, im Besitz der Wallet, mit der Sie signieren, die wirklich im Testnetz läuft. Dauert etwa drei Minuten.',
    cBangChuThich: 'Jede Zeile ist eine echte Chain, die auf A1 läuft, mit eigenem Besitzer.',
    cCot: 'Chain',
    cCotKieu: 'Typ',
    cCotChu: 'Besitzer',
    cMacDinh: 'Systemvorgabe',
    cTrong: 'Es läuft noch keine L1',
    cTrongMoTa: 'Sie wären die erste Person. Das Verzeichnis aktualisiert sich, sobald Ihre Chain läuft.',
    tuTo: 'Alle 9 Validatoren laufen derzeit auf demselben Server beim selben Anbieter — auf Protokollebene dezentral, auf Infrastrukturebene noch nicht.',
    blockDungYen: 'Avalanche erzeugt keine leeren Blöcke; eine stehende Blockhöhe ist daher normal, solange niemand Transaktionen sendet. Das Maß für Lebendigkeit ist die Validatorenzahl daneben.',
  },

  soLieu: {
    tieuDe: 'Das Netzwerk läuft',
    validator: 'Verbundene Validatoren',
    soL1: 'Laufende L1',
    chieuCao: 'C-Chain-Block',
    dangDo: 'Netzwerk wird gemessen…',
    khongDo: 'Netzwerkstatistik konnte nicht gelesen werden',
    khongDoMoTa: 'Die Seite funktioniert weiterhin — dies ist nur die Statusanzeige.',
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

  deChain: {
    tieuDe: 'Starten Sie Ihre Chain',
    moTa: 'Eine eigene L1, im Besitz Ihrer Wallet. Sie signieren einmal, um zu belegen, wer Sie sind, prüfen — und das Netzwerk baut die Chain in etwa drei Minuten.',
    noiVi: 'Wallet verbinden',
    dangNoi: 'Verbinden…',
    kyDeVao: 'Zum Anmelden signieren',
    dangKy: 'Warte auf Signatur…',
    viCuaBan: 'Ihre Wallet',
    laChuChain: 'Die Chain gehört dieser Wallet. Die Adresse stammt aus Ihrer Signatur — niemand tippt sie ein.',
    khongCoVi: 'In diesem Browser wurde keine Wallet gefunden. Installieren Sie MetaMask und laden Sie die Seite neu.',
    tuChoiKy: 'Sie haben das Signieren abgelehnt. Es wurde nichts erstellt.',
    doiVi: 'Andere Wallet verwenden',
    nhanTen: 'Chain-Name',
    goiYTen: 'Zum Beispiel: MeineChain',
    moTaTen: 'Buchstaben, Ziffern und Leerzeichen. 2–32 Zeichen. In diesem Netzwerk wird ein bereits verwendeter Name nie erneut vergeben — auch nicht für eine widerrufene Chain.',
    tenXau: 'Der Name darf nur Buchstaben, Ziffern und Leerzeichen enthalten, 2 bis 32 Zeichen lang.',
    nhanKieu: 'Chain-Typ',
    moTaKieu: 'Einmal gewählt, ist es fest — der Genesis einer Chain lässt sich nicht bearbeiten.',
    conCho: 'Noch {con}/{tong} Plätze',
    hetCho: 'Keine Plätze mehr',
    hetChoMoTa:
      'Im aktuellen Modell verfolgt jeder Validator jede L1, und das Protokoll trennt einen Knoten, ' +
      'der mehr als 16 Subnetze angibt. Das ist eine harte Obergrenze und lässt sich nicht anheben. ' +
      'Der Widerruf einer Chain gibt einen Platz zurück.',
    soatLai: 'Vor dem Absenden prüfen',
    soatTieuDe: 'Prüfung — dies ist eine Einbahntür',
    soatMoTa:
      'Der Genesis einer gestarteten L1 ist UNVERÄNDERLICH. Nach diesem Schritt lassen sich Name, ' +
      'Chain-Typ und Besitzer nicht mehr ändern — und ein Widerruf gibt Name und Chain ID ebenfalls nicht zurück.',
    soatReGenesis:
      'Noch eines, bevor Sie drücken: A1 baut am {ngay} das gesamte Netzwerk neu auf. Die Chain, die ' +
      'Sie heute starten, wird zusammen mit dem alten Netzwerk gelöscht — nicht versteckt, sondern weg.',
    soatTen: 'Chain-Name',
    soatKieu: 'Chain-Typ',
    soatChu: 'Besitzer',
    soatQuayLai: 'Zurück und bearbeiten',
    soatDongY: 'Ich habe geprüft — Chain starten',
    dangDe: 'Chain „{ten}" wird gestartet',
    dangDeMoTa:
      'Die Knoten starten NACHEINANDER neu, damit das Netzwerk nie das Quorum verliert — deshalb ist ' +
      'es langsam, und das ist Absicht. Schließen Sie den Tab nicht; falls doch, wird die Chain trotzdem gebaut.',
    conKhoang: 'Noch etwa {phut} Minuten',
    dangChuanBi: 'Wird vorbereitet…',
    xongTieuDe: 'Fertig — Chain „{ten}" läuft',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Chain zur Wallet hinzufügen',
    xongDaThem: 'Zur Wallet hinzugefügt',
    xongKichHoat: 'Chain aktivieren (Block 1 öffnen)',
    xongDaKichHoat: 'Aktiviert',
    xongDangKichHoat: 'Warte auf Wallet…',
    xongThemViLoi: 'Die Chain konnte nicht zu Ihrer Wallet hinzugefügt werden. {chiTiet}',
    xongKichHoatLoi: 'Die Chain konnte nicht aktiviert werden. {chiTiet}',
    deTiep: 'Weitere Chain starten',
    loiDe: 'Die Chain konnte nicht gestartet werden. {chiTiet}',
    loiKhongRo: 'Nach Abschluss des Laufs erschien die Chain nicht im Verzeichnis.',
    luuYTieuDe: 'Die erste Transaktion einer neuen Chain',
    luuYCachLam: 'Vertrauen Sie der Gas-Schätzung der ersten Transaktion nicht. Am günstigsten öffnen Sie Block 1 mit einer gewöhnlichen Überweisung — drücken Sie unten „Chain aktivieren".',
  },

  chainCuaToi: {
    tieuDe: 'Meine Chains',
    moTa: 'Die L1 im Besitz der Wallet, mit der Sie sich angemeldet haben. Sie lassen sich widerrufen, aber lesen Sie zuerst die Warnung.',
    noiVi: 'Verbinden Sie Ihre Wallet, um Ihre Chains zu sehen',
    trongTieuDe: 'Diese Wallet besitzt noch keine Chain',
    trongMoTa: 'Starten Sie eine und kommen Sie zurück — sie erscheint sofort hier.',
    trongNut: 'Starten Sie Ihre Chain',
    cotChain: 'Chain',
    cotKieu: 'Typ',
    cotSong: 'Status',
    cotViec: '',
    songDo: '{so} Validatoren',
    songDangDo: 'wird gemessen',
    songKhongDo: 'Messung nicht möglich',
    songGiaiThich: 'Gemessen an der Validatorenzahl des Subnetzes, nicht an der Blockhöhe.',
    khongValidator: '0 Validatoren',
    khongValidatorMoTa:
      'Diese Chain kann KEINE Transaktion finalisieren: Das Subnetz hat keine Validatoren. Sie ' +
      'antwortet weiterhin auf RPC-Aufrufe, und Wallets verbinden sich weiterhin — es gibt also kein ' +
      'anderes sichtbares Zeichen.',
    thongSo: 'Wallet-Einstellungen',
    themVaoVi: 'Zur Wallet hinzufügen',
    daThemVaoVi: 'Hinzugefügt',
    themViLoi: 'Konnte nicht zu Ihrer Wallet hinzugefügt werden. {chiTiet}',
    thuHoi: 'Widerrufen',
    thuHoiTieuDe: '„{ten}" widerrufen?',
    thuHoiY1: 'Die Chain stellt den RPC-Dienst sofort ein und verschwindet aus dem öffentlichen Verzeichnis.',
    thuHoiY2:
      'Ein Widerruf löscht das Subnetz auf der P-Chain NICHT — was dort erzeugt wurde, lässt sich nicht ' +
      'entfernen, solange dieses Netzwerk läuft. Er entfernt das Netzwerk auch nicht aus den Wallets ' +
      'derer, die diese Chain bereits hinzugefügt haben.',
    thuHoiY3:
      'Name und Chain ID bleiben reserviert und werden in diesem Netzwerk NIEMALS an jemanden neu ' +
      'vergeben. Eine erneute Vergabe würde die Wallet eines früheren Nutzers stillschweigend auf die ' +
      'Chain einer anderen Person zeigen lassen.',
    thuHoiY4: 'Im Gegenzug wird einer der 15 Plätze zurückgegeben.',
    thuHoiGoNhan: 'Geben Sie zur Bestätigung den Chain-Namen exakt ein',
    thuHoiSaiTen: 'Das stimmt nicht mit dem Chain-Namen überein.',
    thuHoiXacNhan: 'Endgültig widerrufen',
    thuHoiHuy: 'Abbrechen',
    thuHoiDangChay: '„{ten}" wird widerrufen — etwa drei Minuten',
    thuHoiXong: '„{ten}" widerrufen. Noch {con}/{tong} Plätze.',
    thuHoiLoi: 'Widerruf nicht möglich. {chiTiet}',
    thuHoiKhongRo: 'Nach Abschluss des Laufs steht die Chain weiterhin im Verzeichnis.',
    daThuHoi: 'Widerrufen',
    daThuHoiMoTa: 'Name und Chain ID bleiben in diesem Netzwerk reserviert.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — Vergleich',
    moTa:
      '9Chain betreibt ZWEI Testnetze desselben Produkts parallel, unterschieden durch die Engine: ' +
      'A1 auf der Avalanche-Engine, C1 auf der Cosmos-Engine. Diese Tabelle hält die Abwägungen ' +
      'zwischen beiden Richtungen fest, veröffentlicht, damit jede Person widersprechen kann — für die ' +
      'C1-Seite gibt es noch keine Live-Messungen.',
    tuChamTieuDe: 'Die Punkte unten sind eine SELBSTEINSCHÄTZUNG des Teams, keine unabhängige Messung',
    tuChamMoTa:
      'Die Spalte „wie gemessen" sagt, wie jedes Kriterium geprüft wurde. Jedes Kriterium ohne datierte ' +
      'Messung ist ein Architektururteil, keine Zahl. Die Gewichte bestimmen Sie — die Punktzahl folgt.',
    cotSo: 'Nr.',
    cotTieuChi: 'Kriterium',
    cotLoai: 'Typ',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Gewicht',
    loaiKienTruc: 'Architektur',
    loaiSong: 'Live-Daten',
    tongDiem: 'Gesamtpunktzahl mit Ihren Gewichten',
    hoaNhau: 'Gleichstand',
    dangDan: 'führt',
    soLieuTieuDe: 'Live-Daten',
    a1Validator: 'A1 — verbundene Validatoren',
    a1Chain: 'A1 — laufende L1',
    a1Block: 'A1 — C-Chain-Block',
    c1Vang: 'C1 — nicht erreichbar',
    c1VangMoTa:
      'Die Cosmos-REST-URL von C1 (Port 1317) wird benötigt. Die Tabelle bleibt nutzbar: Die A1-Seite ' +
      'sind Live-Daten, die C1-Seite ist ein Architektururteil wie die übrigen Kriterien.',
    dangDo: 'wird gemessen…',
    khongDo: 'Messung nicht möglich',
  },

  faucet: {
    tieuDe: 'Test-Token holen',
    moTa: 'LOVE9 im A1-Testnetz hat keinen realen Wert — es existiert, damit Sie beim Testen Gas bezahlen können. Geben Sie eine Wallet-Adresse ein, wir senden sofort.',
    nhanDiaChi: 'Ihre Wallet-Adresse',
    goiYDiaChi: '0x… (40 Hex-Zeichen)',
    nutXin: 'Schickt mir Token',
    dangGui: 'Wird gesendet…',
    danChoDiaChi: 'Fügen Sie die Wallet-Adresse ein, die die Token erhalten soll. Drücken Sie oben „Netzwerk zur Wallet hinzufügen", falls noch nicht geschehen.',
    themMang: 'Netzwerk zur Wallet hinzufügen',
    themMangXong: 'Zur Wallet hinzugefügt',
    themMangTuChoi: 'Sie haben in Ihrer Wallet auf Ablehnen gedrückt. Drücken Sie erneut, wenn Sie das Netzwerk hinzufügen möchten.',
    themMangLoi: 'Ihre Wallet konnte das Netzwerk nicht hinzufügen. Fügen Sie es manuell mit den Einstellungen daneben hinzu — und senden Sie die Zeile unten an das Team:',
    khongCoVi: 'In diesem Browser wurde keine Wallet gefunden. Installieren Sie MetaMask und laden Sie die Seite neu.',
    hanMucConLai: 'Verbleibendes Kontingent',
    hanMucCachDoc: '{con}/{tong} Anfragen pro {gio} Stunden',
    hanMucHet: 'Sie haben Ihr gesamtes Kontingent verbraucht. Versuchen Sie es in {phut} Minuten erneut.',
    hanMucKhongDoc: 'Ihr Kontingent konnte nicht gelesen werden — Sie können weiterhin anfragen, wissen nur nicht, wie viele übrig sind.',
    thanhCong: '{so} {kyHieu} an {diaChi} gesendet',
    xemGiaoDich: 'Transaktion ansehen',
    thongSoMang: 'Netzwerkeinstellungen',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Symbol',
    thongSoThapPhan: 'Dezimalstellen',
    thongSoExplorer: 'Explorer',
    thapPhanGiaiThich:
      'Wallets zeigen 18 Dezimalstellen, weil die C-Chain die EVM ausführt. Auf der P/X-Chain wird ' +
      'LOVE9 mit 9 Dezimalstellen gezählt. Eine Münze, zwei Skalen — nicht zwei verschiedene Token.',
    loiChung: 'Senden nicht möglich. {chiTiet}',
  },

  chonNgonNgu: {
    nhan: 'Sprache',
    mayDich: 'maschinell',
    mayDichGiaiThich: 'Nur die vietnamesische Fassung wurde von einem Menschen geprüft. Die übrigen Übersetzungen sind maschinell und können Fehler enthalten — die englische Fassung ist maßgeblich.',
    chuaCo: 'noch nicht verfügbar',
  },

  loi: {
    khongKetNoi: 'Das Netzwerk war nicht erreichbar',
    khongKetNoiMoTa: 'Das Netzwerk ist vielleicht ausgelastet, oder Ihre Verbindung ist abgebrochen.',
    trongRong: 'Hier gibt es noch nichts',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'Diese Seite existiert nicht',
    moTa: 'Die aufgerufene Adresse existiert auf 9Chain Testnet A1 nicht. Vielleicht wurde sie umbenannt, oder der URL sind beim Kopieren ein paar Zeichen abhandengekommen.',
    dayLaGi: 'Die drei meistgenutzten Seiten:',
    nhanNav: 'Wohin als Nächstes',
    veTrangChu: 'Zurück zur Startseite',
    diFaucet: 'Test-Token holen',
    diDeChain: 'Starten Sie Ihre Chain',
    timGiaoDich: 'Suchen Sie eine Transaktion oder eine Adresse? Prüfen Sie den Hash und versuchen Sie es erneut.',
  },
};

export default de;
