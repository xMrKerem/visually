const helper = require('./helper');

class FightSystem {
    constructor(player1, player2, translate, lang) {
        const defaultStats = {
            atcMinDmg: 0, atcMaxDmg: 0,
            spcMinDmg: 0, spcMaxDmg: 0,
            minHp: 0, maxHp: 0, bonusHp: 0,
            dmgCritChance: 0.2, spcCritChance: 0.1,
            dmgMissChance: 0.2, spcMissChance: 0.1,
            dmgCriticMultiplier: 1.5, defense: 1.3,
            respawn: false, reqMana: null,

            ignoreDefense: false, lifeSteal: 0, stunChance: 0,
            dotDamage: 0, dotTurns: 0, reduceSpcDamage: 0,
            enemyMissChanceBoost: 0, reflectDamage: 0, cleanseDebuffs: false,
            regenTurns: 0, regenAmount: 0, breakGuard: false,
            percentHealthDamage: 0, mahoragaChance: 0, delayedDamage: 0,
            damageMultiplierBoost: 0, stealAttackPercent: 0, debuffTurns: 0,
            destroyEquipmentChance: 0, multiHitChance: 0, armorPenetration: 0
        };

        const p1stats = player1.stats || { ...defaultStats };
        const p2stats = player2.stats || { ...defaultStats };

        this.p1 = { ...player1, hp: 500 + p1stats.bonusHp, maxHp: 500 + p1stats.bonusHp, mana: 30, maxMana: 200, guard: false, name: player1.username, stats: p1stats, activeEffects: [], isStunned: false, boostStack: 1 };
        this.p2 = { ...player2, hp: 500 + p2stats.bonusHp, maxHp: 500 + p2stats.bonusHp, mana: 30, maxMana: 200, guard: false, name: player2.username, stats: p2stats, activeEffects: [], isStunned: false, boostStack: 1 };

        this.turn = Math.random() < 0.5 ? this.p1.id : this.p2.id;
        this.translate = translate;
        this.lang = lang;
        this.isFinished = false;
        this.log = [];
    }

    getPlayer(id) { return this.p1.id === id ? this.p1 : this.p2; }
    getOpponent(id) { return this.p1.id === id ? this.p2 : this.p1; }

    addMana(player, amount) {
        player.mana += amount;
        if (player.mana > player.maxMana) player.mana = player.maxMana;
    }

    applyPreTurnEffects(player, opponent) {
        player.isStunned = false;

        player.activeEffects.forEach(effect => {
            if (effect.type === "dot" && effect.turnsLeft > 0) {
                player.hp -= effect.damage;
                this.log.push(this.translate("EFFECT_DOT_DAMAGE", this.lang, { player: player.name, damage: effect.damage }));
            }
            else if (effect.type === "regen" && effect.turnsLeft > 0) {
                player.hp += effect.amount;
                if (player.hp > player.maxHp) player.hp = player.maxHp;
                this.log.push(this.translate("EFFECT_REGEN_HEAL", this.lang, { player: player.name, amount: effect.amount }));
            }
            else if (effect.type === "delayed_damage" && effect.turnsLeft === 1) {
                player.hp -= effect.damage;
                this.log.push(this.translate("EFFECT_DELAYED_DAMAGE", this.lang, { player: player.name, damage: effect.damage }));
            }
            else if (effect.type === "stun" && effect.turnsLeft > 0) {
                player.isStunned = true;
                this.log.push(this.translate("EFFECT_STUNNED", this.lang, { player: player.name }));
            }
            effect.turnsLeft -= 1;
        });

        player.activeEffects = player.activeEffects.filter(eff => eff.turnsLeft > 0);
        if (player.hp < 0) player.hp = 0;
    }

