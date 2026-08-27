/**
 * English — DEFAULT language and SOURCE OF TRUTH for keys.
 * (Đa ngôn ngữ, 2026-08-27. Bản tiếng Việt gốc: `vi.ts` — đọc ở đó để biết VÌ SAO
 * mỗi câu được viết như vậy; chú thích lý do giữ nguyên bên đó, không nhân đôi.)
 *
 * ═══ VÌ SAO TỆP NÀY ĐẶC BIỆT ═══
 * 1. Nó đi CÙNG BUNDLE — 29 ngôn ngữ còn lại nạp theo chunk. Nó phải có mặt ở khung
 *    hình đầu tiên, và nó là bản rơi về khi một chunk nạp hỏng.
 * 2. Nó định nghĩa kiểu `Tu`. Thiếu một khoá ở đây là khoá đó không tồn tại với cả
 *    30 ngôn ngữ; thừa một khoá là 29 bản dịch kia đỏ ở `tsc`.
 * 3. Mọi bản dịch khác dịch RA TỪ ĐÂY, không phải từ `vi.ts`. Dịch qua hai tầng là
 *    nhân đôi chỗ để nghĩa trôi đi.
 *
 * 🔴 BA CÂU KHÔNG ĐƯỢC LÀM NHẸ ĐI KHI DỊCH SANG BẤT KỲ THỨ TIẾNG NÀO:
 *    `reGenesis.*` (mạng sẽ bị xoá) · `deChain.soatMoTa` (cửa một chiều) ·
 *    `chainCuaToi.thuHoiY*` (thu hồi không trả lại tên).
 *    Chúng nói "vĩnh viễn" và "không sửa được" để chặn người dùng mất tài sản vì
 *    tưởng làm lại được. Dịch cho êm tai là gỡ mất đúng thứ chúng sinh ra để làm.
 */
