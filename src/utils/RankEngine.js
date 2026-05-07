const User = require("../database/models/User");

const rankKeys = [
    "RANK_UNRANKED",
    "RANK_BAG",
    "RANK_PLASTIC",
    "RANK_COPPER",
    "RANK_IRON",
    "RANK_BRONZE",
    "RANK_SILVER",
    "RANK_GOLD",
    "RANK_PLATINUM",
    "RANK_DIAMOND",
    "RANK_EMERALD",
];

const baseKp = 20;
const baseCoin = 50;

module.exports = {
    getRankName: (tier, translate, lang = "en") => {
        const key = rankKeys[tier] || rankKeys[0];
        return typeof translate === "function" ? translate(key, lang) : key;
    },

    calculateMatchRewards: async (winnerId, loserId, turnCount, winnerRemainingHp, winnerMaxHp) => {
        const winner = await User.findOneAndUpdate({ userId: winnerId }, { $setOnInsert: { userId: winnerId } }, { upsert: true, new: true, setDefaultsOnInsert: true });
        const loser = await User.findOneAndUpdate({ userId: loserId }, { $setOnInsert: { userId: loserId } }, { upsert: true, new: true, setDefaultsOnInsert: true });

        const turnMultiplier = 1 + Math.min((turnCount * 0.05), 1);
        const rankMultiplier = Math.max(0.1, 1 + ((loser.rankTier - winner.rankTier) * 0.2));
        let hpRatio = 1;

        if (winnerMaxHp > 0) {
            hpRatio = (winnerMaxHp - winnerRemainingHp) / (winnerMaxHp * 2);
        }
        const healthMultiplier = 1 + hpRatio;

        const earnedKp = Math.floor(baseKp * turnMultiplier * rankMultiplier * healthMultiplier);
        const earnedCoin = Math.floor(baseCoin * turnMultiplier * rankMultiplier * healthMultiplier);

        const lossMultiplier = Math.max(0.1, 1 - ((loser.rankTier - winner.rankTier) * 0.2));
        const lostKp = Math.floor(baseKp * 0.5 * lossMultiplier);

        winner.kp += earnedKp;
        winner.balance += earnedCoin;
        winner.wins++;

        let winnerRankedUp = false;

        if (winner.kp >= 100 && winner.rankTier < 10) {
            winner.kp -= 100;
            winner.rankTier++;
            winner.shield = true;
            winnerRankedUp = true;
        } else if (winner.kp >= 100 && winner.rankTier === 10) {
            winner.kp = 100;
        }

        loser.losses++;
        let loserRankedDown = false;
        let shieldBroken = false;

        if (loser.kp >= lostKp) {
            loser.kp -= lostKp;
        } else {
            if (loser.shield) {
                loser.kp = 0;
                loser.shield = false;
                shieldBroken = true;
            } else {
                if (loser.rankTier > 1) {
                    loser.rankTier -= 1;
                    loser.kp = 100 - (lostKp - loser.kp);
                    if (loser.kp < 0) loser.kp = 0;
                    loserRankedDown = true;
                } else {
                    loser.kp = 0;
                }
            }
        }

        await winner.save();
        await loser.save();

        return {
            earnedKp,
            earnedCoin,
            lostKP: lostKp,
            winnerRankedUp,
            loserRankedDown,
            shieldBroken,
            newWinnerTier: winner.rankTier,
            newLoserTier: loser.rankTier
        };
    }
};
