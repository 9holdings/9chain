import type { Tu } from '../en';

/**
 * Português — tradução automática, sem revisão humana.
 * O idioma de origem é o inglês (`../en.ts`); em caso de divergência, o inglês prevalece.
 *
 * 🔴 Não suavize estes três trechos: `reGenesis.*` (a rede será apagada),
 * `deChain.soatMoTa` (porta de mão única), `chainCuaToi.thuHoiY*` (revogar não devolve
 * o nome). Eles dizem "permanente" e "não pode ser alterado" para impedir que alguém
 * perca seus ativos achando que dá para voltar atrás.
 */
export const pt: Tu = {
  chung: {
    tenSanPham: '9Chain Testnet A1',
    moTaNgan: 'Testnet pública da 9Chain — uma rede independente rodando o motor Avalanche',
    tagTitle: 'uma rede independente no motor Avalanche',
    viTuChoi: 'Você recusou a solicitação na sua carteira. Nada mudou.',
    dangTai: 'Carregando…',
    thuLai: 'Tentar de novo',
    saoChep: 'Copiar',
    daChep: 'Copiado',
    dong: 'Fechar',
    moMenu: 'Abrir menu',
    dongMenu: 'Fechar menu',
    chuyenSangToi: 'Mudar para o modo escuro',
    chuyenSangSang: 'Mudar para o modo claro',
    boQuaToiNoiDung: 'Pular para o conteúdo principal',
  },

  reGenesisXong: {
    luuUrl: '',
    luuSha256: '',
    bang: 'A A1 foi reconstruída em {ngay}. Todos os saldos e cadeias criados antes dessa data não existem mais.',
    bangNut: 'O que isso significa',
    nhan: 'Reconstruída',
    tieuDe: 'A A1 foi reconstruída em {ngay}',
    moTa:
      'A rede de testes A1 foi reconstruída a partir do bloco 0. Cadeias, saldos e histórico de ' +
      'transações criados antes dessa data não existem mais — não estão ocultos, sumiram. ' +
      'Esta página explica o que você está vendo e o que fazer.',
    thayGiTieuDe: 'O que você vai ver',
    thayGi1:
      'Sua carteira ainda conecta, ainda mostra o nome de rede correto e o mesmo Chain ID ' +
      '{chainId} — isso foi proposital. Mas seu saldo será 0.',
    thayGi2:
      'Todas as L1 que você lançou sumiram do diretório. Os nomes e Chain IDs delas ficaram livres ' +
      'de novo, e qualquer pessoa pode pegá-los.',
    thayGi3:
      'Se você assinou uma transação e nunca a transmitiu, não a transmita agora — ela pertence a ' +
      'uma rede que não existe mais.',
    lamGiTieuDe: 'O que você precisa fazer',
    lamGi1: 'Peça tokens de teste na torneira de novo. Os limites foram zerados para todos.',
    lamGi2:
      'Remova da sua carteira cada L1 antiga separadamente — elas têm Chain IDs próprios e agora ' +
      'apontam para o vazio. A rede principal A1 NÃO precisa ser removida; as configurações dela não mudaram.',
    lamGi3: 'Lance sua cadeia de novo se precisar dela. Outra pessoa pode ter pegado o nome antigo.',
    luuTieuDe: 'Arquivo da rede antiga',
    luuMoTa:
      'O estado final da rede antes da reconstrução foi exportado e o hash publicado, para que ' +
      'qualquer pessoa que queira conferir possa fazê-lo.',
  },

  reGenesis: {
    ngay: '2026-09-01',
    bang: 'A A1 será reconstruída em {ngay} — todas as cadeias, saldos e transações criados antes disso serão apagados.',
    bangNut: 'Detalhes',
    nhan: 'Reconstrução a caminho',
    tieuDe: 'A A1 será reconstruída em {ngay}',
    moTa:
      'Toda a rede de testes A1 será reconstruída a partir do bloco 0. Tudo que foi criado antes ' +
      'dessa data desaparecerá — não ficará oculto, deixará de existir. Esta página diz exatamente ' +
      'o que se perde e o que você precisa fazer.',
    viSaoTieuDe: 'Por que a reconstrução é necessária',
    viSao1:
      'O genesis de uma rede é imutável. É exatamente isso que a torna confiável — ninguém, nem ' +
      'quem a construiu, consegue mudar um número depois de escrito no bloco 0.',
    viSao2:
      'O preço disso: mudar um número dentro do genesis não deixa outra opção senão reconstruir a ' +
      'rede do zero. A A1 elevou o fornecimento total para 9.000.000.000 LOVE9, e toda a faixa de ' +
      'parâmetros de staking teve que ser recalculada para bater.',
    viSao3:
      'Isto é uma testnet, e reconstruir é algo que uma testnet pode fazer. Na verdade é por isso ' +
      'que testnets existem: para que mudanças assim aconteçam aqui, e não na mainnet.',
    matTieuDe: 'O que será perdido',
    matMoTa: 'Tudo, sem exceção:',
    mat1: 'Toda L1 lançada por usuários, inclusive cadeias que estão funcionando muito bem.',
    mat2: 'Todo saldo de LOVE9, inclusive os tokens recebidos da torneira.',
    mat3: 'Toda transação, todo bloco e o histórico inteiro da C-Chain, da P-Chain e da X-Chain.',
    mat4: 'Todo validador e toda delegação.',
    conTieuDe: 'O que fica',
    conMoTa:
      'Antes da exclusão, toda a rede que vai morrer será exportada com um hash publicado, para que ' +
      'o registro continue verificável. O que aconteceu ainda poderá ser conferido, mesmo depois que ' +
      'a rede que o executou tiver sumido. O link do arquivo será publicado aqui no dia da reconstrução.',
    lamTieuDe: 'O que você precisa fazer',
    lamTruoc: 'Antes da reconstrução:',
    lam1:
      'Não construa nada na A1 agora que dependa de os dados sobreviverem. Se você está testando ' +
      'uma ideia, vá em frente — só não trate a cadeia atual como armazenamento.',
    lamSau: 'Depois da reconstrução:',
    lam2:
      'Remova da sua carteira cada L1 que você adicionou — aquelas cadeias não existem mais, e uma ' +
      'carteira apontando para elas vai simplesmente ficar parada. A rede principal A1 não precisa ' +
      'ser removida: as configurações dela não mudaram.',
    lam3:
      'Se sua carteira ainda não tem a rede A1, adicione-a com o botão da página da torneira em vez ' +
      'de digitar as configurações à mão.',
    lam4: 'Peça tokens na torneira de novo e lance sua cadeia outra vez, se quiser.',
    imLangTieuDe: 'Sua carteira não vai avisar',
    imLangMoTa:
      'A nova rede mantém o Chain ID {chainId}, o mesmo endereço RPC e o mesmo nome da antiga. Isso ' +
      'foi proposital — para que todo documento e guia já publicados continuem corretos. O preço é ' +
      'que sua carteira não tem sinal nenhum de que acabou de se conectar a uma rede diferente. ' +
      'Por isso as duas coisas abaixo acontecerão em silêncio.',
    imLang1:
      'Uma carteira com a configuração antiga ainda conecta, ainda mostra o nome de rede correto e ' +
      'vai informar saldo 0. Esse número está CORRETO: seus tokens antigos não existem mais, não ' +
      'estão escondidos. Você não precisa readicionar a rede — basta pedir tokens novos na torneira. ' +
      'Se sua carteira informar transação travada ou número de sequência errado, limpe os dados de ' +
      'atividade daquela rede na carteira: ela ainda lembra o contador de transações de uma cadeia ' +
      'morta, enquanto a nova conta a partir de 0.',
    imLang2:
      'Se você ainda guarda uma transação assinada que nunca foi transmitida, descarte-a. A assinatura ' +
      'continua válida na rede nova, porque o Chain ID não mudou. Ela vai falhar enquanto a carteira ' +
      'estiver vazia — mas no momento em que você pedir tokens na torneira ela se torna executável, ' +
      'e pode passar numa hora que você não espera.',
    lapTieuDe: 'Isso vai acontecer de novo',
    lapMoTa:
      'É possível. A A1 ainda é uma testnet e, até a comunidade escolher uma direção de mainnet entre ' +
      'A1 e C1, mantemos o direito de reconstruir a rede quando algo dentro do genesis precisar mudar. ' +
      'O que assumimos é avisar com antecedência e dizer claramente o que se perde.',
    // 🔴 Thêm 2026-08-27 (D-081). Mạng công khai ĐÃ sinh lại một lượt HÔM NAY,
    // trước ngày G. Cảnh báo về 01/09 vẫn đúng và vẫn cần — sẽ còn một lượt nữa —
    // nhưng người có token trước hôm nay quay lại sẽ thấy số dư 0 mà trang không
    // giải thích gì. Đường cơ sở sáng nay chứng minh KHÔNG ai mất chain; faucet thì
    // KHÔNG có sổ bền nên không chứng minh được là không ai mất token.
    daXayRaTieuDe: 'Já foi reconstruída uma vez em 2026-08-27',
    daXayRaMoTa:
      'A A1 já foi reconstruída uma vez em 2026-08-27, antes da data abaixo. Se você tinha tokens de teste antes disso, seu saldo agora é 0 — isso está correto, não é falha da sua carteira. Nenhuma cadeia de usuário foi perdida: o diretório continha apenas cadeias de teste automatizadas. Peça tokens na torneira de novo.',
    ngayLuuY: 'A data pode escorregar',
    ngayLuuYMoTa:
      'A data {ngay} depende de uma verificação anterior. Se ela atrasar, mudaremos a data nesta ' +
      'página em vez de ficar em silêncio.',
  },

  chanTrang: {
    dungThu: 'Experimente',
    kham: 'Explorar',
    veDuAn: 'Sobre',
    explorer: 'Explorador 9Scan-A1',
    trangChinh: 'Site principal da 9Chain',
    moTabMoi: '(abre em uma nova aba)',
    nhanNav: 'Links do rodapé',
    reGenesis: 'Plano de reconstrução da rede',
  },

  dieuHuong: {
    trangChu: 'Início',
    faucet: 'Obter tokens de teste',
    console: 'Lançar uma cadeia',
    chainCuaToi: 'Minhas cadeias',
    bang: 'A1 ↔ C1',
    danhBa: 'Diretório de L1',
    explorer: 'Explorador',
    banGiao: 'Abrir 9Scan-A1 em uma nova aba',
  },

  trangChu: {
    nhanTestnet: 'Testnet — os tokens não têm valor real',
    nutChinh: 'Lance sua cadeia',
    nutPhu: 'Pegue tokens de teste primeiro',
    cTieuDe: 'Lance sua própria cadeia na A1',
    cPhu: 'Uma L1 sua, de propriedade da carteira com que você assina, rodando de verdade na rede de testes. Leva cerca de três minutos.',
    cBangChuThich: 'Cada linha é uma cadeia real rodando na A1, com dono próprio.',
    cCot: 'Cadeia',
    cCotKieu: 'Tipo',
    cCotChu: 'Dono',
    cMacDinh: 'padrão do sistema',
    cTrong: 'Nenhuma L1 rodando ainda',
    cTrongMoTa: 'Você seria o primeiro. O diretório atualiza assim que sua cadeia estiver no ar.',
    tuTo: 'Os 9 validadores rodam hoje no mesmo servidor, com o mesmo provedor — descentralizado no nível do protocolo, ainda não no nível da infraestrutura.',
    blockDungYen: 'A Avalanche não produz blocos vazios, então uma altura de bloco parada enquanto ninguém transaciona é normal. A medida de atividade é a contagem de validadores ao lado.',
  },

  soLieu: {
    tieuDe: 'A rede está no ar',
    validator: 'Validadores conectados',
    soL1: 'L1 rodando',
    chieuCao: 'Bloco da C-Chain',
    dangDo: 'Medindo a rede…',
    khongDo: 'Não foi possível ler as estatísticas da rede',
    khongDoMoTa: 'A página continua funcionando — isto é só o painel de estado.',
  },

  deChain: {
    tieuDe: 'Lance sua cadeia',
    moTa: 'Uma L1 dedicada, de propriedade da sua carteira. Você assina uma vez para provar quem é, revisa, e a rede constrói a cadeia em cerca de três minutos.',
    noiVi: 'Conectar carteira',
    dangNoi: 'Conectando…',
    kyDeVao: 'Assinar para entrar',
    dangKy: 'Aguardando a assinatura…',
    viCuaBan: 'Sua carteira',
    laChuChain: 'A cadeia pertencerá a esta carteira. O endereço vem da sua assinatura — ninguém digita.',
    khongCoVi: 'Nenhuma carteira encontrada neste navegador. Instale a MetaMask e recarregue a página.',
    tuChoiKy: 'Você recusou assinar. Nada foi criado.',
    doiVi: 'Usar outra carteira',
    nhanTen: 'Nome da cadeia',
    goiYTen: 'Por exemplo: MinhaCadeia',
    moTaTen: 'Letras, dígitos e espaços. 2–32 caracteres. Nesta rede, um nome já usado nunca é reemitido — nem para uma cadeia revogada.',
    tenXau: 'O nome só pode conter letras, dígitos e espaços, com 2 a 32 caracteres.',
    nhanKieu: 'Tipo de cadeia',
    moTaKieu: 'Uma vez escolhido, fica fixo — o genesis de uma cadeia não pode ser editado.',
    conCho: 'Restam {con}/{tong} vagas',
    hetCho: 'Sem vagas',
    hetChoMoTa:
      'O modelo atual faz cada validador acompanhar todas as L1, e o protocolo derruba um nó que ' +
      'declare mais de 16 sub-redes. Este é um teto rígido e não pode ser elevado. Revogar uma cadeia ' +
      'devolve uma vaga.',
    soatLai: 'Revise antes de enviar',
    soatTieuDe: 'Revisão — esta é uma porta de mão única',
    soatMoTa:
      'O genesis de uma L1 lançada é IMUTÁVEL. Depois deste passo o nome, o tipo de cadeia e o dono ' +
      'não podem ser alterados — e revogar também não devolve o nome nem o Chain ID.',
    soatReGenesis:
      'Mais uma coisa antes de apertar: a A1 reconstrói a rede inteira em {ngay}. A cadeia que você ' +
      'lançar hoje será apagada junto com a rede antiga — não escondida, sumida.',
    soatTen: 'Nome da cadeia',
    soatKieu: 'Tipo de cadeia',
    soatChu: 'Dono',
    soatQuayLai: 'Voltar e editar',
    soatDongY: 'Eu revisei — lançar a cadeia',
    dangDe: 'Lançando a cadeia “{ten}”',
    dangDeMoTa:
      'Os nós reiniciam UM DE CADA VEZ para a rede nunca perder o quórum — é por isso que é lento, e ' +
      'é proposital. Não feche a aba; se fechar, a cadeia é construída mesmo assim.',
    conKhoang: 'Faltam cerca de {phut} minutos',
    dangChuanBi: 'Preparando…',
    xongTieuDe: 'Pronto — a cadeia “{ten}” está rodando',
    xongChainId: 'Chain ID',
    xongRpc: 'RPC',
    xongThemVi: 'Adicionar a cadeia à carteira',
    xongDaThem: 'Adicionada à carteira',
    xongKichHoat: 'Ativar a cadeia (abrir o bloco 1)',
    xongDaKichHoat: 'Ativada',
    xongDangKichHoat: 'Aguardando a carteira…',
    xongThemViLoi: 'Não foi possível adicionar a cadeia à sua carteira. {chiTiet}',
    xongKichHoatLoi: 'Não foi possível ativar a cadeia. {chiTiet}',
    deTiep: 'Lançar outra cadeia',
    loiDe: 'Não foi possível lançar a cadeia. {chiTiet}',
    loiKhongRo: 'A cadeia não apareceu no diretório depois que a execução terminou.',
    luuYTieuDe: 'A primeira transação de uma cadeia nova',
    luuYCachLam: 'Não confie na estimativa de gas da primeira transação. O jeito mais barato de abrir o bloco 1 é uma transferência comum — aperte “Ativar a cadeia” abaixo.',
  },

  chainCuaToi: {
    tieuDe: 'Minhas cadeias',
    moTa: 'As L1 pertencentes à carteira com que você entrou. Podem ser revogadas, mas leia o aviso antes.',
    noiVi: 'Conecte sua carteira para ver suas cadeias',
    trongTieuDe: 'Esta carteira ainda não possui nenhuma cadeia',
    trongMoTa: 'Lance uma e volte — ela aparecerá aqui na hora.',
    trongNut: 'Lance sua cadeia',
    cotChain: 'Cadeia',
    cotKieu: 'Tipo',
    cotSong: 'Estado',
    cotViec: '',
    songDo: '{so} validadores',
    songDangDo: 'medindo',
    songKhongDo: 'não foi possível medir',
    songGiaiThich: 'Medido pela contagem de validadores da sub-rede, não pela altura do bloco.',
    khongValidator: '0 validadores',
    khongValidatorMoTa:
      'Esta cadeia NÃO consegue finalizar nenhuma transação: a sub-rede não tem validadores. Ela ainda ' +
      'responde a chamadas RPC e as carteiras ainda conectam, então não há outro sinal visível.',
    thongSo: 'Configurações da carteira',
    themVaoVi: 'Adicionar à carteira',
    daThemVaoVi: 'Adicionada',
    themViLoi: 'Não foi possível adicioná-la à sua carteira. {chiTiet}',
    thuHoi: 'Revogar',
    thuHoiTieuDe: 'Revogar “{ten}”?',
    thuHoiY1: 'A cadeia para de servir RPC imediatamente e some do diretório público.',
    thuHoiY2:
      'Revogar NÃO apaga a sub-rede na P-Chain — o que foi criado ali não pode ser removido enquanto ' +
      'esta rede estiver no ar. Também não remove a rede das carteiras de quem já adicionou esta cadeia.',
    thuHoiY3:
      'O nome e o Chain ID ficam reservados e NUNCA são reemitidos a ninguém nesta rede. Reemitir um ' +
      'Chain ID faria a carteira de um usuário antigo apontar em silêncio para a cadeia de outra pessoa.',
    thuHoiY4: 'Em troca, uma das 15 vagas é devolvida.',
    thuHoiGoNhan: 'Digite o nome exato da cadeia para confirmar',
    thuHoiSaiTen: 'Isso não confere com o nome da cadeia.',
    thuHoiXacNhan: 'Revogar permanentemente',
    thuHoiHuy: 'Cancelar',
    thuHoiDangChay: 'Revogando “{ten}” — cerca de três minutos',
    thuHoiXong: '“{ten}” revogada. Restam {con}/{tong} vagas.',
    thuHoiLoi: 'Não foi possível revogar. {chiTiet}',
    thuHoiKhongRo: 'A cadeia ainda está no diretório depois que a execução terminou.',
    daThuHoi: 'Revogada',
    daThuHoiMoTa: 'Nome e Chain ID continuam reservados nesta rede.',
  },

  bang: {
    tieuDe: 'A1 ↔ C1 — comparação',
    moTa:
      'A 9Chain roda DUAS testnets do mesmo produto lado a lado, diferindo no motor: A1 no motor ' +
      'Avalanche, C1 no motor Cosmos. Esta tabela registra as escolhas entre as duas direções, ' +
      'publicada para que qualquer um possa contestar — o lado C1 ainda não tem medições reais.',
    tuChamTieuDe: 'As notas abaixo são AUTOAVALIADAS pela equipe, não medidas de forma independente',
    tuChamMoTa:
      'A coluna “como é medido” diz como cada critério foi verificado. Qualquer critério sem uma ' +
      'medição datada é um julgamento de arquitetura, não um dado. Os pesos são seus — a nota acompanha.',
    cotSo: '#',
    cotTieuChi: 'Critério',
    cotLoai: 'Tipo',
    cotA1: 'A1',
    cotC1: 'C1',
    cotTrongSo: 'Peso',
    loaiKienTruc: 'arquitetura',
    loaiSong: 'dados reais',
    tongDiem: 'Nota total com seus pesos',
    hoaNhau: 'Empate',
    dangDan: 'na frente',
    soLieuTieuDe: 'Dados ao vivo',
    a1Validator: 'A1 — validadores conectados',
    a1Chain: 'A1 — L1 rodando',
    a1Block: 'A1 — bloco da C-Chain',
    c1Vang: 'C1 — inacessível',
    c1VangMoTa:
      'É necessária a URL REST Cosmos da C1 (porta 1317). A tabela continua útil: o lado A1 são dados ' +
      'ao vivo, o lado C1 é um julgamento de arquitetura como os demais critérios.',
    dangDo: 'medindo…',
    khongDo: 'não foi possível medir',
  },

  faucet: {
    tieuDe: 'Obter tokens de teste',
    moTa: 'O LOVE9 na testnet A1 não tem valor real — ele existe para você pagar gas enquanto testa. Informe um endereço de carteira e enviamos na hora.',
    nhanDiaChi: 'Seu endereço de carteira',
    goiYDiaChi: '0x… (40 caracteres hexadecimais)',
    nutXin: 'Envie tokens para mim',
    dangGui: 'Enviando…',
    danChoDiaChi: 'Cole o endereço da carteira que deve receber os tokens. Aperte “Adicionar a rede à carteira” acima se ainda não fez isso.',
    themMang: 'Adicionar a rede à carteira',
    themMangXong: 'Adicionada à carteira',
    themMangTuChoi: 'Você apertou recusar na carteira. Aperte de novo se quiser adicionar a rede.',
    themMangLoi: 'Sua carteira não conseguiu adicionar a rede. Adicione manualmente com as configurações ao lado — e envie a linha abaixo para a equipe:',
    khongCoVi: 'Nenhuma carteira encontrada neste navegador. Instale a MetaMask e recarregue a página.',
    hanMucConLai: 'Cota restante',
    hanMucCachDoc: '{con}/{tong} pedidos a cada {gio} horas',
    hanMucHet: 'Você usou toda a sua cota. Tente de novo em {phut} minutos.',
    hanMucKhongDoc: 'Não foi possível ler sua cota — você ainda pode pedir, só não vai saber quantos restam.',
    thanhCong: 'Enviados {so} {kyHieu} para {diaChi}',
    xemGiaoDich: 'Ver a transação',
    thongSoMang: 'Configurações de rede',
    thongSoRpc: 'RPC',
    thongSoChainId: 'Chain ID',
    thongSoKyHieu: 'Símbolo',
    thongSoThapPhan: 'Casas decimais',
    thongSoExplorer: 'Explorador',
    thapPhanGiaiThich:
      'As carteiras mostram 18 casas decimais porque a C-Chain roda a EVM. Na P/X-Chain, o LOVE9 é ' +
      'contado em 9 casas. Uma moeda só, duas escalas — não são dois tokens diferentes.',
    loiChung: 'Não foi possível enviar. {chiTiet}',
  },

  chonNgonNgu: {
    nhan: 'Idioma',
    mayDich: 'automática',
    mayDichGiaiThich: 'Só o vietnamita foi revisado por uma pessoa. As demais traduções são automáticas e podem conter erros — o inglês é a versão de referência.',
    chuaCo: 'ainda não disponível',
  },

  loi: {
    khongKetNoi: 'Não foi possível alcançar a rede',
    khongKetNoiMoTa: 'A rede pode estar ocupada, ou sua conexão pode ter caído.',
    trongRong: 'Nada aqui ainda',
  },

  khongThay: {
    ma: '404',
    tieuDe: 'Esta página não existe',
    moTa: 'O endereço que você abriu não existe na 9Chain Testnet A1. Ele pode ter sido renomeado, ou a URL pode ter perdido alguns caracteres na cópia.',
    dayLaGi: 'As três páginas mais usadas:',
    nhanNav: 'Para onde ir',
    veTrangChu: 'Voltar ao início',
    diFaucet: 'Obter tokens de teste',
    diDeChain: 'Lance sua cadeia',
    timGiaoDich: 'Procurando uma transação ou um endereço? Confira o hash e tente de novo.',
  },
};

export default pt;
