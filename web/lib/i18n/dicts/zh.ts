import type { Dict } from '../en';

/**
 * 中文（简体） — 机器翻译，未经人工审校。
 * 源语言为英语 (`../en.ts`)；如有出入，以英文版为准。
 *
 * 🔴 以下三处措辞不得弱化：`reGenesis.*`（网络将被删除）、`deChain.soatMoTa`（单向操作）、
 * `chainCuaToi.thuHoiY*`（撤销不会归还名称）。它们使用"永久""无法更改"是为了阻止用户
 * 因误以为可以撤回而损失资产。
 */
export const zh: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: '9Chain 公共测试网 — 运行 Avalanche 引擎的独立网络',
    tagline: '运行 Avalanche 引擎的独立网络',
    walletRejected: '您在钱包中拒绝了该请求。没有任何改动。',
    noWalletMobile: '手机浏览器无法安装钱包扩展。请改在 MetaMask 应用内打开本页——应用自带的浏览器里有钱包。',
    openInMetaMask: '在 MetaMask 应用中打开',
    loading: '加载中…',
    retry: '重试',
    copy: '复制',
    copied: '已复制',
    close: '关闭',
    openMenu: '打开菜单',
    closeMenu: '关闭菜单',
    switchToDark: '切换到深色模式',
    switchToLight: '切换到浅色模式',
    skipToContent: '跳到主要内容',
    stepDone: '—— 完成',
    stepRunning: '—— 进行中',
    stepFailed: '—— 失败',
    stepPending: '—— 等待中',
  },

  presets: {
    standard: {
      name: '标准',
      desc: '一条普通的 EVM 链。所有者获得全部创世代币以及调整费用的权利。',
    },
    'zero-fee': {
      name: '近乎零手续费',
      desc: 'baseFee = 1 wei，交易只需支付这个下限（一笔转账花费 0.000000000000021 LOVE9）。适合游戏、实验和内部链。代价：几乎没有任何东西能阻挡垃圾交易。',
    },
    'high-throughput': {
      name: '高吞吐量',
      desc: '每个区块可容纳五倍的交易（gasLimit 6000 万而非 1200 万）。适合游戏、交易所以及任何有持续小额交易流的场景。代价：区块更重，为这条链运行节点的人需要更强的机器。',
    },
    mintable: {
      name: '可增发供应',
      desc: '所有者可随时通过预编译合约 0x0200000000000000000000000000000000000001 增发原生代币。供应量并不固定——使用这条链的每个人都应知道这一点。',
    },
    'owner-deploy-only': {
      name: '仅所有者可部署合约',
      desc: '其他人仍可发送交易并使用现有合约，但不能部署自己的合约。所有者可通过预编译合约 0x0200000000000000000000000000000000000000 把该权限授予任何人。',
    },
    permissioned: {
      name: '许可制（仅限已批准的发送方）',
      desc: '只有名单中的地址才能发送交易。适合公司内部链。⚠️ 这是最严格的预设：陌生钱包来到这里什么都做不了。',
    },
  },
  steps: {
    genesis: '正在构建创世区块',
    subnet: '正在 P-Chain 上创建子网和区块链',
    rpc: '正在等待 L1 RPC 响应',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',
    banner: 'A1 已于 {date} 重建。该日期之前创建的所有余额和链均已不存在。',
    bannerLink: '这意味着什么',
    badge: '已重建',
    title: 'A1 已于 {date} 重建',
    desc:
      'A1 测试网络已从区块 0 重建。该日期之前创建的链、余额和交易历史均已不存在 —— ' +
      '不是被隐藏，而是彻底消失。本页说明您现在看到的情况以及应当如何处理。',
    willSeeTitle: '您会看到什么',
    willSee1:
      '您的钱包仍可连接，仍显示正确的网络名称和相同的链 ID {chainId} —— 这是有意为之。' +
      '但您的余额将为 0。',
    willSee2: '您启动过的每一条 L1 都已从目录中消失。它们的名称和链 ID 已被释放，任何人都可以重新占用。',
    willSee3: '如果您已签名但从未广播某笔交易，现在不要广播 —— 它属于一个不再存在的网络。',
    toDoTitle: '您需要做什么',
    toDo1: '重新从水龙头领取测试代币。所有人的限额均已重置。',
    toDo2:
      '从钱包中逐个删除旧的 L1 —— 它们有各自的链 ID，现在指向空处。' +
      'A1 主网络无需删除，其设置未发生变化。',
    toDo3: '如有需要，请重新启动您的链。旧名称可能已被他人占用。',
    archiveTitle: '旧网络的存档',
    archiveDesc: '重建前网络的最终状态已导出并公布其哈希值，任何想要核对的人都可以查验。',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1 将于 {date} 重建 —— 在此之前创建的所有链、余额和交易都将被抹除。',
    bannerLink: '详情',
    badge: '即将重建',
    title: 'A1 将于 {date} 重建',
    desc:
      '整个 A1 测试网络将从区块 0 重建。该日期之前创建的一切都将消失 —— 不是被隐藏，' +
      '而是不复存在。本页明确说明会失去什么，以及您需要做什么。',
    whyTitle: '为什么必须重建',
    why1:
      '网络的创世区块是不可更改的。正是这一点使它值得信任 —— 包括建造者在内，' +
      '任何人都无法修改已写入区块 0 的数字。',
    why2:
      '代价是：要更改创世区块内的某个数字，除了从头重建网络之外别无他法。' +
      'A1 将总供应量提高到 9,000,000,000 LOVE9，整套质押参数都必须随之重新计算。',
    why3:
      '这是测试网，重建正是测试网被允许做的事。事实上这也是测试网存在的意义：' +
      '让这类变更发生在这里，而不是发生在主网上。',
    lostTitle: '会失去什么',
    lostDesc: '全部，没有例外：',
    lost1: '每一条用户启动的 L1，包括运行良好的链。',
    lost2: '每一笔 LOVE9 余额，包括从水龙头领取的代币。',
    lost3: '每一笔交易、每一个区块，以及 C 链、P 链和 X 链的全部历史。',
    lost4: '每一个验证者和每一笔委托。',
    keptTitle: '会保留什么',
    keptDesc:
      '在删除之前，整个即将消亡的网络将被导出并公布哈希值，使记录保持可验证。' +
      '即使运行它的网络消失，已发生的事情仍然可以核查。存档链接将在重建当天公布于此。',
    toDoTitle: '您需要做什么',
    toDoBefore: '重建之前：',
    toDo1:
      '现在不要在 A1 上构建任何依赖数据长期存续的东西。如果您只是在尝试某个想法，' +
      '请继续 —— 只是不要把当前的链当作存储。',
    toDoAfter: '重建之后：',
    toDo2:
      '从钱包中逐个删除您添加的 L1 —— 那些链已不存在，指向它们的钱包只会静止不动。' +
      'A1 主网络无需删除：它的设置没有变化。',
    toDo3: '如果您的钱包尚未添加 A1 网络，请使用水龙头页面上的按钮添加，而不要手动输入参数。',
    toDo4: '重新从水龙头领取代币，如有需要请重新启动您的链。',
    silentTitle: '您的钱包不会发出任何提示',
    silentDesc:
      '新网络保留链 ID {chainId}、相同的 RPC 地址和相同的名称。这是有意为之 —— ' +
      '以便已经发布的每一份文档和指南依然正确。代价是：您的钱包完全没有信号表明' +
      '它刚刚连接到了另一个网络。因此下面两件事会在无声中发生。',
    silent1:
      '使用旧配置的钱包仍可连接，仍显示正确的网络名称，并会报告余额为 0。' +
      '这个数字是正确的：您的旧代币已不存在，而不是被隐藏。您无需重新添加网络 —— ' +
      '只需从水龙头领取新代币。如果钱包报告交易卡住或序号错误，请清除该网络在钱包中的' +
      '活动数据：它仍记着一条已死链的交易计数，而新链是从 0 开始计数的。',
    silent2:
      '如果您还持有已签名但从未广播的交易，请丢弃它。由于链 ID 未变，该签名在新网络上' +
      '依然有效。在钱包为空时它会失败 —— 但当您从水龙头领取代币的那一刻它就可以执行，' +
      '并可能在您意想不到的时候被打包。',
    repeatTitle: '这种情况还会再发生吗',
    repeatDesc:
      '有可能。A1 仍然是测试网，在社区于 A1 与 C1 之间选定主网方向之前，' +
      '当创世区块内的内容需要变更时，我们保留重建网络的权利。我们承诺的是提前告知，' +
      '并明确说明会失去什么。',
    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    alreadyTitle: '已于 2026-08-27 重建过一次',
    alreadyDesc:
      'A1 已在 2026-08-27 重建过一次，早于下方的日期。如果您在那之前持有测试代币，现在余额为 0 —— 这是正确的，不是您的钱包出了问题。没有用户的链丢失：当时目录中只有自动化测试链。请到水龙头重新领取代币。',
    dateNote: '日期可能推迟',
    dateNoteDesc: '{date} 这一日期取决于之前的一道放行检查。若推迟，我们会更改本页的日期，而不是保持沉默。',
  },

  footer: {
    tryIt: '开始使用',
    explore: '浏览网络',
    about: '关于项目',
    explorer: '9Scan-A1 浏览器',
    mainSite: '9Chain 官方网站',
    opensNewTab: '（在新标签页中打开）',
    navLabel: '页脚链接',
    rebuildPlan: '网络重建计划',
  },

  nav: {
    home: '首页',
    faucet: '领取测试代币',
    launch: '启动链',
    myChains: '我的链',
    compare: 'A1 ↔ C1',
    directory: 'L1 目录',
    explorer: '区块浏览器',
    explorerAria: '在新标签页中打开 9Scan-A1',
    ceremony: "仪式",
  },

  home: {
    testnetBadge: '测试网 —— 代币没有实际价值',
    primaryCta: '启动您的链',
    secondaryCta: '先领取测试代币',
    title: '在 A1 上启动属于您自己的链',
    subtitle: '一条属于您的 L1，由您签名的钱包拥有，在测试网络上真实运行。大约需要五分钟。',
    tableCaption: '每一行都是一条在 A1 上真实运行的链，各有其所有者。',
    colChain: '链',
    colType: '类型',
    colOwner: '所有者',
    systemDefault: '系统默认',
    emptyTitle: '目前还没有 L1 在运行',
    emptyDesc: '您将会是第一个。您的链启动后，目录会立即更新。',
    moreChains: '在目录中查看全部 {count} 条链',
    disclosure: '11 个验证者中有 9 个运行在同一台服务器、同一家供应商上；另外两个来自别处，且只有一个在线 —— 在协议层面是去中心化的，在基础设施层面还不是。',
    idleBlocksNote: 'Avalanche 不会产生空区块，因此在无人交易时区块高度保持不变是正常的。判断存活的指标是旁边的验证者数量。',
  },

  stats: {
    title: '网络运行中',
    validators: '已连接验证者',
    l1Count: '运行中的 L1',
    blockHeight: 'C 链区块',
    measuring: '正在测量网络…',
    cannotMeasure: '无法读取网络数据',
    cannotMeasureDesc: '页面仍可正常使用 —— 这里只是状态显示。',
  },
  directory: {
    lede: 'A1 测试网上的每一条链，以及它们的真实状态。',
    howToTitle: '如何看这张表。',
    howToBody: 'Avalanche 不会产出空块——只有发生交易时链才出块，所以块高停住是正常的，并不表示链已经死了。反过来才危险：没有验证者的链依然响应 RPC，依然能读余额，钱包也依然连得上——但每一笔交易都会永远悬着。所以这里真正的存活信号是子网验证者数量，直接从 P-Chain 读取，而不是块高。',
    ownerTitle: '所有者（admin）',
    ownerBody: '是启动这条链时填入的地址。它持有全部创世供应量，并有权修改该链的手续费——链属于他们，不属于基金会。在控制台加入这个字段之前启动的链会显示为系统默认。',
    mainNetwork: '主网络',
    mainNetworkDesc: 'A1 测试网的 C-Chain——水龙头和区块浏览器工作的地方。',
    running: '正在运行',
    notAnswering: '无响应',
    notAnsweringDesc: 'RPC 没有响应——可能还没有节点在跟踪这个子网。',
    unclear: '不明确',
    unclearDesc: '无法从 P-Chain 读取验证者集合。',
    ownerAdmin: '所有者（admin）',
    blocks: '块数',
    subnetValidators: '子网验证者',
    created: '创建时间',
    revokedAt: '撤销时间',
    copyOwner: '复制所有者地址',
    revoked: '已撤销',
    revokedDesc: '这条链已停止服务：没有节点再运行它，它的 RPC 也不再响应。如果你曾把这个网络加入钱包，请删掉它——留着只会产生连接错误。',
    neverReissued: '绝不会再分配给别的链',
    revokedGroup: '已撤销（{count}）',
    listError: '无法读取链列表（{error}）。下面仍然显示主网络。',
    footSummary: '{count} 条 L1 正在运行 + 主网络',
    footRevoked: '已撤销 {count} 条',
    footUpdated: '更新于 {time}',
    tileTotal: '目录中的 L1',
    tileRunning: '测得运行中',
    tileAttention: '需要关注',
    tileRevoked: '已撤销',
    sweepProgress: '已测量 {done}/{total}',
    measuringDesc: '已排队等待测量。',
    howToToggle: '如何阅读此列表',
    searchLabel: '搜索',
    searchPlaceholder: '名称、Chain ID、所有者或 blockchain ID',
    filterStatus: '状态',
    filterAll: '全部',
    filterRunning: '运行中',
    filterAttention: '需要关注',
    filterRevoked: '已撤销',
    filterType: '类型',
    filterTypeAll: '所有类型',
    groupBy: '分组',
    groupNone: '不分组',
    groupOwner: '所有者',
    groupType: '类型',
    groupStatus: '状态',
    groupNoType: '未记录类型',
    groupCount: '{shown}/{total}',
    sortBy: '排序',
    sortNewest: '最新优先',
    sortOldest: '最早优先',
    sortName: '名称',
    sortChainId: 'Chain ID',
    sortBlocks: '区块最多',
    refresh: '重新测量',
    listCaption: 'A1 上的链及各自测得的状态',
    showing: '显示 {shown}/{total}',
    showMore: '再显示 {count} 条',
    noMatchTitle: '没有匹配的链',
    noMatchDesc: '换个搜索词，或清除筛选。',
    clearFilters: '清除筛选',
    showDetails: '详情',
    hideDetails: '收起',
    detailsOf: '{name} 的详情',
    nativeToken: '原生代币',
    mismatch: '链不符',
    mismatchDesc: 'RPC 返回的 Chain ID 是 {got} 而非 {expected} — 很可能是路由故障，而不是这条链的问题。',
  },
  ceremony: {
    badge: "仪式",
    title: "9S Union 仪式",
    desc: "在某一精确的一秒，网络会写下三个具名区块。本页说明将会发生什么、这些区块承载什么，以及事后你如何自行核验，而无需询问我们。",
    momentLabel: "时刻",
    countdownLabel: "剩余时间",
    days: "天",
    hours: "小时",
    minutes: "分",
    seconds: "秒",
    yourZone: "你所在的时区",
    blocksTitle: "三个区块",
    adamDesc: "时间戳达到该时刻的第一个区块 —— 由时间定义，而非由高度定义。谁产出那个区块，就是谁产出的。",
    evaDesc: "按高度紧接在 Adam 之后的那个区块。",
    unionDesc: "Adam 之后第十个区块。9S Union 的讯息锚定在此。",
    messagesTitle: "区块承载什么",
    messagesDesc: "Adam 与 Eva 承载的，正是网络创建时就写入第 0 区块的那两句话 —— 仪式指向的是同一批文件，因此两者不可能各自漂移。下列每个摘要都在 2026-09-03 冻结，早于仪式，任何人都能对原始字节做 sha256 复现。",
    quietTitle: "安静的一分钟",
    quietDesc: "C-Chain 不产出空区块，所以我们在实时页面上公开的合成流量会在时刻前不久停止。若不停，仪式就要与一个自动发送程序抢夺约两秒的窗口。代价是一分钟的安静；换来的是这些区块属于仪式，而不属于机器人。",
    strangerTitle: "陌生人可以拿走那个区块，记录依然成立",
    strangerDesc: "A1 是公开测试网络，任何人都可以在那一秒发送交易。记录锚定于仪式的交易哈希，而非区块高度 —— 因此若别人的区块先达到该时刻，已写下的内容依然为真；只是那个区块并非由仪式产出。",
    checkTitle: "自己核验",
    checkDesc: "向任意 A1 节点索取该时刻的区块并读取其时间戳。本页没有任何一处需要你凭信任接受。",
    resultTitle: "记录下了什么",
    resultPending: "尚未公布。证据包 —— 时刻、所用偏移、背景流量、三个交易哈希、区块号，以及把字节从链上读回的结果 —— 将在仪式后发布于此。",
    resultBlock: "Block Adam",
    resultTimestamp: "它的时间戳",
    resultBundle: "证据包",
    reachedNote: "时刻已过。记录尚未在此公布 —— 那要等到字节已从链上读回，并与冻结的摘要核对之后。",
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

  launch: {
    title: '启动您的链',
    desc: '一条专属 L1，由您的钱包拥有。您签名一次以证明身份，确认后网络将在约五分钟内构建该链。',
    connectWallet: '连接钱包',
    connecting: '连接中…',
    signIn: '签名登录',
    signing: '等待签名…',
    yourWallet: '您的钱包',
    youWillOwn: '该链将属于此钱包。地址来自您的签名 —— 无需任何人手动输入。',
    noWallet: '在此浏览器中未找到钱包。请安装 MetaMask 后重新加载页面。',
    signRejected: '您拒绝了签名。没有创建任何内容。',
    switchWallet: '使用其他钱包',
    nameLabel: '链名称',
    namePlaceholder: '例如：MyChain',
    nameHelp: '字母、数字和空格。2–32 个字符。在本网络上，用过的名称永不再分配 —— 即使是已撤销的链也不例外。',
    nameInvalid: '名称只能包含字母、数字和空格，长度为 2–32 个字符。',
    typeLabel: '链类型',
    typeHelp: '一经选定即固定 —— 链的创世区块无法编辑。',
    slotsLeft: '剩余 {left}/{total} 个名额',
    slotsFull: '名额已满',
    slotsFullDesc:
      '当前模式要求每个验证者跟踪每一条 L1，而协议会断开声明超过 16 个子网的节点。' +
      '这是硬性上限，无法提高。撤销一条链会归还一个名额。',
    reviewCta: '提交前请确认',
    reviewTitle: '确认 —— 这是一道单向门',
    reviewDesc:
      '已启动 L1 的创世区块是不可更改的。此步骤之后，名称、链类型和所有者都无法更改 —— ' +
      '撤销也不会归还名称和链 ID。',
    reviewRebuild:
      '按下之前还需知道一件事：A1 将于 {date} 重建整个网络。您今天启动的链将随旧网络一同被抹除 —— ' +
      '不是被隐藏，而是彻底消失。',
    reviewName: '链名称',
    reviewType: '链类型',
    reviewOwner: '所有者',
    reviewBack: '返回修改',
    reviewConfirm: '我已确认 —— 启动该链',
    launching: '正在启动链 “{name}”',
    launchingDesc:
      '各节点逐一重启，以确保网络始终不失去法定人数 —— 这就是它慢的原因，而且是有意的。' +
      '请不要关闭标签页；即使关闭，链仍会继续构建。',
    etaRemaining: '大约还需 {minutes} 分钟',
    preparing: '准备中…',
    doneTitle: '完成 —— 链 “{name}” 正在运行',
    doneChainId: '链 ID',
    doneRpc: 'RPC',
    doneAddWallet: '将链添加到钱包',
    doneAdded: '已添加到钱包',
    doneActivate: '激活链（打开区块 1）',
    doneActivated: '已激活',
    doneActivating: '等待钱包…',
    doneAddWalletError: '无法将该链添加到您的钱包。{detail}',
    doneActivateError: '无法激活该链。{detail}',
    launchAnother: '再启动一条链',
    launchError: '无法启动该链。{detail}',
    unknownError: '运行结束后，该链未出现在目录中。',
    noteTitle: '新链上的第一笔交易',
    noteHow: '不要相信第一笔交易的 gas 估算。打开区块 1 最省事的方式是一笔普通转账 —— 请按下方的“激活链”。',
  },

  myChains: {
    title: '我的链',
    desc: '由您登录所用钱包拥有的 L1。可以撤销，但请先阅读警告。',
    connectWallet: '连接钱包以查看您的链',
    emptyTitle: '此钱包尚未拥有任何链',
    emptyDesc: '启动一条后再回来 —— 它会立刻显示在这里。',
    emptyCta: '启动您的链',
    colChain: '链',
    colType: '类型',
    colStatus: '状态',
    colActions: '',
    validatorCount: '{count} 个验证者',
    measuring: '测量中',
    cannotMeasure: '无法测量',
    statusHelp: '以子网的验证者数量衡量，而不是以区块高度衡量。',
    noValidators: '0 个验证者',
    noValidatorsDesc:
      '该链无法确认任何交易：子网没有验证者。它仍会响应 RPC 调用，钱包也仍能连接，' +
      '因此没有其他可见迹象。',
    walletSettings: '钱包参数',
    addToWallet: '添加到钱包',
    addedToWallet: '已添加',
    addWalletError: '无法将其添加到您的钱包。{detail}',
    revoke: '撤销',
    revokeTitle: '撤销 “{name}”？',
    revokeWarn1: '该链会立即停止提供 RPC 服务，并从公共目录中消失。',
    revokeWarn2:
      '撤销并不会删除 P 链上的子网 —— 只要本网络还在运行，那里创建的东西就无法移除。' +
      '它也不会从已添加该链的用户钱包中移除该网络。',
    revokeWarn3:
      '该名称和链 ID 将保持占用，并且永远不会在本网络上重新分配给任何人。' +
      '重新分配链 ID 会让曾经的用户的钱包悄然指向他人的链。',
    revokeWarn4: '作为交换，15 个名额中的一个会被归还。',
    revokeTypeLabel: '请准确输入链名称以确认',
    revokeNameMismatch: '与链名称不符。',
    revokeConfirm: '永久撤销',
    revokeCancel: '取消',
    revoking: '正在撤销 “{name}” —— 大约五分钟',
    revokeDone: '已撤销 “{name}”。剩余 {left}/{total} 个名额。',
    revokeError: '无法撤销。{detail}',
    revokeUnknown: '运行结束后，该链仍在目录中。',
    revokedBadge: '已撤销',
    revokedDesc: '名称和链 ID 在本网络上保持占用。',
  },

  compare: {
    title: 'A1 ↔ C1 —— 对比',
    desc:
      '9Chain 并行运行同一产品的两个测试网，区别在于引擎：A1 使用 Avalanche 引擎，' +
      'C1 使用 Cosmos 引擎。本表记录两个方向之间的取舍，公开发布以便任何人提出异议 —— ' +
      'C1 一侧目前尚无实测数据。',
    selfScoreTitle: '以下分数由团队自评，并非独立测量',
    selfScoreDesc:
      '“如何测量”一列说明每项标准的核查方式。任何没有标注日期测量的标准都属于架构判断，' +
      '而非数据。权重由您设定 —— 分数随之变化。',
    colNo: '#',
    colCriterion: '标准',
    colKind: '类型',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: '权重',
    kindArchitecture: '架构',
    kindLiveData: '实测数据',
    totalScore: '按您的权重计算的总分',
    tied: '持平',
    leads: '领先',
    liveDataTitle: '实时数据',
    a1Validators: 'A1 —— 已连接验证者',
    a1Chains: 'A1 —— 运行中的 L1',
    a1Blocks: 'A1 —— C 链区块',
    c1Unreachable: 'C1 —— 无法连接',
    c1UnreachableDesc:
      '需要 C1 的 Cosmos REST 地址（端口 1317）。本表仍可使用：A1 一侧是实时数据，' +
      'C1 一侧与其余标准一样属于架构判断。',
    measuring: '测量中…',
    cannotMeasure: '无法测量',
    critDecentralisation: '去中心化程度（验证者上限）',
    noteDecentralisation: '协议上限：Snowman 约数千个节点，CometBFT 约 150 个。A1 今天：9 个节点，一台机器，一家供应商',
    critFinality: '最终确定性',
    noteFinality: '约 1–2 秒 vs 约 5–6 秒',
    critEvmMaturity: 'EVM 成熟度',
    noteEvmMaturity: 'coreth 已用于生产环境 vs Cosmos EVM 尚未到 v1',
    critWalletCompat: '零售钱包 / DeFi 兼容性',
    noteWalletCompat: '完整支持 MetaMask/EVM',
    critLaunchUx: '发链体验',
    noteLaunchUx: '两者都有控制台；A1 实测每次约 170 秒',
    critInterop: '互操作广度',
    noteInterop: '生态内的 Warp/ICM（A1 已完成资产转移，M6.2）vs IBC 的覆盖面',
    critOpCost: '每条链的运维成本',
    noteOpCost: '节点 + 插件 vs K8s operator',
    critBootstrap: '启动网络效应',
    noteBootstrap: '自成孤岛 vs IBC 直接接入 Cosmos 经济体',
    critEconSecurity: '公开的经济安全性',
    noteEconSecurity: '开箱即有 PoS 代币担保',
    critSwitchCost: '团队的迁移成本',
    noteSwitchCost: 'A1 是新的，C1 已运行数月',
  },

  faucet: {
    title: '领取测试代币',
    desc: 'A1 测试网上的 LOVE9 没有实际价值 —— 它的存在是为了让您在测试时支付 gas。输入钱包地址，我们会立即发送。',
    addressLabel: '您的钱包地址',
    addressFromWallet: '已从你连接的钱包自动填入。如果代币要发到其他地址，请修改。',
    useWalletAddress: '使用我的钱包地址',
    addressPlaceholder: '0x…（40 个十六进制字符）',
    requestCta: '给我发送代币',
    sending: '发送中…',
    addressHelp: '粘贴应当接收代币的钱包地址。若尚未添加，请按上方的“添加网络到钱包”。',
    addNetwork: '添加网络到钱包',
    addNetworkDone: '已添加到钱包',
    addNetworkRejected: '您在钱包中按下了拒绝。如果想添加网络，请再按一次。',
    addNetworkError: '您的钱包无法添加该网络。请使用旁边的参数手动添加 —— 并把下面这行发给团队：',
    noWallet: '在此浏览器中未找到钱包。请安装 MetaMask 后重新加载页面。',
    quotaLabel: '剩余额度',
    quotaFormat: '每 {hours} 小时 {left}/{total} 次',
    quotaExhausted: '您已用完全部额度。请在 {minutes} 分钟后重试。',
    quotaUnreadable: '无法读取您的额度 —— 您仍然可以申请，只是不知道还剩几次。',
    sentOk: '已向 {address} 发送 {count} {symbol}',
    viewTransaction: '查看交易',
    settingsTitle: '网络参数',
    settingsRpc: 'RPC',
    settingsChainId: '链 ID',
    settingsSymbol: '符号',
    settingsDecimals: '小数位',
    settingsExplorer: '区块浏览器',
    decimalsHelp:
      '钱包显示 18 位小数，因为 C 链运行 EVM。在 P/X 链上，LOVE9 以 9 位小数计。' +
      '同一种币，两套刻度 —— 不是两种不同的代币。',
    genericError: '发送失败。{detail}',
  },

  langPicker: {
    label: '语言',
    machineBadge: '机器翻译',
    machineNote: '只有越南语版本经过人工审校。其余译文均由机器生成，可能有误 —— 英文版为准。',
    notAvailable: '尚未提供',
  },

  errors: {
    unreachable: '无法连接到网络',
    unreachableDesc: '网络可能繁忙，或者您的连接已中断。',
    empty: '这里还没有内容',
    addressEmpty: '{label} 不能为空',
    addressFormat: '{label} 必须是 0x 加 40 位十六进制字符',
    addressChecksum: '{label} 的 EIP-55 校验和不通过 —— 很可能有一个字符打错或粘贴时丢失',
    addressZero: '{label} 不能是零地址 —— 没有人持有它的私钥',
    timeout: '{seconds} 秒内没有响应',
    notJson: '返回的内容不是 JSON（HTTP {status}）—— 很可能请求被路由到了错误的地方',
    noWallet: '在这个浏览器中没有找到钱包。',
  },

  notFound: {
    code: '404',
    title: '此页面不存在',
    desc: '您打开的地址在 9Chain Testnet A1 上不存在。它可能已被重命名，或者 URL 在复制时丢失了几个字符。',
    topPagesTitle: '最常用的三个页面：',
    navLabel: '接下来去哪里',
    goHome: '返回首页',
    goFaucet: '领取测试代币',
    goLaunch: '启动您的链',
    lookingForTx: '在找某笔交易或某个地址？请检查哈希值后重试。',
  },
};

export default zh;
