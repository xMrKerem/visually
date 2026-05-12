const { createCanvas, loadImage } = require("@napi-rs/canvas");
const DEFAULT_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";

const BADGE_ICONS = [
    null,
    "https://api.iconify.design/game-icons/paper-bag-open.svg?color=%2395a5a6&width=128&height=128",
    "https://api.iconify.design/game-icons/plastic-duck.svg?color=%23bdc3c7&width=128&height=128",
    "https://api.iconify.design/game-icons/two-coins.svg?color=%23b87333&width=128&height=128",
    "https://api.iconify.design/game-icons/anvil.svg?color=%237f8c8d&width=128&height=128",
    "https://api.iconify.design/game-icons/star-medal.svg?color=%23cd7f32&width=128&height=128",
    "https://api.iconify.design/game-icons/silver-bullet.svg?color=%23c0c0c0&width=128&height=128",
    "https://api.iconify.design/game-icons/gold-bar.svg?color=%23ffd700&width=128&height=128",
    "https://api.iconify.design/game-icons/crystal-bars.svg?color=%23e5e4e2&width=128&height=128",
    "https://api.iconify.design/game-icons/cut-diamond.svg?color=%2300ffff&width=128&height=128",
    "https://api.iconify.design/game-icons/emerald.svg?color=%232ecc71&width=128&height=128"
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const scale = 2

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(x, y, width, height, safeRadius);
    } else {
        ctx.moveTo(x + safeRadius, y);
        ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
        ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
        ctx.arcTo(x, y + height, x, y, safeRadius);
        ctx.arcTo(x, y, x + width, y, safeRadius);
    }
    ctx.closePath();
};

const loadSafeImage = async (url) => {
    try {
        if (!url) return null;
        return await loadImage(url);
    } catch (error) {
        return await loadImage(DEFAULT_AVATAR);
    }
};

const drawCoverImage = (ctx, image, x, y, width, height) => {
    const imgWidth = image.width || width;
    const imgHeight = image.height || height;
    const scale = Math.max(width / imgWidth, height / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const dx = x - (drawWidth - width) / 2;
    const dy = y - (drawHeight - height) / 2;
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
};

const drawCircularAvatar = async (ctx, avatarUrl, cx, cy, radius, borderColor, borderWidth = 6) => {
    const avatar = await loadSafeImage(avatarUrl) || await loadImage(DEFAULT_AVATAR);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = "#2c3e50";
    ctx.fill();
    drawCoverImage(ctx, avatar, cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
};

const fitText = (ctx, text, maxWidth, initialSize, weight = "bold", family = "Arial") => {
    let size = initialSize;
    while (size > 12) {
        ctx.font = `${weight} ${size}px ${family}`;
        if (ctx.measureText(text).width <= maxWidth) break;
        size -= 2;
    }
    return ctx.font;
};

const truncateText = (ctx, text, maxWidth) => {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let output = text;
    while (output.length > 1 && ctx.measureText(`${output}...`).width > maxWidth) {
        output = output.slice(0, -1);
    }
    return `${output}...`;
};

const drawProgressBar = (ctx, x, y, width, height, ratio, fillColor, backgroundColor) => {
    const safeRatio = clamp(ratio || 0, 0, 1);
    ctx.fillStyle = backgroundColor;
    drawRoundedRect(ctx, x, y, width, height, height / 2);
    ctx.fill();

    if (safeRatio <= 0) return;

    ctx.fillStyle = fillColor;
    drawRoundedRect(ctx, x, y, Math.max(height, width * safeRatio), height, height / 2);
    ctx.fill();
};

const drawCircularProgress = (ctx, cx, cy, radius, thickness, ratio, fgColor, bgColor, topText, bottomText) => {
    const safeRatio = clamp(ratio || 0, 0, 1);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = bgColor;
    ctx.stroke();

    if (safeRatio > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * safeRatio));
        ctx.lineWidth = thickness;
        ctx.strokeStyle = fgColor;
        ctx.lineCap = "round";
        ctx.stroke();
    }

    if (topText) {
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 16px Arial";

        const lines = topText.split('\n');
        if (lines.length === 1) {
            ctx.fillText(lines[0], cx, cy - 10);
        } else {
            ctx.fillText(lines[0], cx, cy - 18);
            ctx.fillText(lines[1], cx, cy - 2);
        }
    }

    if (bottomText) {
        ctx.fillStyle = "#dfe6e9";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "14px Arial";
        ctx.fillText(bottomText, cx, cy + 14);
    }
};

