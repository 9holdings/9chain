import type { Tu } from '../en';

/**
 * Español — traducción automática, sin revisión humana.
 * El idioma de origen es el inglés (`../en.ts`); en caso de discrepancia, prevalece el inglés.
 *
 * 🔴 No suavices estas tres partes: `reGenesis.*` (la red será borrada),
 * `deChain.soatMoTa` (puerta de sentido único), `chainCuaToi.thuHoiY*` (revocar no
 * devuelve el nombre). Dicen "permanente" y "no se puede cambiar" para evitar que
 * alguien pierda sus activos creyendo que hay marcha atrás.
 */
export const es: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'Testnet pública de 9Chain — una red independiente que ejecuta el motor Avalanche',
    tagTitle: 'una red independiente con el motor Avalanche',
    viTuChoi: 'Rechazaste la solicitud en tu monedero. No ha cambiado nada.',
    dangTai: 'Cargando…',
    thuLai: 'Reintentar',
    saoChep: 'Copiar',
    daChep: 'Copiado',
    dong: 'Cerrar',
    moMenu: 'Abrir menú',
    dongMenu: 'Cerrar menú',
    chuyenSangToi: 'Cambiar a modo oscuro',
    chuyenSangSang: 'Cambiar a modo claro',
    boQuaToiNoiDung: 'Saltar al contenido principal',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',
    bang: 'A1 se reconstruyó el {ngay}. Todos los saldos y cadenas creados antes de esa fecha ya no existen.',
    bangNut: 'Qué significa esto',
    nhan: 'Reconstruida',
    tieuDe: 'A1 se reconstruyó el {ngay}',
    moTa:
      'La red de pruebas A1 se ha reconstruido desde el bloque 0. Las cadenas, los saldos y el ' +
      'historial de transacciones creados antes de esa fecha ya no existen: no están ocultos, ' +
      'desaparecieron. Esta página explica qué estás viendo y qué hacer.',
    thayGiTieuDe: 'Qué vas a ver',
    thayGi1:
      'Tu monedero sigue conectando, sigue mostrando el nombre de red correcto y el mismo Chain ID ' +
      '{chainId}: fue deliberado. Pero tu saldo será 0.',
    thayGi2:
      'Todas las L1 que lanzaste desaparecieron del directorio. Sus nombres y Chain ID quedaron ' +
      'libres, y cualquiera puede reclamarlos.',
    thayGi3:
      'Si firmaste una transacción pero nunca la transmitiste, no la transmitas ahora: pertenece ' +
      'a una red que ya no existe.',
    lamGiTieuDe: 'Qué debes hacer',
    lamGi1: 'Vuelve a pedir tokens de prueba en el grifo. Los límites se reiniciaron para todos.',
    lamGi2:
      'Elimina de tu monedero cada L1 antigua por separado: tienen su propio Chain ID y ahora ' +
      'apuntan al vacío. La red principal A1 NO hace falta eliminarla; su configuración no cambió.',
    lamGi3: 'Vuelve a lanzar tu cadena si la necesitas. Puede que otra persona haya tomado el nombre anterior.',
    luuTieuDe: 'Archivo de la red anterior',
    luuMoTa:
      'El estado final de la red antes de la reconstrucción se exportó y se publicó su hash, ' +
      'para que cualquiera que quiera comprobarlo pueda hacerlo.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'A1 se reconstruye el {ngay}: todas las cadenas, saldos y transacciones creados antes serán borrados.',
    bangNut: 'Detalles',
    nhan: 'Reconstrucción próxima',
    tieuDe: 'A1 se reconstruye el {ngay}',
    moTa:
      'Toda la red de pruebas A1 se reconstruirá desde el bloque 0. Todo lo creado antes de esa ' +
      'fecha desaparecerá: no quedará oculto, dejará de existir. Esta página dice exactamente ' +
      'qué se pierde y qué debes hacer.',
    viSaoTieuDe: 'Por qué es necesaria una reconstrucción',
    viSao1:
      'El génesis de una red es inmutable. Eso es precisamente lo que la hace confiable: nadie, ' +
      'ni siquiera quienes la construyeron, puede cambiar un número una vez escrito en el bloque 0.',
    viSao2:
      'El precio de eso: cambiar un número dentro del génesis no deja más opción que reconstruir ' +
      'la red desde cero. A1 elevó el suministro total a 9.000.000.000 LOVE9, y hubo que recalcular ' +
      'todo el conjunto de parámetros de staking para que cuadrara.',
    viSao3:
      'Esto es una testnet, y reconstruir es algo que una testnet puede hacer. De hecho, es la ' +
      'razón por la que existen las testnets: para que cambios como este ocurran aquí y no en mainnet.',
    matTieuDe: 'Qué se perderá',
    matMoTa: 'Todo, sin excepción:',
    mat1: 'Todas las L1 lanzadas por usuarios, incluidas las cadenas que funcionan perfectamente.',
    mat2: 'Todos los saldos de LOVE9, incluidos los tokens recibidos del grifo.',
    mat3: 'Todas las transacciones, todos los bloques y el historial completo de la C-Chain, la P-Chain y la X-Chain.',
    mat4: 'Todos los validadores y todas las delegaciones.',
    conTieuDe: 'Qué se conserva',
    conMoTa:
      'Antes del borrado, toda la red que va a morir se exportará con un hash publicado, para que ' +
      'el registro siga siendo verificable. Lo que ocurrió podrá comprobarse incluso cuando la red ' +
      'que lo ejecutó ya no esté. El enlace del archivo se publicará aquí el día de la reconstrucción.',
    lamTieuDe: 'Qué debes hacer',
    lamTruoc: 'Antes de la reconstrucción:',
    lam1:
      'No construyas ahora nada en A1 que dependa de que los datos sobrevivan. Si estás probando ' +
      'una idea, adelante: solo no trates la cadena actual como almacenamiento.',
    lamSau: 'Después de la reconstrucción:',
    lam2:
      'Elimina de tu monedero cada L1 que añadiste por separado: esas cadenas ya no existen, y un ' +
      'monedero que apunte a ellas simplemente se quedará quieto. La red principal A1 no necesita ' +
      'eliminarse: su configuración no cambió.',
    lam3:
      'Si tu monedero aún no tiene la red A1, añádela con el botón de la página del grifo en lugar ' +
      'de escribir la configuración a mano.',
    lam4: 'Vuelve a pedir tokens en el grifo y lanza de nuevo tu cadena si la quieres.',
    imLangTieuDe: 'Tu monedero no te avisará',
    imLangMoTa:
      'La nueva red conserva el Chain ID {chainId}, la misma dirección RPC y el mismo nombre que la ' +
      'anterior. Fue deliberado, para que cada documento y guía ya publicados sigan siendo correctos. ' +
      'El precio es que tu monedero no tiene ninguna señal de que acaba de conectarse a una red ' +
      'distinta. Por eso las dos cosas siguientes ocurrirán en silencio.',
    imLang1:
      'Un monedero con la configuración antigua sigue conectando, sigue mostrando el nombre de red ' +
      'correcto y reportará un saldo de 0. Ese número es CORRECTO: tus tokens antiguos ya no existen, ' +
      'no están ocultos. No necesitas volver a añadir la red: solo pide tokens nuevos en el grifo. ' +
      'Si tu monedero informa de una transacción atascada o de un número de secuencia erróneo, borra ' +
      'los datos de actividad de esa red en el monedero: todavía recuerda el contador de transacciones ' +
      'de una cadena muerta, mientras que la nueva cuenta desde 0.',
    imLang2:
      'Si aún conservas una transacción firmada que nunca transmitiste, descártala. La firma sigue ' +
      'siendo válida en la nueva red porque el Chain ID no cambió. Fallará mientras el monedero esté ' +
      'vacío, pero en cuanto pidas tokens en el grifo se volverá ejecutable, y podría pasar en un ' +
      'momento que no esperas.',
    lapTieuDe: '¿Volverá a pasar?',
    lapMoTa:
      'Es posible. A1 sigue siendo una testnet y, hasta que la comunidad elija una dirección de ' +
      'mainnet entre A1 y C1, nos reservamos el derecho de reconstruir la red cuando algo dentro del ' +
      'génesis tenga que cambiar. Lo que sí prometemos es avisarte con antelación y decir claramente ' +
      'qué se pierde.',
    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    daXayRaTieuDe: 'Ya se reconstruyó una vez el 2026-08-27',
    daXayRaMoTa:
      'A1 ya se reconstruyó una vez el 2026-08-27, antes de la fecha indicada abajo. Si tenías tokens de prueba antes de eso, tu saldo ahora es 0: eso es correcto, no es un fallo de tu monedero. No se perdió ninguna cadena de usuario: el directorio solo contenía cadenas de prueba automatizadas. Vuelve a pedir tokens en el grifo.',
    ngayLuuY: 'La fecha puede moverse',
    ngayLuuYMoTa:
      'La fecha {ngay} depende de una comprobación previa. Si se retrasa, cambiaremos la fecha en ' +
      'esta página en lugar de guardar silencio.',
  },

  chanTrang: {
    dungThu: 'Pruébalo',
    kham: 'Explorar',
    veDuAn: 'Acerca de',
    explorer: 'Explorador 9Scan-A1',
    trangChinh: 'Sitio principal de 9Chain',
    moTabMoi: '(se abre en una pestaña nueva)',
    nhanNav: 'Enlaces del pie de página',
    reGenesis: 'Plan de reconstrucción de la red',
  },

  dieuHuong: {
    trangChu: 'Inicio',
    faucet: 'Obtener tokens de prueba',
    console: 'Lanzar una cadena',
    chainCuaToi: 'Mis cadenas',
    bang: 'A1 ↔ C1',
    danhBa: 'Directorio de L1',
    explorer: 'Explorador',
    banGiao: 'Abrir 9Scan-A1 en una pestaña nueva',
  },

  trangChu: {
    nhanTestnet: 'Testnet — los tokens no tienen valor real',
    nutChinh: 'Lanza tu cadena',
    nutPhu: 'Consigue primero tokens de prueba',
    cTieuDe: 'Lanza tu propia cadena en A1',
    cPhu: 'Una L1 tuya, propiedad del monedero con el que firmas, funcionando de verdad en la red de pruebas. Tarda unos tres minutos.',
    cBangChuThich: 'Cada fila es una cadena real funcionando en A1, con su propio propietario.',
    cCot: 'Cadena',
    cCotKieu: 'Tipo',
    cCotChu: 'Propietario',
    cMacDinh: 'predeterminado del sistema',
    cTrong: 'Todavía no hay ninguna L1 en funcionamiento',
    cTrongMoTa: 'Serías el primero. El directorio se actualiza en cuanto tu cadena esté activa.',
    tuTo: 'Los 9 validadores funcionan actualmente en el mismo servidor y con el mismo proveedor: descentralizado a nivel de protocolo, todavía no a nivel de infraestructura.',
    blockDungYen: 'Avalanche no produce bloques vacíos, así que una altura de bloque que no se mueve mientras nadie transacciona es normal. La medida de actividad es el número de validadores que aparece al lado.',
  },

  soLieu: {
    tieuDe: 'La red está activa',
    validator: 'Validadores conectados',
    soL1: 'L1 en funcionamiento',
    chieuCao: 'Bloque de la C-Chain',
    dangDo: 'Midiendo la red…',
    khongDo: 'No se pudieron leer las estadísticas de la red',
    khongDoMoTa: 'La página sigue funcionando: esto es solo la vista de estado.',
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

  deChain: {
    tieuDe: 'Lanza tu cadena',
    moTa: 'Una L1 dedicada, propiedad de tu monedero. Firmas una vez para probar quién eres, revisas, y la red construye la cadena en unos tres minutos.',
    noiVi: 'Conectar monedero',
    dangNoi: 'Conectando…',
    kyDeVao: 'Firmar para entrar',
    dangKy: 'Esperando la firma…',
    viCuaBan: 'Tu monedero',
    laChuChain: 'La cadena pertenecerá a este monedero. La dirección viene de tu firma: nadie la escribe a mano.',
    khongCoVi: 'No se encontró ningún monedero en este navegador. Instala MetaMask y recarga la página.',
    tuChoiKy: 'Rechazaste firmar. No se creó nada.',
    doiVi: 'Usar otro monedero',
    nhanTen: 'Nombre de la cadena',
    goiYTen: 'Por ejemplo: MiCadena',
    moTaTen: 'Letras, dígitos y espacios. 2–32 caracteres. En esta red, un nombre que ya se usó nunca se vuelve a emitir, ni siquiera para una cadena revocada.',
    tenXau: 'El nombre solo puede contener letras, dígitos y espacios, con una longitud de 2 a 32 caracteres.',
    nhanKieu: 'Tipo de cadena',
    moTaKieu: 'Una vez elegido queda fijo: el génesis de una cadena no se puede editar.',
    conCho: 'Quedan {con}/{tong} plazas',
    hetCho: 'No quedan plazas',
    hetChoMoTa:
      'El modelo actual hace que cada validador siga todas las L1, y el protocolo expulsa a un nodo ' +
      'que declare más de 16 subredes. Es un techo duro y no se puede subir. Revocar una cadena ' +
      'devuelve una plaza.',
    soatLai: 'Revisa antes de enviar',
    soatTieuDe: 'Revisión: esta es una puerta de sentido único',
    soatMoTa:
      'El génesis de una L1 lanzada es INMUTABLE. Después de este paso no se pueden cambiar el ' +
      'nombre, el tipo de cadena ni el propietario, y revocar tampoco devuelve el nombre ni el Chain ID.',
    soatReGenesis:
      'Una cosa más antes de pulsar: A1 reconstruye toda la red el {ngay}. La cadena que lances hoy ' +
      'será borrada junto con la red antigua: no oculta, desaparecida.',
    soatTen: 'Nombre de la cadena',
    soatKieu: 'Tipo de cadena',
    soatChu: 'Propietario',
    soatQuayLai: 'Volver y editar',
    soatDongY: 'Lo he revisado: lanzar la cadena',
    dangDe: 'Lanzando la cadena «{ten}»',
    dangDeMoTa:
      'Los nodos se reinician DE UNO EN UNO para que la red nunca pierda el quórum: por eso es lento, ' +
      'y es deliberado. No cierres la pestaña; si lo haces, la cadena se construye igualmente.',
    conKhoang: 'Faltan unos {phut} minutos',
    dangChuanBi: 'Preparando…',
    xongTieuDe: 'Listo: la cadena «{ten}» está funcionando',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Añadir la cadena al monedero',
    xongDaThem: 'Añadida al monedero',
    xongKichHoat: 'Activar la cadena (abrir el bloque 1)',
    xongDaKichHoat: 'Activada',
    xongDangKichHoat: 'Esperando al monedero…',
    xongThemViLoi: 'No se pudo añadir la cadena a tu monedero. {chiTiet}',
    xongKichHoatLoi: 'No se pudo activar la cadena. {chiTiet}',
    deTiep: 'Lanzar otra cadena',
    loiDe: 'No se pudo lanzar la cadena. {chiTiet}',
    loiKhongRo: 'La cadena no apareció en el directorio después de terminar la ejecución.',
    luuYTieuDe: 'La primera transacción de una cadena nueva',
    luuYCachLam: 'No confíes en la estimación de gas de la primera transacción. La forma más barata de abrir el bloque 1 es una transferencia normal: pulsa «Activar la cadena» abajo.',
  },

  chainCuaToi: {
    tieuDe: 'Mis cadenas',
    moTa: 'Las L1 propiedad del monedero con el que iniciaste sesión. Se pueden revocar, pero lee antes la advertencia.',
    noiVi: 'Conecta tu monedero para ver tus cadenas',
    trongTieuDe: 'Este monedero todavía no posee ninguna cadena',
    trongMoTa: 'Lanza una y vuelve: aparecerá aquí de inmediato.',
    trongNut: 'Lanza tu cadena',
    cotChain: 'Cadena',
    cotKieu: 'Tipo',
    cotSong: 'Estado',
    cotViec: '',
    songDo: '{so} validadores',
    songDangDo: 'midiendo',
    songKhongDo: 'no se pudo medir',
    songGiaiThich: 'Medido por el número de validadores de la subred, no por la altura de bloque.',
    khongValidator: '0 validadores',
    khongValidatorMoTa:
      'Esta cadena NO puede finalizar ninguna transacción: la subred no tiene validadores. Sigue ' +
      'respondiendo a llamadas RPC y los monederos siguen conectando, así que no hay ninguna otra ' +
      'señal visible.',
    thongSo: 'Configuración del monedero',
    themVaoVi: 'Añadir al monedero',
    daThemVaoVi: 'Añadida',
    themViLoi: 'No se pudo añadir a tu monedero. {chiTiet}',
    thuHoi: 'Revocar',
    thuHoiTieuDe: '¿Revocar «{ten}»?',
    thuHoiY1: 'La cadena deja de servir RPC inmediatamente y desaparece del directorio público.',
    thuHoiY2:
      'Revocar NO elimina la subred en la P-Chain: lo que se creó allí no se puede quitar mientras ' +
      'esta red funcione. Tampoco elimina la red de los monederos de quienes ya añadieron esta cadena.',
    thuHoiY3:
      'El nombre y el Chain ID quedan reservados y NUNCA se vuelven a emitir a nadie en esta red. ' +
      'Reemitir un Chain ID haría que el monedero de un antiguo usuario apuntara en silencio a la ' +
      'cadena de otra persona.',
    thuHoiY4: 'A cambio, se devuelve una de las 15 plazas.',
    thuHoiGoNhan: 'Escribe el nombre exacto de la cadena para confirmar',
    thuHoiSaiTen: 'No coincide con el nombre de la cadena.',
    thuHoiXacNhan: 'Revocar permanentemente',
    thuHoiHuy: 'Cancelar',
    thuHoiDangChay: 'Revocando «{ten}»: unos tres minutos',
    thuHoiXong: '«{ten}» revocada. Quedan {con}/{tong} plazas.',
    thuHoiLoi: 'No se pudo revocar. {chiTiet}',
    thuHoiKhongRo: 'La cadena sigue en el directorio después de terminar la ejecución.',
    daThuHoi: 'Revocada',
    daThuHoiMoTa: 'El nombre y el Chain ID siguen reservados en esta red.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — comparación',
    moTa:
      '9Chain ejecuta DOS testnets del mismo producto en paralelo, con distinto motor: A1 con el ' +
      'motor Avalanche y C1 con el motor Cosmos. Esta tabla recoge los compromisos entre ambas ' +
      'direcciones, publicada para que cualquiera pueda rebatirla: el lado C1 todavía no tiene ' +
      'mediciones reales.',
    tuChamTieuDe: 'Las puntuaciones de abajo son AUTOEVALUADAS por el equipo, no medidas de forma independiente',
    tuChamMoTa:
      'La columna «cómo se mide» indica cómo se comprobó cada criterio. Cualquier criterio sin una ' +
      'medición fechada es un juicio de arquitectura, no un dato. Los pesos los decides tú y la ' +
      'puntuación los sigue.',
    cotSo: '#',
    cotTieuChi: 'Criterio',
    cotLoai: 'Tipo',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Peso',
    loaiKienTruc: 'arquitectura',
    loaiSong: 'datos reales',
    tongDiem: 'Puntuación total con tus pesos',
    hoaNhau: 'Empate',
    dangDan: 'lidera',
    soLieuTieuDe: 'Datos en vivo',
    a1Validator: 'A1 — validadores conectados',
    a1Chain: 'A1 — L1 en funcionamiento',
    a1Block: 'A1 — bloque de la C-Chain',
    c1Vang: 'C1 — no accesible',
    c1VangMoTa:
      'Hace falta la URL REST de Cosmos de C1 (puerto 1317). La tabla sigue sirviendo: el lado A1 ' +
      'son datos en vivo y el lado C1 es un juicio de arquitectura, como el resto de criterios.',
    dangDo: 'midiendo…',
    khongDo: 'no se pudo medir',
  },

  faucet: {
    tieuDe: 'Obtener tokens de prueba',
    moTa: 'LOVE9 en la testnet A1 no tiene valor real: existe para que puedas pagar gas mientras pruebas. Introduce una dirección de monedero y te enviamos enseguida.',
    nhanDiaChi: 'Tu dirección de monedero',
    goiYDiaChi: '0x… (40 caracteres hexadecimales)',
    nutXin: 'Envíame tokens',
    dangGui: 'Enviando…',
    danChoDiaChi: 'Pega la dirección del monedero que debe recibir los tokens. Pulsa «Añadir la red al monedero» arriba si aún no lo has hecho.',
    themMang: 'Añadir la red al monedero',
    themMangXong: 'Añadida al monedero',
    themMangTuChoi: 'Pulsaste rechazar en tu monedero. Vuelve a pulsar si quieres añadir la red.',
    themMangLoi: 'Tu monedero no pudo añadir la red. Añádela a mano con la configuración de al lado y envía la línea de abajo al equipo:',
    khongCoVi: 'No se encontró ningún monedero en este navegador. Instala MetaMask y recarga la página.',
    hanMucConLai: 'Cuota restante',
    hanMucCachDoc: '{con}/{tong} solicitudes cada {gio} horas',
    hanMucHet: 'Has agotado toda tu cuota. Inténtalo de nuevo en {phut} minutos.',
    hanMucKhongDoc: 'No se pudo leer tu cuota: aún puedes solicitar, solo que no sabrás cuántas te quedan.',
    thanhCong: 'Se enviaron {so} {kyHieu} a {diaChi}',
    xemGiaoDich: 'Ver la transacción',
    thongSoMang: 'Configuración de red',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Símbolo',
    thongSoThapPhan: 'Decimales',
    thongSoExplorer: 'Explorador',
    thapPhanGiaiThich:
      'Los monederos muestran 18 decimales porque la C-Chain ejecuta la EVM. En la P/X-Chain, LOVE9 ' +
      'se cuenta con 9 decimales. Una misma moneda, dos escalas: no son dos tokens distintos.',
    loiChung: 'No se pudo enviar. {chiTiet}',
  },

  chonNgonNgu: {
    nhan: 'Idioma',
    mayDich: 'automática',
    mayDichGiaiThich: 'Solo el vietnamita ha sido revisado por una persona. Las demás traducciones son automáticas y pueden contener errores; el inglés es la versión de referencia.',
    chuaCo: 'aún no disponible',
  },

  loi: {
    khongKetNoi: 'No se pudo llegar a la red',
    khongKetNoiMoTa: 'Puede que la red esté ocupada o que tu conexión se haya cortado.',
    trongRong: 'Aquí todavía no hay nada',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'Esta página no existe',
    moTa: 'La dirección que abriste no existe en 9Chain Testnet A1. Puede que la hayan renombrado, o que la URL haya perdido algunos caracteres al copiarla.',
    dayLaGi: 'Las tres páginas más usadas:',
    nhanNav: 'A dónde ir',
    veTrangChu: 'Volver al inicio',
    diFaucet: 'Obtener tokens de prueba',
    diDeChain: 'Lanza tu cadena',
    timGiaoDich: '¿Buscas una transacción o una dirección? Comprueba el hash e inténtalo de nuevo.',
  },
};

export default es;