    applyPostStrikeEffects(attacker, defender, damage, action) {
        if (damage <= 0) return;

        if (attacker.stats.lifeSteal) {
            const realDamage = Math.min(damage, defender.hp + damage);
            const heal = Math.floor(realDamage * attacker.stats.lifeSteal);
            attacker.hp += heal;
            if (attacker.hp > attacker.maxHp) attacker.hp = attacker.maxHp;
            this.log.push(this.translate("STRIKE_LIFESTEAL", this.lang, { player: attacker.name, amount: heal }));
        }

        else if (defender.stats.reflectDamage) {
            const reflect = Math.floor(damage * defender.stats.reflectDamage);
            attacker.hp -= reflect;
            this.log.push(this.translate("STRIKE_REFLECT", this.lang, { player: defender.name, amount: reflect }));
        }

        else if (attacker.stats.stunChance && Math.random() < attacker.stats.stunChance) {
            defender.activeEffects.push({ type: "stun", turnsLeft: 1 });
        }

        else if (attacker.stats.dotDamage && action === "special") {
            defender.activeEffects.push({ type: "dot", damage: attacker.stats.dotDamage, turnsLeft: attacker.stats.dotTurns });
            this.log.push(this.translate("STRIKE_SHOCK_DOT", this.lang, { player: defender.name }));
        }

        else if (attacker.stats.destroyEquipmentChance && Math.random() < attacker.stats.destroyEquipmentChance) {
            defender.guard = false;
            defender.activeEffects.push({ type: "stun", turnsLeft: 1 });
            this.log.push(this.translate("STRIKE_DESTROY_EQUIP", this.lang, { player: attacker.name }));
        }

        else if (attacker.stats.stealAttackPercent && action === "special") {
            attacker.boostStack += attacker.stats.stealAttackPercent;
            this.log.push(this.translate("STRIKE_STEAL_ATTACK", this.lang, { player: attacker.name }));
        }

        else if (attacker.stats.damageMultiplierBoost && action === "special") {
            attacker.boostStack += attacker.stats.damageMultiplierBoost;
            this.log.push(this.translate("STRIKE_BOOST_GEAR", this.lang, { player: attacker.name, amount: attacker.boostStack.toFixed(1) }));
        }

        else if (attacker.stats.delayedDamage && action === "special") {
            defender.activeEffects.push({ type: "delayed_damage", damage: attacker.stats.delayedDamage, turnsLeft: 2 });
        }
    }

