const fs = require("fs");
const { google } = require("googleapis");

function clean(v, fallback = "") {
  if (v === undefined || v === null || v === "undefined" || v === "null") {
    return fallback;
  }
  return String(v).trim();
}

async function getCoordinates(place) {
  if (!place) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`;
    const response = await fetch(url, {
      headers: { "User-Agent": "github-actions-youtube-uploader/1.0" }
    });
    const data = await response.json();
    if (!data || !data.length) {
      console.log("Lokasi tidak ditemukan:", place);
      return null;
    }
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      description: data[0].display_name
    };
  } catch (err) {
    console.log("Gagal mencari koordinat:", err.message || err);
    return null;
  }
}

async function upload() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client
  });

  const me = await youtube.channels.list({
    part: ["snippet"],
    mine: true
  });

  if (!me.data.items || me.data.items.length === 0) {
    throw new Error("Gagal mengambil data channel YouTube. Periksa Refresh Token Anda.");
  }

  console.log("Upload ke channel:", me.data.items[0].snippet.title);

  const title = clean(process.env.VIDEO_TITLE);
  const description = clean(process.env.VIDEO_DESCRIPTION, "Uploaded via GitHub Actions");
  const publishDate = clean(process.env.PUBLISH_DATE);
  const videoTime = clean(process.env.VIDEO_TIME);
  
  let publishAt = "";
  if (publishDate && videoTime) {
    const parts = publishDate.split("-");
    if (parts.length === 3) {
      const [d, m, y] = parts;
      publishAt = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T${videoTime}:00+07:00`;
      console.log("Jadwal Publish (WIB):", publishAt);
    }
  }

  const location = clean(process.env.LOCATION);
  const languageMap = { "Indonesia": "id", "USA": "en", "Japan": "ja" };
  const language = languageMap[location] || "id";

  const tagsRaw = clean(process.env.TAGS);
  const audience = clean(process.env.AUDIENCE);

  const tags = tagsRaw ? tagsRaw.split(",").map(tag => tag.trim()).filter(Boolean) : [];
  const geo = await getCoordinates(location);

  // Pastikan file video.mp4 ada dari proses FFmpeg sebelumnya
  if (!fs.existsSync("video.mp4")) {
    throw new Error("File video.mp4 tidak ditemukan di direktori runner!");
  }

  const response = await youtube.videos.insert({
    part: ["snippet", "status", "recordingDetails"],
    requestBody: {
      snippet: {
        title,
        description,
        categoryId: "22",
        tags: tags.length ? tags : undefined,
        defaultLanguage: language,
        defaultAudioLanguage: language
      },
      status: {
        privacyStatus: publishAt ? "private" : "public",
        publishAt: publishAt || undefined,
        selfDeclaredMadeForKids: audience.toLowerCase() === "ya"
      },
      recordingDetails: geo ? {
        locationDescription: geo.description,
        location: { latitude: geo.latitude, longitude: geo.longitude }
      } : undefined
    },
    media: {
      body: fs.createReadStream("video.mp4")
    }
  });

  const videoId = response.data.id;
  console.log("================================");
  console.log("✅ UPLOAD BERHASIL!");
  console.log("Video ID:", videoId);
  console.log(`URL: https://www.youtube.com/watch?v=${videoId}`);
  console.log("================================");

  // Bagian Pemrosesan Kustom Thumbnail
  const thumbId = clean(process.env.THUMBNAIL_ID);
  if (thumbId) {
    try {
      const thumbPath = "thumbnail.jpg";
      const thumbResponse = await fetch(`https://docs.google.com/uc?export=download&id=${thumbId}`, {
        redirect: "follow"
      });
      const buffer = await thumbResponse.arrayBuffer();
      fs.writeFileSync(thumbPath, Buffer.from(buffer));
      await youtube.thumbnails.set({
        videoId: videoId,
        media: { mimeType: "image/jpeg", body: fs.createReadStream(thumbPath) }
      });
      console.log("✅ Kustom Thumbnail Berhasil Dipasang!");
    } catch (tErr) {
      console.error("❌ Gagal memasang thumbnail:", tErr.message);
    }
  }
}

upload().catch(err => {
  console.error("❌ UPLOAD GAGAL");
  console.error(err?.response?.data || err.message || err);
  process.exit(1);
});
