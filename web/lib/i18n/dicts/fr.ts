import type { Dict } from '../en';

/**
 * Français — traduction automatique, non relue par un humain.
 * La langue source est l'anglais (`../en.ts`) ; en cas de divergence, l'anglais fait foi.
 *
 * 🔴 N'adoucissez pas ces trois passages : `reGenesis.*` (le réseau sera effacé),
 * `deChain.soatMoTa` (porte à sens unique), `chainCuaToi.thuHoiY*` (révoquer ne rend
 * pas le nom). Ils disent « définitif » et « ne peut pas être modifié » pour éviter
 * qu'on perde ses actifs en croyant pouvoir revenir en arrière.
 */
export const fr: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: 'Le testnet public de 9Chain — un réseau indépendant fonctionnant avec le moteur Avalanche',
    tagline: 'un réseau indépendant sur le moteur Avalanche',
    walletRejected: 'Vous avez refusé la demande dans votre portefeuille. Rien n’a changé.',
    noWalletMobile: "Le navigateur d'un téléphone ne peut pas accueillir d'extension de portefeuille. Ouvrez plutôt cette page dans l'application MetaMask : son navigateur intégré contient le portefeuille.",
    openInMetaMask: "Ouvrir dans l'application MetaMask",
    loading: 'Chargement…',
    retry: 'Réessayer',
    copy: 'Copier',
    copied: 'Copié',
    close: 'Fermer',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    switchToDark: 'Passer en mode sombre',
    switchToLight: 'Passer en mode clair',
    skipToContent: 'Aller au contenu principal',
    stepDone: ' — terminé',
    stepRunning: ' — en cours',
    stepFailed: ' — échec',
    stepPending: ' — en attente',
  },

  presets: {
    standard: {
      name: 'Standard',
      desc: 'Une chaîne EVM ordinaire. Le propriétaire reçoit tous les jetons du genesis et le droit de modifier les frais.',
    },
    'zero-fee': {
      name: 'Frais quasi nuls',
      desc: 'baseFee = 1 wei : une transaction paie exactement ce plancher (un transfert coûte 0,000000000000021 LOVE9). Idéal pour les jeux, les expériences et les chaînes internes. En contrepartie, presque rien ne freine le spam.',
    },
    'high-throughput': {
      name: 'Haut débit',
      desc: "Cinq fois plus de transactions par bloc (gasLimit de 60 millions au lieu de 12). Idéal pour les jeux, les plateformes d'échange et tout flux régulier de petites transactions. En contrepartie : des blocs plus lourds, et quiconque fait tourner un nœud de cette chaîne a besoin d'une machine plus puissante.",
    },
    mintable: {
      name: 'Offre émettable',
      desc: "Le propriétaire peut émettre davantage de jeton natif à tout moment via le précompilé 0x0200000000000000000000000000000000000001. L'offre n'est PAS fixe — quiconque utilise cette chaîne doit le savoir.",
    },
    'owner-deploy-only': {
      name: 'Déploiement de contrats réservé au propriétaire',
      desc: 'Les autres peuvent toujours envoyer des transactions et utiliser les contrats existants, mais pas déployer les leurs. Le propriétaire accorde ce droit à qui il veut via le précompilé 0x0200000000000000000000000000000000000000.',
    },
    permissioned: {
      name: 'Sous permission (expéditeurs approuvés uniquement)',
      desc: "Seules les adresses listées peuvent ENVOYER des transactions. Adapté à la chaîne interne d'une entreprise. ⚠️ C'est le préréglage le plus strict : un portefeuille inconnu qui arrive ici ne peut rien faire.",
    },
  },
  steps: {
    genesis: 'Construction du genesis',
    subnet: 'Création du sous-réseau et de la chaîne sur la P-Chain',
    rpc: 'En attente de réponse du RPC de la L1',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',
    banner: 'A1 a été reconstruit le {date}. Tous les soldes et toutes les chaînes créés avant cette date n’existent plus.',
    bannerLink: 'Ce que cela signifie',
    badge: 'Reconstruit',
    title: 'A1 a été reconstruit le {date}',
    desc:
      'Le réseau de test A1 a été reconstruit depuis le bloc 0. Les chaînes, les soldes et ' +
      'l’historique des transactions créés avant cette date n’existent plus — ils ne sont pas ' +
      'masqués, ils ont disparu. Cette page explique ce que vous voyez et ce qu’il faut faire.',
    willSeeTitle: 'Ce que vous allez voir',
    willSee1:
      'Votre portefeuille se connecte toujours, affiche toujours le bon nom de réseau et le même ' +
      'Chain ID {chainId} — c’était délibéré. Mais votre solde sera de 0.',
    willSee2:
      'Chaque L1 que vous aviez lancée a disparu de l’annuaire. Leurs noms et Chain ID sont de ' +
      'nouveau libres, et n’importe qui peut les prendre.',
    willSee3:
      'Si vous aviez signé une transaction sans jamais la diffuser, ne la diffusez pas maintenant : ' +
      'elle appartient à un réseau qui n’existe plus.',
    toDoTitle: 'Ce que vous devez faire',
    toDo1: 'Redemandez des jetons de test au robinet. Les limites ont été réinitialisées pour tout le monde.',
    toDo2:
      'Supprimez de votre portefeuille chaque ancienne L1 séparément — elles ont leur propre Chain ID ' +
      'et pointent désormais vers le vide. Le réseau principal A1 n’a PAS besoin d’être supprimé ; ' +
      'ses paramètres n’ont pas changé.',
    toDo3: 'Relancez votre chaîne si vous en avez besoin. Quelqu’un d’autre a peut-être pris l’ancien nom.',
    archiveTitle: 'Archive de l’ancien réseau',
    archiveDesc:
      'L’état final du réseau avant la reconstruction a été exporté et son empreinte publiée, afin ' +
      'que toute personne souhaitant vérifier puisse le faire.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1 sera reconstruit le {date} — toutes les chaînes, tous les soldes et toutes les transactions créés avant seront effacés.',
    bannerLink: 'Détails',
    badge: 'Reconstruction à venir',
    title: 'A1 sera reconstruit le {date}',
    desc:
      'L’ensemble du réseau de test A1 sera reconstruit depuis le bloc 0. Tout ce qui a été créé ' +
      'avant cette date disparaîtra — non pas masqué, mais purement et simplement supprimé. Cette ' +
      'page dit exactement ce qui est perdu et ce que vous devez faire.',
    whyTitle: 'Pourquoi une reconstruction est nécessaire',
    why1:
      'Le genesis d’un réseau est immuable. C’est précisément ce qui le rend digne de confiance : ' +
      'personne, pas même ceux qui l’ont construit, ne peut changer un nombre une fois inscrit dans le bloc 0.',
    why2:
      'Le prix à payer : modifier un nombre à l’intérieur du genesis ne laisse d’autre choix que de ' +
      'reconstruire le réseau depuis zéro. A1 a porté l’offre totale à 9 000 000 000 LOVE9, et toute ' +
      'la série de paramètres de staking a dû être recalculée en conséquence.',
    why3:
      'Ceci est un testnet, et reconstruire fait partie de ce qu’un testnet a le droit de faire. ' +
      'C’est même la raison d’être des testnets : que ce genre de changement se produise ici, et non sur le mainnet.',
    lostTitle: 'Ce qui sera perdu',
    lostDesc: 'Tout, sans exception :',
    lost1: 'Chaque L1 lancée par un utilisateur, y compris les chaînes qui fonctionnent parfaitement.',
    lost2: 'Chaque solde LOVE9, y compris les jetons reçus du robinet.',
    lost3: 'Chaque transaction, chaque bloc, et tout l’historique de la C-Chain, de la P-Chain et de la X-Chain.',
    lost4: 'Chaque validateur et chaque délégation.',
    keptTitle: 'Ce qui est conservé',
    keptDesc:
      'Avant la suppression, tout le réseau en fin de vie sera exporté avec une empreinte publiée, ' +
      'pour que la trace reste vérifiable. Ce qui s’est produit restera contrôlable, même une fois ' +
      'le réseau qui l’exécutait disparu. Le lien de l’archive sera publié ici le jour de la reconstruction.',
    toDoTitle: 'Ce que vous devez faire',
    toDoBefore: 'Avant la reconstruction :',
    toDo1:
      'Ne construisez rien sur A1 en ce moment qui dépende de la survie des données. Si vous testez ' +
      'une idée, allez-y — ne considérez simplement pas la chaîne actuelle comme un espace de stockage.',
    toDoAfter: 'Après la reconstruction :',
    toDo2:
      'Supprimez de votre portefeuille chaque L1 que vous aviez ajoutée — ces chaînes n’existent plus, ' +
      'et un portefeuille qui pointe vers elles restera simplement inerte. Le réseau principal A1 n’a ' +
      'pas besoin d’être supprimé : ses paramètres n’ont pas changé.',
    toDo3:
      'Si votre portefeuille n’a pas encore le réseau A1, ajoutez-le avec le bouton de la page du ' +
      'robinet plutôt qu’en saisissant les paramètres à la main.',
    toDo4: 'Redemandez des jetons au robinet, et relancez votre chaîne si vous le souhaitez.',
    silentTitle: 'Votre portefeuille ne vous préviendra pas',
    silentDesc:
      'Le nouveau réseau conserve le Chain ID {chainId}, la même adresse RPC et le même nom que ' +
      'l’ancien. C’est délibéré — afin que chaque document et chaque guide déjà publiés restent exacts. ' +
      'Le prix, c’est que votre portefeuille n’a aucun signal indiquant qu’il vient de se connecter à ' +
      'un réseau différent. Les deux choses ci-dessous se produiront donc en silence.',
    silent1:
      'Un portefeuille avec l’ancienne configuration se connecte toujours, affiche toujours le bon nom ' +
      'de réseau, et indiquera un solde de 0. Ce chiffre est CORRECT : vos anciens jetons n’existent ' +
      'plus, ils ne sont pas masqués. Vous n’avez pas besoin de rajouter le réseau — demandez ' +
      'simplement de nouveaux jetons au robinet. Si votre portefeuille signale une transaction bloquée ' +
      'ou un numéro de séquence erroné, effacez les données d’activité de ce réseau dans le ' +
      'portefeuille : il se souvient encore du compteur de transactions d’une chaîne morte, alors que ' +
      'la nouvelle repart de 0.',
    silent2:
      'Si vous détenez encore une transaction signée jamais diffusée, jetez-la. La signature reste ' +
      'valide sur le nouveau réseau, puisque le Chain ID n’a pas changé. Elle échouera tant que le ' +
      'portefeuille est vide — mais dès l’instant où vous demandez des jetons au robinet, elle devient ' +
      'exécutable, et elle peut passer à un moment que vous n’attendez pas.',
    repeatTitle: 'Est-ce que cela se reproduira',
    repeatDesc:
      'C’est possible. A1 reste un testnet et, tant que la communauté n’aura pas choisi une direction ' +
      'de mainnet entre A1 et C1, nous nous réservons le droit de reconstruire le réseau lorsqu’un ' +
      'élément du genesis doit changer. Ce que nous nous engageons à faire, c’est prévenir à l’avance ' +
      'et dire clairement ce qui est perdu.',
    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    alreadyTitle: 'Déjà reconstruit une fois le 2026-08-27',
    alreadyDesc:
      'A1 a déjà été reconstruit une fois le 2026-08-27, avant la date indiquée ci-dessous. Si vous déteniez des jetons de test auparavant, votre solde est désormais de 0 — c’est correct, ce n’est pas une panne de votre portefeuille. Aucune chaîne d’utilisateur n’a été perdue : l’annuaire ne contenait que des chaînes de test automatisées. Redemandez des jetons au robinet.',
    dateNote: 'La date peut glisser',
    dateNoteDesc:
      'La date du {date} dépend d’un contrôle préalable. En cas de report, nous modifierons la date ' +
      'sur cette page plutôt que de rester silencieux.',
  },

  footer: {
    tryIt: 'Essayer',
    explore: 'Explorer',
    about: 'À propos',
    explorer: 'Explorateur 9Scan-A1',
    mainSite: 'Site principal 9Chain',
    opensNewTab: '(s’ouvre dans un nouvel onglet)',
    navLabel: 'Liens du pied de page',
    rebuildPlan: 'Plan de reconstruction du réseau',
  },

  nav: {
    home: 'Accueil',
    faucet: 'Obtenir des jetons de test',
    launch: 'Lancer une chaîne',
    myChains: 'Mes chaînes',
    compare: 'A1 ↔ C1',
    directory: 'Annuaire des L1',
    explorer: 'Explorateur',
    explorerAria: 'Ouvrir 9Scan-A1 dans un nouvel onglet',
    ceremony: "Cérémonie",
  },

  home: {
    testnetBadge: 'Testnet — les jetons n’ont aucune valeur réelle',
    primaryCta: 'Lancez votre chaîne',
    secondaryCta: 'Obtenez d’abord des jetons de test',
    title: 'Lancez votre propre chaîne sur A1',
    subtitle: 'Une L1 à vous, détenue par le portefeuille avec lequel vous signez, qui tourne réellement sur le réseau de test. Environ cinq minutes.',
    tableCaption: 'Chaque ligne est une chaîne réelle qui tourne sur A1, avec son propre propriétaire.',
    colChain: 'Chaîne',
    colType: 'Type',
    colOwner: 'Propriétaire',
    systemDefault: 'valeur par défaut du système',
    emptyTitle: 'Aucune L1 ne tourne pour l’instant',
    emptyDesc: 'Vous seriez le premier. L’annuaire se met à jour dès que votre chaîne est active.',
    moreChains: "Voir les {count} chaînes dans l'annuaire",
    disclosure: '9 des 11 validateurs tournent sur le même serveur, chez le même fournisseur ; les deux autres ont rejoint le réseau depuis ailleurs et un seul d’entre eux est en ligne — décentralisé au niveau du protocole, pas encore au niveau de l’infrastructure.',
    idleBlocksNote: 'Avalanche ne produit pas de blocs vides : une hauteur de bloc qui ne bouge pas alors que personne ne transige est donc normale. La mesure de vivacité, c’est le nombre de validateurs à côté.',
  },

  stats: {
    title: 'Le réseau est actif',
    validators: 'Validateurs connectés',
    l1Count: 'L1 en fonctionnement',
    blockHeight: 'Bloc C-Chain',
    measuring: 'Mesure du réseau…',
    cannotMeasure: 'Impossible de lire les statistiques du réseau',
    cannotMeasureDesc: 'La page fonctionne toujours — ceci n’est que l’affichage de l’état.',
  },
  directory: {
    lede: 'Toutes les chaînes du testnet A1, et l’état réel de chacune.',
    howToTitle: 'Comment lire ce tableau.',
    howToBody: 'Avalanche ne produit pas de blocs vides : une chaîne n’en produit un que lorsqu’il y a une transaction, donc un compteur de blocs qui ne bouge pas est normal et ne signifie pas que la chaîne est morte. Le cas dangereux est l’inverse : une chaîne sans validateurs répond toujours au RPC, laisse toujours lire les soldes, et les portefeuilles s’y connectent toujours — mais chaque transaction reste suspendue indéfiniment. Le vrai signe de vie ici est donc le nombre de validateurs du sous-réseau, lu directement sur la P-Chain, et non la hauteur de bloc.',
    ownerTitle: 'Le propriétaire (admin)',
    ownerBody: 'est l’adresse indiquée au lancement de la chaîne. Il détient toute l’offre de genèse et le droit de modifier les frais de cette chaîne — la chaîne lui appartient, pas à la fondation. Les chaînes lancées avant que la console ait ce champ affichent une valeur par défaut du système.',
    mainNetwork: 'RÉSEAU PRINCIPAL',
    mainNetworkDesc: 'La C-Chain du testnet A1 — là où fonctionnent le faucet et l’explorateur.',
    running: 'EN MARCHE',
    notAnswering: 'NE RÉPOND PAS',
    notAnsweringDesc: 'Le RPC ne répond pas — aucun nœud ne suit peut-être encore ce sous-réseau.',
    unclear: 'INDÉTERMINÉ',
    unclearDesc: 'Impossible de lire l’ensemble des validateurs depuis la P-Chain.',
    ownerAdmin: 'Propriétaire (admin)',
    blocks: 'Blocs',
    subnetValidators: 'Validateurs du sous-réseau',
    created: 'Créée',
    revokedAt: 'Révoquée le',
    copyOwner: 'Copier l’adresse du propriétaire',
    revoked: 'RÉVOQUÉE',
    revokedDesc: 'Cette chaîne ne sert plus : aucun nœud ne l’exécute et son RPC ne répond plus. Si vous avez ajouté ce réseau à un portefeuille, retirez-le — le garder ne produit que des erreurs de connexion.',
    neverReissued: 'jamais réattribuée à une autre chaîne',
    revokedGroup: 'Révoquées ({count})',
    listError: 'Impossible de lire la liste des chaînes ({error}). Le réseau principal reste affiché ci-dessous.',
    footSummary: '{count} L1 en marche + le réseau principal',
    footRevoked: '{count} révoquées',
    footUpdated: 'mis à jour à {time}',
    tileTotal: "L1 dans l'annuaire",
    tileRunning: 'Mesurées en marche',
    tileAttention: 'À surveiller',
    tileRevoked: 'Révoquées',
    sweepProgress: '{done} sur {total} mesurées',
    measuringDesc: 'En attente de mesure.',
    howToToggle: 'Comment lire cette liste',
    searchLabel: 'Rechercher',
    searchPlaceholder: 'Nom, Chain ID, propriétaire ou blockchain ID',
    filterStatus: 'État',
    filterAll: 'Toutes',
    filterRunning: 'En marche',
    filterAttention: 'À surveiller',
    filterRevoked: 'Révoquées',
    filterType: 'Type',
    filterTypeAll: 'Tous les types',
    groupBy: 'Grouper par',
    groupNone: 'Sans groupe',
    groupOwner: 'Propriétaire',
    groupType: 'Type',
    groupStatus: 'État',
    groupNoType: 'Type non renseigné',
    groupCount: '{shown} sur {total}',
    sortBy: 'Trier',
    sortNewest: "Plus récentes d'abord",
    sortOldest: "Plus anciennes d'abord",
    sortName: 'Nom',
    sortChainId: 'Chain ID',
    sortBlocks: 'Le plus de blocs',
    refresh: 'Mesurer à nouveau',
    listCaption: "Chaînes sur A1, avec l'état mesuré de chacune",
    showing: '{shown} sur {total} affichées',
    showMore: 'Afficher {count} de plus',
    noMatchTitle: 'Aucune chaîne ne correspond',
    noMatchDesc: 'Essayez un autre terme ou effacez les filtres.',
    clearFilters: 'Effacer les filtres',
    showDetails: 'Détails',
    hideDetails: 'Masquer',
    detailsOf: 'Détails de {name}',
    nativeToken: 'Jeton natif',
    mismatch: 'MAUVAISE CHAÎNE',
    mismatchDesc: 'Le RPC a répondu avec le Chain ID {got} au lieu de {expected} — très probablement une erreur de routage, pas cette chaîne.',
  },
  ceremony: {
    badge: "Cérémonie",
    title: "La cérémonie Block Adam",
    desc: "À une seconde précise, le réseau écrit trois blocs nommés. Cette page dit ce qui va se passer, ce que portent ces blocs, et comment le vérifier ensuite sans nous le demander.",
    momentLabel: "L'instant",
    countdownLabel: "Temps restant",
    days: "jours",
    hours: "heures",
    minutes: "min",
    seconds: "sec",
    yourZone: "Votre fuseau horaire",
    blocksTitle: "Les trois blocs",
    adamDesc: "Le PREMIER bloc dont l'horodatage atteint l'instant — défini par le temps, non par la hauteur. Quiconque produit ce bloc le produit.",
    evaDesc: "Le bloc qui suit immédiatement Adam, par hauteur.",
    unionDesc: "Dix blocs après Adam. C'est là qu'est ancré le message de 9S Union.",
    messagesTitle: "Ce que portent les blocs",
    messagesDesc: "Adam et Eva portent les deux phrases déjà écrites dans le bloc 0 à la création du réseau : la cérémonie pointe vers ces mêmes fichiers, ils ne peuvent donc pas diverger. Chaque empreinte ci-dessous a été gelée le 2026-09-03, avant la cérémonie, et se reproduit par sha256 sur les octets bruts.",
    quietTitle: "Une minute de silence",
    quietDesc: "La C-Chain ne produit pas de blocs vides : le trafic synthétique que nous publions sur la page en direct est donc arrêté peu avant l'instant. Sans cela, la cérémonie disputerait une fenêtre de deux secondes à un émetteur automatique. Le prix est une minute de silence ; ce qu'il achète, c'est que ces blocs appartiennent à la cérémonie et non à un robot.",
    strangerTitle: "Un inconnu peut prendre le bloc, et le relevé tient toujours",
    strangerDesc: "A1 est un réseau de test public et n'importe qui peut envoyer une transaction à cette seconde. Le relevé est ancré au hash de la transaction de la cérémonie, jamais à une hauteur de bloc : si le bloc de quelqu'un d'autre atteint l'instant en premier, ce qui a été écrit reste vrai ; la cérémonie n'a simplement pas produit ce bloc.",
    checkTitle: "Vérifiez vous-même",
    checkDesc: "Demandez à n'importe quel nœud A1 le bloc à l'instant et lisez son horodatage. Rien ici ne demande d'être cru sur parole.",
    resultTitle: "Ce qui a été enregistré",
    resultPending: "Pas encore publié. Le dossier de preuves — l'instant, le décalage utilisé, le trafic de fond, les trois hashs de transaction, les numéros de bloc et le résultat de la relecture des octets depuis la chaîne — sera publié ici après la cérémonie.",
    resultBlock: "Block Adam",
    resultTimestamp: "Son horodatage",
    resultBundle: "Dossier de preuves",
    reachedNote: "L'instant est passé. Le relevé n'est pas encore publié ici : cela se fait une fois les octets relus depuis la chaîne et comparés aux empreintes gelées.",
  },
  validators: {
    title: "Faire tourner un validateur",
    desc: "La phrase de notre page d'accueil — neuf des validateurs sur une seule machine, chez un seul hébergeur — est la faiblesse honnête de ce réseau, et une personne extérieure avec une machine disponible est la seule chose qui la corrige. Cette page dit ce que cela coûte, et ce que cela ne rapporte pas.",
    liveTitle: "L'ensemble en ce moment",
    liveTotal: "Validateurs",
    liveConnected: "Connectés",
    liveMinBond: "Caution minimale",
    liveAtMinimum: "Au minimum",
    measuredNote: "Lu sur le réseau au chargement de cette page, pas saisi à la main. La caution minimale est compilée dans le binaire du nœud — elle valait 25 000 jusqu'à quelques heures avant la création de ce réseau, donc une page qui la cite de mémoire est à une reconstruction près de se tromper sur de l'argent.",
    costTitle: "Ce que cela coûte",
    costMachine: "Une machine qui reste allumée et une adresse publique dont le port 9651 est joignable de l'extérieur. Aucune candidature, aucune liste blanche, aucune barrière d'autorisation au niveau du protocole — le rôle d'opérateur n'est accordé à personne au génesis, donc tout compte approvisionné peut rejoindre.",
    costBond: "Une caution personnelle, bloquée pour la durée que vous choisissez : 24 heures au minimum, 365 jours au maximum.",
    faucetTitle: "D'où vient le LOVE9, et le piège dans le calcul",
    faucetDesc: "Le robinet est tout le chemin de financement : rien à demander, personne à solliciter. Mais neuf requêtes font exactement la caution, et exactement la caution ne suffit PAS : les transactions qui déplacent votre solde de la C-Chain vers la X-Chain puis la P-Chain, et celle qui dépose la mise, sont payées sur ce même solde. Prévoyez dix requêtes et jusqu'à une heure d'attente pour la limite par IP. Nous le disons ici et non à la fin, parce qu'une version antérieure de notre propre guide affirmait « neuf suffisent » et se corrigeait trois cents lignes plus loin.",
    getTitle: "Ce que vous obtenez",
    getRewards: "Les récompenses exigent 80 % de disponibilité sur la durée — volontairement plus souple que le mainnet Avalanche, parce que le matériel de la communauté n'est pas du matériel de centre de données.",
    getEnd: "Votre mandat se termine et rien ne se renouvelle. La mise revient à l'échéance ; lisez votre propre heure de fin sur la chaîne plutôt que de la calculer.",
    getPrivacy: "Rien ne vous oblige à exposer un RPC, et nous préférerions que vous n'ouvriez pas du tout le port 9650. Votre nœud est à vous.",
    honestTitle: "Ce que cela ne rapporte pas",
    honest1: "LOVE9 est un jeton de test. Il ne vaut rien ici ni ailleurs, personne ne l'achète, et rien ne promet que cela se convertira un jour en quoi que ce soit.",
    honest2: "A1 est un réseau de test, déjà reconstruit deux fois depuis le bloc 0. Si cela se reproduit, votre mise, vos récompenses et l'identité de votre nœud partent avec. Ce que nous promettons, c'est de prévenir à l'avance et de dire clairement ce qui est perdu — c'est toute la promesse.",
    honest3: "Derrière une box, un nœud démarre et valide grâce aux connexions qu'il ouvre lui-même, et paraît en parfaite santé alors que personne ne peut l'atteindre. C'est ainsi que le premier validateur extérieur a terminé un mandat à 14 % de disponibilité, sans rien gagner. Redirigez le port 9651 et déclarez comme adresse publique celle sur laquelle cette redirection répond.",
    stepsTitle: "Le chemin, en six étapes",
    step1: "Récupérez les sources et reconstruisez le fork, puis vérifiez vous-même le hash de l'arbre — et vérifiez qu'une entrée volontairement fausse échoue, pour que la première vérification veuille dire quelque chose.",
    step2: "Construisez l'image du nœud en y inscrivant le commit d'origine.",
    step3: "Récupérez le génesis et une adresse d'amorçage, et vérifiez le hash du génesis avant de lancer quoi que ce soit.",
    step4: "Lancez le nœud. Son identité tient dans trois fichiers : les perdre, c'est laisser votre caution à un nœud qui n'existe plus.",
    step5: "Confirmez que vous êtes sur la bonne chaîne en relisant le nom du réseau et le chain ID, pas en faisant confiance à un 200.",
    step6: "Amenez le LOVE9 sur la P-Chain, puis misez — et vérifiez le résultat sur la chaîne, pas dans la sortie de l'outil.",
    guideCta: "Le guide complet, chaque commande",
    issuesCta: "Signaler un problème",
    issuesNote: "Le suivi des tickets est le canal, et il est public à dessein : un problème de validateur est presque toujours celui que quelqu'un d'autre rencontrera, et une réponse donnée en privé n'aide qu'une personne. Dites-nous ce que vous avez mesuré, pas ce que vous en avez conclu.",
  },
  docs: {
    title: "Documentation",
    desc: "Tout ce qui est écrit sur l'utilisation d'A1 : comment lancer une chaîne, comment faire tourner un validateur, et à quoi sert ce projet. Chaque document renvoie là où il vit réellement, donc ce que vous lisez est la copie que l'on modifie.",
    langNote: "Chaque document est dans la langue indiquée sur sa ligne, et nous ne traduisons pas les documents eux-mêmes. Une copie traduite reste juste jusqu'à ce que quelqu'un corrige une commande dans l'original — et la copie que personne ne modifie est celle qui devient fausse.",
    langLabel: "Langue",
    alsoIn: "Aussi en",
    pdfLabel: "PDF",
    onSiteLabel: "Sur ce site",
    opensGithub: "S'ouvre sur GitHub",
  },
  nineYears: {
    title: "Neuf ans, neuf milliards",
    lede: "Le 2026-09-09, deux phrases entrent dans le premier bloc de 9Chain et neuf années commencent à compter. D'ici 2035, l'ONU prévoit près de neuf milliards d'habitants sur Terre. L'objectif de ces neuf ans : que chacun d'eux possède sa propre chaîne de blocs.",
    oneLine: "Mon IA doit demander la permission — et il existe un endroit qui enregistre qu'elle l'a demandée. Cet endroit est le mien.",
    whatTitle: "Ce qui est en train d'arriver",
    what1: "Plus d'un milliard de personnes utilisent l'IA chaque semaine. Aujourd'hui l'IA répond. Demain elle agit : elle réserve, paie, négocie, signe et vous représente face à l'IA de quelqu'un d'autre.",
    what2: "D'où une question à laquelle l'humanité n'a jamais eu à répondre : qu'est-ce que mon IA a le droit de faire, et qui détient les preuves ? Aujourd'hui la réponse est : l'entreprise qui vous vend l'IA. Elle détient les autorisations, les journaux, et c'est elle l'arbitre quand cela tourne mal.",
    what3: "Une consigne « ne dépense pas plus de vingt dollars » n'est pas une limite : une IA peut être trompée, persuadée, détournée. Une vraie limite vit en dehors de l'IA, là où elle ne peut pas la modifier, et elle vous appartient.",
    promisesTitle: "Cinq promesses",
    promise1: "Souveraineté — personne, pas même 9Chain, ne peut modifier, effacer ou verrouiller votre registre. Ses règles sont les vôtres.",
    promise2: "Permanence — perdre votre téléphone ne fait pas perdre votre registre. Il survit à tout appareil et à toute entreprise.",
    promise3: "Vérifiabilité — vous ne pouvez pas réécrire discrètement le passé, et chacun peut le vérifier. Vos preuves ne sont pas détenues par la partie adverse.",
    promise4: "Portabilité — changez d'hébergeur, de fournisseur, de pays : votre nom et votre historique vous suivent.",
    promise5: "Interopérabilité — votre registre parle aux registres des autres, aux commerces, aux communautés.",
    promiseNot: "Une promesse que nous ne faisons pas : que votre chaîne tourne pour toujours. Ce n'est pas nécessaire. Votre registre dort quand vous dormez, et qui a besoin de le lire lit la copie ancrée.",
    constitutionTitle: "Une constitution, pas une consigne",
    constitutionDesc: "Votre registre porte un contrat qui s'exécute : quelle IA peut signer pour vous, ce qu'elle peut faire, jusqu'à quel montant, jusqu'à quand, et à quel moment elle doit s'arrêter et redemander. Révocable d'un geste, sans la permission de personne. Chaque action laisse un reçu signé et horodaté.",
    constitutionStd: "Un contrat plutôt qu'une instruction, parce qu'un contrat est la seule chose qu'une IA ne peut pas contourner par la parole. Il parle les standards vers lesquels le monde converge déjà, donc l'IA de n'importe quelle entreprise peut le lire : nous n'avons pas inventé de langage privé.",
    treeTitle: "Un arbre, pas une tour",
    treeDesc: "Neuf milliards de registres ne tiennent pas sur un seul réseau. Chaque niveau enregistre et ancre celui du dessous, et vérifie des preuves au lieu de les rejouer : l'arbre grandit en ajoutant des branches, non en épaississant la racine.",
    treeRoot: "Racine — petite, durable, délibérément ennuyeuse. Garde les noms et les ancrages. 9Chain est une racine parmi d'autres.",
    treeTrunk: "Tronc — une région, un pays, une alliance de communautés.",
    treeBranch: "Branche — un club, une école, une entreprise, un quartier, tenu par cette communauté elle-même.",
    treeLeaf: "Feuille — la vôtre. Neuf milliards de feuilles.",
    stagesTitle: "Neuf ans, neuf étapes",
    stage2027: "Les cent premières personnes réelles, dans une communauté réelle, avec des IA travaillant sous une constitution.",
    stage2028: "Dix communautés font tourner leurs propres chaînes, sur trois continents. Les registres survivent aux téléphones perdus.",
    stage2029: "Un standard ouvert, et trois implémentations qui ne sont pas les nôtres.",
    stage2030: "Le premier réseau exécutant le standard sans être opéré par 9Chain. Un million de registres.",
    stage2031: "L'IA qui agit devient la norme — et une IA sans racine d'autorité commence à être refusée.",
    stage2032: "Plusieurs racines, un standard. La gouvernance du standard quitte 9Chain.",
    stage2033: "Les registres voyagent dans les portefeuilles d'identité, les téléphones, les messageries, les plateformes d'IA.",
    stage2034: "Les téléphones sortent d'usine avec un registre. Un milliard en usage réel.",
    stage2035: "Une chaîne par personne. Neuf ans depuis le premier bloc.",
    stagesNote: "Quatre ans pour construire et prouver ; la cinquième année, le monde le rend nécessaire ; quatre ans pendant lesquels d'autres le portent plus loin que nous ne le pourrions. Cette dernière partie est le plan, pas un risque.",
    commitTitle: "Ce que nous nous engageons à ne pas faire",
    commit1: "Nous ne conservons pas vos données. Le registre garde des preuves, pas votre vie privée.",
    commit2: "Nous ne demandons pas vos papiers. L'identité est une affaire entre vous et votre communauté.",
    commit3: "Nous n'effaçons pas. Les noms, les registres et l'historique sont permanents ; ils dorment, ils ne meurent pas.",
    commit4: "Nous ne vous obligeons pas à acheter un jeton pour avoir un registre. Le standard est ouvert ; LOVE9 est le carburant de ce réseau, pas un billet d'entrée.",
    commit5: "Nous ne construisons pas notre propre IA. Nous restons neutres pour que toute IA puisse vous servir sur le même registre.",
    joinTitle: "Neuf ans commencent avec les premières personnes",
    joinDesc: "Aujourd'hui, c'est un réseau de test en fonctionnement, avec ses premiers validateurs extérieurs et ses premières chaînes communautaires. Tout ce qui suit est ouvert, dès maintenant, à quiconque.",
    fullDoc: "Le document complet",
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

  launch: {
    title: 'Lancez votre chaîne',
    desc: 'Une L1 dédiée, détenue par votre portefeuille. Vous signez une fois pour prouver qui vous êtes, vous vérifiez, et le réseau construit la chaîne en cinq minutes environ.',
    connectWallet: 'Connecter le portefeuille',
    connecting: 'Connexion…',
    signIn: 'Signer pour se connecter',
    signing: 'En attente de la signature…',
    yourWallet: 'Votre portefeuille',
    youWillOwn: 'La chaîne appartiendra à ce portefeuille. L’adresse provient de votre signature — personne ne la saisit.',
    noWallet: 'Aucun portefeuille détecté dans ce navigateur. Installez MetaMask puis rechargez la page.',
    signRejected: 'Vous avez refusé de signer. Rien n’a été créé.',
    switchWallet: 'Utiliser un autre portefeuille',
    nameLabel: 'Nom de la chaîne',
    namePlaceholder: 'Par exemple : MaChaine',
    nameHelp: 'Lettres, chiffres et espaces. 2 à 32 caractères. Sur ce réseau, un nom déjà utilisé n’est jamais réattribué — pas même pour une chaîne révoquée.',
    nameInvalid: 'Le nom ne peut contenir que des lettres, des chiffres et des espaces, sur 2 à 32 caractères.',
    typeLabel: 'Type de chaîne',
    typeHelp: 'Une fois choisi, c’est définitif — le genesis d’une chaîne ne peut pas être modifié.',
    slotsLeft: '{left}/{total} places restantes',
    slotsFull: 'Plus aucune place',
    slotsFullDesc:
      'Le modèle actuel fait suivre toutes les L1 par chaque validateur, et le protocole écarte un ' +
      'nœud qui déclare plus de 16 sous-réseaux. C’est un plafond dur, impossible à relever. Révoquer ' +
      'une chaîne restitue une place.',
    reviewCta: 'Vérifiez avant d’envoyer',
    reviewTitle: 'Vérification — c’est une porte à sens unique',
    reviewDesc:
      'Le genesis d’une L1 lancée est IMMUABLE. Après cette étape, le nom, le type de chaîne et le ' +
      'propriétaire ne peuvent plus être modifiés — et une révocation ne rendra ni le nom ni le Chain ID.',
    reviewRebuild:
      'Encore une chose avant de valider : A1 reconstruit tout le réseau le {date}. La chaîne que vous ' +
      'lancez aujourd’hui sera effacée avec l’ancien réseau — non pas masquée, mais supprimée.',
    reviewName: 'Nom de la chaîne',
    reviewType: 'Type de chaîne',
    reviewOwner: 'Propriétaire',
    reviewBack: 'Revenir et modifier',
    reviewConfirm: 'J’ai vérifié — lancer la chaîne',
    launching: 'Lancement de la chaîne « {name} »',
    launchingDesc:
      'Les nœuds redémarrent UN PAR UN pour que le réseau ne perde jamais le quorum — c’est pour cela ' +
      'que c’est lent, et c’est délibéré. Ne fermez pas l’onglet ; si vous le faites, la chaîne est ' +
      'construite quand même.',
    etaRemaining: 'Environ {minutes} minutes restantes',
    preparing: 'Préparation…',
    doneTitle: 'Terminé — la chaîne « {name} » tourne',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Ajouter la chaîne au portefeuille',
    doneAdded: 'Ajoutée au portefeuille',
    doneActivate: 'Activer la chaîne (ouvrir le bloc 1)',
    doneActivated: 'Activée',
    doneActivating: 'En attente du portefeuille…',
    doneAddWalletError: 'Impossible d’ajouter la chaîne à votre portefeuille. {detail}',
    doneActivateError: 'Impossible d’activer la chaîne. {detail}',
    launchAnother: 'Lancer une autre chaîne',
    launchError: 'Impossible de lancer la chaîne. {detail}',
    unknownError: 'La chaîne n’est pas apparue dans l’annuaire après la fin de l’exécution.',
    noteTitle: 'La première transaction d’une nouvelle chaîne',
    noteHow: 'Ne vous fiez pas à l’estimation de gaz de la première transaction. Le moyen le moins coûteux d’ouvrir le bloc 1 est un simple transfert — appuyez sur « Activer la chaîne » ci-dessous.',
  },

  myChains: {
    title: 'Mes chaînes',
    desc: 'Les L1 détenues par le portefeuille avec lequel vous vous êtes connecté. Elles peuvent être révoquées, mais lisez d’abord l’avertissement.',
    connectWallet: 'Connectez votre portefeuille pour voir vos chaînes',
    emptyTitle: 'Ce portefeuille ne possède encore aucune chaîne',
    emptyDesc: 'Lancez-en une puis revenez — elle apparaîtra ici immédiatement.',
    emptyCta: 'Lancez votre chaîne',
    colChain: 'Chaîne',
    colType: 'Type',
    colStatus: 'État',
    colActions: '',
    validatorCount: '{count} validateurs',
    measuring: 'mesure en cours',
    cannotMeasure: 'mesure impossible',
    statusHelp: 'Mesuré par le nombre de validateurs du sous-réseau, et non par la hauteur de bloc.',
    noValidators: '0 validateur',
    noValidatorsDesc:
      'Cette chaîne ne peut finaliser AUCUNE transaction : le sous-réseau n’a pas de validateur. Elle ' +
      'répond toujours aux appels RPC et les portefeuilles s’y connectent toujours, il n’y a donc aucun ' +
      'autre signe visible.',
    walletSettings: 'Paramètres du portefeuille',
    addToWallet: 'Ajouter au portefeuille',
    addedToWallet: 'Ajoutée',
    addWalletError: 'Impossible de l’ajouter à votre portefeuille. {detail}',
    revoke: 'Révoquer',
    revokeTitle: 'Révoquer « {name} » ?',
    revokeWarn1: 'La chaîne cesse immédiatement de servir le RPC et disparaît de l’annuaire public.',
    revokeWarn2:
      'La révocation ne supprime PAS le sous-réseau sur la P-Chain — ce qui y a été créé ne peut pas ' +
      'être retiré tant que ce réseau tourne. Elle ne retire pas non plus le réseau des portefeuilles ' +
      'des personnes ayant déjà ajouté cette chaîne.',
    revokeWarn3:
      'Le nom et le Chain ID restent réservés et ne sont JAMAIS réattribués à quiconque sur ce réseau. ' +
      'Réattribuer un Chain ID ferait pointer en silence le portefeuille d’un ancien utilisateur vers ' +
      'la chaîne de quelqu’un d’autre.',
    revokeWarn4: 'En échange, une place sur les 15 est restituée.',
    revokeTypeLabel: 'Saisissez exactement le nom de la chaîne pour confirmer',
    revokeNameMismatch: 'Cela ne correspond pas au nom de la chaîne.',
    revokeConfirm: 'Révoquer définitivement',
    revokeCancel: 'Annuler',
    revoking: 'Révocation de « {name} » — environ cinq minutes',
    revokeDone: '« {name} » révoquée. {left}/{total} places restantes.',
    revokeError: 'Révocation impossible. {detail}',
    revokeUnknown: 'La chaîne est toujours dans l’annuaire après la fin de l’exécution.',
    revokedBadge: 'Révoquée',
    revokedDesc: 'Le nom et le Chain ID restent réservés sur ce réseau.',
  },

  compare: {
    title: 'A1 ↔ C1 — comparaison',
    desc:
      '9Chain fait tourner DEUX testnets du même produit en parallèle, avec des moteurs différents : ' +
      'A1 sur le moteur Avalanche, C1 sur le moteur Cosmos. Ce tableau consigne les compromis entre ' +
      'les deux directions, publié pour que chacun puisse le contester — le côté C1 n’a pas encore de ' +
      'mesures réelles.',
    selfScoreTitle: 'Les notes ci-dessous sont AUTO-ÉVALUÉES par l’équipe, elles ne sont pas mesurées indépendamment',
    selfScoreDesc:
      'La colonne « comment c’est mesuré » indique comment chaque critère a été vérifié. Tout critère ' +
      'sans mesure datée est un jugement d’architecture, pas une donnée. Les pondérations vous ' +
      'appartiennent — la note suit.',
    colNo: '#',
    colCriterion: 'Critère',
    colKind: 'Type',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Poids',
    kindArchitecture: 'architecture',
    kindLiveData: 'données réelles',
    totalScore: 'Note totale avec vos pondérations',
    tied: 'Égalité',
    leads: 'en tête',
    liveDataTitle: 'Données en direct',
    a1Validators: 'A1 — validateurs connectés',
    a1Chains: 'A1 — L1 en fonctionnement',
    a1Blocks: 'A1 — bloc C-Chain',
    c1Unreachable: 'C1 — injoignable',
    c1UnreachableDesc:
      'L’URL REST Cosmos de C1 (port 1317) est nécessaire. Le tableau reste utilisable : le côté A1 ' +
      'est constitué de données réelles, le côté C1 est un jugement d’architecture comme les autres critères.',
    measuring: 'mesure…',
    cannotMeasure: 'mesure impossible',
    critDecentralisation: 'Décentralisation (plafond de validateurs)',
    noteDecentralisation: 'Plafond du PROTOCOLE : Snowman ~des milliers de nœuds contre CometBFT ~150. A1 AUJOURD’HUI : 9 nœuds, une machine, un fournisseur',
    critFinality: 'Finalité',
    noteFinality: '~1–2s contre ~5–6s',
    critEvmMaturity: 'Maturité de l’EVM',
    noteEvmMaturity: 'coreth en production contre Cosmos EVM pré-v1',
    critWalletCompat: 'Compatibilité portefeuilles / DeFi grand public',
    noteWalletCompat: 'MetaMask/EVM complet',
    critLaunchUx: 'Expérience de lancement d’une chaîne',
    noteLaunchUx: 'les deux ont une console ; A1 mesure ~170s par lancement',
    critInterop: 'Étendue de l’interopérabilité',
    noteInterop: 'Warp/ICM au sein de l’écosystème (A1 a déjà déplacé des actifs, M6.2) contre la portée d’IBC',
    critOpCost: 'Coût d’exploitation par chaîne',
    noteOpCost: 'nœud + plugin contre opérateur K8s',
    critBootstrap: 'Amorçage de l’effet de réseau',
    noteBootstrap: 'une île à soi contre IBC branché sur l’économie Cosmos',
    critEconSecurity: 'Sécurité économique publique',
    noteEconSecurity: 'PoS adossé à un jeton dès le départ',
    critSwitchCost: 'Coût de bascule pour l’équipe',
    noteSwitchCost: 'A1 est neuf contre C1 en service depuis des mois',
  },

  faucet: {
    title: 'Obtenir des jetons de test',
    desc: 'Le LOVE9 sur le testnet A1 n’a aucune valeur réelle — il existe pour que vous puissiez payer le gaz pendant vos tests. Saisissez une adresse de portefeuille, nous envoyons aussitôt.',
    addressLabel: 'Votre adresse de portefeuille',
    addressFromWallet: 'Rempli depuis le portefeuille que vous avez connecté. Modifiez-le si les jetons doivent aller à une autre adresse.',
    useWalletAddress: 'Utiliser l’adresse de mon portefeuille',
    addressPlaceholder: '0x… (40 caractères hexadécimaux)',
    requestCta: 'Envoyez-moi des jetons',
    sending: 'Envoi…',
    addressHelp: 'Collez l’adresse du portefeuille qui doit recevoir les jetons. Appuyez sur « Ajouter le réseau au portefeuille » ci-dessus si ce n’est pas encore fait.',
    addNetwork: 'Ajouter le réseau au portefeuille',
    addNetworkDone: 'Ajouté au portefeuille',
    addNetworkRejected: 'Vous avez appuyé sur refuser dans votre portefeuille. Appuyez de nouveau si vous voulez ajouter le réseau.',
    addNetworkError: 'Votre portefeuille n’a pas pu ajouter le réseau. Ajoutez-le manuellement avec les paramètres ci-contre — et envoyez la ligne ci-dessous à l’équipe :',
    noWallet: 'Aucun portefeuille détecté dans ce navigateur. Installez MetaMask puis rechargez la page.',
    quotaLabel: 'Quota restant',
    quotaFormat: '{left}/{total} demandes par {hours} heures',
    quotaExhausted: 'Vous avez utilisé tout votre quota. Réessayez dans {minutes} minutes.',
    quotaUnreadable: 'Impossible de lire votre quota — vous pouvez quand même faire une demande, vous ne saurez simplement pas combien il en reste.',
    sentOk: '{count} {symbol} envoyés à {address}',
    viewTransaction: 'Voir la transaction',
    settingsTitle: 'Paramètres réseau',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Symbole',
    settingsDecimals: 'Décimales',
    settingsExplorer: 'Explorateur',
    decimalsHelp:
      'Les portefeuilles affichent 18 décimales parce que la C-Chain exécute l’EVM. Sur la P/X-Chain, ' +
      'LOVE9 se compte en 9 décimales. Une seule pièce, deux échelles — pas deux jetons différents.',
    genericError: 'Envoi impossible. {detail}',
  },

  langPicker: {
    label: 'Langue',
    machineBadge: 'automatique',
    machineNote: 'Seul le vietnamien a été relu par une personne. Les autres traductions sont automatiques et peuvent comporter des erreurs — l’anglais fait référence.',
    notAvailable: 'pas encore disponible',
  },

  errors: {
    unreachable: 'Impossible de joindre le réseau',
    unreachableDesc: 'Le réseau est peut-être occupé, ou votre connexion a été coupée.',
    empty: 'Rien ici pour l’instant',
    addressEmpty: '{label} ne peut pas être vide',
    addressFormat: '{label} doit être 0x suivi de 40 caractères hexadécimaux',
    addressChecksum: '{label} ne passe pas sa somme de contrôle EIP-55 — le plus probable est qu’un caractère ait été mal saisi ou perdu au collage',
    addressZero: '{label} ne peut pas être l’adresse zéro — personne n’en détient la clé',
    timeout: 'Aucune réponse après {seconds}s',
    notJson: 'La réponse n’était pas du JSON (HTTP {status}) — la requête a probablement été routée au mauvais endroit',
    noWallet: 'Aucun portefeuille trouvé dans ce navigateur.',
  },

  notFound: {
    code: '404',
    title: 'Cette page n’existe pas',
    desc: 'L’adresse que vous avez ouverte n’existe pas sur 9Chain Testnet A1. Elle a peut-être été renommée, ou l’URL a perdu quelques caractères à la copie.',
    topPagesTitle: 'Les trois pages les plus utilisées :',
    navLabel: 'Où aller ensuite',
    goHome: 'Retour à l’accueil',
    goFaucet: 'Obtenir des jetons de test',
    goLaunch: 'Lancez votre chaîne',
    lookingForTx: 'Vous cherchez une transaction ou une adresse ? Vérifiez l’empreinte et réessayez.',
  },
};

export default fr;
