/**
 * warp-common.mjs — phần dùng chung của mọi bài kiểm Warp (M6.2).
 *
 * Tách ra vì có HAI bài kiểm cùng đi qua đúng một chuỗi thao tác (đẻ chain → mở
 * block 1 → nạp hợp đồng → gửi message → gom chữ ký → nộp kèm predicate), và dự án
 * này đã trả giá nhiều lần cho việc hai bản chép tay của cùng một logic trôi lệch
 * nhau. Bẫy nonce và cách đóng gói predicate là hai chỗ **phải** chỉ có một bản.
 *
 * Zero-dep ngoài `ethers` — file này được import từ `local-net/faucet/`, nơi có sẵn
 * node_modules. Đừng import nó từ console: gốc dự án trên server không có ethers.
 */
import { ethers } from "ethers";

/** Địa chỉ precompile Warp (`precompile/contracts/warp/module.go`). */
export const WARP = "0x0200000000000000000000000000000000000005";

/**
 * Mẫu số quorum của Warp là hằng số 100 (`WarpQuorumDenominator`); 67 khớp
 * `quorumNumerator` trong khuôn genesis. Xin chữ ký ở mức thấp hơn mức chain đích
 * đòi là tự chuốc một message không bao giờ xác minh nổi.
 */
export const QUORUM_NUM = 67;

export const nghi = ms => new Promise(r => setTimeout(r, ms));

/**
 * Gửi giao dịch với nonce ĐỌC TƯƠI mỗi lượt, thử lại CHỈ với lỗi nonce.
 *
 * 🔴 Bẫy này không nằm ở "giao dịch bị từ chối" — nó nằm ở mọi giao dịch THỨ HAI
 * của cùng một ví: `tx.wait(1)` đã trả về mà lượt `getTransactionCount("pending")`
 * kế tiếp vẫn đọc ra số cũ ⇒ `nonce too low`. Chỉ cắn khi hai lượt gần nhau đủ, nên
 * nó biểu hiện thành **đỏ ngẫu nhiên** — thứ làm người ta mất niềm tin vào bài kiểm.
 *
 * Chỉ bắt lại đúng lỗi nonce: mọi lỗi khác ném thẳng ra, vì thử lại một giao dịch
 * bị từ chối vì lý do thật là che mất chính cái ta đang đo.
 */
export async function guiVoiNonce(vi, tx, lan = 6) {
  let cuoi;
  for (let i = 0; i < lan; i++) {
    const nonce = await vi.provider.getTransactionCount(vi.address, "pending");
    try {
      return await vi.sendTransaction({ ...tx, nonce });
    } catch (e) {
      cuoi = e;
      if (!/nonce (has already been used|too low)|replacement transaction/i.test(String(e.message || e))) throw e;
      await nghi(400 * (i + 1));
    }
  }
  throw cuoi;
}

/** Chờ chốt và ĐÒI status 1 — `wait()` trả về bình thường cả khi giao dịch revert. */
export async function chot(tx, nhan) {
  const r = await tx.wait(1);
  if (!r || r.status !== 1) throw new Error(`${nhan}: giao dịch không chốt được (status ${r?.status})`);
  return r;
}

/**
 * Nạp hợp đồng ĐI QUA `guiVoiNonce`, không dùng `ContractFactory.deploy()`.
 *
 * 🔴 `deploy()` tự quản nonce bên trong ethers, tức nó **đi vòng qua** mọi lớp bảo
 * vệ nonce của bài kiểm. Lượt chạy đầu của warp-test (2026-08-25) chết đúng ở đây:
 * `nonce too low: next nonce 1, tx nonce 0` — giao dịch mở block 1 vừa tiêu nonce 0
 * xong mà ethers vẫn đọc ra 0. Bọc `guiVoiNonce` cho MỌI lượt gửi thì mới thật là
 * mọi lượt; một đường gửi lọt ra ngoài là đủ để đỏ ngẫu nhiên.
 *
 * `gasLimit` tường minh, không `estimateGas`: đây thường là giao dịch thứ hai của
 * chain vừa đẻ và ước lượng gas ở đó không đáng tin (D-025).
 */
export async function napHopDong(chu, abi, bin, nhan, gas = 3000000n) {
  const nha = new ethers.ContractFactory(abi, bin, chu);
  const txDeploy = await nha.getDeployTransaction();
  const r = await chot(await guiVoiNonce(chu, { ...txDeploy, gasLimit: gas }), nhan);
  const diaChi = r.contractAddress;
  if (!diaChi) throw new Error(`${nhan}: receipt không có contractAddress`);
  return { hd: new ethers.Contract(diaChi, abi, chu), diaChi };
}

/**
 * Mở block 1 bằng một giao dịch CHUYỂN TIỀN THƯỜNG.
 *
 * Bắt buộc, không phải cho gọn: `eth_estimateGas` ước lượng THIẾU cho giao dịch đầu
 * tiên của chain vừa đẻ (D-025), và nó hỏng câm — receipt chỉ có `status: 0`, không
 * lý do. Chuyển tiền thường tốn đúng 21.000 gas (hằng số EVM) nên không cần ước
 * lượng gì cả.
 */
