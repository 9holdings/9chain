import type { Dict } from '../en';

/**
 * Bahasa Melayu — terjemahan mesin, belum disemak oleh manusia.
 * Bahasa sumber ialah bahasa Inggeris (`../en.ts`); jika berbeza, versi Inggeris yang sah.
 *
 * 🔴 Tiga tempat ini tidak boleh dilembutkan: `reGenesis.*` (rangkaian akan dipadam),
 * `deChain.soatMoTa` (pintu sehala), `chainCuaToi.thuHoiY*` (pembatalan tidak memulangkan nama).
 * Semuanya menyebut "kekal" dan "tidak boleh diubah" supaya tiada sesiapa kehilangan aset
 * kerana menyangka ia boleh dipulihkan.
 */
export const ms: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: 'Rangkaian ujian awam 9Chain — rangkaian bebas yang berjalan pada enjin Avalanche',
    tagline: 'rangkaian bebas pada enjin Avalanche',
    walletRejected: 'Anda menolak permintaan itu dalam dompet anda. Tiada apa-apa yang berubah.',
    noWalletMobile: 'Pelayar telefon tidak boleh memasang sambungan dompet. Sebaliknya, buka halaman ini di dalam aplikasi MetaMask — pelayar terbina dalamnya sudah ada dompet.',
    openInMetaMask: 'Buka dalam aplikasi MetaMask',
    loading: 'Memuatkan…',
    retry: 'Cuba lagi',
    copy: 'Salin',
    copied: 'Disalin',
    close: 'Tutup',
    openMenu: 'Buka menu',
    closeMenu: 'Tutup menu',
    switchToDark: 'Tukar ke mod gelap',
    switchToLight: 'Tukar ke mod cerah',
    skipToContent: 'Langkau ke kandungan utama',
    stepDone: ' — selesai',
    stepRunning: ' — berjalan',
    stepFailed: ' — gagal',
    stepPending: ' — menunggu',
  },

  presets: {
    standard: {
      name: 'Standard',
      desc: 'Rantaian EVM biasa. Pemilik menerima semua token genesis dan hak untuk menukar yuran.',
    },
    'zero-fee': {
      name: 'Yuran hampir sifar',
      desc: 'baseFee = 1 wei, jadi transaksi membayar tepat pada paras minimum itu (satu pemindahan berharga 0.000000000000021 LOVE9). Sesuai untuk permainan, eksperimen dan rantaian dalaman. Timbal baliknya: hampir tiada apa yang menghalang spam.',
    },
    'high-throughput': {
      name: 'Daya pemprosesan tinggi',
      desc: 'Lima kali ganda transaksi setiap blok (gasLimit 60 juta, bukan 12 juta). Sesuai untuk permainan, bursa dan apa sahaja dengan aliran transaksi kecil yang berterusan. Timbal baliknya: blok lebih berat, dan sesiapa yang menjalankan nod untuk rantaian ini memerlukan mesin yang lebih kuat.',
    },
    mintable: {
      name: 'Bekalan boleh dicetak',
      desc: 'Pemilik boleh mencetak lebih banyak token asli pada bila-bila masa melalui precompile 0x0200000000000000000000000000000000000001. Bekalan TIDAK tetap — sesiapa yang menggunakan rantaian ini perlu tahu perkara itu.',
    },
    'owner-deploy-only': {
      name: 'Hanya pemilik boleh melancarkan kontrak',
      desc: 'Orang lain masih boleh menghantar transaksi dan menggunakan kontrak sedia ada, tetapi tidak boleh melancarkan kontrak sendiri. Pemilik memberikan hak itu kepada sesiapa sahaja melalui precompile 0x0200000000000000000000000000000000000000.',
    },
    permissioned: {
      name: 'Berkebenaran (hanya penghantar yang diluluskan)',
      desc: 'Hanya alamat yang disenaraikan boleh MENGHANTAR transaksi. Sesuai untuk rantaian dalaman syarikat. ⚠️ Ini pratetap paling ketat: dompet asing yang tiba di sini tidak boleh berbuat apa-apa.',
    },
  },
  steps: {
    genesis: 'Membina genesis',
    subnet: 'Mencipta subnet + blockchain di P-Chain',
    rpc: 'Menunggu RPC L1 menjawab',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',

    banner: 'A1 telah dibina semula pada {date}. Setiap baki dan rantaian yang dicipta sebelum tarikh itu tidak wujud lagi.',
    bannerLink: 'Apa maksudnya',
    badge: 'Dibina semula',

    title: 'A1 telah dibina semula pada {date}',
    desc:
      'Rangkaian ujian A1 telah dibina semula dari blok 0. Rantaian, baki dan sejarah transaksi yang ' +
      'dicipta sebelum tarikh itu tidak wujud lagi — bukan disembunyikan, tetapi hilang terus. ' +
      'Halaman ini menerangkan apa yang anda lihat dan apa yang perlu dilakukan.',

    willSeeTitle: 'Apa yang anda akan lihat',
    willSee1:
      'Dompet anda masih boleh bersambung, masih memaparkan nama rangkaian yang betul dan Chain ID ' +
      'yang sama {chainId} — itu memang disengajakan. Tetapi baki anda akan menjadi 0.',
    willSee2:
      'Setiap L1 yang anda lancarkan telah hilang daripada direktori. Nama dan Chain ID mereka bebas ' +
      'semula, dan sesiapa sahaja boleh mengambilnya.',
    willSee3:
      'Jika anda pernah menandatangani transaksi tetapi tidak pernah menyiarkannya, jangan siarkan ' +
      'sekarang — ia milik rangkaian yang sudah tidak wujud.',

    toDoTitle: 'Apa yang anda perlu lakukan',
    toDo1: 'Minta token ujian sekali lagi daripada faucet. Had telah ditetapkan semula untuk semua orang.',
    toDo2:
      'Buang setiap L1 daripada dompet anda — masing-masing mempunyai Chain ID sendiri dan kini tidak ' +
      'menunjuk ke mana-mana. Rangkaian utama A1 TIDAK perlu dibuang; tetapannya tidak berubah.',
    toDo3: 'Lancarkan semula rantaian anda jika diperlukan. Nama lama mungkin telah diambil orang lain.',

    archiveTitle: 'Arkib rangkaian lama',
    archiveDesc:
      'Keadaan akhir rangkaian sebelum pembinaan semula telah dieksport dan cincangannya diterbitkan, ' +
      'supaya sesiapa yang ingin menyemaknya boleh berbuat demikian.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1 akan dibina semula pada {date} — setiap rantaian, baki dan transaksi yang dicipta sebelum itu akan dipadam.',
    bannerLink: 'Butiran',
    badge: 'Pembinaan semula akan datang',

    title: 'A1 akan dibina semula pada {date}',
    desc:
      'Seluruh rangkaian ujian A1 akan dibina semula dari blok 0. Segala yang dicipta sebelum tarikh ' +
      'itu akan hilang — bukan disembunyikan, tetapi tidak lagi wujud. Halaman ini menyatakan dengan ' +
      'tepat apa yang hilang dan apa yang perlu anda lakukan.',

    whyTitle: 'Mengapa pembinaan semula diperlukan',
    why1:
      'Genesis sesebuah rangkaian tidak boleh diubah. Itulah yang menjadikannya boleh dipercayai — ' +
      'tiada sesiapa, termasuk mereka yang membinanya, boleh menukar satu nombor setelah nombor itu ' +
      'ditulis ke dalam blok 0.',
    why2:
      'Harganya: menukar satu nombor di dalam genesis tidak meninggalkan pilihan lain selain membina ' +
      'semula rangkaian dari awal. A1 menaikkan jumlah bekalan kepada 9,000,000,000 LOVE9, dan seluruh ' +
      'julat parameter staking terpaksa dikira semula supaya sepadan.',
    why3:
      'Ini rangkaian ujian, dan dibina semula ialah sesuatu yang dibenarkan bagi rangkaian ujian. ' +
      'Malah itulah sebabnya rangkaian ujian wujud: supaya perubahan seperti ini berlaku di sini, ' +
      'bukan di rangkaian utama.',

    lostTitle: 'Apa yang akan hilang',
    lostDesc: 'Semuanya, tanpa pengecualian:',
    lost1: 'Setiap L1 yang dilancarkan pengguna, termasuk rantaian yang berjalan dengan baik.',
    lost2: 'Setiap baki LOVE9, termasuk token yang diterima daripada faucet.',
    lost3: 'Setiap transaksi, setiap blok, seluruh sejarah C-Chain, P-Chain dan X-Chain.',
    lost4: 'Setiap pengesah dan setiap delegasi.',

    keptTitle: 'Apa yang disimpan',
    keptDesc:
      'Sebelum pemadaman, seluruh rangkaian yang akan mati itu akan dieksport dengan cincangan yang ' +
      'diterbitkan, supaya rekodnya kekal boleh disahkan. Apa yang berlaku masih boleh disemak, walaupun ' +
      'rangkaian yang menjalankannya sudah tiada. Pautan arkib akan disiarkan di sini pada hari ' +
      'pembinaan semula.',

    toDoTitle: 'Apa yang anda perlu lakukan',
    toDoBefore: 'Sebelum pembinaan semula:',
    toDo1:
      'Jangan bina apa-apa di A1 sekarang yang bergantung pada data terus kekal. Jika anda sedang ' +
      'mencuba sesuatu idea, silakan — cuma jangan anggap rantaian semasa sebagai tempat simpanan.',
    toDoAfter: 'Selepas pembinaan semula:',
    toDo2:
      'Buang daripada dompet anda setiap L1 yang pernah anda tambah — rantaian itu tidak wujud lagi, ' +
      'dan dompet yang menunjuk ke sana hanya akan tergantung. Rangkaian utama A1 tidak perlu dibuang: ' +
      'tetapannya tidak berubah.',
    toDo3:
      'Jika dompet anda belum mempunyai rangkaian A1, tambahkannya dengan butang di halaman faucet ' +
      'dan bukan dengan menaip tetapan secara manual.',
    toDo4: 'Minta token daripada faucet sekali lagi, dan lancarkan semula rantaian anda jika mahu.',

    silentTitle: 'Dompet anda tidak akan memberi amaran',
    silentDesc:
      'Rangkaian baharu mengekalkan Chain ID {chainId}, alamat RPC yang sama dan nama yang sama seperti ' +
      'yang lama. Itu memang disengajakan — supaya setiap dokumen dan panduan yang telah diterbitkan ' +
      'kekal betul. Harganya ialah dompet anda langsung tiada isyarat bahawa ia baru sahaja bersambung ' +
      'dengan rangkaian yang berbeza. Oleh itu dua perkara di bawah akan berlaku secara senyap.',
    silent1:
      'Dompet dengan konfigurasi lama masih bersambung, masih memaparkan nama rangkaian yang betul, dan ' +
      'akan melaporkan baki 0. Nombor itu BETUL: token lama anda tidak wujud lagi, ia tidak ' +
      'disembunyikan. Anda tidak perlu menambah rangkaian semula — minta sahaja token baharu daripada ' +
      'faucet. Jika dompet melaporkan transaksi tersangkut atau nombor urutan yang salah, bersihkan ' +
      'data aktiviti rangkaian itu dalam dompet: ia masih mengingati kiraan transaksi rantaian yang ' +
      'sudah mati, sedangkan rantaian baharu mengira dari 0.',
    silent2:
      'Jika anda masih menyimpan transaksi bertandatangan yang tidak pernah disiarkan, buanglah. ' +
      'Tandatangan itu masih sah pada rangkaian baharu kerana Chain ID tidak berubah. Ia akan gagal ' +
      'selagi dompet kosong — tetapi sebaik sahaja anda meminta token daripada faucet, ia menjadi boleh ' +
      'dibelanjakan, dan mungkin lulus pada masa yang anda tidak jangka.',

    repeatTitle: 'Adakah ini akan berulang',
    repeatDesc:
      'Mungkin. A1 masih rangkaian ujian, dan sehingga komuniti memilih hala tuju rangkaian utama antara ' +
      'A1 dan C1, kami mengekalkan hak untuk membina semula rangkaian apabila sesuatu di dalam genesis ' +
      'perlu berubah. Yang kami janjikan ialah memberitahu anda lebih awal, dan menyatakan dengan jelas ' +
      'apa yang hilang.',

    alreadyTitle: 'Sudah pernah dibina semula sekali pada 2026-08-27',
    alreadyDesc:
      'A1 sudah pernah dibina semula sekali pada 2026-08-27, sebelum tarikh di bawah. Jika anda memegang token ujian sebelum itu, baki anda kini 0 — itu betul, bukan kerosakan pada dompet anda. Tiada rantaian pengguna yang hilang: direktori hanya mengandungi rantaian ujian automatik. Minta token sekali lagi daripada faucet.',
    dateNote: 'Tarikh boleh beranjak',
    dateNoteDesc:
      'Tarikh {date} bergantung pada semakan go/no-go sebelumnya. Jika ia beranjak, kami akan menukar ' +
      'tarikh di halaman ini dan bukannya berdiam diri.',
  },

  footer: {
    tryIt: 'Cuba',
    explore: 'Terokai',
    about: 'Tentang',
    explorer: 'Penjelajah 9Scan-A1',
    mainSite: 'Laman utama 9Chain',
    opensNewTab: '(dibuka dalam tab baharu)',
    navLabel: 'Pautan kaki halaman',
    rebuildPlan: 'Pelan pembinaan semula rangkaian',
  },

  nav: {
    home: 'Laman utama',
    faucet: 'Dapatkan token ujian',
    launch: 'Lancarkan rantaian',
    myChains: 'Rantaian saya',
    compare: 'A1 ↔ C1',
    directory: 'Direktori L1',
    explorer: 'Penjelajah',
    explorerAria: 'Buka 9Scan-A1 dalam tab baharu',
  },

  home: {
    testnetBadge: 'Rangkaian ujian — token tiada nilai sebenar',
    primaryCta: 'Lancarkan rantaian anda',
    secondaryCta: 'Dapatkan token ujian dahulu',

    title: 'Lancarkan rantaian anda sendiri di A1',
    subtitle: 'Sebuah L1 milik anda sendiri, dimiliki oleh dompet yang anda gunakan untuk menandatangani, benar-benar berjalan pada rangkaian ujian. Mengambil masa kira-kira tiga minit.',
    tableCaption: 'Setiap baris ialah rantaian sebenar yang berjalan di A1, dengan pemiliknya sendiri.',
    colChain: 'Rantaian',
    colType: 'Jenis',
    colOwner: 'Pemilik',
    systemDefault: 'lalai sistem',
    emptyTitle: 'Belum ada L1 yang berjalan',
    emptyDesc: 'Anda akan menjadi yang pertama. Direktori dikemas kini sebaik sahaja rantaian anda hidup.',
    moreChains: 'Lihat kesemua {count} rantaian dalam direktori',

    disclosure: '9 daripada 11 pengesah berjalan pada pelayan yang sama, dengan pembekal yang sama; dua lagi menyertai dari tempat lain dan hanya satu daripadanya dalam talian — terdesentralisasi pada peringkat protokol, belum lagi pada peringkat infrastruktur.',
    idleBlocksNote: 'Avalanche tidak menghasilkan blok kosong, jadi ketinggian blok yang kekal tidak berubah ketika tiada sesiapa membuat transaksi adalah normal. Ukuran hidupnya ialah bilangan pengesah di sebelahnya.',
  },

  stats: {
    title: 'Rangkaian aktif',
    validators: 'Pengesah bersambung',
    l1Count: 'L1 sedang berjalan',
    blockHeight: 'Blok C-Chain',
    measuring: 'Mengukur rangkaian…',
    cannotMeasure: 'Tidak dapat membaca statistik rangkaian',
    cannotMeasureDesc: 'Halaman ini masih berfungsi — ini hanyalah paparan status.',
  },
  directory: {
    lede: 'Setiap rantaian pada testnet A1, dan keadaan sebenar setiap satu.',
    howToTitle: 'Cara membaca jadual ini.',
    howToBody: 'Avalanche tidak menghasilkan blok kosong — rantaian hanya menghasilkan blok apabila ada transaksi, jadi kiraan blok yang tidak bergerak adalah normal dan tidak bermakna rantaian itu mati. Kes sebaliknya yang bahaya: rantaian tanpa pengesah masih menjawab RPC, masih membenarkan baki dibaca, dan wallet masih boleh bersambung — tetapi setiap transaksi tergantung selama-lamanya. Jadi tanda hidup yang sebenar di sini ialah bilangan pengesah subnet, dibaca terus daripada P-Chain, bukan ketinggian blok.',
    ownerTitle: 'Pemilik (admin)',
    ownerBody: 'ialah alamat yang diberikan semasa rantaian dilancarkan. Ia memegang seluruh bekalan genesis dan hak menukar fi rantaian itu — rantaian itu miliknya, bukan milik yayasan. Rantaian yang dilancarkan sebelum konsol mempunyai medan ini memaparkan nilai lalai sistem.',
    mainNetwork: 'RANGKAIAN UTAMA',
    mainNetworkDesc: 'C-Chain testnet A1 — tempat faucet dan explorer bekerja.',
    running: 'SEDANG BERJALAN',
    notAnswering: 'TIDAK MENJAWAB',
    notAnsweringDesc: 'RPC tidak menjawab — mungkin belum ada nod yang menjejak subnet ini.',
    unclear: 'TIDAK JELAS',
    unclearDesc: 'Set pengesah tidak dapat dibaca daripada P-Chain.',
    ownerAdmin: 'Pemilik (admin)',
    blocks: 'Blok',
    subnetValidators: 'Pengesah subnet',
    created: 'Dicipta',
    revokedAt: 'Dibatalkan pada',
    copyOwner: 'Salin alamat pemilik',
    revoked: 'DIBATALKAN',
    revokedDesc: 'Rantaian ini sudah berhenti berkhidmat: tiada nod menjalankannya lagi dan RPC-nya tidak lagi menjawab. Jika anda pernah menambah rangkaian ini ke wallet, buangkannya — membiarkannya hanya menghasilkan ralat sambungan.',
    neverReissued: 'tidak pernah dikeluarkan semula kepada rantaian lain',
    revokedGroup: 'Dibatalkan ({count})',
    listError: 'Senarai rantaian tidak dapat dibaca ({error}). Rangkaian utama masih dipaparkan di bawah.',
    footSummary: '{count} L1 berjalan + rangkaian utama',
    footRevoked: '{count} dibatalkan',
    footUpdated: 'dikemas kini pada {time}',
    tileTotal: 'L1 dalam direktori',
    tileRunning: 'Diukur, berjalan',
    tileAttention: 'Perlu perhatian',
    tileRevoked: 'Dibatalkan',
    sweepProgress: 'Diukur {done} daripada {total}',
    measuringDesc: 'Dalam giliran pengukuran.',
    howToToggle: 'Cara membaca senarai ini',
    searchLabel: 'Cari',
    searchPlaceholder: 'Nama, Chain ID, pemilik atau blockchain ID',
    filterStatus: 'Status',
    filterAll: 'Semua',
    filterRunning: 'Berjalan',
    filterAttention: 'Perlu perhatian',
    filterRevoked: 'Dibatalkan',
    filterType: 'Jenis',
    filterTypeAll: 'Semua jenis',
    groupBy: 'Kumpulkan mengikut',
    groupNone: 'Tiada kumpulan',
    groupOwner: 'Pemilik',
    groupType: 'Jenis',
    groupStatus: 'Status',
    groupNoType: 'Jenis tidak direkodkan',
    groupCount: '{shown} daripada {total}',
    sortBy: 'Susun',
    sortNewest: 'Terbaru dahulu',
    sortOldest: 'Terlama dahulu',
    sortName: 'Nama',
    sortChainId: 'Chain ID',
    sortBlocks: 'Blok terbanyak',
    refresh: 'Ukur semula',
    listCaption: 'Rantaian di A1, dengan status terukur setiap satu',
    showing: 'Menunjukkan {shown} daripada {total}',
    showMore: 'Tunjukkan {count} lagi',
    noMatchTitle: 'Tiada rantaian sepadan',
    noMatchDesc: 'Cuba perkataan lain, atau kosongkan penapis.',
    clearFilters: 'Kosongkan penapis',
    showDetails: 'Butiran',
    hideDetails: 'Sembunyikan',
    detailsOf: 'Butiran {name}',
    nativeToken: 'Token asli',
    mismatch: 'RANTAIAN SALAH',
    mismatchDesc: 'RPC menjawab dengan Chain ID {got} dan bukan {expected} — berkemungkinan besar ralat penghalaan, bukan rantaian ini.',
  },


  loadTest: {
    badge: 'Ujian beban',
    banner: 'Kami sedang menjalankan ujian beban awam — {tps} transaksi sesaat, dijana oleh kami, bukan pengguna sebenar.',
    bannerLink: 'Lihat angka langsung',
    title: 'Ujian beban awam',
    intro: 'A1 ialah rangkaian ujian yang masih baharu dengan pengguna sebenar yang sangat sedikit, jadi jika dibiarkan ia hampir tidak menghasilkan blok. Kami menjana aliran transaksi yang tetap supaya rangkaian sentiasa bekerja dan anda dapat melihatnya berfungsi. Trafik ini milik kami. Ia bukan penggunaan dan kami tidak mengiranya sebagai penggunaan — setiap alamat yang menghantarnya disenaraikan di bawah supaya anda boleh menolaknya.',
    running: 'Sedang berjalan',
    stopped: 'Tidak berjalan buat masa ini',
    stoppedWhy: 'Sebab yang direkodkan: {reason}',
    labelTps: 'Transaksi sesaat',
    labelBlockHeight: 'Blok C-Chain',
    labelSecondsPerBlock: 'Saat setiap blok',
    labelTotal: 'Transaksi disahkan sejak mula',
    labelUptime: 'Berjalan selama',
    committedNote: 'Angka ini dikira daripada blok itu sendiri, bukan daripada apa yang kami cuba hantar. Transaksi yang diterima rangkaian tetapi tidak pernah dimasukkan ke dalam blok tidak dikira di sini.',
    addressesTitle: 'Sembilan alamat penghantar',
    addressesNote: 'Setiap transaksi daripada alamat ini dijana mesin kami. Tapis keluar untuk melihat aktiviti sebenar yang ada.',
    measuring: 'Membaca status ujian beban…',
    notMeasured: 'Tidak dapat membaca status ujian beban',
    notMeasuredMore: 'Halaman ini masih berfungsi — ini hanyalah paparan status.',
  },

  launch: {
    title: 'Lancarkan rantaian anda',
    desc:
      'Sebuah L1 khusus, dimiliki oleh dompet anda. Anda menandatangani sekali untuk membuktikan siapa ' +
      'anda, menyemak, dan rangkaian membina rantaian itu dalam kira-kira tiga minit.',

    connectWallet: 'Sambungkan dompet',
    connecting: 'Menyambung…',
    signIn: 'Log masuk',
    signing: 'Menunggu tandatangan…',
    yourWallet: 'Dompet anda',
    youWillOwn: 'Rantaian ini akan menjadi milik dompet ini. Alamatnya datang daripada tandatangan anda — tiada sesiapa menaipnya.',
    noWallet: 'Tiada dompet ditemui dalam pelayar ini. Pasang MetaMask dan muat semula halaman.',
    signRejected: 'Anda enggan menandatangani. Tiada apa-apa yang dicipta.',
    switchWallet: 'Guna dompet lain',

    nameLabel: 'Nama rantaian',
    namePlaceholder: 'Contoh: MyChain',
    nameHelp:
      'Huruf, angka dan ruang. 2–32 aksara. Pada rangkaian ini, nama yang pernah digunakan tidak akan ' +
      'dikeluarkan semula — walaupun untuk rantaian yang telah dibatalkan.',
    nameInvalid: 'Nama hanya boleh mengandungi huruf, angka dan ruang, sepanjang 2–32 aksara.',
    typeLabel: 'Jenis rantaian',
    typeHelp: 'Setelah dipilih ia kekal — genesis sesebuah rantaian tidak boleh disunting.',
    slotsLeft: '{left}/{total} slot berbaki',
    slotsFull: 'Tiada slot berbaki',
    slotsFullDesc:
      'Model semasa membuatkan setiap pengesah menjejaki setiap L1, dan protokol menyingkirkan nod yang ' +
      'mengisytiharkan lebih daripada 16 subnet. Ini had keras dan tidak boleh dinaikkan. Membatalkan ' +
      'sesebuah rantaian memulangkan satu slot.',
    reviewCta: 'Semak sebelum menghantar',

    reviewTitle: 'Semakan — ini pintu sehala',
    reviewDesc:
      'Genesis sesebuah L1 yang telah dilancarkan TIDAK BOLEH DIUBAH. Selepas langkah ini, nama, jenis ' +
      'rantaian dan pemilik tidak boleh ditukar — dan pembatalan juga tidak akan memulangkan nama serta ' +
      'chain ID.',
    reviewRebuild:
      'Satu lagi perkara sebelum anda menekan: A1 membina semula seluruh rangkaian pada {date}. ' +
      'Rantaian yang anda lancarkan hari ini akan dipadam bersama rangkaian lama — bukan disembunyikan, ' +
      'tetapi hilang.',
    reviewName: 'Nama rantaian',
    reviewType: 'Jenis rantaian',
    reviewOwner: 'Pemilik',
    reviewBack: 'Kembali dan sunting',
    reviewConfirm: 'Saya telah menyemak — lancarkan rantaian',

    launching: 'Melancarkan rantaian “{name}”',
    launchingDesc:
      'Nod dimulakan semula SATU DEMI SATU supaya rangkaian tidak pernah kehilangan kuorum — itulah ' +
      'sebabnya ia perlahan, dan ia disengajakan. Jangan tutup tab; jika ditutup pun, rantaian tetap dibina.',
    etaRemaining: 'Kira-kira {minutes} minit lagi',
    preparing: 'Menyediakan…',

    doneTitle: 'Selesai — rantaian “{name}” sedang berjalan',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Tambah rantaian ke dompet',
    doneAdded: 'Ditambah ke dompet',
    doneActivate: 'Aktifkan rantaian (buka blok 1)',
    doneActivated: 'Diaktifkan',
    doneActivating: 'Menunggu dompet…',
    doneAddWalletError: 'Tidak dapat menambah rantaian ke dompet anda. {detail}',
    doneActivateError: 'Tidak dapat mengaktifkan rantaian. {detail}',

    launchAnother: 'Lancarkan satu lagi rantaian',
    launchError: 'Tidak dapat melancarkan rantaian. {detail}',
    unknownError: 'Rantaian tidak muncul dalam direktori selepas proses selesai.',
    noteTitle: 'Transaksi pertama pada rantaian baharu',
    noteHow:
      'Jangan percayakan anggaran gas untuk transaksi pertama. Cara paling murah untuk membuka blok 1 ' +
      'ialah pemindahan biasa — tekan “Aktifkan rantaian” di bawah.',
  },

  myChains: {
    title: 'Rantaian saya',
    desc: 'L1 yang dimiliki oleh dompet yang anda gunakan untuk log masuk. Ia boleh dibatalkan, tetapi baca amaran dahulu.',
    connectWallet: 'Sambungkan dompet anda untuk melihat rantaian anda',
    emptyTitle: 'Dompet ini belum memiliki sebarang rantaian',
    emptyDesc: 'Lancarkan satu dan kembali — ia akan muncul di sini serta-merta.',
    emptyCta: 'Lancarkan rantaian anda',

    colChain: 'Rantaian',
    colType: 'Jenis',
    colStatus: 'Status',
    colActions: '',

    validatorCount: '{count} pengesah',
    measuring: 'mengukur',
    cannotMeasure: 'tidak dapat diukur',
    statusHelp: 'Diukur daripada bilangan pengesah subnet, bukan daripada ketinggian blok.',
    noValidators: '0 pengesah',
    noValidatorsDesc:
      'Rantaian ini TIDAK boleh memuktamadkan sebarang transaksi: subnetnya tiada pengesah. Ia masih ' +
      'menjawab panggilan RPC dan dompet masih boleh bersambung, jadi tiada tanda lain yang kelihatan.',

    walletSettings: 'Tetapan dompet',
    addToWallet: 'Tambah ke dompet',
    addedToWallet: 'Ditambah',
    addWalletError: 'Tidak dapat menambahkannya ke dompet anda. {detail}',

    revoke: 'Batalkan',
    revokeTitle: 'Batalkan “{name}”?',
    revokeWarn1: 'Rantaian berhenti memberikan RPC serta-merta dan hilang daripada direktori awam.',
    revokeWarn2:
      'Pembatalan TIDAK memadamkan subnet pada P-Chain — apa yang telah dicipta di sana tidak boleh ' +
      'dibuang selagi rangkaian ini berjalan. Ia juga tidak membuang rangkaian daripada dompet orang ' +
      'yang sudah menambah rantaian ini.',
    revokeWarn3:
      'Nama dan Chain ID kekal ditempah dan TIDAK PERNAH dikeluarkan semula kepada sesiapa pada ' +
      'rangkaian ini. Mengeluarkan semula sesuatu Chain ID akan membolehkan dompet bekas pengguna ' +
      'menunjuk secara senyap ke rantaian milik orang lain.',
    revokeWarn4: 'Sebagai balasan, satu daripada 15 slot dipulangkan.',
    revokeTypeLabel: 'Taip nama rantaian dengan tepat untuk mengesahkan',
    revokeNameMismatch: 'Ia tidak sepadan dengan nama rantaian.',
    revokeConfirm: 'Batalkan secara kekal',
    revokeCancel: 'Batal',
    revoking: 'Membatalkan “{name}” — kira-kira tiga minit',
    revokeDone: '“{name}” dibatalkan. {left}/{total} slot berbaki.',
    revokeError: 'Tidak dapat membatalkan. {detail}',
    revokeUnknown: 'Rantaian masih ada dalam direktori selepas proses selesai.',

    revokedBadge: 'Dibatalkan',
    revokedDesc: 'Nama dan Chain ID kekal ditempah pada rangkaian ini.',
  },

  compare: {
    title: 'A1 ↔ C1 — perbandingan',
    desc:
      '9Chain menjalankan DUA rangkaian ujian bagi produk yang sama secara bersebelahan, berbeza pada ' +
      'enjinnya: A1 pada enjin Avalanche, C1 pada enjin Cosmos. Jadual ini merekodkan pertukaran ' +
      'untung-rugi antara dua arah itu, diterbitkan supaya sesiapa boleh membantahnya — pihak C1 belum ' +
      'mempunyai ukuran langsung.',

    selfScoreTitle: 'Skor di bawah adalah PENILAIAN SENDIRI oleh pasukan, bukan diukur secara bebas',
    selfScoreDesc:
      'Lajur "bagaimana ia diukur" menyatakan cara setiap kriteria disemak. Mana-mana kriteria tanpa ' +
      'ukuran bertarikh ialah pertimbangan seni bina, bukan data. Pemberat anda yang tentukan — skor ' +
      'akan mengikutinya.',

    colNo: '#',
    colCriterion: 'Kriteria',
    colKind: 'Jenis',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Pemberat',
    kindArchitecture: 'seni bina',
    kindLiveData: 'data langsung',

    totalScore: 'Jumlah skor menggunakan pemberat anda',
    tied: 'Seri',
    leads: 'mendahului',

    liveDataTitle: 'Data langsung',
    a1Validators: 'A1 — pengesah bersambung',
    a1Chains: 'A1 — L1 sedang berjalan',
    a1Blocks: 'A1 — blok C-Chain',
    c1Unreachable: 'C1 — tidak dapat dihubungi',
    c1UnreachableDesc:
      'URL REST Cosmos milik C1 (port 1317) diperlukan. Jadual ini masih berfungsi: pihak A1 ialah data ' +
      'langsung, pihak C1 ialah pertimbangan seni bina seperti kriteria yang lain.',
    measuring: 'mengukur…',
    cannotMeasure: 'tidak dapat diukur',
    critDecentralisation: 'Desentralisasi (had atas bilangan pengesah)',
    noteDecentralisation: 'Had PROTOKOL: Snowman ~ribuan nod berbanding CometBFT ~150. A1 HARI INI: 9 nod, satu mesin, satu pembekal',
    critFinality: 'Kemuktamadan',
    noteFinality: '~1–2s berbanding ~5–6s',
    critEvmMaturity: 'Kematangan EVM',
    noteEvmMaturity: 'coreth sudah dalam produksi berbanding Cosmos EVM sebelum v1',
    critWalletCompat: 'Keserasian dompet runcit / DeFi',
    noteWalletCompat: 'MetaMask/EVM sepenuhnya',
    critLaunchUx: 'Pengalaman melancarkan rantaian',
    noteLaunchUx: 'kedua-duanya ada konsol; pada A1 diukur ~170s setiap pelancaran',
    critInterop: 'Keluasan saling kendali',
    noteInterop: 'Warp/ICM dalam ekosistem (A1 sudah memindahkan aset, M6.2) berbanding jangkauan IBC',
    critOpCost: 'Kos operasi bagi setiap rantaian',
    noteOpCost: 'nod + pemalam berbanding operator K8s',
    critBootstrap: 'Memulakan kesan rangkaian',
    noteBootstrap: 'pulau sendiri berbanding IBC yang dipalam ke ekonomi Cosmos',
    critEconSecurity: 'Keselamatan ekonomi awam',
    noteEconSecurity: 'PoS bercagar token sejak awal',
    critSwitchCost: 'Kos bertukar bagi pasukan',
    noteSwitchCost: 'A1 masih baharu berbanding C1 yang berjalan berbulan-bulan',
  },

  faucet: {
    title: 'Dapatkan token ujian',
    desc:
      'LOVE9 pada rangkaian ujian A1 tiada nilai sebenar — ia wujud supaya anda boleh membayar gas ' +
      'semasa menguji. Masukkan alamat dompet dan kami hantar sedikit dengan segera.',
    addressLabel: 'Alamat dompet anda',
    addressFromWallet: 'Diisi daripada dompet yang anda sambungkan. Ubah jika token perlu pergi ke alamat lain.',
    useWalletAddress: 'Guna alamat dompet saya',
    addressPlaceholder: '0x… (40 aksara heksadesimal)',
    requestCta: 'Hantar token kepada saya',
    sending: 'Menghantar…',
    addressHelp: 'Tampal alamat dompet yang sepatutnya menerima token. Tekan “Tambah rangkaian ke dompet” di atas jika anda belum berbuat demikian.',
    addNetwork: 'Tambah rangkaian ke dompet',
    addNetworkDone: 'Ditambah ke dompet',
    addNetworkRejected: 'Anda menekan tolak dalam dompet. Tekan sekali lagi jika anda mahu menambah rangkaian.',
    addNetworkError: 'Dompet anda tidak dapat menambah rangkaian. Tambah secara manual menggunakan tetapan di sebelah ini — dan hantar baris di bawah kepada pasukan:',
    noWallet: 'Tiada dompet ditemui dalam pelayar ini. Pasang MetaMask dan muat semula halaman.',
    quotaLabel: 'Baki kuota',
    quotaFormat: '{left}/{total} permintaan setiap {hours} jam',
    quotaExhausted: 'Anda telah menggunakan keseluruhan kuota anda. Cuba lagi dalam {minutes} minit.',
    quotaUnreadable: 'Tidak dapat membaca kuota anda — anda masih boleh membuat permintaan, cuma tidak tahu berapa yang berbaki.',
    sentOk: 'Menghantar {count} {symbol} ke {address}',
    viewTransaction: 'Lihat transaksi',
    settingsTitle: 'Tetapan rangkaian',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Simbol',
    settingsDecimals: 'Perpuluhan',
    settingsExplorer: 'Penjelajah',
    decimalsHelp:
      'Dompet memaparkan 18 tempat perpuluhan kerana C-Chain menjalankan EVM. Pada P/X-Chain, LOVE9 ' +
      'dikira dengan 9 tempat perpuluhan. Satu syiling, dua skala — bukan dua token berbeza.',
    genericError: 'Tidak dapat menghantar. {detail}',
  },

  langPicker: {
    label: 'Bahasa',
    machineBadge: 'mesin',
    machineNote: 'Hanya versi Vietnam yang telah disemak oleh manusia. Terjemahan lain dibuat oleh mesin dan mungkin salah — versi Inggeris ialah sumber rujukan yang sah.',
    notAvailable: 'belum tersedia',
  },

  errors: {
    unreachable: 'Tidak dapat menghubungi rangkaian',
    unreachableDesc: 'Rangkaian mungkin sibuk, atau sambungan anda mungkin terputus.',
    empty: 'Belum ada apa-apa di sini',
    addressEmpty: '{label} tidak boleh kosong',
    addressFormat: '{label} mesti 0x diikuti 40 aksara heksadesimal',
    addressChecksum: '{label} gagal checksum EIP-55 — berkemungkinan besar satu aksara tersilap taip atau hilang semasa menampal',
    addressZero: '{label} tidak boleh menjadi alamat sifar — tiada sesiapa memegang kuncinya',
    timeout: 'Tiada jawapan selepas {seconds}s',
    notJson: 'Jawapan bukan JSON (HTTP {status}) — permintaan berkemungkinan besar dihalakan ke tempat yang salah',
    noWallet: 'Tiada wallet ditemui dalam pelayar ini.',
  },

  notFound: {
    code: '404',
    title: 'Halaman ini tidak wujud',
    desc:
      'Alamat yang anda buka tidak wujud pada 9Chain Testnet A1. ' +
      'Mungkin ia telah dinamakan semula, atau URL kehilangan beberapa aksara semasa disalin.',
    topPagesTitle: 'Tiga halaman yang paling kerap digunakan:',
    navLabel: 'Ke mana seterusnya',
    goHome: 'Kembali ke laman utama',
    goFaucet: 'Dapatkan token ujian',
    goLaunch: 'Lancarkan rantaian anda',
    lookingForTx: 'Mencari sesuatu transaksi atau alamat? Semak cincangannya dan cuba lagi.',
  },
};

export default ms;
