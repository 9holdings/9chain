// siwe-test.mjs — tự kiểm lớp đăng nhập bằng chữ ký ví.
//
//   node local-net/console/siwe-test.mjs
//
// Đây là đường XÁC THỰC của console — thứ quyết định "ai được đẻ chain" và, sau
// M4.1, "chain về tay ai". Một lỗi ở đây không làm gì đổ vỡ ầm ĩ: nó chỉ lặng lẽ
// nhận chữ ký của người khác. Nên các bài dưới đây phần lớn là **bài PHẢI TRƯỢT**:
// kiểm rằng thứ đáng bị từ chối thì bị từ chối.
import { Wallet } from "ethers";
import { siwe } from "./siwe.mjs";

let dat = 0, hong = 0;
function kiem(ten, ok, chiTiet = "") {
  if (ok) { dat++; console.log(`  ✓ ${ten}${chiTiet ? "  — " + chiTiet : ""}`); }
  else { hong++; console.log(`  ✗ ${ten}${chiTiet ? "  — " + chiTiet : ""}`); }
}
async function phaiNem(ten, fn, chuaChuoi = "") {
  try {
    await fn();
    kiem(ten, false, "KHÔNG ném lỗi — đã chấp nhận thứ đáng lẽ phải từ chối");
  } catch (e) {
    const khop = !chuaChuoi || String(e.message).includes(chuaChuoi);
    kiem(ten, khop, khop ? "" : `ném lỗi khác: ${e.message}`);
  }
}

const CAU_HINH = { domain: "testnet-a1.9chain.org", uri: "https://testnet-a1.9chain.org/console", chainId: 9000000009 };

console.log("\n── 1. Đường thuận ──");
{
  const s = siwe(CAU_HINH);
  const vi = Wallet.createRandom();
  const { nonce, message } = s.moiKy(vi.address);
  kiem("message đúng khuôn EIP-4361", message.startsWith(`${CAU_HINH.domain} wants you to sign in with your Ethereum account:\n${vi.address}\n`));
  kiem("message có nonce vừa phát", message.includes(`Nonce: ${nonce}`));
  kiem("message có domain (chống dùng chữ ký ở site khác)", message.includes(CAU_HINH.domain));
  const kq = s.xacThuc({ nonce, signature: await vi.signMessage(message) });
  kiem("đổi được chữ ký lấy token phiên", typeof kq.token === "string" && kq.token.length >= 32);
  kiem("phiên gắn ĐÚNG địa chỉ đã ký", kq.address === vi.address, kq.address);
  kiem("đọc lại được địa chỉ từ header", s.diaChiCuaPhien({ headers: { authorization: `Bearer ${kq.token}` } }) === vi.address);
}

console.log("\n── 2. Phát lại (replay) ──");
{
  const s = siwe(CAU_HINH);
  const vi = Wallet.createRandom();
  const { nonce, message } = s.moiKy(vi.address);
  const chuKy = await vi.signMessage(message);
  s.xacThuc({ nonce, signature: chuKy });
  // Chữ ký thật, của đúng người — nhưng nonce đã tiêu. Đây là bài quan trọng nhất
  // của cả file: không có nó thì một chữ ký bắt được trên đường truyền dùng mãi mãi.
  await phaiNem("dùng LẠI đúng chữ ký đó bị từ chối", () => s.xacThuc({ nonce, signature: chuKy }), "đã dùng");
}

console.log("\n── 3. Chữ ký của người khác ──");
{
  const s = siwe(CAU_HINH);
  const nanNhan = Wallet.createRandom();
  const keGia = Wallet.createRandom();
  const { nonce, message } = s.moiKy(nanNhan.address);
  // Kẻ tấn công xin lời mời ký NHÂN DANH nạn nhân rồi tự ký bằng ví của mình.
  await phaiNem("ký bằng ví khác bị từ chối", async () =>
    s.xacThuc({ nonce, signature: await keGia.signMessage(message) }), "không phải");
}

console.log("\n── 4. Chữ ký hợp lệ nhưng của MESSAGE KHÁC ──");
{
  const s = siwe(CAU_HINH);
  const vi = Wallet.createRandom();
  const { nonce } = s.moiKy(vi.address);
  // Kịch bản thật: nạn nhân bị dụ ký một câu vô hại ở một trang khác, kẻ tấn công
  // đem chữ ký đó sang đây. Server dựng lại message TỪ KHO CỦA MÌNH nên chữ ký này
  // khôi phục ra một địa chỉ khác và trượt.
  const chuKyLac = await vi.signMessage("gm");
  await phaiNem("chữ ký của message khác bị từ chối", () => s.xacThuc({ nonce, signature: chuKyLac }), "không phải");
}

