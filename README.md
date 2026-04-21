# 📱 StudyHub Mobile — Expo Router v6

Ứng dụng học trực tuyến xây dựng với kiến trúc **Expo Router v6** (file-based routing), TypeScript strict, New Architecture, React Compiler.

---

## ⚡ Tech Stack

| Package | Version |
|---|---|
| Expo SDK | 54 |
| expo-router | ~6.0 |
| React | 19.1 |
| React Native | 0.81.5 |
| TypeScript | ~5.9 |
| New Architecture | ✅ Enabled |
| React Compiler | ✅ Enabled |

---

## 🚀 Bắt đầu

```bash
# 1. Cài dependencies
npm install

# 2. Sửa BASE_URL trong api/apiClient.ts
#    - Android emulator:  http://10.0.2.2:8000/api
#    - iOS simulator:     http://localhost:8000/api
#    - Thiết bị thật:     http://192.168.x.x:8000/api

# 3. Chạy
npx expo start
# → nhấn 'a' (Android) hoặc 'i' (iOS) hoặc quét QR bằng Expo Go
```

---

## 📁 Cấu trúc dự án

```
StudyHubExpo/
├── app/                         ← File-based routing (Expo Router)
│   ├── _layout.tsx              ← Root layout (AuthProvider + Stack)
│   ├── index.tsx                ← Auth guard redirect
│   ├── (auth)/                  ← Group: không hiện trên tab bar
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── verify.tsx           ← OTP 6 ô
│   ├── (tabs)/                  ← Group: bottom tab navigator
│   │   ├── _layout.tsx
│   │   ├── index.tsx            ← Trang chủ
│   │   ├── courses.tsx          ← Khoá học của tôi
│   │   └── profile.tsx          ← Tài khoản
│   ├── search.tsx               ← Tìm kiếm + lọc
│   ├── course/[id].tsx          ← Chi tiết khoá học
│   ├── player/[id].tsx          ← Trình phát video
│   ├── checkout/[id].tsx        ← Thanh toán PayOS
│   └── lecturer/
│       ├── statistics.tsx       ← Thống kê doanh thu
│       ├── courses.tsx          ← Quản lý khoá học
│       └── editor/[id].tsx      ← Soạn thảo khoá học
│
├── api/
│   ├── apiClient.ts             ← Axios + Bearer token interceptor
│   └── courseApi.ts             ← Tất cả API endpoints
│
├── context/
│   └── AuthContext.tsx          ← Auth state + SecureStore
│
├── components/
│   └── ui.tsx                   ← CourseCard, Button, Input, StatCard…
│
├── constants/
│   ├── theme.ts                 ← Colors, spacing, radius
│   └── types.ts                 ← TypeScript interfaces
│
└── utils/
    └── formatPrice.ts           ← formatPrice, effectivePrice
```

---

## 🔗 API Mapping

| Screen | Method | Endpoint |
|---|---|---|
| login.tsx | POST | `/login` |
| register.tsx | POST | `/register` |
| verify.tsx | POST | `/register/verify-email` |
| (tabs)/index.tsx | GET | `/student/home` |
| search.tsx | GET | `/courses/search` |
| course/[id].tsx | GET | `/courses/{id}/detail` |
| player/[id].tsx | GET | `/student/courses/{id}/learn` |
| player/[id].tsx | POST | `/student/courses/{id}/progress` |
| (tabs)/courses.tsx | GET | `/student/my-courses` |
| course/[id].tsx | POST | `/student/enroll/{id}` |
| checkout/[id].tsx | POST | `/student/courses/{id}/checkout` |
| lecturer/statistics.tsx | GET | `/lecturer/statistics` |
| lecturer/courses.tsx | GET/POST | `/lecturer/courses` |
| lecturer/editor/[id].tsx | GET/PUT | `/lecturer/courses/{id}/draft` |
| lecturer/editor/[id].tsx | POST | `/lecturer/courses/{id}/publish` |

---

## 💡 Điểm khác biệt so với kiến trúc cũ

| | Expo Router v6 (dự án này) | React Navigation cũ |
|---|---|---|
| Routing | File-based (`app/`) | Code-based (`Stack.Screen`) |
| Params | `useLocalSearchParams()` | `route.params` |
| Navigate | `router.push('/course/123')` | `navigation.navigate('CourseDetail', {id})` |
| Deep link | Tự động | Cấu hình thủ công |
| Type safety | `typedRoutes: true` | Manual |
| Auth guard | `app/index.tsx` redirect | Navigator wrapper |
