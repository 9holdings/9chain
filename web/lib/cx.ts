/**
 * Nối class, bỏ giá trị rỗng.
 *
 * 🔴 Nằm ở đây chứ KHÔNG nằm trong `components/ui` — file đó có `'use client'`, và
 * mọi thứ export từ một module client chỉ được **render như component** hoặc truyền
 * qua props; server component GỌI nó sẽ làm build đỏ với câu lỗi
 * "Attempted to call gop() from the server but gop is on the client", chỉ đúng tên
 * hàm chứ không nói gì về ranh giới đã bị vượt. Hàm thuần thì để ngoài ranh giới.
 */
export function gop(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(' ');
}
