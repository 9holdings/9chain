// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IWarpMessenger.sol";

/**
 * AssetBridge — chuyển TÀI SẢN (token gốc) từ L1 này sang L1 kia bằng Warp.
 *
 * 🔴 TÊN TỆP VÀ TÊN CONTRACT GẮN VỚI NHAU — đổi một nửa là để lại một cái bẫy.
 * `compile.mjs` tra `contracts["AssetBridge.sol"]["AssetBridge"]`, nên đổi tên
 * contract mà không đổi tên tệp (hoặc ngược lại) làm bước biên dịch không tìm
 * thấy gì, và lỗi đọc như "hợp đồng không tồn tại" chứ không như "đặt tên sai".
 * Tên export trong artifact (`CAU_TAI_SAN_*`) GIỮ NGUYÊN tiếng Việt — đó là định
 * danh mã nguồn, không phải tên tệp. Xem bảng đổi tên trong HANDOFF (đợt 26/08).
 *
 * ═══ MÔ HÌNH: KHOÁ Ở ĐẦU GỬI · TRẢ TỪ THANH KHOẢN Ở ĐẦU NHẬN ═══
 * Cùng một mã nguồn nạp lên CẢ HAI chain. Đầu gửi nhận tiền và khoá nó lại trong
 * hợp đồng; đầu nhận trả ra từ thanh khoản đã nạp sẵn của chính nó. Không đúc thêm
 * token mới ở đâu cả, nên tổng cung của chain đích không đổi — đúng tính chất mà
 * một cây cầu phải giữ.
 *
 * Không dùng NativeMinter cho đầu nhận, dù `tu-in-tien` có sẵn: đúc token để trả
 * cho một message là biến quyền đúc thành hàm của cầu, và lúc đó một lỗi ở khâu
 * xác minh không còn là mất thanh khoản của cầu mà là **lạm phát vô hạn** của cả
 * chain. Thanh khoản có trần tự nhiên; quyền đúc thì không.
 *
 * ═══ THỨ NÀY KHÔNG PHẢI ═══
 * Đây là bản chứng minh cơ chế cho testnet, KHÔNG phải cầu sản xuất. Thiếu (cố ý):
 * quản trị, tạm dừng khẩn cấp, hạn mức, phí, đường rút thanh khoản, và kiểm toán.
 * Cầu thật thì dùng ICTT — xem D-034.
 *
 * ═══ HAI THỨ KHÔNG ĐƯỢC BỎ ═══
 * 1. **Chống phát lại.** Một message đã ký thì ký VĨNH VIỄN — ai cũng nộp lại được
 *    đúng giao dịch đó. Không có sổ `daNhan` thì mỗi lượt gửi rút được thanh khoản
 *    nhiều lần cho tới khi cạn.
 * 2. **Chốt danh tính đầu gửi.** `getVerifiedWarpMessage` chỉ chứng minh "validator
 *    của subnet nguồn đã ký message này", KHÔNG chứng minh ai gửi. Không so
 *    `sourceChainID` + `originSenderAddress` thì bất kỳ hợp đồng nào trên bất kỳ
 *    L1 nào cũng bịa được một payload và rút sạch — chữ ký vẫn hợp lệ hoàn toàn.
 *
 * ═══ 🔴 LỖ HỔNG ĐÃ SỬA 2026-08-26 — ĐỌC TRƯỚC KHI "ĐƠN GIẢN HOÁ" LẠI ═══
 * Bản đầu có đủ hai thứ trên, nhưng thứ (2) là **một phép so lặp thừa**:
 *
 *     function nhanVaTra(uint32 index, bytes32 chainNguon, address hopDongNguon)
 *         require(m.sourceChainID     == chainNguon);      // ← người gọi truyền vào
 *         require(m.originSenderAddress == hopDongNguon);  // ← người gọi truyền vào
 *
 * Hợp đồng so message với **chính thứ người gọi vừa đưa cho nó**. Kẻ tấn công nạp
 * một bản sao trên L1 của chính họ, gửi warp message với payload tuỳ ý, rồi gọi
 * `nhanVaTra(index, chainCuaHo, hopDongCuaHo)` — cả hai `require` đều qua, vì chúng
 * luôn qua. Rút sạch `address(this).balance`.
 *
 * Ác ở chỗ mã trông **giống hệt** một bản chốt danh tính đúng, và chú thích ngay
 * phía trên mô tả đúng kịch bản tấn công rồi tin rằng hai dòng đó chặn được nó.
 * Đúng chẩn đoán, sai thuốc.
 *
 * ⇒ Danh tính nguồn nay là **TRẠNG THÁI CỦA HỢP ĐỒNG**, ghim một lần, không phải
 * tham số. Người gọi không còn chỗ nào để nói dối.
 */
