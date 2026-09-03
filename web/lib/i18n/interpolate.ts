/**
 * Thay `{khoa}` trong chuỗi bằng giá trị.
 *
 * 🔴 Ở TỆP RIÊNG, KHÔNG NẰM TRONG `index.tsx` — và đây là một cái bẫy đã cắn thật.
 * `index.tsx` mang `'use client'`, nên một server component nhập `interpolate` từ đó sẽ làm
 * build đổ với `Failed to collect page data for /re-genesis` — thông báo không nhắc
 * gì tới ranh giới client/server, nên rất khó lần.
 * Mà `metadata` (server, sinh lúc build) thì CẦN `interpolate()` để nội suy ngày vào tiêu đề.
 * ⇒ Hàm thuần, không hook, không state: để ở tệp trung lập cho cả hai bên dùng chung.
 *
 * Thiếu khoá thì GIỮ NGUYÊN dấu ngoặc — một chỗ trống lặng lẽ đọc như dữ liệu bị mất,
 * còn `{so}` lộ ra thì sửa được ngay.
 */
export function interpolate(mau: string, value: Record<string, string | number>): string {
  return mau.replace(/\{(\w+)\}/g, (nguyen, k) => (k in value ? String(value[k]) : nguyen));
}