module.exports = {
    drawDuel: async (p1, p2, texts = {}) => {
        const canvas = createCanvas(800 * scale, 400 * scale);
        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);
        const duelTexts = {
            vs: texts.vs || "VS",
            hp: texts.hp || "HP",
            mp: texts.mp || "MP",
            player1: texts.player1 || "PLAYER 1",
            player2: texts.player2 || "PLAYER 2"
        };

        ctx.antialias = "subpixel";
        ctx.patternQuality = "best";
        ctx.quality = "best";
        ctx.textDrawingMode = "path";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const gradient = ctx.createLinearGradient(0, 0, 800, 400);
        gradient.addColorStop(0, "#0f0c29");
        gradient.addColorStop(0.5, "#302b63");
        gradient.addColorStop(1, "#24243e");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.beginPath();
        ctx.arc(140, 90, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(660, 310, 150, 0, Math.PI * 2);
        ctx.fill();

        await drawCircularAvatar(ctx, p1.avatarURL || DEFAULT_AVATAR, 160, 160, 78, "#ffffff", 5);
        await drawCircularAvatar(ctx, p2.avatarURL || DEFAULT_AVATAR, 640, 160, 78, "#ffffff", 5);

        ctx.font = "italic bold 80px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
        ctx.fillText(duelTexts.vs, 404, 214);
        ctx.fillStyle = "#ff4757";
        ctx.fillText(duelTexts.vs, 400, 210);

        const drawStats = (player, x, align) => {
            const barWidth = 220;
            const hpMax = Math.max(player.maxHp || 500, 1);
            const manaMax = Math.max(player.maxMana || 200, 1);
            const startX = align === "left" ? x : x - barWidth;
            const textX = align === "left" ? startX : startX + barWidth;
            const safeHp = clamp(player.hp || 0, 0, hpMax);
            const safeMana = clamp(player.mana || 0, 0, manaMax);

            drawProgressBar(ctx, startX, 270, barWidth, 22, safeHp / hpMax, "#ff4757", "rgba(0,0,0,0.35)");
            drawProgressBar(ctx, startX, 304, barWidth, 12, safeMana / manaMax, "#2e86de", "rgba(0,0,0,0.35)");

            ctx.font = "bold 16px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = align;
            ctx.fillText(`${safeHp} / ${hpMax} ${duelTexts.hp}`, textX, 264);
            ctx.fillText(`${safeMana} / ${manaMax} ${duelTexts.mp}`, textX, 329);
        };

        drawStats(p1, 50, "left");
        drawStats(p2, 750, "right");

        const name1 = (p1.name || duelTexts.player1).toUpperCase();
        const name2 = (p2.name || duelTexts.player2).toUpperCase();

        ctx.fillStyle = "#f1f2f6";
        ctx.textAlign = "center";
        fitText(ctx, name1, 260, 24);
        ctx.fillText(truncateText(ctx, name1, 260), 160, 58);
        fitText(ctx, name2, 260, 24);
        ctx.fillText(truncateText(ctx, name2, 260), 640, 58);

        return canvas.encode("png");
    },

    drawProfile: async (user, userData, serverLevelData, nextLevelXp, texts) => {
        const canvas = createCanvas(850 * scale, 360 * scale);
        const ctx = canvas.getContext("2d");

        ctx.scale(scale, scale);

        const level = serverLevelData ? serverLevelData.level : 1;
        const xp = serverLevelData ? serverLevelData.xp : 0;
        const balance = userData ? userData.balance : 0;
        const wins = userData ? userData.wins : 0;
        const losses = userData ? userData.losses : 0;
        const kp = userData ? userData.kp : 0;
        const rankTier = userData ? userData.rankTier : 0;
        const circleY = 200;
        const radius = 55;
        const thick = 12;

        ctx.antialias = "subpixel";
        ctx.patternQuality = "best";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const gradient = ctx.createLinearGradient(0, 0, 850, 360);
        gradient.addColorStop(0, "#141E30");
        gradient.addColorStop(1, "#243B55");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 850, 360);

        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.beginPath(); ctx.arc(800, 40, 200, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(50, 320, 100, 0, Math.PI * 2); ctx.fill();

        await drawCircularAvatar(ctx, user.dynamicAvatarURL("png", 256), 170, 180, 110, "#f1c40f", 8);

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        fitText(ctx, user.username, 400, 38);

        const displayedName = truncateText(ctx, user.username, 400);
        ctx.fillText(displayedName, 400 - radius, 110);

        const nameWidth = ctx.measureText(displayedName).width;

        try {
            const badgeUrl = BADGE_ICONS[rankTier];
            if (badgeUrl) {
                const badgeImg = await loadImage(badgeUrl);
                if (badgeImg) {
                    ctx.drawImage(badgeImg, 400 - radius + nameWidth + 15, 78, 40, 40);
                }
            }
        } catch (e) {}

        const safeNextXp = Math.max(nextLevelXp || 100, 1);
        const xpRatio = xp / safeNextXp;
        drawCircularProgress(ctx, 400, circleY, radius, thick, xpRatio, "#3498db", "rgba(0,0,0,0.4)", `${texts.level} ${level}`, `${xp} / ${safeNextXp}`);

        const kpRatio = kp / 100;
        drawCircularProgress(ctx, 560, circleY, radius, thick, kpRatio, "#f1c40f", "rgba(0,0,0,0.4)", texts.rankPoints, `${kp} / 100`);


        const totalMatches = wins + losses;
        const winRatio = totalMatches > 0 ? (wins / totalMatches) : 0;
        const wlBgColor = totalMatches === 0 ? "rgba(0,0,0,0.4)" : "#e74c3c";
        const wlFgColor = "#2ecc71";
        drawCircularProgress(ctx, 720, circleY, radius, thick, winRatio, wlFgColor, wlBgColor, texts.winLoss, `${wins} / ${losses}`);

        ctx.fillStyle = "#f1c40f";
        ctx.textAlign = "left";
        ctx.font = "bold 20px Arial";
        ctx.fillText(`${texts.wallet}: ${balance}`, 400 - radius, 320);

        return canvas.encode("png");
    },

    drawWelcome: async (member, type, memberCount, texts = {}) => {
        const canvas = createCanvas(800 * scale, 360 * scale);
        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);
        const welcomeTexts = {
            welcomeTitle: texts.welcomeTitle || "WELCOME",
            goodbyeTitle: texts.goodbyeTitle || "GOODBYE",
            welcomeCount: texts.welcomeCount || "We are now {count} members with you!",
            goodbyeCount: texts.goodbyeCount || "We are now {count} members without you..."
        };

        ctx.antialias = "subpixel";
        ctx.patternQuality = "best";
        ctx.quality = "best";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const gradient = ctx.createLinearGradient(0, 0, 800, 360);
        if (type === "welcome") {
            gradient.addColorStop(0, "#11998e");
            gradient.addColorStop(1, "#38ef7d");
        } else {
            gradient.addColorStop(0, "#cb2d3e");
            gradient.addColorStop(1, "#ef473a");
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 360);

        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.arc(0, 0, 300, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(800, 360, 400, 0, Math.PI * 2);
        ctx.fill();

        const avatarUrl = member.user ? member.user.dynamicAvatarURL("png", 256) : member.dynamicAvatarURL("png", 256);
        await drawCircularAvatar(ctx, avatarUrl, 400, 130, 80, "#ffffff", 8);

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";

        const title = type === "welcome" ? welcomeTexts.welcomeTitle : welcomeTexts.goodbyeTitle;
        fitText(ctx, title, 700, 50);
        ctx.fillText(title, 400, 260);

        const username = member.user ? member.user.username : member.username;
        fitText(ctx, username, 680, 35, "bold");
        ctx.fillText(truncateText(ctx, username, 680), 400, 305);

        ctx.font = "20px Arial";
        ctx.fillStyle = "#f1f2f6";
        const countText = (type === "welcome" ? welcomeTexts.welcomeCount : welcomeTexts.goodbyeCount)
            .replace("{count}", memberCount);
        ctx.fillText(countText, 400, 340);

        return canvas.encode("png");
    }
};