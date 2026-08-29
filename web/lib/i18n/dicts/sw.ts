import type { Tu } from '../en';

/**
 * Kiswahili — tafsiri ya mashine, haijakaguliwa na binadamu.
 * Lugha ya chanzo ni Kiingereza (`../en.ts`); zikitofautiana, toleo la Kiingereza ndilo sahihi.
 *
 * 🔴 Sehemu hizi tatu zisilainishwe: `reGenesis.*` (mtandao utafutwa),
 * `deChain.soatMoTa` (mlango wa njia moja), `chainCuaToi.thuHoiY*` (kubatilisha hakurudishi jina).
 * Zinasema "kabisa" na "haiwezi kubadilishwa" ili mtu asipoteze mali akidhani inaweza kurudishwa.
 */
export const sw: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'Mtandao wa majaribio wa umma wa 9Chain — mtandao huru unaoendeshwa kwa injini ya Avalanche',
    tagTitle: 'mtandao huru kwenye injini ya Avalanche',
    viTuChoi: 'Ulikataa ombi kwenye pochi yako. Hakuna kilichobadilika.',
    dangTai: 'Inapakia…',
    thuLai: 'Jaribu tena',
    saoChep: 'Nakili',
    daChep: 'Imenakiliwa',
    dong: 'Funga',
    moMenu: 'Fungua menyu',
    dongMenu: 'Funga menyu',
    chuyenSangToi: 'Badilisha kwenda hali ya giza',
    chuyenSangSang: 'Badilisha kwenda hali ya mwanga',
    boQuaToiNoiDung: 'Rukia hadi maudhui makuu',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',

    bang: 'A1 ilijengwa upya tarehe {ngay}. Kila salio na kila mnyororo vilivyoundwa kabla ya tarehe hiyo havipo tena.',
    bangNut: 'Maana yake ni nini',
    nhan: 'Imejengwa upya',

    tieuDe: 'A1 ilijengwa upya tarehe {ngay}',
    moTa:
      'Mtandao wa majaribio wa A1 umejengwa upya kuanzia kizuizi 0. Minyororo, salio na historia ya ' +
      'miamala vilivyoundwa kabla ya tarehe hiyo havipo tena — havijafichwa, vimetoweka. ' +
      'Ukurasa huu unaeleza unachokiona na unachopaswa kufanya.',

    thayGiTieuDe: 'Utakachokiona',
    thayGi1:
      'Pochi yako bado inaunganishwa, bado inaonyesha jina sahihi la mtandao na Chain ID ile ile ' +
      '{chainId} — hilo lilikusudiwa. Lakini salio lako litakuwa 0.',
    thayGi2:
      'Kila L1 uliyoizindua imetoweka kwenye orodha. Majina yao na Chain ID zao ziko huru tena, ' +
      'na mtu yeyote anaweza kuzichukua.',
    thayGi3:
      'Kama ulisaini muamala lakini hukuwahi kuutangaza, usiutangaze sasa — ' +
      'ni wa mtandao ambao haupo tena.',

    lamGiTieuDe: 'Unachopaswa kufanya',
    lamGi1: 'Omba tena tokeni za majaribio kwenye bomba. Vikomo vimewekwa upya kwa kila mtu.',
    lamGi2:
      'Ondoa kila L1 moja moja kwenye pochi yako — zina Chain ID zao wenyewe na sasa haziashirii ' +
      'popote. Mtandao mkuu wa A1 HAUHITAJI kuondolewa; mipangilio yake haijabadilika.',
    lamGi3: 'Zindua mnyororo wako tena ukiuhitaji. Mtu mwingine anaweza kuwa amechukua jina la zamani.',

    luuTieuDe: 'Kumbukumbu ya mtandao wa zamani',
    luuMoTa:
      'Hali ya mwisho ya mtandao kabla ya kujengwa upya ilihamishwa na hashi yake ikachapishwa, ' +
      'ili yeyote anayetaka kuthibitisha aweze kufanya hivyo.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'A1 itajengwa upya tarehe {ngay} — kila mnyororo, salio na muamala vilivyoundwa kabla ya hapo vitafutwa.',
    bangNut: 'Maelezo',
    nhan: 'Ujenzi upya unakuja',

    tieuDe: 'A1 itajengwa upya tarehe {ngay}',
    moTa:
      'Mtandao mzima wa majaribio wa A1 utajengwa upya kuanzia kizuizi 0. Kila kitu kilichoundwa kabla ' +
      'ya tarehe hiyo kitatoweka — hakitafichwa, bali hakitakuwapo tena. Ukurasa huu unaeleza kwa usahihi ' +
      'kitakachopotea na unachopaswa kufanya.',

    viSaoTieuDe: 'Kwa nini ujenzi upya ni lazima',
    viSao1:
      'Genesis ya mtandao haibadiliki. Hicho ndicho hasa kinachoufanya uaminike — hakuna mtu, wakiwemo ' +
      'walioujenga, anayeweza kubadilisha namba baada ya kuandikwa kwenye kizuizi 0.',
    viSao2:
      'Gharama yake: kubadilisha namba ndani ya genesis hakuachi njia nyingine isipokuwa kujenga upya ' +
      'mtandao kuanzia mwanzo. A1 iliongeza jumla ya usambazaji hadi 9,000,000,000 LOVE9, na safu nzima ' +
      'ya vigezo vya staking ilibidi ihesabiwe upya ili ilingane.',
    viSao3:
      'Huu ni mtandao wa majaribio, na kujengwa upya ni jambo linaloruhusiwa kwa mtandao wa majaribio. ' +
      'Kwa kweli ndiyo sababu mitandao ya majaribio ipo: ili mabadiliko kama haya yatokee hapa, wala si ' +
      'kwenye mtandao mkuu.',

    matTieuDe: 'Kitakachopotea',
    matMoTa: 'Kila kitu, bila ubaguzi:',
    mat1: 'Kila L1 iliyozinduliwa na watumiaji, ikiwemo minyororo inayofanya kazi vizuri kabisa.',
    mat2: 'Kila salio la LOVE9, pamoja na tokeni zilizopokelewa kutoka kwenye bomba.',
    mat3: 'Kila muamala, kila kizuizi, historia yote ya C-Chain, P-Chain na X-Chain.',
    mat4: 'Kila mthibitishaji na kila ukabidhi.',

    conTieuDe: 'Kitakachohifadhiwa',
    conMoTa:
      'Kabla ya kufutwa, mtandao mzima unaokufa utahamishwa pamoja na hashi iliyochapishwa, ili ' +
      'kumbukumbu ibaki inayoweza kuthibitishwa. Kilichotokea bado kitaweza kuchunguzwa, hata mtandao ' +
      'ulioendesha ukiwa hauko tena. Kiungo cha kumbukumbu kitawekwa hapa siku ya ujenzi upya.',

    lamTieuDe: 'Unachopaswa kufanya',
    lamTruoc: 'Kabla ya ujenzi upya:',
    lam1:
      'Usijenge sasa kitu chochote kwenye A1 kinachotegemea data kubaki. Kama unajaribu wazo tu, ' +
      'endelea — ila usichukulie mnyororo wa sasa kama hifadhi.',
    lamSau: 'Baada ya ujenzi upya:',
    lam2:
      'Ondoa kwenye pochi yako kila L1 uliyoiongeza — minyororo hiyo haipo tena, na pochi inayoiashiria ' +
      'itakaa tu bila kufanya kitu. Mtandao mkuu wa A1 hauhitaji kuondolewa: mipangilio yake haijabadilika.',
    lam3:
      'Kama pochi yako bado haina mtandao wa A1, iongeze kwa kitufe kilichopo kwenye ukurasa wa bomba ' +
      'badala ya kuandika mipangilio kwa mkono.',
    lam4: 'Omba tena tokeni kwenye bomba, na uzindue mnyororo wako tena ukiutaka.',

    imLangTieuDe: 'Pochi yako haitakuonya',
    imLangMoTa:
      'Mtandao mpya unabaki na Chain ID {chainId}, anwani ile ile ya RPC na jina lile lile la ule wa ' +
      'zamani. Hilo lilikusudiwa — ili kila hati na mwongozo vilivyokwisha chapishwa vibaki sahihi. ' +
      'Gharama yake ni kwamba pochi yako haina ishara yoyote kwamba imeunganishwa na mtandao tofauti. ' +
      'Kwa hiyo mambo mawili yaliyo hapa chini yatatokea kimyakimya.',
    imLang1:
      'Pochi yenye usanidi wa zamani bado itaunganishwa, bado itaonyesha jina sahihi la mtandao, na ' +
      'itaripoti salio la 0. Namba hiyo ni SAHIHI: tokeni zako za zamani hazipo tena, hazijafichwa. ' +
      'Huhitaji kuongeza mtandao upya — omba tu tokeni mpya kwenye bomba. Kama pochi ikiripoti muamala ' +
      'uliokwama au namba ya mfuatano isiyo sahihi, futa data ya shughuli ya mtandao huo kwenye pochi: ' +
      'bado inakumbuka hesabu ya miamala ya mnyororo uliokufa, ilhali mnyororo mpya unahesabu kuanzia 0.',
    imLang2:
      'Kama bado unashikilia muamala uliosainiwa ambao haukuwahi kutangazwa, uteme. Sahihi bado ni halali ' +
      'kwenye mtandao mpya, kwa sababu Chain ID haikubadilika. Utashindwa muda wote pochi ikiwa tupu — ' +
      'lakini mara tu utakapoomba tokeni kwenye bomba, utakuwa unaweza kutumika, na waweza kupita wakati ' +
      'usiotarajia.',

    lapTieuDe: 'Je, hili litatokea tena',
    lapMoTa:
      'Inawezekana. A1 bado ni mtandao wa majaribio, na hadi jamii itakapochagua mwelekeo wa mtandao mkuu ' +
      'kati ya A1 na C1, tunabaki na haki ya kujenga upya mtandao pale kitu ndani ya genesis kinapohitaji ' +
      'kubadilika. Tunachoahidi ni kukuambia mapema, na kusema wazi kitakachopotea.',

    daXayRaTieuDe: 'Tayari ilijengwa upya mara moja tarehe 2026-08-27',
    daXayRaMoTa:
      'A1 tayari ilijengwa upya mara moja tarehe 2026-08-27, kabla ya tarehe iliyo hapa chini. Kama ulikuwa na tokeni za majaribio kabla ya hapo, salio lako sasa ni 0 — hiyo ni sahihi, si hitilafu ya pochi yako. Hakuna mnyororo wa mtumiaji uliopotea: orodha ilikuwa na minyororo ya majaribio ya kiotomatiki pekee. Omba tena tokeni kwenye bomba.',
    ngayLuuY: 'Tarehe inaweza kusogezwa',
    ngayLuuYMoTa:
      'Tarehe {ngay} inategemea ukaguzi wa go/no-go uliotangulia. Ikisogezwa, tutabadilisha tarehe ' +
      'kwenye ukurasa huu badala ya kunyamaza.',
  },

  chanTrang: {
    dungThu: 'Jaribu',
    kham: 'Chunguza',
    veDuAn: 'Kuhusu',
    explorer: 'Kichunguzi cha 9Scan-A1',
    trangChinh: 'Tovuti kuu ya 9Chain',
    moTabMoi: '(inafunguka kwenye kichupo kipya)',
    nhanNav: 'Viungo vya chini ya ukurasa',
    reGenesis: 'Mpango wa kujenga upya mtandao',
  },

  dieuHuong: {
    trangChu: 'Mwanzo',
    faucet: 'Pata tokeni za majaribio',
    console: 'Zindua mnyororo',
    chainCuaToi: 'Minyororo yangu',
    bang: 'A1 ↔ C1',
    danhBa: 'Orodha ya L1',
    explorer: 'Kichunguzi',
    banGiao: 'Fungua 9Scan-A1 kwenye kichupo kipya',
  },

  trangChu: {
    nhanTestnet: 'Mtandao wa majaribio — tokeni hazina thamani halisi',
    nutChinh: 'Zindua mnyororo wako',
    nutPhu: 'Pata tokeni za majaribio kwanza',

    cTieuDe: 'Zindua mnyororo wako mwenyewe kwenye A1',
    cPhu: 'L1 yako mwenyewe, inayomilikiwa na pochi unayotumia kusaini, ikiendeshwa kikweli kwenye mtandao wa majaribio. Huchukua takriban dakika tatu.',
    cBangChuThich: 'Kila safu ni mnyororo halisi unaoendeshwa kwenye A1, wenye mmiliki wake.',
    cCot: 'Mnyororo',
    cCotKieu: 'Aina',
    cCotChu: 'Mmiliki',
    cMacDinh: 'chaguo-msingi la mfumo',
    cTrong: 'Hakuna L1 inayoendeshwa bado',
    cTrongMoTa: 'Ungekuwa wa kwanza. Orodha husasishwa mara tu mnyororo wako unapoanza kufanya kazi.',

    tuTo: 'Wathibitishaji wote 9 kwa sasa wanaendeshwa kwenye seva ile ile, kwa mtoa huduma yule yule — umegatuliwa katika ngazi ya itifaki, bado si katika ngazi ya miundombinu.',
    blockDungYen: 'Avalanche haitengenezi vizuizi vitupu, kwa hiyo urefu wa kizuizi kubaki palepale wakati hakuna anayefanya muamala ni jambo la kawaida. Kipimo cha uhai ni idadi ya wathibitishaji iliyo kando yake.',
  },

  soLieu: {
    tieuDe: 'Mtandao unafanya kazi',
    validator: 'Wathibitishaji walioungana',
    soL1: 'L1 zinazoendeshwa',
    chieuCao: 'Kizuizi cha C-Chain',
    dangDo: 'Inapima mtandao…',
    khongDo: 'Takwimu za mtandao hazikusomeka',
    khongDoMoTa: 'Ukurasa bado unafanya kazi — hii ni onyesho la hali tu.',
  },

  loadTest: {
    badge: 'Jaribio la mzigo',
    banner: 'Tunaendesha jaribio la mzigo la hadharani — miamala {tps} kwa sekunde, iliyotengenezwa nasi, si watumiaji halisi.',
    bannerLink: 'Tazama takwimu za moja kwa moja',
    title: 'Jaribio la mzigo la hadharani',
    intro: 'A1 ni mtandao mchanga wa majaribio wenye watumiaji halisi wachache sana, hivyo ukiachwa peke yake hautoi vitalu vyovyote karibu. Tunatengeneza mtiririko wa kudumu wa miamala ili mtandao ufanye kazi bila kukoma na uweze kuuona ukifanya kazi. Trafiki hii ni yetu. Si matumizi, na hatuihesabu kama matumizi — kila anwani inayoituma imeorodheshwa hapa chini ili uweze kuiondoa.',
    running: 'Inaendeshwa sasa',
    stopped: 'Haiendeshwi kwa sasa',
    stoppedWhy: 'Sababu iliyorekodiwa: {reason}',
    labelTps: 'Miamala kwa sekunde',
    labelBlockHeight: 'Kitalu cha C-Chain',
    labelSecondsPerBlock: 'Sekunde kwa kitalu',
    labelTotal: 'Miamala iliyothibitishwa tangu kuanza',
    labelUptime: 'Imeendeshwa kwa',
    committedNote: 'Takwimu hizi zinahesabiwa kutoka kwenye vitalu vyenyewe, si kutoka kile tulichojaribu kutuma. Muamala ambao mtandao uliukubali lakini haukuuweka kwenye kitalu hauhesabiwi hapa.',
    addressesTitle: 'Anwani tisa zinazotuma',
    addressesNote: 'Kila muamala kutoka anwani hizi umetengenezwa na mashine yetu. Zichuje ili uone shughuli halisi zilizopo.',
    measuring: 'Inasoma hali ya jaribio la mzigo…',
    notMeasured: 'Imeshindwa kusoma hali ya jaribio la mzigo',
    notMeasuredMore: 'Ukurasa bado unafanya kazi — hii ni onyesho la hali tu.',
  },

  deChain: {
    tieuDe: 'Zindua mnyororo wako',
    moTa:
      'L1 maalum, inayomilikiwa na pochi yako. Unasaini mara moja kuthibitisha wewe ni nani, unakagua, ' +
      'na mtandao hujenga mnyororo ndani ya takriban dakika tatu.',

    noiVi: 'Unganisha pochi',
    dangNoi: 'Inaunganisha…',
    kyDeVao: 'Ingia',
    dangKy: 'Inasubiri sahihi…',
    viCuaBan: 'Pochi yako',
    laChuChain: 'Mnyororo utakuwa wa pochi hii. Anwani hutokana na sahihi yako — hakuna anayeiandika.',
    khongCoVi: 'Hakuna pochi iliyopatikana kwenye kivinjari hiki. Sakinisha MetaMask kisha upakie ukurasa upya.',
    tuChoiKy: 'Ulikataa kusaini. Hakuna kilichoundwa.',
    doiVi: 'Tumia pochi nyingine',

    nhanTen: 'Jina la mnyororo',
    goiYTen: 'Kwa mfano: MyChain',
    moTaTen:
      'Herufi, tarakimu na nafasi. Herufi 2–32. Kwenye mtandao huu jina lililowahi kutumika halitolewi ' +
      'tena kamwe — hata kwa mnyororo uliobatilishwa.',
    tenXau: 'Jina linaweza kuwa na herufi, tarakimu na nafasi pekee, lenye urefu wa herufi 2–32.',
    nhanKieu: 'Aina ya mnyororo',
    moTaKieu: 'Ikishachaguliwa haibadiliki — genesis ya mnyororo haiwezi kuhaririwa.',
    conCho: 'Nafasi {con}/{tong} zimebaki',
    hetCho: 'Hakuna nafasi iliyobaki',
    hetChoMoTa:
      'Muundo wa sasa hufanya kila mthibitishaji afuatilie kila L1, na itifaki huondoa nodi inayotangaza ' +
      'zaidi ya subneti 16. Hiki ni kiwango kigumu na hakiwezi kupandishwa. Kubatilisha mnyororo hurudisha ' +
      'nafasi moja.',
    soatLai: 'Kagua kabla ya kuwasilisha',

    soatTieuDe: 'Ukaguzi — huu ni mlango wa njia moja',
    soatMoTa:
      'Genesis ya L1 iliyozinduliwa HAIBADILIKI. Baada ya hatua hii, jina, aina ya mnyororo na mmiliki ' +
      'haviwezi kubadilishwa — na kubatilisha pia hakutarudisha jina wala chain ID.',
    soatReGenesis:
      'Jambo moja zaidi la kujua kabla hujabonyeza: A1 hujenga upya mtandao mzima tarehe {ngay}. ' +
      'Mnyororo unaouzindua leo utafutwa pamoja na mtandao wa zamani — hautafichwa, utatoweka.',
    soatTen: 'Jina la mnyororo',
    soatKieu: 'Aina ya mnyororo',
    soatChu: 'Mmiliki',
    soatQuayLai: 'Rudi na uhariri',
    soatDongY: 'Nimekagua — zindua mnyororo',

    dangDe: 'Inazindua mnyororo “{ten}”',
    dangDeMoTa:
      'Nodi huanzishwa upya MOJA BAADA YA NYINGINE ili mtandao usipoteze akidi kamwe — ndiyo maana ni ' +
      'polepole, na hilo limekusudiwa. Usifunge kichupo; ukikifunga, mnyororo bado utajengwa.',
    conKhoang: 'Zimebaki takriban dakika {phut}',
    dangChuanBi: 'Inajiandaa…',

    xongTieuDe: 'Imekamilika — mnyororo “{ten}” unafanya kazi',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Ongeza mnyororo kwenye pochi',
    xongDaThem: 'Umeongezwa kwenye pochi',
    xongKichHoat: 'Washa mnyororo (fungua kizuizi 1)',
    xongDaKichHoat: 'Umewashwa',
    xongDangKichHoat: 'Inasubiri pochi…',
    xongThemViLoi: 'Mnyororo haukuweza kuongezwa kwenye pochi yako. {chiTiet}',
    xongKichHoatLoi: 'Mnyororo haukuweza kuwashwa. {chiTiet}',

    deTiep: 'Zindua mnyororo mwingine',
    loiDe: 'Mnyororo haukuweza kuzinduliwa. {chiTiet}',
    loiKhongRo: 'Mnyororo haukuonekana kwenye orodha baada ya kazi kukamilika.',
    luuYTieuDe: 'Muamala wa kwanza kwenye mnyororo mpya',
    luuYCachLam:
      'Usiamini kadirio la gesi kwa muamala wa kwanza. Njia rahisi zaidi ya kufungua kizuizi 1 ni ' +
      'uhamisho wa kawaida — bonyeza “Washa mnyororo” hapa chini.',
  },

  chainCuaToi: {
    tieuDe: 'Minyororo yangu',
    moTa: 'L1 zinazomilikiwa na pochi uliyotumia kuingia. Zinaweza kubatilishwa, lakini soma onyo kwanza.',
    noiVi: 'Unganisha pochi yako ili kuona minyororo yako',
    trongTieuDe: 'Pochi hii bado haimiliki mnyororo wowote',
    trongMoTa: 'Zindua mmoja kisha urudi — utaonekana hapa mara moja.',
    trongNut: 'Zindua mnyororo wako',

    cotChain: 'Mnyororo',
    cotKieu: 'Aina',
    cotSong: 'Hali',
    cotViec: '',

    songDo: 'Wathibitishaji {so}',
    songDangDo: 'inapima',
    songKhongDo: 'haikupimika',
    songGiaiThich: 'Hupimwa kwa idadi ya wathibitishaji wa subneti, si kwa urefu wa kizuizi.',
    khongValidator: 'Wathibitishaji 0',
    khongValidatorMoTa:
      'Mnyororo huu HAUWEZI kukamilisha muamala wowote: subneti haina wathibitishaji. Bado hujibu wito ' +
      'wa RPC na pochi bado huunganishwa, kwa hiyo hakuna dalili nyingine inayoonekana.',

    thongSo: 'Mipangilio ya pochi',
    themVaoVi: 'Ongeza kwenye pochi',
    daThemVaoVi: 'Umeongezwa',
    themViLoi: 'Haikuweza kuongezwa kwenye pochi yako. {chiTiet}',

    thuHoi: 'Batilisha',
    thuHoiTieuDe: 'Batilisha “{ten}”?',
    thuHoiY1: 'Mnyororo huacha mara moja kutoa RPC na hutoweka kwenye orodha ya umma.',
    thuHoiY2:
      'Kubatilisha HAKUFUTI subneti kwenye P-Chain — kilichoundwa hapo hakiwezi kuondolewa muda wote ' +
      'mtandao huu unapoendelea kufanya kazi. Pia hakuondoi mtandao kwenye pochi za watu waliokwisha ' +
      'ongeza mnyororo huu.',
    thuHoiY3:
      'Jina na Chain ID hubaki vimehifadhiwa na HAVITOLEWI KAMWE tena kwa mtu yeyote kwenye mtandao huu. ' +
      'Kutoa tena Chain ID kungeruhusu pochi ya mtumiaji wa zamani kuashiria kimyakimya mnyororo wa mtu ' +
      'mwingine.',
    thuHoiY4: 'Kwa kubadilishana, nafasi moja kati ya 15 hurudishwa.',
    thuHoiGoNhan: 'Andika jina la mnyororo kwa usahihi ili kuthibitisha',
    thuHoiSaiTen: 'Hilo halilingani na jina la mnyororo.',
    thuHoiXacNhan: 'Batilisha kabisa',
    thuHoiHuy: 'Ghairi',
    thuHoiDangChay: 'Inabatilisha “{ten}” — takriban dakika tatu',
    thuHoiXong: '“{ten}” imebatilishwa. Nafasi {con}/{tong} zimebaki.',
    thuHoiLoi: 'Haikuweza kubatilishwa. {chiTiet}',
    thuHoiKhongRo: 'Mnyororo bado uko kwenye orodha baada ya kazi kukamilika.',

    daThuHoi: 'Imebatilishwa',
    daThuHoiMoTa: 'Jina na Chain ID hubaki vimehifadhiwa kwenye mtandao huu.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — ulinganisho',
    moTa:
      '9Chain huendesha mitandao MIWILI ya majaribio ya bidhaa ile ile kwa pamoja, ikitofautiana kwa ' +
      'injini: A1 kwenye injini ya Avalanche, C1 kwenye injini ya Cosmos. Jedwali hili hunakili ' +
      'ubadilishanaji kati ya njia mbili, limechapishwa ili yeyote aweze kulipinga — upande wa C1 bado ' +
      'hauna vipimo vya moja kwa moja.',

    tuChamTieuDe: 'Alama zilizo hapa chini ni TATHMINI BINAFSI ya timu, si vipimo huru',
    tuChamMoTa:
      'Safuwima ya "jinsi kilivyopimwa" inaeleza jinsi kila kigezo kilivyokaguliwa. Kigezo chochote kisicho ' +
      'na kipimo chenye tarehe ni hukumu ya usanifu, si data. Uzito wa vigezo unauamua wewe — alama ' +
      'hufuata.',

    cotSo: '#',
    cotTieuChi: 'Kigezo',
    cotLoai: 'Aina',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Uzito',
    loaiKienTruc: 'usanifu',
    loaiSong: 'data ya moja kwa moja',

    tongDiem: 'Jumla ya alama kwa uzito wako',
    hoaNhau: 'Sare',
    dangDan: 'inaongoza',

    soLieuTieuDe: 'Data ya moja kwa moja',
    a1Validator: 'A1 — wathibitishaji walioungana',
    a1Chain: 'A1 — L1 zinazoendeshwa',
    a1Block: 'A1 — kizuizi cha C-Chain',
    c1Vang: 'C1 — haifikiki',
    c1VangMoTa:
      'URL ya Cosmos REST ya C1 (mlango 1317) inahitajika. Jedwali bado linafanya kazi: upande wa A1 ni ' +
      'data ya moja kwa moja, upande wa C1 ni hukumu ya usanifu kama vigezo vingine vilivyobaki.',
    dangDo: 'inapima…',
    khongDo: 'haikupimika',
  },

  faucet: {
    tieuDe: 'Pata tokeni za majaribio',
    moTa:
      'LOVE9 kwenye mtandao wa majaribio wa A1 haina thamani halisi — ipo ili uweze kulipia gesi ' +
      'unapojaribu. Weka anwani ya pochi nasi tutatuma kiasi mara moja.',
    nhanDiaChi: 'Anwani ya pochi yako',
    goiYDiaChi: '0x… (herufi 40 za hex)',
    nutXin: 'Nitumie tokeni',
    dangGui: 'Inatuma…',
    danChoDiaChi: 'Bandika anwani ya pochi inayopaswa kupokea tokeni. Bonyeza “Ongeza mtandao kwenye pochi” hapo juu kama hujafanya hivyo.',
    themMang: 'Ongeza mtandao kwenye pochi',
    themMangXong: 'Umeongezwa kwenye pochi',
    themMangTuChoi: 'Ulibonyeza kataa kwenye pochi yako. Bonyeza tena ukitaka kuongeza mtandao.',
    themMangLoi: 'Pochi yako haikuweza kuongeza mtandao. Uongeze kwa mkono ukitumia mipangilio iliyo kando — na utumie timu mstari ulio hapa chini:',
    khongCoVi: 'Hakuna pochi iliyopatikana kwenye kivinjari hiki. Sakinisha MetaMask kisha upakie ukurasa upya.',
    hanMucConLai: 'Kiasi kilichobaki',
    hanMucCachDoc: 'Maombi {con}/{tong} kwa kila saa {gio}',
    hanMucHet: 'Umetumia kiasi chako chote. Jaribu tena baada ya dakika {phut}.',
    hanMucKhongDoc: 'Kiasi chako hakikusomeka — bado unaweza kuomba, ila hutajua kimebaki kiasi gani.',
    thanhCong: 'Zimetumwa {so} {kyHieu} kwenda {diaChi}',
    xemGiaoDich: 'Tazama muamala',
    thongSoMang: 'Mipangilio ya mtandao',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Alama',
    thongSoThapPhan: 'Desimali',
    thongSoExplorer: 'Kichunguzi',
    thapPhanGiaiThich:
      'Pochi huonyesha desimali 18 kwa sababu C-Chain huendesha EVM. Kwenye P/X-Chain, LOVE9 huhesabiwa ' +
      'kwa desimali 9. Sarafu moja, vipimo viwili — si tokeni mbili tofauti.',
    loiChung: 'Haikuweza kutumwa. {chiTiet}',
  },

  chonNgonNgu: {
    nhan: 'Lugha',
    mayDich: 'mashine',
    mayDichGiaiThich: 'Toleo la Kivietinamu pekee ndilo lililokaguliwa na binadamu. Tafsiri nyingine zimefanywa na mashine na zaweza kuwa na makosa — toleo la Kiingereza ndilo chanzo cha ukweli.',
    chuaCo: 'bado haipatikani',
  },

  loi: {
    khongKetNoi: 'Mtandao haukufikika',
    khongKetNoiMoTa: 'Mtandao waweza kuwa na shughuli nyingi, au muunganisho wako umekatika.',
    trongRong: 'Bado hakuna kitu hapa',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'Ukurasa huu haupo',
    moTa:
      'Anwani uliyoifungua haipo kwenye 9Chain Testnet A1. ' +
      'Yawezekana ilibadilishwa jina, au URL ilipoteza herufi chache wakati wa kunakiliwa.',
    dayLaGi: 'Kurasa tatu zinazotumika zaidi:',
    nhanNav: 'Uende wapi sasa',
    veTrangChu: 'Rudi mwanzo',
    diFaucet: 'Pata tokeni za majaribio',
    diDeChain: 'Zindua mnyororo wako',
    timGiaoDich: 'Unatafuta muamala au anwani? Kagua hashi kisha ujaribu tena.',
  },
};

export default sw;
