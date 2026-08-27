import type { Tu } from '../en';

/**
 * Bahasa Melayu — terjemahan mesin, belum disemak oleh manusia.
 * Bahasa sumber ialah bahasa Inggeris (`../en.ts`); jika berbeza, versi Inggeris yang sah.
 *
 * 🔴 Tiga tempat ini tidak boleh dilembutkan: `reGenesis.*` (rangkaian akan dipadam),
 * `deChain.soatMoTa` (pintu sehala), `chainCuaToi.thuHoiY*` (pembatalan tidak memulangkan nama).
 * Semuanya menyebut "kekal" dan "tidak boleh diubah" supaya tiada sesiapa kehilangan aset
 * kerana menyangka ia boleh dipulihkan.
 */
export const ms: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'Rangkaian ujian awam 9Chain — rangkaian bebas yang berjalan pada enjin Avalanche',
    tagTitle: 'rangkaian bebas pada enjin Avalanche',
    viTuChoi: 'Anda menolak permintaan itu dalam dompet anda. Tiada apa-apa yang berubah.',
    dangTai: 'Memuatkan…',
    thuLai: 'Cuba lagi',
    saoChep: 'Salin',
    daChep: 'Disalin',
    dong: 'Tutup',
    moMenu: 'Buka menu',
    dongMenu: 'Tutup menu',
    chuyenSangToi: 'Tukar ke mod gelap',
    chuyenSangSang: 'Tukar ke mod cerah',
    boQuaToiNoiDung: 'Langkau ke kandungan utama',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',

    bang: 'A1 telah dibina semula pada {ngay}. Setiap baki dan rantaian yang dicipta sebelum tarikh itu tidak wujud lagi.',
    bangNut: 'Apa maksudnya',
    nhan: 'Dibina semula',

    tieuDe: 'A1 telah dibina semula pada {ngay}',
    moTa:
      'Rangkaian ujian A1 telah dibina semula dari blok 0. Rantaian, baki dan sejarah transaksi yang ' +
      'dicipta sebelum tarikh itu tidak wujud lagi — bukan disembunyikan, tetapi hilang terus. ' +
      'Halaman ini menerangkan apa yang anda lihat dan apa yang perlu dilakukan.',

    thayGiTieuDe: 'Apa yang anda akan lihat',
    thayGi1:
      'Dompet anda masih boleh bersambung, masih memaparkan nama rangkaian yang betul dan Chain ID ' +
      'yang sama {chainId} — itu memang disengajakan. Tetapi baki anda akan menjadi 0.',
    thayGi2:
      'Setiap L1 yang anda lancarkan telah hilang daripada direktori. Nama dan Chain ID mereka bebas ' +
      'semula, dan sesiapa sahaja boleh mengambilnya.',
    thayGi3:
      'Jika anda pernah menandatangani transaksi tetapi tidak pernah menyiarkannya, jangan siarkan ' +
      'sekarang — ia milik rangkaian yang sudah tidak wujud.',

    lamGiTieuDe: 'Apa yang anda perlu lakukan',
    lamGi1: 'Minta token ujian sekali lagi daripada faucet. Had telah ditetapkan semula untuk semua orang.',
    lamGi2:
      'Buang setiap L1 daripada dompet anda — masing-masing mempunyai Chain ID sendiri dan kini tidak ' +
      'menunjuk ke mana-mana. Rangkaian utama A1 TIDAK perlu dibuang; tetapannya tidak berubah.',
    lamGi3: 'Lancarkan semula rantaian anda jika diperlukan. Nama lama mungkin telah diambil orang lain.',

    luuTieuDe: 'Arkib rangkaian lama',
    luuMoTa:
      'Keadaan akhir rangkaian sebelum pembinaan semula telah dieksport dan cincangannya diterbitkan, ' +
      'supaya sesiapa yang ingin menyemaknya boleh berbuat demikian.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'A1 akan dibina semula pada {ngay} — setiap rantaian, baki dan transaksi yang dicipta sebelum itu akan dipadam.',
    bangNut: 'Butiran',
    nhan: 'Pembinaan semula akan datang',

    tieuDe: 'A1 akan dibina semula pada {ngay}',
    moTa:
      'Seluruh rangkaian ujian A1 akan dibina semula dari blok 0. Segala yang dicipta sebelum tarikh ' +
      'itu akan hilang — bukan disembunyikan, tetapi tidak lagi wujud. Halaman ini menyatakan dengan ' +
      'tepat apa yang hilang dan apa yang perlu anda lakukan.',

    viSaoTieuDe: 'Mengapa pembinaan semula diperlukan',
    viSao1:
      'Genesis sesebuah rangkaian tidak boleh diubah. Itulah yang menjadikannya boleh dipercayai — ' +
      'tiada sesiapa, termasuk mereka yang membinanya, boleh menukar satu nombor setelah nombor itu ' +
      'ditulis ke dalam blok 0.',
    viSao2:
      'Harganya: menukar satu nombor di dalam genesis tidak meninggalkan pilihan lain selain membina ' +
      'semula rangkaian dari awal. A1 menaikkan jumlah bekalan kepada 9,000,000,000 LOVE9, dan seluruh ' +
      'julat parameter staking terpaksa dikira semula supaya sepadan.',
    viSao3:
      'Ini rangkaian ujian, dan dibina semula ialah sesuatu yang dibenarkan bagi rangkaian ujian. ' +
      'Malah itulah sebabnya rangkaian ujian wujud: supaya perubahan seperti ini berlaku di sini, ' +
      'bukan di rangkaian utama.',

    matTieuDe: 'Apa yang akan hilang',
    matMoTa: 'Semuanya, tanpa pengecualian:',
    mat1: 'Setiap L1 yang dilancarkan pengguna, termasuk rantaian yang berjalan dengan baik.',
    mat2: 'Setiap baki LOVE9, termasuk token yang diterima daripada faucet.',
    mat3: 'Setiap transaksi, setiap blok, seluruh sejarah C-Chain, P-Chain dan X-Chain.',
    mat4: 'Setiap pengesah dan setiap delegasi.',

    conTieuDe: 'Apa yang disimpan',
    conMoTa:
      'Sebelum pemadaman, seluruh rangkaian yang akan mati itu akan dieksport dengan cincangan yang ' +
      'diterbitkan, supaya rekodnya kekal boleh disahkan. Apa yang berlaku masih boleh disemak, walaupun ' +
      'rangkaian yang menjalankannya sudah tiada. Pautan arkib akan disiarkan di sini pada hari ' +
      'pembinaan semula.',

    lamTieuDe: 'Apa yang anda perlu lakukan',
    lamTruoc: 'Sebelum pembinaan semula:',
    lam1:
      'Jangan bina apa-apa di A1 sekarang yang bergantung pada data terus kekal. Jika anda sedang ' +
      'mencuba sesuatu idea, silakan — cuma jangan anggap rantaian semasa sebagai tempat simpanan.',
    lamSau: 'Selepas pembinaan semula:',
    lam2:
      'Buang daripada dompet anda setiap L1 yang pernah anda tambah — rantaian itu tidak wujud lagi, ' +
      'dan dompet yang menunjuk ke sana hanya akan tergantung. Rangkaian utama A1 tidak perlu dibuang: ' +
      'tetapannya tidak berubah.',
    lam3:
      'Jika dompet anda belum mempunyai rangkaian A1, tambahkannya dengan butang di halaman faucet ' +
      'dan bukan dengan menaip tetapan secara manual.',
    lam4: 'Minta token daripada faucet sekali lagi, dan lancarkan semula rantaian anda jika mahu.',

    imLangTieuDe: 'Dompet anda tidak akan memberi amaran',
    imLangMoTa:
      'Rangkaian baharu mengekalkan Chain ID {chainId}, alamat RPC yang sama dan nama yang sama seperti ' +
      'yang lama. Itu memang disengajakan — supaya setiap dokumen dan panduan yang telah diterbitkan ' +
      'kekal betul. Harganya ialah dompet anda langsung tiada isyarat bahawa ia baru sahaja bersambung ' +
      'dengan rangkaian yang berbeza. Oleh itu dua perkara di bawah akan berlaku secara senyap.',
    imLang1:
      'Dompet dengan konfigurasi lama masih bersambung, masih memaparkan nama rangkaian yang betul, dan ' +
      'akan melaporkan baki 0. Nombor itu BETUL: token lama anda tidak wujud lagi, ia tidak ' +
      'disembunyikan. Anda tidak perlu menambah rangkaian semula — minta sahaja token baharu daripada ' +
      'faucet. Jika dompet melaporkan transaksi tersangkut atau nombor urutan yang salah, bersihkan ' +
      'data aktiviti rangkaian itu dalam dompet: ia masih mengingati kiraan transaksi rantaian yang ' +
      'sudah mati, sedangkan rantaian baharu mengira dari 0.',
    imLang2:
      'Jika anda masih menyimpan transaksi bertandatangan yang tidak pernah disiarkan, buanglah. ' +
      'Tandatangan itu masih sah pada rangkaian baharu kerana Chain ID tidak berubah. Ia akan gagal ' +
      'selagi dompet kosong — tetapi sebaik sahaja anda meminta token daripada faucet, ia menjadi boleh ' +
      'dibelanjakan, dan mungkin lulus pada masa yang anda tidak jangka.',

    lapTieuDe: 'Adakah ini akan berulang',
    lapMoTa:
      'Mungkin. A1 masih rangkaian ujian, dan sehingga komuniti memilih hala tuju rangkaian utama antara ' +
      'A1 dan C1, kami mengekalkan hak untuk membina semula rangkaian apabila sesuatu di dalam genesis ' +
      'perlu berubah. Yang kami janjikan ialah memberitahu anda lebih awal, dan menyatakan dengan jelas ' +
      'apa yang hilang.',

    daXayRaTieuDe: 'Sudah pernah dibina semula sekali pada 2026-08-27',
    daXayRaMoTa:
      'A1 sudah pernah dibina semula sekali pada 2026-08-27, sebelum tarikh di bawah. Jika anda memegang token ujian sebelum itu, baki anda kini 0 — itu betul, bukan kerosakan pada dompet anda. Tiada rantaian pengguna yang hilang: direktori hanya mengandungi rantaian ujian automatik. Minta token sekali lagi daripada faucet.',
    ngayLuuY: 'Tarikh boleh beranjak',
    ngayLuuYMoTa:
      'Tarikh {ngay} bergantung pada semakan go/no-go sebelumnya. Jika ia beranjak, kami akan menukar ' +
      'tarikh di halaman ini dan bukannya berdiam diri.',
  },

  chanTrang: {
    dungThu: 'Cuba',
    kham: 'Terokai',
    veDuAn: 'Tentang',
    explorer: 'Penjelajah 9Scan-A1',
    trangChinh: 'Laman utama 9Chain',
    moTabMoi: '(dibuka dalam tab baharu)',
    nhanNav: 'Pautan kaki halaman',
    reGenesis: 'Pelan pembinaan semula rangkaian',
  },

  dieuHuong: {
    trangChu: 'Laman utama',
    faucet: 'Dapatkan token ujian',
    console: 'Lancarkan rantaian',
    chainCuaToi: 'Rantaian saya',
    bang: 'A1 ↔ C1',
    danhBa: 'Direktori L1',
    explorer: 'Penjelajah',
    banGiao: 'Buka 9Scan-A1 dalam tab baharu',
  },

  trangChu: {
    nhanTestnet: 'Rangkaian ujian — token tiada nilai sebenar',
    nutChinh: 'Lancarkan rantaian anda',
    nutPhu: 'Dapatkan token ujian dahulu',

    cTieuDe: 'Lancarkan rantaian anda sendiri di A1',
    cPhu: 'Sebuah L1 milik anda sendiri, dimiliki oleh dompet yang anda gunakan untuk menandatangani, benar-benar berjalan pada rangkaian ujian. Mengambil masa kira-kira tiga minit.',
    cBangChuThich: 'Setiap baris ialah rantaian sebenar yang berjalan di A1, dengan pemiliknya sendiri.',
    cCot: 'Rantaian',
    cCotKieu: 'Jenis',
    cCotChu: 'Pemilik',
    cMacDinh: 'lalai sistem',
    cTrong: 'Belum ada L1 yang berjalan',
    cTrongMoTa: 'Anda akan menjadi yang pertama. Direktori dikemas kini sebaik sahaja rantaian anda hidup.',

    tuTo: 'Kesemua 9 pengesah kini berjalan pada pelayan yang sama, dengan penyedia yang sama — terdesentralisasi pada peringkat protokol, belum lagi pada peringkat infrastruktur.',
    blockDungYen: 'Avalanche tidak menghasilkan blok kosong, jadi ketinggian blok yang kekal tidak berubah ketika tiada sesiapa membuat transaksi adalah normal. Ukuran hidupnya ialah bilangan pengesah di sebelahnya.',
  },

  soLieu: {
    tieuDe: 'Rangkaian aktif',
    validator: 'Pengesah bersambung',
    soL1: 'L1 sedang berjalan',
    chieuCao: 'Blok C-Chain',
    dangDo: 'Mengukur rangkaian…',
    khongDo: 'Tidak dapat membaca statistik rangkaian',
    khongDoMoTa: 'Halaman ini masih berfungsi — ini hanyalah paparan status.',
  },

  deChain: {
    tieuDe: 'Lancarkan rantaian anda',
    moTa:
      'Sebuah L1 khusus, dimiliki oleh dompet anda. Anda menandatangani sekali untuk membuktikan siapa ' +
      'anda, menyemak, dan rangkaian membina rantaian itu dalam kira-kira tiga minit.',

    noiVi: 'Sambungkan dompet',
    dangNoi: 'Menyambung…',
    kyDeVao: 'Log masuk',
    dangKy: 'Menunggu tandatangan…',
    viCuaBan: 'Dompet anda',
    laChuChain: 'Rantaian ini akan menjadi milik dompet ini. Alamatnya datang daripada tandatangan anda — tiada sesiapa menaipnya.',
    khongCoVi: 'Tiada dompet ditemui dalam pelayar ini. Pasang MetaMask dan muat semula halaman.',
    tuChoiKy: 'Anda enggan menandatangani. Tiada apa-apa yang dicipta.',
    doiVi: 'Guna dompet lain',

    nhanTen: 'Nama rantaian',
    goiYTen: 'Contoh: MyChain',
    moTaTen:
      'Huruf, angka dan ruang. 2–32 aksara. Pada rangkaian ini, nama yang pernah digunakan tidak akan ' +
      'dikeluarkan semula — walaupun untuk rantaian yang telah dibatalkan.',
    tenXau: 'Nama hanya boleh mengandungi huruf, angka dan ruang, sepanjang 2–32 aksara.',
    nhanKieu: 'Jenis rantaian',
    moTaKieu: 'Setelah dipilih ia kekal — genesis sesebuah rantaian tidak boleh disunting.',
    conCho: '{con}/{tong} slot berbaki',
    hetCho: 'Tiada slot berbaki',
    hetChoMoTa:
      'Model semasa membuatkan setiap pengesah menjejaki setiap L1, dan protokol menyingkirkan nod yang ' +
      'mengisytiharkan lebih daripada 16 subnet. Ini had keras dan tidak boleh dinaikkan. Membatalkan ' +
      'sesebuah rantaian memulangkan satu slot.',
    soatLai: 'Semak sebelum menghantar',

    soatTieuDe: 'Semakan — ini pintu sehala',
    soatMoTa:
      'Genesis sesebuah L1 yang telah dilancarkan TIDAK BOLEH DIUBAH. Selepas langkah ini, nama, jenis ' +
      'rantaian dan pemilik tidak boleh ditukar — dan pembatalan juga tidak akan memulangkan nama serta ' +
      'chain ID.',
    soatReGenesis:
      'Satu lagi perkara sebelum anda menekan: A1 membina semula seluruh rangkaian pada {ngay}. ' +
      'Rantaian yang anda lancarkan hari ini akan dipadam bersama rangkaian lama — bukan disembunyikan, ' +
      'tetapi hilang.',
    soatTen: 'Nama rantaian',
    soatKieu: 'Jenis rantaian',
    soatChu: 'Pemilik',
    soatQuayLai: 'Kembali dan sunting',
    soatDongY: 'Saya telah menyemak — lancarkan rantaian',

    dangDe: 'Melancarkan rantaian “{ten}”',
    dangDeMoTa:
      'Nod dimulakan semula SATU DEMI SATU supaya rangkaian tidak pernah kehilangan kuorum — itulah ' +
      'sebabnya ia perlahan, dan ia disengajakan. Jangan tutup tab; jika ditutup pun, rantaian tetap dibina.',
    conKhoang: 'Kira-kira {phut} minit lagi',
    dangChuanBi: 'Menyediakan…',

    xongTieuDe: 'Selesai — rantaian “{ten}” sedang berjalan',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Tambah rantaian ke dompet',
    xongDaThem: 'Ditambah ke dompet',
    xongKichHoat: 'Aktifkan rantaian (buka blok 1)',
    xongDaKichHoat: 'Diaktifkan',
    xongDangKichHoat: 'Menunggu dompet…',
    xongThemViLoi: 'Tidak dapat menambah rantaian ke dompet anda. {chiTiet}',
    xongKichHoatLoi: 'Tidak dapat mengaktifkan rantaian. {chiTiet}',

    deTiep: 'Lancarkan satu lagi rantaian',
    loiDe: 'Tidak dapat melancarkan rantaian. {chiTiet}',
    loiKhongRo: 'Rantaian tidak muncul dalam direktori selepas proses selesai.',
    luuYTieuDe: 'Transaksi pertama pada rantaian baharu',
    luuYCachLam:
      'Jangan percayakan anggaran gas untuk transaksi pertama. Cara paling murah untuk membuka blok 1 ' +
      'ialah pemindahan biasa — tekan “Aktifkan rantaian” di bawah.',
  },

  chainCuaToi: {
    tieuDe: 'Rantaian saya',
    moTa: 'L1 yang dimiliki oleh dompet yang anda gunakan untuk log masuk. Ia boleh dibatalkan, tetapi baca amaran dahulu.',
    noiVi: 'Sambungkan dompet anda untuk melihat rantaian anda',
    trongTieuDe: 'Dompet ini belum memiliki sebarang rantaian',
    trongMoTa: 'Lancarkan satu dan kembali — ia akan muncul di sini serta-merta.',
    trongNut: 'Lancarkan rantaian anda',

    cotChain: 'Rantaian',
    cotKieu: 'Jenis',
    cotSong: 'Status',
    cotViec: '',

    songDo: '{so} pengesah',
    songDangDo: 'mengukur',
    songKhongDo: 'tidak dapat diukur',
    songGiaiThich: 'Diukur daripada bilangan pengesah subnet, bukan daripada ketinggian blok.',
    khongValidator: '0 pengesah',
    khongValidatorMoTa:
      'Rantaian ini TIDAK boleh memuktamadkan sebarang transaksi: subnetnya tiada pengesah. Ia masih ' +
      'menjawab panggilan RPC dan dompet masih boleh bersambung, jadi tiada tanda lain yang kelihatan.',

    thongSo: 'Tetapan dompet',
    themVaoVi: 'Tambah ke dompet',
    daThemVaoVi: 'Ditambah',
    themViLoi: 'Tidak dapat menambahkannya ke dompet anda. {chiTiet}',

    thuHoi: 'Batalkan',
    thuHoiTieuDe: 'Batalkan “{ten}”?',
    thuHoiY1: 'Rantaian berhenti memberikan RPC serta-merta dan hilang daripada direktori awam.',
    thuHoiY2:
      'Pembatalan TIDAK memadamkan subnet pada P-Chain — apa yang telah dicipta di sana tidak boleh ' +
      'dibuang selagi rangkaian ini berjalan. Ia juga tidak membuang rangkaian daripada dompet orang ' +
      'yang sudah menambah rantaian ini.',
    thuHoiY3:
      'Nama dan Chain ID kekal ditempah dan TIDAK PERNAH dikeluarkan semula kepada sesiapa pada ' +
      'rangkaian ini. Mengeluarkan semula sesuatu Chain ID akan membolehkan dompet bekas pengguna ' +
      'menunjuk secara senyap ke rantaian milik orang lain.',
    thuHoiY4: 'Sebagai balasan, satu daripada 15 slot dipulangkan.',
    thuHoiGoNhan: 'Taip nama rantaian dengan tepat untuk mengesahkan',
    thuHoiSaiTen: 'Ia tidak sepadan dengan nama rantaian.',
    thuHoiXacNhan: 'Batalkan secara kekal',
    thuHoiHuy: 'Batal',
    thuHoiDangChay: 'Membatalkan “{ten}” — kira-kira tiga minit',
    thuHoiXong: '“{ten}” dibatalkan. {con}/{tong} slot berbaki.',
    thuHoiLoi: 'Tidak dapat membatalkan. {chiTiet}',
    thuHoiKhongRo: 'Rantaian masih ada dalam direktori selepas proses selesai.',

    daThuHoi: 'Dibatalkan',
    daThuHoiMoTa: 'Nama dan Chain ID kekal ditempah pada rangkaian ini.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — perbandingan',
    moTa:
      '9Chain menjalankan DUA rangkaian ujian bagi produk yang sama secara bersebelahan, berbeza pada ' +
      'enjinnya: A1 pada enjin Avalanche, C1 pada enjin Cosmos. Jadual ini merekodkan pertukaran ' +
      'untung-rugi antara dua arah itu, diterbitkan supaya sesiapa boleh membantahnya — pihak C1 belum ' +
      'mempunyai ukuran langsung.',

    tuChamTieuDe: 'Skor di bawah adalah PENILAIAN SENDIRI oleh pasukan, bukan diukur secara bebas',
    tuChamMoTa:
      'Lajur "bagaimana ia diukur" menyatakan cara setiap kriteria disemak. Mana-mana kriteria tanpa ' +
      'ukuran bertarikh ialah pertimbangan seni bina, bukan data. Pemberat anda yang tentukan — skor ' +
      'akan mengikutinya.',

    cotSo: '#',
    cotTieuChi: 'Kriteria',
    cotLoai: 'Jenis',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Pemberat',
    loaiKienTruc: 'seni bina',
    loaiSong: 'data langsung',

    tongDiem: 'Jumlah skor menggunakan pemberat anda',
    hoaNhau: 'Seri',
    dangDan: 'mendahului',

    soLieuTieuDe: 'Data langsung',
    a1Validator: 'A1 — pengesah bersambung',
    a1Chain: 'A1 — L1 sedang berjalan',
    a1Block: 'A1 — blok C-Chain',
    c1Vang: 'C1 — tidak dapat dihubungi',
    c1VangMoTa:
      'URL REST Cosmos milik C1 (port 1317) diperlukan. Jadual ini masih berfungsi: pihak A1 ialah data ' +
      'langsung, pihak C1 ialah pertimbangan seni bina seperti kriteria yang lain.',
    dangDo: 'mengukur…',
    khongDo: 'tidak dapat diukur',
  },

  faucet: {
    tieuDe: 'Dapatkan token ujian',
    moTa:
      'LOVE9 pada rangkaian ujian A1 tiada nilai sebenar — ia wujud supaya anda boleh membayar gas ' +
      'semasa menguji. Masukkan alamat dompet dan kami hantar sedikit dengan segera.',
    nhanDiaChi: 'Alamat dompet anda',
    goiYDiaChi: '0x… (40 aksara heksadesimal)',
    nutXin: 'Hantar token kepada saya',
    dangGui: 'Menghantar…',
    danChoDiaChi: 'Tampal alamat dompet yang sepatutnya menerima token. Tekan “Tambah rangkaian ke dompet” di atas jika anda belum berbuat demikian.',
    themMang: 'Tambah rangkaian ke dompet',
    themMangXong: 'Ditambah ke dompet',
    themMangTuChoi: 'Anda menekan tolak dalam dompet. Tekan sekali lagi jika anda mahu menambah rangkaian.',
    themMangLoi: 'Dompet anda tidak dapat menambah rangkaian. Tambah secara manual menggunakan tetapan di sebelah ini — dan hantar baris di bawah kepada pasukan:',
    khongCoVi: 'Tiada dompet ditemui dalam pelayar ini. Pasang MetaMask dan muat semula halaman.',
    hanMucConLai: 'Baki kuota',
    hanMucCachDoc: '{con}/{tong} permintaan setiap {gio} jam',
    hanMucHet: 'Anda telah menggunakan keseluruhan kuota anda. Cuba lagi dalam {phut} minit.',
    hanMucKhongDoc: 'Tidak dapat membaca kuota anda — anda masih boleh membuat permintaan, cuma tidak tahu berapa yang berbaki.',
    thanhCong: 'Menghantar {so} {kyHieu} ke {diaChi}',
    xemGiaoDich: 'Lihat transaksi',
    thongSoMang: 'Tetapan rangkaian',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Simbol',
    thongSoThapPhan: 'Perpuluhan',
    thongSoExplorer: 'Penjelajah',
    thapPhanGiaiThich:
      'Dompet memaparkan 18 tempat perpuluhan kerana C-Chain menjalankan EVM. Pada P/X-Chain, LOVE9 ' +
      'dikira dengan 9 tempat perpuluhan. Satu syiling, dua skala — bukan dua token berbeza.',
    loiChung: 'Tidak dapat menghantar. {chiTiet}',
  },

  chonNgonNgu: {
    nhan: 'Bahasa',
    mayDich: 'mesin',
    mayDichGiaiThich: 'Hanya versi Vietnam yang telah disemak oleh manusia. Terjemahan lain dibuat oleh mesin dan mungkin salah — versi Inggeris ialah sumber rujukan yang sah.',
    chuaCo: 'belum tersedia',
  },

  loi: {
    khongKetNoi: 'Tidak dapat menghubungi rangkaian',
    khongKetNoiMoTa: 'Rangkaian mungkin sibuk, atau sambungan anda mungkin terputus.',
    trongRong: 'Belum ada apa-apa di sini',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'Halaman ini tidak wujud',
    moTa:
      'Alamat yang anda buka tidak wujud pada 9Chain Testnet A1. ' +
      'Mungkin ia telah dinamakan semula, atau URL kehilangan beberapa aksara semasa disalin.',
    dayLaGi: 'Tiga halaman yang paling kerap digunakan:',
    nhanNav: 'Ke mana seterusnya',
    veTrangChu: 'Kembali ke laman utama',
    diFaucet: 'Dapatkan token ujian',
    diDeChain: 'Lancarkan rantaian anda',
    timGiaoDich: 'Mencari sesuatu transaksi atau alamat? Semak cincangannya dan cuba lagi.',
  },
};

export default ms;
