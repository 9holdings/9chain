import type { Dict } from '../en';

/**
 * 한국어 — 기계 번역이며 사람이 검수하지 않았습니다.
 * 원본 언어는 영어(`../en.ts`)이며, 차이가 있으면 영어판이 기준입니다.
 *
 * 🔴 다음 세 곳은 완화하지 마십시오: `reGenesis.*`(네트워크가 삭제됨),
 * `deChain.soatMoTa`(되돌릴 수 없는 문), `chainCuaToi.thuHoiY*`(철회해도 이름은 돌아오지 않음).
 * 이들은 "영구적으로", "변경할 수 없음"이라고 말합니다. 되돌릴 수 있다고 오해해 자산을 잃는
 * 일을 막기 위해서입니다.
 */
export const ko: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: '9Chain의 공개 테스트넷 — Avalanche 엔진으로 구동되는 독립 네트워크',
    tagline: 'Avalanche 엔진 위의 독립 네트워크',
    walletRejected: '지갑에서 요청을 거부하셨습니다. 변경된 것은 없습니다.',
    noWalletMobile: '휴대폰 브라우저에는 지갑 확장 프로그램을 설치할 수 없습니다. 대신 이 페이지를 MetaMask 앱 안에서 여세요. 앱에 내장된 브라우저에 지갑이 있습니다.',
    openInMetaMask: 'MetaMask 앱에서 열기',
    loading: '불러오는 중…',
    retry: '다시 시도',
    copy: '복사',
    copied: '복사됨',
    close: '닫기',
    openMenu: '메뉴 열기',
    closeMenu: '메뉴 닫기',
    switchToDark: '다크 모드로 전환',
    switchToLight: '라이트 모드로 전환',
    skipToContent: '본문으로 건너뛰기',
    stepDone: ' — 완료',
    stepRunning: ' — 진행 중',
    stepFailed: ' — 실패',
    stepPending: ' — 대기',
  },

  presets: {
    standard: {
      name: '표준',
      desc: '일반적인 EVM 체인입니다. 소유자가 제네시스 토큰 전부와 수수료 변경 권한을 받습니다.',
    },
    'zero-fee': {
      name: '거의 0에 가까운 수수료',
      desc: 'baseFee = 1 wei로, 거래는 정확히 그 하한만 지불합니다(송금 한 번에 0.000000000000021 LOVE9). 게임, 실험, 내부 체인에 적합합니다. 대가: 스팸을 막는 장치가 거의 없습니다.',
    },
    'high-throughput': {
      name: '높은 처리량',
      desc: '블록당 거래 수가 5배(gasLimit 1,200만 대신 6,000만). 게임, 거래소, 소액 거래가 꾸준히 흐르는 모든 용도에 적합합니다. 대가: 블록이 무거워지고, 이 체인의 노드를 운영하는 사람은 더 강력한 장비가 필요합니다.',
    },
    mintable: {
      name: '발행 가능한 공급량',
      desc: '소유자는 프리컴파일 0x0200000000000000000000000000000000000001을 통해 언제든지 네이티브 토큰을 추가 발행할 수 있습니다. 공급량은 고정되어 있지 않습니다. 이 체인을 사용하는 모든 사람이 알아야 할 점입니다.',
    },
    'owner-deploy-only': {
      name: '소유자만 컨트랙트 배포 가능',
      desc: '다른 사람도 거래를 보내고 기존 컨트랙트를 사용할 수 있지만, 자신의 컨트랙트는 배포할 수 없습니다. 소유자는 프리컴파일 0x0200000000000000000000000000000000000000을 통해 누구에게나 그 권한을 부여할 수 있습니다.',
    },
    permissioned: {
      name: '허가형(승인된 발신자만)',
      desc: '목록에 있는 주소만 거래를 보낼 수 있습니다. 회사 내부 체인에 적합합니다. ⚠️ 가장 엄격한 프리셋입니다. 낯선 지갑은 여기서 아무것도 할 수 없습니다.',
    },
  },
  steps: {
    genesis: '제네시스 생성 중',
    subnet: 'P-Chain에 서브넷 + 블록체인 생성 중',
    rpc: 'L1 RPC 응답 대기 중',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',

    banner: 'A1은 {date}에 재구축되었습니다. 그 이전에 만들어진 모든 잔액과 체인은 더 이상 존재하지 않습니다.',
    bannerLink: '무슨 뜻인가요',
    badge: '재구축됨',

    title: 'A1은 {date}에 재구축되었습니다',
    desc:
      'A1 테스트 네트워크는 블록 0부터 다시 구축되었습니다. 그 날짜 이전에 만들어진 체인, 잔액, ' +
      '거래 내역은 더 이상 존재하지 않습니다 — 숨겨진 것이 아니라 사라졌습니다. ' +
      '이 페이지는 지금 보고 계신 것과 무엇을 해야 하는지 설명합니다.',

    willSeeTitle: '무엇이 보일까요',
    willSee1:
      '지갑은 여전히 연결되고, 올바른 네트워크 이름과 동일한 Chain ID {chainId}를 그대로 표시합니다 — ' +
      '의도된 것입니다. 다만 잔액은 0이 됩니다.',
    willSee2:
      '실행하셨던 모든 L1이 목록에서 사라졌습니다. 그 이름과 Chain ID는 다시 비었고, ' +
      '누구든 가져갈 수 있습니다.',
    willSee3:
      '서명만 하고 한 번도 전송하지 않은 거래가 있다면 지금 전송하지 마십시오 — ' +
      '더 이상 존재하지 않는 네트워크의 거래입니다.',

    toDoTitle: '무엇을 해야 하나요',
    toDo1: '포시트에서 테스트 토큰을 다시 요청하십시오. 모든 사용자의 한도가 초기화되었습니다.',
    toDo2:
      '각각의 L1을 지갑에서 제거하십시오 — 저마다 Chain ID를 갖고 있으며 이제 아무 곳도 가리키지 ' +
      '않습니다. 기본 A1 네트워크는 제거할 필요가 없습니다. 설정이 그대로이기 때문입니다.',
    toDo3: '필요하다면 체인을 다시 실행하십시오. 예전 이름은 다른 사람이 가져갔을 수 있습니다.',

    archiveTitle: '이전 네트워크 보관본',
    archiveDesc:
      '재구축 전 네트워크의 최종 상태를 내보내고 해시를 공개했습니다. ' +
      '확인하고자 하는 누구든 검증할 수 있습니다.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1은 {date}에 재구축됩니다 — 그 전에 만들어진 모든 체인, 잔액, 거래가 삭제됩니다.',
    bannerLink: '자세히',
    badge: '재구축 예정',

    title: 'A1은 {date}에 재구축됩니다',
    desc:
      'A1 테스트 네트워크 전체가 블록 0부터 다시 구축됩니다. 그 날짜 이전에 만들어진 모든 것이 ' +
      '사라집니다 — 숨겨지는 것이 아니라 더 이상 존재하지 않게 됩니다. 이 페이지는 무엇이 사라지고 ' +
      '무엇을 해야 하는지 정확히 알려 드립니다.',

    whyTitle: '왜 재구축이 필요한가',
    why1:
      '네트워크의 genesis는 변경할 수 없습니다. 바로 그 점이 신뢰를 만듭니다 — 만든 사람을 포함해 ' +
      '누구도 블록 0에 기록된 숫자를 나중에 바꿀 수 없습니다.',
    why2:
      '그 대가는 이렇습니다. genesis 안의 숫자를 바꾸려면 네트워크를 처음부터 다시 만드는 것 외에 ' +
      '방법이 없습니다. A1은 총공급량을 9,000,000,000 LOVE9로 올렸고, 여기에 맞추기 위해 스테이킹 ' +
      '매개변수 전 범위를 다시 계산해야 했습니다.',
    why3:
      '이곳은 테스트넷이며, 재구축은 테스트넷에 허용된 일입니다. 사실 테스트넷이 존재하는 이유가 ' +
      '그것입니다. 이런 변경이 메인넷이 아니라 여기서 일어나도록 하는 것입니다.',

    lostTitle: '무엇이 사라지나',
    lostDesc: '예외 없이 전부:',
    lost1: '사용자가 실행한 모든 L1. 아무 문제 없이 잘 돌아가는 체인도 포함됩니다.',
    lost2: '모든 LOVE9 잔액. 포시트에서 받은 토큰도 포함됩니다.',
    lost3: '모든 거래, 모든 블록, C-Chain·P-Chain·X-Chain의 전체 기록.',
    lost4: '모든 검증자와 모든 위임.',

    keptTitle: '무엇이 남나',
    keptDesc:
      '삭제 전에 사라질 네트워크 전체를 내보내고 해시를 공개합니다. 그래야 기록이 검증 가능한 상태로 ' +
      '남습니다. 그것을 구동하던 네트워크가 사라진 뒤에도 무슨 일이 있었는지 확인할 수 있습니다. ' +
      '보관본 링크는 재구축 당일 이곳에 게시됩니다.',

    toDoTitle: '무엇을 해야 하나요',
    toDoBefore: '재구축 전:',
    toDo1:
      '데이터가 남아 있어야 하는 것을 지금 A1 위에 만들지 마십시오. 아이디어를 시험해 보는 것이라면 ' +
      '얼마든지 좋습니다 — 다만 지금의 체인을 저장소로 여기지는 마십시오.',
    toDoAfter: '재구축 후:',
    toDo2:
      '추가하셨던 각각의 L1을 지갑에서 제거하십시오 — 그 체인들은 더 이상 존재하지 않으며, 그쪽을 ' +
      '가리키는 지갑은 그저 멈춰 있게 됩니다. 기본 A1 네트워크는 제거할 필요가 없습니다. 설정이 ' +
      '그대로이기 때문입니다.',
    toDo3:
      '지갑에 아직 A1 네트워크가 없다면 설정을 직접 입력하지 말고 포시트 페이지의 버튼으로 추가하십시오.',
    toDo4: '포시트에서 토큰을 다시 요청하고, 원하시면 체인을 다시 실행하십시오.',

    silentTitle: '지갑은 경고해 주지 않습니다',
    silentDesc:
      '새 네트워크는 이전과 동일한 Chain ID {chainId}, 동일한 RPC 주소, 동일한 이름을 유지합니다. ' +
      '의도된 것입니다 — 이미 공개된 모든 문서와 안내가 그대로 맞도록 하기 위해서입니다. 그 대가로 ' +
      '지갑에는 방금 다른 네트워크에 연결되었다는 어떤 신호도 없습니다. 그래서 아래 두 가지가 ' +
      '조용히 일어납니다.',
    silent1:
      '예전 설정의 지갑도 여전히 연결되고, 올바른 네트워크 이름을 보여 주며, 잔액을 0으로 표시합니다. ' +
      '그 숫자는 정확합니다. 예전 토큰은 더 이상 존재하지 않으며 숨겨진 것이 아닙니다. 네트워크를 다시 ' +
      '추가할 필요는 없습니다 — 포시트에서 새 토큰만 요청하십시오. 지갑이 멈춘 거래나 잘못된 순번을 ' +
      '알린다면 지갑에서 해당 네트워크의 활동 데이터를 지우십시오. 지갑은 이미 죽은 체인의 거래 수를 ' +
      '기억하고 있는데, 새 체인은 0부터 세기 때문입니다.',
    silent2:
      '전송하지 않은 서명된 거래가 아직 있다면 폐기하십시오. Chain ID가 바뀌지 않았으므로 서명은 새 ' +
      '네트워크에서도 유효합니다. 지갑이 비어 있는 동안에는 실패하지만, 포시트에서 토큰을 받는 순간 ' +
      '사용 가능해지며 예상하지 못한 시점에 통과될 수 있습니다.',

    repeatTitle: '또 일어날까요',
    repeatDesc:
      '가능합니다. A1은 여전히 테스트넷이며, 커뮤니티가 A1과 C1 사이에서 메인넷 방향을 정할 때까지는 ' +
      'genesis 안의 무언가를 바꿔야 할 때 네트워크를 재구축할 권리를 유지합니다. 저희가 약속하는 것은 ' +
      '미리 알려 드리는 것, 그리고 무엇이 사라지는지 분명히 말씀드리는 것입니다.',

    alreadyTitle: '2026-08-27에 이미 한 번 재구축되었습니다',
    alreadyDesc:
      'A1은 아래 날짜 이전인 2026-08-27에 이미 한 번 재구축되었습니다. 그 전에 테스트 토큰을 보유하고 계셨다면 잔액은 지금 0입니다 — 이는 정상이며 지갑의 오류가 아닙니다. 사용자 체인은 하나도 사라지지 않았습니다. 목록에는 자동 테스트 체인만 있었습니다. 포시트에서 토큰을 다시 요청하십시오.',
    dateNote: '날짜는 미뤄질 수 있습니다',
    dateNoteDesc:
      '{date}이라는 날짜는 그 전에 이루어지는 go/no-go 점검에 달려 있습니다. 미뤄질 경우 침묵하지 않고 ' +
      '이 페이지의 날짜를 바꾸겠습니다.',
  },

  footer: {
    tryIt: '사용해 보기',
    explore: '둘러보기',
    about: '소개',
    explorer: '9Scan-A1 익스플로러',
    mainSite: '9Chain 메인 사이트',
    opensNewTab: '(새 탭에서 열림)',
    navLabel: '푸터 링크',
    rebuildPlan: '네트워크 재구축 계획',
  },

  nav: {
    home: '홈',
    faucet: '테스트 토큰 받기',
    launch: '체인 실행',
    myChains: '내 체인',
    compare: 'A1 ↔ C1',
    directory: 'L1 목록',
    explorer: '익스플로러',
    explorerAria: '9Scan-A1을 새 탭에서 열기',
    ceremony: "의식",
  },

  home: {
    testnetBadge: '테스트넷 — 토큰에 실제 가치는 없습니다',
    primaryCta: '내 체인 실행하기',
    secondaryCta: '먼저 테스트 토큰 받기',

    title: 'A1에서 나만의 체인을 실행하세요',
    subtitle: '서명에 사용하는 지갑이 소유하는 나만의 L1이 테스트 네트워크에서 실제로 돌아갑니다. 약 5분 걸립니다.',
    tableCaption: '각 행은 A1에서 실제로 돌아가는 체인이며, 저마다 소유자가 있습니다.',
    colChain: '체인',
    colType: '유형',
    colOwner: '소유자',
    systemDefault: '시스템 기본값',
    emptyTitle: '아직 실행 중인 L1이 없습니다',
    emptyDesc: '첫 번째가 되실 수 있습니다. 체인이 올라오는 즉시 목록이 갱신됩니다.',
    moreChains: '디렉터리에서 {count}개 체인 모두 보기',

    disclosure: '11개의 검증자 가운데 9개는 같은 서버, 같은 공급자에서 돌아갑니다. 나머지 둘은 다른 곳에서 합류했으며 그중 하나만 온라인입니다 — 프로토콜 층위에서는 탈중앙화되어 있으나, 인프라 층위에서는 아직 아닙니다.',
    idleBlocksNote: 'Avalanche는 빈 블록을 만들지 않으므로, 아무도 거래하지 않을 때 블록 높이가 멈춰 있는 것은 정상입니다. 살아 있는지 판단하는 척도는 옆의 검증자 수입니다.',
  },

  stats: {
    title: '네트워크 가동 중',
    validators: '연결된 검증자',
    l1Count: '실행 중인 L1',
    blockHeight: 'C-Chain 블록',
    measuring: '네트워크 측정 중…',
    cannotMeasure: '네트워크 통계를 읽지 못했습니다',
    cannotMeasureDesc: '페이지는 정상 작동합니다 — 이것은 상태 표시일 뿐입니다.',
  },
  directory: {
    lede: 'A1 테스트넷의 모든 체인과 각 체인의 실제 상태.',
    howToTitle: '이 표를 읽는 방법.',
    howToBody: 'Avalanche는 빈 블록을 만들지 않습니다. 트랜잭션이 있을 때만 체인이 블록을 만들기 때문에, 블록 수가 멈춰 있는 것은 정상이며 체인이 죽었다는 뜻이 아닙니다. 위험한 쪽은 그 반대입니다. 검증자가 없는 체인도 RPC에 응답하고 잔액도 읽히며 지갑도 연결됩니다. 하지만 모든 트랜잭션이 영원히 매달려 있게 됩니다. 그래서 여기서 진짜 생존 신호는 P-Chain에서 직접 읽은 서브넷 검증자 수이며, 블록 높이가 아닙니다.',
    ownerTitle: '소유자(admin)',
    ownerBody: '는 체인을 시작할 때 지정한 주소입니다. 제네시스 발행량 전부와 해당 체인의 수수료를 변경할 권리를 가집니다. 체인은 재단이 아니라 그 사람의 것입니다. 콘솔에 이 항목이 생기기 전에 시작된 체인은 시스템 기본값을 표시합니다.',
    mainNetwork: '메인 네트워크',
    mainNetworkDesc: 'A1 테스트넷의 C-Chain — 포셋과 탐색기가 동작하는 곳입니다.',
    running: '실행 중',
    notAnswering: '응답 없음',
    notAnsweringDesc: 'RPC가 응답하지 않습니다. 아직 이 서브넷을 추적하는 노드가 없을 수 있습니다.',
    unclear: '불확실',
    unclearDesc: 'P-Chain에서 검증자 집합을 읽을 수 없었습니다.',
    ownerAdmin: '소유자(admin)',
    blocks: '블록 수',
    subnetValidators: '서브넷 검증자',
    created: '생성',
    revokedAt: '철회 시각',
    copyOwner: '소유자 주소 복사',
    revoked: '철회됨',
    revokedDesc: '이 체인은 더 이상 서비스하지 않습니다. 이제 어떤 노드도 실행하지 않고 RPC도 응답하지 않습니다. 이 네트워크를 지갑에 추가했다면 삭제하세요. 남겨 두면 연결 오류만 발생합니다.',
    neverReissued: '다른 체인에 다시 발급되지 않습니다',
    revokedGroup: '철회됨 ({count})',
    listError: '체인 목록을 읽을 수 없었습니다 ({error}). 메인 네트워크는 아래에 계속 표시됩니다.',
    footSummary: 'L1 {count}개 실행 중 + 메인 네트워크',
    footRevoked: '{count}개 철회됨',
    footUpdated: '{time} 업데이트',
    tileTotal: '디렉터리의 L1',
    tileRunning: '측정됨 · 실행 중',
    tileAttention: '주의 필요',
    tileRevoked: '취소됨',
    sweepProgress: '{total}개 중 {done}개 측정',
    measuringDesc: '측정 대기 중입니다.',
    howToToggle: '이 목록 읽는 법',
    searchLabel: '검색',
    searchPlaceholder: '이름, Chain ID, 소유자 또는 blockchain ID',
    filterStatus: '상태',
    filterAll: '전체',
    filterRunning: '실행 중',
    filterAttention: '주의 필요',
    filterRevoked: '취소됨',
    filterType: '유형',
    filterTypeAll: '모든 유형',
    groupBy: '그룹 기준',
    groupNone: '그룹 없음',
    groupOwner: '소유자',
    groupType: '유형',
    groupStatus: '상태',
    groupNoType: '유형 기록 없음',
    groupCount: '{total}개 중 {shown}개',
    sortBy: '정렬',
    sortNewest: '최신순',
    sortOldest: '오래된 순',
    sortName: '이름',
    sortChainId: 'Chain ID',
    sortBlocks: '블록 많은 순',
    refresh: '다시 측정',
    listCaption: 'A1의 체인과 각 체인의 측정된 상태',
    showing: '{total}개 중 {shown}개 표시',
    showMore: '{count}개 더 보기',
    noMatchTitle: '일치하는 체인이 없습니다',
    noMatchDesc: '다른 검색어를 쓰거나 필터를 지우세요.',
    clearFilters: '필터 지우기',
    showDetails: '상세',
    hideDetails: '접기',
    detailsOf: '{name} 상세',
    nativeToken: '네이티브 토큰',
    mismatch: '잘못된 체인',
    mismatchDesc: 'RPC가 {expected} 대신 Chain ID {got}으로 응답했습니다. 이 체인이 아니라 라우팅 오류일 가능성이 큽니다.',
  },
  ceremony: {
    badge: "의식",
    title: "9S Union 의식",
    desc: "정확히 어느 한 초에 네트워크가 이름을 가진 블록 세 개를 씁니다. 이 페이지는 무슨 일이 일어날지, 그 블록들이 무엇을 담는지, 그리고 나중에 우리에게 묻지 않고 직접 확인하는 방법을 알려 줍니다.",
    momentLabel: "그 순간",
    countdownLabel: "남은 시간",
    days: "일",
    hours: "시간",
    minutes: "분",
    seconds: "초",
    yourZone: "당신의 시간대",
    blocksTitle: "세 개의 블록",
    adamDesc: "타임스탬프가 그 순간에 도달한 첫 블록 — 높이가 아니라 시간으로 정의됩니다. 누가 그 블록을 만들든, 만든 사람이 만든 것입니다.",
    evaDesc: "높이 기준으로 Adam 바로 다음 블록.",
    unionDesc: "Adam 이후 열 번째 블록. 9S Union 메시지가 여기에 고정됩니다.",
    messagesTitle: "블록이 담는 것",
    messagesDesc: "Adam과 Eva는 네트워크가 만들어질 때 블록 0에 이미 새겨진 두 문장을 그대로 담습니다. 의식은 바로 그 파일들을 가리키므로 둘은 서로 어긋날 수 없습니다. 아래 각 다이제스트는 의식 전인 2026-09-03에 동결되었고, 원본 바이트에 대한 sha256으로 재현할 수 있습니다.",
    quietTitle: "조용한 1분",
    quietDesc: "C-Chain은 빈 블록을 만들지 않기 때문에, 라이브 페이지에서 공개하고 있는 합성 트래픽을 그 순간 직전에 멈춥니다. 그러지 않으면 의식은 2초짜리 창을 두고 자동 송신기와 경쟁해야 합니다. 대가는 1분의 정적이고, 그것으로 얻는 것은 이 블록들이 봇이 아니라 의식의 것이라는 사실입니다.",
    strangerTitle: "낯선 사람이 그 블록을 가져가도 기록은 그대로 유효합니다",
    strangerDesc: "A1은 공개 테스트 네트워크이고 그 초에 누구나 트랜잭션을 보낼 수 있습니다. 기록은 블록 높이가 아니라 의식의 트랜잭션 해시에 고정되어 있습니다. 다른 사람의 블록이 그 순간에 먼저 도달해도 기록된 내용은 참으로 남습니다. 단지 그 블록을 의식이 만들지 않았을 뿐입니다.",
    checkTitle: "직접 확인하기",
    checkDesc: "아무 A1 노드에나 그 순간의 블록을 요청해 타임스탬프를 읽어 보세요. 이 페이지에는 믿고 받아들여야 할 내용이 없습니다.",
    resultTitle: "무엇이 기록되었는가",
    resultPending: "아직 공개되지 않았습니다. 증거 묶음 — 그 순간, 사용한 오프셋, 배경 트래픽, 세 개의 트랜잭션 해시, 블록 번호, 체인에서 바이트를 되읽은 결과 — 는 의식 후 여기에 공개됩니다.",
    resultBlock: "Block Adam",
    resultTimestamp: "그 타임스탬프",
    resultBundle: "증거 묶음",
    reachedNote: "그 순간은 지났습니다. 기록은 아직 여기에 공개되지 않았습니다 — 체인에서 바이트를 되읽어 동결된 다이제스트와 대조한 뒤에 공개됩니다.",
  },



  loadTest: {
    badge: '부하 테스트',
    banner: '공개 부하 테스트를 진행 중입니다 — 초당 {tps}건의 거래로, 실제 사용자가 아니라 저희가 생성한 것입니다.',
    bannerLink: '실시간 수치 보기',
    title: '공개 부하 테스트',
    intro: 'A1은 실제 사용자가 매우 적은 신생 테스트 네트워크여서, 그대로 두면 블록이 거의 생성되지 않습니다. 네트워크가 끊임없이 작동하고 그 모습을 보실 수 있도록 저희가 일정한 거래 흐름을 만들고 있습니다. 이 트래픽은 저희 것입니다. 이는 사용량이 아니며 저희도 사용량으로 집계하지 않습니다 — 이를 보내는 모든 주소를 아래에 공개하니 빼고 보실 수 있습니다.',
    running: '실행 중',
    stopped: '현재 실행 중이 아님',
    stoppedWhy: '기록된 사유: {reason}',
    labelTps: '초당 거래 수',
    labelBlockHeight: 'C-Chain 블록',
    labelSecondsPerBlock: '블록당 초',
    labelTotal: '시작 이후 확정된 거래',
    labelUptime: '실행 시간',
    committedNote: '이 수치는 저희가 보내려 한 건수가 아니라 블록 자체에서 집계한 것입니다. 네트워크가 받아들였지만 블록에 포함되지 않은 거래는 여기에 집계되지 않습니다.',
    addressesTitle: '아홉 개의 발신 주소',
    addressesNote: '이 주소들에서 나온 모든 거래는 저희가 기계로 생성한 것입니다. 걸러내면 실제 활동을 확인할 수 있습니다.',
    measuring: '부하 테스트 상태를 읽는 중…',
    notMeasured: '부하 테스트 상태를 읽을 수 없습니다',
    notMeasuredMore: '페이지는 정상 작동합니다 — 이것은 상태 표시일 뿐입니다.',
  },

  launch: {
    title: '내 체인 실행하기',
    desc:
      '지갑이 소유하는 전용 L1입니다. 본인임을 증명하기 위해 한 번 서명하고, 내용을 확인하면 ' +
      '네트워크가 약 5분 만에 체인을 만들어 줍니다.',

    connectWallet: '지갑 연결',
    connecting: '연결 중…',
    signIn: '로그인',
    signing: '서명 대기 중…',
    yourWallet: '내 지갑',
    youWillOwn: '체인은 이 지갑의 소유가 됩니다. 주소는 서명에서 나옵니다 — 아무도 입력하지 않습니다.',
    noWallet: '이 브라우저에서 지갑을 찾을 수 없습니다. MetaMask를 설치하고 페이지를 새로고침하십시오.',
    signRejected: '서명을 거부하셨습니다. 아무것도 생성되지 않았습니다.',
    switchWallet: '다른 지갑 사용',

    nameLabel: '체인 이름',
    namePlaceholder: '예: MyChain',
    nameHelp:
      '문자, 숫자, 공백. 2–32자. 이 네트워크에서 한 번 사용된 이름은 다시 발급되지 않습니다 — ' +
      '철회된 체인의 이름이라도 마찬가지입니다.',
    nameInvalid: '이름에는 문자, 숫자, 공백만 사용할 수 있으며 길이는 2–32자여야 합니다.',
    typeLabel: '체인 유형',
    typeHelp: '한 번 선택하면 고정됩니다 — 체인의 genesis는 수정할 수 없습니다.',
    slotsLeft: '{left}/{total}개 자리 남음',
    slotsFull: '남은 자리가 없습니다',
    slotsFullDesc:
      '현재 방식에서는 모든 검증자가 모든 L1을 추적하며, 16개를 넘는 서브넷을 선언한 노드는 프로토콜이 ' +
      '제외합니다. 이는 고정된 상한이며 올릴 수 없습니다. 체인을 철회하면 자리 하나가 반환됩니다.',
    reviewCta: '제출 전 확인',

    reviewTitle: '확인 — 이것은 되돌릴 수 없는 문입니다',
    reviewDesc:
      '실행된 L1의 genesis는 변경할 수 없습니다. 이 단계 이후에는 이름, 체인 유형, 소유자를 바꿀 수 ' +
      '없으며 — 철회하더라도 이름과 chain ID는 돌려받지 못합니다.',
    reviewRebuild:
      '누르기 전에 한 가지 더 알아 두십시오. A1은 {date}에 네트워크 전체를 재구축합니다. 오늘 실행하는 ' +
      '체인은 이전 네트워크와 함께 삭제됩니다 — 숨겨지는 것이 아니라 사라집니다.',
    reviewName: '체인 이름',
    reviewType: '체인 유형',
    reviewOwner: '소유자',
    reviewBack: '돌아가서 수정',
    reviewConfirm: '확인했습니다 — 체인 실행',

    launching: '“{name}” 체인을 실행하는 중',
    launchingDesc:
      '네트워크가 정족수를 잃지 않도록 노드를 하나씩 순서대로 재시작합니다 — 그래서 느리며, 이는 ' +
      '의도된 것입니다. 탭을 닫지 마십시오. 닫더라도 체인은 계속 만들어집니다.',
    etaRemaining: '약 {minutes}분 남음',
    preparing: '준비 중…',

    doneTitle: '완료 — “{name}” 체인이 실행 중입니다',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: '지갑에 체인 추가',
    doneAdded: '지갑에 추가됨',
    doneActivate: '체인 활성화(블록 1 열기)',
    doneActivated: '활성화됨',
    doneActivating: '지갑 대기 중…',
    doneAddWalletError: '체인을 지갑에 추가하지 못했습니다. {detail}',
    doneActivateError: '체인을 활성화하지 못했습니다. {detail}',

    launchAnother: '체인 하나 더 실행',
    launchError: '체인을 실행하지 못했습니다. {detail}',
    unknownError: '작업이 끝난 뒤에도 체인이 목록에 나타나지 않았습니다.',
    noteTitle: '새 체인에서의 첫 거래',
    noteHow:
      '첫 거래의 가스 추정치를 믿지 마십시오. 블록 1을 여는 가장 저렴한 방법은 평범한 전송입니다 — ' +
      '아래 “체인 활성화”를 누르십시오.',
  },

  myChains: {
    title: '내 체인',
    desc: '로그인에 사용한 지갑이 소유한 L1 목록입니다. 철회할 수 있지만 먼저 경고를 읽어 주십시오.',
    connectWallet: '체인을 보려면 지갑을 연결하십시오',
    emptyTitle: '이 지갑은 아직 체인을 갖고 있지 않습니다',
    emptyDesc: '하나 실행한 뒤 돌아오십시오 — 곧바로 여기에 표시됩니다.',
    emptyCta: '내 체인 실행하기',

    colChain: '체인',
    colType: '유형',
    colStatus: '상태',
    colActions: '',

    validatorCount: '검증자 {count}개',
    measuring: '측정 중',
    cannotMeasure: '측정하지 못함',
    statusHelp: '블록 높이가 아니라 서브넷의 검증자 수로 측정합니다.',
    noValidators: '검증자 0개',
    noValidatorsDesc:
      '이 체인은 어떤 거래도 확정할 수 없습니다. 서브넷에 검증자가 없기 때문입니다. 그래도 RPC 호출에는 ' +
      '응답하고 지갑도 연결되므로, 겉으로 드러나는 다른 신호가 없습니다.',

    walletSettings: '지갑 설정',
    addToWallet: '지갑에 추가',
    addedToWallet: '추가됨',
    addWalletError: '지갑에 추가하지 못했습니다. {detail}',

    revoke: '철회',
    revokeTitle: '“{name}”을(를) 철회할까요?',
    revokeWarn1: '체인은 즉시 RPC 제공을 중단하고 공개 목록에서 사라집니다.',
    revokeWarn2:
      '철회해도 P-Chain의 서브넷은 삭제되지 않습니다 — 그곳에 만들어진 것은 이 네트워크가 도는 동안 ' +
      '제거할 수 없습니다. 또한 이미 이 체인을 추가한 사람들의 지갑에서 네트워크를 지워 주지도 않습니다.',
    revokeWarn3:
      '이름과 Chain ID는 예약된 채로 남으며 이 네트워크에서 누구에게도 다시 발급되지 않습니다. Chain ID를 ' +
      '다시 발급하면 예전 사용자의 지갑이 조용히 다른 사람의 체인을 가리키게 되기 때문입니다.',
    revokeWarn4: '그 대신 15개 자리 중 하나가 반환됩니다.',
    revokeTypeLabel: '확인하려면 체인 이름을 정확히 입력하십시오',
    revokeNameMismatch: '체인 이름과 일치하지 않습니다.',
    revokeConfirm: '영구히 철회',
    revokeCancel: '취소',
    revoking: '“{name}” 철회 중 — 약 5분',
    revokeDone: '“{name}”을(를) 철회했습니다. {left}/{total}개 자리 남음.',
    revokeError: '철회하지 못했습니다. {detail}',
    revokeUnknown: '작업이 끝난 뒤에도 체인이 목록에 남아 있습니다.',

    revokedBadge: '철회됨',
    revokedDesc: '이름과 Chain ID는 이 네트워크에서 예약된 채로 남습니다.',
  },

  compare: {
    title: 'A1 ↔ C1 — 비교',
    desc:
      '9Chain은 같은 제품의 테스트넷 두 개를 나란히 운영하며, 차이는 엔진입니다. A1은 Avalanche 엔진, ' +
      'C1은 Cosmos 엔진입니다. 이 표는 두 방향 사이의 절충을 기록하며, 누구든 반박할 수 있도록 ' +
      '공개했습니다 — C1 쪽은 아직 실측값이 없습니다.',

    selfScoreTitle: '아래 점수는 팀이 자체 평가한 것이며 독립적으로 측정된 것이 아닙니다',
    selfScoreDesc:
      '"측정 방법" 열은 각 기준을 어떻게 확인했는지 알려 줍니다. 날짜가 적힌 측정이 없는 기준은 데이터가 ' +
      '아니라 설계적 판단입니다. 가중치는 직접 정하십시오 — 점수는 그에 따릅니다.',

    colNo: '#',
    colCriterion: '기준',
    colKind: '유형',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: '가중치',
    kindArchitecture: '설계',
    kindLiveData: '실시간 데이터',

    totalScore: '입력하신 가중치 기준 총점',
    tied: '동점',
    leads: '우세',

    liveDataTitle: '실시간 데이터',
    a1Validators: 'A1 — 연결된 검증자',
    a1Chains: 'A1 — 실행 중인 L1',
    a1Blocks: 'A1 — C-Chain 블록',
    c1Unreachable: 'C1 — 접속 불가',
    c1UnreachableDesc:
      'C1의 Cosmos REST URL(포트 1317)이 필요합니다. 표는 그대로 작동합니다. A1 쪽은 실시간 데이터이고, ' +
      'C1 쪽은 나머지 기준과 마찬가지로 설계적 판단입니다.',
    measuring: '측정 중…',
    cannotMeasure: '측정하지 못함',
    critDecentralisation: '탈중앙화 (검증자 상한)',
    noteDecentralisation: '프로토콜 상한: Snowman은 수천 노드, CometBFT는 약 150. A1의 오늘: 9노드, 한 대, 한 공급자',
    critFinality: '완결성',
    noteFinality: '약 1–2초 대 약 5–6초',
    critEvmMaturity: 'EVM 성숙도',
    noteEvmMaturity: 'coreth는 운영 중, Cosmos EVM은 v1 이전',
    critWalletCompat: '일반 지갑 / DeFi 호환성',
    noteWalletCompat: 'MetaMask/EVM 완전 지원',
    critLaunchUx: '체인 생성 경험',
    noteLaunchUx: '둘 다 콘솔이 있음. A1은 한 번에 약 170초로 실측',
    critInterop: '상호운용의 폭',
    noteInterop: '생태계 안의 Warp/ICM(A1은 자산 이동을 마침, M6.2) 대 IBC의 도달 범위',
    critOpCost: '체인당 운영 비용',
    noteOpCost: '노드 + 플러그인 대 K8s 오퍼레이터',
    critBootstrap: '네트워크 효과의 시작',
    noteBootstrap: '자체 섬 대 Cosmos 경제에 연결된 IBC',
    critEconSecurity: '공개된 경제적 보안',
    noteEconSecurity: '처음부터 PoS 토큰으로 담보',
    critSwitchCost: '팀의 전환 비용',
    noteSwitchCost: 'A1은 새것, C1은 수개월째 가동 중',
  },

  faucet: {
    title: '테스트 토큰 받기',
    desc:
      'A1 테스트넷의 LOVE9에는 실제 가치가 없습니다 — 시험하는 동안 가스를 낼 수 있도록 존재합니다. ' +
      '지갑 주소를 입력하시면 바로 보내 드립니다.',
    addressLabel: '내 지갑 주소',
    addressFromWallet: '연결한 지갑에서 자동으로 입력했습니다. 다른 주소로 받으려면 수정하세요.',
    useWalletAddress: '내 지갑 주소 사용',
    addressPlaceholder: '0x… (16진수 40자)',
    requestCta: '토큰 보내 주세요',
    sending: '보내는 중…',
    addressHelp: '토큰을 받을 지갑 주소를 붙여 넣으십시오. 아직 하지 않으셨다면 위의 “지갑에 네트워크 추가”를 누르십시오.',
    addNetwork: '지갑에 네트워크 추가',
    addNetworkDone: '지갑에 추가됨',
    addNetworkRejected: '지갑에서 거부를 누르셨습니다. 네트워크를 추가하시려면 다시 누르십시오.',
    addNetworkError: '지갑이 네트워크를 추가하지 못했습니다. 옆의 설정으로 직접 추가하시고 — 아래 줄을 팀에 보내 주십시오:',
    noWallet: '이 브라우저에서 지갑을 찾을 수 없습니다. MetaMask를 설치하고 페이지를 새로고침하십시오.',
    quotaLabel: '남은 할당량',
    quotaFormat: '{hours}시간당 {left}/{total}회 요청',
    quotaExhausted: '할당량을 모두 사용하셨습니다. {minutes}분 뒤에 다시 시도하십시오.',
    quotaUnreadable: '할당량을 읽지 못했습니다 — 요청은 여전히 가능하지만 몇 번 남았는지는 알 수 없습니다.',
    sentOk: '{address}(으)로 {count} {symbol}를 보냈습니다',
    viewTransaction: '거래 보기',
    settingsTitle: '네트워크 설정',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: '기호',
    settingsDecimals: '소수 자릿수',
    settingsExplorer: '익스플로러',
    decimalsHelp:
      'C-Chain이 EVM을 구동하기 때문에 지갑은 소수점 18자리를 표시합니다. P/X-Chain에서 LOVE9는 소수점 ' +
      '9자리로 셉니다. 하나의 코인, 두 개의 척도 — 서로 다른 두 토큰이 아닙니다.',
    genericError: '보내지 못했습니다. {detail}',
  },

  langPicker: {
    label: '언어',
    machineBadge: '기계',
    machineNote: '베트남어판만 사람이 검수했습니다. 나머지 번역은 기계가 만든 것이라 틀릴 수 있습니다 — 영어판이 기준입니다.',
    notAvailable: '아직 없음',
  },

  errors: {
    unreachable: '네트워크에 연결하지 못했습니다',
    unreachableDesc: '네트워크가 혼잡하거나 연결이 끊겼을 수 있습니다.',
    empty: '여기에는 아직 아무것도 없습니다',
    addressEmpty: '{label}은(는) 비워 둘 수 없습니다',
    addressFormat: '{label}은(는) 0x 뒤에 16진수 40자여야 합니다',
    addressChecksum: '{label}의 EIP-55 체크섬이 맞지 않습니다. 한 글자를 잘못 입력했거나 붙여넣을 때 빠졌을 가능성이 큽니다',
    addressZero: '{label}에 영 주소는 쓸 수 없습니다. 그 키는 아무도 갖고 있지 않습니다',
    timeout: '{seconds}초가 지나도 응답이 없습니다',
    notJson: '응답이 JSON이 아니었습니다(HTTP {status}). 요청이 잘못된 곳으로 전달되었을 가능성이 큽니다',
    noWallet: '이 브라우저에서 지갑을 찾을 수 없습니다.',
  },

  notFound: {
    code: '404',
    title: '이 페이지는 존재하지 않습니다',
    desc:
      '열어 보신 주소는 9Chain Testnet A1에 존재하지 않습니다. ' +
      '이름이 바뀌었거나, 복사하는 과정에서 URL의 일부 문자가 빠졌을 수 있습니다.',
    topPagesTitle: '가장 많이 쓰이는 세 페이지:',
    navLabel: '다음에 갈 곳',
    goHome: '홈으로 돌아가기',
    goFaucet: '테스트 토큰 받기',
    goLaunch: '내 체인 실행하기',
    lookingForTx: '거래나 주소를 찾고 계신가요? 해시를 확인하고 다시 시도하십시오.',
  },
};

export default ko;
