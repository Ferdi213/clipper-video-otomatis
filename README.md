>>>>>>>>> PROMPT UNTUK NARASI AUDIO <<<<<

Kalau target Anda adalah **YouTube Shorts** atau **Facebook Reels**, jangan buat narasi seperti ensiklopedia. Buat narasi yang mengikuti visual Pexels dan membuat orang ingin menonton sampai akhir.

Misalnya API Pexels mengembalikan video dengan keyword **"shark"**.

Video: hiu berenang pelan di laut.

Jangan seperti ini:

> "Hiu adalah ikan bertulang rawan yang hidup di lautan."

Karena membosankan.

Lebih baik gunakan pola seperti ini.

### Formula

```
Hook (0-3 detik)
↓
Fakta mengejutkan
↓
Penjelasan singkat
↓
Cliffhanger / penutup
```

Contoh:

> "Kalau kamu melihat hiu sebesar ini di laut, apa yang akan kamu lakukan?"

> "Tahukah kamu? Hiu sebenarnya bisa mendeteksi setetes darah dari jarak yang sangat jauh."

> "Kemampuan itu berasal dari indra penciumannya yang luar biasa sensitif."

> "Tapi justru bukan itu kemampuan hiu yang paling menakjubkan..."

Penonton akan bertahan karena ingin tahu kalimat terakhir.

---

## Contoh lain

Keyword:

```
Tiger
```

Narasi:

> "Harimau ini terlihat tenang... tapi satu lompatan saja bisa mengakhiri perburuan dalam hitungan detik."

---

Keyword:

```
Elephant
```

Narasi:

> "Banyak orang mengira gajah hanya memiliki ingatan kuat."

> "Padahal mereka juga bisa mengenali suara puluhan anggota keluarganya."

---

Keyword:

```
Octopus
```

Narasi:

> "Hewan ini memiliki tiga jantung."

> "Dua memompa darah ke insang."

> "Satu lagi ke seluruh tubuh."

> "Saat berenang, justru jantung utamanya berhenti berdetak."

---

Keyword:

```
Wolf
```

Narasi:

> "Serigala jarang berburu sendirian."

> "Mereka bekerja sama dengan strategi yang sudah dilatih sejak kecil."

---

## Yang saya sarankan untuk workflow Anda

Karena Anda sudah memakai AI untuk membuat TTS, alurnya bisa seperti ini:

```
Keyword
↓
Cari video di Pexels

↓

AI melihat keyword

↓

AI membuat narasi 30-40 detik

↓

TTS

↓

Subtitle

↓

Video
```

Jadi AI **tidak perlu melihat isi video**. Cukup tahu keyword dari Pexels, misalnya:

```
Keyword:
Shark

Durasi:
30 detik

Gaya:
Misterius

Bahasa:
Indonesia
```

AI langsung menghasilkan narasi yang cocok.

---

### Prompt yang bagus

Misalnya di Gemini atau GPT:

```text
Anda adalah penulis naskah YouTube Shorts.

Keyword video:
Shark

Tulis narasi 30 detik.

Aturan:
- Hook maksimal 2 kalimat.
- Buat penonton penasaran.
- Setiap kalimat maksimal 12 kata.
- Cocok dengan video hiu berenang di laut.
- Bahasa Indonesia.
- Jangan menggunakan emoji.
- Tutup dengan fakta mengejutkan.
```

Hasilnya akan jauh lebih menarik dibanding sekadar menjelaskan definisi hiu.

Dengan cara ini, satu workflow bisa dipakai untuk **ratusan keyword Pexels** (hiu, paus, singa, elang, kucing, ular, dan lain-lain) tanpa perlu membuat naskah secara manual.





>>>>>>>PROMPT<<<<
>>>>jika potong video di satu baris pakai workflows potong-video.yml<<<<



>>>>
>>>>,jika link video lebih satu pakai workflows multi-video.yml<<<<<<
>>>>


>>>>>JIKA PAKAI MULTI VIDEO<<<<<
Kalau **URL dipisahkan koma**, ada dua pilihan logika.

### Pilihan 1 (yang sekarang di workflow kamu)

Semua video **digabung dulu**, baru dipotong.

Contoh Sheet:

| URL_Video        | Timestamps        |
| ---------------- | ----------------- |
| `url1,url2,url3` | `1-5,18-25,40-50` |

Misal:

* Video1 = 10 detik
* Video2 = 20 detik
* Video3 = 15 detik

Maka timeline menjadi:

```
Video1 : 0 - 10
Video2 : 10 - 30
Video3 : 30 - 45
```

Kalau ingin:

* Video1 detik 1-5
* Video2 detik 8-15
* Video3 detik 10-15

Isi Sheet:

```
1-5,18-25,40-45
```

Karena harus menghitung akumulasi durasi.

---

## Pilihan 2 (yang lebih enak)

Timestamp dibuat **per video**, tidak perlu menghitung total durasi.

Contoh:

```
URL_Video
url1,url2,url3

Timestamps
1-5|8-15|10-15
```

Artinya:

* `url1` → potong 1-5
* `url2` → potong 8-15
* `url3` → potong 10-15

Workflow akan:

1. Download url1 → potong 1-5
2. Download url2 → potong 8-15
3. Download url3 → potong 10-15
4. Baru hasil potongannya digabung menjadi .video.mp4

Keuntungannya:

* Tidak perlu menghitung durasi gabungan.
* Kalau ganti urutan video tidak perlu mengubah timestamp lain.
* Jauh lebih mudah diisi di Google Sheet.

Contoh yang lebih kompleks:

Di kolom SHEET 


URL_Video
url1,url2,url3

Timestamps
1-5,8-10|15-20|2-8,10-12


Artinya:

* Video1 → ambil 1-5 lalu 8-10
* Video2 → ambil 15-20
* Video3 → ambil 2-8 lalu 10-12

Lalu semua hasil potongan itu digabung menjadi satu video akhir.

**Saya lebih menyarankan cara kedua** karena jauh lebih praktis untuk otomatisasi n8n dan Google Sheets. Tidak perlu lagi menghitung offset waktu setiap kali jumlah atau durasi video berubah.

