import type { Tu } from '../en';

/**
 * Bahasa Indonesia — terjemahan mesin, belum diperiksa manusia.
 * Bahasa sumber adalah Inggris (`../en.ts`); bila berbeda, versi Inggris yang berlaku.
 *
 * 🔴 Tiga tempat ini tidak boleh diperhalus: `reGenesis.*` (jaringan akan dihapus),
 * `deChain.soatMoTa` (pintu satu arah), `chainCuaToi.thuHoiY*` (pencabutan tidak
 * mengembalikan nama). Semuanya menyebut "permanen" dan "tidak bisa diubah" agar tidak
 * ada yang kehilangan aset karena mengira masih bisa diulang.
 */
export const id: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'Testnet publik 9Chain — jaringan mandiri yang berjalan di mesin Avalanche',
    tagTitle: 'jaringan mandiri di mesin Avalanche',
    viTuChoi: 'Anda menolak permintaan di dompet Anda. Tidak ada yang berubah.',
    dangTai: 'Memuat…',
    thuLai: 'Coba lagi',
    saoChep: 'Salin',
    daChep: 'Tersalin',
    dong: 'Tutup',
    moMenu: 'Buka menu',
    dongMenu: 'Tutup menu',
    chuyenSangToi: 'Beralih ke mode gelap',
    chuyenSangSang: 'Beralih ke mode terang',
    boQuaToiNoiDung: 'Lompat ke konten utama',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',

    bang: 'A1 dibangun ulang pada {ngay}. Setiap saldo dan rantai yang dibuat sebelum tanggal itu sudah tidak ada.',
    bangNut: 'Apa artinya',
    nhan: 'Dibangun ulang',

    tieuDe: 'A1 dibangun ulang pada {ngay}',
    moTa:
      'Jaringan uji A1 telah dibangun ulang dari blok 0. Rantai, saldo, dan riwayat transaksi ' +
      'yang dibuat sebelum tanggal itu sudah tidak ada — bukan disembunyikan, melainkan lenyap. ' +
      'Halaman ini menjelaskan apa yang Anda lihat dan apa yang perlu dilakukan.',

    thayGiTieuDe: 'Apa yang akan Anda lihat',
    thayGi1:
      'Dompet Anda tetap terhubung, tetap menampilkan nama jaringan yang benar dan Chain ID yang ' +
      'sama {chainId} — itu disengaja. Tetapi saldo Anda akan 0.',
    thayGi2:
      'Setiap L1 yang Anda luncurkan hilang dari direktori. Nama dan Chain ID-nya bebas kembali, ' +
      'dan siapa pun dapat mengambilnya.',
    thayGi3:
      'Jika Anda pernah menandatangani transaksi tetapi belum pernah menyiarkannya, jangan siarkan ' +
      'sekarang — transaksi itu milik jaringan yang sudah tidak ada.',

    lamGiTieuDe: 'Apa yang perlu Anda lakukan',
    lamGi1: 'Minta token uji lagi dari faucet. Kuota telah diatur ulang untuk semua orang.',
    lamGi2:
      'Hapus setiap L1 dari dompet Anda — masing-masing punya Chain ID sendiri dan kini tidak ' +
      'menunjuk ke mana-mana. Jaringan utama A1 TIDAK perlu dihapus; pengaturannya tidak berubah.',
    lamGi3: 'Luncurkan rantai Anda lagi bila diperlukan. Nama lama mungkin sudah diambil orang lain.',

    luuTieuDe: 'Arsip jaringan lama',
    luuMoTa:
      'Keadaan akhir jaringan sebelum dibangun ulang telah diekspor dan hash-nya diterbitkan, ' +
      'sehingga siapa pun yang ingin memeriksanya bisa melakukannya.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'A1 akan dibangun ulang pada {ngay} — setiap rantai, saldo, dan transaksi yang dibuat sebelumnya akan dihapus.',
    bangNut: 'Rincian',
    nhan: 'Pembangunan ulang akan datang',

    tieuDe: 'A1 akan dibangun ulang pada {ngay}',
    moTa:
      'Seluruh jaringan uji A1 akan dibangun ulang dari blok 0. Semua yang dibuat sebelum tanggal ' +
      'itu akan hilang — bukan disembunyikan, melainkan tidak lagi ada. Halaman ini menyatakan ' +
      'dengan tepat apa yang hilang dan apa yang perlu Anda lakukan.',

    viSaoTieuDe: 'Mengapa pembangunan ulang diperlukan',
    viSao1:
      'Genesis sebuah jaringan bersifat tidak dapat diubah. Justru itulah yang membuatnya layak ' +
      'dipercaya — tidak seorang pun, termasuk para pembuatnya, dapat mengubah sebuah angka setelah ' +
      'angka itu ditulis ke dalam blok 0.',
    viSao2:
      'Harganya: mengubah sebuah angka di dalam genesis tidak menyisakan pilihan selain membangun ' +
      'ulang jaringan dari awal. A1 menaikkan total pasokan menjadi 9.000.000.000 LOVE9, dan seluruh ' +
      'rentang parameter staking harus dihitung ulang agar sesuai.',
    viSao3:
      'Ini adalah testnet, dan membangun ulang adalah hal yang boleh dilakukan sebuah testnet. ' +
      'Justru itulah alasan testnet ada: agar perubahan seperti ini terjadi di sini, bukan di mainnet.',

    matTieuDe: 'Apa yang akan hilang',
    matMoTa: 'Semuanya, tanpa terkecuali:',
    mat1: 'Setiap L1 yang diluncurkan pengguna, termasuk rantai yang berjalan sangat baik.',
    mat2: 'Setiap saldo LOVE9, termasuk token yang diterima dari faucet.',
    mat3: 'Setiap transaksi, setiap blok, seluruh riwayat C-Chain, P-Chain, dan X-Chain.',
    mat4: 'Setiap validator dan setiap delegasi.',

    conTieuDe: 'Apa yang disimpan',
    conMoTa:
      'Sebelum penghapusan, seluruh jaringan yang akan mati diekspor beserta hash yang diterbitkan, ' +
      'sehingga catatannya tetap dapat diverifikasi. Apa yang terjadi masih bisa diperiksa, bahkan ' +
      'setelah jaringan yang menjalankannya lenyap. Tautan arsip akan dipasang di sini pada hari ' +
      'pembangunan ulang.',

    lamTieuDe: 'Apa yang perlu Anda lakukan',
    lamTruoc: 'Sebelum pembangunan ulang:',
    lam1:
      'Jangan membangun apa pun di A1 sekarang yang bergantung pada data bertahan. Kalau Anda sedang ' +
      'mencoba sebuah gagasan, silakan — hanya saja jangan perlakukan rantai saat ini sebagai penyimpanan.',
    lamSau: 'Setelah pembangunan ulang:',
    lam2:
      'Hapus dari dompet Anda setiap L1 yang Anda tambahkan — rantai itu sudah tidak ada, dan dompet ' +
      'yang menunjuk ke sana hanya akan diam. Jaringan utama A1 tidak perlu dihapus: pengaturannya ' +
      'tidak berubah.',
    lam3:
      'Jika dompet Anda belum memiliki jaringan A1, tambahkan lewat tombol di halaman faucet, ' +
      'bukan dengan mengetik pengaturannya secara manual.',
    lam4: 'Minta token dari faucet lagi, dan luncurkan rantai Anda lagi bila menginginkannya.',

    imLangTieuDe: 'Dompet Anda tidak akan memperingatkan Anda',
    imLangMoTa:
      'Jaringan baru mempertahankan Chain ID {chainId}, alamat RPC yang sama, dan nama yang sama ' +
      'dengan yang lama. Itu disengaja — agar setiap dokumen dan panduan yang sudah terbit tetap ' +
      'benar. Harganya adalah dompet Anda sama sekali tidak punya sinyal bahwa ia baru saja ' +
      'terhubung ke jaringan yang berbeda. Karena itu dua hal di bawah ini akan terjadi tanpa suara.',
    imLang1:
      'Dompet dengan konfigurasi lama tetap terhubung, tetap menampilkan nama jaringan yang benar, ' +
      'dan akan melaporkan saldo 0. Angka itu BENAR: token lama Anda sudah tidak ada, bukan ' +
      'disembunyikan. Anda tidak perlu menambahkan jaringan lagi — cukup minta token baru dari ' +
      'faucet. Jika dompet melaporkan transaksi tersangkut atau nomor urut yang salah, bersihkan ' +
      'data aktivitas jaringan itu di dompet: ia masih mengingat jumlah transaksi rantai yang sudah ' +
      'mati, sedangkan rantai baru menghitung dari 0.',
    imLang2:
      'Jika Anda masih menyimpan transaksi bertanda tangan yang belum pernah disiarkan, buanglah. ' +
      'Tanda tangannya tetap sah di jaringan baru, karena Chain ID tidak berubah. Ia akan gagal ' +
      'selama dompet kosong — tetapi begitu Anda meminta token dari faucet ia menjadi dapat ' +
      'dibelanjakan, dan bisa lolos pada saat yang tidak Anda duga.',

    lapTieuDe: 'Apakah ini akan terjadi lagi',
    lapMoTa:
      'Mungkin. A1 masih testnet, dan sampai komunitas memilih arah mainnet antara A1 dan C1, kami ' +
      'tetap memegang hak untuk membangun ulang jaringan ketika ada yang harus berubah di dalam ' +
      'genesis. Yang kami janjikan adalah memberi tahu Anda lebih dulu, dan menyatakan dengan jelas ' +
      'apa yang hilang.',

    daXayRaTieuDe: 'Sudah pernah dibangun ulang sekali pada 2026-08-27',
    daXayRaMoTa:
      'A1 sudah pernah dibangun ulang sekali pada 2026-08-27, sebelum tanggal di bawah ini. Jika Anda memegang token uji sebelum itu, saldo Anda kini 0 — itu benar, bukan kerusakan pada dompet Anda. Tidak ada rantai pengguna yang hilang: direktori hanya berisi rantai uji otomatis. Minta token lagi dari faucet.',
    ngayLuuY: 'Tanggal dapat bergeser',
    ngayLuuYMoTa:
      'Tanggal {ngay} bergantung pada pemeriksaan go/no-go sebelumnya. Jika bergeser, kami akan ' +
      'mengubah tanggal di halaman ini, bukan berdiam diri.',
  },

  chanTrang: {
    dungThu: 'Coba',
    kham: 'Jelajahi',
    veDuAn: 'Tentang',
    explorer: 'Explorer 9Scan-A1',
    trangChinh: 'Situs utama 9Chain',
    moTabMoi: '(terbuka di tab baru)',
    nhanNav: 'Tautan footer',
    reGenesis: 'Rencana pembangunan ulang jaringan',
  },

  dieuHuong: {
    trangChu: 'Beranda',
    faucet: 'Ambil token uji',
    console: 'Luncurkan rantai',
    chainCuaToi: 'Rantai saya',
    bang: 'A1 ↔ C1',
    danhBa: 'Direktori L1',
    explorer: 'Explorer',
    banGiao: 'Buka 9Scan-A1 di tab baru',
  },

  trangChu: {
    nhanTestnet: 'Testnet — token tidak punya nilai nyata',
    nutChinh: 'Luncurkan rantai Anda',
    nutPhu: 'Ambil token uji dulu',

    cTieuDe: 'Luncurkan rantai Anda sendiri di A1',
    cPhu: 'Sebuah L1 milik Anda sendiri, dimiliki oleh dompet yang Anda pakai menandatangani, berjalan sungguhan di jaringan uji. Perlu sekitar tiga menit.',
    cBangChuThich: 'Setiap baris adalah rantai nyata yang berjalan di A1, dengan pemiliknya sendiri.',
    cCot: 'Rantai',
    cCotKieu: 'Jenis',
    cCotChu: 'Pemilik',
    cMacDinh: 'bawaan sistem',
    cTrong: 'Belum ada L1 yang berjalan',
    cTrongMoTa: 'Anda akan menjadi yang pertama. Direktori diperbarui begitu rantai Anda menyala.',

    tuTo: 'Ke-9 validator saat ini berjalan di server yang sama, dengan penyedia yang sama — terdesentralisasi pada tingkat protokol, belum pada tingkat infrastruktur.',
    blockDungYen: 'Avalanche tidak memproduksi blok kosong, jadi tinggi blok yang diam saat tidak ada yang bertransaksi adalah hal normal. Ukuran hidup-matinya adalah jumlah validator di sebelahnya.',
  },

  soLieu: {
    tieuDe: 'Jaringan aktif',
    validator: 'Validator terhubung',
    soL1: 'L1 berjalan',
    chieuCao: 'Blok C-Chain',
    dangDo: 'Mengukur jaringan…',
    khongDo: 'Tidak dapat membaca statistik jaringan',
    khongDoMoTa: 'Halaman tetap berfungsi — ini hanya tampilan status.',
  },

  deChain: {
    tieuDe: 'Luncurkan rantai Anda',
    moTa:
      'Sebuah L1 khusus, dimiliki oleh dompet Anda. Anda menandatangani sekali untuk membuktikan ' +
      'siapa Anda, meninjau, lalu jaringan membangun rantainya dalam sekitar tiga menit.',

    noiVi: 'Hubungkan dompet',
    dangNoi: 'Menghubungkan…',
    kyDeVao: 'Masuk',
    dangKy: 'Menunggu tanda tangan…',
    viCuaBan: 'Dompet Anda',
    laChuChain: 'Rantai akan menjadi milik dompet ini. Alamatnya berasal dari tanda tangan Anda — tidak ada yang mengetikkannya.',
    khongCoVi: 'Tidak ada dompet di peramban ini. Pasang MetaMask lalu muat ulang halaman.',
    tuChoiKy: 'Anda menolak menandatangani. Tidak ada yang dibuat.',
    doiVi: 'Gunakan dompet lain',

    nhanTen: 'Nama rantai',
    goiYTen: 'Contoh: MyChain',
    moTaTen:
      'Huruf, angka, dan spasi. 2–32 karakter. Di jaringan ini nama yang pernah dipakai tidak ' +
      'pernah diterbitkan ulang — bahkan untuk rantai yang sudah dicabut.',
    tenXau: 'Nama hanya boleh berisi huruf, angka, dan spasi, sepanjang 2–32 karakter.',
    nhanKieu: 'Jenis rantai',
    moTaKieu: 'Setelah dipilih, ini tetap — genesis sebuah rantai tidak dapat disunting.',
    conCho: '{con}/{tong} slot tersisa',
    hetCho: 'Tidak ada slot tersisa',
    hetChoMoTa:
      'Model saat ini membuat setiap validator melacak setiap L1, dan protokol mengeluarkan node ' +
      'yang mendeklarasikan lebih dari 16 subnet. Ini batas keras dan tidak dapat dinaikkan. ' +
      'Mencabut sebuah rantai mengembalikan satu slot.',
    soatLai: 'Tinjau sebelum mengirim',

    soatTieuDe: 'Tinjau — ini pintu satu arah',
    soatMoTa:
      'Genesis sebuah L1 yang sudah diluncurkan TIDAK DAPAT DIUBAH. Setelah langkah ini nama, jenis ' +
      'rantai, dan pemilik tidak dapat diubah — dan pencabutan juga tidak akan mengembalikan nama ' +
      'maupun chain ID.',
    soatReGenesis:
      'Satu hal lagi yang perlu diketahui sebelum menekan: A1 membangun ulang seluruh jaringan pada ' +
      '{ngay}. Rantai yang Anda luncurkan hari ini akan terhapus bersama jaringan lama — bukan ' +
      'disembunyikan, melainkan lenyap.',
    soatTen: 'Nama rantai',
    soatKieu: 'Jenis rantai',
    soatChu: 'Pemilik',
    soatQuayLai: 'Kembali dan sunting',
    soatDongY: 'Saya sudah meninjau — luncurkan rantainya',

    dangDe: 'Meluncurkan rantai “{ten}”',
    dangDeMoTa:
      'Node dimulai ulang SATU PER SATU agar jaringan tidak pernah kehilangan kuorum — itulah ' +
      'sebabnya lambat, dan itu disengaja. Jangan tutup tab; kalaupun ditutup, rantainya tetap dibangun.',
    conKhoang: 'Sekitar {phut} menit lagi',
    dangChuanBi: 'Menyiapkan…',

    xongTieuDe: 'Selesai — rantai “{ten}” berjalan',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Tambahkan rantai ke dompet',
    xongDaThem: 'Ditambahkan ke dompet',
    xongKichHoat: 'Aktifkan rantai (buka blok 1)',
    xongDaKichHoat: 'Diaktifkan',
    xongDangKichHoat: 'Menunggu dompet…',
    xongThemViLoi: 'Tidak dapat menambahkan rantai ke dompet Anda. {chiTiet}',
    xongKichHoatLoi: 'Tidak dapat mengaktifkan rantai. {chiTiet}',

    deTiep: 'Luncurkan rantai lain',
    loiDe: 'Tidak dapat meluncurkan rantai. {chiTiet}',
    loiKhongRo: 'Rantai tidak muncul di direktori setelah proses selesai.',
    luuYTieuDe: 'Transaksi pertama pada rantai baru',
    luuYCachLam:
      'Jangan percayai perkiraan gas untuk transaksi pertama. Cara termurah membuka blok 1 adalah ' +
      'transfer biasa — tekan “Aktifkan rantai” di bawah.',
  },

  chainCuaToi: {
    tieuDe: 'Rantai saya',
    moTa: 'L1 yang dimiliki oleh dompet yang Anda pakai masuk. Rantai dapat dicabut, tetapi baca peringatannya dulu.',
    noiVi: 'Hubungkan dompet Anda untuk melihat rantai Anda',
    trongTieuDe: 'Dompet ini belum memiliki rantai apa pun',
    trongMoTa: 'Luncurkan satu lalu kembali — rantainya akan langsung muncul di sini.',
    trongNut: 'Luncurkan rantai Anda',

    cotChain: 'Rantai',
    cotKieu: 'Jenis',
    cotSong: 'Status',
    cotViec: '',

    songDo: '{so} validator',
    songDangDo: 'mengukur',
    songKhongDo: 'tidak dapat diukur',
    songGiaiThich: 'Diukur dari jumlah validator subnet, bukan dari tinggi blok.',
    khongValidator: '0 validator',
    khongValidatorMoTa:
      'Rantai ini TIDAK dapat menyelesaikan transaksi apa pun: subnet-nya tidak punya validator. ' +
      'Ia tetap menjawab panggilan RPC dan dompet tetap terhubung, sehingga tidak ada tanda kasat ' +
      'mata lainnya.',

    thongSo: 'Pengaturan dompet',
    themVaoVi: 'Tambahkan ke dompet',
    daThemVaoVi: 'Ditambahkan',
    themViLoi: 'Tidak dapat menambahkannya ke dompet Anda. {chiTiet}',

    thuHoi: 'Cabut',
    thuHoiTieuDe: 'Cabut “{ten}”?',
    thuHoiY1: 'Rantai langsung berhenti melayani RPC dan hilang dari direktori publik.',
    thuHoiY2:
      'Pencabutan TIDAK menghapus subnet di P-Chain — apa yang sudah dibuat di sana tidak dapat ' +
      'dihilangkan selama jaringan ini berjalan. Pencabutan juga tidak menghapus jaringan dari ' +
      'dompet orang-orang yang sudah menambahkan rantai ini.',
    thuHoiY3:
      'Nama dan Chain ID tetap dipesan dan TIDAK PERNAH diterbitkan ulang kepada siapa pun di ' +
      'jaringan ini. Menerbitkan ulang sebuah Chain ID akan membuat dompet bekas pengguna diam-diam ' +
      'menunjuk ke rantai milik orang lain.',
    thuHoiY4: 'Sebagai gantinya, satu dari 15 slot dikembalikan.',
    thuHoiGoNhan: 'Ketik nama rantai persis untuk mengonfirmasi',
    thuHoiSaiTen: 'Itu tidak cocok dengan nama rantai.',
    thuHoiXacNhan: 'Cabut permanen',
    thuHoiHuy: 'Batal',
    thuHoiDangChay: 'Mencabut “{ten}” — sekitar tiga menit',
    thuHoiXong: '“{ten}” dicabut. {con}/{tong} slot tersisa.',
    thuHoiLoi: 'Tidak dapat mencabut. {chiTiet}',
    thuHoiKhongRo: 'Rantai masih ada di direktori setelah proses selesai.',

    daThuHoi: 'Dicabut',
    daThuHoiMoTa: 'Nama dan Chain ID tetap dipesan di jaringan ini.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — perbandingan',
    moTa:
      '9Chain menjalankan DUA testnet dari produk yang sama secara berdampingan, berbeda pada ' +
      'mesinnya: A1 di mesin Avalanche, C1 di mesin Cosmos. Tabel ini mencatat pertukaran untung-rugi ' +
      'antara kedua arah, diterbitkan agar siapa pun dapat membantahnya — sisi C1 belum punya ' +
      'pengukuran langsung.',

    tuChamTieuDe: 'Nilai di bawah ini DINILAI SENDIRI oleh tim, bukan diukur secara independen',
    tuChamMoTa:
      'Kolom "bagaimana diukur" menyatakan cara setiap kriteria diperiksa. Kriteria tanpa pengukuran ' +
      'bertanggal adalah penilaian arsitektural, bukan data. Bobotnya Anda yang menentukan — nilainya ' +
      'mengikuti.',

    cotSo: '#',
    cotTieuChi: 'Kriteria',
    cotLoai: 'Jenis',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Bobot',
    loaiKienTruc: 'arsitektur',
    loaiSong: 'data langsung',

    tongDiem: 'Nilai total memakai bobot Anda',
    hoaNhau: 'Seri',
    dangDan: 'unggul',

    soLieuTieuDe: 'Data langsung',
    a1Validator: 'A1 — validator terhubung',
    a1Chain: 'A1 — L1 berjalan',
    a1Block: 'A1 — blok C-Chain',
    c1Vang: 'C1 — tidak terjangkau',
    c1VangMoTa:
      'URL REST Cosmos milik C1 (port 1317) dibutuhkan. Tabel tetap berfungsi: sisi A1 adalah data ' +
      'langsung, sisi C1 adalah penilaian arsitektural seperti kriteria lainnya.',
    dangDo: 'mengukur…',
    khongDo: 'tidak dapat diukur',
  },

  faucet: {
    tieuDe: 'Ambil token uji',
    moTa:
      'LOVE9 di testnet A1 tidak punya nilai nyata — ia ada agar Anda bisa membayar gas saat menguji. ' +
      'Masukkan alamat dompet dan kami langsung mengirimkan sebagian.',
    nhanDiaChi: 'Alamat dompet Anda',
    goiYDiaChi: '0x… (40 karakter heksadesimal)',
    nutXin: 'Kirimkan token',
    dangGui: 'Mengirim…',
    danChoDiaChi: 'Tempelkan alamat dompet yang akan menerima token. Tekan “Tambahkan jaringan ke dompet” di atas bila belum.',
    themMang: 'Tambahkan jaringan ke dompet',
    themMangXong: 'Ditambahkan ke dompet',
    themMangTuChoi: 'Anda menekan tolak di dompet. Tekan lagi bila ingin menambahkan jaringan.',
    themMangLoi: 'Dompet Anda tidak dapat menambahkan jaringan. Tambahkan manual memakai pengaturan di sebelah ini — dan kirim baris di bawah kepada tim:',
    khongCoVi: 'Tidak ada dompet di peramban ini. Pasang MetaMask lalu muat ulang halaman.',
    hanMucConLai: 'Sisa kuota',
    hanMucCachDoc: '{con}/{tong} permintaan per {gio} jam',
    hanMucHet: 'Anda sudah memakai seluruh kuota. Coba lagi dalam {phut} menit.',
    hanMucKhongDoc: 'Tidak dapat membaca kuota Anda — Anda tetap bisa meminta, hanya saja tidak tahu sisanya berapa.',
    thanhCong: 'Mengirim {so} {kyHieu} ke {diaChi}',
    xemGiaoDich: 'Lihat transaksi',
    thongSoMang: 'Pengaturan jaringan',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Simbol',
    thongSoThapPhan: 'Desimal',
    thongSoExplorer: 'Explorer',
    thapPhanGiaiThich:
      'Dompet menampilkan 18 desimal karena C-Chain menjalankan EVM. Di P/X-Chain, LOVE9 dihitung ' +
      'dalam 9 desimal. Satu koin, dua skala — bukan dua token berbeda.',
    loiChung: 'Tidak dapat mengirim. {chiTiet}',
  },

  chonNgonNgu: {
    nhan: 'Bahasa',
    mayDich: 'mesin',
    mayDichGiaiThich: 'Hanya versi Vietnam yang telah diperiksa manusia. Terjemahan lain dibuat mesin dan mungkin keliru — versi Inggris adalah sumber kebenaran.',
    chuaCo: 'belum tersedia',
  },

  loi: {
    khongKetNoi: 'Tidak dapat menjangkau jaringan',
    khongKetNoiMoTa: 'Jaringan mungkin sedang sibuk, atau koneksi Anda terputus.',
    trongRong: 'Belum ada apa-apa di sini',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'Halaman ini tidak ada',
    moTa:
      'Alamat yang Anda buka tidak ada di 9Chain Testnet A1. ' +
      'Mungkin namanya telah diubah, atau URL-nya kehilangan beberapa karakter saat disalin.',
    dayLaGi: 'Tiga halaman yang paling sering dipakai:',
    nhanNav: 'Ke mana selanjutnya',
    veTrangChu: 'Kembali ke beranda',
    diFaucet: 'Ambil token uji',
    diDeChain: 'Luncurkan rantai Anda',
    timGiaoDich: 'Mencari sebuah transaksi atau alamat? Periksa hash-nya lalu coba lagi.',
  },
};

export default id;
