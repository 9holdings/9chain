'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { EN, type Tu } from './en';
export { dien } from './interpolate';
import { doanNgonNgu, KHOA_LUU, laMaHopLe, MAC_DINH, NGON_NGU, tra, type NgonNgu } from './languages';

/**
 * Bộ máy đa ngôn ngữ của a1.9chain.org — 30 ngôn ngữ, tiếng Anh mặc định.
 *
 * ═══ BA RÀNG BUỘC, MỖI CÁI LÀ MỘT CÁI BẪY ĐÃ CÓ NGƯỜI TRẢ TIỀN ═══
 * Chép từ 9Scan-A1 (`lib/i18n/explorer/index.ts`), họ đã đi trước và đo được giá.
 *
 * 1. 🔴 **KHÔNG thêm biên `<Suspense>`, KHÔNG dùng `use()`/`lazy()`.**
 *    Với `output: 'export'`, một biên Suspense thừa làm Next ghi ra HTML khung
 *    xương kèm marker `<template id="B:1">`, và biên đó **không bao giờ được giải**
 *    trên trình duyệt. Dùng `useState` + `useEffect`.
 *    (Cổng `scripts/check-static-export.mjs` của ta đã canh đúng việc này từ trước.)
 *
 * 2. 🔴 **MỘT provider cho cả cây.** Nếu mỗi hook tự nạp từ điển thì các component
 *    đổi trạng thái ở những nhịp khác nhau, và người dùng thấy một trang **nửa
 *    tiếng Anh nửa tiếng Việt** trong vài khung hình. Cả cây phải lật cùng lúc.
 *
 * 3. 🔴 **`BO_NAP` phải là các lời gọi `import()` TĨNH, viết tay từng dòng.**
 *    `import(\`./dicts/${ma}\`)` với biến khiến bundler gom CẢ THƯ MỤC vào một
 *    chunk — tức quay về đúng chỗ cũ mà trông như đã sửa.
 *    Phép đo của 9Scan: nhập tĩnh 30 từ điển đưa First Load JS từ **264 kB lên
 *    528 kB**. Trần của ta là 160 KB gzip và trang nặng nhất đang ở 130 KB.
 *
 * ═══ VÌ SAO TIẾNG ANH ĐI CÙNG BUNDLE, 29 BẢN KIA THÌ KHÔNG ═══
 * `EN` là **nguồn sự thật của khoá** và là bản rơi về khi một khoá thiếu hoặc khi
 * chunk nạp hỏng. Nó phải có mặt ngay từ khung hình đầu, không chờ mạng.
 */

type BoiCanh = {
  ma: string;
  ngonNgu: NgonNgu;
  t: Tu;
  /** `true` khi đang nạp chunk của một ngôn ngữ khác EN. Dùng để tránh nháy chữ. */
  dangNap: boolean;
  datNgonNgu: (ma: string) => void;
};

const Ctx = createContext<BoiCanh | null>(null);

/**
 * 🔴 VIẾT TAY TỪNG DÒNG — xem ràng buộc 3 ở trên. Đừng gom thành vòng lặp.
 * Thiếu một dòng ở đây = người dùng chọn tiếng của mình rồi nhận lại tiếng Anh,
 * **không lỗi, không cảnh báo**, chỉ có họ chịu. `kiemBoNap()` bên dưới bắt việc đó.
 */
const BO_NAP: Record<string, () => Promise<{ default: Tu }>> = {
  zh: () => import('./dicts/zh'),
  hi: () => import('./dicts/hi'),
  es: () => import('./dicts/es'),
  ar: () => import('./dicts/ar'),
  fr: () => import('./dicts/fr'),
  pt: () => import('./dicts/pt'),
  ru: () => import('./dicts/ru'),
  de: () => import('./dicts/de'),
  ja: () => import('./dicts/ja'),
  bn: () => import('./dicts/bn'),
  ur: () => import('./dicts/ur'),
  id: () => import('./dicts/id'),
  mr: () => import('./dicts/mr'),
  tr: () => import('./dicts/tr'),
  it: () => import('./dicts/it'),
  ko: () => import('./dicts/ko'),
  pl: () => import('./dicts/pl'),
  nl: () => import('./dicts/nl'),
  th: () => import('./dicts/th'),
  uk: () => import('./dicts/uk'),
  ms: () => import('./dicts/ms'),
  fa: () => import('./dicts/fa'),
  tl: () => import('./dicts/tl'),
  sw: () => import('./dicts/sw'),
  ha: () => import('./dicts/ha'),
  te: () => import('./dicts/te'),
  ta: () => import('./dicts/ta'),
  gu: () => import('./dicts/gu'),
  vi: () => import('./dicts/vi'),
};

