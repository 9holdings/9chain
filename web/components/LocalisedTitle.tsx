'use client';

import { useLocalisedTitle } from '@/lib/pageTitle';

/**
 * Vỏ component cho `useLocalisedTitle()` — không vẽ gì cả.
 *
 * Tồn tại vì `app/layout.tsx` là **server component** nên không gọi hook được, và
 * `LanguageProvider` thì KHÔNG dùng được: nó là chính cái provider, nên `useT()`
 * gọi bên trong nó sẽ không thấy context của nó. Đặt component này BÊN TRONG provider
 * là cách duy nhất để nó đọc được từ điển đang chọn.
 *
 * 🔴 `usePathname()` chứ KHÔNG phải `useSearchParams()`. Với `output: 'export'`,
 * `useSearchParams` buộc phải có biên `<Suspense>` bọc ngoài, mà một biên Suspense
 * thừa khiến Next ghi ra HTML khung xương kèm marker `<template id="B:1">` **không
 * bao giờ được giải** trên trình duyệt — xem ràng buộc 1 trong `lib/i18n/index.tsx`
 * và cổng `scripts/check-static-export.mjs`. `usePathname` không cần Suspense.
 */
export function LocalisedTitle() {
  useLocalisedTitle();
  return null;
}
