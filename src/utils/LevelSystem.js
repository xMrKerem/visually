module.exports = {
    calculateNextLevelXP: (level) => {
        return Math.floor(5 * (level * level) + 50 * level + 100);
    },

    addXp: async (user, amount) => {
        user.xp += amount;

        let nextLevelXp = Math.floor(5 * (user.level * user.level) + 50 * user.level + 100);
        let leveledUp = false;

        while (user.xp >= nextLevelXp) {
            user.xp -= nextLevelXp;
            user.level += 1;
            nextLevelXp = Math.floor(5 * (user.level * user.level) + 50 * user.level + 100);
            leveledUp = true;
        }

        await user.save();
        return { leveledUp, currentLevel: user.level };
    }
};