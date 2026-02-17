const { createCanvas, loadImage } = require('@napi-rs/canvas');

module.exports = {
    // 1. DÜELLO (VS) ÇİZİMİ
    drawDuel: async (p1, p2) => {
        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext('2d');

        // Arkaplan (Degrade)
        const gradient = ctx.createLinearGradient(0, 0, 800, 400);
        gradient.addColorStop(0, '#0f0c29');
        gradient.addColorStop(0.5, '#302b63');
        gradient.addColorStop(1, '#24243e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Avatar Yükleme (Hata Korumalı)
        const defaultAvatar = "https://cdn.discordapp.com/embed/avatars/0.png";
        let avatar1, avatar2;

        try {
            avatar1 = await loadImage(p1.avatarURL || defaultAvatar);
        } catch (e) {
            avatar1 = await loadImage(defaultAvatar);
        }

        try {
            avatar2 = await loadImage(p2.avatarURL || defaultAvatar);
        } catch (e) {
            avatar2 = await loadImage(defaultAvatar);
        }

        // Çerçeveleri Çiz
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        // Sol Çerçeve
        ctx.strokeRect(80, 80, 160, 160);
        // Sağ Çerçeve
        ctx.strokeRect(560, 80, 160, 160);

        // Avatarları Çiz
        ctx.drawImage(avatar1, 85, 85, 150, 150);
        ctx.drawImage(avatar2, 565, 85, 150, 150);

        // Ortadaki VS Yazısı
        ctx.font = 'italic bold 80px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.textAlign = 'center';
        ctx.fillText('VS', 400, 220); // Gölge
        ctx.fillStyle = '#ff4757';
        ctx.fillText('VS', 400, 210); // Asıl Yazı

        // İstatistik Barları (HP ve MP)
        const drawStats = (player, x, align) => {
            const barWidth = 200;
            const startX = align === 'left' ? x : x - barWidth;

            // HP Bar Arkaplan
            ctx.fillStyle = '#333';
            ctx.fillRect(startX, 260, barWidth, 20);
            // HP Bar Doluluk
            ctx.fillStyle = '#ff4757'; // Kırmızı
            ctx.fillRect(startX, 260, (player.hp / 500) * barWidth, 20);

            // Mana Bar Arkaplan
            ctx.fillStyle = '#333';
            ctx.fillRect(startX, 290, barWidth, 12);
            // Mana Bar Doluluk
            ctx.fillStyle = '#2e86de'; // Mavi
            ctx.fillRect(startX, 290, (player.mana / 100) * barWidth, 12);

            // Metinler
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = align;
            ctx.fillText(`${player.hp} HP`, align === 'left' ? startX : startX + barWidth, 255);
            ctx.fillText(`${player.mana} MP`, align === 'left' ? startX : startX + barWidth, 315);
        };

        drawStats(p1, 60, 'left');
        drawStats(p2, 740, 'right');

        // İsimler
        const name1 = p1.name ? p1.name.toUpperCase() : "PLAYER 1";
        const name2 = p2.name ? p2.name.toUpperCase() : "PLAYER 2";

        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#f1f2f6';
        ctx.textAlign = 'center';
        ctx.fillText(name1, 160, 60);
        ctx.fillText(name2, 640, 60);

        return canvas.encode('jpeg', 80);
    },

    // 2. PROFİL (KANYA) ÇİZİMİ - [FIXED: AVATAR ÇÖKME SORUNU]
    drawProfile: async (user, userData, nextLevelXp, texts) => {
        const canvas = createCanvas(800, 300);
        const ctx = canvas.getContext('2d');

        // 1. Arkaplan
        const gradient = ctx.createLinearGradient(0, 0, 800, 300);
        gradient.addColorStop(0, '#141E30');
        gradient.addColorStop(1, '#243B55');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 300);

        // 2. Avatar Yükleme
        const defaultAvatar = "https://cdn.discordapp.com/embed/avatars/0.png";
        let avatar;
        try {
            avatar = await loadImage(user.dynamicAvatarURL("png", 256));
        } catch {
            avatar = await loadImage(defaultAvatar);
        }

        // Avatarı Yuvarlak Kırpma
        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 150, 90, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // Avatar Yüklenmezse Arkası Boş Kalmasın
        ctx.fillStyle = '#2c3e50';
        ctx.fill();

        if (avatar) ctx.drawImage(avatar, 60, 60, 180, 180);
        ctx.restore();

        // Avatar Çerçevesi
        ctx.beginPath();
        ctx.arc(150, 150, 90, 0, Math.PI * 2, true);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#f1c40f';
        ctx.stroke();

        // --- SAĞ TARAF ---

        // 3. Kullanıcı Adı
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(user.username, 280, 90);

        // 4. Seviye (Level)
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`${texts.level || 'Level'} ${userData.level}`, 280, 125);

        // 5. XP Barı (SORUNLU KISIM BURADAYDI - DÜZELTİLDİ)
        const barY = 150;

        // --- Arkaplan Barı ---
        ctx.fillStyle = '#444';
        ctx.beginPath(); // Yeni çizim başlat ki avatarla karışmasın!
        if (ctx.roundRect) {
            ctx.roundRect(280, barY, 460, 26, 10);
            ctx.fill();
        } else {
            ctx.fillRect(280, barY, 460, 26);
        }

        // --- Doluluk Barı ---
        const xpPercent = Math.min((userData.xp / nextLevelXp), 1);
        ctx.fillStyle = '#2ecc71'; // Yeşil
        ctx.beginPath(); // Yeni çizim başlat!
        if (ctx.roundRect) {
            ctx.roundRect(280, barY, 460 * xpPercent, 26, 10);
            ctx.fill();
        } else {
            ctx.fillRect(280, barY, 460 * xpPercent, 26);
        }

        // XP Sayısı
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${userData.xp} / ${nextLevelXp} XP`, 460, barY + 19);

        // 6. İstatistikler (Daireler)
        const statY = 240;
        ctx.font = '20px Arial';

        // --- Cüzdan ---
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath(); ctx.arc(290, statY - 6, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#dfe6e9';
        ctx.fillText(`${texts.wallet || 'Wallet'}: ${userData.balance}`, 310, statY);

        // --- Galibiyet ---
        ctx.fillStyle = '#00b894';
        ctx.beginPath(); ctx.arc(490, statY - 6, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#dfe6e9';
        ctx.fillText(`${texts.wins || 'Wins'}: ${userData.wins}`, 510, statY);

        // --- Mağlubiyet ---
        ctx.fillStyle = '#d63031';
        ctx.beginPath(); ctx.arc(650, statY - 6, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#dfe6e9';
        ctx.fillText(`${texts.losses || 'Loss'}: ${userData.losses}`, 670, statY);

        return canvas.encode('jpeg', 90);
    },

    // 3. HOŞGELDİN / GÜLE GÜLE KARTI
    drawWelcome: async (member, type, memberCount) => {
        const canvas = createCanvas(800, 360);
        const ctx = canvas.getContext('2d');

        // Arkaplan
        const gradient = ctx.createLinearGradient(0, 0, 800, 360);
        if (type === "welcome") {
            gradient.addColorStop(0, '#11998e');  // Yeşilimsi (Giriş)
            gradient.addColorStop(1, '#38ef7d');
        } else {
            gradient.addColorStop(0, '#cb2d3e');  // Kırmızımsı (Çıkış)
            gradient.addColorStop(1, '#ef473a');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 360);

        // Dekoratif Desen (Opsiyonel Çizgiler)
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.arc(0, 0, 300, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(800, 360, 400, 0, Math.PI * 2);
        ctx.fill();

        // Avatar
        const defaultAvatar = "https://cdn.discordapp.com/embed/avatars/0.png";
        let avatar;
        try {
            avatar = await loadImage(member.user ? member.user.dynamicAvatarURL("png", 256) : member.dynamicAvatarURL("png", 256));
        } catch {
            avatar = await loadImage(defaultAvatar);
        }

        // Avatar Yuvarlağı
        ctx.save();
        ctx.beginPath();
        ctx.arc(400, 130, 80, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = '#2c3e50';
        ctx.fill();
        ctx.drawImage(avatar, 320, 50, 160, 160);
        ctx.restore();

        // Avatar Çerçevesi
        ctx.beginPath();
        ctx.arc(400, 130, 80, 0, Math.PI * 2, true);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Yazılar
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';

        // Başlık
        ctx.font = 'bold 50px Arial';
        const title = type === "welcome" ? "HOŞGELDİN" : "GÜLE GÜLE";
        ctx.fillText(title, 400, 260);

        // Kullanıcı Adı
        ctx.font = '35px Arial';
        const username = member.user ? member.user.username : member.username;
        ctx.fillText(username, 400, 305);

        // Üye Sayısı
        ctx.font = '20px Arial';
        ctx.fillStyle = '#f1f2f6';
        const countText = type === "welcome"
            ? `Seninle birlikte ${memberCount} kişi olduk!`
            : `Sensiz ${memberCount} kişi kaldık...`;
        ctx.fillText(countText, 400, 340);

        return canvas.encode('jpeg', 90);
    }
};