    async move(attackerId, action) {
        const attacker = this.getPlayer(attackerId);
        const defender = this.getOpponent(attackerId);

        if (this.turn !== attackerId) return { valid: false, msg: this.translate("DUEL_QUE_FAIL", this.lang) };

        this.applyPreTurnEffects(attacker, defender);
        if (attacker.hp <= 0) return this.checkDeath(defender, attacker);

        if (attacker.isStunned) {
            this.turn = defender.id;
            return { finished: false, p1: this.p1, p2: this.p2, log: this.log, turn: this.turn };
        }

        let msgKey = "";
        let damage = 0;
        let healAmount = 0;

        if (action === "attack") {
            this.addMana(attacker, 20);

            let missChance = attacker.stats.dmgMissChance + (defender.stats.enemyMissChanceBoost || 0);

            if (Math.random() < missChance) {
                msgKey = "DUEL_MISS";
            } else {
                let min = attacker.stats.atcMinDmg || 20;
                let max = attacker.stats.atcMaxDmg || 50;
                damage = helper.randomRange(min, max);

                if (attacker.stats.multiHitChance && Math.random() < attacker.stats.multiHitChance) {
                    damage *= 2;
                    this.log.push(this.translate("MOVE_MULTI_HIT", this.lang, { player: attacker.name }));
                }

                if (defender.guard) {
                    if (attacker.stats.ignoreDefense) {
                        this.log.push(this.translate("MOVE_IGNORE_DEFENSE", this.lang, { player: attacker.name }));
                    } else {
                        let def = defender.stats.defense;
                        if (attacker.stats.armorPenetration) def -= attacker.stats.armorPenetration;
                        if (def < 1) def = 1;
                        damage = Math.floor(damage / def);
                    }
                }

                if (Math.random() < attacker.stats.dmgCritChance) {
                    damage = Math.floor(damage * attacker.stats.dmgCriticMultiplier);
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
            const reqMana = attacker.stats.reqMana || 100;
            if (attacker.mana < reqMana) return { valid: false, msg: "NO_MANA_ULTRA" };
            attacker.mana -= reqMana;

            let missChance = attacker.stats.spcMissChance + (defender.stats.enemyMissChanceBoost || 0);

            if (Math.random() < missChance) {
                msgKey = "DUEL_SPECIAL_FAIL";
            } else {
                if (attacker.stats.mahoragaChance && Math.random() < attacker.stats.mahoragaChance) {
                    damage = 9999;
                    this.log.push(this.translate("MOVE_MAHORAGA", this.lang, { player: attacker.name }));
                }
                else if (attacker.stats.percentHealthDamage) {
                    damage = Math.floor(defender.hp * attacker.stats.percentHealthDamage);
                    this.log.push(this.translate("MOVE_HOLLOW_PURPLE", this.lang));
                }
                else {
                    let min = attacker.stats.spcMinDmg || 60;
                    let max = attacker.stats.spcMaxDmg || 110;
                    damage = helper.randomRange(min, max);
                }

                if (defender.guard && damage < 9000) {
                    let def = defender.stats.defense + (defender.stats.reduceSpcDamage || 0);
                    damage = Math.floor(damage / def);
                }

                if (attacker.stats.breakGuard && defender.guard) {
                    defender.guard = false;
                    this.log.push(this.translate("MOVE_BREAK_GUARD", this.lang));
                }

                msgKey = "DUEL_SPECIAL_HIT";
            }
        }

        else if (action === "heal") {
            if (attacker.mana < 40) return { valid: false, msg: "NO_MANA_HEAL" };
            attacker.mana -= 40;

            let min = attacker.stats.minHp || 30;
            let max = attacker.stats.maxHp || 71;
            healAmount = helper.randomRange(min, max);

            attacker.hp += healAmount;
            if (attacker.hp > attacker.maxHp) attacker.hp = attacker.maxHp;

            if (attacker.stats.cleanseDebuffs) {
                attacker.activeEffects = [];
                this.log.push(this.translate("MOVE_CLEANSE_DEBUFFS", this.lang, { player: attacker.name }));
            }

            if (attacker.stats.regenTurns) {
                attacker.activeEffects.push({ type: "regen", amount: attacker.stats.regenAmount, turnsLeft: attacker.stats.regenTurns });
            }

            msgKey = "DUEL_HEAL";
        }

        else if (action === "flee") {
            this.isFinished = true;
            return { finished: true, winner: defender, msg: this.translate("DUEL_FLEE", this.lang) };
        }

        if (damage > 0 && action !== "heal") {
            damage = Math.floor(damage * attacker.boostStack);

            defender.hp -= damage;
            if (defender.hp < 0) defender.hp = 0;

            this.applyPostStrikeEffects(attacker, defender, damage, action);
        }

        if (action !== "guard") attacker.guard = false;

        const message = this.translate(msgKey, this.lang, {
            attacker: attacker.name, damage: damage, heal: healAmount, target: defender.name
        });

        this.log.push(message);
        if (this.log.length > 5) this.log.shift();

        return this.checkDeath(attacker, defender, message);
    }

    checkDeath(attacker, defender, lastMessage = "") {
        if (defender.hp <= 0) {
            if (defender.stats.respawn) {
                defender.hp = defender.maxHp;
                defender.stats.respawn = false;
                defender.activeEffects = [];

                const reviveMsg = this.translate("DUEL_REVIVE_PHOENIX", this.lang, { player: defender.name });
                this.log.push(`\n❤️‍🔥 ${reviveMsg}`);
            } else {
                this.isFinished = true;
                return { finished: true, winner: attacker, msg: lastMessage };
            }
        }

        this.turn = defender.id;
        return { finished: false, p1: this.p1, p2: this.p2, log: this.log, turn: this.turn };
    }
}

module.exports = FightSystem;