# Web Server Demo – Login/Register + Logs

## Giới thiệu

Dự án này là một **web server nhỏ** được xây dựng bằng **Node.js + HTML + CSS**. Mục tiêu:

* Minh họa cách hoạt động của **HTTP Request/Response**.
* Cung cấp chức năng **Đăng ký** và **Đăng nhập** cơ bản.
* Lưu và hiển thị lại **Log Request/Response** để phân tích.

## Công nghệ sử dụng

* Node.js
* CORS
* HTML, CSS, JavaScript (Frontend)


## 📂 Project Structure

- **WEB_SERVER/**
  - **src/**
    - **assets/**
      - `imageBackground.jpg`
    - **backend/**
      - `logs.js`
      - `script.js`
      - `server.js`
    - **frontend/**
      - **pages/**
        - **page_login/**
          - `index.html`
          - `style.css`
        - **page_logs_request_response/**
          - `index.html`
          - `style.css`
        - **page_registration/**
          - `index.html`
          - `style.css`
  - `package-lock.json`
  - `package.json`
  - `README.md`



## Cài đặt & Chạy

### 1. Cài Node.js

Tải và cài Node.js. Kiểm tra phiên bản:

```bash
node -v
npm -v
```

### 2. Cài dependencies

Trong thư mục `backend/`:

```bash
npm init -y
npm install express cors
```

### 3. Chạy server

```bash
node server.js
```

Server chạy mặc định tại: http://localhost:3000
Chạy index.html ở chrome để chạy demo

## API Backend

### 1. `POST /register`

**Body JSON**

```json
{ "username": "admin", "email": "admin@gmail.com", "password": "123" }
```

**Response**

```json
{ "message": "Register success!" }
```

### 2. `POST /login`

**Body JSON**

```json
{ "username": "admin", "password": "123" }
```

**Response (success)**

```json
{ "message": "Login success!" }
```

**Response (fail)**

```json
{ "message": "Invalid credentials!" }
```

### 3. `GET /logs`

Trả về danh sách log của tất cả request/response.

**Response**

```json
[
  {
    "time": "23/09/2025, 21:00:00",
    "method": "POST",
    "path": "/login",
    "body": { "username": "admin", "password": "123" },
    "response": { "statusCode": 200, "body": { "message": "Login success!" } }
  }
]
```

## Chức năng chính

* **Đăng ký**: Lưu thông tin người dùng vào database giả (object trong JS).
* **Đăng nhập**: Kiểm tra username/password và trả kết quả.
* **Ghi log**: Lưu mọi request/response và cung cấp API `/logs` để xem lại.

## Phân chia công việc (gợi ý)

* **Backend**: dựng server, viết API `/register`, `/login`, `/logs`.
* **Frontend**: giao diện login/register, gọi API bằng `fetch()`.
* **Tích hợp**: test kết nối frontend ↔ backend.
* **Báo cáo**: giải thích flow HTTP request/response, kèm screenshot.

## Lưu ý

* Đây là **demo học tập**.
* Không dùng database thật.
* Password chưa được mã hóa.
* Chưa có bảo mật nâng cao.

## Tổng kết
* Đây là bản demo web server để phân tích rõ requests/response để phục vụ cho đề tài Application Floor của môn NWC201.
* Cảm ơn các bạn đã theo dõi và ủng hộ.