console.log("\n── 5. Nonce bịa / sai định dạng ──");
{
  const s = siwe(CAU_HINH);
  const vi = Wallet.createRandom();
  await phaiNem("nonce chưa từng phát", async () =>
    s.xacThuc({ nonce: "deadbeef", signature: await vi.signMessage("x") }), "không tồn tại");
  await phaiNem("thiếu nonce", () => s.xacThuc({ signature: "0x00" }), "không tồn tại");
  const { nonce } = s.moiKy(vi.address);
  await phaiNem("chữ ký rác", () => s.xacThuc({ nonce, signature: "0xkhongphaichuky" }), "không hợp lệ");
}

console.log("\n── 6. Hết hạn ──");
{
  const s = siwe({ ...CAU_HINH, ttlNonceMs: 1 });
  const vi = Wallet.createRandom();
  const { nonce, message } = s.moiKy(vi.address);
  const chuKy = await vi.signMessage(message);
  await new Promise(r => setTimeout(r, 20));
  await phaiNem("lời mời ký quá hạn bị từ chối", () => s.xacThuc({ nonce, signature: chuKy }), "hết hạn");
}

console.log("\n── 7. Phiên hết hạn / token sai ──");
{
  const s = siwe({ ...CAU_HINH, ttlPhienMs: 1 });
  const vi = Wallet.createRandom();
  const { nonce, message } = s.moiKy(vi.address);
  const { token } = s.xacThuc({ nonce, signature: await vi.signMessage(message) });
  await new Promise(r => setTimeout(r, 20));
  kiem("phiên quá hạn không còn dùng được", s.diaChiCuaPhien({ headers: { authorization: `Bearer ${token}` } }) === null);

  const s2 = siwe(CAU_HINH);
  kiem("không header thì không có phiên", s2.diaChiCuaPhien({ headers: {} }) === null);
  kiem("token bịa không mở được phiên", s2.diaChiCuaPhien({ headers: { authorization: "Bearer khongphaitoken" } }) === null);
  // Token của bản siwe() KHÁC không được dùng chéo — mỗi tiến trình một kho riêng.
  const vi2 = Wallet.createRandom();
  const m2 = s2.moiKy(vi2.address);
  const t2 = s2.xacThuc({ nonce: m2.nonce, signature: await vi2.signMessage(m2.message) });
  kiem("token của instance này không mở được instance kia",
    siwe(CAU_HINH).diaChiCuaPhien({ headers: { authorization: `Bearer ${t2.token}` } }) === null);
}

console.log("\n── 8. Địa chỉ sai checksum bị chặn NGAY lúc xin lời mời ──");
{
  const s = siwe(CAU_HINH);
  const vi = Wallet.createRandom();
  // Đổi một ký tự hoa/thường => hỏng checksum EIP-55. Genesis là bất biến nên sai
  // một ký tự ở đây là chain vô chủ vĩnh viễn — phải chặn từ cửa đầu tiên.
  const hong55 = vi.address.slice(0, -1) + (vi.address.at(-1) === "a" ? "A" : "a");
  await phaiNem("địa chỉ sai checksum bị từ chối", () => s.moiKy(hong55));
  kiem("địa chỉ chữ thường vẫn nhận (getAddress tự chuẩn hoá)",
    s.moiKy(vi.address.toLowerCase()).message.includes(vi.address));
}

console.log("\n── 9. Trần bộ nhớ fail-closed ──");
{
  const s = siwe({ ...CAU_HINH, maxNonce: 3 });
  const vi = Wallet.createRandom();
  s.moiKy(vi.address); s.moiKy(vi.address); s.moiKy(vi.address);
  // Đầy thì TỪ CHỐI, không đá bản ghi cũ ra — đá bản ghi cũ nghĩa là kẻ spam vô
  // hiệu hoá được lời mời ký của người đang đăng nhập dở.
  await phaiNem("hết chỗ thì từ chối chứ không đá nonce cũ", () => s.moiKy(vi.address), "đang bận");
  kiem("số liệu không lộ token/địa chỉ",
    JSON.stringify(s.soLieu()) === JSON.stringify({ nonceDangCho: 3, phienDangMo: 0 }));
}

console.log(`\n════ ${dat}/${dat + hong} ĐẠT ════`);
process.exit(hong ? 1 : 0);
