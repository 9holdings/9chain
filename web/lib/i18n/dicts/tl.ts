import type { Tu } from '../en';

/**
 * Tagalog — salin ng makina, hindi pa nasusuri ng tao.
 * Ang pinagmulang wika ay Ingles (`../en.ts`); kapag may pagkakaiba, ang Ingles ang masusunod.
 *
 * 🔴 Huwag palambutin ang tatlong ito: `reGenesis.*` (buburahin ang network),
 * `deChain.soatMoTa` (pintuang isang direksyon), `chainCuaToi.thuHoiY*` (hindi ibinabalik ng
 * pagbawi ang pangalan). Sinasabi ng mga ito ang "permanente" at "hindi na mababago" upang
 * walang mawalan ng ari-arian dahil sa akalang maibabalik pa ito.
 */
export const tl: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'Pampublikong testnet ng 9Chain — isang malayang network na tumatakbo sa makinang Avalanche',
    tagTitle: 'isang malayang network sa makinang Avalanche',
    viTuChoi: 'Tinanggihan mo ang kahilingan sa iyong wallet. Walang nabago.',
    dangTai: 'Naglo-load…',
    thuLai: 'Subukan muli',
    saoChep: 'Kopyahin',
    daChep: 'Nakopya',
    dong: 'Isara',
    moMenu: 'Buksan ang menu',
    dongMenu: 'Isara ang menu',
    chuyenSangToi: 'Lumipat sa madilim na mode',
    chuyenSangSang: 'Lumipat sa maliwanag na mode',
    boQuaToiNoiDung: 'Lumaktaw sa pangunahing nilalaman',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',

    bang: 'Muling itinayo ang A1 noong {ngay}. Ang bawat balanse at chain na nalikha bago ang petsang iyon ay wala na.',
    bangNut: 'Ano ang ibig sabihin nito',
    nhan: 'Muling itinayo',

    tieuDe: 'Muling itinayo ang A1 noong {ngay}',
    moTa:
      'Muling itinayo ang test network na A1 mula sa block 0. Ang mga chain, balanse at kasaysayan ng ' +
      'transaksyon na nalikha bago ang petsang iyon ay wala na — hindi nakatago, kundi tuluyang nawala. ' +
      'Ipinapaliwanag ng pahinang ito kung ano ang nakikita mo at kung ano ang dapat gawin.',

    thayGiTieuDe: 'Ano ang makikita mo',
    thayGi1:
      'Kumokonekta pa rin ang iyong wallet, ipinapakita pa rin ang tamang pangalan ng network at ang ' +
      'parehong Chain ID {chainId} — sinadya iyon. Ngunit magiging 0 ang iyong balanse.',
    thayGi2:
      'Nawala na sa direktoryo ang bawat L1 na inilunsad mo. Malaya na muli ang kanilang mga pangalan ' +
      'at Chain ID, at maaari na itong kunin ninuman.',
    thayGi3:
      'Kung may nilagdaan kang transaksyon ngunit hindi mo kailanman ipinadala, huwag mo nang ipadala ' +
      'ngayon — pag-aari iyon ng isang network na wala na.',

    lamGiTieuDe: 'Ano ang kailangan mong gawin',
    lamGi1: 'Humingi muli ng test token sa faucet. Na-reset na ang mga limitasyon para sa lahat.',
    lamGi2:
      'Alisin sa iyong wallet ang bawat indibidwal na L1 — may sarili silang Chain ID at wala na silang ' +
      'itinuturo ngayon. HINDI kailangang alisin ang pangunahing network na A1; hindi nagbago ang mga ' +
      'setting nito.',
    lamGi3: 'Ilunsad muli ang iyong chain kung kailangan mo. Maaaring nakuha na ng iba ang lumang pangalan.',

    luuTieuDe: 'Arkibo ng lumang network',
    luuMoTa:
      'Na-export ang huling kalagayan ng network bago ang muling pagtatayo at inilathala ang hash nito, ' +
      'para masuri ito ng sinumang gustong magsiyasat.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'Muling itatayo ang A1 sa {ngay} — buburahin ang bawat chain, balanse at transaksyong nalikha bago noon.',
    bangNut: 'Mga detalye',
    nhan: 'Paparating na muling pagtatayo',

    tieuDe: 'Muling itatayo ang A1 sa {ngay}',
    moTa:
      'Muling itatayo ang buong test network na A1 mula sa block 0. Mawawala ang lahat ng nalikha bago ' +
      'ang petsang iyon — hindi itatago, kundi tuluyang hindi na iiral. Sinasabi ng pahinang ito nang ' +
      'tiyak kung ano ang mawawala at kung ano ang dapat mong gawin.',

    viSaoTieuDe: 'Bakit kailangan ang muling pagtatayo',
    viSao1:
      'Hindi mababago ang genesis ng isang network. Iyon mismo ang dahilan kung bakit ito mapagkakatiwalaan ' +
      '— walang sinuman, pati na ang mga gumawa nito, ang makapagbabago ng isang numero kapag naisulat ' +
      'na ito sa block 0.',
    viSao2:
      'Ang halaga niyon: ang pagbabago ng isang numero sa loob ng genesis ay walang ibang naiiwang ' +
      'pagpipilian kundi ang muling itayo ang network mula sa simula. Itinaas ng A1 ang kabuuang supply ' +
      'sa 9,000,000,000 LOVE9, at kinailangang muling kalkulahin ang buong saklaw ng mga parameter ng ' +
      'staking para tumugma dito.',
    viSao3:
      'Isa itong testnet, at ang muling pagtatayo ay bagay na pinapayagan sa isang testnet. Sa katunayan ' +
      'iyon mismo ang dahilan kung bakit may mga testnet: para dito mangyari ang ganitong mga pagbabago, ' +
      'hindi sa mainnet.',

    matTieuDe: 'Ano ang mawawala',
    matMoTa: 'Lahat, walang eksepsiyon:',
    mat1: 'Bawat L1 na inilunsad ng gumagamit, kasama ang mga chain na maayos na tumatakbo.',
    mat2: 'Bawat balanse ng LOVE9, kasama ang mga token na natanggap mula sa faucet.',
    mat3: 'Bawat transaksyon, bawat block, ang buong kasaysayan ng C-Chain, P-Chain at X-Chain.',
    mat4: 'Bawat validator at bawat delegasyon.',

    conTieuDe: 'Ano ang itatago',
    conMoTa:
      'Bago ang pagbura, ie-export ang buong naghihingalong network kasama ang inilathalang hash, para ' +
      'manatiling masusuri ang talaan. Masisiyasat pa rin ang nangyari kahit wala na ang network na ' +
      'nagpatakbo nito. Ilalathala rito ang link ng arkibo sa mismong araw ng muling pagtatayo.',

    lamTieuDe: 'Ano ang kailangan mong gawin',
    lamTruoc: 'Bago ang muling pagtatayo:',
    lam1:
      'Huwag magtayo ngayon sa A1 ng anumang umaasa na mananatili ang data. Kung sinusubukan mo lang ang ' +
      'isang ideya, tuloy lang — huwag mo lang ituring na imbakan ang kasalukuyang chain.',
    lamSau: 'Pagkatapos ng muling pagtatayo:',
    lam2:
      'Alisin sa iyong wallet ang bawat L1 na idinagdag mo — wala na ang mga chain na iyon, at ang wallet ' +
      'na nakaturo sa kanila ay basta na lang mananatiling tahimik. Hindi kailangang alisin ang ' +
      'pangunahing network na A1: hindi nagbago ang mga setting nito.',
    lam3:
      'Kung wala pa sa iyong wallet ang network na A1, idagdag ito gamit ang button sa pahina ng faucet ' +
      'sa halip na i-type nang mano-mano ang mga setting.',
    lam4: 'Humingi muli ng token sa faucet, at ilunsad muli ang iyong chain kung gusto mo.',

    imLangTieuDe: 'Hindi ka bibigyan ng babala ng iyong wallet',
    imLangMoTa:
      'Pinananatili ng bagong network ang Chain ID {chainId}, ang parehong RPC address at ang parehong ' +
      'pangalan ng luma. Sinadya iyon — para manatiling tama ang bawat dokumento at gabay na nailathala ' +
      'na. Ang kapalit: wala ni katiting na senyas ang iyong wallet na kakakonekta lang nito sa ibang ' +
      'network. Kaya tahimik na mangyayari ang dalawang bagay sa ibaba.',
    imLang1:
      'Ang wallet na may lumang configuration ay kumokonekta pa rin, ipinapakita pa rin ang tamang ' +
      'pangalan ng network, at mag-uulat ng balanseng 0. TAMA ang numerong iyon: wala na ang iyong ' +
      'lumang mga token, hindi sila nakatago. Hindi mo kailangang idagdag muli ang network — humingi ' +
      'lang ng bagong token sa faucet. Kung mag-ulat ang wallet ng natigil na transaksyon o maling ' +
      'sequence number, burahin sa wallet ang activity data ng network na iyon: naaalala pa nito ang ' +
      'bilang ng transaksyon ng isang patay nang chain, samantalang ang bagong chain ay nagbibilang ' +
      'mula 0.',
    imLang2:
      'Kung may hawak ka pang nilagdaang transaksyon na hindi kailanman naipadala, itapon mo na. Wasto ' +
      'pa rin ang lagda sa bagong network dahil hindi nagbago ang Chain ID. Mabibigo ito habang walang ' +
      'laman ang wallet — ngunit sa mismong sandaling humingi ka ng token sa faucet ay magiging magagamit ' +
      'na ito, at maaaring dumaan sa oras na hindi mo inaasahan.',

    lapTieuDe: 'Mauulit ba ito',
    lapMoTa:
      'Posible. Testnet pa rin ang A1, at hangga\'t hindi pumipili ang komunidad ng direksyon ng mainnet ' +
      'sa pagitan ng A1 at C1, pinanghahawakan namin ang karapatang muling itayo ang network kapag may ' +
      'kailangang baguhin sa loob ng genesis. Ang ipinapangako namin ay sabihin ito sa inyo nang maaga, ' +
      'at sabihin nang tahasan kung ano ang mawawala.',

    daXayRaTieuDe: 'Muli nang naitayo minsan noong 2026-08-27',
    daXayRaMoTa:
      'Muli nang naitayo ang A1 minsan noong 2026-08-27, bago ang petsang nasa ibaba. Kung may hawak kang test token bago niyon, 0 na ang iyong balanse ngayon — tama iyon, hindi ito depekto ng iyong wallet. Walang chain ng gumagamit ang nawala: mga awtomatikong test chain lamang ang nasa direktoryo. Humingi muli ng token sa faucet.',
    ngayLuuY: 'Maaaring maantala ang petsa',
    ngayLuuYMoTa:
      'Nakasalalay ang petsang {ngay} sa isang naunang go/no-go na pagsusuri. Kung maantala ito, ' +
      'babaguhin namin ang petsa sa pahinang ito sa halip na manahimik.',
  },

  chanTrang: {
    dungThu: 'Subukan',
    kham: 'Tuklasin',
    veDuAn: 'Tungkol dito',
    explorer: '9Scan-A1 explorer',
    trangChinh: 'Pangunahing site ng 9Chain',
    moTabMoi: '(bubukas sa bagong tab)',
    nhanNav: 'Mga link sa footer',
    reGenesis: 'Plano sa muling pagtatayo ng network',
  },

  dieuHuong: {
    trangChu: 'Home',
    faucet: 'Kumuha ng test token',
    console: 'Maglunsad ng chain',
    chainCuaToi: 'Aking mga chain',
    bang: 'A1 ↔ C1',
    danhBa: 'Direktoryo ng L1',
    explorer: 'Explorer',
    banGiao: 'Buksan ang 9Scan-A1 sa bagong tab',
  },

  trangChu: {
    nhanTestnet: 'Testnet — walang tunay na halaga ang mga token',
    nutChinh: 'Ilunsad ang iyong chain',
    nutPhu: 'Kumuha muna ng test token',

    cTieuDe: 'Ilunsad ang sarili mong chain sa A1',
    cPhu: 'Sarili mong L1, pag-aari ng wallet na ipinanglagda mo, talagang tumatakbo sa test network. Umaabot ng mga tatlong minuto.',
    cBangChuThich: 'Ang bawat hanay ay tunay na chain na tumatakbo sa A1, na may sariling may-ari.',
    cCot: 'Chain',
    cCotKieu: 'Uri',
    cCotChu: 'May-ari',
    cMacDinh: 'default ng sistema',
    cTrong: 'Wala pang L1 na tumatakbo',
    cTrongMoTa: 'Ikaw ang magiging una. Nag-a-update ang direktoryo sa oras na umandar ang iyong chain.',

    tuTo: 'Lahat ng 9 validator ay kasalukuyang tumatakbo sa iisang server, sa iisang provider — desentralisado sa antas ng protocol, hindi pa sa antas ng imprastraktura.',
    blockDungYen: 'Hindi gumagawa ng walang lamang block ang Avalanche, kaya normal lang na hindi gumagalaw ang taas ng block kapag walang nagtatransaksyon. Ang sukatan ng buhay ay ang bilang ng validator sa tabi nito.',
  },

  soLieu: {
    tieuDe: 'Aktibo ang network',
    validator: 'Mga nakakonektang validator',
    soL1: 'Mga tumatakbong L1',
    chieuCao: 'Block ng C-Chain',
    dangDo: 'Sinusukat ang network…',
    khongDo: 'Hindi nabasa ang istatistika ng network',
    khongDoMoTa: 'Gumagana pa rin ang pahina — ito lang ang pagpapakita ng katayuan.',
  },

  loadTest: {
    badge: 'Pagsubok sa load',
    banner: 'Nagpapatakbo kami ng pampublikong pagsubok sa load — {tps} transaksyon kada segundo, kami ang gumagawa nito, hindi tunay na gumagamit.',
    bannerLink: 'Tingnan ang live na datos',
    title: 'Pampublikong pagsubok sa load',
    intro: 'Bata pa ang A1 bilang test network at napakakaunti ng tunay na gumagamit, kaya kung iiwan mag-isa, halos walang block na nabubuo. Gumagawa kami ng tuloy-tuloy na daloy ng transaksyon para patuloy na gumana ang network at makita ninyo itong gumagana. Amin ang trapikong ito. Hindi ito paggamit at hindi rin namin binibilang bilang paggamit — nakalista sa ibaba ang bawat address na nagpapadala nito para mabawas ninyo.',
    running: 'Tumatakbo ngayon',
    stopped: 'Hindi tumatakbo ngayon',
    stoppedWhy: 'Naitalang dahilan: {reason}',
    labelTps: 'Transaksyon kada segundo',
    labelBlockHeight: 'Block ng C-Chain',
    labelSecondsPerBlock: 'Segundo kada block',
    labelTotal: 'Nakumpirmang transaksyon mula nang magsimula',
    labelUptime: 'Tumatakbo nang',
    committedNote: 'Mula mismo sa mga block binibilang ang mga numerong ito, hindi mula sa sinubukan naming ipadala. Ang transaksyong tinanggap ng network pero hindi kailanman isinama sa block ay hindi binibilang dito.',
    addressesTitle: 'Ang siyam na address na nagpapadala',
    addressesNote: 'Bawat transaksyon mula sa mga address na ito ay gawa ng makina namin. I-filter ang mga ito para makita ang tunay na aktibidad.',
    measuring: 'Binabasa ang katayuan ng pagsubok sa load…',
    notMeasured: 'Hindi mabasa ang katayuan ng pagsubok sa load',
    notMeasuredMore: 'Gumagana pa rin ang pahina — ito lang ang pagpapakita ng katayuan.',
  },

  deChain: {
    tieuDe: 'Ilunsad ang iyong chain',
    moTa:
      'Isang nakalaang L1, pag-aari ng iyong wallet. Isang beses kang lalagda para patunayan kung sino ' +
      'ka, susuriin mo, at itatayo ng network ang chain sa loob ng mga tatlong minuto.',

    noiVi: 'Ikonekta ang wallet',
    dangNoi: 'Kumokonekta…',
    kyDeVao: 'Mag-sign in',
    dangKy: 'Naghihintay ng lagda…',
    viCuaBan: 'Ang iyong wallet',
    laChuChain: 'Magiging pag-aari ng wallet na ito ang chain. Nagmumula ang address sa iyong lagda — walang nagta-type nito.',
    khongCoVi: 'Walang wallet na natagpuan sa browser na ito. Mag-install ng MetaMask at i-reload ang pahina.',
    tuChoiKy: 'Tumanggi kang lumagda. Walang nalikha.',
    doiVi: 'Gumamit ng ibang wallet',

    nhanTen: 'Pangalan ng chain',
    goiYTen: 'Halimbawa: MyChain',
    moTaTen:
      'Mga letra, numero at espasyo. 2–32 karakter. Sa network na ito, ang pangalang nagamit na ay hindi ' +
      'na muling ibinibigay — kahit para sa binawing chain.',
    tenXau: 'Maaari lamang maglaman ang pangalan ng mga letra, numero at espasyo, na may haba na 2–32 karakter.',
    nhanKieu: 'Uri ng chain',
    moTaKieu: 'Kapag napili na, nakapirmi na ito — hindi mae-edit ang genesis ng isang chain.',
    conCho: '{con}/{tong} puwang ang natitira',
    hetCho: 'Wala nang natitirang puwang',
    hetChoMoTa:
      'Sa kasalukuyang modelo, sinusubaybayan ng bawat validator ang bawat L1, at inaalis ng protocol ang ' +
      'node na nagdedeklara ng mahigit 16 subnet. Matigas na hangganan ito at hindi maaaring itaas. Ang ' +
      'pagbawi ng isang chain ay nagbabalik ng isang puwang.',
    soatLai: 'Suriin bago isumite',

    soatTieuDe: 'Pagsusuri — pintuang isang direksyon ito',
    soatMoTa:
      'HINDI MABABAGO ang genesis ng inilunsad nang L1. Pagkatapos ng hakbang na ito, hindi na mapapalitan ' +
      'ang pangalan, uri ng chain at may-ari — at hindi rin ibabalik ng pagbawi ang pangalan at chain ID.',
    soatReGenesis:
      'Isa pang dapat mong malaman bago pindutin: muling itatayo ng A1 ang buong network sa {ngay}. Ang ' +
      'chain na ilulunsad mo ngayon ay buburahin kasama ng lumang network — hindi itatago, kundi mawawala.',
    soatTen: 'Pangalan ng chain',
    soatKieu: 'Uri ng chain',
    soatChu: 'May-ari',
    soatQuayLai: 'Bumalik at baguhin',
    soatDongY: 'Nasuri ko na — ilunsad ang chain',

    dangDe: 'Inilulunsad ang chain na “{ten}”',
    dangDeMoTa:
      'ISA-ISANG nagre-restart ang mga node para hindi kailanman mawalan ng quorum ang network — kaya ito ' +
      'mabagal, at sinadya ito. Huwag isara ang tab; kung isara mo man, maitatayo pa rin ang chain.',
    conKhoang: 'Mga {phut} minuto na lang',
    dangChuanBi: 'Naghahanda…',

    xongTieuDe: 'Tapos na — tumatakbo na ang chain na “{ten}”',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Idagdag ang chain sa wallet',
    xongDaThem: 'Naidagdag sa wallet',
    xongKichHoat: 'I-activate ang chain (buksan ang block 1)',
    xongDaKichHoat: 'Na-activate',
    xongDangKichHoat: 'Naghihintay sa wallet…',
    xongThemViLoi: 'Hindi naidagdag ang chain sa iyong wallet. {chiTiet}',
    xongKichHoatLoi: 'Hindi na-activate ang chain. {chiTiet}',

    deTiep: 'Maglunsad ng isa pang chain',
    loiDe: 'Hindi nailunsad ang chain. {chiTiet}',
    loiKhongRo: 'Hindi lumitaw ang chain sa direktoryo pagkatapos matapos ang proseso.',
    luuYTieuDe: 'Ang unang transaksyon sa bagong chain',
    luuYCachLam:
      'Huwag pagkatiwalaan ang tantiya ng gas para sa unang transaksyon. Ang pinakamurang paraan para ' +
      'buksan ang block 1 ay ordinaryong paglilipat — pindutin ang “I-activate ang chain” sa ibaba.',
  },

  chainCuaToi: {
    tieuDe: 'Aking mga chain',
    moTa: 'Ang mga L1 na pag-aari ng wallet na ipinang-sign in mo. Maaari silang bawiin, ngunit basahin muna ang babala.',
    noiVi: 'Ikonekta ang iyong wallet para makita ang iyong mga chain',
    trongTieuDe: 'Wala pang chain ang wallet na ito',
    trongMoTa: 'Maglunsad ng isa at bumalik — agad itong lilitaw dito.',
    trongNut: 'Ilunsad ang iyong chain',

    cotChain: 'Chain',
    cotKieu: 'Uri',
    cotSong: 'Katayuan',
    cotViec: '',

    songDo: '{so} validator',
    songDangDo: 'sinusukat',
    songKhongDo: 'hindi masukat',
    songGiaiThich: 'Sinusukat sa bilang ng validator ng subnet, hindi sa taas ng block.',
    khongValidator: '0 validator',
    khongValidatorMoTa:
      'HINDI makakapagtapos ng anumang transaksyon ang chain na ito: walang validator ang subnet. ' +
      'Sumasagot pa rin ito sa mga tawag na RPC at kumokonekta pa rin ang mga wallet, kaya walang ibang ' +
      'nakikitang senyas.',

    thongSo: 'Mga setting ng wallet',
    themVaoVi: 'Idagdag sa wallet',
    daThemVaoVi: 'Naidagdag',
    themViLoi: 'Hindi ito naidagdag sa iyong wallet. {chiTiet}',

    thuHoi: 'Bawiin',
    thuHoiTieuDe: 'Bawiin ang “{ten}”?',
    thuHoiY1: 'Agad na hihinto ang chain sa paghahatid ng RPC at mawawala ito sa pampublikong direktoryo.',
    thuHoiY2:
      'HINDI binubura ng pagbawi ang subnet sa P-Chain — ang nalikha roon ay hindi maaalis hangga\'t ' +
      'tumatakbo ang network na ito. Hindi rin nito inaalis ang network sa wallet ng mga taong nakadagdag ' +
      'na ng chain na ito.',
    thuHoiY3:
      'Nananatiling nakalaan ang pangalan at Chain ID at HINDI KAILANMAN muling ibinibigay kaninuman sa ' +
      'network na ito. Ang muling pagbibigay ng Chain ID ay magpapahintulot sa wallet ng dating gumagamit ' +
      'na tahimik na tumuro sa chain ng iba.',
    thuHoiY4: 'Bilang kapalit, ibinabalik ang isa sa 15 puwang.',
    thuHoiGoNhan: 'I-type nang eksakto ang pangalan ng chain para kumpirmahin',
    thuHoiSaiTen: 'Hindi ito tumutugma sa pangalan ng chain.',
    thuHoiXacNhan: 'Bawiin nang permanente',
    thuHoiHuy: 'Kanselahin',
    thuHoiDangChay: 'Binabawi ang “{ten}” — mga tatlong minuto',
    thuHoiXong: 'Nabawi ang “{ten}”. {con}/{tong} puwang ang natitira.',
    thuHoiLoi: 'Hindi nabawi. {chiTiet}',
    thuHoiKhongRo: 'Nasa direktoryo pa rin ang chain pagkatapos matapos ang proseso.',

    daThuHoi: 'Nabawi',
    daThuHoiMoTa: 'Nananatiling nakalaan ang pangalan at Chain ID sa network na ito.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — paghahambing',
    moTa:
      'Nagpapatakbo ang 9Chain ng DALAWANG testnet ng iisang produkto nang magkatabi, na nagkakaiba sa ' +
      'makina: A1 sa makinang Avalanche, C1 sa makinang Cosmos. Itinatala ng talahanayang ito ang mga ' +
      'pagpapalitan sa pagitan ng dalawang direksyon, inilathala para may makapagtalo rito — wala pang ' +
      'live na sukat ang panig ng C1.',

    tuChamTieuDe: 'Ang mga marka sa ibaba ay SARILING PAGTATAYA ng koponan, hindi malayang sinukat',
    tuChamMoTa:
      'Sinasabi ng kolum na "paano ito sinukat" kung paano sinuri ang bawat pamantayan. Ang anumang ' +
      'pamantayang walang may-petsang sukat ay paghatol sa arkitektura, hindi datos. Ikaw ang magtatakda ' +
      'ng mga timbang — susunod ang marka.',

    cotSo: '#',
    cotTieuChi: 'Pamantayan',
    cotLoai: 'Uri',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Timbang',
    loaiKienTruc: 'arkitektura',
    loaiSong: 'live na datos',

    tongDiem: 'Kabuuang marka gamit ang iyong mga timbang',
    hoaNhau: 'Tabla',
    dangDan: 'nangunguna',

    soLieuTieuDe: 'Live na datos',
    a1Validator: 'A1 — mga nakakonektang validator',
    a1Chain: 'A1 — mga tumatakbong L1',
    a1Block: 'A1 — block ng C-Chain',
    c1Vang: 'C1 — hindi maabot',
    c1VangMoTa:
      'Kailangan ang Cosmos REST URL ng C1 (port 1317). Gumagana pa rin ang talahanayan: live na datos ' +
      'ang panig ng A1, samantalang paghatol sa arkitektura ang panig ng C1 tulad ng iba pang pamantayan.',
    dangDo: 'sinusukat…',
    khongDo: 'hindi masukat',
  },

  faucet: {
    tieuDe: 'Kumuha ng test token',
    moTa:
      'Walang tunay na halaga ang LOVE9 sa testnet ng A1 — umiiral ito para makabayad ka ng gas habang ' +
      'sumusubok. Maglagay ng address ng wallet at agad kaming magpapadala.',
    nhanDiaChi: 'Address ng iyong wallet',
    goiYDiaChi: '0x… (40 hex na karakter)',
    nutXin: 'Padalhan ako ng token',
    dangGui: 'Ipinapadala…',
    danChoDiaChi: 'I-paste ang address ng wallet na dapat tumanggap ng token. Pindutin ang “Idagdag ang network sa wallet” sa itaas kung hindi mo pa nagagawa.',
    themMang: 'Idagdag ang network sa wallet',
    themMangXong: 'Naidagdag sa wallet',
    themMangTuChoi: 'Pinindot mo ang tanggihan sa iyong wallet. Pindutin muli kung gusto mong idagdag ang network.',
    themMangLoi: 'Hindi naidagdag ng iyong wallet ang network. Idagdag ito nang mano-mano gamit ang mga setting sa tabi nito — at ipadala sa koponan ang linya sa ibaba:',
    khongCoVi: 'Walang wallet na natagpuan sa browser na ito. Mag-install ng MetaMask at i-reload ang pahina.',
    hanMucConLai: 'Natitirang quota',
    hanMucCachDoc: '{con}/{tong} kahilingan bawat {gio} oras',
    hanMucHet: 'Nagamit mo na ang buong quota mo. Subukan muli pagkatapos ng {phut} minuto.',
    hanMucKhongDoc: 'Hindi nabasa ang iyong quota — puwede ka pa ring humingi, hindi mo lang malalaman kung ilan ang natitira.',
    thanhCong: 'Naipadala ang {so} {kyHieu} sa {diaChi}',
    xemGiaoDich: 'Tingnan ang transaksyon',
    thongSoMang: 'Mga setting ng network',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Simbolo',
    thongSoThapPhan: 'Mga decimal',
    thongSoExplorer: 'Explorer',
    thapPhanGiaiThich:
      'Nagpapakita ang mga wallet ng 18 decimal dahil nagpapatakbo ng EVM ang C-Chain. Sa P/X-Chain, ' +
      'binibilang ang LOVE9 sa 9 decimal. Iisang barya, dalawang sukatan — hindi dalawang magkaibang token.',
    loiChung: 'Hindi naipadala. {chiTiet}',
  },

  chonNgonNgu: {
    nhan: 'Wika',
    mayDich: 'makina',
    mayDichGiaiThich: 'Ang bersiyong Vietnamese lamang ang nasuri ng tao. Salin ng makina ang iba at maaaring mali — ang bersiyong Ingles ang pinagmumulan ng katotohanan.',
    chuaCo: 'wala pa',
  },

  loi: {
    khongKetNoi: 'Hindi naabot ang network',
    khongKetNoiMoTa: 'Maaaring abala ang network, o naputol ang iyong koneksyon.',
    trongRong: 'Wala pang laman dito',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'Wala ang pahinang ito',
    moTa:
      'Ang address na binuksan mo ay wala sa 9Chain Testnet A1. ' +
      'Maaaring pinalitan ang pangalan nito, o nawalan ng ilang karakter ang URL nang kopyahin ito.',
    dayLaGi: 'Ang tatlong pinakaginagamit na pahina:',
    nhanNav: 'Saan susunod',
    veTrangChu: 'Balik sa home',
    diFaucet: 'Kumuha ng test token',
    diDeChain: 'Ilunsad ang iyong chain',
    timGiaoDich: 'Naghahanap ng transaksyon o address? Suriin ang hash at subukan muli.',
  },
};

export default tl;
