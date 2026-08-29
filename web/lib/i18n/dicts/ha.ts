import type { Tu } from '../en';

/**
 * Hausa — fassarar na'ura, ba a bincika ta da mutum ba.
 * Harshen asali shine Turanci (`../en.ts`); idan aka sami bambanci, sigar Turanci ce ta tabbata.
 *
 * 🔴 Kada a laushe waɗannan wurare guda uku: `reGenesis.*` (za a share hanyar sadarwa),
 * `deChain.soatMoTa` (ƙofa ta hanya ɗaya), `chainCuaToi.thuHoiY*` (janyewa ba ya mayar da suna).
 * Suna cewa "har abada" da "ba za a iya canzawa ba" don kada wani ya rasa dukiyarsa yana zaton
 * ana iya mayar da ita.
 */
export const ha: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'Hanyar sadarwa ta gwaji ta jama’a ta 9Chain — hanyar sadarwa mai zaman kanta da ke gudana a injin Avalanche',
    tagTitle: 'hanyar sadarwa mai zaman kanta a injin Avalanche',
    viTuChoi: 'Ka ƙi buƙatar a cikin walat ɗinka. Babu abin da ya canza.',
    dangTai: 'Ana loda…',
    thuLai: 'Sake gwadawa',
    saoChep: 'Kwafa',
    daChep: 'An kwafa',
    dong: 'Rufe',
    moMenu: 'Buɗe menu',
    dongMenu: 'Rufe menu',
    chuyenSangToi: 'Canja zuwa yanayin duhu',
    chuyenSangSang: 'Canja zuwa yanayin haske',
    boQuaToiNoiDung: 'Tsallake zuwa babban abun ciki',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',

    bang: 'An sake gina A1 a {ngay}. Duk wani ma’auni da sarƙa da aka ƙirƙira kafin wannan ranar ba su nan kuma.',
    bangNut: 'Menene ma’anar wannan',
    nhan: 'An sake ginawa',

    tieuDe: 'An sake gina A1 a {ngay}',
    moTa:
      'An sake gina hanyar gwaji ta A1 daga toshe 0. Sarƙoƙi, ma’aunai da tarihin mu’amaloli da aka ' +
      'ƙirƙira kafin wannan ranar ba su nan kuma — ba a ɓoye su ba, sun ɓace. ' +
      'Wannan shafin yana bayyana abin da kake gani da abin da ya kamata ka yi.',

    thayGiTieuDe: 'Abin da za ka gani',
    thayGi1:
      'Walat ɗinka na ci gaba da haɗuwa, na ci gaba da nuna sunan hanyar sadarwa daidai da Chain ID ' +
      'iri ɗaya {chainId} — an yi haka da gangan. Amma ma’aunin ka zai zama 0.',
    thayGi2:
      'Duk L1 da ka ƙaddamar ya ɓace daga jerin. Sunayensu da Chain ID ɗinsu sun sake zama a sake, ' +
      'kuma kowa na iya ɗaukar su.',
    thayGi3:
      'Idan ka sa hannu kan mu’amala amma ba ka taɓa watsa ta ba, kada ka watsa ta yanzu — ' +
      'ta hanyar sadarwa ce da ba ta nan kuma.',

    lamGiTieuDe: 'Abin da ya kamata ka yi',
    lamGi1: 'Sake neman alamun gwaji daga famfon. An sake saita iyaka ga kowa.',
    lamGi2:
      'Cire kowace L1 ɗaya bayan ɗaya daga walat ɗinka — suna da Chain ID nasu kuma yanzu ba sa nuna ' +
      'ko’ina. Babbar hanyar sadarwa ta A1 BA TA buƙatar cirewa; saitunanta ba su canza ba.',
    lamGi3: 'Sake ƙaddamar da sarƙarka idan kana buƙatarta. Wataƙila wani ya riga ya ɗauki tsohon sunan.',

    luuTieuDe: 'Adana tsohuwar hanyar sadarwa',
    luuMoTa:
      'An fitar da yanayin ƙarshe na hanyar sadarwa kafin sake ginawa aka kuma buga hashi nata, ' +
      'don duk wanda ke son bincika ya iya yi.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'Za a sake gina A1 a {ngay} — duk wata sarƙa, ma’auni da mu’amala da aka ƙirƙira kafin nan za a share su.',
    bangNut: 'Cikakken bayani',
    nhan: 'Sake ginawa na zuwa',

    tieuDe: 'Za a sake gina A1 a {ngay}',
    moTa:
      'Za a sake gina duk hanyar gwaji ta A1 daga toshe 0. Duk abin da aka ƙirƙira kafin wannan ranar ' +
      'zai ɓace — ba a ɓoye shi ba, sai dai ba zai ƙara wanzuwa ba. Wannan shafin yana faɗi daidai abin ' +
      'da za a rasa da abin da ya kamata ka yi.',

    viSaoTieuDe: 'Me ya sa sake ginawa ya zama dole',
    viSao1:
      'Genesis na hanyar sadarwa ba ya canzawa. Wannan ne ainihin abin da ke sa ta abin dogaro — babu ' +
      'wanda zai iya canza lamba bayan an rubuta ta cikin toshe 0, har da waɗanda suka gina ta.',
    viSao2:
      'Farashin haka: canza lamba a cikin genesis ba ya barin wani zaɓi sai sake gina hanyar sadarwa ' +
      'daga farko. A1 ta ɗaga jimillar samarwa zuwa 9,000,000,000 LOVE9, kuma dole a sake ƙididdige ' +
      'dukkan kewayon sigogin staking don su dace.',
    viSao3:
      'Wannan hanyar gwaji ce, kuma sake ginawa abu ne da aka yarda wa hanyar gwaji ta yi. Hakika shi ' +
      'ya sa hanyoyin gwaji suke: don irin waɗannan canje-canje su faru a nan, ba a babbar hanyar sadarwa ba.',

    matTieuDe: 'Abin da za a rasa',
    matMoTa: 'Komai, ba tare da wani banda ba:',
    mat1: 'Duk L1 da masu amfani suka ƙaddamar, har da sarƙoƙin da ke gudana lafiya ƙalau.',
    mat2: 'Duk ma’aunin LOVE9, har da alamun da aka karɓa daga famfon.',
    mat3: 'Kowace mu’amala, kowane toshe, duk tarihin C-Chain, P-Chain da X-Chain.',
    mat4: 'Kowane mai tabbatarwa da kowane wakilci.',

    conTieuDe: 'Abin da za a adana',
    conMoTa:
      'Kafin sharewa, za a fitar da duk hanyar sadarwa mai mutuwa tare da buga hashi, don bayanan su ' +
      'ci gaba da yiwuwar tabbatarwa. Abin da ya faru zai ci gaba da yiwuwar bincike, ko da hanyar ' +
      'sadarwa da ta gudanar da shi ba ta nan. Za a saka mahaɗin adanawa a nan ranar sake ginawa.',

    lamTieuDe: 'Abin da ya kamata ka yi',
    lamTruoc: 'Kafin sake ginawa:',
    lam1:
      'Kada ka gina komai a A1 yanzu da ya dogara ga bayanai su wanzu. Idan kana gwada wani ra’ayi, ' +
      'ci gaba — kawai kada ka ɗauki sarƙar yanzu a matsayin wurin ajiya.',
    lamSau: 'Bayan sake ginawa:',
    lam2:
      'Cire daga walat ɗinka kowace L1 da ka ƙara — waɗannan sarƙoƙin ba su nan kuma, kuma walat da ke ' +
      'nuna su zai tsaya cak kawai. Babbar hanyar sadarwa ta A1 ba ta buƙatar cirewa: saitunanta ba su ' +
      'canza ba.',
    lam3:
      'Idan walat ɗinka bai riga ya sami hanyar sadarwa ta A1 ba, ƙara ta da maɓallin da ke shafin ' +
      'famfon maimakon buga saitunan da hannu.',
    lam4: 'Sake neman alamu daga famfon, sannan ka sake ƙaddamar da sarƙarka idan kana so.',

    imLangTieuDe: 'Walat ɗinka ba zai gargaɗe ka ba',
    imLangMoTa:
      'Sabuwar hanyar sadarwa tana riƙe da Chain ID {chainId}, adireshin RPC iri ɗaya da suna iri ɗaya ' +
      'da tsohuwar. An yi haka da gangan — don kowace takarda da jagora da aka riga aka buga su ci gaba ' +
      'da zama daidai. Farashinsa shine walat ɗinka ba shi da wata alama ko kaɗan cewa ya haɗu da wata ' +
      'hanyar sadarwa daban. Saboda haka abubuwa biyu da ke ƙasa za su faru shiru.',
    imLang1:
      'Walat mai tsohon saiti na ci gaba da haɗuwa, na ci gaba da nuna sunan hanyar sadarwa daidai, ' +
      'kuma zai ba da rahoton ma’auni 0. Wannan lambar DAIDAI ce: tsofaffin alamunka ba su nan kuma, ' +
      'ba a ɓoye su ba. Ba sai ka sake ƙara hanyar sadarwa ba — kawai ka nemi sabbin alamu daga famfon. ' +
      'Idan walat ya ba da rahoton mu’amala da ta makale ko lambar jeri mara daidai, share bayanan ' +
      'ayyukan wannan hanyar sadarwa a cikin walat: har yanzu yana tuna adadin mu’amalar sarƙar da ta ' +
      'mutu, alhali sabuwar sarƙa tana ƙidaya daga 0.',
    imLang2:
      'Idan har yanzu kana riƙe da mu’amala mai sa hannu da ba a taɓa watsa ta ba, ka jefar da ita. ' +
      'Sa hannun na nan da inganci a sabuwar hanyar sadarwa, domin Chain ID bai canza ba. Za ta gaza ' +
      'muddin walat ɗin babu komai — amma da zarar ka nemi alamu daga famfon, sai ta zama mai yiwuwar ' +
      'kashewa, kuma tana iya wucewa a lokacin da ba ka tsammani ba.',

    lapTieuDe: 'Shin wannan zai sake faruwa',
    lapMoTa:
      'Yana yiwuwa. A1 har yanzu hanyar gwaji ce, kuma har sai al’umma ta zaɓi hanyar babbar sadarwa ' +
      'tsakanin A1 da C1, muna riƙe da haƙƙin sake gina hanyar sadarwa duk lokacin da wani abu a cikin ' +
      'genesis dole ya canza. Abin da muke alƙawari shine mu sanar da kai tun kafin lokaci, mu kuma faɗi ' +
      'a fili abin da za a rasa.',

    daXayRaTieuDe: 'An riga an sake gina ta sau ɗaya a 2026-08-27',
    daXayRaMoTa:
      'An riga an sake gina A1 sau ɗaya a 2026-08-27, kafin ranar da ke ƙasa. Idan ka riƙe alamun gwaji kafin nan, ma’aunin ka yanzu 0 ne — hakan daidai ne, ba lalacewar walat ɗinka ba ce. Babu wata sarƙar mai amfani da ta ɓace: jerin yana ɗauke da sarƙoƙin gwaji na atomatik kaɗai. Sake neman alamu daga famfon.',
    ngayLuuY: 'Ranar tana iya jinkirtawa',
    ngayLuuYMoTa:
      'Ranar {ngay} ta dogara ga binciken go/no-go da ya gabata. Idan ta jinkirta, za mu canza ranar ' +
      'a wannan shafin maimakon mu yi shiru.',
  },

  chanTrang: {
    dungThu: 'Gwada',
    kham: 'Bincika',
    veDuAn: 'Game da mu',
    explorer: 'Mai bincike na 9Scan-A1',
    trangChinh: 'Babban shafin 9Chain',
    moTabMoi: '(yana buɗewa a sabon shafi)',
    nhanNav: 'Hanyoyin ƙasan shafi',
    reGenesis: 'Shirin sake gina hanyar sadarwa',
  },

  dieuHuong: {
    trangChu: 'Gida',
    faucet: 'Karɓi alamun gwaji',
    console: 'Ƙaddamar da sarƙa',
    chainCuaToi: 'Sarƙoƙina',
    bang: 'A1 ↔ C1',
    danhBa: 'Jerin L1',
    explorer: 'Mai bincike',
    banGiao: 'Buɗe 9Scan-A1 a sabon shafi',
  },

  trangChu: {
    nhanTestnet: 'Hanyar gwaji — alamun ba su da wata daraja ta gaske',
    nutChinh: 'Ƙaddamar da sarƙarka',
    nutPhu: 'Fara da karɓar alamun gwaji',

    cTieuDe: 'Ƙaddamar da sarƙarka a A1',
    cPhu: 'L1 naka, mallakin walat ɗin da kake sa hannu da shi, tana gudana da gaske a hanyar gwaji. Tana ɗaukar kusan minti uku.',
    cBangChuThich: 'Kowane layi sarƙa ce ta gaske da ke gudana a A1, tare da mai ita.',
    cCot: 'Sarƙa',
    cCotKieu: 'Nau’i',
    cCotChu: 'Mai ita',
    cMacDinh: 'tsoho na tsarin',
    cTrong: 'Babu wata L1 da ke gudana tukuna',
    cTrongMoTa: 'Kai za ka zama na farko. Jerin yana sabuntawa da zarar sarƙarka ta fara aiki.',

    tuTo: 'Masu tantancewa 9 daga cikin 10 suna aiki a kan sabar guda ɗaya da mai bayarwa guda ɗaya; na goma yana aiki a wurin wani mai bayarwa daban. An rarraba shi a matakin ka’ida, kuma a matakin more rayuwa yanzu ne kawai ake farawa.',
    blockDungYen: 'Avalanche ba ya samar da toshe fanko, don haka tsayin toshe da ya tsaya cak yayin da babu wanda ke yin mu’amala abu ne na yau da kullum. Ma’aunin rayuwa shine adadin masu tabbatarwa da ke gefensa.',
  },

  soLieu: {
    tieuDe: 'Hanyar sadarwa tana aiki',
    validator: 'Masu tabbatarwa da suka haɗu',
    soL1: 'L1 masu gudana',
    chieuCao: 'Toshen C-Chain',
    dangDo: 'Ana auna hanyar sadarwa…',
    khongDo: 'Ba a iya karanta ƙididdigar hanyar sadarwa ba',
    khongDoMoTa: 'Shafin na ci gaba da aiki — wannan nuni na yanayi ne kawai.',
  },

  loadTest: {
    badge: 'Gwajin nauyi',
    banner: 'Muna gudanar da gwajin nauyi a fili — ma’amaloli {tps} a cikin dakika, mu ne muka ƙirƙire su, ba masu amfani na gaskiya ba.',
    bannerLink: 'Duba lambobin kai tsaye',
    title: 'Gwajin nauyi a fili',
    intro: 'A1 sabuwar hanyar sadarwa ce ta gwaji mai ƙalilan masu amfani na gaskiya, don haka idan aka bar ta kaɗai kusan ba ta samar da wani shingen bayanai. Muna ƙirƙirar ci gaba da ma’amaloli domin hanyar sadarwa ta ci gaba da aiki kuma ku iya ganin tana aiki. Wannan zirga-zirgar tamu ce. Ba amfani ba ne, kuma ba ma ƙidaya ta a matsayin amfani — kowane adireshi da ke aika ta yana ƙasa, domin ku iya cire shi.',
    running: 'Yana gudana yanzu',
    stopped: 'Ba ya gudana a yanzu',
    stoppedWhy: 'Dalilin da aka rubuta: {reason}',
    labelTps: 'Ma’amaloli a dakika',
    labelBlockHeight: 'Shingen C-Chain',
    labelSecondsPerBlock: 'Dakiku kowane shinge',
    labelTotal: 'Ma’amalolin da aka tabbatar tun farawa',
    labelUptime: 'Yana gudana tsawon',
    committedNote: 'An ƙidaya waɗannan lambobi daga shingayen kansu, ba daga abin da muka yi ƙoƙarin aikawa ba. Ma’amalar da hanyar sadarwa ta karɓa amma ba a taɓa saka ta cikin shinge ba ba a ƙidaya ta a nan.',
    addressesTitle: 'Adiresoshi tara masu aikawa',
    addressesNote: 'Kowace ma’amala daga waɗannan adireshi na’urarmu ce ta ƙirƙira. Tace su domin ganin ainihin ayyukan da ake yi.',
    measuring: 'Ana karanta halin gwajin nauyi…',
    notMeasured: 'An kasa karanta halin gwajin nauyi',
    notMeasuredMore: 'Shafin na ci gaba da aiki — wannan nuni na yanayi ne kawai.',
  },

  deChain: {
    tieuDe: 'Ƙaddamar da sarƙarka',
    moTa:
      'L1 keɓaɓɓe, mallakin walat ɗinka. Kana sa hannu sau ɗaya don tabbatar da wanene kai, ka duba, ' +
      'sannan hanyar sadarwa tana gina sarƙar cikin kusan minti uku.',

    noiVi: 'Haɗa walat',
    dangNoi: 'Ana haɗawa…',
    kyDeVao: 'Shiga',
    dangKy: 'Ana jiran sa hannu…',
    viCuaBan: 'Walat ɗinka',
    laChuChain: 'Sarƙar za ta zama ta wannan walat. Adireshin yana fitowa daga sa hannunka — babu wanda ke bugawa da hannu.',
    khongCoVi: 'Ba a sami walat a wannan burauzar ba. Girka MetaMask sannan ka sake loda shafin.',
    tuChoiKy: 'Ka ƙi sa hannu. Ba a ƙirƙiri komai ba.',
    doiVi: 'Yi amfani da wani walat',

    nhanTen: 'Sunan sarƙa',
    goiYTen: 'Misali: MyChain',
    moTaTen:
      'Haruffa, lambobi da sarari. Haruffa 2–32. A wannan hanyar sadarwa, sunan da aka taɓa amfani da ' +
      'shi ba a sake bayar da shi ko kaɗan — ko da ga sarƙar da aka janye.',
    tenXau: 'Sunan zai iya ƙunsar haruffa, lambobi da sarari kaɗai, tsawon haruffa 2–32.',
    nhanKieu: 'Nau’in sarƙa',
    moTaKieu: 'Da zarar an zaɓa, ya tsaya — ba a iya gyara genesis na sarƙa.',
    conCho: 'Sauran wurare {con}/{tong}',
    hetCho: 'Babu sauran wuri',
    hetChoMoTa:
      'Tsarin na yanzu yana sa kowane mai tabbatarwa ya bi kowace L1, kuma ka’idar tana fitar da kumburin ' +
      'da ya bayyana fiye da subnet 16. Wannan iyaka ce mai tsauri kuma ba a iya ɗaga ta. Janye sarƙa ' +
      'yana mayar da wuri ɗaya.',
    soatLai: 'Duba kafin ka aika',

    soatTieuDe: 'Dubawa — wannan ƙofa ce ta hanya ɗaya',
    soatMoTa:
      'Genesis na L1 da aka ƙaddamar BA YA CANZAWA. Bayan wannan matakin, ba a iya canza suna, nau’in ' +
      'sarƙa da mai ita — kuma janyewa ma ba zai mayar da suna da chain ID ba.',
    soatReGenesis:
      'Wani abu kuma da ya kamata ka sani kafin ka danna: A1 tana sake gina duk hanyar sadarwa a {ngay}. ' +
      'Sarƙar da ka ƙaddamar yau za a share ta tare da tsohuwar hanyar sadarwa — ba a ɓoye ta ba, za ta ɓace.',
    soatTen: 'Sunan sarƙa',
    soatKieu: 'Nau’in sarƙa',
    soatChu: 'Mai ita',
    soatQuayLai: 'Koma ka gyara',
    soatDongY: 'Na duba — ƙaddamar da sarƙar',

    dangDe: 'Ana ƙaddamar da sarƙar “{ten}”',
    dangDeMoTa:
      'Kumburai suna sake farawa ƊAYA BAYAN ƊAYA don hanyar sadarwa kada ta taɓa rasa ƙuruma — shi ya sa ' +
      'yake jinkiri, kuma an yi haka da gangan. Kada ka rufe shafin; ko ka rufe, za a ci gaba da gina sarƙar.',
    conKhoang: 'Sauran kusan minti {phut}',
    dangChuanBi: 'Ana shirya…',

    xongTieuDe: 'An gama — sarƙar “{ten}” tana gudana',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Ƙara sarƙa a walat',
    xongDaThem: 'An ƙara a walat',
    xongKichHoat: 'Kunna sarƙa (buɗe toshe 1)',
    xongDaKichHoat: 'An kunna',
    xongDangKichHoat: 'Ana jiran walat…',
    xongThemViLoi: 'Ba a iya ƙara sarƙar a walat ɗinka ba. {chiTiet}',
    xongKichHoatLoi: 'Ba a iya kunna sarƙar ba. {chiTiet}',

    deTiep: 'Ƙaddamar da wata sarƙa',
    loiDe: 'Ba a iya ƙaddamar da sarƙar ba. {chiTiet}',
    loiKhongRo: 'Sarƙar ba ta bayyana a jerin ba bayan aikin ya kammala.',
    luuYTieuDe: 'Mu’amala ta farko a sabuwar sarƙa',
    luuYCachLam:
      'Kada ka amince da ƙiyasin gas na mu’amala ta farko. Hanya mafi arha ta buɗe toshe 1 ita ce ' +
      'canja wuri na yau da kullum — danna “Kunna sarƙa” a ƙasa.',
  },

  chainCuaToi: {
    tieuDe: 'Sarƙoƙina',
    moTa: 'L1 ɗin da walat ɗin da ka shiga da shi ke mallaka. Ana iya janye su, amma ka fara karanta gargaɗin.',
    noiVi: 'Haɗa walat ɗinka don ganin sarƙoƙinka',
    trongTieuDe: 'Wannan walat bai mallaki wata sarƙa ba tukuna',
    trongMoTa: 'Ƙaddamar da ɗaya sannan ka dawo — za ta bayyana nan take.',
    trongNut: 'Ƙaddamar da sarƙarka',

    cotChain: 'Sarƙa',
    cotKieu: 'Nau’i',
    cotSong: 'Yanayi',
    cotViec: '',

    songDo: 'Masu tabbatarwa {so}',
    songDangDo: 'ana auna',
    songKhongDo: 'ba a iya auna ba',
    songGiaiThich: 'Ana auna ta adadin masu tabbatarwa na subnet, ba ta tsayin toshe ba.',
    khongValidator: 'Masu tabbatarwa 0',
    khongValidatorMoTa:
      'Wannan sarƙar BA ZA TA IYA kammala kowace mu’amala ba: subnet ɗin ba shi da masu tabbatarwa. ' +
      'Har yanzu tana amsa kiran RPC kuma walat na ci gaba da haɗuwa, don haka babu wata alama a bayyane.',

    thongSo: 'Saitunan walat',
    themVaoVi: 'Ƙara a walat',
    daThemVaoVi: 'An ƙara',
    themViLoi: 'Ba a iya ƙara ta a walat ɗinka ba. {chiTiet}',

    thuHoi: 'Janye',
    thuHoiTieuDe: 'A janye “{ten}”?',
    thuHoiY1: 'Sarƙar tana daina bayar da RPC nan take kuma tana ɓacewa daga jerin jama’a.',
    thuHoiY2:
      'Janyewa BA YA share subnet a P-Chain — abin da aka ƙirƙira a can ba za a iya cire shi ba muddin ' +
      'wannan hanyar sadarwa tana gudana. Haka kuma ba ya cire hanyar sadarwa daga walat ɗin mutanen da ' +
      'suka riga suka ƙara wannan sarƙar.',
    thuHoiY3:
      'Suna da Chain ID suna nan a ajiye kuma BA A TAƁA sake bayar da su ga kowa a wannan hanyar sadarwa. ' +
      'Sake bayar da Chain ID zai bar walat ɗin tsohon mai amfani ya nuna sarƙar wani mutum a shiru.',
    thuHoiY4: 'A madadin haka, ana mayar da wuri ɗaya cikin 15.',
    thuHoiGoNhan: 'Buga sunan sarƙar daidai don tabbatarwa',
    thuHoiSaiTen: 'Wannan bai dace da sunan sarƙar ba.',
    thuHoiXacNhan: 'Janye har abada',
    thuHoiHuy: 'Soke',
    thuHoiDangChay: 'Ana janye “{ten}” — kusan minti uku',
    thuHoiXong: 'An janye “{ten}”. Sauran wurare {con}/{tong}.',
    thuHoiLoi: 'Ba a iya janyewa ba. {chiTiet}',
    thuHoiKhongRo: 'Sarƙar na nan a jerin bayan aikin ya kammala.',

    daThuHoi: 'An janye',
    daThuHoiMoTa: 'Suna da Chain ID suna nan a ajiye a wannan hanyar sadarwa.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — kwatanci',
    moTa:
      '9Chain tana gudanar da hanyoyin gwaji GUDA BIYU na kaya ɗaya gefe da gefe, waɗanda suka bambanta ' +
      'a injin: A1 a injin Avalanche, C1 a injin Cosmos. Wannan tebur yana rubuta cinikin da ke tsakanin ' +
      'hanyoyin biyu, an buga shi don kowa ya iya jayayya da shi — ɓangaren C1 bai riga ya sami ma’aunin ' +
      'kai tsaye ba.',

    tuChamTieuDe: 'Maki da ke ƙasa ƘUNGIYA CE TA KIMANTA KANTA, ba a auna su da kansu ba',
    tuChamMoTa:
      'Ginshiƙin "yadda aka auna" yana faɗi yadda aka duba kowace ma’auni. Duk ma’aunin da ba shi da ' +
      'awo mai kwanan wata hukunci ne na gine-gine, ba bayanai ba. Kai ne za ka saita nauyi — maki na bin ' +
      'hakan.',

    cotSo: '#',
    cotTieuChi: 'Ma’auni',
    cotLoai: 'Nau’i',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Nauyi',
    loaiKienTruc: 'gine-gine',
    loaiSong: 'bayanai kai tsaye',

    tongDiem: 'Jimillar maki bisa nauyinka',
    hoaNhau: 'Kunnen doki',
    dangDan: 'na kan gaba',

    soLieuTieuDe: 'Bayanai kai tsaye',
    a1Validator: 'A1 — masu tabbatarwa da suka haɗu',
    a1Chain: 'A1 — L1 masu gudana',
    a1Block: 'A1 — toshen C-Chain',
    c1Vang: 'C1 — ba a iya isa gare ta ba',
    c1VangMoTa:
      'Ana buƙatar adireshin Cosmos REST na C1 (tashar 1317). Teburin na ci gaba da aiki: ɓangaren A1 ' +
      'bayanai ne kai tsaye, ɓangaren C1 kuwa hukunci ne na gine-gine kamar sauran ma’aunai.',
    dangDo: 'ana auna…',
    khongDo: 'ba a iya auna ba',
  },

  faucet: {
    tieuDe: 'Karɓi alamun gwaji',
    moTa:
      'LOVE9 a hanyar gwaji ta A1 ba shi da daraja ta gaske — yana nan ne domin ka iya biyan gas yayin ' +
      'gwaji. Shigar da adireshin walat, mu kuwa mu aika maka wasu nan take.',
    nhanDiaChi: 'Adireshin walat ɗinka',
    goiYDiaChi: '0x… (haruffa hex 40)',
    nutXin: 'Aiko min da alamu',
    dangGui: 'Ana aikawa…',
    danChoDiaChi: 'Manna adireshin walat da ya kamata ya karɓi alamun. Danna “Ƙara hanyar sadarwa a walat” a sama idan ba ka riga ka yi ba.',
    themMang: 'Ƙara hanyar sadarwa a walat',
    themMangXong: 'An ƙara a walat',
    themMangTuChoi: 'Ka danna ƙi a walat ɗinka. Sake danna idan kana son a ƙara hanyar sadarwa.',
    themMangLoi: 'Walat ɗinka bai iya ƙara hanyar sadarwa ba. Ƙara ta da hannu ta amfani da saitunan da ke gefe — sannan ka aika wa ƙungiyar layin da ke ƙasa:',
    khongCoVi: 'Ba a sami walat a wannan burauzar ba. Girka MetaMask sannan ka sake loda shafin.',
    hanMucConLai: 'Sauran ƙima',
    hanMucCachDoc: 'Buƙatu {con}/{tong} a kowace awa {gio}',
    hanMucHet: 'Ka yi amfani da duk ƙimarka. Sake gwadawa bayan minti {phut}.',
    hanMucKhongDoc: 'Ba a iya karanta ƙimarka ba — har yanzu kana iya nema, sai dai ba za ka san nawa ya rage ba.',
    thanhCong: 'An aika {so} {kyHieu} zuwa {diaChi}',
    xemGiaoDich: 'Duba mu’amalar',
    thongSoMang: 'Saitunan hanyar sadarwa',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Alama',
    thongSoThapPhan: 'Ma’auni na goma',
    thongSoExplorer: 'Mai bincike',
    thapPhanGiaiThich:
      'Walat suna nuna ma’auni na goma 18 domin C-Chain tana gudanar da EVM. A P/X-Chain, ana ƙidaya ' +
      'LOVE9 da ma’auni na goma 9. Tsabar kuɗi ɗaya, ma’auni biyu — ba alamu biyu daban ba.',
    loiChung: 'Ba a iya aikawa ba. {chiTiet}',
  },

  chonNgonNgu: {
    nhan: 'Harshe',
    mayDich: 'na’ura',
    mayDichGiaiThich: 'Sigar Vietnamese kaɗai ce mutum ya duba. Sauran fassarorin na’ura ce ta yi su kuma suna iya zama ba daidai ba — sigar Turanci ita ce tushen gaskiya.',
    chuaCo: 'ba ta samu ba tukuna',
  },

  loi: {
    khongKetNoi: 'Ba a iya isa ga hanyar sadarwa ba',
    khongKetNoiMoTa: 'Wataƙila hanyar sadarwa tana da aiki mai yawa, ko kuma haɗinka ya yanke.',
    trongRong: 'Babu komai a nan tukuna',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'Wannan shafin babu shi',
    moTa:
      'Adireshin da ka buɗe babu shi a 9Chain Testnet A1. ' +
      'Wataƙila an canza masa suna, ko kuma URL ɗin ya rasa wasu haruffa yayin kwafi.',
    dayLaGi: 'Shafuka uku da aka fi amfani da su:',
    nhanNav: 'Ina za ka je yanzu',
    veTrangChu: 'Koma gida',
    diFaucet: 'Karɓi alamun gwaji',
    diDeChain: 'Ƙaddamar da sarƙarka',
    timGiaoDich: 'Kana neman mu’amala ko adireshi? Duba hashi sannan ka sake gwadawa.',
  },
};

export default ha;
