import type { Dict } from '../en';

/**
 * Bahasa Indonesia — terjemahan mesin, belum diperiksa manusia.
 * Bahasa sumber adalah Inggris (`../en.ts`); bila berbeda, versi Inggris yang berlaku.
 *
 * 🔴 Tiga tempat ini tidak boleh diperhalus: `reGenesis.*` (jaringan akan dihapus),
 * `deChain.soatMoTa` (pintu satu arah), `chainCuaToi.thuHoiY*` (pencabutan tidak
 * mengembalikan nama). Semuanya menyebut "permanen" dan "tidak bisa diubah" agar tidak
 * ada yang kehilangan aset karena mengira masih bisa diulang.
 */
export const id: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: 'Testnet publik 9Chain — jaringan mandiri yang berjalan di mesin Avalanche',
    tagline: 'jaringan mandiri di mesin Avalanche',
    walletRejected: 'Anda menolak permintaan di dompet Anda. Tidak ada yang berubah.',
    noWalletMobile: 'Browser ponsel tidak bisa memasang ekstensi dompet. Buka halaman ini di dalam aplikasi MetaMask — browser bawaannya sudah memiliki dompet.',
    openInMetaMask: 'Buka di aplikasi MetaMask',
    loading: 'Memuat…',
    retry: 'Coba lagi',
    copy: 'Salin',
    copied: 'Tersalin',
    close: 'Tutup',
    openMenu: 'Buka menu',
    closeMenu: 'Tutup menu',
    switchToDark: 'Beralih ke mode gelap',
    switchToLight: 'Beralih ke mode terang',
    skipToContent: 'Lompat ke konten utama',
    stepDone: ' — selesai',
    stepRunning: ' — berjalan',
    stepFailed: ' — gagal',
    stepPending: ' — menunggu',
  },

  presets: {
    standard: {
      name: 'Standar',
      desc: 'Chain EVM biasa. Pemilik menerima seluruh token genesis dan hak mengubah biaya.',
    },
    'zero-fee': {
      name: 'Biaya nyaris nol',
      desc: 'baseFee = 1 wei, jadi transaksi membayar tepat batas bawah itu (satu transfer berbiaya 0,000000000000021 LOVE9). Cocok untuk game, eksperimen, dan chain internal. Imbalannya: hampir tidak ada yang menahan spam.',
    },
    'high-throughput': {
      name: 'Throughput tinggi',
      desc: 'Lima kali lebih banyak transaksi per blok (gasLimit 60 juta, bukan 12 juta). Cocok untuk game, bursa, dan apa pun dengan aliran transaksi kecil yang stabil. Imbalannya: blok lebih berat, dan siapa pun yang menjalankan node untuk chain ini butuh mesin lebih kuat.',
    },
    mintable: {
      name: 'Pasokan dapat dicetak',
      desc: 'Pemilik dapat mencetak token native tambahan kapan saja lewat precompile 0x0200000000000000000000000000000000000001. Pasokan TIDAK tetap — siapa pun yang memakai chain ini harus tahu itu.',
    },
    'owner-deploy-only': {
      name: 'Hanya pemilik yang boleh men-deploy kontrak',
      desc: 'Orang lain tetap bisa mengirim transaksi dan memakai kontrak yang ada, tetapi tidak bisa men-deploy kontrak sendiri. Pemilik memberikan hak itu kepada siapa pun lewat precompile 0x0200000000000000000000000000000000000000.',
    },
    permissioned: {
      name: 'Berizin (hanya pengirim yang disetujui)',
      desc: 'Hanya alamat terdaftar yang bisa MENGIRIM transaksi. Cocok untuk chain internal perusahaan. ⚠️ Ini preset paling ketat: dompet asing yang tiba di sini tidak bisa berbuat apa-apa.',
    },
  },
  steps: {
    genesis: 'Membangun genesis',
    subnet: 'Membuat subnet + blockchain di P-Chain',
    rpc: 'Menunggu RPC L1 menjawab',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',

    banner: 'A1 dibangun ulang pada {date}. Setiap saldo dan rantai yang dibuat sebelum tanggal itu sudah tidak ada.',
    bannerLink: 'Apa artinya',
    badge: 'Dibangun ulang',

    title: 'A1 dibangun ulang pada {date}',
    desc:
      'Jaringan uji A1 telah dibangun ulang dari blok 0. Rantai, saldo, dan riwayat transaksi ' +
      'yang dibuat sebelum tanggal itu sudah tidak ada — bukan disembunyikan, melainkan lenyap. ' +
      'Halaman ini menjelaskan apa yang Anda lihat dan apa yang perlu dilakukan.',

    willSeeTitle: 'Apa yang akan Anda lihat',
    willSee1:
      'Dompet Anda tetap terhubung, tetap menampilkan nama jaringan yang benar dan Chain ID yang ' +
      'sama {chainId} — itu disengaja. Tetapi saldo Anda akan 0.',
    willSee2:
      'Setiap L1 yang Anda luncurkan hilang dari direktori. Nama dan Chain ID-nya bebas kembali, ' +
      'dan siapa pun dapat mengambilnya.',
    willSee3:
      'Jika Anda pernah menandatangani transaksi tetapi belum pernah menyiarkannya, jangan siarkan ' +
      'sekarang — transaksi itu milik jaringan yang sudah tidak ada.',

    toDoTitle: 'Apa yang perlu Anda lakukan',
    toDo1: 'Minta token uji lagi dari faucet. Kuota telah diatur ulang untuk semua orang.',
    toDo2:
      'Hapus setiap L1 dari dompet Anda — masing-masing punya Chain ID sendiri dan kini tidak ' +
      'menunjuk ke mana-mana. Jaringan utama A1 TIDAK perlu dihapus; pengaturannya tidak berubah.',
    toDo3: 'Luncurkan rantai Anda lagi bila diperlukan. Nama lama mungkin sudah diambil orang lain.',

    archiveTitle: 'Arsip jaringan lama',
    archiveDesc:
      'Keadaan akhir jaringan sebelum dibangun ulang telah diekspor dan hash-nya diterbitkan, ' +
      'sehingga siapa pun yang ingin memeriksanya bisa melakukannya.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1 akan dibangun ulang pada {date} — setiap rantai, saldo, dan transaksi yang dibuat sebelumnya akan dihapus.',
    bannerLink: 'Rincian',
    badge: 'Pembangunan ulang akan datang',

    title: 'A1 akan dibangun ulang pada {date}',
    desc:
      'Seluruh jaringan uji A1 akan dibangun ulang dari blok 0. Semua yang dibuat sebelum tanggal ' +
      'itu akan hilang — bukan disembunyikan, melainkan tidak lagi ada. Halaman ini menyatakan ' +
      'dengan tepat apa yang hilang dan apa yang perlu Anda lakukan.',

    whyTitle: 'Mengapa pembangunan ulang diperlukan',
    why1:
      'Genesis sebuah jaringan bersifat tidak dapat diubah. Justru itulah yang membuatnya layak ' +
      'dipercaya — tidak seorang pun, termasuk para pembuatnya, dapat mengubah sebuah angka setelah ' +
      'angka itu ditulis ke dalam blok 0.',
    why2:
      'Harganya: mengubah sebuah angka di dalam genesis tidak menyisakan pilihan selain membangun ' +
      'ulang jaringan dari awal. A1 menaikkan total pasokan menjadi 9.000.000.000 LOVE9, dan seluruh ' +
      'rentang parameter staking harus dihitung ulang agar sesuai.',
    why3:
      'Ini adalah testnet, dan membangun ulang adalah hal yang boleh dilakukan sebuah testnet. ' +
      'Justru itulah alasan testnet ada: agar perubahan seperti ini terjadi di sini, bukan di mainnet.',

    lostTitle: 'Apa yang akan hilang',
    lostDesc: 'Semuanya, tanpa terkecuali:',
    lost1: 'Setiap L1 yang diluncurkan pengguna, termasuk rantai yang berjalan sangat baik.',
    lost2: 'Setiap saldo LOVE9, termasuk token yang diterima dari faucet.',
    lost3: 'Setiap transaksi, setiap blok, seluruh riwayat C-Chain, P-Chain, dan X-Chain.',
    lost4: 'Setiap validator dan setiap delegasi.',

    keptTitle: 'Apa yang disimpan',
    keptDesc:
      'Sebelum penghapusan, seluruh jaringan yang akan mati diekspor beserta hash yang diterbitkan, ' +
      'sehingga catatannya tetap dapat diverifikasi. Apa yang terjadi masih bisa diperiksa, bahkan ' +
      'setelah jaringan yang menjalankannya lenyap. Tautan arsip akan dipasang di sini pada hari ' +
      'pembangunan ulang.',

    toDoTitle: 'Apa yang perlu Anda lakukan',
    toDoBefore: 'Sebelum pembangunan ulang:',
    toDo1:
      'Jangan membangun apa pun di A1 sekarang yang bergantung pada data bertahan. Kalau Anda sedang ' +
      'mencoba sebuah gagasan, silakan — hanya saja jangan perlakukan rantai saat ini sebagai penyimpanan.',
    toDoAfter: 'Setelah pembangunan ulang:',
    toDo2:
      'Hapus dari dompet Anda setiap L1 yang Anda tambahkan — rantai itu sudah tidak ada, dan dompet ' +
      'yang menunjuk ke sana hanya akan diam. Jaringan utama A1 tidak perlu dihapus: pengaturannya ' +
      'tidak berubah.',
    toDo3:
      'Jika dompet Anda belum memiliki jaringan A1, tambahkan lewat tombol di halaman faucet, ' +
      'bukan dengan mengetik pengaturannya secara manual.',
    toDo4: 'Minta token dari faucet lagi, dan luncurkan rantai Anda lagi bila menginginkannya.',

    silentTitle: 'Dompet Anda tidak akan memperingatkan Anda',
    silentDesc:
      'Jaringan baru mempertahankan Chain ID {chainId}, alamat RPC yang sama, dan nama yang sama ' +
      'dengan yang lama. Itu disengaja — agar setiap dokumen dan panduan yang sudah terbit tetap ' +
      'benar. Harganya adalah dompet Anda sama sekali tidak punya sinyal bahwa ia baru saja ' +
      'terhubung ke jaringan yang berbeda. Karena itu dua hal di bawah ini akan terjadi tanpa suara.',
    silent1:
      'Dompet dengan konfigurasi lama tetap terhubung, tetap menampilkan nama jaringan yang benar, ' +
      'dan akan melaporkan saldo 0. Angka itu BENAR: token lama Anda sudah tidak ada, bukan ' +
      'disembunyikan. Anda tidak perlu menambahkan jaringan lagi — cukup minta token baru dari ' +
      'faucet. Jika dompet melaporkan transaksi tersangkut atau nomor urut yang salah, bersihkan ' +
      'data aktivitas jaringan itu di dompet: ia masih mengingat jumlah transaksi rantai yang sudah ' +
      'mati, sedangkan rantai baru menghitung dari 0.',
    silent2:
      'Jika Anda masih menyimpan transaksi bertanda tangan yang belum pernah disiarkan, buanglah. ' +
      'Tanda tangannya tetap sah di jaringan baru, karena Chain ID tidak berubah. Ia akan gagal ' +
      'selama dompet kosong — tetapi begitu Anda meminta token dari faucet ia menjadi dapat ' +
      'dibelanjakan, dan bisa lolos pada saat yang tidak Anda duga.',

    repeatTitle: 'Apakah ini akan terjadi lagi',
    repeatDesc:
      'Mungkin. A1 masih testnet, dan sampai komunitas memilih arah mainnet antara A1 dan C1, kami ' +
      'tetap memegang hak untuk membangun ulang jaringan ketika ada yang harus berubah di dalam ' +
      'genesis. Yang kami janjikan adalah memberi tahu Anda lebih dulu, dan menyatakan dengan jelas ' +
      'apa yang hilang.',

    alreadyTitle: 'Sudah pernah dibangun ulang sekali pada 2026-08-27',
    alreadyDesc:
      'A1 sudah pernah dibangun ulang sekali pada 2026-08-27, sebelum tanggal di bawah ini. Jika Anda memegang token uji sebelum itu, saldo Anda kini 0 — itu benar, bukan kerusakan pada dompet Anda. Tidak ada rantai pengguna yang hilang: direktori hanya berisi rantai uji otomatis. Minta token lagi dari faucet.',
    dateNote: 'Tanggal dapat bergeser',
    dateNoteDesc:
      'Tanggal {date} bergantung pada pemeriksaan go/no-go sebelumnya. Jika bergeser, kami akan ' +
      'mengubah tanggal di halaman ini, bukan berdiam diri.',
  },

  footer: {
    tryIt: 'Coba',
    explore: 'Jelajahi',
    about: 'Tentang',
    explorer: 'Explorer 9Scan-A1',
    mainSite: 'Situs utama 9Chain',
    opensNewTab: '(terbuka di tab baru)',
    navLabel: 'Tautan footer',
    rebuildPlan: 'Rencana pembangunan ulang jaringan',
  },

  nav: {
    home: 'Beranda',
    faucet: 'Ambil token uji',
    launch: 'Luncurkan rantai',
    myChains: 'Rantai saya',
    compare: 'A1 ↔ C1',
    directory: 'Direktori L1',
    explorer: 'Explorer',
    explorerAria: 'Buka 9Scan-A1 di tab baru',
  },

  home: {
    testnetBadge: 'Testnet — token tidak punya nilai nyata',
    primaryCta: 'Luncurkan rantai Anda',
    secondaryCta: 'Ambil token uji dulu',

    title: 'Luncurkan rantai Anda sendiri di A1',
    subtitle: 'Sebuah L1 milik Anda sendiri, dimiliki oleh dompet yang Anda pakai menandatangani, berjalan sungguhan di jaringan uji. Perlu sekitar tiga menit.',
    tableCaption: 'Setiap baris adalah rantai nyata yang berjalan di A1, dengan pemiliknya sendiri.',
    colChain: 'Rantai',
    colType: 'Jenis',
    colOwner: 'Pemilik',
    systemDefault: 'bawaan sistem',
    emptyTitle: 'Belum ada L1 yang berjalan',
    emptyDesc: 'Anda akan menjadi yang pertama. Direktori diperbarui begitu rantai Anda menyala.',
    moreChains: 'Lihat semua {count} chain di direktori',

    disclosure: '9 dari 11 validator berjalan di server yang sama, dengan penyedia yang sama; dua lainnya bergabung dari tempat lain dan hanya satu yang daring — terdesentralisasi di tingkat protokol, belum di tingkat infrastruktur.',
    idleBlocksNote: 'Avalanche tidak memproduksi blok kosong, jadi tinggi blok yang diam saat tidak ada yang bertransaksi adalah hal normal. Ukuran hidup-matinya adalah jumlah validator di sebelahnya.',
  },

  stats: {
    title: 'Jaringan aktif',
    validators: 'Validator terhubung',
    l1Count: 'L1 berjalan',
    blockHeight: 'Blok C-Chain',
    measuring: 'Mengukur jaringan…',
    cannotMeasure: 'Tidak dapat membaca statistik jaringan',
    cannotMeasureDesc: 'Halaman tetap berfungsi — ini hanya tampilan status.',
  },
  directory: {
    lede: 'Setiap chain di testnet A1, dan keadaan sebenarnya masing-masing.',
    howToTitle: 'Cara membaca tabel ini.',
    howToBody: 'Avalanche tidak menghasilkan blok kosong — sebuah chain hanya menghasilkan blok ketika ada transaksi, jadi hitungan blok yang diam adalah hal normal dan bukan berarti chain-nya mati. Kasus sebaliknya justru berbahaya: chain tanpa validator tetap menjawab RPC, tetap membiarkan saldo dibaca, dan wallet tetap bisa terhubung — tetapi setiap transaksi menggantung selamanya. Karena itu tanda hidup yang sebenarnya di sini adalah jumlah validator subnet, dibaca langsung dari P-Chain, bukan ketinggian blok.',
    ownerTitle: 'Pemilik (admin)',
    ownerBody: 'adalah alamat yang diberikan saat chain diluncurkan. Ia memegang seluruh pasokan genesis dan hak mengubah biaya chain itu — chain itu miliknya, bukan milik yayasan. Chain yang diluncurkan sebelum konsol memiliki kolom ini menampilkan nilai bawaan sistem.',
    mainNetwork: 'JARINGAN UTAMA',
    mainNetworkDesc: 'C-Chain testnet A1 — tempat faucet dan explorer bekerja.',
    running: 'BERJALAN',
    notAnswering: 'TIDAK MENJAWAB',
    notAnsweringDesc: 'RPC tidak menjawab — mungkin belum ada node yang melacak subnet ini.',
    unclear: 'BELUM JELAS',
    unclearDesc: 'Tidak bisa membaca kumpulan validator dari P-Chain.',
    ownerAdmin: 'Pemilik (admin)',
    blocks: 'Blok',
    subnetValidators: 'Validator subnet',
    created: 'Dibuat',
    revokedAt: 'Dicabut pada',
    copyOwner: 'Salin alamat pemilik',
    revoked: 'DICABUT',
    revokedDesc: 'Chain ini sudah berhenti melayani: tidak ada node yang menjalankannya lagi dan RPC-nya tidak lagi menjawab. Jika Anda pernah menambahkan jaringan ini ke wallet, hapuslah — membiarkannya hanya menghasilkan galat koneksi.',
    neverReissued: 'tidak pernah diterbitkan lagi untuk chain lain',
    revokedGroup: 'Dicabut ({count})',
    listError: 'Tidak bisa membaca daftar chain ({error}). Jaringan utama tetap ditampilkan di bawah.',
    footSummary: '{count} L1 berjalan + jaringan utama',
    footRevoked: '{count} dicabut',
    footUpdated: 'diperbarui pada {time}',
    tileTotal: 'L1 di direktori',
    tileRunning: 'Terukur berjalan',
    tileAttention: 'Perlu perhatian',
    tileRevoked: 'Dicabut',
    sweepProgress: 'Terukur {done} dari {total}',
    measuringDesc: 'Dalam antrean pengukuran.',
    howToToggle: 'Cara membaca daftar ini',
    searchLabel: 'Cari',
    searchPlaceholder: 'Nama, Chain ID, pemilik, atau blockchain ID',
    filterStatus: 'Status',
    filterAll: 'Semua',
    filterRunning: 'Berjalan',
    filterAttention: 'Perlu perhatian',
    filterRevoked: 'Dicabut',
    filterType: 'Jenis',
    filterTypeAll: 'Semua jenis',
    groupBy: 'Kelompokkan',
    groupNone: 'Tanpa kelompok',
    groupOwner: 'Pemilik',
    groupType: 'Jenis',
    groupStatus: 'Status',
    groupNoType: 'Jenis tidak tercatat',
    groupCount: '{shown} dari {total}',
    sortBy: 'Urutkan',
    sortNewest: 'Terbaru dulu',
    sortOldest: 'Terlama dulu',
    sortName: 'Nama',
    sortChainId: 'Chain ID',
    sortBlocks: 'Blok terbanyak',
    refresh: 'Ukur lagi',
    listCaption: 'Chain di A1, dengan status terukur masing-masing',
    showing: 'Menampilkan {shown} dari {total}',
    showMore: 'Tampilkan {count} lagi',
    noMatchTitle: 'Tidak ada chain yang cocok',
    noMatchDesc: 'Coba kata lain, atau hapus filter.',
    clearFilters: 'Hapus filter',
    showDetails: 'Detail',
    hideDetails: 'Sembunyikan',
    detailsOf: 'Detail {name}',
    nativeToken: 'Token asli',
    mismatch: 'CHAIN SALAH',
    mismatchDesc: 'RPC menjawab dengan Chain ID {got}, bukan {expected} — kemungkinan besar kesalahan routing, bukan chain ini.',
  },


  loadTest: {
    badge: 'Uji beban',
    banner: 'Kami sedang menjalankan uji beban publik — {tps} transaksi per detik, dihasilkan oleh kami, bukan pengguna nyata.',
    bannerLink: 'Lihat angka langsung',
    title: 'Uji beban publik',
    intro: 'A1 adalah jaringan uji yang masih muda dengan sangat sedikit pengguna nyata, sehingga jika dibiarkan sendiri ia nyaris tidak menghasilkan blok. Kami menghasilkan aliran transaksi yang tetap agar jaringan terus bekerja dan Anda bisa melihatnya bekerja. Lalu lintas ini milik kami. Ini bukan penggunaan, dan kami tidak menghitungnya sebagai penggunaan — setiap alamat yang mengirimnya tercantum di bawah agar Anda dapat menguranginya.',
    running: 'Sedang berjalan',
    stopped: 'Tidak berjalan saat ini',
    stoppedWhy: 'Alasan yang tercatat: {reason}',
    labelTps: 'Transaksi per detik',
    labelBlockHeight: 'Blok C-Chain',
    labelSecondsPerBlock: 'Detik per blok',
    labelTotal: 'Transaksi terkonfirmasi sejak mulai',
    labelUptime: 'Berjalan selama',
    committedNote: 'Angka-angka ini dihitung dari bloknya sendiri, bukan dari apa yang kami coba kirim. Transaksi yang diterima jaringan tetapi tidak pernah dimasukkan ke dalam blok tidak dihitung di sini.',
    addressesTitle: 'Sembilan alamat pengirim',
    addressesNote: 'Setiap transaksi dari alamat-alamat ini dihasilkan mesin kami. Saring keluar untuk melihat aktivitas nyata yang ada.',
    measuring: 'Membaca status uji beban…',
    notMeasured: 'Tidak dapat membaca status uji beban',
    notMeasuredMore: 'Halaman tetap berfungsi — ini hanya tampilan status.',
  },

  launch: {
    title: 'Luncurkan rantai Anda',
    desc:
      'Sebuah L1 khusus, dimiliki oleh dompet Anda. Anda menandatangani sekali untuk membuktikan ' +
      'siapa Anda, meninjau, lalu jaringan membangun rantainya dalam sekitar tiga menit.',

    connectWallet: 'Hubungkan dompet',
    connecting: 'Menghubungkan…',
    signIn: 'Masuk',
    signing: 'Menunggu tanda tangan…',
    yourWallet: 'Dompet Anda',
    youWillOwn: 'Rantai akan menjadi milik dompet ini. Alamatnya berasal dari tanda tangan Anda — tidak ada yang mengetikkannya.',
    noWallet: 'Tidak ada dompet di peramban ini. Pasang MetaMask lalu muat ulang halaman.',
    signRejected: 'Anda menolak menandatangani. Tidak ada yang dibuat.',
    switchWallet: 'Gunakan dompet lain',

    nameLabel: 'Nama rantai',
    namePlaceholder: 'Contoh: MyChain',
    nameHelp:
      'Huruf, angka, dan spasi. 2–32 karakter. Di jaringan ini nama yang pernah dipakai tidak ' +
      'pernah diterbitkan ulang — bahkan untuk rantai yang sudah dicabut.',
    nameInvalid: 'Nama hanya boleh berisi huruf, angka, dan spasi, sepanjang 2–32 karakter.',
    typeLabel: 'Jenis rantai',
    typeHelp: 'Setelah dipilih, ini tetap — genesis sebuah rantai tidak dapat disunting.',
    slotsLeft: '{left}/{total} slot tersisa',
    slotsFull: 'Tidak ada slot tersisa',
    slotsFullDesc:
      'Model saat ini membuat setiap validator melacak setiap L1, dan protokol mengeluarkan node ' +
      'yang mendeklarasikan lebih dari 16 subnet. Ini batas keras dan tidak dapat dinaikkan. ' +
      'Mencabut sebuah rantai mengembalikan satu slot.',
    reviewCta: 'Tinjau sebelum mengirim',

    reviewTitle: 'Tinjau — ini pintu satu arah',
    reviewDesc:
      'Genesis sebuah L1 yang sudah diluncurkan TIDAK DAPAT DIUBAH. Setelah langkah ini nama, jenis ' +
      'rantai, dan pemilik tidak dapat diubah — dan pencabutan juga tidak akan mengembalikan nama ' +
      'maupun chain ID.',
    reviewRebuild:
      'Satu hal lagi yang perlu diketahui sebelum menekan: A1 membangun ulang seluruh jaringan pada ' +
      '{date}. Rantai yang Anda luncurkan hari ini akan terhapus bersama jaringan lama — bukan ' +
      'disembunyikan, melainkan lenyap.',
    reviewName: 'Nama rantai',
    reviewType: 'Jenis rantai',
    reviewOwner: 'Pemilik',
    reviewBack: 'Kembali dan sunting',
    reviewConfirm: 'Saya sudah meninjau — luncurkan rantainya',

    launching: 'Meluncurkan rantai “{name}”',
    launchingDesc:
      'Node dimulai ulang SATU PER SATU agar jaringan tidak pernah kehilangan kuorum — itulah ' +
      'sebabnya lambat, dan itu disengaja. Jangan tutup tab; kalaupun ditutup, rantainya tetap dibangun.',
    etaRemaining: 'Sekitar {minutes} menit lagi',
    preparing: 'Menyiapkan…',

    doneTitle: 'Selesai — rantai “{name}” berjalan',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Tambahkan rantai ke dompet',
    doneAdded: 'Ditambahkan ke dompet',
    doneActivate: 'Aktifkan rantai (buka blok 1)',
    doneActivated: 'Diaktifkan',
    doneActivating: 'Menunggu dompet…',
    doneAddWalletError: 'Tidak dapat menambahkan rantai ke dompet Anda. {detail}',
    doneActivateError: 'Tidak dapat mengaktifkan rantai. {detail}',

    launchAnother: 'Luncurkan rantai lain',
    launchError: 'Tidak dapat meluncurkan rantai. {detail}',
    unknownError: 'Rantai tidak muncul di direktori setelah proses selesai.',
    noteTitle: 'Transaksi pertama pada rantai baru',
    noteHow:
      'Jangan percayai perkiraan gas untuk transaksi pertama. Cara termurah membuka blok 1 adalah ' +
      'transfer biasa — tekan “Aktifkan rantai” di bawah.',
  },

  myChains: {
    title: 'Rantai saya',
    desc: 'L1 yang dimiliki oleh dompet yang Anda pakai masuk. Rantai dapat dicabut, tetapi baca peringatannya dulu.',
    connectWallet: 'Hubungkan dompet Anda untuk melihat rantai Anda',
    emptyTitle: 'Dompet ini belum memiliki rantai apa pun',
    emptyDesc: 'Luncurkan satu lalu kembali — rantainya akan langsung muncul di sini.',
    emptyCta: 'Luncurkan rantai Anda',

    colChain: 'Rantai',
    colType: 'Jenis',
    colStatus: 'Status',
    colActions: '',

    validatorCount: '{count} validator',
    measuring: 'mengukur',
    cannotMeasure: 'tidak dapat diukur',
    statusHelp: 'Diukur dari jumlah validator subnet, bukan dari tinggi blok.',
    noValidators: '0 validator',
    noValidatorsDesc:
      'Rantai ini TIDAK dapat menyelesaikan transaksi apa pun: subnet-nya tidak punya validator. ' +
      'Ia tetap menjawab panggilan RPC dan dompet tetap terhubung, sehingga tidak ada tanda kasat ' +
      'mata lainnya.',

    walletSettings: 'Pengaturan dompet',
    addToWallet: 'Tambahkan ke dompet',
    addedToWallet: 'Ditambahkan',
    addWalletError: 'Tidak dapat menambahkannya ke dompet Anda. {detail}',

    revoke: 'Cabut',
    revokeTitle: 'Cabut “{name}”?',
    revokeWarn1: 'Rantai langsung berhenti melayani RPC dan hilang dari direktori publik.',
    revokeWarn2:
      'Pencabutan TIDAK menghapus subnet di P-Chain — apa yang sudah dibuat di sana tidak dapat ' +
      'dihilangkan selama jaringan ini berjalan. Pencabutan juga tidak menghapus jaringan dari ' +
      'dompet orang-orang yang sudah menambahkan rantai ini.',
    revokeWarn3:
      'Nama dan Chain ID tetap dipesan dan TIDAK PERNAH diterbitkan ulang kepada siapa pun di ' +
      'jaringan ini. Menerbitkan ulang sebuah Chain ID akan membuat dompet bekas pengguna diam-diam ' +
      'menunjuk ke rantai milik orang lain.',
    revokeWarn4: 'Sebagai gantinya, satu dari 15 slot dikembalikan.',
    revokeTypeLabel: 'Ketik nama rantai persis untuk mengonfirmasi',
    revokeNameMismatch: 'Itu tidak cocok dengan nama rantai.',
    revokeConfirm: 'Cabut permanen',
    revokeCancel: 'Batal',
    revoking: 'Mencabut “{name}” — sekitar tiga menit',
    revokeDone: '“{name}” dicabut. {left}/{total} slot tersisa.',
    revokeError: 'Tidak dapat mencabut. {detail}',
    revokeUnknown: 'Rantai masih ada di direktori setelah proses selesai.',

    revokedBadge: 'Dicabut',
    revokedDesc: 'Nama dan Chain ID tetap dipesan di jaringan ini.',
  },

  compare: {
    title: 'A1 ↔ C1 — perbandingan',
    desc:
      '9Chain menjalankan DUA testnet dari produk yang sama secara berdampingan, berbeda pada ' +
      'mesinnya: A1 di mesin Avalanche, C1 di mesin Cosmos. Tabel ini mencatat pertukaran untung-rugi ' +
      'antara kedua arah, diterbitkan agar siapa pun dapat membantahnya — sisi C1 belum punya ' +
      'pengukuran langsung.',

    selfScoreTitle: 'Nilai di bawah ini DINILAI SENDIRI oleh tim, bukan diukur secara independen',
    selfScoreDesc:
      'Kolom "bagaimana diukur" menyatakan cara setiap kriteria diperiksa. Kriteria tanpa pengukuran ' +
      'bertanggal adalah penilaian arsitektural, bukan data. Bobotnya Anda yang menentukan — nilainya ' +
      'mengikuti.',

    colNo: '#',
    colCriterion: 'Kriteria',
    colKind: 'Jenis',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Bobot',
    kindArchitecture: 'arsitektur',
    kindLiveData: 'data langsung',

    totalScore: 'Nilai total memakai bobot Anda',
    tied: 'Seri',
    leads: 'unggul',

    liveDataTitle: 'Data langsung',
    a1Validators: 'A1 — validator terhubung',
    a1Chains: 'A1 — L1 berjalan',
    a1Blocks: 'A1 — blok C-Chain',
    c1Unreachable: 'C1 — tidak terjangkau',
    c1UnreachableDesc:
      'URL REST Cosmos milik C1 (port 1317) dibutuhkan. Tabel tetap berfungsi: sisi A1 adalah data ' +
      'langsung, sisi C1 adalah penilaian arsitektural seperti kriteria lainnya.',
    measuring: 'mengukur…',
    cannotMeasure: 'tidak dapat diukur',
    critDecentralisation: 'Desentralisasi (batas atas jumlah validator)',
    noteDecentralisation: 'Batas PROTOKOL: Snowman ~ribuan node vs CometBFT ~150. A1 HARI INI: 9 node, satu mesin, satu penyedia',
    critFinality: 'Finalitas',
    noteFinality: '~1–2 detik vs ~5–6 detik',
    critEvmMaturity: 'Kematangan EVM',
    noteEvmMaturity: 'coreth sudah produksi vs Cosmos EVM pra-v1',
    critWalletCompat: 'Kecocokan dompet ritel / DeFi',
    noteWalletCompat: 'MetaMask/EVM penuh',
    critLaunchUx: 'Pengalaman meluncurkan chain',
    noteLaunchUx: 'keduanya punya konsol; di A1 terukur ~170 detik per peluncuran',
    critInterop: 'Keluasan interoperabilitas',
    noteInterop: 'Warp/ICM di dalam ekosistem (A1 sudah memindahkan aset, M6.2) vs jangkauan IBC',
    critOpCost: 'Biaya operasi per chain',
    noteOpCost: 'node + plugin vs operator K8s',
    critBootstrap: 'Memulai efek jaringan',
    noteBootstrap: 'pulau sendiri vs IBC yang tercolok ke ekonomi Cosmos',
    critEconSecurity: 'Keamanan ekonomi publik',
    noteEconSecurity: 'PoS berjaminan token sejak awal',
    critSwitchCost: 'Biaya pindah bagi tim',
    noteSwitchCost: 'A1 masih baru vs C1 yang sudah berjalan berbulan-bulan',
  },

  faucet: {
    title: 'Ambil token uji',
    desc:
      'LOVE9 di testnet A1 tidak punya nilai nyata — ia ada agar Anda bisa membayar gas saat menguji. ' +
      'Masukkan alamat dompet dan kami langsung mengirimkan sebagian.',
    addressLabel: 'Alamat dompet Anda',
    addressFromWallet: 'Diisi dari dompet yang Anda hubungkan. Ubah jika token harus dikirim ke alamat lain.',
    useWalletAddress: 'Pakai alamat dompet saya',
    addressPlaceholder: '0x… (40 karakter heksadesimal)',
    requestCta: 'Kirimkan token',
    sending: 'Mengirim…',
    addressHelp: 'Tempelkan alamat dompet yang akan menerima token. Tekan “Tambahkan jaringan ke dompet” di atas bila belum.',
    addNetwork: 'Tambahkan jaringan ke dompet',
    addNetworkDone: 'Ditambahkan ke dompet',
    addNetworkRejected: 'Anda menekan tolak di dompet. Tekan lagi bila ingin menambahkan jaringan.',
    addNetworkError: 'Dompet Anda tidak dapat menambahkan jaringan. Tambahkan manual memakai pengaturan di sebelah ini — dan kirim baris di bawah kepada tim:',
    noWallet: 'Tidak ada dompet di peramban ini. Pasang MetaMask lalu muat ulang halaman.',
    quotaLabel: 'Sisa kuota',
    quotaFormat: '{left}/{total} permintaan per {hours} jam',
    quotaExhausted: 'Anda sudah memakai seluruh kuota. Coba lagi dalam {minutes} menit.',
    quotaUnreadable: 'Tidak dapat membaca kuota Anda — Anda tetap bisa meminta, hanya saja tidak tahu sisanya berapa.',
    sentOk: 'Mengirim {count} {symbol} ke {address}',
    viewTransaction: 'Lihat transaksi',
    settingsTitle: 'Pengaturan jaringan',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Simbol',
    settingsDecimals: 'Desimal',
    settingsExplorer: 'Explorer',
    decimalsHelp:
      'Dompet menampilkan 18 desimal karena C-Chain menjalankan EVM. Di P/X-Chain, LOVE9 dihitung ' +
      'dalam 9 desimal. Satu koin, dua skala — bukan dua token berbeda.',
    genericError: 'Tidak dapat mengirim. {detail}',
  },

  langPicker: {
    label: 'Bahasa',
    machineBadge: 'mesin',
    machineNote: 'Hanya versi Vietnam yang telah diperiksa manusia. Terjemahan lain dibuat mesin dan mungkin keliru — versi Inggris adalah sumber kebenaran.',
    notAvailable: 'belum tersedia',
  },

  errors: {
    unreachable: 'Tidak dapat menjangkau jaringan',
    unreachableDesc: 'Jaringan mungkin sedang sibuk, atau koneksi Anda terputus.',
    empty: 'Belum ada apa-apa di sini',
    addressEmpty: '{label} tidak boleh kosong',
    addressFormat: '{label} harus 0x diikuti 40 karakter heksadesimal',
    addressChecksum: '{label} gagal checksum EIP-55 — kemungkinan besar ada satu karakter salah ketik atau hilang saat menempel',
    addressZero: '{label} tidak boleh alamat nol — tidak ada yang memegang kuncinya',
    timeout: 'Tidak ada jawaban setelah {seconds}s',
    notJson: 'Jawabannya bukan JSON (HTTP {status}) — kemungkinan besar permintaan diarahkan ke tempat yang salah',
    noWallet: 'Tidak ada wallet yang ditemukan di peramban ini.',
  },

  notFound: {
    code: '404',
    title: 'Halaman ini tidak ada',
    desc:
      'Alamat yang Anda buka tidak ada di 9Chain Testnet A1. ' +
      'Mungkin namanya telah diubah, atau URL-nya kehilangan beberapa karakter saat disalin.',
    topPagesTitle: 'Tiga halaman yang paling sering dipakai:',
    navLabel: 'Ke mana selanjutnya',
    goHome: 'Kembali ke beranda',
    goFaucet: 'Ambil token uji',
    goLaunch: 'Luncurkan rantai Anda',
    lookingForTx: 'Mencari sebuah transaksi atau alamat? Periksa hash-nya lalu coba lagi.',
  },
};

export default id;
