import type { Dict } from '../en';

/**
 * 日本語 — 機械翻訳、人による確認は行われていません。
 * 原文は英語（`../en.ts`）です。食い違う場合は英語版が正となります。
 *
 * 🔴 次の三か所は表現を弱めないでください：`reGenesis.*`（ネットワークが消去される）、
 * `deChain.soatMoTa`（片道の操作）、`chainCuaToi.thuHoiY*`（取り消しても名前は戻らない）。
 * 「恒久的」「変更できない」と書いているのは、やり直せると誤解して資産を失う人を
 * 出さないためです。
 */
export const ja: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: '9Chain の公開テストネット — Avalanche エンジンで動く独立したネットワーク',
    tagline: 'Avalanche エンジンで動く独立したネットワーク',
    walletRejected: 'ウォレットでリクエストを拒否しました。何も変わっていません。',
    loading: '読み込み中…',
    retry: '再試行',
    copy: 'コピー',
    copied: 'コピーしました',
    close: '閉じる',
    openMenu: 'メニューを開く',
    closeMenu: 'メニューを閉じる',
    switchToDark: 'ダークモードに切り替え',
    switchToLight: 'ライトモードに切り替え',
    skipToContent: '本文へスキップ',
    stepDone: '（完了）',
    stepRunning: '（実行中）',
    stepFailed: '（失敗）',
    stepPending: '（待機中）',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',
    banner: 'A1 は {date} に再構築されました。それ以前に作られた残高とチェーンはすべて存在しません。',
    bannerLink: 'これが意味すること',
    badge: '再構築済み',
    title: 'A1 は {date} に再構築されました',
    desc:
      'テストネットワーク A1 はブロック 0 から再構築されました。その日より前に作られたチェーン、' +
      '残高、取引履歴はもう存在しません。隠されたのではなく、消えました。' +
      'このページでは、いま見えているものと、これからすべきことを説明します。',
    willSeeTitle: '何が見えるか',
    willSee1:
      'ウォレットは今も接続でき、正しいネットワーク名と同じチェーン ID {chainId} を表示します。' +
      'これは意図的なものです。ただし残高は 0 になります。',
    willSee2:
      'あなたが立ち上げた L1 はすべてディレクトリから消えました。名前とチェーン ID は再び空きとなり、' +
      '誰でも取得できます。',
    willSee3:
      '署名済みでまだ送信していない取引がある場合、いま送信しないでください。' +
      'それはもう存在しないネットワークのものです。',
    toDoTitle: 'すべきこと',
    toDo1: 'フォーセットからテスト用トークンを取り直してください。上限は全員分がリセットされています。',
    toDo2:
      '古い L1 はウォレットから 1 つずつ削除してください。それぞれ固有のチェーン ID を持ち、' +
      'いまは何も指していません。メインの A1 ネットワークは削除不要です。設定は変わっていません。',
    toDo3: '必要ならチェーンを立ち上げ直してください。以前の名前は他の人が取得しているかもしれません。',
    archiveTitle: '旧ネットワークのアーカイブ',
    archiveDesc:
      '再構築前のネットワークの最終状態は書き出され、ハッシュが公開されています。' +
      '確認したい人は誰でも検証できます。',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1 は {date} に再構築されます。それ以前に作られたチェーン、残高、取引はすべて消去されます。',
    bannerLink: '詳細',
    badge: '再構築予定',
    title: 'A1 は {date} に再構築されます',
    desc:
      'テストネットワーク A1 全体がブロック 0 から再構築されます。その日より前に作られたものは' +
      'すべて消えます。隠れるのではなく、存在しなくなります。' +
      'このページには、何が失われ、あなたが何をすべきかを正確に記します。',
    whyTitle: 'なぜ再構築が必要か',
    why1:
      'ネットワークのジェネシスは変更できません。まさにそれが信頼の根拠です。' +
      '作った者を含め、誰もブロック 0 に書かれた数値を変えられません。',
    why2:
      'その代償として、ジェネシス内の数値を変えるにはネットワークを一から作り直すしかありません。' +
      'A1 は総供給量を 9,000,000,000 LOVE9 に引き上げ、ステーキング関連のパラメータ一式を' +
      'すべて計算し直す必要がありました。',
    why3:
      'これはテストネットであり、再構築はテストネットに許された行為です。むしろテストネットが' +
      '存在する理由がこれです。こうした変更をメインネットではなくここで起こすためです。',
    lostTitle: '失われるもの',
    lostDesc: '例外なくすべて：',
    lost1: 'ユーザーが立ち上げたすべての L1。問題なく動いているチェーンも含みます。',
    lost2: 'すべての LOVE9 残高。フォーセットで受け取ったトークンも含みます。',
    lost3: 'すべての取引とブロック、C-Chain・P-Chain・X-Chain の全履歴。',
    lost4: 'すべてのバリデータとすべての委任。',
    keptTitle: '残るもの',
    keptDesc:
      '削除の前に、終わるネットワーク全体がハッシュ付きで書き出され公開されます。記録は検証可能な' +
      'まま残ります。実行したネットワークが消えたあとも、起きたことは確認できます。' +
      'アーカイブのリンクは再構築当日にここへ掲載します。',
    toDoTitle: 'すべきこと',
    toDoBefore: '再構築の前：',
    toDo1:
      'データが残ることを前提にしたものを、いま A1 の上に作らないでください。アイデアを試すのは' +
      '構いません。ただ、現在のチェーンを保管場所として扱わないでください。',
    toDoAfter: '再構築のあと：',
    toDo2:
      '追加した L1 はウォレットから 1 つずつ削除してください。それらのチェーンはもう存在せず、' +
      'それを指したままのウォレットはただ動かないだけです。メインの A1 ネットワークは削除不要です。' +
      '設定は変わっていません。',
    toDo3:
      'ウォレットにまだ A1 ネットワークがない場合は、設定を手入力せず、フォーセットのページにある' +
      'ボタンから追加してください。',
    toDo4: 'フォーセットからトークンを取り直し、必要ならチェーンを立ち上げ直してください。',
    silentTitle: 'ウォレットは何も警告しません',
    silentDesc:
      '新しいネットワークはチェーン ID {chainId}、同じ RPC アドレス、同じ名前をそのまま保ちます。' +
      'これは意図的です。すでに公開したすべての資料や手順書が正しいままであるようにするためです。' +
      'その代償として、ウォレットには別のネットワークに接続したという手がかりが一切ありません。' +
      'そのため以下の二つは、何も知らせないまま起こります。',
    silent1:
      '古い設定のウォレットは今も接続でき、正しいネットワーク名を表示し、残高 0 と報告します。' +
      'その数字は正しいです。以前のトークンは隠れているのではなく、存在しません。' +
      'ネットワークを追加し直す必要はありません。フォーセットで新しいトークンを受け取るだけです。' +
      '取引が詰まっている、あるいは連番が違うと表示される場合は、ウォレット内のそのネットワークの' +
      'アクティビティ履歴を消去してください。ウォレットは死んだチェーンの取引カウントを覚えたままで、' +
      '新しいチェーンは 0 から数え直しています。',
    silent2:
      '署名済みで未送信の取引がまだ残っているなら、破棄してください。チェーン ID が変わっていないため、' +
      'その署名は新しいネットワークでも有効です。ウォレットが空のうちは失敗しますが、' +
      'フォーセットでトークンを受け取った瞬間に実行可能になり、思いがけない時に通ることがあります。',
    repeatTitle: 'またこういうことは起きるのか',
    repeatDesc:
      '起こり得ます。A1 は依然としてテストネットであり、コミュニティが A1 と C1 のどちらを' +
      'メインネットの方向とするか決めるまで、ジェネシス内の何かを変える必要が生じたときには' +
      'ネットワークを再構築する権利を保持します。約束するのは、事前に知らせること、そして' +
      '何が失われるかをはっきり述べることです。',
    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    alreadyTitle: '2026-08-27 に一度すでに再構築済み',
    alreadyDesc:
      'A1 は下記の日付より前、2026-08-27 に一度すでに再構築されています。それ以前にテスト用トークンをお持ちだった場合、残高は現在 0 です。これは正しい表示であり、ウォレットの不具合ではありません。ユーザーのチェーンは失われていません。当時ディレクトリにあったのは自動テスト用のチェーンだけでした。フォーセットからトークンを取り直してください。',
    dateNote: '日付はずれる可能性があります',
    dateNoteDesc:
      '{date} という日付は、その前段のチェックに依存します。ずれた場合、黙っているのではなく' +
      'このページの日付を書き換えます。',
  },

  footer: {
    tryIt: '試す',
    explore: 'ネットワークを見る',
    about: 'プロジェクトについて',
    explorer: '9Scan-A1 エクスプローラ',
    mainSite: '9Chain 公式サイト',
    opensNewTab: '（新しいタブで開きます）',
    navLabel: 'フッターのリンク',
    rebuildPlan: 'ネットワーク再構築の計画',
  },

  nav: {
    home: 'ホーム',
    faucet: 'テスト用トークンを取得',
    launch: 'チェーンを立ち上げる',
    myChains: 'マイチェーン',
    compare: 'A1 ↔ C1',
    directory: 'L1 ディレクトリ',
    explorer: 'エクスプローラ',
    explorerAria: '9Scan-A1 を新しいタブで開く',
  },

  home: {
    testnetBadge: 'テストネット — トークンに実際の価値はありません',
    primaryCta: '自分のチェーンを立ち上げる',
    secondaryCta: 'まずテスト用トークンを取得',
    title: 'A1 で自分専用のチェーンを立ち上げる',
    subtitle: '署名に使うウォレットが所有する、あなた専用の L1。テストネットワーク上で実際に動きます。所要時間は約 3 分です。',
    tableCaption: '各行は A1 上で実際に動いているチェーンで、それぞれに所有者がいます。',
    colChain: 'チェーン',
    colType: '種類',
    colOwner: '所有者',
    systemDefault: 'システム既定',
    emptyTitle: 'まだ稼働中の L1 はありません',
    emptyDesc: 'あなたが最初になります。チェーンが起動すると、ディレクトリはすぐ更新されます。',
    disclosure: '10 のバリデータのうち 9 つは同じサーバー、同じ事業者で動いています。10 番目は別の場所から参加しており、断続的にしかオンラインになりません。プロトコルの層では分散していますが、インフラの層ではまだです。',
    idleBlocksNote: 'Avalanche は空のブロックを作らないため、誰も取引していない間ブロック高が動かないのは正常です。稼働の指標は隣のバリデータ数です。',
  },

  stats: {
    title: 'ネットワークは稼働中',
    validators: '接続中のバリデータ',
    l1Count: '稼働中の L1',
    blockHeight: 'C-Chain ブロック',
    measuring: 'ネットワークを計測中…',
    cannotMeasure: 'ネットワーク統計を読み取れませんでした',
    cannotMeasureDesc: 'ページは問題なく使えます。これは状態表示だけです。',
  },
  directory: {
    lede: 'A1 テストネット上のすべてのチェーンと、それぞれの実際の状態。',
    howToTitle: 'この表の読み方。',
    howToBody: 'Avalanche は空のブロックを作りません。トランザクションがあるときだけチェーンはブロックを作るので、ブロック数が止まっているのは正常で、チェーンが死んだという意味ではありません。危険なのは逆のほうです。バリデータがいないチェーンでも RPC には応答し、残高も読めて、ウォレットも接続できます。しかしすべてのトランザクションが永久に宙に浮きます。ですからここで本当の生存の印になるのは、P-Chain から直接読んだサブネットのバリデータ数であって、ブロック高ではありません。',
    ownerTitle: '所有者（admin）',
    ownerBody: 'はチェーンを立ち上げたときに指定されたアドレスです。ジェネシス供給のすべてと、そのチェーンの手数料を変更する権利を持ちます。チェーンは財団のものではなく、その人のものです。コンソールにこの欄ができる前に立ち上げられたチェーンはシステム既定値を表示します。',
    mainNetwork: 'メインネットワーク',
    mainNetworkDesc: 'A1 テストネットの C-Chain — フォーセットとエクスプローラが動く場所です。',
    running: '稼働中',
    notAnswering: '応答なし',
    notAnsweringDesc: 'RPC が応答していません。まだどのノードもこのサブネットを追跡していない可能性があります。',
    unclear: '不明',
    unclearDesc: 'P-Chain からバリデータ集合を読み取れませんでした。',
    ownerAdmin: '所有者（admin）',
    blocks: 'ブロック数',
    subnetValidators: 'サブネットのバリデータ',
    created: '作成',
    revokedAt: '取り消し日時',
    copyOwner: '所有者アドレスをコピー',
    revoked: '取り消し済み',
    revokedDesc: 'このチェーンは提供を終了しました。もはやどのノードも動かしておらず、RPC も応答しません。このネットワークをウォレットに追加していた場合は削除してください。残しておいても接続エラーしか出ません。',
    neverReissued: '他のチェーンに再発行されることはありません',
    revokedGroup: '取り消し済み（{count}）',
    listError: 'チェーン一覧を読み取れませんでした（{error}）。メインネットワークは下に引き続き表示されます。',
    footSummary: '{count} 件の L1 が稼働 + メインネットワーク',
    footRevoked: '{count} 件取り消し済み',
    footUpdated: '{time} 更新',
  },


  loadTest: {
    badge: '負荷テスト',
    banner: '公開負荷テストを実施中です — 毎秒 {tps} 件のトランザクション。実際の利用者ではなく、当方が生成しています。',
    bannerLink: 'ライブの数値を見る',
    title: '公開負荷テスト',
    intro: 'A1 は実利用者がごく少ない新しいテストネットワークで、放っておくとブロックはほとんど生成されません。ネットワークを常に動かし、その様子を見ていただけるよう、当方が一定のトランザクションを生成しています。この通信は当方のものです。これは利用実績ではなく、利用実績として数えてもいません。送信元アドレスはすべて下に掲載しているので、差し引いて確認できます。',
    running: '実行中',
    stopped: '現在は停止中',
    stoppedWhy: '記録された理由: {reason}',
    labelTps: '毎秒トランザクション数',
    labelBlockHeight: 'C-Chain ブロック',
    labelSecondsPerBlock: '1 ブロックあたりの秒数',
    labelTotal: '開始以降に確定したトランザクション',
    labelUptime: '稼働時間',
    committedNote: 'これらの数値は送信を試みた件数ではなく、ブロックそのものから数えています。ネットワークが受理してもブロックに入らなかったトランザクションはここには含まれません。',
    addressesTitle: '9 つの送信元アドレス',
    addressesNote: 'これらのアドレスからのトランザクションはすべて当方が機械的に生成したものです。除外すれば、実際の活動が見えます。',
    measuring: '負荷テストの状態を読み取り中…',
    notMeasured: '負荷テストの状態を読み取れませんでした',
    notMeasuredMore: 'ページは問題なく使えます。これは状態表示だけです。',
  },

  launch: {
    title: '自分のチェーンを立ち上げる',
    desc: 'あなたのウォレットが所有する専用 L1。本人確認のために一度署名し、内容を確認すると、ネットワークが約 3 分でチェーンを構築します。',
    connectWallet: 'ウォレットを接続',
    connecting: '接続中…',
    signIn: '署名してログイン',
    signing: '署名を待っています…',
    yourWallet: 'あなたのウォレット',
    youWillOwn: 'チェーンはこのウォレットのものになります。アドレスは署名から取得され、誰も手入力しません。',
    noWallet: 'このブラウザにウォレットが見つかりません。MetaMask をインストールしてページを再読み込みしてください。',
    signRejected: '署名を拒否しました。何も作成されていません。',
    switchWallet: '別のウォレットを使う',
    nameLabel: 'チェーン名',
    namePlaceholder: '例：MyChain',
    nameHelp: '英数字とスペース。2〜32 文字。このネットワークでは、一度使われた名前は二度と割り当てられません。取り消されたチェーンの名前も同様です。',
    nameInvalid: '名前に使えるのは英数字とスペースのみで、長さは 2〜32 文字です。',
    typeLabel: 'チェーンの種類',
    typeHelp: '一度選ぶと固定されます。チェーンのジェネシスは編集できません。',
    slotsLeft: '残り {left}/{total} 枠',
    slotsFull: '空き枠なし',
    slotsFullDesc:
      '現在の方式ではすべてのバリデータがすべての L1 を追跡し、17 以上のサブネットを宣言した' +
      'ノードはプロトコルによって切断されます。これは引き上げられない上限です。' +
      'チェーンを取り消すと枠が 1 つ戻ります。',
    reviewCta: '送信前に確認',
    reviewTitle: '確認 — これは片道の扉です',
    reviewDesc:
      '立ち上げた L1 のジェネシスは変更できません。この手順のあと、名前・チェーンの種類・所有者は' +
      '変更できず、取り消しても名前とチェーン ID は戻りません。',
    reviewRebuild:
      '押す前にもう一つ。A1 は {date} にネットワーク全体を再構築します。今日立ち上げるチェーンは' +
      '旧ネットワークとともに消去されます。隠れるのではなく、消えます。',
    reviewName: 'チェーン名',
    reviewType: 'チェーンの種類',
    reviewOwner: '所有者',
    reviewBack: '戻って修正',
    reviewConfirm: '確認しました — チェーンを立ち上げる',
    launching: 'チェーン「{name}」を作成中',
    launchingDesc:
      'ネットワークが定足数を失わないよう、ノードは 1 台ずつ再起動します。そのため時間がかかりますが、' +
      'それは意図的です。タブは閉じないでください。閉じてもチェーンの構築は続きます。',
    etaRemaining: '残り約 {minutes} 分',
    preparing: '準備中…',
    doneTitle: '完了 — チェーン「{name}」が稼働中です',
    doneChainId: 'チェーン ID',
    doneRpc: 'RPC',
    doneAddWallet: 'チェーンをウォレットに追加',
    doneAdded: 'ウォレットに追加しました',
    doneActivate: 'チェーンを有効化（ブロック 1 を開く）',
    doneActivated: '有効化済み',
    doneActivating: 'ウォレットを待っています…',
    doneAddWalletError: 'チェーンをウォレットに追加できませんでした。{detail}',
    doneActivateError: 'チェーンを有効化できませんでした。{detail}',
    launchAnother: '別のチェーンを立ち上げる',
    launchError: 'チェーンを立ち上げられませんでした。{detail}',
    unknownError: '処理の終了後、チェーンはディレクトリに現れませんでした。',
    noteTitle: '新しいチェーンでの最初の取引',
    noteHow: '最初の取引のガス見積もりは当てになりません。ブロック 1 を開く最も安い方法は通常の送金です。下の「チェーンを有効化」を押してください。',
  },

  myChains: {
    title: 'マイチェーン',
    desc: 'ログインに使ったウォレットが所有する L1 です。取り消せますが、先に警告をお読みください。',
    connectWallet: 'ウォレットを接続してチェーンを表示',
    emptyTitle: 'このウォレットはまだチェーンを所有していません',
    emptyDesc: '1 つ立ち上げて戻ってきてください。すぐここに表示されます。',
    emptyCta: '自分のチェーンを立ち上げる',
    colChain: 'チェーン',
    colType: '種類',
    colStatus: '状態',
    colActions: '',
    validatorCount: 'バリデータ {count}',
    measuring: '計測中',
    cannotMeasure: '計測できません',
    statusHelp: 'ブロック高ではなく、サブネットのバリデータ数で測ります。',
    noValidators: 'バリデータ 0',
    noValidatorsDesc:
      'このチェーンは取引を一つも確定できません。サブネットにバリデータがいないためです。' +
      'RPC には応答し、ウォレットも接続できるので、他に見分ける手がかりはありません。',
    walletSettings: 'ウォレット用の設定',
    addToWallet: 'ウォレットに追加',
    addedToWallet: '追加済み',
    addWalletError: 'ウォレットに追加できませんでした。{detail}',
    revoke: '取り消す',
    revokeTitle: '「{name}」を取り消しますか？',
    revokeWarn1: 'チェーンは直ちに RPC の提供を停止し、公開ディレクトリから消えます。',
    revokeWarn2:
      '取り消しても P-Chain 上のサブネットは削除されません。このネットワークが動いている限り、' +
      'そこで作られたものは取り除けません。すでにこのチェーンを追加した人のウォレットからも消えません。',
    revokeWarn3:
      '名前とチェーン ID は予約されたままとなり、このネットワークで誰かに再発行されることは' +
      '決してありません。チェーン ID を再発行すると、以前の利用者のウォレットが黙って別人の' +
      'チェーンを指すことになります。',
    revokeWarn4: 'その代わり、15 枠のうち 1 枠が戻ります。',
    revokeTypeLabel: '確認のためチェーン名を正確に入力してください',
    revokeNameMismatch: 'チェーン名と一致しません。',
    revokeConfirm: '恒久的に取り消す',
    revokeCancel: 'キャンセル',
    revoking: '「{name}」を取り消し中 — 約 3 分',
    revokeDone: '「{name}」を取り消しました。残り {left}/{total} 枠。',
    revokeError: '取り消せませんでした。{detail}',
    revokeUnknown: '処理の終了後もチェーンはディレクトリに残っています。',
    revokedBadge: '取り消し済み',
    revokedDesc: '名前とチェーン ID はこのネットワークで予約されたままです。',
  },

  compare: {
    title: 'A1 ↔ C1 — 比較',
    desc:
      '9Chain は同じ製品のテストネットを 2 つ並行して運用しており、違いはエンジンです。' +
      'A1 は Avalanche エンジン、C1 は Cosmos エンジンです。この表は両方向の間の' +
      'トレードオフを記録したもので、誰でも反論できるよう公開しています。' +
      'C1 側にはまだ実測値がありません。',
    selfScoreTitle: '以下の点数はチームによる自己評価であり、独立した計測ではありません',
    selfScoreDesc:
      '「計測方法」の列に、各基準をどう確認したかを記しています。日付入りの計測がない基準は' +
      'データではなく設計上の判断です。重みはあなたが決め、点数はそれに従います。',
    colNo: '#',
    colCriterion: '基準',
    colKind: '種別',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: '重み',
    kindArchitecture: '設計',
    kindLiveData: '実測値',
    totalScore: 'あなたの重みによる合計点',
    tied: '同点',
    leads: 'リード',
    liveDataTitle: 'ライブデータ',
    a1Validators: 'A1 — 接続中のバリデータ',
    a1Chains: 'A1 — 稼働中の L1',
    a1Blocks: 'A1 — C-Chain ブロック',
    c1Unreachable: 'C1 — 到達できません',
    c1UnreachableDesc:
      'C1 の Cosmos REST の URL（ポート 1317）が必要です。表は引き続き使えます。A1 側は実測値、' +
      'C1 側は他の基準と同じく設計上の判断です。',
    measuring: '計測中…',
    cannotMeasure: '計測できません',
    critDecentralisation: '分散度（バリデータ数の上限）',
    noteDecentralisation: 'プロトコル上の上限：Snowman は約数千ノード、CometBFT は約 150。A1 の現状：9 ノード、1 台、1 事業者',
    critFinality: 'ファイナリティ',
    noteFinality: '約 1–2 秒 対 約 5–6 秒',
    critEvmMaturity: 'EVM の成熟度',
    noteEvmMaturity: 'coreth は本番運用中、Cosmos EVM は v1 前',
    critWalletCompat: '一般向けウォレット／DeFi 互換性',
    noteWalletCompat: 'MetaMask／EVM に完全対応',
    critLaunchUx: 'チェーン作成の使い勝手',
    noteLaunchUx: '両方にコンソールあり。A1 は 1 回あたり約 170 秒を実測',
    critInterop: '相互運用の広さ',
    noteInterop: 'エコシステム内の Warp/ICM（A1 は資産移動を実施済み、M6.2）対 IBC の到達範囲',
    critOpCost: 'チェーン 1 本あたりの運用コスト',
    noteOpCost: 'ノード + プラグイン 対 K8s オペレータ',
    critBootstrap: 'ネットワーク効果の立ち上げ',
    noteBootstrap: '独立した島 対 Cosmos 経済圏に接続済みの IBC',
    critEconSecurity: '公開された経済的安全性',
    noteEconSecurity: '最初から PoS トークンで担保',
    critSwitchCost: 'チームの乗り換えコスト',
    noteSwitchCost: 'A1 は新しく、C1 は数か月稼働している',
  },

  faucet: {
    title: 'テスト用トークンを取得',
    desc: 'A1 テストネットの LOVE9 に実際の価値はありません。テスト中にガスを払えるようにするためのものです。ウォレットアドレスを入力すれば、すぐ送ります。',
    addressLabel: 'あなたのウォレットアドレス',
    addressPlaceholder: '0x…（16 進数 40 文字）',
    requestCta: 'トークンを送ってもらう',
    sending: '送信中…',
    addressHelp: 'トークンを受け取るウォレットアドレスを貼り付けてください。まだの場合は上の「ネットワークをウォレットに追加」を押してください。',
    addNetwork: 'ネットワークをウォレットに追加',
    addNetworkDone: 'ウォレットに追加しました',
    addNetworkRejected: 'ウォレットで拒否を押しました。ネットワークを追加したい場合はもう一度押してください。',
    addNetworkError: 'ウォレットがネットワークを追加できませんでした。隣の設定を使って手動で追加し、下の行をチームに送ってください：',
    noWallet: 'このブラウザにウォレットが見つかりません。MetaMask をインストールしてページを再読み込みしてください。',
    quotaLabel: '残りの上限',
    quotaFormat: '{hours} 時間あたり {left}/{total} 回',
    quotaExhausted: '上限をすべて使い切りました。{minutes} 分後にもう一度お試しください。',
    quotaUnreadable: '上限を読み取れませんでした。申請自体は可能ですが、残り回数はわかりません。',
    sentOk: '{address} へ {count} {symbol} を送信しました',
    viewTransaction: '取引を見る',
    settingsTitle: 'ネットワーク設定',
    settingsRpc: 'RPC',
    settingsChainId: 'チェーン ID',
    settingsSymbol: 'シンボル',
    settingsDecimals: '小数桁',
    settingsExplorer: 'エクスプローラ',
    decimalsHelp:
      'C-Chain は EVM を動かすため、ウォレットは 18 桁で表示します。P/X-Chain では LOVE9 は 9 桁で' +
      '数えます。同じ 1 種類のコインを 2 つの尺度で見ているだけで、別のトークンではありません。',
    genericError: '送信できませんでした。{detail}',
  },

  langPicker: {
    label: '言語',
    machineBadge: '機械翻訳',
    machineNote: '人が確認したのはベトナム語版だけです。他の翻訳は機械によるもので誤りを含む可能性があります。英語版が基準です。',
    notAvailable: 'まだ利用できません',
  },

  errors: {
    unreachable: 'ネットワークに接続できませんでした',
    unreachableDesc: 'ネットワークが混雑しているか、接続が切れた可能性があります。',
    empty: 'ここにはまだ何もありません',
    addressEmpty: '{label} は空にできません',
    addressFormat: '{label} は 0x のあとに 16 進数 40 文字である必要があります',
    addressChecksum: '{label} の EIP-55 チェックサムが合いません。1 文字打ち間違えたか、貼り付けのときに欠けた可能性が高いです',
    addressZero: '{label} にゼロアドレスは使えません。その鍵は誰も持っていません',
    timeout: '{seconds} 秒たっても応答がありません',
    notJson: '応答が JSON ではありませんでした（HTTP {status}）。リクエストが誤った場所に振り分けられた可能性が高いです',
    noWallet: 'このブラウザにウォレットが見つかりません。',
  },

  notFound: {
    code: '404',
    title: 'このページは存在しません',
    desc: '開いたアドレスは 9Chain Testnet A1 に存在しません。名前が変わったか、コピーの際に URL の文字が欠けた可能性があります。',
    topPagesTitle: 'よく使われる 3 つのページ：',
    navLabel: '次にどこへ',
    goHome: 'ホームに戻る',
    goFaucet: 'テスト用トークンを取得',
    goLaunch: '自分のチェーンを立ち上げる',
    lookingForTx: '取引かアドレスをお探しですか？ハッシュを確認してもう一度お試しください。',
  },
};

export default ja;