export async function moBlock1(chu, nhan) {
  return chot(await guiVoiNonce(chu, { to: chu.address, value: 1n, gasLimit: 21000n }), `${nhan} mở block 1`);
}

/**
 * Đóng gói chữ ký thành predicate — CHÍNH XÁC theo `vms/evm/predicate/predicate.go`:
 * nối thêm một byte phân cách 0xff rồi đệm 0 cho tròn bội 32, cắt thành từng khối 32.
 *
 * Byte 0xff là bắt buộc KỂ CẢ khi độ dài đã tròn 32 (khi đó nó mở hẳn một khối mới)
 * — nếu không, bên giải mã không biết phần đệm bắt đầu từ đâu.
 */
export function goiPredicate(hexBytes) {
  const b = ethers.getBytes(hexBytes);
  const soKhoi = Math.floor(b.length / 32) + 1;
  const dem = new Uint8Array(soKhoi * 32);
  dem.set(b, 0);
  dem[b.length] = 0xff;
  const khoa = [];
  for (let i = 0; i < soKhoi; i++) khoa.push(ethers.hexlify(dem.subarray(i * 32, (i + 1) * 32)));
  return khoa;
}

/**
 * Bóc log `SendWarpMessage` của precompile ra khỏi receipt.
 *
 * topics = [chữ ký sự kiện, địa chỉ gửi (indexed), messageID (indexed)].
 * Lọc theo ĐỊA CHỈ precompile chứ không theo chữ ký sự kiện: hợp đồng của ta cũng
 * phát log riêng, và chúng nằm lẫn trong cùng một receipt.
 */
export function bocLogWarp(receipt) {
  const log = receipt.logs.find(l => l.address.toLowerCase() === WARP.toLowerCase());
  if (!log) return null;
  return {
    nguoiGui: ethers.getAddress("0x" + log.topics[1].slice(26)),
    messageIdHex: log.topics[2],
  };
}

/**
 * Một giao dịch được KỲ VỌNG revert.
 *
 * 🔴 `tx.wait()` của ethers v6 **NÉM LỖI** khi receipt có `status: 0` — nó không trả
 * receipt về cho ta đọc. Nên viết `const r = await tx.wait(1); kiem(..., r.status === 0)`
 * là bài kiểm tự làm sập chính mình đúng lúc sản phẩm hoạt động ĐÚNG. Đã dính ở lượt
 * chạy warp-test 2026-08-25: cả ba bài "phải đỏ" bị nuốt thành một dòng
 * "bài chạy trọn vẹn: transaction execution reverted".
 *
 * Node từ chối ngay lúc nộp cũng tính là bị chặn — chỉ khác tầng chặn, và hai tầng
 * này để lại nonce ở hai trạng thái khác nhau nên lượt gửi sau phải đọc nonce tươi.
 */
export async function phaiRevert(chu, tx) {
  try {
    const r = await (await guiVoiNonce(chu, tx)).wait(1);
    return { chan: r?.status === 0, viSao: `status ${r?.status}` };
  } catch (e) {
    const m = String(e.shortMessage || e.message || e);
    if (/reverted|CALL_EXCEPTION/i.test(m)) return { chan: true, viSao: "revert (status 0)" };
    return { chan: true, viSao: "bị từ chối lúc nộp: " + m.slice(0, 60) };
  }
}

/**
 * Kiểm API Warp có bật không — và phân biệt hai lỗi rất giống nhau khi đọc lướt:
 *   - JSON-RPC code **-32601** ⇒ API TẮT (thiếu warp-api-enabled) ← lỗi cấu hình
 *   - lỗi bất kỳ khác          ⇒ API BẬT, chỉ là ID bịa           ← đúng như mong
 * Không tách hai thứ này thì một máy chủ thiếu cấu hình sẽ bị chẩn đoán thành "gọi
 * sai tên hàm" và người sửa đi tìm ở đúng chỗ không có gì.
 *
 * Gọi bằng `fetch` THÔ, không qua provider của ethers: ethers gộp lô rồi bọc lỗi
 * lại thành `could not coalesce error`, làm mất cả mã lẫn câu chữ gốc — lượt chạy
 * đầu (2026-08-25) xanh chỉ vì chuỗi đã bị bóp méo không khớp mẫu "not found" nữa,
 * tức nó xanh vì lý do sai. Mã -32601 là tín hiệu duy nhất không mơ hồ ở đây.
 */
export async function apiWarpDaBat(rpcUrl, idBiaCb58) {
  let j;
  try {
    const r = await fetch(rpcUrl, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "warp_getMessage", params: [idBiaCb58] }),
    });
    j = await r.json();
  } catch (e) {
    return { bat: false, viSao: "không gọi được RPC: " + String(e.message || e).slice(0, 70) };
  }
  if (j?.error?.code === -32601) return { bat: false, viSao: "TẮT — thiếu warp-api-enabled trong chain config (-32601)" };
  if (j?.error) return { bat: true, viSao: `BẬT (lỗi mong đợi cho ID bịa: ${String(j.error.message).slice(0, 60)})` };
  return { bat: false, viSao: "gọi ID bịa mà KHÔNG có lỗi nào — không hiểu đang đo gì" };
}

