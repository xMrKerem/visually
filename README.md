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
   OWNER_ID
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
   OWNER_ID=
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

---

<a name="terms-of-service"></a>
## ⚖️ Terms of Service (Hizmet Şartları)

By inviting **Visually** to your Discord server or using its features, you agree to be bound by these terms:

* **Usage Responsibility:** Visually is a multi-purpose tool. Server administrators are solely responsible for how moderation commands (ban, kick, mute, clear) are used within their communities.
* **Economy & Fair Play:** Users must not exploit bugs in the economy or leveling systems (XP, balance, duels). Exploiting may lead to a permanent ban from using the bot.
* **Service Availability:** The bot is provided "as is". While we strive for 24/7 uptime, we are not liable for data loss or service interruptions.
* **Open Source Notice:** As an open-source project, you are encouraged to review the code. However, malicious modifications of the bot's code used to harm users are strictly prohibited.

---

**Visually**'i Discord sunucunuza davet ederek veya özelliklerini kullanarak aşağıdaki şartlara bağlı kalmayı kabul etmiş olursunuz:

* **Kullanım Sorumluluğu:** Visually çok amaçlı bir araçtır. Sunucu yöneticileri, moderasyon komutlarının (yasaklama, atma, susturma, temizleme) kendi toplulukları içerisinde nasıl kullanıldığından tamamen sorumludur.
* **Ekonomi ve Adil Oyun:** Kullanıcılar, ekonomi veya seviye sistemlerindeki (XP, bakiye, düellolar) hataları (bug) kötüye kullanmamalıdır. Hatalardan faydalanmak, botun kullanımından kalıcı olarak yasaklanmanıza yol açabilir.
* **Hizmet Kullanılabilirliği:** Bot "olduğu gibi" sunulmaktadır. 7/24 çalışma süresi için çaba göstersek de, veri kayıplarından veya hizmet kesintilerinden sorumlu değiliz.
* **Açık Kaynak Bildirimi:** Açık kaynaklı bir proje olarak, kodu incelemeniz teşvik edilir. Ancak botun kodunun kullanıcılara zarar vermek amacıyla kötü niyetli olarak değiştirilmesi ve kullanılması kesinlikle yasaktır.
---

<a name="privacy-policy"></a>
## 🛡️ Privacy Policy (Gizlilik Politikası)

Visually respects your privacy and is transparent about the data we collect. By using the bot, you consent to the storage of the following data:

### 1. Data We Collect
* **User Data:** Discord User ID, Username, and interaction history (XP, Level, Balance, Inventory, Equipment, Win/Loss stats).
* **Server (Guild) Data:** Guild ID, custom Prefix, Language settings, and channel configurations for logs, welcome, and goodbye messages.
* **Moderation Logs:** Warning records, including Moderator ID, User ID, reasons, and timestamps.
* **AI Interaction:** If Gemini AI features are used, conversation history (parts, roles, and timestamps) is stored to provide context for future interactions.

### 2. How We Use Data
* Data is used exclusively for bot functionalities such as the economy system, leveling, server-specific settings, and moderation history.
* Conversation history is used solely to maintain continuity in AI-powered chats.

### 3. Data Retention & Removal
* **Storage:** Data is stored securely in a MongoDB database.
* **Right to Erasure:** Users can request the deletion of their personal data (XP, Balance, History) by contacting the bot owner or through specified support channels.
* **Third Parties:** We **never** sell, rent, or share user data with third-party organizations.

---

Visually gizliliğinize saygı duyar ve toplanan veriler konusunda şeffaftır. Botu kullanarak aşağıdaki verilerin saklanmasını kabul etmiş olursunuz:

### 1. Topladığımız Veriler
* **Kullanıcı Verileri:** Discord Kullanıcı Kimliği (ID), Kullanıcı Adı ve etkileşim geçmişi (XP, Seviye, Bakiye, Envanter, Ekipman, Galibiyet/Mağlubiyet istatistikleri).
* **Sunucu Verileri:** Sunucu Kimliği (ID), özel ön ek (Prefix), Dil ayarları ve loglar, hoş geldin ve hoşça kal mesajları için kanal yapılandırmaları.
* **Moderasyon Kayıtları:** Moderatör Kimliği (ID), Kullanıcı Kimliği (ID), sebepler ve zaman damgaları dahil olmak üzere uyarı kayıtları.
* **Yapay Zeka Etkileşimi:** Gemini AI özellikleri kullanılıyorsa, gelecekteki etkileşimler için bağlam sağlamak amacıyla konuşma geçmişi (mesaj içerikleri, roller ve zaman damgaları) saklanır.

### 2. Verileri Nasıl Kullanıyoruz?
* Veriler; yalnızca ekonomi sistemi, seviye atlama, sunucuya özel ayarlar ve moderasyon geçmişi gibi bot işlevlerini sağlamak amacıyla kullanılır.
* Konuşma geçmişi, yalnızca yapay zeka destekli sohbetlerde sürekliliği ve bağlamı korumak için kullanılır.

### 3. Veri Saklama ve Silme
* **Depolama:** Veriler, bir MongoDB veritabanında güvenli bir şekilde saklanır.
* **Veri Silme Hakkı:** Kullanıcılar, bot sahibiyle iletişime geçerek veya belirtilen destek kanalları aracılığıyla kişisel verilerinin (XP, Bakiye, Geçmiş) silinmesini talep edebilirler.
* **Üçüncü Taraflar:** Kullanıcı verilerini asla üçüncü taraf kuruluşlara **satmayız, kiralamayız veya paylaşmayız.**
---
