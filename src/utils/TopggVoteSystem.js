const http = require("http");
const crypto = require("crypto");
const User = require("../database/models/User");
const { addItemToInventory } = require("./ChestSystem");

let serverStarted = false;

const getVoteUrl = (botId) => `https://top.gg/bot/${botId}/vote`;

const hasUnclaimedVote = (user) => {
    const lastVoteAt = user?.topgg?.lastVoteAt ? new Date(user.topgg.lastVoteAt) : null;
    const lastVoteClaimedAt = user?.topgg?.lastVoteClaimedAt ? new Date(user.topgg.lastVoteClaimedAt) : null;

    if (!lastVoteAt) return false;
    if (!lastVoteClaimedAt) return true;
    return lastVoteAt.getTime() > lastVoteClaimedAt.getTime();
};

const claimVoteChest = async (user, voteChestItem) => {
    if (!hasUnclaimedVote(user)) return false;

    const alreadyHas = user.inventory.find((i) => i.itemId === voteChestItem.itemId);
    if (alreadyHas) {
        alreadyHas.amount += 1;
    } else {
        user.inventory.push({
            itemId: voteChestItem.itemId,
            name: voteChestItem.name,
            usageLimit: voteChestItem.usageLimit,
            amount: 1,
            category: voteChestItem.category,
            rarity: voteChestItem.rarity
        });
    }

    if (!user.topgg) user.topgg = {};
    user.topgg.lastVoteClaimedAt = user.topgg.lastVoteAt;

    user.markModified("inventory");
    user.markModified("topgg");
    await user.save();
    return true;
};

const normalizePath = (value = "/") => {
    if (!value || value === "/") return "/";
    return value.replace(/\/+$/, "");
};

const normalizeIp = (value = "") => String(value).replace(/^::ffff:/, "");

const startTopggWebhook = () => {
    if (serverStarted) return;

    const auth = process.env.TOPGG_WEBHOOK_AUTH;
    const port = Number(process.env.TOPGG_WEBHOOK_PORT || 8080);
    const path = normalizePath(process.env.TOPGG_WEBHOOK_PATH || "/topgg/webhook");

    if (!auth) {
        console.log("[top.gg] Webhook auth not set. Vote rewards are passive-only until configured.");
        return;
    }

    const server = http.createServer(async (req, res) => {
        const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
        const requestPath = normalizePath(requestUrl.pathname);
        const forwardedIp = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
        const requestIp = normalizeIp(forwardedIp || req.socket.remoteAddress || "");
        const signatureHeader = req.headers["x-topgg-signature"];

        if (req.method !== "POST" || requestPath !== path) {
            res.statusCode = 404;
            return res.end("Not Found");
        }

        if (!signatureHeader) {
            console.log("[top.gg] İmza başlığı eksik!");
            res.statusCode = 401;
            return res.end("Unauthorized");
        }

        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {
            try {
                const signatureParts = signatureHeader.split(",");
                const timestamp = signatureParts.find(p => p.startsWith("t=")).split("=")[1];
                const topggSignature = signatureParts.find(p => p.startsWith("v1=")).split("=")[1];

                const payloadToSign = `${timestamp}.${body}`;

                const mySignature = crypto
                    .createHmac("sha256", auth)
                    .update(payloadToSign)
                    .digest("hex");

                console.log("[mySignature]", mySignature);
                console.log("[topggSignature]", topggSignature);

                if (mySignature !== topggSignature) {
                    console.log("[top.gg] Kriptografik imza eşleşmedi!");
                    res.statusCode = 401;
                    return res.end("Unauthorized");
                }

                res.statusCode = 200;
                res.end("OK");

                try {
                    const payload = JSON.parse(body || "{}");

                    if (!payload.user) {
                        console.log("[top.gg] Payload içinde user bulunamadı.");
                        return;
                    }

                    await User.findOneAndUpdate(
                        { userId: payload.user },
                        {
                            $set: {
                                "topgg.lastVoteAt": new Date(),
                                "topgg.lastVoteType": payload.type || "upvote",
                                "topgg.lastIsWeekend": Boolean(payload.isWeekend)
                            }
                        },
                        {
                            upsert: true,
                            setDefaultsOnInsert: true
                        }
                    );

                    console.log(`[top.gg] Başarılı! Veritabanına işlendi. User: ${payload.user}`);
                } catch (dbError) {
                    console.error("[top.gg] Veritabanı kayıt hatası:", dbError);
                }
            } catch (error) {
                console.error("[top.gg] Webhook error:", error);
                res.statusCode = 500;
                return res.end("Error");
            }
        });
    });

    server.listen(port, () => {
        console.log(`[top.gg] Webhook listening on ${path} (port ${port}).`);
    });

    serverStarted = true;
};

module.exports = {
    claimVoteChest,
    getVoteUrl,
    hasUnclaimedVote,
    startTopggWebhook
};