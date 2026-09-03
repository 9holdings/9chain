/**
 * Sổ đăng ký ngôn ngữ — nguồn DUY NHẤT cho: mã, tên bản ngữ, chiều viết, thứ tự
 * hiển thị và **mức độ soát** của từng bản dịch.
 *
 * ═══ BA QUYẾT ĐỊNH CỦA DAVID, GHI RA ĐỂ ĐỪNG AI "SỬA LẠI CHO ĐÚNG" ═══
 * ① **Tiếng Anh là mặc định.** Site này tới 2026-08-27 chỉ có tiếng Việt và mặc
 *    định là tiếng Việt. Nay người lạ mở `a1.9chain.org` sẽ gặp tiếng Anh trước.
 * ② **Đúng 30 ngôn ngữ**, chọn theo số người nói trên thế giới.
 * ③ **Tiếng Việt đứng thứ 9 trong danh sách hiển thị** — không phải theo số người
 *    nói (nếu xếp theo đó nó rơi khoảng thứ 21). Đây là lựa chọn có chủ đích, hợp
 *    với mô-típ số 9 của dự án.
 * 🔴 Vì ③ là một NGOẠI LỆ CÓ CHỦ ĐÍCH nằm giữa một danh sách xếp theo quy tắc khác,
 *    nó trông y hệt một lỗi sắp xếp. Có `test/i18n.test.ts` khoá vị trí đó lại —
 *    ai "dọn cho đúng thứ tự" sẽ thấy test đỏ kèm lý do, thay vì đổi im lặng.
 *
 * ═══ 🔴 `soat` — VÌ SAO MỘT TRƯỜNG NHƯ THẾ NÀY PHẢI TỒN TẠI ═══
 * `vi.ts` đặt luật `[?]`: chuỗi nào do agent tự nghĩ ra phải mang dấu cho tới khi
 * David duyệt GIỌNG. 28 bản dịch máy dưới đây là 28 tập chữ **không ai trong đội đọc
 * được để soát** — trong đó có `/re-genesis/`, trang báo với người lạ rằng tài sản
 * của họ sắp bị xoá.
 * ⇒ Không giấu chuyện đó sau 30 lá cờ trông ngang nhau. Ngôn ngữ `soat: 'may'` được
 *   khai ra trong `aria-label` của từng mục, cộng một câu giải thích ở chân bộ chọn
 *   (`components/ChonNgonNgu.tsx`).
 *   ⚠️ Chú thích cũ trỏ vào `BanDich.tsx` — **tệp đó không tồn tại**, và chưa bao giờ
 *   tồn tại trong cây này. Một con trỏ chết trong tài liệu đắt đúng bằng lúc người
 *   sau đi tìm nó để sửa lời khai và không tìm thấy gì.
 * ⚠️ ĐỪNG gỡ dòng khai đó để "trông chuyên nghiệp hơn". Nó chính là thứ phân biệt
 *   bộ 30 ngôn ngữ này với bộ 10 ngôn ngữ mà dự án anh em C1 đã phải GỠ BỎ ngày
 *   26/08 vì *"đa ngữ giả — bấm vào là tiếng Anh hết"*.
 * ⇒ Nâng một ngôn ngữ lên `'nguoi'` khi VÀ CHỈ KHI có người đọc được thứ tiếng đó
 *   soát xong. Đổi trường này là một lời khai, không phải một tinh chỉnh.
 */

/**
 * `'goc'` = BẢN GỐC, không phải bản dịch · `'nguoi'` = có người soát ·
 * `'may'` = máy dịch, chưa ai đọc lại.
 *
 * 🔴 `'goc'` THÊM 2026-09-03 VÌ TIẾNG ANH ĐANG BỊ KHAI SAI.
 * Trước đó chỉ có hai giá trị, nên `en` — thứ tiếng mà 29 bản kia DỊCH RA TỪ ĐÓ —
 * buộc phải nhận `'may'`. Hệ quả đo được trên bản đang chạy: `aria-label` của mục
 * đầu bộ chọn đọc lên là **"English — máy dịch"**, tức trình đọc màn hình nói ngược
 * lại đúng câu giải thích nằm ngay bên dưới nó ("bản tiếng Anh là nguồn sự thật").
 *
 * Vì sao KHÔNG nâng `en` lên `'nguoi'` cho gọn: `'nguoi'` là lời khai "có người đọc
 * được thứ tiếng đó soát xong" — một phép đo về QUY TRÌNH. Bản gốc thì không nằm
 * trong quy trình ấy: nó không được dịch, nên không có gì để soát lại. Gộp hai thứ
 * vào một nhãn là làm mất chính sự phân biệt mà trường này sinh ra để giữ.
 */
