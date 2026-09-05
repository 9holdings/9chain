import type { Dict } from '../en';

/**
 * Español — traducción automática, sin revisión humana.
 * El idioma de origen es el inglés (`../en.ts`); en caso de discrepancia, prevalece el inglés.
 *
 * 🔴 No suavices estas tres partes: `reGenesis.*` (la red será borrada),
 * `deChain.soatMoTa` (puerta de sentido único), `chainCuaToi.thuHoiY*` (revocar no
 * devuelve el nombre). Dicen "permanente" y "no se puede cambiar" para evitar que
 * alguien pierda sus activos creyendo que hay marcha atrás.
 */
export const es: Dict = {
  common: {
    productName: '9Chain Testnet A1',
    shortDesc: 'Testnet pública de 9Chain — una red independiente que ejecuta el motor Avalanche',
    tagline: 'una red independiente con el motor Avalanche',
    walletRejected: 'Rechazaste la solicitud en tu monedero. No ha cambiado nada.',
    noWalletMobile: 'El navegador del teléfono no puede tener una extensión de monedero. Abre esta página dentro de la app MetaMask: su navegador integrado ya tiene el monedero.',
    openInMetaMask: 'Abrir en la app MetaMask',
    loading: 'Cargando…',
    retry: 'Reintentar',
    copy: 'Copiar',
    copied: 'Copiado',
    close: 'Cerrar',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    switchToDark: 'Cambiar a modo oscuro',
    switchToLight: 'Cambiar a modo claro',
    skipToContent: 'Saltar al contenido principal',
    stepDone: ' — hecho',
    stepRunning: ' — en marcha',
    stepFailed: ' — falló',
    stepPending: ' — pendiente',
  },

  presets: {
    standard: {
      name: 'Estándar',
      desc: 'Una cadena EVM normal. El propietario recibe todos los tokens del génesis y el derecho a cambiar las comisiones.',
    },
    'zero-fee': {
      name: 'Comisiones casi nulas',
      desc: 'baseFee = 1 wei, así que una transacción paga exactamente ese mínimo (una transferencia cuesta 0,000000000000021 LOVE9). Ideal para juegos, experimentos y cadenas internas. A cambio: casi nada frena el spam.',
    },
    'high-throughput': {
      name: 'Alto rendimiento',
      desc: 'Cinco veces más transacciones por bloque (gasLimit de 60 millones en vez de 12). Ideal para juegos, exchanges y cualquier cosa con un flujo constante de transacciones pequeñas. A cambio: bloques más pesados, y quien opere un nodo de esta cadena necesita una máquina más potente.',
    },
    mintable: {
      name: 'Suministro acuñable',
      desc: 'El propietario puede acuñar más token nativo en cualquier momento mediante el precompilado 0x0200000000000000000000000000000000000001. El suministro NO es fijo: quien use esta cadena debe saberlo.',
    },
    'owner-deploy-only': {
      name: 'Despliegue de contratos solo por el propietario',
      desc: 'Los demás pueden seguir enviando transacciones y usar los contratos existentes, pero no desplegar los suyos. El propietario concede ese derecho a quien quiera mediante el precompilado 0x0200000000000000000000000000000000000000.',
    },
    permissioned: {
      name: 'Con permisos (solo remitentes aprobados)',
      desc: 'Solo las direcciones de la lista pueden ENVIAR transacciones. Adecuado para la cadena interna de una empresa. ⚠️ Es el preajuste más estricto: un monedero desconocido que llegue aquí no puede hacer nada.',
    },
  },
  steps: {
    genesis: 'Construyendo el génesis',
    subnet: 'Creando la subred y la cadena en la P-Chain',
    rpc: 'Esperando a que responda el RPC de la L1',
  },

  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',
    banner: 'A1 se reconstruyó el {date}. Todos los saldos y cadenas creados antes de esa fecha ya no existen.',
    bannerLink: 'Qué significa esto',
    badge: 'Reconstruida',
    title: 'A1 se reconstruyó el {date}',
    desc:
      'La red de pruebas A1 se ha reconstruido desde el bloque 0. Las cadenas, los saldos y el ' +
      'historial de transacciones creados antes de esa fecha ya no existen: no están ocultos, ' +
      'desaparecieron. Esta página explica qué estás viendo y qué hacer.',
    willSeeTitle: 'Qué vas a ver',
    willSee1:
      'Tu monedero sigue conectando, sigue mostrando el nombre de red correcto y el mismo Chain ID ' +
      '{chainId}: fue deliberado. Pero tu saldo será 0.',
    willSee2:
      'Todas las L1 que lanzaste desaparecieron del directorio. Sus nombres y Chain ID quedaron ' +
      'libres, y cualquiera puede reclamarlos.',
    willSee3:
      'Si firmaste una transacción pero nunca la transmitiste, no la transmitas ahora: pertenece ' +
      'a una red que ya no existe.',
    toDoTitle: 'Qué debes hacer',
    toDo1: 'Vuelve a pedir tokens de prueba en el grifo. Los límites se reiniciaron para todos.',
    toDo2:
      'Elimina de tu monedero cada L1 antigua por separado: tienen su propio Chain ID y ahora ' +
      'apuntan al vacío. La red principal A1 NO hace falta eliminarla; su configuración no cambió.',
    toDo3: 'Vuelve a lanzar tu cadena si la necesitas. Puede que otra persona haya tomado el nombre anterior.',
    archiveTitle: 'Archivo de la red anterior',
    archiveDesc:
      'El estado final de la red antes de la reconstrucción se exportó y se publicó su hash, ' +
      'para que cualquiera que quiera comprobarlo pueda hacerlo.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1 se reconstruye el {date}: todas las cadenas, saldos y transacciones creados antes serán borrados.',
    bannerLink: 'Detalles',
    badge: 'Reconstrucción próxima',
    title: 'A1 se reconstruye el {date}',
    desc:
      'Toda la red de pruebas A1 se reconstruirá desde el bloque 0. Todo lo creado antes de esa ' +
      'fecha desaparecerá: no quedará oculto, dejará de existir. Esta página dice exactamente ' +
      'qué se pierde y qué debes hacer.',
    whyTitle: 'Por qué es necesaria una reconstrucción',
    why1:
      'El génesis de una red es inmutable. Eso es precisamente lo que la hace confiable: nadie, ' +
      'ni siquiera quienes la construyeron, puede cambiar un número una vez escrito en el bloque 0.',
    why2:
      'El precio de eso: cambiar un número dentro del génesis no deja más opción que reconstruir ' +
      'la red desde cero. A1 elevó el suministro total a 9.000.000.000 LOVE9, y hubo que recalcular ' +
      'todo el conjunto de parámetros de staking para que cuadrara.',
    why3:
      'Esto es una testnet, y reconstruir es algo que una testnet puede hacer. De hecho, es la ' +
      'razón por la que existen las testnets: para que cambios como este ocurran aquí y no en mainnet.',
    lostTitle: 'Qué se perderá',
    lostDesc: 'Todo, sin excepción:',
    lost1: 'Todas las L1 lanzadas por usuarios, incluidas las cadenas que funcionan perfectamente.',
    lost2: 'Todos los saldos de LOVE9, incluidos los tokens recibidos del grifo.',
    lost3: 'Todas las transacciones, todos los bloques y el historial completo de la C-Chain, la P-Chain y la X-Chain.',
    lost4: 'Todos los validadores y todas las delegaciones.',
    keptTitle: 'Qué se conserva',
    keptDesc:
      'Antes del borrado, toda la red que va a morir se exportará con un hash publicado, para que ' +
      'el registro siga siendo verificable. Lo que ocurrió podrá comprobarse incluso cuando la red ' +
      'que lo ejecutó ya no esté. El enlace del archivo se publicará aquí el día de la reconstrucción.',
    toDoTitle: 'Qué debes hacer',
    toDoBefore: 'Antes de la reconstrucción:',
    toDo1:
      'No construyas ahora nada en A1 que dependa de que los datos sobrevivan. Si estás probando ' +
      'una idea, adelante: solo no trates la cadena actual como almacenamiento.',
    toDoAfter: 'Después de la reconstrucción:',
    toDo2:
      'Elimina de tu monedero cada L1 que añadiste por separado: esas cadenas ya no existen, y un ' +
      'monedero que apunte a ellas simplemente se quedará quieto. La red principal A1 no necesita ' +
      'eliminarse: su configuración no cambió.',
    toDo3:
      'Si tu monedero aún no tiene la red A1, añádela con el botón de la página del grifo en lugar ' +
      'de escribir la configuración a mano.',
    toDo4: 'Vuelve a pedir tokens en el grifo y lanza de nuevo tu cadena si la quieres.',
    silentTitle: 'Tu monedero no te avisará',
    silentDesc:
      'La nueva red conserva el Chain ID {chainId}, la misma dirección RPC y el mismo nombre que la ' +
      'anterior. Fue deliberado, para que cada documento y guía ya publicados sigan siendo correctos. ' +
      'El precio es que tu monedero no tiene ninguna señal de que acaba de conectarse a una red ' +
      'distinta. Por eso las dos cosas siguientes ocurrirán en silencio.',
    silent1:
      'Un monedero con la configuración antigua sigue conectando, sigue mostrando el nombre de red ' +
      'correcto y reportará un saldo de 0. Ese número es CORRECTO: tus tokens antiguos ya no existen, ' +
      'no están ocultos. No necesitas volver a añadir la red: solo pide tokens nuevos en el grifo. ' +
      'Si tu monedero informa de una transacción atascada o de un número de secuencia erróneo, borra ' +
      'los datos de actividad de esa red en el monedero: todavía recuerda el contador de transacciones ' +
      'de una cadena muerta, mientras que la nueva cuenta desde 0.',
    silent2:
      'Si aún conservas una transacción firmada que nunca transmitiste, descártala. La firma sigue ' +
      'siendo válida en la nueva red porque el Chain ID no cambió. Fallará mientras el monedero esté ' +
      'vacío, pero en cuanto pidas tokens en el grifo se volverá ejecutable, y podría pasar en un ' +
      'momento que no esperas.',
    repeatTitle: '¿Volverá a pasar?',
    repeatDesc:
      'Es posible. A1 sigue siendo una testnet y, hasta que la comunidad elija una dirección de ' +
      'mainnet entre A1 y C1, nos reservamos el derecho de reconstruir la red cuando algo dentro del ' +
      'génesis tenga que cambiar. Lo que sí prometemos es avisarte con antelación y decir claramente ' +
      'qué se pierde.',
    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    alreadyTitle: 'Ya se reconstruyó una vez el 2026-08-27',
    alreadyDesc:
      'A1 ya se reconstruyó una vez el 2026-08-27, antes de la fecha indicada abajo. Si tenías tokens de prueba antes de eso, tu saldo ahora es 0: eso es correcto, no es un fallo de tu monedero. No se perdió ninguna cadena de usuario: el directorio solo contenía cadenas de prueba automatizadas. Vuelve a pedir tokens en el grifo.',
    dateNote: 'La fecha puede moverse',
    dateNoteDesc:
      'La fecha {date} depende de una comprobación previa. Si se retrasa, cambiaremos la fecha en ' +
      'esta página en lugar de guardar silencio.',
  },

  footer: {
    tryIt: 'Pruébalo',
    explore: 'Explorar',
    about: 'Acerca de',
    explorer: 'Explorador 9Scan-A1',
    mainSite: 'Sitio principal de 9Chain',
    opensNewTab: '(se abre en una pestaña nueva)',
    navLabel: 'Enlaces del pie de página',
    rebuildPlan: 'Plan de reconstrucción de la red',
  },

  nav: {
    home: 'Inicio',
    faucet: 'Obtener tokens de prueba',
    launch: 'Lanzar una cadena',
    myChains: 'Mis cadenas',
    compare: 'A1 ↔ C1',
    directory: 'Directorio de L1',
    explorer: 'Explorador',
    explorerAria: 'Abrir 9Scan-A1 en una pestaña nueva',
    ceremony: "Ceremonia",
  },

  home: {
    testnetBadge: 'Testnet — los tokens no tienen valor real',
    primaryCta: 'Lanza tu cadena',
    secondaryCta: 'Consigue primero tokens de prueba',
    title: 'Lanza tu propia cadena en A1',
    subtitle: 'Una L1 tuya, propiedad del monedero con el que firmas, funcionando de verdad en la red de pruebas. Tarda unos tres minutos.',
    tableCaption: 'Cada fila es una cadena real funcionando en A1, con su propio propietario.',
    colChain: 'Cadena',
    colType: 'Tipo',
    colOwner: 'Propietario',
    systemDefault: 'predeterminado del sistema',
    emptyTitle: 'Todavía no hay ninguna L1 en funcionamiento',
    emptyDesc: 'Serías el primero. El directorio se actualiza en cuanto tu cadena esté activa.',
    moreChains: 'Ver las {count} cadenas en el directorio',
    disclosure: '9 de los 11 validadores se ejecutan en el mismo servidor y con el mismo proveedor; los otros dos se unieron desde otro sitio y solo uno de ellos está en línea: descentralizado en el nivel del protocolo, todavía no en el de la infraestructura.',
    idleBlocksNote: 'Avalanche no produce bloques vacíos, así que una altura de bloque que no se mueve mientras nadie transacciona es normal. La medida de actividad es el número de validadores que aparece al lado.',
  },

  stats: {
    title: 'La red está activa',
    validators: 'Validadores conectados',
    l1Count: 'L1 en funcionamiento',
    blockHeight: 'Bloque de la C-Chain',
    measuring: 'Midiendo la red…',
    cannotMeasure: 'No se pudieron leer las estadísticas de la red',
    cannotMeasureDesc: 'La página sigue funcionando: esto es solo la vista de estado.',
  },
  directory: {
    lede: 'Todas las cadenas de la testnet A1 y el estado real de cada una.',
    howToTitle: 'Cómo leer esta tabla.',
    howToBody: 'Avalanche no produce bloques vacíos: una cadena solo produce uno cuando hay una transacción, así que un contador de bloques que no se mueve es normal y no significa que la cadena esté muerta. El caso peligroso es el contrario: una cadena sin validadores sigue respondiendo a RPC, sigue permitiendo leer saldos y las carteras siguen conectándose, pero cada transacción queda colgada para siempre. Por eso la verdadera señal de vida aquí es el número de validadores de la subred, leído directamente de la P-Chain, no la altura de bloque.',
    ownerTitle: 'El propietario (admin)',
    ownerBody: 'es la dirección indicada al lanzar la cadena. Tiene todo el suministro de génesis y el derecho a cambiar las comisiones de esa cadena: la cadena les pertenece, no a la fundación. Las cadenas lanzadas antes de que la consola tuviera este campo muestran un valor por defecto del sistema.',
    mainNetwork: 'RED PRINCIPAL',
    mainNetworkDesc: 'La C-Chain de la testnet A1, donde funcionan el faucet y el explorador.',
    running: 'EN MARCHA',
    notAnswering: 'NO RESPONDE',
    notAnsweringDesc: 'El RPC no responde: puede que ningún nodo esté siguiendo aún esta subred.',
    unclear: 'SIN CLARIDAD',
    unclearDesc: 'No se pudo leer el conjunto de validadores desde la P-Chain.',
    ownerAdmin: 'Propietario (admin)',
    blocks: 'Bloques',
    subnetValidators: 'Validadores de la subred',
    created: 'Creada',
    revokedAt: 'Revocada el',
    copyOwner: 'Copiar dirección del propietario',
    revoked: 'REVOCADA',
    revokedDesc: 'Esta cadena ha dejado de servir: ningún nodo la ejecuta ya y su RPC no responde. Si añadiste esta red a una cartera, quítala: dejarla solo produce errores de conexión.',
    neverReissued: 'nunca se reasigna a otra cadena',
    revokedGroup: 'Revocadas ({count})',
    listError: 'No se pudo leer la lista de cadenas ({error}). La red principal se sigue mostrando abajo.',
    footSummary: '{count} L1 en marcha + la red principal',
    footRevoked: '{count} revocadas',
    footUpdated: 'actualizado a las {time}',
    tileTotal: 'L1 en el directorio',
    tileRunning: 'Medidas en marcha',
    tileAttention: 'Requieren atención',
    tileRevoked: 'Revocadas',
    sweepProgress: 'Medidas {done} de {total}',
    measuringDesc: 'En cola para medir.',
    howToToggle: 'Cómo leer esta lista',
    searchLabel: 'Buscar',
    searchPlaceholder: 'Nombre, Chain ID, propietario o blockchain ID',
    filterStatus: 'Estado',
    filterAll: 'Todas',
    filterRunning: 'En marcha',
    filterAttention: 'Requieren atención',
    filterRevoked: 'Revocadas',
    filterType: 'Tipo',
    filterTypeAll: 'Todos los tipos',
    groupBy: 'Agrupar por',
    groupNone: 'Sin agrupar',
    groupOwner: 'Propietario',
    groupType: 'Tipo',
    groupStatus: 'Estado',
    groupNoType: 'Sin tipo registrado',
    groupCount: '{shown} de {total}',
    sortBy: 'Ordenar',
    sortNewest: 'Más recientes primero',
    sortOldest: 'Más antiguas primero',
    sortName: 'Nombre',
    sortChainId: 'Chain ID',
    sortBlocks: 'Más bloques',
    refresh: 'Medir de nuevo',
    listCaption: 'Cadenas en A1, con el estado medido de cada una',
    showing: 'Mostrando {shown} de {total}',
    showMore: 'Mostrar {count} más',
    noMatchTitle: 'Ninguna cadena coincide',
    noMatchDesc: 'Prueba otro término o borra los filtros.',
    clearFilters: 'Borrar filtros',
    showDetails: 'Detalles',
    hideDetails: 'Ocultar',
    detailsOf: 'Detalles de {name}',
    nativeToken: 'Token nativo',
    mismatch: 'CADENA INCORRECTA',
    mismatchDesc: 'El RPC respondió con el Chain ID {got} en lugar de {expected}: casi seguro un fallo de enrutamiento, no de esta cadena.',
  },
  ceremony: {
    badge: "Ceremonia",
    title: "La ceremonia 9S Union",
    desc: "En un segundo exacto la red escribe tres bloques con nombre. Esta página dice qué va a ocurrir, qué llevan esos bloques y cómo comprobarlo después sin preguntarnos.",
    momentLabel: "El momento",
    countdownLabel: "Tiempo restante",
    days: "días",
    hours: "horas",
    minutes: "min",
    seconds: "seg",
    yourZone: "Tu zona horaria",
    blocksTitle: "Los tres bloques",
    adamDesc: "El PRIMER bloque cuya marca de tiempo alcanza el momento: definido por el tiempo, no por la altura. Quien produzca ese bloque, lo produce.",
    evaDesc: "El bloque inmediatamente posterior a Adam, por altura.",
    unionDesc: "Diez bloques después de Adam. Aquí queda anclado el mensaje de 9S Union.",
    messagesTitle: "Qué llevan los bloques",
    messagesDesc: "Adam y Eva llevan las dos frases ya escritas en el bloque 0 cuando se creó la red: la ceremonia apunta a esos mismos archivos, así que no pueden separarse. Cada resumen de abajo se congeló el 2026-09-03, antes de la ceremonia, y se puede reproducir con sha256 sobre los bytes en bruto.",
    quietTitle: "Un minuto de silencio",
    quietDesc: "La C-Chain no produce bloques vacíos, así que el tráfico sintético que publicamos en la página en vivo se detiene poco antes del momento. Sin eso, la ceremonia competiría con un emisor automático por una ventana de dos segundos. El coste es un minuto de silencio; lo que compra es que estos bloques pertenezcan a la ceremonia y no a un bot.",
    strangerTitle: "Un desconocido puede quedarse con el bloque, y el registro sigue en pie",
    strangerDesc: "A1 es una red de pruebas pública y cualquiera puede enviar una transacción en ese segundo. El registro está anclado al hash de la transacción de la ceremonia, nunca a una altura de bloque: si el bloque de otra persona alcanza el momento primero, lo escrito sigue siendo cierto; simplemente la ceremonia no produjo ese bloque.",
    checkTitle: "Compruébalo tú mismo",
    checkDesc: "Pide a cualquier nodo de A1 el bloque del momento y lee su marca de tiempo. Nada de esta página hay que aceptarlo por confianza.",
    resultTitle: "Qué quedó registrado",
    resultPending: "Aún no publicado. El paquete de pruebas —el momento, el desfase utilizado, el tráfico de fondo, los tres hashes de transacción, los números de bloque y el resultado de releer los bytes desde la cadena— se publica aquí después de la ceremonia.",
    resultBlock: "Block Adam",
    resultTimestamp: "Su marca de tiempo",
    resultBundle: "Paquete de pruebas",
    reachedNote: "El momento ya pasó. El registro todavía no está publicado aquí: eso ocurre una vez que los bytes se han releído desde la cadena y comprobado contra los resúmenes congelados.",
  },



  loadTest: {
    badge: 'Prueba de carga',
    banner: 'Estamos ejecutando una prueba de carga pública: {tps} transacciones por segundo, generadas por nosotros, no por usuarios reales.',
    bannerLink: 'Ver los datos en vivo',
    title: 'Prueba de carga pública',
    intro: 'A1 es una red de prueba joven con muy pocos usuarios reales, así que por sí sola apenas produce bloques. Generamos un flujo constante de transacciones para que la red esté siempre en funcionamiento y puedas verla trabajar. Este tráfico es nuestro. No es uso real y no lo contamos como tal: abajo aparece cada dirección que lo envía, para que puedas restarlo.',
    running: 'En ejecución',
    stopped: 'No está en ejecución ahora',
    stoppedWhy: 'Motivo registrado: {reason}',
    labelTps: 'Transacciones por segundo',
    labelBlockHeight: 'Bloque de C-Chain',
    labelSecondsPerBlock: 'Segundos por bloque',
    labelTotal: 'Transacciones confirmadas desde el inicio',
    labelUptime: 'En marcha desde hace',
    committedNote: 'Estas cifras se cuentan a partir de los propios bloques, no de lo que intentamos enviar. Una transacción que la red aceptó pero nunca incluyó en un bloque no se cuenta aquí.',
    addressesTitle: 'Las nueve direcciones emisoras',
    addressesNote: 'Cada transacción de estas direcciones la genera una máquina nuestra. Fíltralas para ver la actividad real que haya.',
    measuring: 'Leyendo el estado de la prueba de carga…',
    notMeasured: 'No se pudo leer el estado de la prueba de carga',
    notMeasuredMore: 'La página sigue funcionando: esto es solo la vista de estado.',
  },

  launch: {
    title: 'Lanza tu cadena',
    desc: 'Una L1 dedicada, propiedad de tu monedero. Firmas una vez para probar quién eres, revisas, y la red construye la cadena en unos tres minutos.',
    connectWallet: 'Conectar monedero',
    connecting: 'Conectando…',
    signIn: 'Firmar para entrar',
    signing: 'Esperando la firma…',
    yourWallet: 'Tu monedero',
    youWillOwn: 'La cadena pertenecerá a este monedero. La dirección viene de tu firma: nadie la escribe a mano.',
    noWallet: 'No se encontró ningún monedero en este navegador. Instala MetaMask y recarga la página.',
    signRejected: 'Rechazaste firmar. No se creó nada.',
    switchWallet: 'Usar otro monedero',
    nameLabel: 'Nombre de la cadena',
    namePlaceholder: 'Por ejemplo: MiCadena',
    nameHelp: 'Letras, dígitos y espacios. 2–32 caracteres. En esta red, un nombre que ya se usó nunca se vuelve a emitir, ni siquiera para una cadena revocada.',
    nameInvalid: 'El nombre solo puede contener letras, dígitos y espacios, con una longitud de 2 a 32 caracteres.',
    typeLabel: 'Tipo de cadena',
    typeHelp: 'Una vez elegido queda fijo: el génesis de una cadena no se puede editar.',
    slotsLeft: 'Quedan {left}/{total} plazas',
    slotsFull: 'No quedan plazas',
    slotsFullDesc:
      'El modelo actual hace que cada validador siga todas las L1, y el protocolo expulsa a un nodo ' +
      'que declare más de 16 subredes. Es un techo duro y no se puede subir. Revocar una cadena ' +
      'devuelve una plaza.',
    reviewCta: 'Revisa antes de enviar',
    reviewTitle: 'Revisión: esta es una puerta de sentido único',
    reviewDesc:
      'El génesis de una L1 lanzada es INMUTABLE. Después de este paso no se pueden cambiar el ' +
      'nombre, el tipo de cadena ni el propietario, y revocar tampoco devuelve el nombre ni el Chain ID.',
    reviewRebuild:
      'Una cosa más antes de pulsar: A1 reconstruye toda la red el {date}. La cadena que lances hoy ' +
      'será borrada junto con la red antigua: no oculta, desaparecida.',
    reviewName: 'Nombre de la cadena',
    reviewType: 'Tipo de cadena',
    reviewOwner: 'Propietario',
    reviewBack: 'Volver y editar',
    reviewConfirm: 'Lo he revisado: lanzar la cadena',
    launching: 'Lanzando la cadena «{name}»',
    launchingDesc:
      'Los nodos se reinician DE UNO EN UNO para que la red nunca pierda el quórum: por eso es lento, ' +
      'y es deliberado. No cierres la pestaña; si lo haces, la cadena se construye igualmente.',
    etaRemaining: 'Faltan unos {minutes} minutos',
    preparing: 'Preparando…',
    doneTitle: 'Listo: la cadena «{name}» está funcionando',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Añadir la cadena al monedero',
    doneAdded: 'Añadida al monedero',
    doneActivate: 'Activar la cadena (abrir el bloque 1)',
    doneActivated: 'Activada',
    doneActivating: 'Esperando al monedero…',
    doneAddWalletError: 'No se pudo añadir la cadena a tu monedero. {detail}',
    doneActivateError: 'No se pudo activar la cadena. {detail}',
    launchAnother: 'Lanzar otra cadena',
    launchError: 'No se pudo lanzar la cadena. {detail}',
    unknownError: 'La cadena no apareció en el directorio después de terminar la ejecución.',
    noteTitle: 'La primera transacción de una cadena nueva',
    noteHow: 'No confíes en la estimación de gas de la primera transacción. La forma más barata de abrir el bloque 1 es una transferencia normal: pulsa «Activar la cadena» abajo.',
  },

  myChains: {
    title: 'Mis cadenas',
    desc: 'Las L1 propiedad del monedero con el que iniciaste sesión. Se pueden revocar, pero lee antes la advertencia.',
    connectWallet: 'Conecta tu monedero para ver tus cadenas',
    emptyTitle: 'Este monedero todavía no posee ninguna cadena',
    emptyDesc: 'Lanza una y vuelve: aparecerá aquí de inmediato.',
    emptyCta: 'Lanza tu cadena',
    colChain: 'Cadena',
    colType: 'Tipo',
    colStatus: 'Estado',
    colActions: '',
    validatorCount: '{count} validadores',
    measuring: 'midiendo',
    cannotMeasure: 'no se pudo medir',
    statusHelp: 'Medido por el número de validadores de la subred, no por la altura de bloque.',
    noValidators: '0 validadores',
    noValidatorsDesc:
      'Esta cadena NO puede finalizar ninguna transacción: la subred no tiene validadores. Sigue ' +
      'respondiendo a llamadas RPC y los monederos siguen conectando, así que no hay ninguna otra ' +
      'señal visible.',
    walletSettings: 'Configuración del monedero',
    addToWallet: 'Añadir al monedero',
    addedToWallet: 'Añadida',
    addWalletError: 'No se pudo añadir a tu monedero. {detail}',
    revoke: 'Revocar',
    revokeTitle: '¿Revocar «{name}»?',
    revokeWarn1: 'La cadena deja de servir RPC inmediatamente y desaparece del directorio público.',
    revokeWarn2:
      'Revocar NO elimina la subred en la P-Chain: lo que se creó allí no se puede quitar mientras ' +
      'esta red funcione. Tampoco elimina la red de los monederos de quienes ya añadieron esta cadena.',
    revokeWarn3:
      'El nombre y el Chain ID quedan reservados y NUNCA se vuelven a emitir a nadie en esta red. ' +
      'Reemitir un Chain ID haría que el monedero de un antiguo usuario apuntara en silencio a la ' +
      'cadena de otra persona.',
    revokeWarn4: 'A cambio, se devuelve una de las 15 plazas.',
    revokeTypeLabel: 'Escribe el nombre exacto de la cadena para confirmar',
    revokeNameMismatch: 'No coincide con el nombre de la cadena.',
    revokeConfirm: 'Revocar permanentemente',
    revokeCancel: 'Cancelar',
    revoking: 'Revocando «{name}»: unos tres minutos',
    revokeDone: '«{name}» revocada. Quedan {left}/{total} plazas.',
    revokeError: 'No se pudo revocar. {detail}',
    revokeUnknown: 'La cadena sigue en el directorio después de terminar la ejecución.',
    revokedBadge: 'Revocada',
    revokedDesc: 'El nombre y el Chain ID siguen reservados en esta red.',
  },

  compare: {
    title: 'A1 ↔ C1 — comparación',
    desc:
      '9Chain ejecuta DOS testnets del mismo producto en paralelo, con distinto motor: A1 con el ' +
      'motor Avalanche y C1 con el motor Cosmos. Esta tabla recoge los compromisos entre ambas ' +
      'direcciones, publicada para que cualquiera pueda rebatirla: el lado C1 todavía no tiene ' +
      'mediciones reales.',
    selfScoreTitle: 'Las puntuaciones de abajo son AUTOEVALUADAS por el equipo, no medidas de forma independiente',
    selfScoreDesc:
      'La columna «cómo se mide» indica cómo se comprobó cada criterio. Cualquier criterio sin una ' +
      'medición fechada es un juicio de arquitectura, no un dato. Los pesos los decides tú y la ' +
      'puntuación los sigue.',
    colNo: '#',
    colCriterion: 'Criterio',
    colKind: 'Tipo',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Peso',
    kindArchitecture: 'arquitectura',
    kindLiveData: 'datos reales',
    totalScore: 'Puntuación total con tus pesos',
    tied: 'Empate',
    leads: 'lidera',
    liveDataTitle: 'Datos en vivo',
    a1Validators: 'A1 — validadores conectados',
    a1Chains: 'A1 — L1 en funcionamiento',
    a1Blocks: 'A1 — bloque de la C-Chain',
    c1Unreachable: 'C1 — no accesible',
    c1UnreachableDesc:
      'Hace falta la URL REST de Cosmos de C1 (puerto 1317). La tabla sigue sirviendo: el lado A1 ' +
      'son datos en vivo y el lado C1 es un juicio de arquitectura, como el resto de criterios.',
    measuring: 'midiendo…',
    cannotMeasure: 'no se pudo medir',
    critDecentralisation: 'Descentralización (techo de validadores)',
    noteDecentralisation: 'Techo del PROTOCOLO: Snowman ~miles de nodos frente a CometBFT ~150. A1 HOY: 9 nodos, una máquina, un proveedor',
    critFinality: 'Finalidad',
    noteFinality: '~1–2s frente a ~5–6s',
    critEvmMaturity: 'Madurez de EVM',
    noteEvmMaturity: 'coreth en producción frente a Cosmos EVM pre-v1',
    critWalletCompat: 'Compatibilidad con monederos y DeFi de consumo',
    noteWalletCompat: 'MetaMask/EVM completo',
    critLaunchUx: 'Experiencia al lanzar una cadena',
    noteLaunchUx: 'ambos tienen consola; en A1 se miden ~170s por lanzamiento',
    critInterop: 'Amplitud de la interoperabilidad',
    noteInterop: 'Warp/ICM dentro del ecosistema (A1 ya ha movido activos, M6.2) frente al alcance de IBC',
    critOpCost: 'Coste de operación por cadena',
    noteOpCost: 'nodo + plugin frente a operador de K8s',
    critBootstrap: 'Arranque del efecto red',
    noteBootstrap: 'una isla propia frente a IBC enchufado a la economía de Cosmos',
    critEconSecurity: 'Seguridad económica pública',
    noteEconSecurity: 'PoS respaldado por token desde el principio',
    critSwitchCost: 'Coste de cambio para el equipo',
    noteSwitchCost: 'A1 es nuevo frente a C1 en marcha desde hace meses',
  },

  faucet: {
    title: 'Obtener tokens de prueba',
    desc: 'LOVE9 en la testnet A1 no tiene valor real: existe para que puedas pagar gas mientras pruebas. Introduce una dirección de monedero y te enviamos enseguida.',
    addressLabel: 'Tu dirección de monedero',
    addressFromWallet: 'Rellenado desde la cartera que conectaste. Cámbialo si los tokens deben ir a otra dirección.',
    useWalletAddress: 'Usar la dirección de mi cartera',
    addressPlaceholder: '0x… (40 caracteres hexadecimales)',
    requestCta: 'Envíame tokens',
    sending: 'Enviando…',
    addressHelp: 'Pega la dirección del monedero que debe recibir los tokens. Pulsa «Añadir la red al monedero» arriba si aún no lo has hecho.',
    addNetwork: 'Añadir la red al monedero',
    addNetworkDone: 'Añadida al monedero',
    addNetworkRejected: 'Pulsaste rechazar en tu monedero. Vuelve a pulsar si quieres añadir la red.',
    addNetworkError: 'Tu monedero no pudo añadir la red. Añádela a mano con la configuración de al lado y envía la línea de abajo al equipo:',
    noWallet: 'No se encontró ningún monedero en este navegador. Instala MetaMask y recarga la página.',
    quotaLabel: 'Cuota restante',
    quotaFormat: '{left}/{total} solicitudes cada {hours} horas',
    quotaExhausted: 'Has agotado toda tu cuota. Inténtalo de nuevo en {minutes} minutos.',
    quotaUnreadable: 'No se pudo leer tu cuota: aún puedes solicitar, solo que no sabrás cuántas te quedan.',
    sentOk: 'Se enviaron {count} {symbol} a {address}',
    viewTransaction: 'Ver la transacción',
    settingsTitle: 'Configuración de red',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Símbolo',
    settingsDecimals: 'Decimales',
    settingsExplorer: 'Explorador',
    decimalsHelp:
      'Los monederos muestran 18 decimales porque la C-Chain ejecuta la EVM. En la P/X-Chain, LOVE9 ' +
      'se cuenta con 9 decimales. Una misma moneda, dos escalas: no son dos tokens distintos.',
    genericError: 'No se pudo enviar. {detail}',
  },

  langPicker: {
    label: 'Idioma',
    machineBadge: 'automática',
    machineNote: 'Solo el vietnamita ha sido revisado por una persona. Las demás traducciones son automáticas y pueden contener errores; el inglés es la versión de referencia.',
    notAvailable: 'aún no disponible',
  },

  errors: {
    unreachable: 'No se pudo llegar a la red',
    unreachableDesc: 'Puede que la red esté ocupada o que tu conexión se haya cortado.',
    empty: 'Aquí todavía no hay nada',
    addressEmpty: '{label} no puede estar vacío',
    addressFormat: '{label} debe ser 0x seguido de 40 caracteres hexadecimales',
    addressChecksum: '{label} no pasa su suma de verificación EIP-55: lo más probable es que se haya escrito mal un carácter o se haya perdido al pegar',
    addressZero: '{label} no puede ser la dirección cero: nadie tiene su clave',
    timeout: 'Sin respuesta después de {seconds}s',
    notJson: 'La respuesta no era JSON (HTTP {status}): lo más probable es que la petición se haya dirigido al lugar equivocado',
    noWallet: 'No se encontró ninguna cartera en este navegador.',
  },

  notFound: {
    code: '404',
    title: 'Esta página no existe',
    desc: 'La dirección que abriste no existe en 9Chain Testnet A1. Puede que la hayan renombrado, o que la URL haya perdido algunos caracteres al copiarla.',
    topPagesTitle: 'Las tres páginas más usadas:',
    navLabel: 'A dónde ir',
    goHome: 'Volver al inicio',
    goFaucet: 'Obtener tokens de prueba',
    goLaunch: 'Lanza tu cadena',
    lookingForTx: '¿Buscas una transacción o una dirección? Comprueba el hash e inténtalo de nuevo.',
  },
};

export default es;
