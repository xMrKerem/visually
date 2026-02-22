class FightSystem {
    constructor(player1, player2, translate, lang) {
        this.p1 = { ...player1, hp: 500, maxHp: 500, mana: 30, maxMana: 200, guard: false, name: player1.username };
        this.p1 = { ...player1, hp: 500, maxHp: 500, mana: 30, maxMana: 200, guard: false, name: player1.username };
        this.p2 = { ...player2, hp: 500, maxHp: 500, mana: 30, maxMana: 200, guard: false, name: player2.username };
        this.turn = Math.random() < 0.5 ? this.p1.id : this.p2.id;
        this.translate = translate;
        this.lang = lang;
        this.isFinished = false;
        this.log = [];
    }

    getPlayer(id) {
        return this.p1.id === id ? this.p1 : this.p2;
    }

    getOpponent(id) {
        return this.p1.id === id ? this.p2 : this.p1;
    }

    addMana(player, amount) {
        player.mana += amount;
        if (player.mana > player.maxMana) player.mana = player.maxMana;
    }

    async move(attackerId, action) {
        const attacker = this.getPlayer(attackerId);
        const defender = this.getOpponent(attackerId);

        if (this.turn !== attackerId) {
            return { valid: false, msg: this.translate("DUEL_QUE_FAIL", this.lang) };
        }

        let msgKey = "";
        let damage = 0;
        let healAmount = 0;

        if (action === "attack") {
            this.addMana(attacker, 20);

            if (Math.random() < 0.1) {
                msgKey = "DUEL_MISS";
            } else {
                damage = Math.floor(Math.random() * 31) + 20;
                if (defender.guard) damage = Math.floor(damage / 2);

                if (Math.random() < 0.15) {
                    damage = Math.floor(damage * 1.5);
                    msgKey = "DUEL_CRITICAL";
                } else {
                    msgKey = "DUEL_ATTACK";
                }
            }
        }

        else if (action === "guard") {
            this.addMana(attacker, 10);
            attacker.guard = true;
            msgKey = "DUEL_DEFEND";
        }

        else if (action === "special") {
            if (attacker.mana < 100) {
                return { valid: false, msg: "NO_MANA_ULTRA" };
            }
            attacker.mana -= 100;

            if (Math.random() < 0.2) {
                msgKey = "DUEL_SPECIAL_FAIL";
            } else {
                damage = Math.floor(Math.random() * 51) + 60;
                if (defender.guard) damage = Math.floor(damage / 1.5);
                msgKey = "DUEL_SPECIAL_HIT";
            }
        }

        else if (action === "heal") {
            if (attacker.mana < 40) {
                return { valid: false, msg: "NO_MANA_HEAL" };
            }

            attacker.mana -= 40;
            healAmount = Math.floor(Math.random() * 41) + 30;
            attacker.hp += healAmount;
            if (attacker.hp > attacker.maxHp) attacker.hp = attacker.maxHp;

            msgKey = "DUEL_HEAL";
        }

        else if (action === "flee") {
            this.isFinished = true;
            return {
                finished: true,
                winner: defender,
                msg: this.translate("DUEL_FLEE", this.lang)
            };
        }

        if (damage > 0) {
            defender.hp -= damage;
            if (defender.hp < 0) defender.hp = 0;
        }

        if (action !== "guard") attacker.guard = false;

        const message = this.translate(msgKey, this.lang, {
            attacker: attacker.name,
            damage: damage,
            heal: healAmount,
            target: defender.name
        });

        this.log.push(message);
        if (this.log.length > 5) this.log.shift();

        if (defender.hp <= 0) {
            this.isFinished = true;
            return {
                finished: true,
                winner: attacker,
                msg: message
            };
        }

        this.turn = defender.id;

        return {
            finished: false,
            p1: this.p1,
            p2: this.p2,
            log: this.log,
            turn: this.turn
        };
    }
}

module.exports = FightSystem;