// guard.mjs — Lớp bảo vệ dùng chung cho các dịch vụ HTTP của 9Chain-A1
// (console đẻ chain, faucet). Không phụ thuộc framework.
//
// Cung cấp:
//   clientIp(req, trustProxy)  lấy IP thật, chỉ tin X-Forwarded-For khi ĐỨNG SAU proxy
//   rateLimit(opts)            giới hạn theo cửa sổ trượt, khoá theo IP (hoặc khoá tuỳ ý)
//   requireToken(opts)         xác thực Bearer token, so sánh CHỐNG TIMING ATTACK
//   serialQueue()              xếp hàng tuần tự cho thao tác không được chạy song song
//
// Nguyên tắc: mọi thứ ở đây phải "đóng mặc định" — thiếu cấu hình thì TỪ CHỐI,
// không im lặng cho qua. Cấu hình sai mà vẫn chạy là cách hỏng nguy hiểm nhất.
import { timingSafeEqual, randomBytes } from "node:crypto";

/**
 * IP của client.
 *
 * X-Forwarded-For do client tự đặt được → CHỈ tin khi ta biết chắc có reverse
 * proxy đứng trước (trustProxy=true). Tin nhầm = ai cũng giả IP để thoát rate-limit.
 *
 * Chuỗi proxy của 9Chain-A1 là: người dùng → Cloudflare → Caddy → dịch vụ.
 * Cloudflare đặt `CF-Connecting-IP` = IP THẬT của người dùng và ghi đè header này
 * ở biên, nên client không giả được. Ưu tiên header đó; nếu không có thì mới
 * lấy phần tử ĐẦU của X-Forwarded-For.
 *
 * ⚠️ Nếu lấy sai (vd luôn ra IP của Caddy), rate-limit sẽ gom mọi người dùng vào
 * chung một khoá → một người spam là cả thế giới bị chặn. Kiểm tra bằng
 * endpoint /whoami trước khi mở public.
 */
export function clientIp(req, trustProxy = false) {
  if (trustProxy) {
    const cf = req.headers["cf-connecting-ip"];
    if (cf) return String(cf).trim();
    const xff = req.headers["x-forwarded-for"];
    if (xff) return String(xff).split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

/**
 * Giới hạn tần suất theo cửa sổ trượt, lưu trong bộ nhớ.
 *
 * Trong bộ nhớ = mất khi restart và không chia sẻ giữa nhiều tiến trình. Với
 * quy mô 1 server thì đủ; nếu sau này chạy nhiều bản sao thì phải đổi sang Redis.
 *
 * @param {{max:number, windowMs:number, name?:string}} opts
 * @returns {(key:string) => {ok:boolean, retryAfter:number, remaining:number}}
 */
export function rateLimit({ max, windowMs, name = "rl" }) {
  /** @type {Map<string, number[]>} */
  const hits = new Map();

  // Dọn rác định kỳ để Map không phình vô hạn khi bị quét bằng nhiều IP.
  // unref() để timer này không giữ tiến trình sống.
  const sweep = setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [k, arr] of hits) {
      const kept = arr.filter(t => t > cutoff);
      if (kept.length) hits.set(k, kept);
      else hits.delete(k);
    }
  }, Math.max(windowMs, 60_000));
  sweep.unref?.();

  return function check(key) {
    const now = Date.now();
    const cutoff = now - windowMs;
    const arr = (hits.get(key) || []).filter(t => t > cutoff);

    if (arr.length >= max) {
      const retryAfter = Math.ceil((arr[0] + windowMs - now) / 1000);
      hits.set(key, arr);
      return { ok: false, retryAfter, remaining: 0, name };
    }
    arr.push(now);
    hits.set(key, arr);
    return { ok: true, retryAfter: 0, remaining: max - arr.length, name };
  };
}

/**
 * So sánh chuỗi bí mật chống timing attack.
 * So bằng `===` sẽ dừng ngay ở ký tự đầu khác nhau → thời gian phản hồi rò rỉ
 * độ dài tiền tố đúng, đủ để dò ra token từng ký tự một.
 */
export function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  // timingSafeEqual ném lỗi nếu khác độ dài → băm về cùng độ dài bằng cách so
  // trên buffer đã đệm, đồng thời vẫn phải kiểm tra độ dài thật.
  if (ba.length !== bb.length) {
    // Vẫn chạy một phép so để thời gian không phụ thuộc độ dài.
    timingSafeEqual(ba, ba);
    return false;
  }
  return timingSafeEqual(ba, bb);
}

/**
 * Bắt buộc có Bearer token.
 * @param {string} token bí mật đã cấu hình
 * @returns {(req) => boolean}
 */
export function requireToken(token) {
  return function check(req) {
    const h = req.headers["authorization"] || "";
    const m = /^Bearer\s+(.+)$/i.exec(String(h));
    // Cho phép cả header riêng để tiện gọi từ trình duyệt/fetch.
    const given = m ? m[1] : req.headers["x-a1-token"];
    if (!given) return false;
    return safeEqual(given, token);
  };
}

/**
 * Hàng đợi tuần tự: đảm bảo các tác vụ chạy LẦN LƯỢT, không chồng nhau.
 * Dùng cho thao tác có tác dụng phụ toàn cục (vd: tạo L1 rồi restart node —
 * hai lượt chạy song song sẽ restart giữa chừng nhau và hỏng cả hai).
 */
export function serialQueue({ maxPending = 8 } = {}) {
  let tail = Promise.resolve();
  let pending = 0;

  return {
    get pending() { return pending; },
    /** @param {() => Promise<any>} fn */
    run(fn) {
      if (pending >= maxPending) {
        return Promise.reject(new Error(`hàng đợi đầy (${pending}/${maxPending}), thử lại sau`));
      }
      pending++;
      const p = tail.then(fn, fn); // chạy tiếp kể cả khi tác vụ trước lỗi
      tail = p.then(() => {}, () => {});
      return p.finally(() => { pending--; });
    },
  };
}

/** Sinh token ngẫu nhiên đủ mạnh — dùng khi in hướng dẫn cho người vận hành. */
export function suggestToken() {
  return randomBytes(24).toString("base64url");
}

/**
 * Đọc một bí mật BẮT BUỘC từ env. Thiếu thì thoát ngay kèm hướng dẫn,
 * thay vì chạy tiếp ở trạng thái không an toàn.
 */
export function requireSecret(name, { hint = "" } = {}) {
  const v = process.env[name];
  if (!v) {
    console.error(`FATAL: thiếu ${name}.`);
    if (hint) console.error(`  ${hint}`);
    console.error(`  Gợi ý sinh token: ${name}=${suggestToken()}`);
    process.exit(1);
  }
  if (v.length < 16) {
    console.error(`FATAL: ${name} quá ngắn (${v.length} ký tự, tối thiểu 16).`);
    console.error(`  Gợi ý: ${name}=${suggestToken()}`);
    process.exit(1);
  }
  return v;
}
