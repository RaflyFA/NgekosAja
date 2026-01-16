# Panduan Setup Backend Supabase untuk Sistem Role

## Masalah dan Solusi

### 1. Error: "Signups not allowed for this instance"

**Penyebab:** Email signup tidak diaktifkan di Supabase project

**Solusi - Ikuti langkah ini di Supabase Dashboard:**

#### Step 1: Enable Email Provider
1. Buka **Supabase Dashboard** → Pilih project Anda
2. Pergi ke menu **Authentication** (di sidebar kiri)
3. Klik **Providers**
4. Cari dan klik **Email**
5. Aktifkan toggle: **Enable Email signups**
6. (Opsional) Jika ingin testing tanpa verifikasi email: Disable **Confirm email**
7. Klik **Save**

#### Step 2: Verifikasi Email Auth Settings
1. Di menu **Authentication**, klik **Settings**
2. Scroll ke section **Email Auth**
3. Pastikan **Enable Email Signups** sudah aktif ✅
4. Periksa **Minimum password length** (default 6 karakter)
5. Scroll kebawah dan klik **Save**

---

### 2. Database Setup - Create Profiles Table

**PENTING:** Tabel `profiles` harus sudah dibuat di database

#### Step 1: Buka SQL Editor
1. Di Supabase Dashboard, pergi ke **SQL Editor** (di sidebar)
2. Klik tombol **New Query**
3. Pilih template atau buat custom query

#### Step 2: Jalankan SQL Migration
Copy-paste kode di bawah ini ke SQL Editor dan klik **Run**:

```sql
-- Create profiles table to store user roles and additional data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

Tunggu sampai query berhasil di-run (akan ada notifikasi success).

#### Step 3: Verify Table Creation
1. Di sidebar, pergi ke **Table Editor**
2. Pastikan tabel `profiles` sudah muncul di list
3. Klik `profiles` untuk lihat struktur (harus ada kolom: id, email, full_name, role, created_at, updated_at)

---

## Testing After Setup

### Test 1: Daftar sebagai Mahasiswa
1. Buka aplikasi di `localhost:3000/register`
2. Pilih role: **Mahasiswa**
3. Isi form lengkap (Nama, Email, Password)
4. Klik **Daftar Sekarang**
5. **Expected:** Redirect ke beranda (`/`) ✅

### Test 2: Daftar sebagai Pemilik Kos
1. Buka aplikasi di `localhost:3000/register`
2. Pilih role: **Pemilik Kos**
3. Isi form lengkap
4. Klik **Daftar Sekarang**
5. **Expected:** Redirect ke dashboard (`/dashboard`) ✅

### Test 3: Login dengan Role yang Benar
1. Login dengan akun yang sudah didaftar
2. Pilih role yang sama saat daftar
3. Klik **Masuk Sekarang**
4. **Expected:** Redirect sesuai role ✅

---

## Troubleshooting

### Jika masih error "Signups not allowed":
- Pastikan Email provider benar-benar sudah diaktifkan
- Coba refresh halaman atau clear browser cache
- Pastikan tidak ada policy yang blocking (di Authentication > Policies)

### Jika tidak bisa insert ke profiles table:
- Pastikan RLS policies sudah benar (check di table `profiles` > security policies)
- Verifikasi user ID di auth.users table
- Cek apakah ada error message di browser console (F12)

### Jika login tidak redirect ke dashboard:
- Buka browser console (F12)
- Lihat apakah ada error message
- Pastikan role di database sesuai dengan role saat login
- Cek di Supabase > Table Editor > profiles apakah user sudah ada dengan role yang benar

---

## Info Penting

- **role** column hanya bisa bernilai: `'user'` atau `'admin'`
- Jika error saat insert, mungkin karena user sudah pernah daftar dengan email yang sama
- RLS policies sudah auto-setup untuk keamanan, user hanya bisa lihat profile sendiri
