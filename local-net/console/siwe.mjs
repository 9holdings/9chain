// siwe.mjs — Đăng nhập bằng chữ ký ví (EIP-4361 "Sign-In with Ethereum")
// cho console đẻ chain của 9Chain-A1.
//
// ═══ VÌ SAO CẦN ═══
// Console hiện xác thực bằng MỘT token tĩnh dùng chung (`A1_CONSOLE_TOKEN`). Token
// tĩnh không trả lời được câu hỏi quan trọng nhất của sản phẩm này: **ai đang bấm
// nút?** Mà "chain thuộc về người bấm nút" chính là điểm bán hàng của A1 — hiện nó
// phụ thuộc vào việc người dùng TỰ KHAI địa chỉ `admin` cho đúng. Khai nhầm một ký
// tự là chain ra đời vô chủ vĩnh viễn (genesis bất biến).
//
// Ký bằng ví gỡ đúng chỗ đó: địa chỉ ký **chính là** `admin`, không ai gõ gì cả.
//
// ═══ QUYẾT ĐỊNH THIẾT KẾ QUAN TRỌNG NHẤT: CLIENT KHÔNG GỬI MESSAGE ═══
// Cách làm SIWE thông thường là client gửi cả `message` lẫn `signature`, server
// parse message rồi kiểm từng trường. Ở đây KHÔNG làm vậy: client chỉ gửi
// `{nonce, signature}`, còn message thì **server tự lấy lại từ kho của mình**.
//
// Vì sao: parse là chỗ đẻ lỗ hổng. Nếu server tin message do client gửi rồi mới
// đối chiếu vài trường, mọi trường KHÔNG được kiểm trở thành đất của kẻ tấn công —
// và lớp lỗi kinh điển của SIWE là dụ nạn nhân ký một message trông vô hại ở nơi
// khác rồi đem chữ ký đó sang đây. Không nhận message thì không có gì để dụ: chữ ký
// chỉ dùng được với đúng chuỗi mà server đã phát cho đúng địa chỉ đó.
//
// ═══ TẠI SAO DÙNG ethers CHỨ KHÔNG TỰ VIẾT ═══
// Xác minh SIWE cần khôi phục khoá công khai từ chữ ký (secp256k1 ECDSA recovery) —
// `node:crypto` không có. Dự án này đã tự viết keccak-256 (`eip55.mjs`) nên có tiền
// lệ, nhưng hai thứ đó khác hẳn về hậu quả khi sai: keccak sai thì địa chỉ sai và
// **hỏng ầm ĩ**; recovery sai thì **chấp nhận chữ ký giả và im lặng** — đó là cửa
// hậu, không phải lỗi. Xem DECISIONS D-020.
import { randomBytes } from "node:crypto";
import { verifyMessage, getAddress } from "ethers";
// Đặt cạnh package.json chứ KHÔNG ở `local-net/lib/` như guard.mjs / eip55.mjs:
// Node phân giải `node_modules` đi ngược lên TỪ THƯ MỤC CHỨA FILE ĐANG IMPORT, nên
// một file ở `lib/` không thấy `console/node_modules`. Đây là cùng một bẫy đã làm
// `smoke-l1.mjs` (trong `faucet/`) import được ethers còn console thì không.
import { safeEqual } from "../lib/guard.mjs";

const PHUT = 60 * 1000;

/**
 * @param {object} o
 * @param {string} o.domain      tên miền hiện trong message ví (chống dùng chữ ký ở nơi khác)
 * @param {string} o.uri         URI hiện trong message
 * @param {number} o.chainId     EVM chainId của mạng chính
 * @param {string} [o.statement] câu giải thích cho người ký đọc
 */
