// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IWarpMessenger.sol";

/**
 * CauTaiSan — chuyển TÀI SẢN (token gốc) từ L1 này sang L1 kia bằng Warp.
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
 */
contract AssetBridge {
    IWarpMessenger constant WARP = IWarpMessenger(0x0200000000000000000000000000000000000005);

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
     * `chainNguon` và `hopDongNguon` do người gọi truyền vào và được so bằng
     * `require` — đây là chỗ chốt danh tính, xem ghi chú đầu file.
     */
    function nhanVaTra(uint32 index, bytes32 chainNguon, address hopDongNguon)
        external
        returns (address nguoiNhan, uint256 soTien)
    {
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
