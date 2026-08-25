/**
 * Đặt `data-theme` TRƯỚC khi trình duyệt vẽ khung hình đầu tiên.
 *
 * 🔴 Nếu để React đặt sau khi hydrate, người dùng chọn nền tối sẽ thấy một **cú
 * chớp trắng** mỗi lần mở trang — và đó là thứ duy nhất họ nhớ về giao diện.
 * Script này chạy đồng bộ trong `<head>`, trước mọi thứ khác.
 *
 * 🔴 Chỉ có MỘT đường vào bản tối: thuộc tính `data-theme` trên `<html>`. Sở thích
 * hệ thống được đọc bằng JS **rồi quy về cùng thuộc tính đó** — cố ý KHÔNG dùng
 * `@media (prefers-color-scheme: dark)` trần trong CSS. Hai đường thì phải giữ cho
 * chúng khớp nhau mãi mãi, và lúc lệch thì trang đá nhau ngay khi người dùng đổi
 * cài đặt hệ thống. 9Scan-A1 dùng đúng cơ chế này; lệch cơ chế là hai bề mặt của
 * cùng một sản phẩm hành xử khác nhau.
 */
const MA = `
(function () {
  try {
    var luu = localStorage.getItem('9chain-theme');
    var toi = luu === 'dark' || (luu !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', toi ? 'dark' : 'light');
  } catch (e) {
    /* localStorage bị chặn (chế độ riêng tư nghiêm ngặt / iframe): rơi về bản sáng.
       KHÔNG để trống thuộc tính — CSS chỉ áp bản tối khi data-theme='dark', nên
       thiếu thuộc tính vẫn ra bản sáng, nhưng đặt tường minh thì ThemeToggle đọc
       được trạng thái hiện tại thay vì đoán. */
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: MA }} />;
}