export function siwe({
  domain,
  uri,
  chainId,
  statement = "Đăng nhập console 9Chain-A1. Chain bạn tạo sẽ thuộc về chính địa chỉ này.",
  ttlNonceMs = 5 * PHUT,
  ttlPhienMs = 30 * PHUT,
  maxNonce = 5000,
  maxPhien = 1000,
} = {}) {
  if (!domain || !uri) throw new Error("siwe(): thiếu domain hoặc uri");

  /** nonce -> { message, address, hetHan } */
  const khoNonce = new Map();
  /** token -> { address, hetHan } */
  const khoPhien = new Map();

  function quet(kho) {
    const now = Date.now();
    for (const [k, v] of kho) if (v.hetHan <= now) kho.delete(k);
  }

  // Timer nền để hai kho không phình vô hạn khi bị quét. `unref` để nó không giữ
  // tiến trình sống — console phải tắt được bằng Ctrl-C như trước.
  const nhip = setInterval(() => { quet(khoNonce); quet(khoPhien); }, PHUT);
  nhip.unref?.();

  return {
    /**
     * Phát một lời mời ký cho `diaChi`. Trả về chuỗi message để ví hiện lên.
     *
     * Message được dựng ĐÚNG khuôn EIP-4361 để MetaMask hiển thị đẹp và người ký
     * đọc hiểu được mình đang ký gì — một hộp thoại toàn hex là cách huấn luyện
     * người dùng bấm ký mà không đọc.
     */
    moiKy(diaChi) {
      quet(khoNonce);
      // Fail-closed: hết chỗ thì TỪ CHỐI, không đá bản ghi cũ ra. Đá bản ghi cũ
      // nghĩa là kẻ spam xin nonce có thể vô hiệu hoá lời mời ký của người đang
      // đăng nhập dở — biến một giới hạn bộ nhớ thành công cụ tấn công.
      if (khoNonce.size >= maxNonce) {
        throw new Error("máy chủ đang bận (quá nhiều lượt đăng nhập dở), thử lại sau ít phút");
      }
      const address = getAddress(String(diaChi));   // ném lỗi nếu sai checksum EIP-55
      const nonce = randomBytes(16).toString("hex");
      const bayGio = new Date();
      const hetHan = new Date(bayGio.getTime() + ttlNonceMs);

      const message =
        `${domain} wants you to sign in with your Ethereum account:\n` +
        `${address}\n\n` +
        `${statement}\n\n` +
        `URI: ${uri}\n` +
        `Version: 1\n` +
        `Chain ID: ${chainId}\n` +
        `Nonce: ${nonce}\n` +
        `Issued At: ${bayGio.toISOString()}\n` +
        `Expiration Time: ${hetHan.toISOString()}`;

      khoNonce.set(nonce, { message, address, hetHan: hetHan.getTime() });
      return { nonce, message, hetHanLuc: hetHan.toISOString() };
    },

    /**
     * Đổi `{nonce, signature}` lấy một token phiên.
     *
     * KHÔNG nhận `message` từ client — xem ghi chú đầu file.
     */
    xacThuc({ nonce, signature }) {
      const key = String(nonce ?? "");
      const ban = khoNonce.get(key);
      // Xoá nonce NGAY, kể cả khi xác minh sẽ hỏng bên dưới. Nonce dùng một lần là
      // thứ chặn phát lại; để nó sống sau một lần thử là cho phép dò chữ ký.
      khoNonce.delete(key);

      if (!ban) throw new Error("nonce không tồn tại hoặc đã dùng — xin lời mời ký mới");
      if (ban.hetHan <= Date.now()) throw new Error("lời mời ký đã hết hạn — xin cái mới");

      let kyBoi;
      try {
        kyBoi = verifyMessage(ban.message, String(signature ?? ""));
      } catch (e) {
        throw new Error(`chữ ký không hợp lệ: ${e.shortMessage || e.message}`);
      }
      // `verifyMessage` trả địa chỉ dạng EIP-55, `ban.address` cũng vậy (đã qua
      // getAddress) — so trực tiếp được, không cần hạ chữ thường.
      if (kyBoi !== ban.address) {
        throw new Error(`chữ ký thuộc về ${kyBoi}, không phải ${ban.address}`);
      }

      quet(khoPhien);
      if (khoPhien.size >= maxPhien) throw new Error("máy chủ đang bận (quá nhiều phiên), thử lại sau");

      const token = randomBytes(32).toString("base64url");
      const hetHan = Date.now() + ttlPhienMs;
      khoPhien.set(token, { address: ban.address, hetHan });
      return { token, address: ban.address, hetHanLuc: new Date(hetHan).toISOString() };
    },

    /**
     * Địa chỉ ví của phiên trong request, hoặc null nếu không có/không hợp lệ.
     *
     * So sánh CHỐNG TIMING ATTACK: `khoPhien.get(token)` tra thẳng bằng hash thì
     * nhanh, nhưng để chắc chắn không rò rỉ qua đường so chuỗi, ta duyệt và so
     * bằng `safeEqual`. Số phiên bị chặn trần (maxPhien) nên vòng lặp có giới hạn.
     */
    diaChiCuaPhien(req) {
      const h = String(req.headers["authorization"] || "");
      const m = /^Bearer\s+(.+)$/i.exec(h);
      const given = m ? m[1] : req.headers["x-a1-siwe"];
      if (!given) return null;
      const now = Date.now();
      for (const [token, v] of khoPhien) {
        if (v.hetHan <= now) { khoPhien.delete(token); continue; }
        if (safeEqual(given, token)) return v.address;
      }
      return null;
    },

    /** Số liệu cho endpoint chẩn đoán — KHÔNG lộ token hay địa chỉ. */
    soLieu() {
      quet(khoNonce); quet(khoPhien);
      return { nonceDangCho: khoNonce.size, phienDangMo: khoPhien.size };
    },
  };
}
