const StoreItem = require("../database/models/StoreItem");
const helper = require("./helper");

const weightedPick = (items = []) => {
    const total = items.reduce((sum, item) => sum + (item.chance || 0), 0);
    if (total <= 0) return null;

    let roll = Math.random() * total;
    for (const item of items) {
        roll -= item.chance || 0;
        if (roll <= 0) return item;
    }

    return items[items.length - 1] || null;
};

const getInventoryItemName = (item, lang = "en") => {
    if (!item) return "";
    if (typeof item.name === "object") return item.name[lang] || item.name.en || item.name.tr || "";
    return item.name || "";
};

const isSameInventoryItem = (inventoryItem, storeItem) => {
    if (!inventoryItem || !storeItem) return false;
    if (inventoryItem.itemId && inventoryItem.itemId === storeItem.itemId) return true;

    const trName = getInventoryItemName(inventoryItem, "tr");
    const enName = getInventoryItemName(inventoryItem, "en");
    return trName === storeItem.name.tr || enName === storeItem.name.en;
};

const addItemToInventory = (user, storeItem, amount = 1) => {
    const existingItem = user.inventory.find((item) => isSameInventoryItem(item, storeItem));

    if (existingItem) {
        existingItem.amount += amount;
        if (!existingItem.itemId) existingItem.itemId = storeItem.itemId;
        if (!existingItem.category) existingItem.category = storeItem.category;
    } else {
        user.inventory.push({
            itemId: storeItem.itemId,
            name: storeItem.name,
            usageLimit: storeItem.usageLimit,
            amount,
            category: storeItem.category,
            rarity: storeItem.rarity
        });
    }
};

const removeChestFromInventory = (user, inventoryItem, chestStoreItem) => {
    inventoryItem.amount -= 1;
    if (inventoryItem.amount <= 0) {
        user.inventory = user.inventory.filter((item) => !isSameInventoryItem(item, chestStoreItem));
    }
};

const pickRarityReward = async (rarity) => {
    const candidates = await StoreItem.find({
        rarity,
        category: { $ne: "chest" },
        isBuyable: true,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    });

    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
};

const pickVoteExclusiveReward = async () => {
    const candidates = await StoreItem.find({
        category: { $ne: "chest" },
        isBuyable: true,
        "stats.voteExclusive": true,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    });

    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
};

const resolveCoinReward = (entry) => {
    const outcome = weightedPick(entry.outcomes || []);
    if (!outcome) return null;

    const amount = helper.randomRange(outcome.min || 0, outcome.max || 0);
    return {
        type: "coin",
        amount,
        label: `${amount} Coin`
    };
};

const resolveChestDropReward = async (entry) => {
    const outcome = weightedPick(entry.outcomes || []);
    if (!outcome || !outcome.chestId) return null;

    const chestItem = await StoreItem.findOne({ sourceId: outcome.chestId, category: "chest" });
    if (!chestItem) return null;

    return {
        type: "item",
        item: chestItem,
        amount: 1,
        label: `${chestItem.emoji} ${chestItem.name.en}`
    };
};

const resolveReward = async (entry) => {
    if (!entry) return null;

    if (["common", "rare", "epic", "legendary"].includes(entry.type)) {
        const rewardItem = await pickRarityReward(entry.type);
        if (!rewardItem) return null;

        return {
            type: "item",
            item: rewardItem,
            amount: 1,
            label: `${rewardItem.emoji} ${rewardItem.name.en}`
        };
    }

    if (entry.type === "coin") {
        return resolveCoinReward(entry);
    }

    if (entry.type === "chest_drop") {
        return await resolveChestDropReward(entry);
    }

    if (entry.type === "vote_exclusive") {
        const rewardItem = await pickVoteExclusiveReward();
        if (rewardItem) {
            return {
                type: "item",
                item: rewardItem,
                amount: 1,
                label: `${rewardItem.emoji} ${rewardItem.name.en}`
            };
        }

        return {
            type: "coin",
            amount: 2500,
            label: "2500 Coin"
        };
    }

    return null;
};

const openChest = async (user, chestStoreItem) => {
    if (!user || !chestStoreItem || chestStoreItem.category !== "chest") {
        throw new Error("Invalid chest data.");
    }

    const inventoryItem = user.inventory.find((item) => item.category === "chest" && isSameInventoryItem(item, chestStoreItem));
    if (!inventoryItem || inventoryItem.amount <= 0) {
        throw new Error("Chest not found in inventory.");
    }

    if (!inventoryItem.itemId) inventoryItem.itemId = chestStoreItem.itemId;

    const contents = Array.isArray(chestStoreItem.stats?.contents) ? chestStoreItem.stats.contents : [];
    if (!contents.length) {
        throw new Error("Chest contents are empty.");
    }

    const rewardEntry = weightedPick(contents);
    const reward = await resolveReward(rewardEntry);
    if (!reward) {
        throw new Error("Reward could not be resolved.");
    }

    removeChestFromInventory(user, inventoryItem, chestStoreItem);

    if (reward.type === "coin") {
        user.balance += reward.amount;
    } else if (reward.type === "item") {
        addItemToInventory(user, reward.item, reward.amount || 1);
    }

    user.markModified("inventory");
    await user.save();

    return reward;
};

module.exports = {
    addItemToInventory,
    getInventoryItemName,
    isSameInventoryItem,
    openChest,
    weightedPick
};