/**
 * Gom chữ ký BLS của validator subnet NGUỒN cho một message.
 *
 * Tham số thứ ba để RỖNG = "dùng subnet của chính chain đang hỏi"
 * (`warp/service.go:98`). Truyền subnetID của chain ĐÍCH vào đây là lỗi kinh điển:
 * nó đi hỏi nhầm tập validator và trả về "source subnet not found".
 *
 * Thử lại nhiều lượt vì message chỉ ký được SAU khi block chứa nó được **chấp nhận**
 * — `tx.wait(1)` về trước thời điểm đó một nhịp.
 */
export async function xinChuKy(providerNguon, messageId58, lan = 20) {
  let loi = "";
  for (let i = 0; i < lan; i++) {
    try { return { signed: await providerNguon.send("warp_getMessageAggregateSignature", [messageId58, QUORUM_NUM, ""]), loi: "" }; }
    catch (e) { loi = String(e.shortMessage || e.message || e); await nghi(1500); }
  }
  return { signed: null, loi };
}

// ═══════════════════════════════════════════════════════════════════════════
/**
 * Gọi một thao tác DÀI của console (đẻ / thu hồi chain) rồi xác định sự thật
 * bằng TIẾN TRÌNH + DANH BẠ, không bằng kết quả của lượt POST.
 *
 * 🔴 VÌ SAO KHÔNG THỂ TIN LƯỢT POST — ba tầng cắt, không tầng nào báo rõ:
 *   1. Cloudflare cắt ở ~100s (HTTP 524) nếu đi qua tên miền công khai.
 *   2. `fetch` của Node (undici) có `headersTimeout` MẶC ĐỊNH **300 giây**, và
 *      `AbortSignal.timeout()` KHÔNG nới được nó — phải đổi dispatcher. Đây là
 *      hạn giờ ẩn: mã nguồn không hề ghi một con số nào.
 *   3. Bản thân mạng có thể đứt.
 * Trong khi đó thao tác nay mất ~355 giây với 9 node (restart lần lượt ~31s/node,
 * D-008) và SERVER VẪN CHẠY TỚI CÙNG. Đo thật 2026-08-26: smoke-l1 báo
 * "The operation was aborted due to timeout" trong khi chain đã đẻ xong, vào
 * danh bạ, node đã track subnet — và bài kiểm bỏ lại một chain mồ côi ăn 1 slot.
 *
 * Chỉ tin lượt tiến trình ĐÚNG LÀ LƯỢT CỦA MÌNH (khớp `name` + `kind`): đọc sớm
 * quá là trúng kết quả của lượt TRƯỚC.
 *
 * @returns bản ghi chain trong danh bạ (khi tạo) hoặc `{name}` (khi thu hồi);
 *          ném lỗi nếu danh bạ nói thao tác KHÔNG xảy ra.
 */
export async function thaoTacDai({ consoleUrl, token, danhBaUrl, loai, ten, body, hanGio = 900_000 }) {
  const duong = loai === "create" ? "/api/create" : "/api/revoke";
  let loiPost = null;
  try {
    const r = await fetch(consoleUrl + duong, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const t = await r.text();
    let j; try { j = JSON.parse(t); } catch { throw new Error(`đáp án không phải JSON (HTTP ${r.status})`); }
    if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
    return j;                       // đường thuận: POST về kịp
  } catch (e) {
    loiPost = e;                    // KHÔNG kết luận hỏng — đi hỏi tiến trình
  }

  const t0 = Date.now();
  while (Date.now() - t0 < hanGio) {
    try {
      const r = await fetch(consoleUrl + "/api/progress", {
        headers: { authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15_000),
      });
      const j = await r.json();
      if (j && j.name === ten && j.kind === loai && j.running === false) break;
    } catch { /* console bận giữa đợt restart — thử lại */ }
    await new Promise(s => setTimeout(s, 5_000));
  }

  const rd = await fetch(`${danhBaUrl}?t=${Date.now()}`, { cache: "no-store", signal: AbortSignal.timeout(20_000) });
  const d = await rd.json();
  const chains = d.chains || [], retired = d.retired || [];
  if (loai === "create") {
    const m = chains.find(c => c.name === ten);
    if (m) return m;
    throw new Error(`POST hỏng (${loiPost?.message}) VÀ danh bạ không có "${ten}" — thao tác thật sự không thành`);
  }
  const daThuHoi = !chains.some(c => c.name === ten) && retired.some(c => c.name === ten);
  if (daThuHoi) return { name: ten };
  throw new Error(`POST hỏng (${loiPost?.message}) VÀ danh bạ vẫn còn "${ten}" — chưa thu hồi được`);
}