/**
 * 🔴 ĐANG DỰNG DỞ CÓ CHỦ Ý — 28 từ điển còn lại chưa có (2026-08-27).
 *
 * Sổ khai 30 ngôn ngữ; `BO_NAP` mới có 2 (EN trong bundle + VI). Đó KHÔNG phải lỗi
 * quên: làm lát cắt dọc EN+VI chạy trước rồi mới sinh 28 bản còn lại là để nếu bộ
 * máy sai thì phát hiện sau HAI từ điển, không phải sau ba mươi.
 *
 * ⚠️ Trong lúc dở dang, ngôn ngữ chưa có từ điển PHẢI hiện ra là **chưa có** trong
 * bộ chọn — `coTuDien()` bên dưới là thứ bộ chọn dùng để biết. Để chúng trông như
 * đã dùng được rồi lặng lẽ rơi về tiếng Anh là đúng kiểu hỏng tệ nhất: người dùng
 * chọn tiếng của mình, thấy tiếng Anh, và không có gì nói cho họ biết vì sao.
 */
export function coTuDien(ma: string): boolean {
  return ma === MAC_DINH || ma in BO_NAP;
}


/**
 * Cổng chặn LỆCH SỔ: mọi ngôn ngữ trong sổ (trừ EN) phải có một dòng trong `BO_NAP`,
 * và ngược lại. Chỉ chạy ở dev — ở sản phẩm nó chỉ tốn byte mà không cứu được ai.
 */
export function kiemBoNap(): string[] {
  const trongSo = NGON_NGU.map((n) => n.ma).filter((m) => m !== MAC_DINH);
  const trongNap = Object.keys(BO_NAP);
  return [
    ...trongSo.filter((m) => !trongNap.includes(m)).map((m) => `${m}: có trong sổ, THIẾU trong BO_NAP`),
    ...trongNap.filter((m) => !trongSo.includes(m)).map((m) => `${m}: có trong BO_NAP, THIẾU trong sổ`),
  ];
}

/**
 * Đọc lựa chọn đã lưu. Không có thì đoán theo ngôn ngữ trình duyệt, rồi mới về EN.
 *
 * 🔴 LỌC QUA `coTuDien()` Ở CẢ HAI ĐƯỜNG — bug này bắt được lúc viết test, không
 * phải lúc chạy. `laMaHopLe()` chỉ hỏi "sổ có mã này không", mà sổ khai đủ 30 trong
 * khi mới 2 từ điển tồn tại. Không lọc thì:
 *   • người dùng trình duyệt tiếng Nhật ⇒ `ma = 'ja'` ⇒ `BO_NAP['ja']` không có ⇒
 *     chữ rơi về tiếng Anh, NHƯNG `<html lang>` vẫn bị đặt thành `ja`.
 *   • trình đọc màn hình đọc **tiếng Anh bằng ngữ âm tiếng Nhật** — không lỗi, không
 *     cảnh báo, và người dùng bằng mắt không thấy gì bất thường để báo lại.
 * Cùng lớp lỗi với `lang="undefined"` mà `tra()` sinh ra để chặn.
 *
 * Áp cho cả giá trị đã LƯU: một ngôn ngữ có thể bị gỡ khỏi `BO_NAP` về sau, và lúc
 * đó `localStorage` của người dùng vẫn còn trỏ vào nó.
 */
function maBanDau(): string {
  if (typeof window === 'undefined') return MAC_DINH;
  try {
    const luu = window.localStorage.getItem(KHOA_LUU);
    if (luu && laMaHopLe(luu) && coTuDien(luu)) return luu;
  } catch {
    /* Chế độ riêng tư / chặn cookie: không đọc được thì coi như chưa chọn bao giờ. */
  }
  const doan = doanNgonNgu(navigator.languages ?? [navigator.language]);
  return coTuDien(doan) ? doan : MAC_DINH;
}

