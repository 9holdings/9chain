import type { Dict } from '../en';

/**
 * Türkçe — makine çevirisi, bir insan tarafından incelenmedi.
 * Kaynak dil İngilizcedir (`../en.ts`); farklılık halinde İngilizce sürüm geçerlidir.
 *
 * 🔴 Şu üç yer yumuşatılmamalı: `reGenesis.*` (ağ silinecek),
 * `deChain.soatMoTa` (tek yönlü kapı), `chainCuaToi.thuHoiY*` (iptal adı geri vermez).
 * Bunlar "kalıcı olarak" ve "değiştirilemez" der; kimse geri alınabilir sanıp varlığını
 * kaybetmesin diye.
 */
export const tr: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: "9Chain'in genel test ağı — Avalanche motorunda çalışan bağımsız bir ağ",
    tagline: 'Avalanche motorunda çalışan bağımsız bir ağ',
    walletRejected: 'İsteği cüzdanınızda reddettiniz. Hiçbir şey değişmedi.',
    noWalletMobile: 'Telefon tarayıcısına cüzdan eklentisi kurulamaz. Bunun yerine bu sayfayı MetaMask uygulamasının içinde açın — uygulamanın kendi tarayıcısında cüzdan vardır.',
    openInMetaMask: 'MetaMask uygulamasında aç',
    loading: 'Yükleniyor…',
    retry: 'Yeniden dene',
    copy: 'Kopyala',
    copied: 'Kopyalandı',
    close: 'Kapat',
    openMenu: 'Menüyü aç',
    closeMenu: 'Menüyü kapat',
    switchToDark: 'Koyu moda geç',
    switchToLight: 'Açık moda geç',
    skipToContent: 'Ana içeriğe geç',
    stepDone: ' — tamam',
    stepRunning: ' — çalışıyor',
    stepFailed: ' — başarısız',
    stepPending: ' — bekliyor',
  },

  presets: {
    standard: {
      name: 'Standart',
      desc: 'Sıradan bir EVM zinciri. Sahibi tüm genesis tokenlarını ve ücretleri değiştirme hakkını alır.',
    },
    'zero-fee': {
      name: 'Neredeyse sıfır ücret',
      desc: 'baseFee = 1 wei; işlem tam olarak bu tabanı öder (bir transfer 0,000000000000021 LOVE9 tutar). Oyunlar, deneyler ve iç zincirler için uygundur. Bedeli: spam’i engelleyen neredeyse hiçbir şey yok.',
    },
    'high-throughput': {
      name: 'Yüksek işlem hacmi',
      desc: 'Blok başına beş kat fazla işlem (gasLimit 12 milyon yerine 60 milyon). Oyunlar, borsalar ve sürekli küçük işlem akışı olan her şey için uygundur. Bedeli: daha ağır bloklar; bu zincir için düğüm çalıştıran daha güçlü bir makineye ihtiyaç duyar.',
    },
    mintable: {
      name: 'Basılabilir arz',
      desc: 'Sahibi, 0x0200000000000000000000000000000000000001 önderlemesi üzerinden istediği zaman daha fazla yerel token basabilir. Arz sabit DEĞİLDİR — bu zinciri kullanan herkes bunu bilmelidir.',
    },
    'owner-deploy-only': {
      name: 'Sözleşme dağıtımı yalnızca sahibine açık',
      desc: 'Diğerleri yine işlem gönderebilir ve mevcut sözleşmeleri kullanabilir, ancak kendi sözleşmelerini dağıtamaz. Sahibi bu hakkı 0x0200000000000000000000000000000000000000 önderlemesi üzerinden dilediğine verir.',
    },
    permissioned: {
      name: 'İzinli (yalnızca onaylı göndericiler)',
      desc: 'Yalnızca listedeki adresler işlem GÖNDEREBİLİR. Bir şirketin iç zinciri için uygundur. ⚠️ En katı ön ayardır: buraya gelen tanınmayan bir cüzdan hiçbir şey yapamaz.',
    },
  },
  steps: {
    genesis: 'Genesis oluşturuluyor',
    subnet: 'P-Chain üzerinde alt ağ + blokzincir oluşturuluyor',
    rpc: 'L1 RPC’nin yanıtı bekleniyor',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',

    banner: 'A1, {date} tarihinde yeniden kuruldu. O tarihten önce oluşturulan her bakiye ve her zincir artık yok.',
    bannerLink: 'Bu ne demek',
    badge: 'Yeniden kuruldu',

    title: 'A1, {date} tarihinde yeniden kuruldu',
    desc:
      'A1 test ağı blok 0’dan itibaren yeniden kuruldu. O tarihten önce oluşturulan zincirler, ' +
      'bakiyeler ve işlem geçmişi artık yok — gizlenmedi, ortadan kalktı. ' +
      'Bu sayfa ne gördüğünüzü ve ne yapmanız gerektiğini anlatır.',

    willSeeTitle: 'Ne göreceksiniz',
    willSee1:
      'Cüzdanınız yine bağlanır, doğru ağ adını ve aynı Chain ID {chainId} değerini gösterir — ' +
      'bu bilinçliydi. Ama bakiyeniz 0 olacak.',
    willSee2:
      'Başlattığınız her L1 dizinden silindi. Adları ve Chain ID’leri yeniden serbest; ' +
      'artık herkes onları alabilir.',
    willSee3:
      'Bir işlemi imzaladıysanız ama hiç yayınlamadıysanız, şimdi yayınlamayın — ' +
      'o işlem artık var olmayan bir ağa ait.',

    toDoTitle: 'Ne yapmanız gerekiyor',
    toDo1: 'Musluktan yeniden test jetonu isteyin. Sınırlar herkes için sıfırlandı.',
    toDo2:
      'Her bir L1’i cüzdanınızdan kaldırın — kendi Chain ID’leri var ve artık hiçbir yeri ' +
      'göstermiyorlar. Ana A1 ağını kaldırmanıza GEREK YOK; ayarları değişmedi.',
    toDo3: 'Gerekiyorsa zincirinizi yeniden başlatın. Eski adı bir başkası almış olabilir.',

    archiveTitle: 'Eski ağın arşivi',
    archiveDesc:
      'Yeniden kurulumdan önce ağın son durumu dışa aktarıldı ve özeti (hash) yayımlandı; ' +
      'böylece kontrol etmek isteyen herkes edebilir.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1, {date} tarihinde yeniden kurulacak — o tarihten önce oluşturulan her zincir, bakiye ve işlem silinecek.',
    bannerLink: 'Ayrıntılar',
    badge: 'Yeniden kurulum yaklaşıyor',

    title: 'A1, {date} tarihinde yeniden kurulacak',
    desc:
      'A1 test ağının tamamı blok 0’dan itibaren yeniden kurulacak. O tarihten önce oluşturulan ' +
      'her şey gidecek — gizlenmeyecek, artık var olmayacak. Bu sayfa tam olarak neyin kaybolacağını ' +
      've ne yapmanız gerektiğini söyler.',

    whyTitle: 'Yeniden kurulum neden gerekli',
    why1:
      'Bir ağın genesis’i değiştirilemez. Onu güvenilir kılan da tam olarak budur — onu kuranlar ' +
      'dahil hiç kimse, blok 0’a yazıldıktan sonra bir sayıyı değiştiremez.',
    why2:
      'Bunun bedeli şu: genesis içindeki bir sayıyı değiştirmek, ağı sıfırdan yeniden kurmaktan ' +
      'başka seçenek bırakmaz. A1 toplam arzı 9.000.000.000 LOVE9’a çıkardı ve buna uyacak şekilde ' +
      'staking parametrelerinin tüm aralığı yeniden hesaplanmak zorunda kaldı.',
    why3:
      'Burası bir test ağı ve yeniden kurulmak bir test ağının hakkı. Aslında test ağları tam da ' +
      'bunun için var: böyle değişiklikler burada olsun, ana ağda değil.',

    lostTitle: 'Ne kaybolacak',
    lostDesc: 'İstisnasız her şey:',
    lost1: 'Kullanıcıların başlattığı her L1 — gayet iyi çalışanlar dahil.',
    lost2: 'Her LOVE9 bakiyesi — musluktan alınan jetonlar dahil.',
    lost3: 'Her işlem, her blok, C-Chain, P-Chain ve X-Chain’in tüm geçmişi.',
    lost4: 'Her doğrulayıcı ve her delegasyon.',

    keptTitle: 'Ne saklanacak',
    keptDesc:
      'Silmeden önce ölmekte olan ağın tamamı dışa aktarılacak ve özeti yayımlanacak; böylece kayıt ' +
      'doğrulanabilir kalacak. Onu çalıştıran ağ ortadan kalktıktan sonra bile olanlar kontrol ' +
      'edilebilecek. Arşiv bağlantısı yeniden kurulum günü burada paylaşılacak.',

    toDoTitle: 'Ne yapmanız gerekiyor',
    toDoBefore: 'Yeniden kurulumdan önce:',
    toDo1:
      'Şu anda A1 üzerinde verinin kalıcı olmasına bağlı bir şey inşa etmeyin. Bir fikri deniyorsanız ' +
      'buyurun — yeter ki mevcut zinciri depolama gibi görmeyin.',
    toDoAfter: 'Yeniden kurulumdan sonra:',
    toDo2:
      'Eklediğiniz her L1’i cüzdanınızdan kaldırın — o zincirler artık yok ve onları gösteren bir ' +
      'cüzdan öylece bekler. Ana A1 ağını kaldırmaya gerek yok: ayarları değişmedi.',
    toDo3:
      'Cüzdanınızda A1 ağı henüz yoksa, ayarları elle yazmak yerine musluk sayfasındaki düğmeyle ekleyin.',
    toDo4: 'Musluktan yeniden jeton isteyin ve isterseniz zincirinizi yeniden başlatın.',

    silentTitle: 'Cüzdanınız sizi uyarmayacak',
    silentDesc:
      'Yeni ağ, eskisiyle aynı Chain ID {chainId}, aynı RPC adresi ve aynı adı korur. Bu bilinçli — ' +
      'böylece daha önce yayımlanmış her belge ve kılavuz doğru kalır. Bedeli ise cüzdanınızın, az ' +
      'önce farklı bir ağa bağlandığına dair hiçbir sinyale sahip olmamasıdır. Bu yüzden aşağıdaki ' +
      'iki şey sessizce gerçekleşecek.',
    silent1:
      'Eski yapılandırmadaki bir cüzdan yine bağlanır, doğru ağ adını gösterir ve bakiyeyi 0 olarak ' +
      'bildirir. Bu sayı DOĞRUDUR: eski jetonlarınız artık yok, gizlenmiş değiller. Ağı yeniden ' +
      'eklemenize gerek yok — sadece musluktan yeni jeton isteyin. Cüzdan takılı bir işlem ya da ' +
      'yanlış sıra numarası bildirirse, o ağın etkinlik verisini cüzdanda temizleyin: cüzdan hâlâ ' +
      'ölmüş bir zincirin işlem sayısını hatırlıyor, oysa yeni zincir 0’dan sayıyor.',
    silent2:
      'Hiç yayınlanmamış imzalı bir işlem hâlâ elinizdeyse onu atın. Chain ID değişmediği için imza ' +
      'yeni ağda da geçerlidir. Cüzdan boşken başarısız olur — ama musluktan jeton istediğiniz anda ' +
      'harcanabilir hale gelir ve beklemediğiniz bir zamanda geçebilir.',

    repeatTitle: 'Bu yine olacak mı',
    repeatDesc:
      'Olabilir. A1 hâlâ bir test ağı ve topluluk A1 ile C1 arasında ana ağ yönünü seçene kadar, ' +
      'genesis içinde bir şeyin değişmesi gerektiğinde ağı yeniden kurma hakkımızı saklı tutuyoruz. ' +
      'Söz verdiğimiz şey, size önceden haber vermek ve neyin kaybolacağını açıkça söylemektir.',

    alreadyTitle: '2026-08-27 tarihinde bir kez zaten yeniden kuruldu',
    alreadyDesc:
      'A1, aşağıdaki tarihten önce, 2026-08-27 tarihinde bir kez zaten yeniden kuruldu. O tarihten önce test jetonlarınız varsa bakiyeniz şimdi 0 — bu doğrudur, cüzdanınızdaki bir arıza değildir. Hiçbir kullanıcı zinciri kaybolmadı: dizinde yalnızca otomatik test zincirleri vardı. Musluktan yeniden jeton isteyin.',
    dateNote: 'Tarih kayabilir',
    dateNoteDesc:
      '{date} tarihi önceki bir git/gitme denetimine bağlıdır. Kayarsa, susmak yerine bu sayfadaki ' +
      'tarihi değiştireceğiz.',
  },

  footer: {
    tryIt: 'Deneyin',
    explore: 'Keşfedin',
    about: 'Hakkında',
    explorer: '9Scan-A1 gezgini',
    mainSite: '9Chain ana sitesi',
    opensNewTab: '(yeni sekmede açılır)',
    navLabel: 'Alt bilgi bağlantıları',
    rebuildPlan: 'Ağ yeniden kurulum planı',
  },

  nav: {
    home: 'Ana sayfa',
    faucet: 'Test jetonu al',
    launch: 'Zincir başlat',
    myChains: 'Zincirlerim',
    compare: 'A1 ↔ C1',
    directory: 'L1 dizini',
    explorer: 'Gezgin',
    explorerAria: '9Scan-A1’i yeni sekmede aç',
    ceremony: "Tören",
  },

  home: {
    testnetBadge: 'Test ağı — jetonların gerçek değeri yok',
    primaryCta: 'Zincirinizi başlatın',
    secondaryCta: 'Önce test jetonu alın',

    title: 'A1 üzerinde kendi zincirinizi başlatın',
    subtitle: 'Size ait bir L1; sahibi imza attığınız cüzdan, test ağında gerçekten çalışıyor. Yaklaşık beş dakika sürer.',
    tableCaption: 'Her satır A1 üzerinde çalışan gerçek bir zincirdir ve kendi sahibi vardır.',
    colChain: 'Zincir',
    colType: 'Tür',
    colOwner: 'Sahip',
    systemDefault: 'sistem varsayılanı',
    emptyTitle: 'Henüz çalışan bir L1 yok',
    emptyDesc: 'İlk siz olurdunuz. Zinciriniz açılır açılmaz dizin güncellenir.',
    moreChains: 'Dizindeki {count} zincirin tümünü gör',

    disclosure: '11 doğrulayıcıdan 9’u aynı sunucuda, aynı sağlayıcıda çalışıyor; diğer ikisi başka yerlerden katıldı ve yalnızca biri çevrimiçi — protokol düzeyinde merkeziyetsiz, altyapı düzeyinde henüz değil.',
    idleBlocksNote: 'Avalanche boş blok üretmez; bu yüzden kimse işlem yapmazken blok yüksekliğinin sabit kalması normaldir. Canlılık ölçüsü yanındaki doğrulayıcı sayısıdır.',
  },

  stats: {
    title: 'Ağ çalışıyor',
    validators: 'Bağlı doğrulayıcı',
    l1Count: 'Çalışan L1',
    blockHeight: 'C-Chain bloğu',
    measuring: 'Ağ ölçülüyor…',
    cannotMeasure: 'Ağ istatistikleri okunamadı',
    cannotMeasureDesc: 'Sayfa yine de çalışıyor — bu yalnızca durum göstergesi.',
  },
  directory: {
    lede: 'A1 test ağındaki her zincir ve her birinin gerçek durumu.',
    howToTitle: 'Bu tablo nasıl okunur.',
    howToBody: 'Avalanche boş blok üretmez — bir zincir yalnızca işlem olduğunda blok üretir, dolayısıyla blok sayısının yerinde durması normaldir ve zincirin öldüğü anlamına gelmez. Tehlikeli olan tersidir: doğrulayıcısı olmayan bir zincir de RPC’ye yanıt verir, bakiyelerin okunmasına izin verir ve cüzdanlar ona bağlanmaya devam eder — ama her işlem sonsuza kadar askıda kalır. Bu yüzden buradaki gerçek yaşam belirtisi, doğrudan P-Chain’den okunan alt ağ doğrulayıcı sayısıdır, blok yüksekliği değil.',
    ownerTitle: 'Sahip (admin)',
    ownerBody: 'zincir başlatılırken verilen adrestir. Tüm genesis arzını ve o zincirin ücretlerini değiştirme hakkını elinde tutar — zincir vakfa değil, ona aittir. Konsolda bu alan olmadan önce başlatılan zincirler bir sistem varsayılanı gösterir.',
    mainNetwork: 'ANA AĞ',
    mainNetworkDesc: 'A1 test ağının C-Chain’i — musluğun ve gezginin çalıştığı yer.',
    running: 'ÇALIŞIYOR',
    notAnswering: 'YANIT VERMİYOR',
    notAnsweringDesc: 'RPC yanıt vermiyor — henüz hiçbir düğüm bu alt ağı izlemiyor olabilir.',
    unclear: 'BELİRSİZ',
    unclearDesc: 'Doğrulayıcı kümesi P-Chain’den okunamadı.',
    ownerAdmin: 'Sahip (admin)',
    blocks: 'Bloklar',
    subnetValidators: 'Alt ağ doğrulayıcıları',
    created: 'Oluşturuldu',
    revokedAt: 'İptal edildi',
    copyOwner: 'Sahip adresini kopyala',
    revoked: 'İPTAL EDİLDİ',
    revokedDesc: 'Bu zincir hizmet vermeyi bıraktı: artık hiçbir düğüm onu çalıştırmıyor ve RPC’si yanıt vermiyor. Bu ağı bir cüzdana eklediyseniz kaldırın — bırakmak yalnızca bağlantı hataları üretir.',
    neverReissued: 'başka bir zincire asla yeniden verilmez',
    revokedGroup: 'İptal edilen ({count})',
    listError: 'Zincir listesi okunamadı ({error}). Ana ağ aşağıda yine gösteriliyor.',
    footSummary: '{count} L1 çalışıyor + ana ağ',
    footRevoked: '{count} iptal edildi',
    footUpdated: '{time} itibarıyla güncellendi',
    tileTotal: "Dizindeki L1'ler",
    tileRunning: 'Ölçülen, çalışıyor',
    tileAttention: 'Dikkat gerektiren',
    tileRevoked: 'İptal edilen',
    sweepProgress: '{total} zincirden {done} tanesi ölçüldü',
    measuringDesc: 'Ölçüm sırasında.',
    howToToggle: 'Bu liste nasıl okunur',
    searchLabel: 'Ara',
    searchPlaceholder: 'Ad, Chain ID, sahip veya blockchain ID',
    filterStatus: 'Durum',
    filterAll: 'Tümü',
    filterRunning: 'Çalışıyor',
    filterAttention: 'Dikkat gerektiren',
    filterRevoked: 'İptal edilen',
    filterType: 'Tür',
    filterTypeAll: 'Tüm türler',
    groupBy: 'Grupla',
    groupNone: 'Gruplama yok',
    groupOwner: 'Sahip',
    groupType: 'Tür',
    groupStatus: 'Durum',
    groupNoType: 'Tür kaydedilmemiş',
    groupCount: '{total} içinden {shown}',
    sortBy: 'Sırala',
    sortNewest: 'Önce en yeni',
    sortOldest: 'Önce en eski',
    sortName: 'Ad',
    sortChainId: 'Chain ID',
    sortBlocks: 'En çok blok',
    refresh: 'Yeniden ölç',
    listCaption: 'A1 üzerindeki zincirler ve her birinin ölçülen durumu',
    showing: '{total} içinden {shown} gösteriliyor',
    showMore: '{count} tane daha göster',
    noMatchTitle: 'Eşleşen zincir yok',
    noMatchDesc: 'Başka bir terim deneyin ya da filtreleri temizleyin.',
    clearFilters: 'Filtreleri temizle',
    showDetails: 'Ayrıntılar',
    hideDetails: 'Gizle',
    detailsOf: '{name} ayrıntıları',
    nativeToken: 'Yerel token',
    mismatch: 'YANLIŞ ZİNCİR',
    mismatchDesc: 'RPC, {expected} yerine Chain ID {got} ile yanıt verdi — büyük olasılıkla bir yönlendirme hatası, bu zincirin değil.',
  },
  ceremony: {
    badge: "Tören",
    title: "Block Adam töreni",
    desc: "Tam olarak belirlenmiş bir saniyede ağ, adı olan üç blok yazar. Bu sayfa neyin olacağını, blokların ne taşıdığını ve sonrasında bize sormadan bunu nasıl doğrulayacağınızı anlatır.",
    momentLabel: "An",
    countdownLabel: "Kalan süre",
    days: "gün",
    hours: "saat",
    minutes: "dk",
    seconds: "sn",
    yourZone: "Sizin saat diliminiz",
    blocksTitle: "Üç blok",
    adamDesc: "Zaman damgası o ana ulaşan İLK blok — yükseklikle değil, zamanla tanımlanır. O bloğu kim üretirse üretmiş olur.",
    evaDesc: "Yüksekliğe göre Adam'dan hemen sonraki blok.",
    unionDesc: "Adam'dan on blok sonra. 9S Union mesajı buraya bağlanır.",
    messagesTitle: "Bloklar ne taşıyor",
    messagesDesc: "Adam ve Eva, ağ kurulurken blok 0'a yazılmış olan iki cümleyi taşır — tören aynı dosyaları gösterir, bu yüzden ikisi birbirinden ayrılamaz. Aşağıdaki her özet, törenden önce 2026-09-03'te dondurulmuştur ve ham baytlar üzerinde sha256 ile yeniden üretilebilir.",
    quietTitle: "Bir dakikalık sessizlik",
    quietDesc: "C-Chain boş blok üretmez; bu yüzden canlı sayfada açıkça duyurduğumuz sentetik trafik, andan kısa süre önce durdurulur. Aksi hâlde tören, iki saniyelik bir pencere için otomatik bir gönderici ile yarışırdı. Bedeli bir dakikalık sessizlik; karşılığında bu bloklar bir bota değil, törene ait olur.",
    strangerTitle: "Bir yabancı o bloğu alabilir, kayıt yine de geçerlidir",
    strangerDesc: "A1 herkese açık bir test ağıdır ve o saniyede herkes işlem gönderebilir. Kayıt, blok yüksekliğine değil, törenin işlem hash'ine bağlıdır — başkasının bloğu o ana önce ulaşırsa yazılan yine doğrudur; yalnızca o bloğu tören üretmemiştir.",
    checkTitle: "Kendiniz doğrulayın",
    checkDesc: "Herhangi bir A1 düğümünden o andaki bloğu isteyin ve zaman damgasını okuyun. Bu sayfada güvene dayalı kabul edilmesi gereken hiçbir şey yok.",
    resultTitle: "Ne kaydedildi",
    resultPending: "Henüz yayımlanmadı. Kanıt paketi — an, kullanılan kaydırma, arka plan trafiği, üç işlem hash'i, blok numaraları ve baytların zincirden geri okunmasının sonucu — törenden sonra burada yayımlanır.",
    resultBlock: "Block Adam",
    resultTimestamp: "Zaman damgası",
    resultBundle: "Kanıt paketi",
    reachedNote: "An geçti. Kayıt burada henüz yayımlanmadı — bu, baytlar zincirden geri okunup dondurulmuş özetlerle karşılaştırıldıktan sonra olur.",
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

  launch: {
    title: 'Zincirinizi başlatın',
    desc:
      'Cüzdanınıza ait özel bir L1. Kim olduğunuzu kanıtlamak için bir kez imzalarsınız, gözden ' +
      'geçirirsiniz ve ağ zinciri yaklaşık beş dakikada kurar.',

    connectWallet: 'Cüzdanı bağla',
    connecting: 'Bağlanıyor…',
    signIn: 'Oturum aç',
    signing: 'İmza bekleniyor…',
    yourWallet: 'Cüzdanınız',
    youWillOwn: 'Zincir bu cüzdana ait olacak. Adres imzanızdan gelir — kimse elle yazmaz.',
    noWallet: 'Bu tarayıcıda cüzdan bulunamadı. MetaMask kurun ve sayfayı yeniden yükleyin.',
    signRejected: 'İmzalamayı reddettiniz. Hiçbir şey oluşturulmadı.',
    switchWallet: 'Başka bir cüzdan kullan',

    nameLabel: 'Zincir adı',
    namePlaceholder: 'Örnek: MyChain',
    nameHelp:
      'Harf, rakam ve boşluk. 2–32 karakter. Bu ağda bir kez kullanılmış bir ad asla yeniden ' +
      'verilmez — iptal edilmiş bir zincir için bile.',
    nameInvalid: 'Ad yalnızca harf, rakam ve boşluk içerebilir; uzunluğu 2–32 karakter olmalıdır.',
    typeLabel: 'Zincir türü',
    typeHelp: 'Bir kez seçildikten sonra sabittir — bir zincirin genesis’i düzenlenemez.',
    slotsLeft: '{left}/{total} yuva kaldı',
    slotsFull: 'Hiç yuva kalmadı',
    slotsFullDesc:
      'Mevcut modelde her doğrulayıcı her L1’i izler ve protokol, 16’dan fazla alt ağ bildiren bir ' +
      'düğümü dışarı atar. Bu katı bir tavandır ve yükseltilemez. Bir zinciri iptal etmek bir yuvayı ' +
      'geri verir.',
    reviewCta: 'Göndermeden önce gözden geçirin',

    reviewTitle: 'Gözden geçirme — bu tek yönlü bir kapı',
    reviewDesc:
      'Başlatılmış bir L1’in genesis’i DEĞİŞTİRİLEMEZ. Bu adımdan sonra ad, zincir türü ve sahip ' +
      'değiştirilemez — ve iptal etmek de adı ve chain ID’yi geri vermez.',
    reviewRebuild:
      'Basmadan önce bilinmesi gereken bir şey daha: A1, {date} tarihinde tüm ağı yeniden kurar. ' +
      'Bugün başlattığınız zincir eski ağla birlikte silinecek — gizlenmeyecek, yok olacak.',
    reviewName: 'Zincir adı',
    reviewType: 'Zincir türü',
    reviewOwner: 'Sahip',
    reviewBack: 'Geri dön ve düzenle',
    reviewConfirm: 'Gözden geçirdim — zinciri başlat',

    launching: '“{name}” zinciri başlatılıyor',
    launchingDesc:
      'Ağ hiçbir zaman çoğunluğunu kaybetmesin diye düğümler BİRER BİRER yeniden başlatılır — bu ' +
      'yüzden yavaştır ve bu bilinçlidir. Sekmeyi kapatmayın; kapatsanız bile zincir yine kurulur.',
    etaRemaining: 'Yaklaşık {minutes} dakika kaldı',
    preparing: 'Hazırlanıyor…',

    doneTitle: 'Tamam — “{name}” zinciri çalışıyor',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Zinciri cüzdana ekle',
    doneAdded: 'Cüzdana eklendi',
    doneActivate: 'Zinciri etkinleştir (blok 1’i aç)',
    doneActivated: 'Etkinleştirildi',
    doneActivating: 'Cüzdan bekleniyor…',
    doneAddWalletError: 'Zincir cüzdanınıza eklenemedi. {detail}',
    doneActivateError: 'Zincir etkinleştirilemedi. {detail}',

    launchAnother: 'Başka bir zincir başlat',
    launchError: 'Zincir başlatılamadı. {detail}',
    unknownError: 'İşlem bittikten sonra zincir dizinde görünmedi.',
    noteTitle: 'Yeni bir zincirdeki ilk işlem',
    noteHow:
      'İlk işlem için gaz tahminine güvenmeyin. Blok 1’i açmanın en ucuz yolu sıradan bir ' +
      'transferdir — aşağıdaki “Zinciri etkinleştir” düğmesine basın.',
  },

  myChains: {
    title: 'Zincirlerim',
    desc: 'Oturum açtığınız cüzdana ait L1’ler. İptal edilebilirler, ama önce uyarıyı okuyun.',
    connectWallet: 'Zincirlerinizi görmek için cüzdanınızı bağlayın',
    emptyTitle: 'Bu cüzdanın henüz hiçbir zinciri yok',
    emptyDesc: 'Bir tane başlatın ve geri dönün — hemen burada görünecek.',
    emptyCta: 'Zincirinizi başlatın',

    colChain: 'Zincir',
    colType: 'Tür',
    colStatus: 'Durum',
    colActions: '',

    validatorCount: '{count} doğrulayıcı',
    measuring: 'ölçülüyor',
    cannotMeasure: 'ölçülemedi',
    statusHelp: 'Alt ağın doğrulayıcı sayısıyla ölçülür, blok yüksekliğiyle değil.',
    noValidators: '0 doğrulayıcı',
    noValidatorsDesc:
      'Bu zincir hiçbir işlemi kesinleştiremez: alt ağın doğrulayıcısı yok. Yine de RPC çağrılarına ' +
      'yanıt verir ve cüzdanlar yine bağlanır; bu yüzden başka görünür bir işaret yoktur.',

    walletSettings: 'Cüzdan ayarları',
    addToWallet: 'Cüzdana ekle',
    addedToWallet: 'Eklendi',
    addWalletError: 'Cüzdanınıza eklenemedi. {detail}',

    revoke: 'İptal et',
    revokeTitle: '“{name}” iptal edilsin mi?',
    revokeWarn1: 'Zincir hemen RPC hizmetini durdurur ve genel dizinden kaybolur.',
    revokeWarn2:
      'İptal etmek P-Chain üzerindeki alt ağı SİLMEZ — orada oluşturulan şey, bu ağ çalıştığı sürece ' +
      'kaldırılamaz. Ayrıca bu zinciri daha önce eklemiş kişilerin cüzdanlarından da ağı kaldırmaz.',
    revokeWarn3:
      'Ad ve Chain ID ayrılmış kalır ve bu ağda ASLA kimseye yeniden verilmez. Bir Chain ID’yi ' +
      'yeniden vermek, eski bir kullanıcının cüzdanının sessizce bir başkasının zincirini ' +
      'göstermesine yol açardı.',
    revokeWarn4: 'Karşılığında 15 yuvadan biri geri verilir.',
    revokeTypeLabel: 'Onaylamak için zincir adını birebir yazın',
    revokeNameMismatch: 'Bu, zincir adıyla eşleşmiyor.',
    revokeConfirm: 'Kalıcı olarak iptal et',
    revokeCancel: 'Vazgeç',
    revoking: '“{name}” iptal ediliyor — yaklaşık beş dakika',
    revokeDone: '“{name}” iptal edildi. {left}/{total} yuva kaldı.',
    revokeError: 'İptal edilemedi. {detail}',
    revokeUnknown: 'İşlem bittikten sonra zincir hâlâ dizinde.',

    revokedBadge: 'İptal edildi',
    revokedDesc: 'Ad ve Chain ID bu ağda ayrılmış kalır.',
  },

  compare: {
    title: 'A1 ↔ C1 — karşılaştırma',
    desc:
      '9Chain, aynı ürünün İKİ test ağını yan yana çalıştırır; fark motorda: A1 Avalanche motorunda, ' +
      'C1 Cosmos motorunda. Bu tablo iki yön arasındaki ödünleşimleri kayda geçirir ve herkes itiraz ' +
      'edebilsin diye yayımlanmıştır — C1 tarafında henüz canlı ölçüm yok.',

    selfScoreTitle: 'Aşağıdaki puanlar ekip tarafından KENDİ KENDİNE verilmiştir, bağımsız olarak ölçülmemiştir',
    selfScoreDesc:
      '"Nasıl ölçüldü" sütunu her ölçütün nasıl denetlendiğini söyler. Tarihli bir ölçümü olmayan ' +
      'her ölçüt bir mimari değerlendirmedir, veri değildir. Ağırlıkları siz belirlersiniz — puan ' +
      'ona göre oluşur.',

    colNo: '#',
    colCriterion: 'Ölçüt',
    colKind: 'Tür',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Ağırlık',
    kindArchitecture: 'mimari',
    kindLiveData: 'canlı veri',

    totalScore: 'Sizin ağırlıklarınızla toplam puan',
    tied: 'Berabere',
    leads: 'önde',

    liveDataTitle: 'Canlı veri',
    a1Validators: 'A1 — bağlı doğrulayıcı',
    a1Chains: 'A1 — çalışan L1',
    a1Blocks: 'A1 — C-Chain bloğu',
    c1Unreachable: 'C1 — erişilemiyor',
    c1UnreachableDesc:
      'C1’in Cosmos REST adresi (port 1317) gerekiyor. Tablo yine de çalışır: A1 tarafı canlı veridir, ' +
      'C1 tarafı ise kalan ölçütler gibi bir mimari değerlendirmedir.',
    measuring: 'ölçülüyor…',
    cannotMeasure: 'ölçülemedi',
    critDecentralisation: 'Merkeziyetsizlik (doğrulayıcı tavanı)',
    noteDecentralisation: 'PROTOKOL tavanı: Snowman ~binlerce düğüm, CometBFT ~150. A1 BUGÜN: 9 düğüm, tek makine, tek sağlayıcı',
    critFinality: 'Kesinlik',
    noteFinality: '~1–2sn ile ~5–6sn',
    critEvmMaturity: 'EVM olgunluğu',
    noteEvmMaturity: 'coreth üretimde, Cosmos EVM v1 öncesi',
    critWalletCompat: 'Perakende cüzdan / DeFi uyumu',
    noteWalletCompat: 'Tam MetaMask/EVM',
    critLaunchUx: 'Zincir başlatma deneyimi',
    noteLaunchUx: 'ikisinde de konsol var; A1’de her başlatma ~170sn ölçüldü',
    critInterop: 'Birlikte çalışabilirliğin genişliği',
    noteInterop: 'Ekosistem içinde Warp/ICM (A1 varlık taşıdı, M6.2) ile IBC’nin erişimi',
    critOpCost: 'Zincir başına işletme maliyeti',
    noteOpCost: 'düğüm + eklenti ile K8s operatörü',
    critBootstrap: 'Ağ etkisini başlatma',
    noteBootstrap: 'kendi adası ile Cosmos ekonomisine takılı IBC',
    critEconSecurity: 'Kamuya açık ekonomik güvenlik',
    noteEconSecurity: 'baştan PoS token teminatlı',
    critSwitchCost: 'Ekip için geçiş maliyeti',
    noteSwitchCost: 'A1 yeni, C1 aylardır çalışıyor',
  },

  faucet: {
    title: 'Test jetonu al',
    desc:
      'A1 test ağındaki LOVE9’un gerçek bir değeri yoktur — test ederken gaz ödeyebilesiniz diye ' +
      'vardır. Bir cüzdan adresi girin, hemen bir miktar gönderelim.',
    addressLabel: 'Cüzdan adresiniz',
    addressFromWallet: 'Bağladığınız cüzdandan dolduruldu. Tokenler başka bir adrese gidecekse değiştirin.',
    useWalletAddress: 'Cüzdan adresimi kullan',
    addressPlaceholder: '0x… (40 onaltılık karakter)',
    requestCta: 'Bana jeton gönder',
    sending: 'Gönderiliyor…',
    addressHelp: 'Jetonları alacak cüzdan adresini yapıştırın. Henüz yapmadıysanız yukarıdaki “Ağı cüzdana ekle” düğmesine basın.',
    addNetwork: 'Ağı cüzdana ekle',
    addNetworkDone: 'Cüzdana eklendi',
    addNetworkRejected: 'Cüzdanınızda reddet’e bastınız. Ağı eklemek isterseniz yeniden basın.',
    addNetworkError: 'Cüzdanınız ağı ekleyemedi. Yandaki ayarları kullanarak elle ekleyin — ve aşağıdaki satırı ekibe gönderin:',
    noWallet: 'Bu tarayıcıda cüzdan bulunamadı. MetaMask kurun ve sayfayı yeniden yükleyin.',
    quotaLabel: 'Kalan kota',
    quotaFormat: '{hours} saatte {left}/{total} istek',
    quotaExhausted: 'Tüm kotanızı kullandınız. {minutes} dakika sonra yeniden deneyin.',
    quotaUnreadable: 'Kotanız okunamadı — yine de istekte bulunabilirsiniz, sadece ne kadar kaldığını bilemezsiniz.',
    sentOk: '{address} adresine {count} {symbol} gönderildi',
    viewTransaction: 'İşlemi görüntüle',
    settingsTitle: 'Ağ ayarları',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Sembol',
    settingsDecimals: 'Ondalık',
    settingsExplorer: 'Gezgin',
    decimalsHelp:
      'Cüzdanlar 18 ondalık gösterir, çünkü C-Chain EVM çalıştırır. P/X-Chain üzerinde LOVE9 9 ' +
      'ondalıkla sayılır. Tek bir para, iki ölçek — iki farklı jeton değil.',
    genericError: 'Gönderilemedi. {detail}',
  },

  langPicker: {
    label: 'Dil',
    machineBadge: 'makine',
    machineNote: 'Yalnızca Vietnamca sürüm bir insan tarafından incelendi. Diğer çeviriler makine yapımıdır ve yanlış olabilir — İngilizce sürüm doğruluğun kaynağıdır.',
    notAvailable: 'henüz yok',
  },

  errors: {
    unreachable: 'Ağa ulaşılamadı',
    unreachableDesc: 'Ağ yoğun olabilir ya da bağlantınız kopmuş olabilir.',
    empty: 'Burada henüz bir şey yok',
    addressEmpty: '{label} boş olamaz',
    addressFormat: '{label} 0x ve ardından 40 onaltılık karakter olmalı',
    addressChecksum: '{label} EIP-55 sağlama toplamını geçemiyor — büyük olasılıkla bir karakter yanlış yazıldı ya da yapıştırırken kayboldu',
    addressZero: '{label} sıfır adres olamaz — anahtarı kimsede değil',
    timeout: '{seconds}s sonra hâlâ yanıt yok',
    notJson: 'Yanıt JSON değildi (HTTP {status}) — istek büyük olasılıkla yanlış yere yönlendirildi',
    noWallet: 'Bu tarayıcıda cüzdan bulunamadı.',
  },

  notFound: {
    code: '404',
    title: 'Bu sayfa yok',
    desc:
      'Açtığınız adres 9Chain Testnet A1 üzerinde bulunmuyor. ' +
      'Adı değişmiş olabilir ya da kopyalanırken URL’den birkaç karakter eksilmiş olabilir.',
    topPagesTitle: 'En çok kullanılan üç sayfa:',
    navLabel: 'Şimdi nereye',
    goHome: 'Ana sayfaya dön',
    goFaucet: 'Test jetonu al',
    goLaunch: 'Zincirinizi başlatın',
    lookingForTx: 'Bir işlem ya da adres mi arıyorsunuz? Özeti kontrol edip yeniden deneyin.',
  },
};

export default tr;