export type MucSoat = 'goc' | 'nguoi' | 'may';

export type NgonNgu = {
  /** Mã BCP-47, dùng thẳng cho thuộc tính `lang` của <html>. */
  ma: string;
  /** Tên gọi TRONG CHÍNH thứ tiếng đó — người tìm ngôn ngữ của mình tìm bằng tên này. */
  ten: string;
  /** Tên tiếng Anh, cho `aria-label` và cho người không đọc được bảng chữ kia. */
  tenAnh: string;
  /** Chiều viết. Chỉ 3/30 là `'rtl'`. */
  chieu: 'ltr' | 'rtl';
  soat: MucSoat;
};

/**
 * Thứ tự Ở ĐÂY LÀ THỨ TỰ HIỂN THỊ, không phải bảng xếp hạng số người nói.
 * Tiếng Anh đứng đầu vì nó là mặc định; tiếng Việt ở vị trí **thứ 9** (chỉ số 8).
 * Phần còn lại xếp xấp xỉ theo tổng số người nói.
 *
 * ⚠️ `ma` phải là mã BCP-47 hợp lệ — nó đi thẳng vào `<html lang>`, và trình đọc
 * màn hình chọn giọng theo đó. Gõ sai một mã là cả trang bị đọc bằng ngữ âm khác.
 */
export const NGON_NGU: readonly NgonNgu[] = [
  { ma: 'en', ten: 'English', tenAnh: 'English', chieu: 'ltr', soat: 'goc' },
  { ma: 'zh', ten: '中文（简体）', tenAnh: 'Chinese (Simplified)', chieu: 'ltr', soat: 'may' },
  { ma: 'hi', ten: 'हिन्दी', tenAnh: 'Hindi', chieu: 'ltr', soat: 'may' },
  { ma: 'es', ten: 'Español', tenAnh: 'Spanish', chieu: 'ltr', soat: 'may' },
  { ma: 'ar', ten: 'العربية', tenAnh: 'Arabic', chieu: 'rtl', soat: 'may' },
  { ma: 'fr', ten: 'Français', tenAnh: 'French', chieu: 'ltr', soat: 'may' },
  { ma: 'bn', ten: 'বাংলা', tenAnh: 'Bengali', chieu: 'ltr', soat: 'may' },
  { ma: 'pt', ten: 'Português', tenAnh: 'Portuguese', chieu: 'ltr', soat: 'may' },
  // ── VỊ TRÍ THỨ 9 — David chốt. Xem quyết định ③ ở đầu file. ──────────────────
  // Bản dịch DUY NHẤT có người soát: David đã duyệt toàn bộ 2026-08-27.
  // ⚠️ Chú thích cũ ở đây gọi `vi` là "bản GỐC mà mọi bản khác dịch ra từ đó". SAI,
  // và sai theo hướng dẫn người sau đi nhầm: `en.ts` mới là nguồn của khoá, và nó
  // ghi rõ *"Mọi bản dịch khác dịch RA TỪ ĐÂY, không phải từ `vi.ts`"* — dịch qua
  // hai tầng là nhân đôi chỗ để nghĩa trôi đi. `vi` là bản dịch đầu tiên và là bản
  // được soát, không phải bản gốc.
  { ma: 'vi', ten: 'Tiếng Việt', tenAnh: 'Vietnamese', chieu: 'ltr', soat: 'nguoi' },
  { ma: 'ru', ten: 'Русский', tenAnh: 'Russian', chieu: 'ltr', soat: 'may' },
  { ma: 'ur', ten: 'اردو', tenAnh: 'Urdu', chieu: 'rtl', soat: 'may' },
  { ma: 'id', ten: 'Bahasa Indonesia', tenAnh: 'Indonesian', chieu: 'ltr', soat: 'may' },
  { ma: 'de', ten: 'Deutsch', tenAnh: 'German', chieu: 'ltr', soat: 'may' },
  { ma: 'ja', ten: '日本語', tenAnh: 'Japanese', chieu: 'ltr', soat: 'may' },
  { ma: 'mr', ten: 'मराठी', tenAnh: 'Marathi', chieu: 'ltr', soat: 'may' },
  { ma: 'te', ten: 'తెలుగు', tenAnh: 'Telugu', chieu: 'ltr', soat: 'may' },
  { ma: 'tr', ten: 'Türkçe', tenAnh: 'Turkish', chieu: 'ltr', soat: 'may' },
  { ma: 'ta', ten: 'தமிழ்', tenAnh: 'Tamil', chieu: 'ltr', soat: 'may' },
  { ma: 'ko', ten: '한국어', tenAnh: 'Korean', chieu: 'ltr', soat: 'may' },
  { ma: 'it', ten: 'Italiano', tenAnh: 'Italian', chieu: 'ltr', soat: 'may' },
  { ma: 'th', ten: 'ไทย', tenAnh: 'Thai', chieu: 'ltr', soat: 'may' },
  { ma: 'gu', ten: 'ગુજરાતી', tenAnh: 'Gujarati', chieu: 'ltr', soat: 'may' },
  { ma: 'fa', ten: 'فارسی', tenAnh: 'Persian', chieu: 'rtl', soat: 'may' },
  { ma: 'pl', ten: 'Polski', tenAnh: 'Polish', chieu: 'ltr', soat: 'may' },
  { ma: 'uk', ten: 'Українська', tenAnh: 'Ukrainian', chieu: 'ltr', soat: 'may' },
  { ma: 'ms', ten: 'Bahasa Melayu', tenAnh: 'Malay', chieu: 'ltr', soat: 'may' },
  { ma: 'nl', ten: 'Nederlands', tenAnh: 'Dutch', chieu: 'ltr', soat: 'may' },
  { ma: 'tl', ten: 'Filipino', tenAnh: 'Filipino', chieu: 'ltr', soat: 'may' },
  { ma: 'sw', ten: 'Kiswahili', tenAnh: 'Swahili', chieu: 'ltr', soat: 'may' },
  { ma: 'ha', ten: 'Hausa', tenAnh: 'Hausa', chieu: 'ltr', soat: 'may' },
] as const;

