import type { Tu } from '../en';

/**
 * 中文（简体） — 机器翻译，未经人工审校。
 * 源语言为英语 (`../en.ts`)；如有出入，以英文版为准。
 *
 * 🔴 以下三处措辞不得弱化：`reGenesis.*`（网络将被删除）、`deChain.soatMoTa`（单向操作）、
 * `chainCuaToi.thuHoiY*`（撤销不会归还名称）。它们使用"永久""无法更改"是为了阻止用户
 * 因误以为可以撤回而损失资产。
 */
export const zh: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: '9Chain 公共测试网 — 运行 Avalanche 引擎的独立网络',
    tagTitle: '运行 Avalanche 引擎的独立网络',
    viTuChoi: '您在钱包中拒绝了该请求。没有任何改动。',
    dangTai: '加载中…',
    thuLai: '重试',
    saoChep: '复制',
    daChep: '已复制',
    dong: '关闭',
    moMenu: '打开菜单',
    dongMenu: '关闭菜单',
    chuyenSangToi: '切换到深色模式',
    chuyenSangSang: '切换到浅色模式',
    boQuaToiNoiDung: '跳到主要内容',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',
    bang: 'A1 已于 {ngay} 重建。该日期之前创建的所有余额和链均已不存在。',
    bangNut: '这意味着什么',
    nhan: '已重建',
    tieuDe: 'A1 已于 {ngay} 重建',
    moTa:
      'A1 测试网络已从区块 0 重建。该日期之前创建的链、余额和交易历史均已不存在 —— ' +
      '不是被隐藏，而是彻底消失。本页说明您现在看到的情况以及应当如何处理。',
    thayGiTieuDe: '您会看到什么',
    thayGi1:
      '您的钱包仍可连接，仍显示正确的网络名称和相同的链 ID {chainId} —— 这是有意为之。' +
      '但您的余额将为 0。',
    thayGi2: '您启动过的每一条 L1 都已从目录中消失。它们的名称和链 ID 已被释放，任何人都可以重新占用。',
    thayGi3: '如果您已签名但从未广播某笔交易，现在不要广播 —— 它属于一个不再存在的网络。',
    lamGiTieuDe: '您需要做什么',
    lamGi1: '重新从水龙头领取测试代币。所有人的限额均已重置。',
    lamGi2:
      '从钱包中逐个删除旧的 L1 —— 它们有各自的链 ID，现在指向空处。' +
      'A1 主网络无需删除，其设置未发生变化。',
    lamGi3: '如有需要，请重新启动您的链。旧名称可能已被他人占用。',
    luuTieuDe: '旧网络的存档',
    luuMoTa: '重建前网络的最终状态已导出并公布其哈希值，任何想要核对的人都可以查验。',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'A1 将于 {ngay} 重建 —— 在此之前创建的所有链、余额和交易都将被抹除。',
    bangNut: '详情',
    nhan: '即将重建',
    tieuDe: 'A1 将于 {ngay} 重建',
    moTa:
      '整个 A1 测试网络将从区块 0 重建。该日期之前创建的一切都将消失 —— 不是被隐藏，' +
      '而是不复存在。本页明确说明会失去什么，以及您需要做什么。',
    viSaoTieuDe: '为什么必须重建',
    viSao1:
      '网络的创世区块是不可更改的。正是这一点使它值得信任 —— 包括建造者在内，' +
      '任何人都无法修改已写入区块 0 的数字。',
    viSao2:
      '代价是：要更改创世区块内的某个数字，除了从头重建网络之外别无他法。' +
      'A1 将总供应量提高到 9,000,000,000 LOVE9，整套质押参数都必须随之重新计算。',
    viSao3:
      '这是测试网，重建正是测试网被允许做的事。事实上这也是测试网存在的意义：' +
      '让这类变更发生在这里，而不是发生在主网上。',
    matTieuDe: '会失去什么',
    matMoTa: '全部，没有例外：',
    mat1: '每一条用户启动的 L1，包括运行良好的链。',
    mat2: '每一笔 LOVE9 余额，包括从水龙头领取的代币。',
    mat3: '每一笔交易、每一个区块，以及 C 链、P 链和 X 链的全部历史。',
    mat4: '每一个验证者和每一笔委托。',
    conTieuDe: '会保留什么',
    conMoTa:
      '在删除之前，整个即将消亡的网络将被导出并公布哈希值，使记录保持可验证。' +
      '即使运行它的网络消失，已发生的事情仍然可以核查。存档链接将在重建当天公布于此。',
    lamTieuDe: '您需要做什么',
    lamTruoc: '重建之前：',
    lam1:
      '现在不要在 A1 上构建任何依赖数据长期存续的东西。如果您只是在尝试某个想法，' +
      '请继续 —— 只是不要把当前的链当作存储。',
    lamSau: '重建之后：',
    lam2:
      '从钱包中逐个删除您添加的 L1 —— 那些链已不存在，指向它们的钱包只会静止不动。' +
      'A1 主网络无需删除：它的设置没有变化。',
    lam3: '如果您的钱包尚未添加 A1 网络，请使用水龙头页面上的按钮添加，而不要手动输入参数。',
    lam4: '重新从水龙头领取代币，如有需要请重新启动您的链。',
    imLangTieuDe: '您的钱包不会发出任何提示',
    imLangMoTa:
      '新网络保留链 ID {chainId}、相同的 RPC 地址和相同的名称。这是有意为之 —— ' +
      '以便已经发布的每一份文档和指南依然正确。代价是：您的钱包完全没有信号表明' +
      '它刚刚连接到了另一个网络。因此下面两件事会在无声中发生。',
    imLang1:
      '使用旧配置的钱包仍可连接，仍显示正确的网络名称，并会报告余额为 0。' +
      '这个数字是正确的：您的旧代币已不存在，而不是被隐藏。您无需重新添加网络 —— ' +
      '只需从水龙头领取新代币。如果钱包报告交易卡住或序号错误，请清除该网络在钱包中的' +
      '活动数据：它仍记着一条已死链的交易计数，而新链是从 0 开始计数的。',
    imLang2:
      '如果您还持有已签名但从未广播的交易，请丢弃它。由于链 ID 未变，该签名在新网络上' +
      '依然有效。在钱包为空时它会失败 —— 但当您从水龙头领取代币的那一刻它就可以执行，' +
      '并可能在您意想不到的时候被打包。',
    lapTieuDe: '这种情况还会再发生吗',
    lapMoTa:
      '有可能。A1 仍然是测试网，在社区于 A1 与 C1 之间选定主网方向之前，' +
      '当创世区块内的内容需要变更时，我们保留重建网络的权利。我们承诺的是提前告知，' +
      '并明确说明会失去什么。',
    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    daXayRaTieuDe: '已于 2026-08-27 重建过一次',
    daXayRaMoTa:
      'A1 已在 2026-08-27 重建过一次，早于下方的日期。如果您在那之前持有测试代币，现在余额为 0 —— 这是正确的，不是您的钱包出了问题。没有用户的链丢失：当时目录中只有自动化测试链。请到水龙头重新领取代币。',
    ngayLuuY: '日期可能推迟',
    ngayLuuYMoTa: '{ngay} 这一日期取决于之前的一道放行检查。若推迟，我们会更改本页的日期，而不是保持沉默。',
  },

  chanTrang: {
    dungThu: '开始使用',
    kham: '浏览网络',
    veDuAn: '关于项目',
    explorer: '9Scan-A1 浏览器',
    trangChinh: '9Chain 官方网站',
    moTabMoi: '（在新标签页中打开）',
    nhanNav: '页脚链接',
    reGenesis: '网络重建计划',
  },

  dieuHuong: {
    trangChu: '首页',
    faucet: '领取测试代币',
    console: '启动链',
    chainCuaToi: '我的链',
    bang: 'A1 ↔ C1',
    danhBa: 'L1 目录',
    explorer: '区块浏览器',
    banGiao: '在新标签页中打开 9Scan-A1',
  },

  trangChu: {
    nhanTestnet: '测试网 —— 代币没有实际价值',
    nutChinh: '启动您的链',
    nutPhu: '先领取测试代币',
    cTieuDe: '在 A1 上启动属于您自己的链',
    cPhu: '一条属于您的 L1，由您签名的钱包拥有，在测试网络上真实运行。大约需要三分钟。',
    cBangChuThich: '每一行都是一条在 A1 上真实运行的链，各有其所有者。',
    cCot: '链',
    cCotKieu: '类型',
    cCotChu: '所有者',
    cMacDinh: '系统默认',
    cTrong: '目前还没有 L1 在运行',
    cTrongMoTa: '您将会是第一个。您的链启动后，目录会立即更新。',
    tuTo: '10 个验证者中有 9 个运行在同一台服务器、同一家服务商上；第十个运行在另一家服务商。协议层面已经去中心化，基础设施层面才刚刚开始。',
    blockDungYen: 'Avalanche 不会产生空区块，因此在无人交易时区块高度保持不变是正常的。判断存活的指标是旁边的验证者数量。',
  },

  soLieu: {
    tieuDe: '网络运行中',
    validator: '已连接验证者',
    soL1: '运行中的 L1',
    chieuCao: 'C 链区块',
    dangDo: '正在测量网络…',
    khongDo: '无法读取网络数据',
    khongDoMoTa: '页面仍可正常使用 —— 这里只是状态显示。',
  },

  loadTest: {
    badge: '压力测试',
    banner: '我们正在进行公开压力测试 —— 每秒 {tps} 笔交易，由我们生成，并非真实用户。',
    bannerLink: '查看实时数据',
    title: '公开压力测试',
    intro: 'A1 是一个新的测试网络，真实用户极少，若无人使用几乎不会产生区块。我们持续生成交易，让网络保持运转，也让你能看到它在工作。这些流量是我们自己制造的。它不是使用量，我们也不把它算作使用量 —— 下方列出了发送这些交易的全部地址，你可以把它们排除掉。',
    running: '正在运行',
    stopped: '当前未运行',
    stoppedWhy: '记录的原因：{reason}',
    labelTps: '每秒交易数',
    labelBlockHeight: 'C 链区块',
    labelSecondsPerBlock: '每个区块秒数',
    labelTotal: '启动以来已确认的交易',
    labelUptime: '已运行',
    committedNote: '这些数字取自区块本身，而不是我们尝试发送的数量。网络已接受但从未打包进区块的交易不计入此处。',
    addressesTitle: '九个发送地址',
    addressesNote: '来自这些地址的每一笔交易都由我们用机器生成。把它们过滤掉，就能看到真实活动。',
    measuring: '正在读取压力测试状态…',
    notMeasured: '无法读取压力测试状态',
    notMeasuredMore: '页面仍可正常使用 —— 这里只是状态显示。',
  },

  deChain: {
    tieuDe: '启动您的链',
    moTa: '一条专属 L1，由您的钱包拥有。您签名一次以证明身份，确认后网络将在约三分钟内构建该链。',
    noiVi: '连接钱包',
    dangNoi: '连接中…',
    kyDeVao: '签名登录',
    dangKy: '等待签名…',
    viCuaBan: '您的钱包',
    laChuChain: '该链将属于此钱包。地址来自您的签名 —— 无需任何人手动输入。',
    khongCoVi: '在此浏览器中未找到钱包。请安装 MetaMask 后重新加载页面。',
    tuChoiKy: '您拒绝了签名。没有创建任何内容。',
    doiVi: '使用其他钱包',
    nhanTen: '链名称',
    goiYTen: '例如：MyChain',
    moTaTen: '字母、数字和空格。2–32 个字符。在本网络上，用过的名称永不再分配 —— 即使是已撤销的链也不例外。',
    tenXau: '名称只能包含字母、数字和空格，长度为 2–32 个字符。',
    nhanKieu: '链类型',
    moTaKieu: '一经选定即固定 —— 链的创世区块无法编辑。',
    conCho: '剩余 {con}/{tong} 个名额',
    hetCho: '名额已满',
    hetChoMoTa:
      '当前模式要求每个验证者跟踪每一条 L1，而协议会断开声明超过 16 个子网的节点。' +
      '这是硬性上限，无法提高。撤销一条链会归还一个名额。',
    soatLai: '提交前请确认',
    soatTieuDe: '确认 —— 这是一道单向门',
    soatMoTa:
      '已启动 L1 的创世区块是不可更改的。此步骤之后，名称、链类型和所有者都无法更改 —— ' +
      '撤销也不会归还名称和链 ID。',
    soatReGenesis:
      '按下之前还需知道一件事：A1 将于 {ngay} 重建整个网络。您今天启动的链将随旧网络一同被抹除 —— ' +
      '不是被隐藏，而是彻底消失。',
    soatTen: '链名称',
    soatKieu: '链类型',
    soatChu: '所有者',
    soatQuayLai: '返回修改',
    soatDongY: '我已确认 —— 启动该链',
    dangDe: '正在启动链 “{ten}”',
    dangDeMoTa:
      '各节点逐一重启，以确保网络始终不失去法定人数 —— 这就是它慢的原因，而且是有意的。' +
      '请不要关闭标签页；即使关闭，链仍会继续构建。',
    conKhoang: '大约还需 {phut} 分钟',
    dangChuanBi: '准备中…',
    xongTieuDe: '完成 —— 链 “{ten}” 正在运行',
    xongChainId: '链 ID',
    xongRpc: 'RPC',
    xongThemVi: '将链添加到钱包',
    xongDaThem: '已添加到钱包',
    xongKichHoat: '激活链（打开区块 1）',
    xongDaKichHoat: '已激活',
    xongDangKichHoat: '等待钱包…',
    xongThemViLoi: '无法将该链添加到您的钱包。{chiTiet}',
    xongKichHoatLoi: '无法激活该链。{chiTiet}',
    deTiep: '再启动一条链',
    loiDe: '无法启动该链。{chiTiet}',
    loiKhongRo: '运行结束后，该链未出现在目录中。',
    luuYTieuDe: '新链上的第一笔交易',
    luuYCachLam: '不要相信第一笔交易的 gas 估算。打开区块 1 最省事的方式是一笔普通转账 —— 请按下方的“激活链”。',
  },

  chainCuaToi: {
    tieuDe: '我的链',
    moTa: '由您登录所用钱包拥有的 L1。可以撤销，但请先阅读警告。',
    noiVi: '连接钱包以查看您的链',
    trongTieuDe: '此钱包尚未拥有任何链',
    trongMoTa: '启动一条后再回来 —— 它会立刻显示在这里。',
    trongNut: '启动您的链',
    cotChain: '链',
    cotKieu: '类型',
    cotSong: '状态',
    cotViec: '',
    songDo: '{so} 个验证者',
    songDangDo: '测量中',
    songKhongDo: '无法测量',
    songGiaiThich: '以子网的验证者数量衡量，而不是以区块高度衡量。',
    khongValidator: '0 个验证者',
    khongValidatorMoTa:
      '该链无法确认任何交易：子网没有验证者。它仍会响应 RPC 调用，钱包也仍能连接，' +
      '因此没有其他可见迹象。',
    thongSo: '钱包参数',
    themVaoVi: '添加到钱包',
    daThemVaoVi: '已添加',
    themViLoi: '无法将其添加到您的钱包。{chiTiet}',
    thuHoi: '撤销',
    thuHoiTieuDe: '撤销 “{ten}”？',
    thuHoiY1: '该链会立即停止提供 RPC 服务，并从公共目录中消失。',
    thuHoiY2:
      '撤销并不会删除 P 链上的子网 —— 只要本网络还在运行，那里创建的东西就无法移除。' +
      '它也不会从已添加该链的用户钱包中移除该网络。',
    thuHoiY3:
      '该名称和链 ID 将保持占用，并且永远不会在本网络上重新分配给任何人。' +
      '重新分配链 ID 会让曾经的用户的钱包悄然指向他人的链。',
    thuHoiY4: '作为交换，15 个名额中的一个会被归还。',
    thuHoiGoNhan: '请准确输入链名称以确认',
    thuHoiSaiTen: '与链名称不符。',
    thuHoiXacNhan: '永久撤销',
    thuHoiHuy: '取消',
    thuHoiDangChay: '正在撤销 “{ten}” —— 大约三分钟',
    thuHoiXong: '已撤销 “{ten}”。剩余 {con}/{tong} 个名额。',
    thuHoiLoi: '无法撤销。{chiTiet}',
    thuHoiKhongRo: '运行结束后，该链仍在目录中。',
    daThuHoi: '已撤销',
    daThuHoiMoTa: '名称和链 ID 在本网络上保持占用。',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 —— 对比',
    moTa:
      '9Chain 并行运行同一产品的两个测试网，区别在于引擎：A1 使用 Avalanche 引擎，' +
      'C1 使用 Cosmos 引擎。本表记录两个方向之间的取舍，公开发布以便任何人提出异议 —— ' +
      'C1 一侧目前尚无实测数据。',
    tuChamTieuDe: '以下分数由团队自评，并非独立测量',
    tuChamMoTa:
      '“如何测量”一列说明每项标准的核查方式。任何没有标注日期测量的标准都属于架构判断，' +
      '而非数据。权重由您设定 —— 分数随之变化。',
    cotSo: '#',
    cotTieuChi: '标准',
    cotLoai: '类型',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: '权重',
    loaiKienTruc: '架构',
    loaiSong: '实测数据',
    tongDiem: '按您的权重计算的总分',
    hoaNhau: '持平',
    dangDan: '领先',
    soLieuTieuDe: '实时数据',
    a1Validator: 'A1 —— 已连接验证者',
    a1Chain: 'A1 —— 运行中的 L1',
    a1Block: 'A1 —— C 链区块',
    c1Vang: 'C1 —— 无法连接',
    c1VangMoTa:
      '需要 C1 的 Cosmos REST 地址（端口 1317）。本表仍可使用：A1 一侧是实时数据，' +
      'C1 一侧与其余标准一样属于架构判断。',
    dangDo: '测量中…',
    khongDo: '无法测量',
  },

  faucet: {
    tieuDe: '领取测试代币',
    moTa: 'A1 测试网上的 LOVE9 没有实际价值 —— 它的存在是为了让您在测试时支付 gas。输入钱包地址，我们会立即发送。',
    nhanDiaChi: '您的钱包地址',
    goiYDiaChi: '0x…（40 个十六进制字符）',
    nutXin: '给我发送代币',
    dangGui: '发送中…',
    danChoDiaChi: '粘贴应当接收代币的钱包地址。若尚未添加，请按上方的“添加网络到钱包”。',
    themMang: '添加网络到钱包',
    themMangXong: '已添加到钱包',
    themMangTuChoi: '您在钱包中按下了拒绝。如果想添加网络，请再按一次。',
    themMangLoi: '您的钱包无法添加该网络。请使用旁边的参数手动添加 —— 并把下面这行发给团队：',
    khongCoVi: '在此浏览器中未找到钱包。请安装 MetaMask 后重新加载页面。',
    hanMucConLai: '剩余额度',
    hanMucCachDoc: '每 {gio} 小时 {con}/{tong} 次',
    hanMucHet: '您已用完全部额度。请在 {phut} 分钟后重试。',
    hanMucKhongDoc: '无法读取您的额度 —— 您仍然可以申请，只是不知道还剩几次。',
    thanhCong: '已向 {diaChi} 发送 {so} {kyHieu}',
    xemGiaoDich: '查看交易',
    thongSoMang: '网络参数',
    thongSoRpc: 'RPC',
    thongSoChainId: '链 ID',
    thongSoKyHieu: '符号',
    thongSoThapPhan: '小数位',
    thongSoExplorer: '区块浏览器',
    thapPhanGiaiThich:
      '钱包显示 18 位小数，因为 C 链运行 EVM。在 P/X 链上，LOVE9 以 9 位小数计。' +
      '同一种币，两套刻度 —— 不是两种不同的代币。',
    loiChung: '发送失败。{chiTiet}',
  },

  chonNgonNgu: {
    nhan: '语言',
    mayDich: '机器翻译',
    mayDichGiaiThich: '只有越南语版本经过人工审校。其余译文均由机器生成，可能有误 —— 英文版为准。',
    chuaCo: '尚未提供',
  },

  loi: {
    khongKetNoi: '无法连接到网络',
    khongKetNoiMoTa: '网络可能繁忙，或者您的连接已中断。',
    trongRong: '这里还没有内容',
  },

  khongThay: {
    ma: '404',
    tieuDe: '此页面不存在',
    moTa: '您打开的地址在 9Chain Testnet A1 上不存在。它可能已被重命名，或者 URL 在复制时丢失了几个字符。',
    dayLaGi: '最常用的三个页面：',
    nhanNav: '接下来去哪里',
    veTrangChu: '返回首页',
    diFaucet: '领取测试代币',
    diDeChain: '启动您的链',
    timGiaoDich: '在找某笔交易或某个地址？请检查哈希值后重试。',
  },
};

export default zh;
