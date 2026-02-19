cat <<EOF > README.md
# 🌌 Visually — Advanced Discord Bot

[**Türkçe**](#türkçe) | [**English**](#english)

---

<a name="türkçe"></a>
## 🇹🇷 Türkçe

Visually, **Eris** kütüphanesi üzerine inşa edilmiş; modern, çok dilli (TR/EN) ve görsel odaklı bir Discord botudur. Sunucu moderasyonu, gelişmiş ekonomi sistemi ve seviye tabanlı kullanıcı etkileşimi özelliklerini tek bir çatıda toplar.

---

## 🚀 Öne Çıkan Özellikler

* **Çok Dilli Altyapı:** Sunucu bazlı ayarlanabilir Türkçe ve İngilizce dil desteği.
* **Görsel Sistemler:** Canvas kullanılarak oluşturulan dinamik profil kartları ve hoş geldin görselleri.
* **Gelişmiş Ekonomi & Seviye:** Düellolar, günlük ödüller ve üstel artan zorluk seviyesine sahip XP sistemi.
* **Modern Etkileşim:** Tamamen Slash Command (Eğik Çizgi Komutları) ve butonlu/menülü arayüzler.
* **Güvenlik & Log:** Mesaj silme/düzenleme kayıtları ve kapsamlı moderasyon komutları.

---

## 🛠️ Teknik Gereksinimler

* **Node.js:** v24.x veya üzeri sürüm.
* **MongoDB:** Veri depolama için aktif bir veritabanı bağlantısı.
* **Kütüphaneler:** Eris, Mongoose, Canvas, Weather-js.

---

## ⚙️ Kurulum ve Çalıştırma

1. **Repoyu klonlayın:**
   ```bash
   git clone https://github.com/xMrKerem/visually.git
   cd visually
   ```
2. **Bağımlılıkları yükleyin:**
   ```bash
   pnpm install
   ```
3. **Ortam değişkenlerini (.env) ayarlayın:**
   ```TOKEN=
   MONGO_URI=
   PREFIX=
   IMGUR_API_KEY=
   OPENCAGE_API_KEY=
   OPENWEATHER_API_KEY=
   WEATHERBIT_API_KEY=
   GEMINI_API_KEY=
   ```
4. **Botu başlatın:**
   ```bash
   pnpm start
   ```

---

## 📜 Lisans & Gizlilik

* **Lisans:** MIT Lisansı ile korunmaktadır.
* **Gizlilik:** Kullanıcıların seviye, bakiye ve sunucu ayarları dışında hiçbir özel verisi saklanmaz.

---

### 📝 Önemli Not
Bu bot, Discord'un en güncel API standartlarına uygun olarak **Slash Commands** ve **Gateway Intents** kullanılarak geliştirilmiştir. Botun tüm fonksiyonlarının çalışması için `GUILD_MEMBERS` ve `MESSAGE_CONTENT` intentlerinin açık olması önerilir.
EOF

<a name="english"></a>
## 🇺🇸 English

Visually is a modern, visual-oriented Discord bot built on the **Eris** library. It combines advanced server moderation, a robust economy system, and level-based user interaction under one roof.

---

## 🚀 Features

* **Multi-language Support:** Server-based adjustable language settings (TR/EN).
* **Visual Systems:** Dynamic profile cards and welcome/goodbye images created with Canvas.
* **Economy & Leveling:** Duels, daily rewards, and an exponential XP system.
* **Modern Interaction:** Fully powered by Slash Commands with button and menu-based interfaces.
* **Security & Logs:** Comprehensive moderation tools and message delete/edit logging.

---

## 🛠️ Technical Requirements

* **Node.js:** v24.x or higher.
* **Database:** MongoDB for persistent data storage.
* **Key Libraries:** Eris, Mongoose, Canvas, Weather-js.

---

## ⚙️ Installation & Execution

1. **Clone the repository:**
   ```bash
   git clone https://github.com/xMrKerem/visually.git
   cd visually
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Configure Environment Variables (.env):**
   Create a `.env` file in the root directory and fill in the following:
   ```env
   TOKEN=
   MONGO_URI=
   PREFIX=
   IMGUR_API_KEY=
   OPENCAGE_API_KEY=
   OPENWEATHER_API_KEY=
   WEATHERBIT_API_KEY=
   GEMINI_API_KEY=
   ```
4. **Start the Bot:**
   ```bash
   pnpm start
   ```

---

## 📜 License & Privacy

* **License:** Protected under the MIT License.
* **Privacy:** No private user data is collected. Only public data required for bot functions (levels, balance, server settings) is stored.

---

### 📝 Important Note
This bot is developed using the latest Discord API standards, including **Slash Commands** and **Gateway Intents**. To ensure all features work correctly, please enable `GUILD_MEMBERS` and `MESSAGE_CONTENT` intents in the Discord Developer Portal.
EOF