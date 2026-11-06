# YTops v3.1

YTops là workspace một chủ sở hữu để nghiên cứu, lập kế hoạch và vận hành các kênh YouTube faceless nhắm thị trường Mỹ. Giao diện quản trị là tiếng Việt; tiêu đề và kịch bản hướng đến người xem Mỹ vẫn có thể được AI tạo bằng tiếng Anh.

## Chức năng

- Dashboard, chấm điểm ngách, nghiên cứu AI, China Signal Lab, chuyển hóa insight thành concept nguyên bản, Content Studio, quản lý kênh, bảng sản xuất, analytics và cổng rủi ro.
- Workspace JSON có kiểm tra schema, giới hạn kích thước, ghi nguyên tử, hàng đợi ghi và backup trước khi thay thế.
- Xuất/nhập JSON; khôi phục yêu cầu xác nhận và tự tạo backup của dữ liệu hiện tại.
- Mật khẩu một chủ sở hữu áp dụng cho mọi API endpoint; OpenAI key chỉ đọc từ biến môi trường trên server.

## Chạy trên Windows

Yêu cầu Node.js 20+.

    cd path\to\ytb
    Copy-Item .env.example .env
    # Sửa .env: điền OPENAI_API_KEY và APP_ACCESS_PASSWORD
    npm.cmd install
    npm.cmd run check:all
    npm.cmd start

Mở `http://localhost:3000`. Trên PowerShell có chính sách chặn `npm.ps1`, hãy dùng `npm.cmd`.

## Biến môi trường

    OPENAI_API_KEY=...
    OPENAI_MODEL=gpt-4.1-mini
    PORT=3000
    MAX_OUTPUT_TOKENS=6000
    APP_ACCESS_PASSWORD=mat-khau-dai-ngau-nhien-duy-nhat

`APP_ACCESS_PASSWORD` là bắt buộc khi `NODE_ENV=production`; ứng dụng sẽ không khởi động production nếu thiếu. Không commit `.env`, dữ liệu workspace hay thư mục `data/backups`.

## Sao lưu và khôi phục

Trong **Cài đặt / API → Sao lưu & khôi phục**, chọn “Xuất bản sao lưu JSON” để tải dữ liệu. Để khôi phục, chọn một tệp JSON đã xuất, đọc cảnh báo xác nhận rồi xác nhận. Server kiểm tra cấu trúc trước khi ghi và lưu bản cũ vào `data/backups/`.

Nếu file `data/workspace.json` bị hỏng, YTops trả lỗi an toàn và **không** thay bằng workspace trống. Khôi phục từ bản mới nhất trong `data/backups/` sau khi kiểm tra tệp.

## Kiểm thử

    npm.cmd run check
    npm.cmd run check:frontend
    npm.cmd test
    npm.cmd run check:all

Test bao gồm xác thực, đọc/ghi workspace, schema không hợp lệ, request quá lớn, dữ liệu hỏng, export/restore, AI task/input và URL không an toàn.

## Docker và VPS

Docker Compose chỉ bind dịch vụ vào `127.0.0.1:3000`; hãy đặt reverse proxy HTTPS phía trước.

    git clone https://github.com/sunswagz/ytb.git
    cd ytb
    git checkout codex/ytops-v3.1-hardening
    cp .env.example .env
    # cấu hình secret thật trong .env
    docker compose up -d --build

Ví dụ Caddy:

    ytops.example.com {
      reverse_proxy 127.0.0.1:3000
    }

Chỉ mở cổng 80/443 qua firewall; không mở 3000 ra Internet. Sao lưu định kỳ thư mục `data/` (bao gồm `backups/`) sang nơi lưu trữ riêng, có mã hóa. Docker cần được cài trên VPS; chạy `docker compose config` trước khi triển khai.

## Khắc phục sự cố

- **401**: nhập đúng mật khẩu ở Cài đặt / API, hoặc xóa phiên bằng nút Đăng xuất và đăng nhập lại.
- **API chưa cấu hình**: kiểm tra `OPENAI_API_KEY` trong `.env`, sau đó khởi động lại ứng dụng.
- **Không đọc được workspace**: không xóa file hiện tại; kiểm tra `data/backups/` và khôi phục bằng một JSON hợp lệ.
- **Port đang dùng**: thay `PORT` trong `.env` và cập nhật reverse proxy.

## Lưu ý bản quyền và nền tảng

Không tự động vượt đăng nhập, scrape trái phép hoặc sao chép script/footage. Mọi insight phải được kiểm chứng độc lập; quyền sử dụng tài sản và điều kiện kiếm tiền YouTube là các kiểm tra riêng.
