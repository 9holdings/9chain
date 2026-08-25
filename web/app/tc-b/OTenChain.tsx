'use client';

import { useState } from 'react';
import { Nut, O, LuuY } from '@/components/ui';
import { vi } from '@/lib/i18n/vi';

/**
 * Ô đặt tên chain ngay trên trang chủ.
 *
 * 🔴 KHÔNG tạo gì ở đây. Nó chỉ mang tên sang màn đẻ (`/console/?ten=…`). Genesis là
 * **bất biến**, nên bước ký bằng ví và bước soát lại phải nằm ở màn đẻ — đặt nút
 * "tạo thật" lên trang chủ là biến một cửa một chiều thành một cú bấm vô tình.
 *
 * Luật tên lấy đúng luật server (`console/server.mjs`: `/^[A-Za-z0-9 ]{2,32}$/`).
 * Kiểm ở đây là để người dùng biết SỚM, không phải để thay phép kiểm của server —
 * server vẫn kiểm lại, vì client nào cũng sửa được.
 */
const HOP_LE = /^[A-Za-z0-9 ]{2,32}$/;

export function OTenChain() {
  const [ten, datTen] = useState('');
  const daGo = ten.trim().length > 0;
  const hopLe = HOP_LE.test(ten.trim());

  function di() {
    if (!hopLe) return;
    window.location.href = `/console/?ten=${encodeURIComponent(ten.trim())}`;
  }

  return (
    <div className="mt-8 max-w-xl rounded-card border border-line-dark-2 bg-navy-panel p-5">
      <div className="[&_label]:text-on-dark [&_p]:text-on-dark-3">
        <O
          nhan={vi.trangChu.bNhanTen}
          placeholder={vi.trangChu.bGoiYTen}
          value={ten}
          onChange={(e) => datTen(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') di();
          }}
          autoComplete="off"
          spellCheck={false}
          loi={daGo && !hopLe ? vi.trangChu.bTenXau : undefined}
        />
      </div>
      <div className="mt-4">
        <Nut co="to" onClick={di} disabled={!hopLe}>
          {vi.trangChu.bBatDau}
        </Nut>
      </div>
      <div className="mt-4">
        <LuuY>{vi.trangChu.bLuuY}</LuuY>
      </div>
    </div>
  );
}
