import os
from moviepy.editor import VideoFileClip, concatenate_videoclips

# 1. Ambil data link & detik dari n8n (Payload)
video_url = os.getenv("VIDEO_URL") # Misal: "https://youtube.com/watch?v=..."
timestamps_raw = os.getenv("TIMESTAMPS") # Misal: "12-17,25-34"

print(f"Mengunduh video dari: {video_url}")

# 2. Download video cepat pakai yt-dlp
os.system(f'yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" "{video_url}" -o video_mentah.mp4')

# 3. Parsing format detik (contoh: "12-17,25-34")
list_potongan = []
for item in timestamps_raw.split(','):
    start, end = item.split('-')
    list_potongan.append((float(start), float(end)))

# 4. Potong & Gabung pakai MoviePy (FFmpeg Backend)
video_utama = VideoFileClip("video_mentah.mp4")
klip_pilihan = [video_utama.subclip(s, e) for s, e in list_potongan]

video_final = concatenate_videoclips(klip_pilihan)
video_final.write_videofile("hasil_akhir_shorts.mp4", codec="libx264", audio_codec="aac")

print("Selesai! Video hasil potong & gabung siap di-upload.")
