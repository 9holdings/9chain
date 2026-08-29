import type { Tu } from '../en';

/**
 * Français — traduction automatique, non relue par un humain.
 * La langue source est l'anglais (`../en.ts`) ; en cas de divergence, l'anglais fait foi.
 *
 * 🔴 N'adoucissez pas ces trois passages : `reGenesis.*` (le réseau sera effacé),
 * `deChain.soatMoTa` (porte à sens unique), `chainCuaToi.thuHoiY*` (révoquer ne rend
 * pas le nom). Ils disent « définitif » et « ne peut pas être modifié » pour éviter
 * qu'on perde ses actifs en croyant pouvoir revenir en arrière.
 */
export const fr: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'Le testnet public de 9Chain — un réseau indépendant fonctionnant avec le moteur Avalanche',
    tagTitle: 'un réseau indépendant sur le moteur Avalanche',
    viTuChoi: 'Vous avez refusé la demande dans votre portefeuille. Rien n’a changé.',
    dangTai: 'Chargement…',
    thuLai: 'Réessayer',
    saoChep: 'Copier',
    daChep: 'Copié',
    dong: 'Fermer',
    moMenu: 'Ouvrir le menu',
    dongMenu: 'Fermer le menu',
    chuyenSangToi: 'Passer en mode sombre',
    chuyenSangSang: 'Passer en mode clair',
    boQuaToiNoiDung: 'Aller au contenu principal',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',
    bang: 'A1 a été reconstruit le {ngay}. Tous les soldes et toutes les chaînes créés avant cette date n’existent plus.',
    bangNut: 'Ce que cela signifie',
    nhan: 'Reconstruit',
    tieuDe: 'A1 a été reconstruit le {ngay}',
    moTa:
      'Le réseau de test A1 a été reconstruit depuis le bloc 0. Les chaînes, les soldes et ' +
      'l’historique des transactions créés avant cette date n’existent plus — ils ne sont pas ' +
      'masqués, ils ont disparu. Cette page explique ce que vous voyez et ce qu’il faut faire.',
    thayGiTieuDe: 'Ce que vous allez voir',
    thayGi1:
      'Votre portefeuille se connecte toujours, affiche toujours le bon nom de réseau et le même ' +
      'Chain ID {chainId} — c’était délibéré. Mais votre solde sera de 0.',
    thayGi2:
      'Chaque L1 que vous aviez lancée a disparu de l’annuaire. Leurs noms et Chain ID sont de ' +
      'nouveau libres, et n’importe qui peut les prendre.',
    thayGi3:
      'Si vous aviez signé une transaction sans jamais la diffuser, ne la diffusez pas maintenant : ' +
      'elle appartient à un réseau qui n’existe plus.',
    lamGiTieuDe: 'Ce que vous devez faire',
    lamGi1: 'Redemandez des jetons de test au robinet. Les limites ont été réinitialisées pour tout le monde.',
    lamGi2:
      'Supprimez de votre portefeuille chaque ancienne L1 séparément — elles ont leur propre Chain ID ' +
      'et pointent désormais vers le vide. Le réseau principal A1 n’a PAS besoin d’être supprimé ; ' +
      'ses paramètres n’ont pas changé.',
    lamGi3: 'Relancez votre chaîne si vous en avez besoin. Quelqu’un d’autre a peut-être pris l’ancien nom.',
    luuTieuDe: 'Archive de l’ancien réseau',
    luuMoTa:
      'L’état final du réseau avant la reconstruction a été exporté et son empreinte publiée, afin ' +
      'que toute personne souhaitant vérifier puisse le faire.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'A1 sera reconstruit le {ngay} — toutes les chaînes, tous les soldes et toutes les transactions créés avant seront effacés.',
    bangNut: 'Détails',
    nhan: 'Reconstruction à venir',
    tieuDe: 'A1 sera reconstruit le {ngay}',
    moTa:
      'L’ensemble du réseau de test A1 sera reconstruit depuis le bloc 0. Tout ce qui a été créé ' +
      'avant cette date disparaîtra — non pas masqué, mais purement et simplement supprimé. Cette ' +
      'page dit exactement ce qui est perdu et ce que vous devez faire.',
    viSaoTieuDe: 'Pourquoi une reconstruction est nécessaire',
    viSao1:
      'Le genesis d’un réseau est immuable. C’est précisément ce qui le rend digne de confiance : ' +
      'personne, pas même ceux qui l’ont construit, ne peut changer un nombre une fois inscrit dans le bloc 0.',
    viSao2:
      'Le prix à payer : modifier un nombre à l’intérieur du genesis ne laisse d’autre choix que de ' +
      'reconstruire le réseau depuis zéro. A1 a porté l’offre totale à 9 000 000 000 LOVE9, et toute ' +
      'la série de paramètres de staking a dû être recalculée en conséquence.',
    viSao3:
      'Ceci est un testnet, et reconstruire fait partie de ce qu’un testnet a le droit de faire. ' +
      'C’est même la raison d’être des testnets : que ce genre de changement se produise ici, et non sur le mainnet.',
    matTieuDe: 'Ce qui sera perdu',
    matMoTa: 'Tout, sans exception :',
    mat1: 'Chaque L1 lancée par un utilisateur, y compris les chaînes qui fonctionnent parfaitement.',
    mat2: 'Chaque solde LOVE9, y compris les jetons reçus du robinet.',
    mat3: 'Chaque transaction, chaque bloc, et tout l’historique de la C-Chain, de la P-Chain et de la X-Chain.',
    mat4: 'Chaque validateur et chaque délégation.',
    conTieuDe: 'Ce qui est conservé',
    conMoTa:
      'Avant la suppression, tout le réseau en fin de vie sera exporté avec une empreinte publiée, ' +
      'pour que la trace reste vérifiable. Ce qui s’est produit restera contrôlable, même une fois ' +
      'le réseau qui l’exécutait disparu. Le lien de l’archive sera publié ici le jour de la reconstruction.',
    lamTieuDe: 'Ce que vous devez faire',
    lamTruoc: 'Avant la reconstruction :',
    lam1:
      'Ne construisez rien sur A1 en ce moment qui dépende de la survie des données. Si vous testez ' +
      'une idée, allez-y — ne considérez simplement pas la chaîne actuelle comme un espace de stockage.',
    lamSau: 'Après la reconstruction :',
    lam2:
      'Supprimez de votre portefeuille chaque L1 que vous aviez ajoutée — ces chaînes n’existent plus, ' +
      'et un portefeuille qui pointe vers elles restera simplement inerte. Le réseau principal A1 n’a ' +
      'pas besoin d’être supprimé : ses paramètres n’ont pas changé.',
    lam3:
      'Si votre portefeuille n’a pas encore le réseau A1, ajoutez-le avec le bouton de la page du ' +
      'robinet plutôt qu’en saisissant les paramètres à la main.',
    lam4: 'Redemandez des jetons au robinet, et relancez votre chaîne si vous le souhaitez.',
    imLangTieuDe: 'Votre portefeuille ne vous préviendra pas',
    imLangMoTa:
      'Le nouveau réseau conserve le Chain ID {chainId}, la même adresse RPC et le même nom que ' +
      'l’ancien. C’est délibéré — afin que chaque document et chaque guide déjà publiés restent exacts. ' +
      'Le prix, c’est que votre portefeuille n’a aucun signal indiquant qu’il vient de se connecter à ' +
      'un réseau différent. Les deux choses ci-dessous se produiront donc en silence.',
    imLang1:
      'Un portefeuille avec l’ancienne configuration se connecte toujours, affiche toujours le bon nom ' +
      'de réseau, et indiquera un solde de 0. Ce chiffre est CORRECT : vos anciens jetons n’existent ' +
      'plus, ils ne sont pas masqués. Vous n’avez pas besoin de rajouter le réseau — demandez ' +
      'simplement de nouveaux jetons au robinet. Si votre portefeuille signale une transaction bloquée ' +
      'ou un numéro de séquence erroné, effacez les données d’activité de ce réseau dans le ' +
      'portefeuille : il se souvient encore du compteur de transactions d’une chaîne morte, alors que ' +
      'la nouvelle repart de 0.',
    imLang2:
      'Si vous détenez encore une transaction signée jamais diffusée, jetez-la. La signature reste ' +
      'valide sur le nouveau réseau, puisque le Chain ID n’a pas changé. Elle échouera tant que le ' +
      'portefeuille est vide — mais dès l’instant où vous demandez des jetons au robinet, elle devient ' +
      'exécutable, et elle peut passer à un moment que vous n’attendez pas.',
    lapTieuDe: 'Est-ce que cela se reproduira',
    lapMoTa:
      'C’est possible. A1 reste un testnet et, tant que la communauté n’aura pas choisi une direction ' +
      'de mainnet entre A1 et C1, nous nous réservons le droit de reconstruire le réseau lorsqu’un ' +
      'élément du genesis doit changer. Ce que nous nous engageons à faire, c’est prévenir à l’avance ' +
      'et dire clairement ce qui est perdu.',
    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    daXayRaTieuDe: 'Déjà reconstruit une fois le 2026-08-27',
    daXayRaMoTa:
      'A1 a déjà été reconstruit une fois le 2026-08-27, avant la date indiquée ci-dessous. Si vous déteniez des jetons de test auparavant, votre solde est désormais de 0 — c’est correct, ce n’est pas une panne de votre portefeuille. Aucune chaîne d’utilisateur n’a été perdue : l’annuaire ne contenait que des chaînes de test automatisées. Redemandez des jetons au robinet.',
    ngayLuuY: 'La date peut glisser',
    ngayLuuYMoTa:
      'La date du {ngay} dépend d’un contrôle préalable. En cas de report, nous modifierons la date ' +
      'sur cette page plutôt que de rester silencieux.',
  },

  chanTrang: {
    dungThu: 'Essayer',
    kham: 'Explorer',
    veDuAn: 'À propos',
    explorer: 'Explorateur 9Scan-A1',
    trangChinh: 'Site principal 9Chain',
    moTabMoi: '(s’ouvre dans un nouvel onglet)',
    nhanNav: 'Liens du pied de page',
    reGenesis: 'Plan de reconstruction du réseau',
  },

  dieuHuong: {
    trangChu: 'Accueil',
    faucet: 'Obtenir des jetons de test',
    console: 'Lancer une chaîne',
    chainCuaToi: 'Mes chaînes',
    bang: 'A1 ↔ C1',
    danhBa: 'Annuaire des L1',
    explorer: 'Explorateur',
    banGiao: 'Ouvrir 9Scan-A1 dans un nouvel onglet',
  },

  trangChu: {
    nhanTestnet: 'Testnet — les jetons n’ont aucune valeur réelle',
    nutChinh: 'Lancez votre chaîne',
    nutPhu: 'Obtenez d’abord des jetons de test',
    cTieuDe: 'Lancez votre propre chaîne sur A1',
    cPhu: 'Une L1 à vous, détenue par le portefeuille avec lequel vous signez, qui tourne réellement sur le réseau de test. Environ trois minutes.',
    cBangChuThich: 'Chaque ligne est une chaîne réelle qui tourne sur A1, avec son propre propriétaire.',
    cCot: 'Chaîne',
    cCotKieu: 'Type',
    cCotChu: 'Propriétaire',
    cMacDinh: 'valeur par défaut du système',
    cTrong: 'Aucune L1 ne tourne pour l’instant',
    cTrongMoTa: 'Vous seriez le premier. L’annuaire se met à jour dès que votre chaîne est active.',
    tuTo: '9 des 10 validateurs tournent sur un même serveur, chez un même fournisseur ; le dixième tourne chez un fournisseur différent. Décentralisé au niveau du protocole, et seulement au début de l’être au niveau de l’infrastructure.',
    blockDungYen: 'Avalanche ne produit pas de blocs vides : une hauteur de bloc qui ne bouge pas alors que personne ne transige est donc normale. La mesure de vivacité, c’est le nombre de validateurs à côté.',
  },

  soLieu: {
    tieuDe: 'Le réseau est actif',
    validator: 'Validateurs connectés',
    soL1: 'L1 en fonctionnement',
    chieuCao: 'Bloc C-Chain',
    dangDo: 'Mesure du réseau…',
    khongDo: 'Impossible de lire les statistiques du réseau',
    khongDoMoTa: 'La page fonctionne toujours — ceci n’est que l’affichage de l’état.',
  },

  loadTest: {
    badge: 'Test de charge',
    banner: 'Nous menons un test de charge public : {tps} transactions par seconde, générées par nous, pas par de vrais utilisateurs.',
    bannerLink: 'Voir les chiffres en direct',
    title: 'Test de charge public',
    intro: 'A1 est un jeune réseau de test avec très peu d\'utilisateurs réels ; laissé seul, il ne produit presque aucun bloc. Nous générons un flux régulier de transactions pour que le réseau soit sollicité en continu et que vous puissiez le voir fonctionner. Ce trafic est le nôtre. Ce n\'est pas de l\'usage et nous ne le comptons pas comme tel : chaque adresse qui l\'émet est listée ci-dessous, pour que vous puissiez la soustraire.',
    running: 'En cours',
    stopped: 'Pas en cours actuellement',
    stoppedWhy: 'Raison enregistrée : {reason}',
    labelTps: 'Transactions par seconde',
    labelBlockHeight: 'Bloc C-Chain',
    labelSecondsPerBlock: 'Secondes par bloc',
    labelTotal: 'Transactions confirmées depuis le début',
    labelUptime: 'En marche depuis',
    committedNote: 'Ces chiffres sont comptés à partir des blocs eux-mêmes, pas de ce que nous avons tenté d\'envoyer. Une transaction acceptée par le réseau mais jamais incluse dans un bloc n\'est pas comptée ici.',
    addressesTitle: 'Les neuf adresses émettrices',
    addressesNote: 'Chaque transaction issue de ces adresses est générée par une machine chez nous. Filtrez-les pour voir l\'activité réelle éventuelle.',
    measuring: 'Lecture de l\'état du test de charge…',
    notMeasured: 'Impossible de lire l\'état du test de charge',
    notMeasuredMore: 'La page fonctionne toujours — ceci n’est que l’affichage de l’état.',
  },

  deChain: {
    tieuDe: 'Lancez votre chaîne',
    moTa: 'Une L1 dédiée, détenue par votre portefeuille. Vous signez une fois pour prouver qui vous êtes, vous vérifiez, et le réseau construit la chaîne en trois minutes environ.',
    noiVi: 'Connecter le portefeuille',
    dangNoi: 'Connexion…',
    kyDeVao: 'Signer pour se connecter',
    dangKy: 'En attente de la signature…',
    viCuaBan: 'Votre portefeuille',
    laChuChain: 'La chaîne appartiendra à ce portefeuille. L’adresse provient de votre signature — personne ne la saisit.',
    khongCoVi: 'Aucun portefeuille détecté dans ce navigateur. Installez MetaMask puis rechargez la page.',
    tuChoiKy: 'Vous avez refusé de signer. Rien n’a été créé.',
    doiVi: 'Utiliser un autre portefeuille',
    nhanTen: 'Nom de la chaîne',
    goiYTen: 'Par exemple : MaChaine',
    moTaTen: 'Lettres, chiffres et espaces. 2 à 32 caractères. Sur ce réseau, un nom déjà utilisé n’est jamais réattribué — pas même pour une chaîne révoquée.',
    tenXau: 'Le nom ne peut contenir que des lettres, des chiffres et des espaces, sur 2 à 32 caractères.',
    nhanKieu: 'Type de chaîne',
    moTaKieu: 'Une fois choisi, c’est définitif — le genesis d’une chaîne ne peut pas être modifié.',
    conCho: '{con}/{tong} places restantes',
    hetCho: 'Plus aucune place',
    hetChoMoTa:
      'Le modèle actuel fait suivre toutes les L1 par chaque validateur, et le protocole écarte un ' +
      'nœud qui déclare plus de 16 sous-réseaux. C’est un plafond dur, impossible à relever. Révoquer ' +
      'une chaîne restitue une place.',
    soatLai: 'Vérifiez avant d’envoyer',
    soatTieuDe: 'Vérification — c’est une porte à sens unique',
    soatMoTa:
      'Le genesis d’une L1 lancée est IMMUABLE. Après cette étape, le nom, le type de chaîne et le ' +
      'propriétaire ne peuvent plus être modifiés — et une révocation ne rendra ni le nom ni le Chain ID.',
    soatReGenesis:
      'Encore une chose avant de valider : A1 reconstruit tout le réseau le {ngay}. La chaîne que vous ' +
      'lancez aujourd’hui sera effacée avec l’ancien réseau — non pas masquée, mais supprimée.',
    soatTen: 'Nom de la chaîne',
    soatKieu: 'Type de chaîne',
    soatChu: 'Propriétaire',
    soatQuayLai: 'Revenir et modifier',
    soatDongY: 'J’ai vérifié — lancer la chaîne',
    dangDe: 'Lancement de la chaîne « {ten} »',
    dangDeMoTa:
      'Les nœuds redémarrent UN PAR UN pour que le réseau ne perde jamais le quorum — c’est pour cela ' +
      'que c’est lent, et c’est délibéré. Ne fermez pas l’onglet ; si vous le faites, la chaîne est ' +
      'construite quand même.',
    conKhoang: 'Environ {phut} minutes restantes',
    dangChuanBi: 'Préparation…',
    xongTieuDe: 'Terminé — la chaîne « {ten} » tourne',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Ajouter la chaîne au portefeuille',
    xongDaThem: 'Ajoutée au portefeuille',
    xongKichHoat: 'Activer la chaîne (ouvrir le bloc 1)',
    xongDaKichHoat: 'Activée',
    xongDangKichHoat: 'En attente du portefeuille…',
    xongThemViLoi: 'Impossible d’ajouter la chaîne à votre portefeuille. {chiTiet}',
    xongKichHoatLoi: 'Impossible d’activer la chaîne. {chiTiet}',
    deTiep: 'Lancer une autre chaîne',
    loiDe: 'Impossible de lancer la chaîne. {chiTiet}',
    loiKhongRo: 'La chaîne n’est pas apparue dans l’annuaire après la fin de l’exécution.',
    luuYTieuDe: 'La première transaction d’une nouvelle chaîne',
    luuYCachLam: 'Ne vous fiez pas à l’estimation de gaz de la première transaction. Le moyen le moins coûteux d’ouvrir le bloc 1 est un simple transfert — appuyez sur « Activer la chaîne » ci-dessous.',
  },

  chainCuaToi: {
    tieuDe: 'Mes chaînes',
    moTa: 'Les L1 détenues par le portefeuille avec lequel vous vous êtes connecté. Elles peuvent être révoquées, mais lisez d’abord l’avertissement.',
    noiVi: 'Connectez votre portefeuille pour voir vos chaînes',
    trongTieuDe: 'Ce portefeuille ne possède encore aucune chaîne',
    trongMoTa: 'Lancez-en une puis revenez — elle apparaîtra ici immédiatement.',
    trongNut: 'Lancez votre chaîne',
    cotChain: 'Chaîne',
    cotKieu: 'Type',
    cotSong: 'État',
    cotViec: '',
    songDo: '{so} validateurs',
    songDangDo: 'mesure en cours',
    songKhongDo: 'mesure impossible',
    songGiaiThich: 'Mesuré par le nombre de validateurs du sous-réseau, et non par la hauteur de bloc.',
    khongValidator: '0 validateur',
    khongValidatorMoTa:
      'Cette chaîne ne peut finaliser AUCUNE transaction : le sous-réseau n’a pas de validateur. Elle ' +
      'répond toujours aux appels RPC et les portefeuilles s’y connectent toujours, il n’y a donc aucun ' +
      'autre signe visible.',
    thongSo: 'Paramètres du portefeuille',
    themVaoVi: 'Ajouter au portefeuille',
    daThemVaoVi: 'Ajoutée',
    themViLoi: 'Impossible de l’ajouter à votre portefeuille. {chiTiet}',
    thuHoi: 'Révoquer',
    thuHoiTieuDe: 'Révoquer « {ten} » ?',
    thuHoiY1: 'La chaîne cesse immédiatement de servir le RPC et disparaît de l’annuaire public.',
    thuHoiY2:
      'La révocation ne supprime PAS le sous-réseau sur la P-Chain — ce qui y a été créé ne peut pas ' +
      'être retiré tant que ce réseau tourne. Elle ne retire pas non plus le réseau des portefeuilles ' +
      'des personnes ayant déjà ajouté cette chaîne.',
    thuHoiY3:
      'Le nom et le Chain ID restent réservés et ne sont JAMAIS réattribués à quiconque sur ce réseau. ' +
      'Réattribuer un Chain ID ferait pointer en silence le portefeuille d’un ancien utilisateur vers ' +
      'la chaîne de quelqu’un d’autre.',
    thuHoiY4: 'En échange, une place sur les 15 est restituée.',
    thuHoiGoNhan: 'Saisissez exactement le nom de la chaîne pour confirmer',
    thuHoiSaiTen: 'Cela ne correspond pas au nom de la chaîne.',
    thuHoiXacNhan: 'Révoquer définitivement',
    thuHoiHuy: 'Annuler',
    thuHoiDangChay: 'Révocation de « {ten} » — environ trois minutes',
    thuHoiXong: '« {ten} » révoquée. {con}/{tong} places restantes.',
    thuHoiLoi: 'Révocation impossible. {chiTiet}',
    thuHoiKhongRo: 'La chaîne est toujours dans l’annuaire après la fin de l’exécution.',
    daThuHoi: 'Révoquée',
    daThuHoiMoTa: 'Le nom et le Chain ID restent réservés sur ce réseau.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — comparaison',
    moTa:
      '9Chain fait tourner DEUX testnets du même produit en parallèle, avec des moteurs différents : ' +
      'A1 sur le moteur Avalanche, C1 sur le moteur Cosmos. Ce tableau consigne les compromis entre ' +
      'les deux directions, publié pour que chacun puisse le contester — le côté C1 n’a pas encore de ' +
      'mesures réelles.',
    tuChamTieuDe: 'Les notes ci-dessous sont AUTO-ÉVALUÉES par l’équipe, elles ne sont pas mesurées indépendamment',
    tuChamMoTa:
      'La colonne « comment c’est mesuré » indique comment chaque critère a été vérifié. Tout critère ' +
      'sans mesure datée est un jugement d’architecture, pas une donnée. Les pondérations vous ' +
      'appartiennent — la note suit.',
    cotSo: '#',
    cotTieuChi: 'Critère',
    cotLoai: 'Type',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Poids',
    loaiKienTruc: 'architecture',
    loaiSong: 'données réelles',
    tongDiem: 'Note totale avec vos pondérations',
    hoaNhau: 'Égalité',
    dangDan: 'en tête',
    soLieuTieuDe: 'Données en direct',
    a1Validator: 'A1 — validateurs connectés',
    a1Chain: 'A1 — L1 en fonctionnement',
    a1Block: 'A1 — bloc C-Chain',
    c1Vang: 'C1 — injoignable',
    c1VangMoTa:
      'L’URL REST Cosmos de C1 (port 1317) est nécessaire. Le tableau reste utilisable : le côté A1 ' +
      'est constitué de données réelles, le côté C1 est un jugement d’architecture comme les autres critères.',
    dangDo: 'mesure…',
    khongDo: 'mesure impossible',
  },

  faucet: {
    tieuDe: 'Obtenir des jetons de test',
    moTa: 'Le LOVE9 sur le testnet A1 n’a aucune valeur réelle — il existe pour que vous puissiez payer le gaz pendant vos tests. Saisissez une adresse de portefeuille, nous envoyons aussitôt.',
    nhanDiaChi: 'Votre adresse de portefeuille',
    goiYDiaChi: '0x… (40 caractères hexadécimaux)',
    nutXin: 'Envoyez-moi des jetons',
    dangGui: 'Envoi…',
    danChoDiaChi: 'Collez l’adresse du portefeuille qui doit recevoir les jetons. Appuyez sur « Ajouter le réseau au portefeuille » ci-dessus si ce n’est pas encore fait.',
    themMang: 'Ajouter le réseau au portefeuille',
    themMangXong: 'Ajouté au portefeuille',
    themMangTuChoi: 'Vous avez appuyé sur refuser dans votre portefeuille. Appuyez de nouveau si vous voulez ajouter le réseau.',
    themMangLoi: 'Votre portefeuille n’a pas pu ajouter le réseau. Ajoutez-le manuellement avec les paramètres ci-contre — et envoyez la ligne ci-dessous à l’équipe :',
    khongCoVi: 'Aucun portefeuille détecté dans ce navigateur. Installez MetaMask puis rechargez la page.',
    hanMucConLai: 'Quota restant',
    hanMucCachDoc: '{con}/{tong} demandes par {gio} heures',
    hanMucHet: 'Vous avez utilisé tout votre quota. Réessayez dans {phut} minutes.',
    hanMucKhongDoc: 'Impossible de lire votre quota — vous pouvez quand même faire une demande, vous ne saurez simplement pas combien il en reste.',
    thanhCong: '{so} {kyHieu} envoyés à {diaChi}',
    xemGiaoDich: 'Voir la transaction',
    thongSoMang: 'Paramètres réseau',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Symbole',
    thongSoThapPhan: 'Décimales',
    thongSoExplorer: 'Explorateur',
    thapPhanGiaiThich:
      'Les portefeuilles affichent 18 décimales parce que la C-Chain exécute l’EVM. Sur la P/X-Chain, ' +
      'LOVE9 se compte en 9 décimales. Une seule pièce, deux échelles — pas deux jetons différents.',
    loiChung: 'Envoi impossible. {chiTiet}',
  },

  chonNgonNgu: {
    nhan: 'Langue',
    mayDich: 'automatique',
    mayDichGiaiThich: 'Seul le vietnamien a été relu par une personne. Les autres traductions sont automatiques et peuvent comporter des erreurs — l’anglais fait référence.',
    chuaCo: 'pas encore disponible',
  },

  loi: {
    khongKetNoi: 'Impossible de joindre le réseau',
    khongKetNoiMoTa: 'Le réseau est peut-être occupé, ou votre connexion a été coupée.',
    trongRong: 'Rien ici pour l’instant',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'Cette page n’existe pas',
    moTa: 'L’adresse que vous avez ouverte n’existe pas sur 9Chain Testnet A1. Elle a peut-être été renommée, ou l’URL a perdu quelques caractères à la copie.',
    dayLaGi: 'Les trois pages les plus utilisées :',
    nhanNav: 'Où aller ensuite',
    veTrangChu: 'Retour à l’accueil',
    diFaucet: 'Obtenir des jetons de test',
    diDeChain: 'Lancez votre chaîne',
    timGiaoDich: 'Vous cherchez une transaction ou une adresse ? Vérifiez l’empreinte et réessayez.',
  },
};

export default fr;
