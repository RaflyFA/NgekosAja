# Setup Sistem Role - Login & Register

Panduan untuk mengatur sistem role (Mahasiswa/Pemilik Kos) pada aplikasi ngekos-aja.

## Apa yang telah ditambahkan:

### 1. **Update Form Login & Register**
- Tambahan pilihan role: **Mahasiswa** (user biasa) dan **Pemilik Kos** (admin)
- Interface yang user-friendly dengan tombol pilihan
- Penyimpanan role saat login/register

### 2. **Redirect Logic Otomatis**
- **User Biasa (Mahasiswa)** → Diarahkan ke **Beranda** (`/`)
- **Admin (Pemilik Kos)** → Diarahkan ke **Dashboard** (`/dashboard`)

### 3. **Database Structure**
Tabel `profiles` dibuat untuk menyimpan:
- `id` - User ID (dari auth.users)
- `email` - Email pengguna
- `full_name` - Nama lengkap
- `role` - Role pengguna: `'user'` atau `'admin'`
- `created_at`, `updated_at` - Timestamps

### 4. **Utility Functions** ([lib/roles.ts](lib/roles.ts))
- `getUserRole(userId)` - Ambil role dari ID pengguna
- `getCurrentUserRole()` - Ambil role user yang sedang login
- `updateUserRole(userId, role)` - Update role pengguna

### 5. **Middleware** ([middleware.ts](middleware.ts))
- Proteksi rute dashboard untuk memastikan hanya user yang login bisa akses
- Redirect otomatis ke login jika belum authenticated

## Langkah Setup di Supabase:

### 1. Jalankan SQL Migration
Buka **SQL Editor** di Supabase dashboard dan jalankan SQL dari:
```
supabase/migrations/001_create_profiles.sql
```

SQL ini akan:
- Membuat tabel `profiles`
- Setup Row Level Security (RLS)
- Membuat policies untuk keamanan

### 2. Konfigurasi Environment Variables
Pastikan `.env.local` memiliki:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Testing:

### Test User Biasa:
1. Buka `/register`
2. Pilih "Mahasiswa" sebagai role
3. Isi form dan submit
4. Verifikasi redirect ke beranda (`/`)

### Test Admin:
1. Buka `/register`
2. Pilih "Pemilik Kos" sebagai role
3. Isi form dan submit
4. Verifikasi redirect ke dashboard (`/dashboard`)

### Test Login:
Proses yang sama untuk login di `/login`

## File yang Diubah:

1. **[app/login/page.tsx](app/login/page.tsx)** - Update form login dengan role selector
2. **[app/register/page.tsx](app/register/page.tsx)** - Update form register dengan role selector
3. **[lib/roles.ts](lib/roles.ts)** - Utility functions untuk role management
4. **[middleware.ts](middleware.ts)** - Middleware untuk protect routes
5. **[supabase/migrations/001_create_profiles.sql](supabase/migrations/001_create_profiles.sql)** - Database migration

## Next Steps:

Pertimbangkan untuk:
- Update dashboard untuk hanya admin yang bisa akses
- Tambah proteksi pada route-route tertentu berdasarkan role
- Update navbar/header untuk menampilkan info role user
- Implementasi role-based access control pada fitur-fitur lain
