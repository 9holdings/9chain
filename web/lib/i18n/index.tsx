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
import { KHOA_LUU, laMaHopLe, MAC_DINH, NGON_NGU, tra, type NgonNgu } from './ngonNgu';

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
  bn: () => import('./dicts/bn'),
  pt: () => import('./dicts/pt'),
  vi: () => import('./dicts/vi'),
  ru: () => import('./dicts/ru'),
  ur: () => import('./dicts/ur'),
  id: () => import('./dicts/id'),
  de: () => import('./dicts/de'),
  ja: () => import('./dicts/ja'),
  mr: () => import('./dicts/mr'),
  te: () => import('./dicts/te'),
  tr: () => import('./dicts/tr'),
  ta: () => import('./dicts/ta'),
  ko: () => import('./dicts/ko'),
  it: () => import('./dicts/it'),
  th: () => import('./dicts/th'),
  gu: () => import('./dicts/gu'),
  fa: () => import('./dicts/fa'),
  pl: () => import('./dicts/pl'),
  uk: () => import('./dicts/uk'),
  ms: () => import('./dicts/ms'),
  nl: () => import('./dicts/nl'),
  tl: () => import('./dicts/tl'),
  sw: () => import('./dicts/sw'),
  ha: () => import('./dicts/ha'),
};

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

/** Đọc lựa chọn đã lưu. Không có thì đoán theo ngôn ngữ trình duyệt, rồi mới về EN. */
function maBanDau(): string {
  if (typeof window === 'undefined') return MAC_DINH;
  try {
    const luu = window.localStorage.getItem(KHOA_LUU);
    if (luu && laMaHopLe(luu)) return luu;
  } catch {
    /* Chế độ riêng tư / chặn cookie: không đọc được thì coi như chưa chọn bao giờ. */
  }
  // `navigator.languages` cho cả 'vi-VN' — cắt lấy phần trước dấu gạch.
  for (const uaLang of navigator.languages ?? [navigator.language]) {
    const goc = (uaLang || '').split('-')[0].toLowerCase();
    if (laMaHopLe(goc)) return goc;
  }
  return MAC_DINH;
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
    if (!laMaHopLe(moi)) return;
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

/** Thay `{khoa}` trong chuỗi bằng giá trị. Giữ nguyên dấu ngoặc khi thiếu khoá —
 *  một chỗ trống lặng lẽ đọc như dữ liệu bị mất, còn `{so}` lộ ra thì sửa được ngay. */
export function dien(mau: string, gt: Record<string, string | number>): string {
  return mau.replace(/\{(\w+)\}/g, (nguyen, k) => (k in gt ? String(gt[k]) : nguyen));
}
