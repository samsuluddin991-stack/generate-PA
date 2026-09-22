# Generate PA

Generator draf **cerai gugat** dan **cerai talak** yang gratis, offline-first, dan tidak memerlukan server.

## Fitur
- Formulir adaptif untuk Penggugat/Tergugat atau Pemohon/Termohon.
- Pratinjau draf, cetak ke PDF, dan ekspor TXT.
- Penyimpanan lokal menggunakan IndexedDB (lebih tepat untuk data terstruktur dan koleksi dokumen besar daripada localStorage).
- Impor/ekspor seluruh arsip dalam JSON untuk cadangan.
- Service Worker dan Web App Manifest agar dapat dipasang sebagai aplikasi setelah dibuka melalui localhost/HTTPS.
- Tidak memakai CDN, framework eksternal, atau layanan berbayar.

## Menjalankan offline
Buka `index.html` langsung untuk fungsi dasar. Untuk mode PWA/offline cache, jalankan server statis lokal, misalnya:

```bash
python -m http.server 8080
```

Lalu buka `http://localhost:8080` dan pilih **Pasang aplikasi** bila tersedia.

## Arsitektur
- **UI:** HTML semantik + CSS responsif.
- **Logika:** JavaScript modular ringan (`app.js`).
- **Data:** IndexedDB object store `documents`, dengan record terstruktur dan HTML hasil render; backup JSON manual.
- **Offline:** Service Worker cache-first dengan fallback ke `index.html`.
- **Keamanan:** seluruh data disimpan di browser pengguna dan tidak dikirim ke jaringan. Ini bukan enkripsi tingkat perangkat; gunakan profil perangkat yang aman dan hapus arsip setelah selesai.

## Catatan hukum dan privasi
Contoh surat yang diberikan mengandung data pribadi sangat sensitif. Aplikasi ini hanya menyediakan kerangka pengisian dan bukan nasihat hukum. Periksa kebenaran fakta, konsistensi tanggal/identitas, persyaratan pengadilan setempat, dan konsultasikan dengan Posbakum atau advokat sebelum mengajukan.
