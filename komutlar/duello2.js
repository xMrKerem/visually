const Discord = require('discord.js');
const { stripIndents } = require('common-tags');
const { randomRange, verify } = require('../util/Util.js');
const db = require('quick.db')

exports.run = async (client, message, args) => {

    this.fighting = new Set();

    var uye = message.mentions.members.first()
    if (!uye) return message.reply('kiminle dövüşmek istiyorsun?').then(msg => msg.delete({timeout: 5000}))

    if (uye.user.bot) return message.reply(':x: botlar ile dövüşemezsin.').then(msg => msg.delete({timeout: 5000}))
    if (uye.id === message.author.id) return message.reply(':x: kendin ile dövüşemezsin.').then(msg => msg.delete({timeout: 5000}))
    //if (await this.fighting.has(message.channel.id)) return message.reply(':x: Kanal sayısına göre savaş yapabilirsin.').then(msg => msg.delete({timeout: 5000}))
    if (await db.has('düello' + message.channel.id)) return message.reply(':x: aynı kanalda aynı anda 1\'den fazla düello yapılamaz').then(msg => msg.delete({timeout: 5000}))


    this.fighting.add(message.channel.id);
    db.set('düello' + message.channel.id, true)

    try {

        if (!uye.bot) {
            await message.channel.send(`${uye}, bir düello isteği geldi kabul etmek için \`evet\` reddetmek için \`hayır\` yazınız.`)
            const kabul = await verify(message.channel, uye);
            if (!kabul) {
                this.fighting.delete(message.channel.id)
                db.delete('düello' + message.channel.id)
                return message.channel.send(':x: düello kabul edilmedi')
            }
        }

        var uyeHP = 500;
        var userHP = 500;
        var uyeMANA = 100;
        var userMANA = 100;
        var userTurn = false;
        var guard = false;

        const reset = (changeGuard = true) => {
            userTurn = !userTurn
            if (changeGuard && guard) guard = false;
        }
        const amana = mana => {
            if (userTurn) userMANA += mana
            else uyeMANA += mana
        }
        const emana = mana => {
            if (userTurn) userMANA -= mana
            else uyeMANA -= mana
        }
        const dealDamage = damage => {
            if (userTurn) uyeHP -= damage;
            else userHP -= damage;
        }
        const renew = renew => {
            if (userTurn) userHP += renew
            else uyeHP += renew
        }
        const forfeit = () => {
            if (userTurn) userHP =0
            else uyeHP = 0
        }
        if (userMANA < 0) {
            userMANA = 0;
        }
        if (uyeMANA < 0) {
            uyeMANA = 0
        }
        while (userHP > 0 && uyeHP > 0) {
            const user = userTurn ? message.author : uye
            var yetenek
            if (!uye.bot || (uye.bot && userTurn)) {
                await message.channel.send(stripIndents`
                ${user}, ne yapmak istersin \`yumruk\`, \`tekmele\`, \`savun\`, \`can yenile\`, \`ultra güç\` veya \`kaç\`?
                **▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬**
                **${message.author.username}**: ${userHP} :heartpulse:
                **${message.author.username}**: ${userMANA} :purple_circle:
                **▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬**
                **${uye.user.username}**: ${uyeHP} :heartpulse:
                **${uye.user.username}**: ${uyeMANA} :purple_circle:
                **▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬**
                `)
                const filter = res =>
                    res.author.id === user.id && ['yumruk', 'tekmele', 'savun', 'ultra güç', 'kaç', 'thor saldırısı', 'can yenile'].includes(res.content.toLowerCase());
                const turn = await message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 30000
                })
                if (!turn.size) {
                    await message.channel.send(`${user} saldırı yapmak için malesef süren doldu.`)
                    reset();
                    continue
                }
                yetenek = turn.first().content.toLowerCase()
            } else {
                const yetenekler = ['yumruk', 'tekmele', 'savun', 'ultra güç', 'thor saldırısı', 'can yenile']
                yetenek = yetenekler[Math.floor(Math.Random() * yetenekler.length)]
            }
            if (yetenek === 'yumruk') {
                const damage = Math.floor(Math.random() * (guard ? 20 : 50))
                const mana = randomRange(20, 80)
                await message.channel.send(`${user}, **${damage}** hasar vurdu!`)
                dealDamage(damage)
                amana(mana)
                reset()
            } else if (yetenek === 'tekmele') {
                let canuse = false;
                if (user == message.author && userMANA > 49) canuse = true;
                if (user == uye && uyeMANA > 49) canuse = true;
                if (canuse == false) {
                    message.channel.send(`${user} bu yeteneği kullanmak için yeterli manan bulunmuyor bu yetenek için **50** manaya ihtiyacın var!`)
                }
                if (canuse == true) {
                    const damage = Math.floor(Math.random() * (guard ? 30 : 70))
                    await message.channel.send(`${user}, **${damage}** hasar vurdu!`)
                    dealDamage(damage)
                    emana(50)
                    reset()
                }
            } else if (yetenek === 'savun') {
                let canuse = false;
                if (user == message.author && userMANA > 29) canuse = true;
                if (user == uye && uyeMANA > 29) canuse = true;
                if (canuse == false) {
                    message.channel.send(`${user} bu yeteneği kullanmak için yeterli manan bulunmuyor bu yetenek için **30** manaya ihtiyacın var!`)
                }
                if (canuse == true) {
                    await message.channel.send(`${user} kalkanını çekti!`)
                    guard = true
                    emana(30)
                    reset(false)
                }
            } else if (yetenek === 'ultra güç') {
                let canuse = false;
                if (user == message.author && userMANA > 299) canuse = true;
                if (user == uye && uyeMANA > 299) canuse = true;
                if (canuse == false) {
                    message.channel.send(`${user} bu yeteneği kullanmak için yeterli manan bulunmuyor bu yetenek için **300** manaya ihtiyacın var!`)
                }
                if (canuse == true) {
                    const damage = randomRange(100, guard ? 100 : 170)
                    await message.channel.send(`${user} tüm gücünü toplayarak **${damage}** hasar vurdu!`)
                    dealDamage(damage)
                    emana(300)
                    reset()
                }
            } else if (yetenek === 'thor saldırısı') {
                if (user.id == "381137379290775555") {
                    const damage = Math.floor(Math.random() * (guard ? 5000 : 50000)) + 1;
                    await message.channel.send(`YAPIMCIM ${user}, THORUN GERÇEK GÜCÜNÜ KULLANARAK **${damage}** HASAR VERDİ!!!`);
                    dealDamage(damage);
                    reset();
                }
            } else if (yetenek === 'kaç') {
                await message.channel.send(`${user}, savaşmaktan korktu ve kaçtı!`)
                forfeit()
                break
            } else if (yetenek === 'can yenile') {
                let canuse = false;
                if (user == message.author && userMANA > 399) canuse = true;
                if (user == uye && uyeMANA > 399) canuse = true;
                if (canuse == false) {
                    message.channel.send(`${user} bu yeteneği kullanmak için yeterli manan bulunmuyor bu yetenek için **400** manaya ihtiyacın var!`)
                }
                if (canuse == true) {
                    const yenilenme = randomRange(100, 200)
                    await message.channel.send(`${user}, canını **${yenilenme}** miktarında yeniledi.`)
                    emana(400)
                    renew(yenilenme)
                    reset()
                }
            } else {
                await message.channel.send(`${user} hangi yeteneği kullanmak istediğini anlamadım?`)
            }
        }
        if (userHP < 0) {
            userHP = 0
        }
        if (uyeHP < 0) {
            uyeHP = 0
        }

        this.fighting.delete(message.channel.id)
        db.delete('düello' + message.channel.id)
        const winner = userHP > uyeHP ? message.author : uye
        const loser = userHP < uyeHP ? message.author : uye
        const acoin = Math.floor(Math.random() * (50))
        const ecoin = Math.floor(Math.random() * (30))
        db.add('coin_' + winner.id, acoin)
        db.subtract('coin_' + loser.id, ecoin)
        return message.channel.send(`Oyun bitti! Tebrikler, **${winner}** kazandı! \n**${winner}**: ${acoin} coin kazandı. \n**${loser}**: ${ecoin} coin kaybetti.`)
    } catch(err) {
        this.fighting.delete(message.channel.id);
        db.delete('düello' + message.channel.id)
        message.channel.send('bir hatadan dolayı düello iptal edildi!')
        console.log(err)
        throw err;
    }
}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['1vs1', '1v1', 'savaş', 'duel', 'düello'],
    permLevel: 0
};

exports.help = {
    name: 'düello',
    description: 'İstediğiniz bir kişi ile düello atarsınız!',
    usage: 'düello <@kullanıcı>'
};