export const EN = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    // "running ON Avalanche" was WRONG and removed 2026-08-27 — A1 is networkID 9001,
    // a separate network, not a subnet of Avalanche. See `vi.ts` for the measurement.
    moTaNgan: "9Chain's public testnet — an independent network running the Avalanche engine",
    tagTitle: 'an independent network on the Avalanche engine',
    viTuChoi: 'You rejected the request in your wallet. Nothing has changed.',
    dangTai: 'Loading…',
    thuLai: 'Try again',
    saoChep: 'Copy',
    daChep: 'Copied',
    dong: 'Close',
    moMenu: 'Open menu',
    dongMenu: 'Close menu',
    chuyenSangToi: 'Switch to dark mode',
    chuyenSangSang: 'Switch to light mode',
    boQuaToiNoiDung: 'Skip to main content',
  },

  /** Announcement text for AFTER the reset. Written ahead of time — see `vi.ts`. */
  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',

    bang: 'A1 was rebuilt on {ngay}. Every balance and chain created before that date no longer exists.',
    bangNut: 'What this means',
    nhan: 'Rebuilt',

    tieuDe: 'A1 was rebuilt on {ngay}',
    moTa:
      'The A1 test network has been rebuilt from block 0. Chains, balances and transaction ' +
      'history created before that date no longer exist — not hidden, gone. ' +
      'This page explains what you are seeing and what to do.',

    thayGiTieuDe: 'What you will see',
    thayGi1:
      'Your wallet still connects, still shows the right network name and the same Chain ID ' +
      '{chainId} — that was deliberate. But your balance will be 0.',
    thayGi2:
      'Every L1 you launched is gone from the directory. Their names and Chain IDs are free ' +
      'again, and anyone can claim them.',
    thayGi3:
      'If you signed a transaction but never broadcast it, do not broadcast it now — it ' +
      'belongs to a network that no longer exists.',

    lamGiTieuDe: 'What you need to do',
    lamGi1: 'Request test tokens again from the faucet. Limits have been reset for everyone.',
    lamGi2:
      'Remove each individual L1 from your wallet — they have their own Chain IDs and now ' +
      'point at nothing. The main A1 network does NOT need removing; its settings are unchanged.',
    lamGi3: 'Launch your chain again if you need it. Someone else may have taken the old name.',

    luuTieuDe: 'Archive of the old network',
    luuMoTa:
      'The final state of the network before the rebuild was exported and its hash published, ' +
      'so anyone who wants to check it can.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'A1 is being rebuilt on {ngay} — every chain, balance and transaction created before then will be erased.',
    bangNut: 'Details',
    nhan: 'Rebuild coming',

    tieuDe: 'A1 is being rebuilt on {ngay}',
    moTa:
      'The entire A1 test network will be rebuilt from block 0. Everything created before ' +
      'that date will be gone — not hidden, but no longer in existence. This page says ' +
      'exactly what is lost and what you need to do.',

    viSaoTieuDe: 'Why a rebuild is necessary',
    viSao1:
      "A network's genesis is immutable. That is precisely what makes it trustworthy — nobody, " +
      'including the people who built it, can change a number once it is written into block 0.',
    viSao2:
      'The price of that: changing a number inside genesis leaves no option except rebuilding ' +
      'the network from scratch. A1 raised total supply to 9,000,000,000 LOVE9, and the whole ' +
      'range of staking parameters had to be recalculated to match.',
    viSao3:
      'This is a testnet, and rebuilding is something a testnet is allowed to do. In fact it is ' +
      'why testnets exist: so changes like this happen here, and not on mainnet.',

    matTieuDe: 'What will be lost',
    matMoTa: 'Everything, without exception:',
    mat1: 'Every user-launched L1, including chains that are running perfectly well.',
    mat2: 'Every LOVE9 balance, including tokens received from the faucet.',
    mat3: 'Every transaction, every block, the entire history of the C-Chain, P-Chain and X-Chain.',
    mat4: 'Every validator and every delegation.',

    conTieuDe: 'What is kept',
    conMoTa:
      'Before the deletion, the entire dying network will be exported with a published hash, so ' +
      'the record stays verifiable. What happened can still be checked, even once the network ' +
      'that ran it is gone. The archive link will be posted here on the day of the rebuild.',

    lamTieuDe: 'What you need to do',
    lamTruoc: 'Before the rebuild:',
    lam1:
      'Do not build anything on A1 right now that depends on data surviving. If you are trying ' +
      'out an idea, go ahead — just do not treat the current chain as storage.',
    lamSau: 'After the rebuild:',
    lam2:
      'Remove from your wallet each individual L1 you added — those chains no longer exist, and a ' +
      'wallet pointing at them will simply sit there. The main A1 network needs no removal: its ' +
      'settings are unchanged.',
    lam3:
      "If your wallet does not have the A1 network yet, add it with the button on the faucet page " +
      'rather than typing the settings by hand.',
    lam4: 'Request tokens from the faucet again, and launch your chain again if you want it.',

    imLangTieuDe: 'Your wallet will not warn you',
    imLangMoTa:
      'The new network keeps Chain ID {chainId}, the same RPC address and the same name as the old ' +
      'one. That is deliberate — so every document and guide already published stays correct. The ' +
      'price is that your wallet has no signal at all that it just connected to a different ' +
      'network. The two things below will therefore happen silently.',
    imLang1:
      'A wallet with the old configuration still connects, still shows the right network name, and ' +
      'will report a balance of 0. That number is CORRECT: your old tokens no longer exist, they ' +
      'are not hidden. You do not need to re-add the network — just request new tokens from the ' +
      'faucet. If your wallet reports a stuck transaction or a wrong sequence number, clear that ' +
      "network's activity data in the wallet: it still remembers the transaction count of a chain " +
      'that is dead, while the new chain counts from 0.',
    imLang2:
      'If you still hold a signed transaction that was never broadcast, discard it. The signature ' +
      'is still valid on the new network, because the Chain ID did not change. It will fail while ' +
      'the wallet is empty — but the moment you request tokens from the faucet it becomes ' +
      'spendable, and it may go through at a time you do not expect.',

    lapTieuDe: 'Will this happen again',
    lapMoTa:
      'Possibly. A1 is still a testnet, and until the community picks a mainnet direction between ' +
      'A1 and C1, we keep the right to rebuild the network when something inside genesis has to ' +
      'change. What we commit to is telling you in advance, and saying plainly what is lost.',

    ngayLuuY: 'The date can slip',
    ngayLuuYMoTa:
      'The date {ngay} depends on an earlier go/no-go check. If it slips, we will change the date ' +
      'on this page rather than stay silent.',
  },

  chanTrang: {
    dungThu: 'Try it',
    kham: 'Explore',
    veDuAn: 'About',
    explorer: '9Scan-A1 explorer',
    trangChinh: '9Chain main site',
    moTabMoi: '(opens in a new tab)',
    nhanNav: 'Footer links',
    reGenesis: 'Network rebuild plan',
  },

  dieuHuong: {
    trangChu: 'Home',
    faucet: 'Get test tokens',
    console: 'Launch a chain',
    chainCuaToi: 'My chains',
    bang: 'A1 ↔ C1',
    danhBa: 'L1 directory',
    explorer: 'Explorer',
    banGiao: 'Open 9Scan-A1 in a new tab',
  },

  trangChu: {
    nhanTestnet: 'Testnet — tokens have no real value',
    nutChinh: 'Launch your chain',
    nutPhu: 'Get test tokens first',

    cTieuDe: 'Launch your own chain on A1',
    cPhu: 'An L1 of your own, owned by the wallet you sign with, running for real on the test network. Takes about three minutes.',
    cBangChuThich: 'Each row is a real chain running on A1, with its own owner.',
    cCot: 'Chain',
    cCotKieu: 'Type',
    cCotChu: 'Owner',
    cMacDinh: 'system default',
    cTrong: 'No L1 is running yet',
    cTrongMoTa: 'You would be the first. The directory updates as soon as your chain is up.',

    tuTo: 'All 9 validators currently run on the same server, with the same provider — decentralised at the protocol level, not yet at the infrastructure level.',
    blockDungYen: 'Avalanche does not produce empty blocks, so a block height that stays still while nobody is transacting is normal. The liveness measure is the validator count next to it.',
  },

  soLieu: {
    tieuDe: 'Network is live',
    validator: 'Validators connected',
    soL1: 'L1s running',
    chieuCao: 'C-Chain block',
    dangDo: 'Measuring the network…',
    khongDo: 'Could not read network stats',
    khongDoMoTa: 'The page still works — this is only the status display.',
  },

  deChain: {
    tieuDe: 'Launch your chain',
    moTa:
      'A dedicated L1, owned by your wallet. You sign once to prove who you are, review, ' +
      'and the network builds the chain in about three minutes.',

    noiVi: 'Connect wallet',
    dangNoi: 'Connecting…',
    kyDeVao: 'Sign in',
    dangKy: 'Waiting for signature…',
    viCuaBan: 'Your wallet',
    laChuChain: 'The chain will belong to this wallet. The address comes from your signature — nobody types it in.',
    khongCoVi: 'No wallet found in this browser. Install MetaMask and reload the page.',
    tuChoiKy: 'You declined to sign. Nothing was created.',
    doiVi: 'Use a different wallet',

    nhanTen: 'Chain name',
    goiYTen: 'For example: MyChain',
    moTaTen:
      'Letters, digits and spaces. 2–32 characters. On this network a name that has been used ' +
      'is never reissued — not even for a revoked chain.',
    tenXau: 'The name may contain only letters, digits and spaces, 2–32 characters long.',
    nhanKieu: 'Chain type',
    moTaKieu: 'Once chosen it is fixed — a chain’s genesis cannot be edited.',
    conCho: '{con}/{tong} slots left',
    hetCho: 'No slots left',
    hetChoMoTa:
      'The current model has every validator track every L1, and the protocol drops a node that ' +
      'declares more than 16 subnets. This is a hard ceiling and cannot be raised. Revoking a ' +
      'chain returns a slot.',
    soatLai: 'Review before submitting',

    soatTieuDe: 'Review — this is a one-way door',
    soatMoTa:
      'The genesis of a launched L1 is IMMUTABLE. After this step the name, chain type and owner ' +
      'cannot be changed — and revoking will not give the name and chain ID back either.',
    soatReGenesis:
      'One more thing to know before you press: A1 rebuilds the whole network on {ngay}. The chain ' +
      'you launch today will be erased along with the old network — not hidden, gone.',
    soatTen: 'Chain name',
    soatKieu: 'Chain type',
    soatChu: 'Owner',
    soatQuayLai: 'Go back and edit',
    soatDongY: 'I have reviewed — launch the chain',

    dangDe: 'Launching chain “{ten}”',
    dangDeMoTa:
      'The nodes restart ONE AT A TIME so the network never loses quorum — that is why it is slow, ' +
      'and it is deliberate. Do not close the tab; if you do, the chain is still built.',
    conKhoang: 'About {phut} minutes left',
    dangChuanBi: 'Preparing…',

    xongTieuDe: 'Done — chain “{ten}” is running',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Add chain to wallet',
    xongDaThem: 'Added to wallet',
    xongKichHoat: 'Activate chain (open block 1)',
    xongDaKichHoat: 'Activated',
    xongDangKichHoat: 'Waiting for wallet…',
    xongThemViLoi: 'Could not add the chain to your wallet. {chiTiet}',
    xongKichHoatLoi: 'Could not activate the chain. {chiTiet}',

    deTiep: 'Launch another chain',
    loiDe: 'Could not launch the chain. {chiTiet}',
    loiKhongRo: 'The chain did not appear in the directory after the run finished.',
    luuYTieuDe: 'The first transaction on a new chain',
    luuYCachLam:
      'Do not trust the gas estimate for the first transaction. The cheapest way to open block 1 ' +
      'is an ordinary transfer — press “Activate chain” below.',
  },

  chainCuaToi: {
    tieuDe: 'My chains',
    moTa: 'The L1s owned by the wallet you signed in with. They can be revoked, but read the warning first.',
    noiVi: 'Connect your wallet to see your chains',
    trongTieuDe: 'This wallet does not own any chain yet',
    trongMoTa: 'Launch one and come back — it will show up here immediately.',
    trongNut: 'Launch your chain',

    cotChain: 'Chain',
    cotKieu: 'Type',
    cotSong: 'Status',
    cotViec: '',

    songDo: '{so} validators',
    songDangDo: 'measuring',
    songKhongDo: 'could not measure',
    songGiaiThich: "Measured by the subnet's validator count, not by block height.",
    khongValidator: '0 validators',
    khongValidatorMoTa:
      'This chain can NOT finalise any transaction: the subnet has no validators. It still answers ' +
      'RPC calls and wallets still connect, so there is no other visible sign.',

    thongSo: 'Wallet settings',
    themVaoVi: 'Add to wallet',
    daThemVaoVi: 'Added',
    themViLoi: 'Could not add it to your wallet. {chiTiet}',

    thuHoi: 'Revoke',
    thuHoiTieuDe: 'Revoke “{ten}”?',
    thuHoiY1: 'The chain stops serving RPC immediately and disappears from the public directory.',
    thuHoiY2:
      'Revoking does NOT delete the subnet on the P-Chain — what was created there cannot be ' +
      'removed for as long as this network runs. It also does not remove the network from the ' +
      'wallets of people who already added this chain.',
    thuHoiY3:
      'The name and Chain ID stay reserved and are NEVER reissued to anyone on this network. ' +
      "Reissuing a Chain ID would let a former user's wallet quietly point at somebody else's chain.",
    thuHoiY4: 'In return, one slot out of the 15 is given back.',
    thuHoiGoNhan: 'Type the chain name exactly to confirm',
    thuHoiSaiTen: 'That does not match the chain name.',
    thuHoiXacNhan: 'Revoke permanently',
    thuHoiHuy: 'Cancel',
    thuHoiDangChay: 'Revoking “{ten}” — about three minutes',
    thuHoiXong: 'Revoked “{ten}”. {con}/{tong} slots left.',
    thuHoiLoi: 'Could not revoke. {chiTiet}',
    thuHoiKhongRo: 'The chain is still in the directory after the run finished.',

    daThuHoi: 'Revoked',
    daThuHoiMoTa: 'Name and Chain ID stay reserved on this network.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — comparison',
    moTa:
      '9Chain runs TWO testnets of the same product side by side, differing in engine: ' +
      'A1 on the Avalanche engine, C1 on the Cosmos engine. This table records the trade-offs ' +
      'between the two directions, published so anyone can argue with it — the C1 side has no ' +
      'live measurements yet.',

    tuChamTieuDe: 'The scores below are SELF-ASSESSED by the team, not independently measured',
    tuChamMoTa:
      'The "how it is measured" column says how each criterion was checked. Any criterion without ' +
      'a dated measurement is an architectural judgement, not data. The weights are yours to set — ' +
      'the score follows.',

    cotSo: '#',
    cotTieuChi: 'Criterion',
    cotLoai: 'Type',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Weight',
    loaiKienTruc: 'architecture',
    loaiSong: 'live data',

    tongDiem: 'Total score using your weights',
    hoaNhau: 'Tied',
    dangDan: 'leads',

    soLieuTieuDe: 'Live data',
    a1Validator: 'A1 — validators connected',
    a1Chain: 'A1 — L1s running',
    a1Block: 'A1 — C-Chain block',
    c1Vang: 'C1 — not reachable',
    c1VangMoTa:
      "C1's Cosmos REST URL (port 1317) is needed. The table still works: the A1 side is live data, " +
      'the C1 side is an architectural judgement like the remaining criteria.',
    dangDo: 'measuring…',
    khongDo: 'could not measure',
  },

  faucet: {
    tieuDe: 'Get test tokens',
    moTa:
      'LOVE9 on the A1 testnet has no real value — it exists so you can pay gas while testing. ' +
      'Enter a wallet address and we send some straight away.',
    nhanDiaChi: 'Your wallet address',
    goiYDiaChi: '0x… (40 hex characters)',
    nutXin: 'Send me tokens',
    dangGui: 'Sending…',
    danChoDiaChi: 'Paste the wallet address that should receive the tokens. Press “Add network to wallet” above if you have not yet.',
    themMang: 'Add network to wallet',
    themMangXong: 'Added to wallet',
    themMangTuChoi: 'You pressed reject in your wallet. Press again if you want to add the network.',
    themMangLoi: 'Your wallet could not add the network. Add it manually using the settings beside this — and send the line below to the team:',
    khongCoVi: 'No wallet found in this browser. Install MetaMask and reload the page.',
    hanMucConLai: 'Remaining quota',
    hanMucCachDoc: '{con}/{tong} requests per {gio} hours',
    hanMucHet: 'You have used your whole quota. Try again in {phut} minutes.',
    hanMucKhongDoc: 'Could not read your quota — you can still request, you just will not know how many are left.',
    thanhCong: 'Sent {so} {kyHieu} to {diaChi}',
    xemGiaoDich: 'View transaction',
    thongSoMang: 'Network settings',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Symbol',
    thongSoThapPhan: 'Decimals',
    thongSoExplorer: 'Explorer',
    thapPhanGiaiThich:
      'Wallets show 18 decimals because the C-Chain runs the EVM. On the P/X-Chain, LOVE9 counts ' +
      'in 9 decimals. One coin, two scales — not two different tokens.',
    loiChung: 'Could not send. {chiTiet}',
  },

  /** Bộ chọn ngôn ngữ. Xem `components/ChonNgonNgu.tsx` cho lý do từng nhãn. */
  chonNgonNgu: {
    nhan: 'Language',
    mayDich: 'machine',
    mayDichGiaiThich: 'Only Vietnamese has been reviewed by a person. The other translations are machine-made and may be wrong — the English version is the source of truth.',
    chuaCo: 'not yet available',
  },

  loi: {
    khongKetNoi: 'Could not reach the network',
    khongKetNoiMoTa: 'The network may be busy, or your connection may have dropped.',
    trongRong: 'Nothing here yet',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'This page does not exist',
    moTa:
      'The address you opened does not exist on 9Chain Testnet A1. ' +
      'It may have been renamed, or the URL may have lost a few characters when it was copied.',
    dayLaGi: 'The three most used pages:',
    nhanNav: 'Where to go next',
    veTrangChu: 'Back to home',
    diFaucet: 'Get test tokens',
    diDeChain: 'Launch your chain',
    timGiaoDich: 'Looking for a transaction or an address? Check the hash and try again.',
  },
} as const;

/**
 * Kiểu của MỌI từ điển. 29 bản dịch phải khớp đúng hình dạng này.
 *
 * 🔴 PHẢI NỚI KIỂU, KHÔNG ĐƯỢC DÙNG THẲNG `typeof EN`.
 * `EN` khai `as const` nên `typeof EN` là kiểu CHỮ NGUYÊN VĂN TIẾNG ANH — tức
 * `moTaNgan` có kiểu `"9Chain's public testnet — …"`, và **không một bản dịch nào
 * gán được vào đó**. Đo thật khi thử: `tsc` báo
 *   Type '"Testnet công khai của 9Chain…"' is not assignable to type '"9Chain's public…"'
 * Đọc thoáng qua thì tưởng bản dịch sai; thật ra là kiểu sai.
 *
 * `SauChuoi` giữ nguyên HÌNH DẠNG (khoá nào, lồng mấy tầng) nhưng nới mọi lá thành
 * `string` — đúng thứ ta muốn khoá lại: cấu trúc thì cứng, nội dung thì tự do.
 */
type SauChuoi<T> = { [K in keyof T]: T[K] extends string ? string : SauChuoi<T[K]> };
export type Tu = SauChuoi<typeof EN>;

export default EN;
