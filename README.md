# Visually — Discord Botu

Küçük ve modüler bir Discord botu. Komutlar `komutlar/`, olay dinleyicileri `events/` altında toplanır; giriş noktası `server.js` dosyasıdır. Proje MIT lisansı ile yayınlanmıştır.

---

## 🚀 Özellikler
- Modüler komut yapısı (`komutlar/`) ve event tabanlı mimari (`events/`)
- Kolay konfigürasyon (`ayarlar.json`)
- Hızlı başlatma (Node.js)
- Açık kaynak (MIT lisansı)

---

## 🧩 Gereksinimler
- Node.js (önerilen: LTS sürümü)
- Bir Discord Bot uygulaması ve **Bot Token**
- (Opsiyonel) `.env` dosyası ile ortam değişkeni yönetimi

---

## ⚙️ Kurulum

1. **Repoyu klonla:**
   ```bash
   git clone https://github.com/xMrKerem/visually.git
   cd visually
   
2. **Kütüphaneleri Yükle**
   ```bash
   npm install
   ```
3. **Ayarları Yap**
   
   ayarlar.json içinde token, prefix vb. alanları doldur.

5. **Botu Başlat**
   ```bash
   node .
   ```
   komutu ile botu başlat
