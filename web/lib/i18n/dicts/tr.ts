import type { Tu } from '../en';

/**
 * Türkçe — makine çevirisi, bir insan tarafından incelenmedi.
 * Kaynak dil İngilizcedir (`../en.ts`); farklılık halinde İngilizce sürüm geçerlidir.
 *
 * 🔴 Şu üç yer yumuşatılmamalı: `reGenesis.*` (ağ silinecek),
 * `deChain.soatMoTa` (tek yönlü kapı), `chainCuaToi.thuHoiY*` (iptal adı geri vermez).
 * Bunlar "kalıcı olarak" ve "değiştirilemez" der; kimse geri alınabilir sanıp varlığını
 * kaybetmesin diye.
 */
export const tr: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: "9Chain'in genel test ağı — Avalanche motorunda çalışan bağımsız bir ağ",
    tagTitle: 'Avalanche motorunda çalışan bağımsız bir ağ',
    viTuChoi: 'İsteği cüzdanınızda reddettiniz. Hiçbir şey değişmedi.',
    dangTai: 'Yükleniyor…',
    thuLai: 'Yeniden dene',
    saoChep: 'Kopyala',
    daChep: 'Kopyalandı',
    dong: 'Kapat',
    moMenu: 'Menüyü aç',
    dongMenu: 'Menüyü kapat',
    chuyenSangToi: 'Koyu moda geç',
    chuyenSangSang: 'Açık moda geç',
    boQuaToiNoiDung: 'Ana içeriğe geç',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',

    bang: 'A1, {ngay} tarihinde yeniden kuruldu. O tarihten önce oluşturulan her bakiye ve her zincir artık yok.',
    bangNut: 'Bu ne demek',
    nhan: 'Yeniden kuruldu',

    tieuDe: 'A1, {ngay} tarihinde yeniden kuruldu',
    moTa:
      'A1 test ağı blok 0’dan itibaren yeniden kuruldu. O tarihten önce oluşturulan zincirler, ' +
      'bakiyeler ve işlem geçmişi artık yok — gizlenmedi, ortadan kalktı. ' +
      'Bu sayfa ne gördüğünüzü ve ne yapmanız gerektiğini anlatır.',

    thayGiTieuDe: 'Ne göreceksiniz',
    thayGi1:
      'Cüzdanınız yine bağlanır, doğru ağ adını ve aynı Chain ID {chainId} değerini gösterir — ' +
      'bu bilinçliydi. Ama bakiyeniz 0 olacak.',
    thayGi2:
      'Başlattığınız her L1 dizinden silindi. Adları ve Chain ID’leri yeniden serbest; ' +
      'artık herkes onları alabilir.',
    thayGi3:
      'Bir işlemi imzaladıysanız ama hiç yayınlamadıysanız, şimdi yayınlamayın — ' +
      'o işlem artık var olmayan bir ağa ait.',

    lamGiTieuDe: 'Ne yapmanız gerekiyor',
    lamGi1: 'Musluktan yeniden test jetonu isteyin. Sınırlar herkes için sıfırlandı.',
    lamGi2:
      'Her bir L1’i cüzdanınızdan kaldırın — kendi Chain ID’leri var ve artık hiçbir yeri ' +
      'göstermiyorlar. Ana A1 ağını kaldırmanıza GEREK YOK; ayarları değişmedi.',
    lamGi3: 'Gerekiyorsa zincirinizi yeniden başlatın. Eski adı bir başkası almış olabilir.',

    luuTieuDe: 'Eski ağın arşivi',
    luuMoTa:
      'Yeniden kurulumdan önce ağın son durumu dışa aktarıldı ve özeti (hash) yayımlandı; ' +
      'böylece kontrol etmek isteyen herkes edebilir.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'A1, {ngay} tarihinde yeniden kurulacak — o tarihten önce oluşturulan her zincir, bakiye ve işlem silinecek.',
    bangNut: 'Ayrıntılar',
    nhan: 'Yeniden kurulum yaklaşıyor',

    tieuDe: 'A1, {ngay} tarihinde yeniden kurulacak',
    moTa:
      'A1 test ağının tamamı blok 0’dan itibaren yeniden kurulacak. O tarihten önce oluşturulan ' +
      'her şey gidecek — gizlenmeyecek, artık var olmayacak. Bu sayfa tam olarak neyin kaybolacağını ' +
      've ne yapmanız gerektiğini söyler.',

    viSaoTieuDe: 'Yeniden kurulum neden gerekli',
    viSao1:
      'Bir ağın genesis’i değiştirilemez. Onu güvenilir kılan da tam olarak budur — onu kuranlar ' +
      'dahil hiç kimse, blok 0’a yazıldıktan sonra bir sayıyı değiştiremez.',
    viSao2:
      'Bunun bedeli şu: genesis içindeki bir sayıyı değiştirmek, ağı sıfırdan yeniden kurmaktan ' +
      'başka seçenek bırakmaz. A1 toplam arzı 9.000.000.000 LOVE9’a çıkardı ve buna uyacak şekilde ' +
      'staking parametrelerinin tüm aralığı yeniden hesaplanmak zorunda kaldı.',
    viSao3:
      'Burası bir test ağı ve yeniden kurulmak bir test ağının hakkı. Aslında test ağları tam da ' +
      'bunun için var: böyle değişiklikler burada olsun, ana ağda değil.',

    matTieuDe: 'Ne kaybolacak',
    matMoTa: 'İstisnasız her şey:',
    mat1: 'Kullanıcıların başlattığı her L1 — gayet iyi çalışanlar dahil.',
    mat2: 'Her LOVE9 bakiyesi — musluktan alınan jetonlar dahil.',
    mat3: 'Her işlem, her blok, C-Chain, P-Chain ve X-Chain’in tüm geçmişi.',
    mat4: 'Her doğrulayıcı ve her delegasyon.',

    conTieuDe: 'Ne saklanacak',
    conMoTa:
      'Silmeden önce ölmekte olan ağın tamamı dışa aktarılacak ve özeti yayımlanacak; böylece kayıt ' +
      'doğrulanabilir kalacak. Onu çalıştıran ağ ortadan kalktıktan sonra bile olanlar kontrol ' +
      'edilebilecek. Arşiv bağlantısı yeniden kurulum günü burada paylaşılacak.',

    lamTieuDe: 'Ne yapmanız gerekiyor',
    lamTruoc: 'Yeniden kurulumdan önce:',
    lam1:
      'Şu anda A1 üzerinde verinin kalıcı olmasına bağlı bir şey inşa etmeyin. Bir fikri deniyorsanız ' +
      'buyurun — yeter ki mevcut zinciri depolama gibi görmeyin.',
    lamSau: 'Yeniden kurulumdan sonra:',
    lam2:
      'Eklediğiniz her L1’i cüzdanınızdan kaldırın — o zincirler artık yok ve onları gösteren bir ' +
      'cüzdan öylece bekler. Ana A1 ağını kaldırmaya gerek yok: ayarları değişmedi.',
    lam3:
      'Cüzdanınızda A1 ağı henüz yoksa, ayarları elle yazmak yerine musluk sayfasındaki düğmeyle ekleyin.',
    lam4: 'Musluktan yeniden jeton isteyin ve isterseniz zincirinizi yeniden başlatın.',

    imLangTieuDe: 'Cüzdanınız sizi uyarmayacak',
    imLangMoTa:
      'Yeni ağ, eskisiyle aynı Chain ID {chainId}, aynı RPC adresi ve aynı adı korur. Bu bilinçli — ' +
      'böylece daha önce yayımlanmış her belge ve kılavuz doğru kalır. Bedeli ise cüzdanınızın, az ' +
      'önce farklı bir ağa bağlandığına dair hiçbir sinyale sahip olmamasıdır. Bu yüzden aşağıdaki ' +
      'iki şey sessizce gerçekleşecek.',
    imLang1:
      'Eski yapılandırmadaki bir cüzdan yine bağlanır, doğru ağ adını gösterir ve bakiyeyi 0 olarak ' +
      'bildirir. Bu sayı DOĞRUDUR: eski jetonlarınız artık yok, gizlenmiş değiller. Ağı yeniden ' +
      'eklemenize gerek yok — sadece musluktan yeni jeton isteyin. Cüzdan takılı bir işlem ya da ' +
      'yanlış sıra numarası bildirirse, o ağın etkinlik verisini cüzdanda temizleyin: cüzdan hâlâ ' +
      'ölmüş bir zincirin işlem sayısını hatırlıyor, oysa yeni zincir 0’dan sayıyor.',
    imLang2:
      'Hiç yayınlanmamış imzalı bir işlem hâlâ elinizdeyse onu atın. Chain ID değişmediği için imza ' +
      'yeni ağda da geçerlidir. Cüzdan boşken başarısız olur — ama musluktan jeton istediğiniz anda ' +
      'harcanabilir hale gelir ve beklemediğiniz bir zamanda geçebilir.',

    lapTieuDe: 'Bu yine olacak mı',
    lapMoTa:
      'Olabilir. A1 hâlâ bir test ağı ve topluluk A1 ile C1 arasında ana ağ yönünü seçene kadar, ' +
      'genesis içinde bir şeyin değişmesi gerektiğinde ağı yeniden kurma hakkımızı saklı tutuyoruz. ' +
      'Söz verdiğimiz şey, size önceden haber vermek ve neyin kaybolacağını açıkça söylemektir.',

    daXayRaTieuDe: '2026-08-27 tarihinde bir kez zaten yeniden kuruldu',
    daXayRaMoTa:
      'A1, aşağıdaki tarihten önce, 2026-08-27 tarihinde bir kez zaten yeniden kuruldu. O tarihten önce test jetonlarınız varsa bakiyeniz şimdi 0 — bu doğrudur, cüzdanınızdaki bir arıza değildir. Hiçbir kullanıcı zinciri kaybolmadı: dizinde yalnızca otomatik test zincirleri vardı. Musluktan yeniden jeton isteyin.',
    ngayLuuY: 'Tarih kayabilir',
    ngayLuuYMoTa:
      '{ngay} tarihi önceki bir git/gitme denetimine bağlıdır. Kayarsa, susmak yerine bu sayfadaki ' +
      'tarihi değiştireceğiz.',
  },

  chanTrang: {
    dungThu: 'Deneyin',
    kham: 'Keşfedin',
    veDuAn: 'Hakkında',
    explorer: '9Scan-A1 gezgini',
    trangChinh: '9Chain ana sitesi',
    moTabMoi: '(yeni sekmede açılır)',
    nhanNav: 'Alt bilgi bağlantıları',
    reGenesis: 'Ağ yeniden kurulum planı',
  },

  dieuHuong: {
    trangChu: 'Ana sayfa',
    faucet: 'Test jetonu al',
    console: 'Zincir başlat',
    chainCuaToi: 'Zincirlerim',
    bang: 'A1 ↔ C1',
    danhBa: 'L1 dizini',
    explorer: 'Gezgin',
    banGiao: '9Scan-A1’i yeni sekmede aç',
  },

  trangChu: {
    nhanTestnet: 'Test ağı — jetonların gerçek değeri yok',
    nutChinh: 'Zincirinizi başlatın',
    nutPhu: 'Önce test jetonu alın',

    cTieuDe: 'A1 üzerinde kendi zincirinizi başlatın',
    cPhu: 'Size ait bir L1; sahibi imza attığınız cüzdan, test ağında gerçekten çalışıyor. Yaklaşık üç dakika sürer.',
    cBangChuThich: 'Her satır A1 üzerinde çalışan gerçek bir zincirdir ve kendi sahibi vardır.',
    cCot: 'Zincir',
    cCotKieu: 'Tür',
    cCotChu: 'Sahip',
    cMacDinh: 'sistem varsayılanı',
    cTrong: 'Henüz çalışan bir L1 yok',
    cTrongMoTa: 'İlk siz olurdunuz. Zinciriniz açılır açılmaz dizin güncellenir.',

    tuTo: '10 doğrulayıcıdan 9’u tek bir sunucuda, tek bir sağlayıcıda çalışıyor; onuncusu farklı bir sağlayıcıda çalışıyor. Protokol düzeyinde merkeziyetsiz, altyapı düzeyinde ise daha yeni başlıyor.',
    blockDungYen: 'Avalanche boş blok üretmez; bu yüzden kimse işlem yapmazken blok yüksekliğinin sabit kalması normaldir. Canlılık ölçüsü yanındaki doğrulayıcı sayısıdır.',
  },

  soLieu: {
    tieuDe: 'Ağ çalışıyor',
    validator: 'Bağlı doğrulayıcı',
    soL1: 'Çalışan L1',
    chieuCao: 'C-Chain bloğu',
    dangDo: 'Ağ ölçülüyor…',
    khongDo: 'Ağ istatistikleri okunamadı',
    khongDoMoTa: 'Sayfa yine de çalışıyor — bu yalnızca durum göstergesi.',
  },

  loadTest: {
    badge: 'Yük testi',
    banner: 'Herkese açık bir yük testi yürütüyoruz — saniyede {tps} işlem; bunları gerçek kullanıcılar değil, biz üretiyoruz.',
    bannerLink: 'Canlı rakamları gör',
    title: 'Herkese açık yük testi',
    intro: 'A1, gerçek kullanıcısı çok az olan yeni bir test ağı; kendi haline bırakıldığında neredeyse hiç blok üretmiyor. Ağın sürekli çalışması ve sizin de çalışırken görebilmeniz için düzenli bir işlem akışı üretiyoruz. Bu trafik bize ait. Kullanım değildir ve kullanım olarak da saymıyoruz — gönderen her adres aşağıda listelenmiştir, böylece çıkarabilirsiniz.',
    running: 'Şu anda çalışıyor',
    stopped: 'Şu anda çalışmıyor',
    stoppedWhy: 'Kaydedilen neden: {reason}',
    labelTps: 'Saniyedeki işlem',
    labelBlockHeight: 'C-Chain bloğu',
    labelSecondsPerBlock: 'Blok başına saniye',
    labelTotal: 'Başlangıçtan beri onaylanan işlemler',
    labelUptime: 'Çalışma süresi',
    committedNote: 'Bu rakamlar göndermeye çalıştıklarımızdan değil, blokların kendisinden sayılır. Ağın kabul ettiği ama hiçbir zaman bir bloğa almadığı bir işlem burada sayılmaz.',
    addressesTitle: 'Dokuz gönderen adres',
    addressesNote: 'Bu adreslerden gelen her işlem bizim makinemiz tarafından üretilmiştir. Gerçek etkinliği görmek için bunları ayıklayın.',
    measuring: 'Yük testi durumu okunuyor…',
    notMeasured: 'Yük testi durumu okunamadı',
    notMeasuredMore: 'Sayfa yine de çalışıyor — bu yalnızca durum göstergesi.',
  },

  deChain: {
    tieuDe: 'Zincirinizi başlatın',
    moTa:
      'Cüzdanınıza ait özel bir L1. Kim olduğunuzu kanıtlamak için bir kez imzalarsınız, gözden ' +
      'geçirirsiniz ve ağ zinciri yaklaşık üç dakikada kurar.',

    noiVi: 'Cüzdanı bağla',
    dangNoi: 'Bağlanıyor…',
    kyDeVao: 'Oturum aç',
    dangKy: 'İmza bekleniyor…',
    viCuaBan: 'Cüzdanınız',
    laChuChain: 'Zincir bu cüzdana ait olacak. Adres imzanızdan gelir — kimse elle yazmaz.',
    khongCoVi: 'Bu tarayıcıda cüzdan bulunamadı. MetaMask kurun ve sayfayı yeniden yükleyin.',
    tuChoiKy: 'İmzalamayı reddettiniz. Hiçbir şey oluşturulmadı.',
    doiVi: 'Başka bir cüzdan kullan',

    nhanTen: 'Zincir adı',
    goiYTen: 'Örnek: MyChain',
    moTaTen:
      'Harf, rakam ve boşluk. 2–32 karakter. Bu ağda bir kez kullanılmış bir ad asla yeniden ' +
      'verilmez — iptal edilmiş bir zincir için bile.',
    tenXau: 'Ad yalnızca harf, rakam ve boşluk içerebilir; uzunluğu 2–32 karakter olmalıdır.',
    nhanKieu: 'Zincir türü',
    moTaKieu: 'Bir kez seçildikten sonra sabittir — bir zincirin genesis’i düzenlenemez.',
    conCho: '{con}/{tong} yuva kaldı',
    hetCho: 'Hiç yuva kalmadı',
    hetChoMoTa:
      'Mevcut modelde her doğrulayıcı her L1’i izler ve protokol, 16’dan fazla alt ağ bildiren bir ' +
      'düğümü dışarı atar. Bu katı bir tavandır ve yükseltilemez. Bir zinciri iptal etmek bir yuvayı ' +
      'geri verir.',
    soatLai: 'Göndermeden önce gözden geçirin',

    soatTieuDe: 'Gözden geçirme — bu tek yönlü bir kapı',
    soatMoTa:
      'Başlatılmış bir L1’in genesis’i DEĞİŞTİRİLEMEZ. Bu adımdan sonra ad, zincir türü ve sahip ' +
      'değiştirilemez — ve iptal etmek de adı ve chain ID’yi geri vermez.',
    soatReGenesis:
      'Basmadan önce bilinmesi gereken bir şey daha: A1, {ngay} tarihinde tüm ağı yeniden kurar. ' +
      'Bugün başlattığınız zincir eski ağla birlikte silinecek — gizlenmeyecek, yok olacak.',
    soatTen: 'Zincir adı',
    soatKieu: 'Zincir türü',
    soatChu: 'Sahip',
    soatQuayLai: 'Geri dön ve düzenle',
    soatDongY: 'Gözden geçirdim — zinciri başlat',

    dangDe: '“{ten}” zinciri başlatılıyor',
    dangDeMoTa:
      'Ağ hiçbir zaman çoğunluğunu kaybetmesin diye düğümler BİRER BİRER yeniden başlatılır — bu ' +
      'yüzden yavaştır ve bu bilinçlidir. Sekmeyi kapatmayın; kapatsanız bile zincir yine kurulur.',
    conKhoang: 'Yaklaşık {phut} dakika kaldı',
    dangChuanBi: 'Hazırlanıyor…',

    xongTieuDe: 'Tamam — “{ten}” zinciri çalışıyor',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Zinciri cüzdana ekle',
    xongDaThem: 'Cüzdana eklendi',
    xongKichHoat: 'Zinciri etkinleştir (blok 1’i aç)',
    xongDaKichHoat: 'Etkinleştirildi',
    xongDangKichHoat: 'Cüzdan bekleniyor…',
    xongThemViLoi: 'Zincir cüzdanınıza eklenemedi. {chiTiet}',
    xongKichHoatLoi: 'Zincir etkinleştirilemedi. {chiTiet}',

    deTiep: 'Başka bir zincir başlat',
    loiDe: 'Zincir başlatılamadı. {chiTiet}',
    loiKhongRo: 'İşlem bittikten sonra zincir dizinde görünmedi.',
    luuYTieuDe: 'Yeni bir zincirdeki ilk işlem',
    luuYCachLam:
      'İlk işlem için gaz tahminine güvenmeyin. Blok 1’i açmanın en ucuz yolu sıradan bir ' +
      'transferdir — aşağıdaki “Zinciri etkinleştir” düğmesine basın.',
  },

  chainCuaToi: {
    tieuDe: 'Zincirlerim',
    moTa: 'Oturum açtığınız cüzdana ait L1’ler. İptal edilebilirler, ama önce uyarıyı okuyun.',
    noiVi: 'Zincirlerinizi görmek için cüzdanınızı bağlayın',
    trongTieuDe: 'Bu cüzdanın henüz hiçbir zinciri yok',
    trongMoTa: 'Bir tane başlatın ve geri dönün — hemen burada görünecek.',
    trongNut: 'Zincirinizi başlatın',

    cotChain: 'Zincir',
    cotKieu: 'Tür',
    cotSong: 'Durum',
    cotViec: '',

    songDo: '{so} doğrulayıcı',
    songDangDo: 'ölçülüyor',
    songKhongDo: 'ölçülemedi',
    songGiaiThich: 'Alt ağın doğrulayıcı sayısıyla ölçülür, blok yüksekliğiyle değil.',
    khongValidator: '0 doğrulayıcı',
    khongValidatorMoTa:
      'Bu zincir hiçbir işlemi kesinleştiremez: alt ağın doğrulayıcısı yok. Yine de RPC çağrılarına ' +
      'yanıt verir ve cüzdanlar yine bağlanır; bu yüzden başka görünür bir işaret yoktur.',

    thongSo: 'Cüzdan ayarları',
    themVaoVi: 'Cüzdana ekle',
    daThemVaoVi: 'Eklendi',
    themViLoi: 'Cüzdanınıza eklenemedi. {chiTiet}',

    thuHoi: 'İptal et',
    thuHoiTieuDe: '“{ten}” iptal edilsin mi?',
    thuHoiY1: 'Zincir hemen RPC hizmetini durdurur ve genel dizinden kaybolur.',
    thuHoiY2:
      'İptal etmek P-Chain üzerindeki alt ağı SİLMEZ — orada oluşturulan şey, bu ağ çalıştığı sürece ' +
      'kaldırılamaz. Ayrıca bu zinciri daha önce eklemiş kişilerin cüzdanlarından da ağı kaldırmaz.',
    thuHoiY3:
      'Ad ve Chain ID ayrılmış kalır ve bu ağda ASLA kimseye yeniden verilmez. Bir Chain ID’yi ' +
      'yeniden vermek, eski bir kullanıcının cüzdanının sessizce bir başkasının zincirini ' +
      'göstermesine yol açardı.',
    thuHoiY4: 'Karşılığında 15 yuvadan biri geri verilir.',
    thuHoiGoNhan: 'Onaylamak için zincir adını birebir yazın',
    thuHoiSaiTen: 'Bu, zincir adıyla eşleşmiyor.',
    thuHoiXacNhan: 'Kalıcı olarak iptal et',
    thuHoiHuy: 'Vazgeç',
    thuHoiDangChay: '“{ten}” iptal ediliyor — yaklaşık üç dakika',
    thuHoiXong: '“{ten}” iptal edildi. {con}/{tong} yuva kaldı.',
    thuHoiLoi: 'İptal edilemedi. {chiTiet}',
    thuHoiKhongRo: 'İşlem bittikten sonra zincir hâlâ dizinde.',

    daThuHoi: 'İptal edildi',
    daThuHoiMoTa: 'Ad ve Chain ID bu ağda ayrılmış kalır.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — karşılaştırma',
    moTa:
      '9Chain, aynı ürünün İKİ test ağını yan yana çalıştırır; fark motorda: A1 Avalanche motorunda, ' +
      'C1 Cosmos motorunda. Bu tablo iki yön arasındaki ödünleşimleri kayda geçirir ve herkes itiraz ' +
      'edebilsin diye yayımlanmıştır — C1 tarafında henüz canlı ölçüm yok.',

    tuChamTieuDe: 'Aşağıdaki puanlar ekip tarafından KENDİ KENDİNE verilmiştir, bağımsız olarak ölçülmemiştir',
    tuChamMoTa:
      '"Nasıl ölçüldü" sütunu her ölçütün nasıl denetlendiğini söyler. Tarihli bir ölçümü olmayan ' +
      'her ölçüt bir mimari değerlendirmedir, veri değildir. Ağırlıkları siz belirlersiniz — puan ' +
      'ona göre oluşur.',

    cotSo: '#',
    cotTieuChi: 'Ölçüt',
    cotLoai: 'Tür',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Ağırlık',
    loaiKienTruc: 'mimari',
    loaiSong: 'canlı veri',

    tongDiem: 'Sizin ağırlıklarınızla toplam puan',
    hoaNhau: 'Berabere',
    dangDan: 'önde',

    soLieuTieuDe: 'Canlı veri',
    a1Validator: 'A1 — bağlı doğrulayıcı',
    a1Chain: 'A1 — çalışan L1',
    a1Block: 'A1 — C-Chain bloğu',
    c1Vang: 'C1 — erişilemiyor',
    c1VangMoTa:
      'C1’in Cosmos REST adresi (port 1317) gerekiyor. Tablo yine de çalışır: A1 tarafı canlı veridir, ' +
      'C1 tarafı ise kalan ölçütler gibi bir mimari değerlendirmedir.',
    dangDo: 'ölçülüyor…',
    khongDo: 'ölçülemedi',
  },

  faucet: {
    tieuDe: 'Test jetonu al',
    moTa:
      'A1 test ağındaki LOVE9’un gerçek bir değeri yoktur — test ederken gaz ödeyebilesiniz diye ' +
      'vardır. Bir cüzdan adresi girin, hemen bir miktar gönderelim.',
    nhanDiaChi: 'Cüzdan adresiniz',
    goiYDiaChi: '0x… (40 onaltılık karakter)',
    nutXin: 'Bana jeton gönder',
    dangGui: 'Gönderiliyor…',
    danChoDiaChi: 'Jetonları alacak cüzdan adresini yapıştırın. Henüz yapmadıysanız yukarıdaki “Ağı cüzdana ekle” düğmesine basın.',
    themMang: 'Ağı cüzdana ekle',
    themMangXong: 'Cüzdana eklendi',
    themMangTuChoi: 'Cüzdanınızda reddet’e bastınız. Ağı eklemek isterseniz yeniden basın.',
    themMangLoi: 'Cüzdanınız ağı ekleyemedi. Yandaki ayarları kullanarak elle ekleyin — ve aşağıdaki satırı ekibe gönderin:',
    khongCoVi: 'Bu tarayıcıda cüzdan bulunamadı. MetaMask kurun ve sayfayı yeniden yükleyin.',
    hanMucConLai: 'Kalan kota',
    hanMucCachDoc: '{gio} saatte {con}/{tong} istek',
    hanMucHet: 'Tüm kotanızı kullandınız. {phut} dakika sonra yeniden deneyin.',
    hanMucKhongDoc: 'Kotanız okunamadı — yine de istekte bulunabilirsiniz, sadece ne kadar kaldığını bilemezsiniz.',
    thanhCong: '{diaChi} adresine {so} {kyHieu} gönderildi',
    xemGiaoDich: 'İşlemi görüntüle',
    thongSoMang: 'Ağ ayarları',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Sembol',
    thongSoThapPhan: 'Ondalık',
    thongSoExplorer: 'Gezgin',
    thapPhanGiaiThich:
      'Cüzdanlar 18 ondalık gösterir, çünkü C-Chain EVM çalıştırır. P/X-Chain üzerinde LOVE9 9 ' +
      'ondalıkla sayılır. Tek bir para, iki ölçek — iki farklı jeton değil.',
    loiChung: 'Gönderilemedi. {chiTiet}',
  },

  chonNgonNgu: {
    nhan: 'Dil',
    mayDich: 'makine',
    mayDichGiaiThich: 'Yalnızca Vietnamca sürüm bir insan tarafından incelendi. Diğer çeviriler makine yapımıdır ve yanlış olabilir — İngilizce sürüm doğruluğun kaynağıdır.',
    chuaCo: 'henüz yok',
  },

  loi: {
    khongKetNoi: 'Ağa ulaşılamadı',
    khongKetNoiMoTa: 'Ağ yoğun olabilir ya da bağlantınız kopmuş olabilir.',
    trongRong: 'Burada henüz bir şey yok',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'Bu sayfa yok',
    moTa:
      'Açtığınız adres 9Chain Testnet A1 üzerinde bulunmuyor. ' +
      'Adı değişmiş olabilir ya da kopyalanırken URL’den birkaç karakter eksilmiş olabilir.',
    dayLaGi: 'En çok kullanılan üç sayfa:',
    nhanNav: 'Şimdi nereye',
    veTrangChu: 'Ana sayfaya dön',
    diFaucet: 'Test jetonu al',
    diDeChain: 'Zincirinizi başlatın',
    timGiaoDich: 'Bir işlem ya da adres mi arıyorsunuz? Özeti kontrol edip yeniden deneyin.',
  },
};

export default tr;
