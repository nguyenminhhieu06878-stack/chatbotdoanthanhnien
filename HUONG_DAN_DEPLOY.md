# Hướng Dẫn Deploy Lên Railway và Vercel

## 🚂 PHẦN 1: Deploy Backend lên Railway

### Bước 1: Chuẩn bị
1. Tạo tài khoản tại [railway.app](https://railway.app)
2. Cài đặt Railway CLI (tùy chọn):
```bash
npm i -g @railway/cli
```

### Bước 2: Tạo Project trên Railway
1. Đăng nhập Railway: https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Chọn repository của bạn
4. Railway sẽ tự động detect và deploy

### Bước 3: Cấu hình Environment Variables
Vào tab "Variables" và thêm các biến sau:

```
PORT=3001
MONGODB_URI=mongodb+srv://admin:u6kbG5LRU5si4MIm@cluster0.vkfer.mongodb.net/doan_thanh_nien?retryWrites=true&w=majority
GROQ_API_KEY=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
CHROMA_HOST=http://localhost:8000
```

**Quan trọng:** 
- Sử dụng MongoDB Atlas thay vì Railway MongoDB để tránh lỗi connection string
- Nếu Railway tự động tạo MongoDB service, hãy xóa nó đi và dùng Atlas
- Đảm bảo connection string có đầy đủ hostname

### Bước 4: Cấu hình Root Directory
1. Vào "Settings" → "Service Settings"
2. Set "Root Directory" = `backend`
3. Set "Start Command" = `npm start`

### Bước 5: Deploy
1. Railway sẽ tự động deploy khi có thay đổi
2. Lấy URL backend từ "Settings" → "Domains"
3. URL sẽ có dạng: `https://your-app.railway.app`

### Lệnh CLI (Tùy chọn)
```bash
# Login
railway login

# Link project
cd backend
railway link

# Deploy
railway up

# Xem logs
railway logs
```

---

## ☁️ PHẦN 2: Deploy Frontend lên Vercel

### Bước 1: Chuẩn bị
1. Tạo tài khoản tại [vercel.com](https://vercel.com)
2. Cài đặt Vercel CLI:
```bash
npm i -g vercel
```

### Bước 2: Cấu hình Environment Variables
Cập nhật file `user/.env.production`:

```env
VITE_API_URL=https://your-backend-url.railway.app
```

**Thay `your-backend-url.railway.app` bằng URL backend từ Railway!**

### Bước 3: Deploy qua Vercel Dashboard
1. Đăng nhập: https://vercel.com
2. Click "Add New" → "Project"
3. Import repository của bạn
4. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `user`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Thêm Environment Variables:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.railway.app`

6. Click "Deploy"

### Bước 4: Deploy qua CLI
```bash
cd user

# Login
vercel login

# Deploy (production)
vercel --prod

# Hoặc deploy preview
vercel
```

---

## 🔧 Kiểm Tra Sau Deploy

### 1. Test Backend
```bash
curl https://your-backend-url.railway.app/api/health
```

### 2. Test Frontend
Mở trình duyệt: `https://your-app.vercel.app`

### 3. Kiểm tra kết nối
- Vào trang chat
- Thử upload tài liệu
- Thử chat với AI

---

## 🐛 Troubleshooting

### Backend không chạy trên Railway
1. Kiểm tra logs: `railway logs` hoặc xem trên Dashboard
2. Đảm bảo `Root Directory` = `backend`
3. Kiểm tra environment variables
4. Đảm bảo MongoDB URI đúng

### Frontend không kết nối được Backend
1. Kiểm tra `VITE_API_URL` trong Vercel
2. Đảm bảo backend đã enable CORS
3. Kiểm tra Network tab trong DevTools

### Railway MongoDB Service Issue
Nếu gặp lỗi `Invalid URL: mongodb://mongo:...@:27017`:
1. Xóa MongoDB service trong Railway (nếu có)
2. Sử dụng MongoDB Atlas thay thế
3. Đảm bảo connection string có hostname đầy đủ
4. Restart deployment sau khi cập nhật environment variables

---

## 📝 Checklist Deploy

### Backend (Railway)
- [ ] Repository đã push lên GitHub
- [ ] Tạo project trên Railway
- [ ] Set Root Directory = `backend`
- [ ] Thêm environment variables
- [ ] Deploy thành công
- [ ] Lấy URL backend

### Frontend (Vercel)
- [ ] Cập nhật `user/.env.production` với backend URL
- [ ] Tạo project trên Vercel
- [ ] Set Root Directory = `user`
- [ ] Thêm `VITE_API_URL` environment variable
- [ ] Deploy thành công
- [ ] Test kết nối với backend

---

## 🚀 Auto Deploy

Cả Railway và Vercel đều hỗ trợ auto deploy:
- Mỗi khi push code lên GitHub
- Railway sẽ tự động deploy backend
- Vercel sẽ tự động deploy frontend

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trên Railway/Vercel Dashboard
2. Xem file `TONG_KET_CUOI_CUNG.md` để biết thêm chi tiết
3. Kiểm tra Network tab trong browser DevTools

---

## 🔐 Bảo Mật

**Quan trọng:** Không bao giờ commit API keys hoặc thông tin nhạy cảm vào Git!
- Sử dụng environment variables
- Thêm `.env` vào `.gitignore`
- Sử dụng placeholder trong documentation