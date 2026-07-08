import os
import sys
from moviepy.editor import VideoFileClip, concatenate_videoclips

# 1. Ambil data link, detik, judul, dan deskripsi dari Environment Variables GitHub
video_url = os.getenv("VIDEO_URL")
timestamps_raw = os.getenv("TIMESTAMPS")
judul = os.getenv("JUDUL")
deskripsi = os.getenv("DESKRIPSI")

print(f"=== Memulai Pemrosesan Video ===")
print(f"Judul: {judul}")
print(f"Mengunduh video dari URL: {video_url}")

# Validasi awal jika URL kosong
if not video_url:
    print("Error: VIDEO_URL kosong! Proses dihentikan.")
    sys.exit(1)

# 2. Download video super cepat menggunakan yt-dlp ke lokal runner GitHub
# Menggunakan format mp4 terbaik yang tersedia agar langsung klop saat dipotong
download_command = f'yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" "{video_url}" -o video_mentah.mp4'
os.system(download_command)

# Cek apakah file video_mentah.mp4 berhasil didownload
if not os.path.exists("video_mentah.mp4"):
    print("Error: Gagal mengunduh video menggunakan yt-dlp.")
    sys.exit(1)

# 3. Parsing format detik (Contoh input: "1-5,15-25")
list_potongan = []
try:
    if timestamps_raw and "-" in timestamps_raw:
        # Memecah jika ada banyak potongan (dipisah koma)
        for item in timestamps_raw.split(','):
            start, end = item.strip().split('-')
            list_potongan.append((float(start), float(end)))
    else:
        print("Peringatan: Format TIMESTAMPS tidak valid atau kosong. Menggunakan video utuh.")
except Exception as e:
    print(f"Error saat parsing timestamps: {e}")
    sys.exit(1)

# 4. Potong & Gabung menggunakan MoviePy (FFmpeg Backend)
try:
    video_utama = VideoFileClip("video_mentah.mp4")
    
    # Jika ada instruksi potongan detik, lakukan pemotongan dan penggabungan
    if list_potongan:
        print(f"Memotong video berdasarkan timestamps: {list_potongan}")
        klip_pilihan = [video_utama.subclip(s, e) for s, e in list_potongan]
        
        print("Menggabungkan potongan-potongan video...")
        video_final = concatenate_videoclips(klip_pilihan)
    else:
        # Jika tidak ada timestamps, gunakan video asli secara utuh
        video_final = video_utama

    # Proses rendering akhir menjadi file siap upload
    print("Mengekspor video akhir (hasil_akhir_shorts.mp4)...")
    video_final.write_videofile(
        "hasil_akhir_shorts.mp4", 
        codec="libx264", 
        audio_codec="aac",
        temp_audiofile="temp-audio.m4a",
        remove_temp=True
    )
    
    # Menutup clip untuk melegakan memori server
    video_utama.close()
    video_final.close()
    
    print("=== Selesai! Video hasil potong & gabung siap di-upload ===")

except Exception as e:
    print(f"Terjadi error saat pemrosesan video (MoviePy/FFmpeg): {e}")
    sys.exit(1)
    
