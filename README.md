# Ecommerce Music FE

Frontend cho marketplace mua bán nhạc bản quyền. Ứng dụng được xây bằng Next.js App Router và tập trung vào trải nghiệm tìm track, nghe preview, mua license và quản lý thư viện cá nhân.

## Tech Stack

- Next.js 16.2.6
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- TanStack Query
- Axios
- React Hook Form + Zod
- Framer Motion
- Wavesurfer.js
- shadcn/ui + Radix UI + Lucide React

## Yêu cầu môi trường

- Node.js 20+ hoặc bản tương thích với Next.js 16
- Backend API đang chạy ở máy local hoặc môi trường staging

## Biến môi trường

Tạo file `.env` trong `ecommerce_music_fe/` với tối thiểu:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Nếu đổi backend host hoặc port, chỉ cần cập nhật giá trị này.

## Cài đặt và chạy local

```bash
npm install
npm run dev
```

Các lệnh hữu ích khác:

```bash
npm run lint
npm run build
```

## Cấu trúc thư mục chính

- `src/app/`: route pages và layout
- `src/features/`: các feature theo nghiệp vụ
- `src/components/`: component dùng chung
- `src/lib/`: helper, http client, utilities
- `src/store/`: state toàn cục với Zustand
- `src/constants/`: hằng số dùng lại
- `src/types/`: type dùng chung

## Luồng chính của frontend

- Public user xem danh sách track và preview.
- Buyer đăng nhập để mua license và xem thư viện đã mua.
- Seller quản lý track, giá, và trạng thái bài nhạc.
- Admin vào các màn hình quản trị để quản lý user, music, genre và order.

## Ghi chú kỹ thuật

- Axios client đang ghép base URL từ `NEXT_PUBLIC_API_URL`.
- Global player và preview audio dùng Wavesurfer.js.
- UI hiện tại ưu tiên dark surfaces, glow accents và glassmorphism.