contract AssetBridge {
    IWarpMessenger constant WARP = IWarpMessenger(0x0200000000000000000000000000000000000005);

    // ═══ DANH TÍNH ĐẦU GỬI — GHIM MỘT LẦN, KHÔNG BAO GIỜ ĐỔI ═══
    //
    // Vì sao không đặt trong constructor (dạng `immutable` sạch nhất): hai đầu cầu
    // cần địa chỉ của nhau, mà cái nạp trước không thể biết địa chỉ của cái nạp sau
    // — vòng gà-trứng. Nên: nạp cả hai, rồi mỗi bên ghim đúng một lần.
    //
    // `NGUOI_GHIM` là `immutable` (ghi lúc nạp, không sửa được) và chỉ có đúng một
    // quyền: ghim, một lần. Đây không phải quản trị viên — nó không dừng được cầu,
    // không rút được tiền, và hết quyền ngay sau lượt gọi đầu tiên.
    address public immutable NGUOI_GHIM;
    bytes32 public chainNguon;
    address public hopDongNguon;
    bool public daGhim;

    constructor() {
        NGUOI_GHIM = msg.sender;
    }

    /// Ghim danh tính đầu gửi. Gọi được ĐÚNG MỘT LẦN, bởi đúng ví đã nạp hợp đồng.
    function ghimNguon(bytes32 _chainNguon, address _hopDongNguon) external {
        require(msg.sender == NGUOI_GHIM, "khong phai nguoi nap hop dong");
        require(!daGhim, "da ghim roi");
        require(_chainNguon != bytes32(0), "chain nguon rong");
        require(_hopDongNguon != address(0), "hop dong nguon rong");
        chainNguon = _chainNguon;
        hopDongNguon = _hopDongNguon;
        daGhim = true;
    }

    /// Số thứ tự lượt gửi của CHÍNH hợp đồng này (chỉ tăng). Vào payload để mỗi
    /// message có một khoá chống phát lại riêng.
    uint256 public soLuotGui;

    /// Khoá đã trả tiền rồi = keccak(chainNguon, hopDongNguon, soThuTu).
    mapping(bytes32 => bool) public daTra;

    event DaKhoa(address indexed nguoiGui, address indexed nguoiNhan, uint256 soTien, uint256 soThuTu);
    event DaTra(bytes32 indexed khoa, address indexed nguoiNhan, uint256 soTien);

    /// Nạp thanh khoản cho đầu nhận. Ai nạp cũng được — testnet, không có quản trị.
    receive() external payable {}

    /// Đầu GỬI: khoá `msg.value` lại và phát một warp message mô tả khoản đó.
    function khoaVaGui(address nguoiNhan) external payable returns (uint256 soThuTu) {
        require(msg.value > 0, "khong co gi de chuyen");
        require(nguoiNhan != address(0), "nguoi nhan rong");
        soThuTu = soLuotGui++;
        WARP.sendWarpMessage(abi.encode(nguoiNhan, msg.value, soThuTu));
        emit DaKhoa(msg.sender, nguoiNhan, msg.value, soThuTu);
    }

    /**
     * Đầu NHẬN: đọc message đã được xác minh trong predicate của chính giao dịch này
     * rồi trả tiền ra.
     *
     * 🔴 KHÔNG NHẬN `chainNguon`/`hopDongNguon` TỪ NGƯỜI GỌI NỮA — xem khối "LỖ HỔNG
     * ĐÃ SỬA" ở đầu file. Chúng đọc từ trạng thái đã ghim, nên người gọi không có
     * chỗ nào để nói dối. Ai gọi cũng được (message tự mang chữ ký của nó); thứ duy
     * nhất quyết định tiền đi đâu là payload đã được validator nguồn ký.
     */
    function nhanVaTra(uint32 index)
        external
        returns (address nguoiNhan, uint256 soTien)
    {
        // Chưa ghim thì cầu CHƯA SẴN SÀNG. Từ chối thẳng còn hơn nhận một message
        // rồi so với `bytes32(0)` — so với số 0 là một phép so luôn trượt, và nó sẽ
        // hiện ra dưới dạng "sai chain nguon", đọc như bị tấn công chứ không như
        // chưa cấu hình.
        require(daGhim, "cau chua ghim nguon");

        (WarpMessage memory m, bool hopLe) = WARP.getVerifiedWarpMessage(index);
        require(hopLe, "message khong hop le");
        require(m.sourceChainID == chainNguon, "sai chain nguon");
        require(m.originSenderAddress == hopDongNguon, "sai hop dong nguon");

        uint256 soThuTu;
        (nguoiNhan, soTien, soThuTu) = abi.decode(m.payload, (address, uint256, uint256));

        bytes32 khoa = keccak256(abi.encode(chainNguon, hopDongNguon, soThuTu));
        require(!daTra[khoa], "message nay da duoc tra roi");
        daTra[khoa] = true;                      // ghi TRƯỚC khi chuyển tiền

        require(address(this).balance >= soTien, "thieu thanh khoan");
        (bool ok, ) = payable(nguoiNhan).call{value: soTien}("");
        require(ok, "tra tien that bai");
        emit DaTra(khoa, nguoiNhan, soTien);
    }
}
