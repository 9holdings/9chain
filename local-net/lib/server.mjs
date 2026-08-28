/**
 * server.mjs — **MỘT nguồn duy nhất** cho toạ độ máy chủ công khai.
 *
 * ═══ 🔴 VÌ SAO TỆP NÀY TỒN TẠI ═══
 *
 * Đo `2026-08-28`: **một khái niệm — "máy chủ" — đang có NĂM tên biến môi trường**, mỗi
 * script một tên, mỗi tên một bản chép của cùng một chuỗi `"$A1_SSH_HOST"`:
 *
 *   A1_HOST         check-ports.sh · console-deploy.sh
 *   A1_SSH_HOST     web-deploy.sh
 *   A1_BACKUP_HOST  h6b-backup.sh            ← chính cái SAO LƯU
 *   A1_SSH_TARGET   wallet-tunnel/enter.sh
 *   --host / --target  bốn script .mjs
 *
 * Nó chưa cháy, nhưng **đường cháy đã dựng sẵn và có tên**: **O4** — dời một node sang
 * nhà cung cấp thứ hai. Người làm sẽ đặt *một* biến, thấy vài lệnh trỏ đúng máy mới, rồi
 * `h6b-backup.sh` vẫn **lặng lẽ sao lưu máy cũ**. Sao lưu sai máy không báo lỗi: nó chạy
 * xong, in ra một dòng xanh, và chỉ sai vào đúng ngày cần dùng tới.
 *
 * Cùng hình dạng với `A1Gen ↔ A1_GEN` (D-093) và `--network-id=9001` trong compose
 * (D-111): **hằng số chép tay ở nhiều nơi, không cổng nào nối chúng.**
 *
 * ⇒ Nay **một tên cho một khái niệm**, và `scripts/check-single-source.mjs` canh để không
 * ai chép lại bản thứ hai.
 *
 * Biến môi trường (đều ghi đè được, và **cùng tên ở cả `.mjs` lẫn `.sh`**):
 *   A1_SSH_HOST   đích ssh, dạng `user@host`
 *   A1_SSH_KEY    đường dẫn khoá riêng ssh
 *   A1_SRC_DIR    thư mục mã trên máy chủ
 *   A1_RPC_URL    RPC công khai
 */
import { homedir } from "node:os";
import path from "node:path";

/**
 * 🔴 BỐN CHUỖI DƯỚI ĐÂY LÀ BẢN DUY NHẤT TRONG REPO. Chép một bản thứ hai đi chỗ khác là
 * dựng lại đúng cái bẫy tệp này sinh ra để gỡ — `check-single-source.mjs` sẽ đỏ.
 */
export const SSH_HOST = process.env.A1_SSH_HOST || ""$A1_SSH_HOST"";
// Viết `".ssh/9chain-a1"` thành MỘT chuỗi liền (không `join(".ssh","9chain-a1")`) là chủ ý:
// `check-single-source.mjs` canh bằng chuỗi, và một hằng số bị chẻ ra thì cổng không thấy
// nó ở đâu cả — rồi báo "khai thừa", tức xanh vì lý do sai.
export const SSH_KEY = process.env.A1_SSH_KEY || path.join(homedir(), ".ssh/9chain-a1");
export const SRC_DIR = process.env.A1_SRC_DIR || "~/9chain-a1/src";
export const RPC_URL = process.env.A1_RPC_URL || "https://rpc-a1.9chain.org";
