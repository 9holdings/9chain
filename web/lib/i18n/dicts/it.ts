import type { Tu } from '../en';

/**
 * Italiano — traduzione automatica, non verificata da una persona.
 * La lingua di partenza è l'inglese (`../en.ts`); in caso di divergenza vale la versione inglese.
 *
 * 🔴 Questi tre punti non vanno addolciti: `reGenesis.*` (la rete verrà cancellata),
 * `deChain.soatMoTa` (porta a senso unico), `chainCuaToi.thuHoiY*` (la revoca non restituisce
 * il nome). Dicono "definitivamente" e "non modificabile" perché nessuno perda beni credendo
 * che si possa tornare indietro.
 */
export const it: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'La testnet pubblica di 9Chain — una rete indipendente che gira sul motore Avalanche',
    tagTitle: 'una rete indipendente sul motore Avalanche',
    viTuChoi: 'Hai rifiutato la richiesta nel tuo wallet. Non è cambiato nulla.',
    dangTai: 'Caricamento…',
    thuLai: 'Riprova',
    saoChep: 'Copia',
    daChep: 'Copiato',
    dong: 'Chiudi',
    moMenu: 'Apri il menu',
    dongMenu: 'Chiudi il menu',
    chuyenSangToi: 'Passa alla modalità scura',
    chuyenSangSang: 'Passa alla modalità chiara',
    boQuaToiNoiDung: 'Vai al contenuto principale',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',

    bang: 'A1 è stata ricostruita il {ngay}. Ogni saldo e ogni catena creati prima di quella data non esistono più.',
    bangNut: 'Che cosa significa',
    nhan: 'Ricostruita',

    tieuDe: 'A1 è stata ricostruita il {ngay}',
    moTa:
      'La rete di test A1 è stata ricostruita dal blocco 0. Catene, saldi e cronologia delle ' +
      'transazioni creati prima di quella data non esistono più — non sono nascosti, sono spariti. ' +
      'Questa pagina spiega che cosa stai vedendo e che cosa fare.',

    thayGiTieuDe: 'Che cosa vedrai',
    thayGi1:
      'Il tuo wallet si collega ancora, mostra ancora il nome di rete corretto e lo stesso Chain ID ' +
      '{chainId} — è stato voluto. Ma il tuo saldo sarà 0.',
    thayGi2:
      'Ogni L1 che hai avviato è sparita dall’elenco. I loro nomi e Chain ID sono di nuovo liberi, ' +
      'e chiunque può prenderli.',
    thayGi3:
      'Se hai firmato una transazione senza mai trasmetterla, non trasmetterla adesso — ' +
      'appartiene a una rete che non esiste più.',

    lamGiTieuDe: 'Che cosa devi fare',
    lamGi1: 'Richiedi di nuovo i token di test dal faucet. I limiti sono stati azzerati per tutti.',
    lamGi2:
      'Rimuovi dal wallet ogni singola L1 — hanno Chain ID propri e ora non puntano a nulla. ' +
      'La rete principale A1 NON va rimossa; le sue impostazioni non sono cambiate.',
    lamGi3: 'Riavvia la tua catena se ti serve. Qualcun altro potrebbe aver preso il vecchio nome.',

    luuTieuDe: 'Archivio della vecchia rete',
    luuMoTa:
      'Lo stato finale della rete prima della ricostruzione è stato esportato e il suo hash ' +
      'pubblicato, così chi vuole verificarlo può farlo.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'A1 verrà ricostruita il {ngay} — ogni catena, saldo e transazione creati prima di allora saranno cancellati.',
    bangNut: 'Dettagli',
    nhan: 'Ricostruzione in arrivo',

    tieuDe: 'A1 verrà ricostruita il {ngay}',
    moTa:
      'L’intera rete di test A1 verrà ricostruita dal blocco 0. Tutto ciò che è stato creato prima ' +
      'di quella data sparirà — non sarà nascosto, semplicemente non esisterà più. Questa pagina dice ' +
      'esattamente che cosa si perde e che cosa devi fare.',

    viSaoTieuDe: 'Perché la ricostruzione è necessaria',
    viSao1:
      'Il genesis di una rete è immutabile. È proprio questo a renderla affidabile — nessuno, ' +
      'nemmeno chi l’ha costruita, può cambiare un numero una volta che è stato scritto nel blocco 0.',
    viSao2:
      'Il prezzo è questo: cambiare un numero dentro il genesis non lascia altra scelta che ' +
      'ricostruire la rete da zero. A1 ha portato l’offerta totale a 9.000.000.000 LOVE9, e l’intera ' +
      'gamma dei parametri di staking ha dovuto essere ricalcolata di conseguenza.',
    viSao3:
      'Questa è una testnet, e ricostruirsi è una cosa che a una testnet è concessa. Anzi, è il ' +
      'motivo per cui le testnet esistono: perché cambiamenti come questo avvengano qui, non in mainnet.',

    matTieuDe: 'Che cosa andrà perso',
    matMoTa: 'Tutto, senza eccezioni:',
    mat1: 'Ogni L1 avviata dagli utenti, comprese le catene che funzionano perfettamente.',
    mat2: 'Ogni saldo LOVE9, compresi i token ricevuti dal faucet.',
    mat3: 'Ogni transazione, ogni blocco, l’intera cronologia di C-Chain, P-Chain e X-Chain.',
    mat4: 'Ogni validatore e ogni delega.',

    conTieuDe: 'Che cosa viene conservato',
    conMoTa:
      'Prima della cancellazione, l’intera rete morente verrà esportata con un hash pubblicato, così ' +
      'che il registro resti verificabile. Quel che è accaduto potrà ancora essere controllato, anche ' +
      'quando la rete che lo ha eseguito non ci sarà più. Il link all’archivio verrà pubblicato qui ' +
      'il giorno della ricostruzione.',

    lamTieuDe: 'Che cosa devi fare',
    lamTruoc: 'Prima della ricostruzione:',
    lam1:
      'Non costruire ora su A1 nulla che dipenda dalla sopravvivenza dei dati. Se stai provando ' +
      'un’idea, fai pure — solo, non trattare la catena attuale come un archivio.',
    lamSau: 'Dopo la ricostruzione:',
    lam2:
      'Rimuovi dal wallet ogni singola L1 che avevi aggiunto — quelle catene non esistono più, e un ' +
      'wallet che punta lì resterà semplicemente fermo. La rete principale A1 non va rimossa: le sue ' +
      'impostazioni non sono cambiate.',
    lam3:
      'Se il tuo wallet non ha ancora la rete A1, aggiungila con il pulsante nella pagina del faucet ' +
      'invece di digitare le impostazioni a mano.',
    lam4: 'Richiedi di nuovo i token dal faucet e riavvia la tua catena se la vuoi.',

    imLangTieuDe: 'Il tuo wallet non ti avviserà',
    imLangMoTa:
      'La nuova rete mantiene il Chain ID {chainId}, lo stesso indirizzo RPC e lo stesso nome della ' +
      'vecchia. È voluto — così ogni documento e ogni guida già pubblicati restano corretti. Il prezzo ' +
      'è che il tuo wallet non ha alcun segnale del fatto che si è appena collegato a una rete diversa. ' +
      'Le due cose qui sotto avverranno quindi in silenzio.',
    imLang1:
      'Un wallet con la vecchia configurazione si collega ancora, mostra ancora il nome di rete ' +
      'corretto e riporterà un saldo di 0. Quel numero è CORRETTO: i tuoi vecchi token non esistono ' +
      'più, non sono nascosti. Non devi riaggiungere la rete — richiedi solo nuovi token dal faucet. ' +
      'Se il wallet segnala una transazione bloccata o un numero di sequenza sbagliato, cancella i ' +
      'dati di attività di quella rete nel wallet: ricorda ancora il conteggio delle transazioni di ' +
      'una catena morta, mentre la nuova catena conta da 0.',
    imLang2:
      'Se hai ancora una transazione firmata e mai trasmessa, buttala. La firma è ancora valida sulla ' +
      'nuova rete, perché il Chain ID non è cambiato. Fallirà finché il wallet è vuoto — ma nel momento ' +
      'in cui richiedi token dal faucet diventa spendibile, e potrebbe passare in un momento che non ' +
      'ti aspetti.',

    lapTieuDe: 'Succederà di nuovo',
    lapMoTa:
      'Possibile. A1 è ancora una testnet e, finché la comunità non sceglie una direzione di mainnet ' +
      'tra A1 e C1, ci riserviamo il diritto di ricostruire la rete quando qualcosa dentro il genesis ' +
      'deve cambiare. Quello che ci impegniamo a fare è avvisarti in anticipo e dire chiaramente che ' +
      'cosa si perde.',

    daXayRaTieuDe: 'Già ricostruita una volta il 2026-08-27',
    daXayRaMoTa:
      'A1 è già stata ricostruita una volta il 2026-08-27, prima della data qui sotto. Se prima di allora avevi token di test, il tuo saldo ora è 0 — è corretto, non è un guasto del tuo wallet. Nessuna catena degli utenti è andata persa: l’elenco conteneva solo catene di test automatiche. Richiedi di nuovo i token dal faucet.',
    ngayLuuY: 'La data può slittare',
    ngayLuuYMoTa:
      'La data {ngay} dipende da un controllo go/no-go precedente. Se slitta, cambieremo la data su ' +
      'questa pagina invece di restare in silenzio.',
  },

  chanTrang: {
    dungThu: 'Prova',
    kham: 'Esplora',
    veDuAn: 'Informazioni',
    explorer: 'Explorer 9Scan-A1',
    trangChinh: 'Sito principale 9Chain',
    moTabMoi: '(si apre in una nuova scheda)',
    nhanNav: 'Link a piè di pagina',
    reGenesis: 'Piano di ricostruzione della rete',
  },

  dieuHuong: {
    trangChu: 'Home',
    faucet: 'Ottieni token di test',
    console: 'Avvia una catena',
    chainCuaToi: 'Le mie catene',
    bang: 'A1 ↔ C1',
    danhBa: 'Elenco L1',
    explorer: 'Explorer',
    banGiao: 'Apri 9Scan-A1 in una nuova scheda',
  },

  trangChu: {
    nhanTestnet: 'Testnet — i token non hanno valore reale',
    nutChinh: 'Avvia la tua catena',
    nutPhu: 'Prima ottieni token di test',

    cTieuDe: 'Avvia la tua catena su A1',
    cPhu: 'Una L1 tutta tua, di proprietà del wallet con cui firmi, che gira davvero sulla rete di test. Richiede circa tre minuti.',
    cBangChuThich: 'Ogni riga è una catena reale in funzione su A1, con un proprietario suo.',
    cCot: 'Catena',
    cCotKieu: 'Tipo',
    cCotChu: 'Proprietario',
    cMacDinh: 'predefinito di sistema',
    cTrong: 'Nessuna L1 è ancora in funzione',
    cTrongMoTa: 'Saresti il primo. L’elenco si aggiorna appena la tua catena è attiva.',

    tuTo: '9 dei 10 validatori girano su un solo server e con un solo fornitore; il decimo gira presso un fornitore diverso. Decentralizzato a livello di protocollo, e appena agli inizi a livello di infrastruttura.',
    blockDungYen: 'Avalanche non produce blocchi vuoti, quindi un’altezza di blocco che resta ferma mentre nessuno effettua transazioni è normale. La misura di attività è il numero di validatori accanto.',
  },

  soLieu: {
    tieuDe: 'La rete è attiva',
    validator: 'Validatori collegati',
    soL1: 'L1 in funzione',
    chieuCao: 'Blocco C-Chain',
    dangDo: 'Misurazione della rete…',
    khongDo: 'Impossibile leggere le statistiche di rete',
    khongDoMoTa: 'La pagina funziona comunque — questo è solo il pannello di stato.',
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

  deChain: {
    tieuDe: 'Avvia la tua catena',
    moTa:
      'Una L1 dedicata, di proprietà del tuo wallet. Firmi una volta per dimostrare chi sei, ' +
      'controlli, e la rete costruisce la catena in circa tre minuti.',

    noiVi: 'Collega il wallet',
    dangNoi: 'Collegamento…',
    kyDeVao: 'Accedi',
    dangKy: 'In attesa della firma…',
    viCuaBan: 'Il tuo wallet',
    laChuChain: 'La catena apparterrà a questo wallet. L’indirizzo deriva dalla tua firma — nessuno lo digita.',
    khongCoVi: 'Nessun wallet trovato in questo browser. Installa MetaMask e ricarica la pagina.',
    tuChoiKy: 'Hai rifiutato di firmare. Non è stato creato nulla.',
    doiVi: 'Usa un altro wallet',

    nhanTen: 'Nome della catena',
    goiYTen: 'Per esempio: MyChain',
    moTaTen:
      'Lettere, cifre e spazi. 2–32 caratteri. Su questa rete un nome già usato non viene mai ' +
      'riassegnato — nemmeno per una catena revocata.',
    tenXau: 'Il nome può contenere solo lettere, cifre e spazi, per una lunghezza di 2–32 caratteri.',
    nhanKieu: 'Tipo di catena',
    moTaKieu: 'Una volta scelto è fisso — il genesis di una catena non è modificabile.',
    conCho: '{con}/{tong} posti liberi',
    hetCho: 'Nessun posto libero',
    hetChoMoTa:
      'Il modello attuale fa sì che ogni validatore segua ogni L1, e il protocollo espelle un nodo ' +
      'che dichiara più di 16 subnet. È un tetto rigido e non può essere alzato. Revocare una catena ' +
      'restituisce un posto.',
    soatLai: 'Controlla prima di inviare',

    soatTieuDe: 'Controllo — questa è una porta a senso unico',
    soatMoTa:
      'Il genesis di una L1 avviata è IMMUTABILE. Dopo questo passaggio nome, tipo di catena e ' +
      'proprietario non possono essere cambiati — e nemmeno la revoca restituirà nome e chain ID.',
    soatReGenesis:
      'Un’altra cosa da sapere prima di premere: A1 ricostruisce l’intera rete il {ngay}. La catena ' +
      'che avvii oggi verrà cancellata insieme alla vecchia rete — non nascosta, sparita.',
    soatTen: 'Nome della catena',
    soatKieu: 'Tipo di catena',
    soatChu: 'Proprietario',
    soatQuayLai: 'Torna indietro e modifica',
    soatDongY: 'Ho controllato — avvia la catena',

    dangDe: 'Avvio della catena “{ten}”',
    dangDeMoTa:
      'I nodi si riavviano UNO ALLA VOLTA perché la rete non perda mai il quorum — è per questo che ' +
      'è lento, ed è voluto. Non chiudere la scheda; se la chiudi, la catena viene comunque costruita.',
    conKhoang: 'Circa {phut} minuti rimasti',
    dangChuanBi: 'Preparazione…',

    xongTieuDe: 'Fatto — la catena “{ten}” è attiva',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Aggiungi la catena al wallet',
    xongDaThem: 'Aggiunta al wallet',
    xongKichHoat: 'Attiva la catena (apri il blocco 1)',
    xongDaKichHoat: 'Attivata',
    xongDangKichHoat: 'In attesa del wallet…',
    xongThemViLoi: 'Impossibile aggiungere la catena al tuo wallet. {chiTiet}',
    xongKichHoatLoi: 'Impossibile attivare la catena. {chiTiet}',

    deTiep: 'Avvia un’altra catena',
    loiDe: 'Impossibile avviare la catena. {chiTiet}',
    loiKhongRo: 'La catena non è comparsa nell’elenco al termine dell’operazione.',
    luuYTieuDe: 'La prima transazione su una catena nuova',
    luuYCachLam:
      'Non fidarti della stima del gas per la prima transazione. Il modo più economico per aprire il ' +
      'blocco 1 è un normale trasferimento — premi “Attiva la catena” qui sotto.',
  },

  chainCuaToi: {
    tieuDe: 'Le mie catene',
    moTa: 'Le L1 di proprietà del wallet con cui hai effettuato l’accesso. Possono essere revocate, ma leggi prima l’avviso.',
    noiVi: 'Collega il wallet per vedere le tue catene',
    trongTieuDe: 'Questo wallet non possiede ancora alcuna catena',
    trongMoTa: 'Avviane una e torna qui — comparirà subito.',
    trongNut: 'Avvia la tua catena',

    cotChain: 'Catena',
    cotKieu: 'Tipo',
    cotSong: 'Stato',
    cotViec: '',

    songDo: '{so} validatori',
    songDangDo: 'misurazione',
    songKhongDo: 'impossibile misurare',
    songGiaiThich: 'Misurato dal numero di validatori della subnet, non dall’altezza dei blocchi.',
    khongValidator: '0 validatori',
    khongValidatorMoTa:
      'Questa catena NON può finalizzare alcuna transazione: la subnet non ha validatori. Risponde ' +
      'comunque alle chiamate RPC e i wallet si collegano lo stesso, quindi non c’è nessun altro ' +
      'segno visibile.',

    thongSo: 'Impostazioni del wallet',
    themVaoVi: 'Aggiungi al wallet',
    daThemVaoVi: 'Aggiunta',
    themViLoi: 'Impossibile aggiungerla al tuo wallet. {chiTiet}',

    thuHoi: 'Revoca',
    thuHoiTieuDe: 'Revocare “{ten}”?',
    thuHoiY1: 'La catena smette subito di servire RPC e sparisce dall’elenco pubblico.',
    thuHoiY2:
      'La revoca NON elimina la subnet sulla P-Chain — ciò che è stato creato lì non può essere ' +
      'rimosso finché questa rete è in funzione. Non rimuove nemmeno la rete dai wallet di chi ha ' +
      'già aggiunto questa catena.',
    thuHoiY3:
      'Nome e Chain ID restano riservati e non vengono MAI riassegnati a nessuno su questa rete. ' +
      'Riassegnare un Chain ID permetterebbe al wallet di un ex utente di puntare in silenzio alla ' +
      'catena di qualcun altro.',
    thuHoiY4: 'In cambio, uno dei 15 posti viene restituito.',
    thuHoiGoNhan: 'Digita esattamente il nome della catena per confermare',
    thuHoiSaiTen: 'Non corrisponde al nome della catena.',
    thuHoiXacNhan: 'Revoca definitivamente',
    thuHoiHuy: 'Annulla',
    thuHoiDangChay: 'Revoca di “{ten}” — circa tre minuti',
    thuHoiXong: '“{ten}” revocata. {con}/{tong} posti liberi.',
    thuHoiLoi: 'Impossibile revocare. {chiTiet}',
    thuHoiKhongRo: 'La catena è ancora nell’elenco al termine dell’operazione.',

    daThuHoi: 'Revocata',
    daThuHoiMoTa: 'Nome e Chain ID restano riservati su questa rete.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — confronto',
    moTa:
      '9Chain gestisce DUE testnet dello stesso prodotto affiancate, che differiscono per motore: ' +
      'A1 sul motore Avalanche, C1 sul motore Cosmos. Questa tabella registra i compromessi tra le ' +
      'due direzioni ed è pubblicata perché chiunque possa contestarla — il lato C1 non ha ancora ' +
      'misurazioni dal vivo.',

    tuChamTieuDe: 'I punteggi qui sotto sono AUTOVALUTATI dal team, non misurati in modo indipendente',
    tuChamMoTa:
      'La colonna "come è stato misurato" indica come è stato verificato ogni criterio. Ogni criterio ' +
      'senza una misurazione datata è un giudizio architetturale, non un dato. I pesi li scegli tu — ' +
      'il punteggio ne consegue.',

    cotSo: '#',
    cotTieuChi: 'Criterio',
    cotLoai: 'Tipo',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Peso',
    loaiKienTruc: 'architettura',
    loaiSong: 'dati dal vivo',

    tongDiem: 'Punteggio totale con i tuoi pesi',
    hoaNhau: 'Pari',
    dangDan: 'in vantaggio',

    soLieuTieuDe: 'Dati dal vivo',
    a1Validator: 'A1 — validatori collegati',
    a1Chain: 'A1 — L1 in funzione',
    a1Block: 'A1 — blocco C-Chain',
    c1Vang: 'C1 — non raggiungibile',
    c1VangMoTa:
      'Serve l’URL REST Cosmos di C1 (porta 1317). La tabella funziona comunque: il lato A1 è dato ' +
      'dal vivo, il lato C1 è un giudizio architetturale come i criteri restanti.',
    dangDo: 'misurazione…',
    khongDo: 'impossibile misurare',
  },

  faucet: {
    tieuDe: 'Ottieni token di test',
    moTa:
      'LOVE9 sulla testnet A1 non ha valore reale — esiste perché tu possa pagare il gas durante le ' +
      'prove. Inserisci un indirizzo wallet e te ne inviamo subito un po’.',
    nhanDiaChi: 'Il tuo indirizzo wallet',
    goiYDiaChi: '0x… (40 caratteri esadecimali)',
    nutXin: 'Inviami i token',
    dangGui: 'Invio…',
    danChoDiaChi: 'Incolla l’indirizzo wallet che deve ricevere i token. Premi “Aggiungi la rete al wallet” qui sopra se non l’hai ancora fatto.',
    themMang: 'Aggiungi la rete al wallet',
    themMangXong: 'Aggiunta al wallet',
    themMangTuChoi: 'Hai premuto rifiuta nel wallet. Premi di nuovo se vuoi aggiungere la rete.',
    themMangLoi: 'Il tuo wallet non è riuscito ad aggiungere la rete. Aggiungila a mano con le impostazioni qui accanto — e invia al team la riga sottostante:',
    khongCoVi: 'Nessun wallet trovato in questo browser. Installa MetaMask e ricarica la pagina.',
    hanMucConLai: 'Quota rimanente',
    hanMucCachDoc: '{con}/{tong} richieste ogni {gio} ore',
    hanMucHet: 'Hai esaurito tutta la tua quota. Riprova tra {phut} minuti.',
    hanMucKhongDoc: 'Impossibile leggere la tua quota — puoi comunque fare richiesta, semplicemente non saprai quante ne restano.',
    thanhCong: 'Inviati {so} {kyHieu} a {diaChi}',
    xemGiaoDich: 'Vedi la transazione',
    thongSoMang: 'Impostazioni di rete',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Simbolo',
    thongSoThapPhan: 'Decimali',
    thongSoExplorer: 'Explorer',
    thapPhanGiaiThich:
      'I wallet mostrano 18 decimali perché la C-Chain esegue l’EVM. Sulla P/X-Chain LOVE9 si conta ' +
      'con 9 decimali. Una sola moneta, due scale — non due token diversi.',
    loiChung: 'Invio non riuscito. {chiTiet}',
  },

  chonNgonNgu: {
    nhan: 'Lingua',
    mayDich: 'automatica',
    mayDichGiaiThich: 'Solo la versione vietnamita è stata verificata da una persona. Le altre traduzioni sono automatiche e possono contenere errori — la versione inglese è la fonte di riferimento.',
    chuaCo: 'non ancora disponibile',
  },

  loi: {
    khongKetNoi: 'Impossibile raggiungere la rete',
    khongKetNoiMoTa: 'La rete potrebbe essere occupata, oppure la tua connessione è caduta.',
    trongRong: 'Qui non c’è ancora nulla',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'Questa pagina non esiste',
    moTa:
      'L’indirizzo che hai aperto non esiste su 9Chain Testnet A1. ' +
      'Potrebbe essere stato rinominato, oppure l’URL potrebbe aver perso qualche carattere nella copia.',
    dayLaGi: 'Le tre pagine più usate:',
    nhanNav: 'Dove andare adesso',
    veTrangChu: 'Torna alla home',
    diFaucet: 'Ottieni token di test',
    diDeChain: 'Avvia la tua catena',
    timGiaoDich: 'Cerchi una transazione o un indirizzo? Controlla l’hash e riprova.',
  },
};

export default it;