export function NhaCungCapNgonNgu({ children }: { children: ReactNode }) {
  // 🔴 Khởi tạo bằng MAC_DINH, KHÔNG bằng `maBanDau()`. Với xuất tĩnh, HTML được
  // sinh sẵn ở tiếng Anh; nếu lượt render đầu trên trình duyệt đã khác HTML thì
  // React báo lệch hydrate và bỏ cả cây. Đọc lựa chọn ở `useEffect` — tức SAU khi
  // hydrate xong — là cách duy nhất đúng ở đây.
  const [ma, datMa] = useState<string>(MAC_DINH);
  const [tu, datTu] = useState<Tu>(EN);
  const [dangNap, datDangNap] = useState(false);

  useEffect(() => {
    const m = maBanDau();
    if (m !== MAC_DINH) datMa(m);
  }, []);

  useEffect(() => {
    let huy = false;
    if (ma === MAC_DINH) {
      datTu(EN);
      datDangNap(false);
      return;
    }
    const nap = BO_NAP[ma];
    if (!nap) {
      // Lệch sổ — `kiemBoNap()` đáng lẽ đã bắt ở dev. Rơi về EN, đừng để trang trắng.
      datTu(EN);
      return;
    }
    datDangNap(true);
    nap()
      .then((m) => {
        if (huy) return;
        datTu(m.default);
        datDangNap(false);
      })
      .catch(() => {
        // Chunk nạp hỏng (mạng đứt, bản deploy cũ). Giữ EN — đọc được bằng thứ
        // tiếng khác vẫn hơn nhìn một trang trống.
        if (!huy) {
          datTu(EN);
          datDangNap(false);
        }
      });
    return () => {
      huy = true;
    };
  }, [ma]);

  // 🔴 `lang` và `dir` phải đổi CÙNG từ điển. `lang` sai thì trình đọc màn hình
  // chọn giọng sai — cả trang bị đọc bằng ngữ âm khác. `dir` sai thì tiếng Ả Rập,
  // Urdu và Ba Tư (3/30) hiện ngược chiều.
  useEffect(() => {
    const n = tra(ma);
    document.documentElement.setAttribute('lang', n.ma);
    document.documentElement.setAttribute('dir', n.chieu);
  }, [ma]);

  const datNgonNgu = useCallback((moi: string) => {
    // Bộ chọn đã vô hiệu hoá mục không có từ điển, nhưng chặn ở đây nữa: một lời
    // gọi từ chỗ khác (deep link, console) không được đặt site vào trạng thái
    // `lang` nói một đằng, chữ một nẻo.
    if (!laMaHopLe(moi) || !coTuDien(moi)) return;
    datMa(moi);
    try {
      window.localStorage.setItem(KHOA_LUU, moi);
    } catch {
      /* Không lưu được thì lựa chọn chỉ sống hết phiên này — vẫn hơn là không cho đổi. */
    }
  }, []);

  const giaTri = useMemo<BoiCanh>(
    () => ({ ma, ngonNgu: tra(ma), t: tu, dangNap, datNgonNgu }),
    [ma, tu, dangNap, datNgonNgu],
  );

  return <Ctx.Provider value={giaTri}>{children}</Ctx.Provider>;
}

/**
 * Lấy từ điển đang dùng.
 *
 * ⚠️ Gọi NGOÀI provider thì rơi về EN thay vì ném lỗi. Lý do: những chỗ như trang
 * 404 hoặc một component được dựng riêng trong test không nhất thiết có provider,
 * và làm trắng trang vì thiếu context là đổi một lỗi chữ lấy một lỗi chết trang.
 */
export function useT(): Tu {
  return useContext(Ctx)?.t ?? EN;
}

/** Trạng thái ngôn ngữ — cho bộ chọn và cho những chỗ cần biết chiều viết. */
export function useNgonNgu() {
  const c = useContext(Ctx);
  return {
    ma: c?.ma ?? MAC_DINH,
    ngonNgu: c?.ngonNgu ?? tra(MAC_DINH),
    dangNap: c?.dangNap ?? false,
    datNgonNgu: c?.datNgonNgu ?? (() => {}),
  };
}