/** Mã của ngôn ngữ mặc định. Đổi giá trị này là đổi thứ người lạ gặp đầu tiên. */
export const MAC_DINH = 'en';

/** Khoá `localStorage`. Cùng tiền tố `9chain-` với `9chain-theme`. */
export const KHOA_LUU = '9chain-lang';

const THEO_MA = new Map(NGON_NGU.map((n) => [n.ma, n]));

/** Có phải một mã trong sổ không. Dùng để lọc giá trị đọc từ `localStorage`. */
export function laMaHopLe(ma: string | null | undefined): boolean {
  return !!ma && THEO_MA.has(ma);
}

/**
 * Tra một mã ra bản ghi. Mã lạ ⇒ trả về bản ghi của ngôn ngữ mặc định.
 * 🔴 KHÔNG trả `undefined`: mọi chỗ gọi hàm này đều đang dựng giao diện, và một
 * `undefined` ở đó biến thành `lang="undefined"` trên <html> — trình đọc màn hình
 * mất giọng mà không có lỗi nào báo.
 */
export function tra(ma: string | null | undefined): NgonNgu {
  return (ma && THEO_MA.get(ma)) || THEO_MA.get(MAC_DINH)!;
}

/**
 * Đoán ngôn ngữ cho NGƯỜI MỚI — người chưa từng chọn gì.
 *
 * 🔴 HÀM THUẦN, TÁCH KHỎI REACT CÓ CHỦ Ý. Đây là logic quyết định thứ tiếng mà mọi
 * người lạ nhìn thấy đầu tiên; để nó nằm trong một `useEffect` thì không kiểm được
 * bằng test, và cách duy nhất để thử là giả lập `navigator` trên trình duyệt — mà
 * tải lại trang là mất giả lập. Đã thử và không đo được.
 *
 * Luật: lấy ngôn ngữ đầu tiên trong danh sách của trình duyệt mà site có trong sổ.
 * `vi-VN` khớp `vi` (cắt phần sau dấu gạch). Không khớp gì thì về mặc định.
 *
 * ⚠️ Với `output: 'export'`, HTML luôn ship ở tiếng Anh rồi mới lật sau khi hydrate.
 * Người đọc tiếng Việt vì thế thấy MỘT NHÁY tiếng Anh. Đó là cái giá của xuất tĩnh,
 * đã biết trước, không phải lỗi — muốn hết thì phải có URL riêng cho từng ngôn ngữ.
 */
export function doanNgonNgu(cuaTrinhDuyet: readonly string[] | undefined): string {
  for (const l of cuaTrinhDuyet ?? []) {
    const goc = (l || '').split('-')[0].toLowerCase();
    if (laMaHopLe(goc)) return goc;
  }
  return MAC_DINH;
}
