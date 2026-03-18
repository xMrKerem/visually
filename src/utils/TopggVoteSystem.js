const http = require("http");
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

    addItemToInventory(user, voteChestItem, 1);

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

        if (req.method !== "POST" || requestPath !== path) {
            res.statusCode = 404;
            return res.end("Not Found");
        }

        if (req.headers.authorization !== auth) {
            console.log(`[top.gg] Unauthorized webhook request. Path=${requestPath} AuthPrefix=${String(req.headers.authorization || "").slice(0, 12)}`);
            res.statusCode = 401;
            return res.end("Unauthorized");
        }

        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", async () => {
            try {
                const payload = JSON.parse(body || "{}");
                if (!payload.user) {
                    res.statusCode = 400;
                    return res.end("Missing user");
                }

                const existingUser = await User.findOne({ userId: payload.user });
                const user = existingUser || new User({ userId: payload.user });

                if (!user.topgg) user.topgg = {};
                user.topgg.lastVoteAt = new Date();
                user.topgg.lastVoteType = payload.type || "upvote";
                user.topgg.lastIsWeekend = Boolean(payload.isWeekend);
                user.markModified("topgg");

                await user.save();

                console.log(`[top.gg] Vote webhook accepted for user ${payload.user}. Type=${user.topgg.lastVoteType}`);
                res.statusCode = 200;
                return res.end("OK");
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
