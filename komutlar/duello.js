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
        var userTurn = false;
        var guard = false;

        const reset = (changeGuard = true) => {
            userTurn = !userTurn
            if (changeGuard && guard) guard = false;
        }
        const dealDamage = damage => {
            if (userTurn) uyeHP -= damage;
            else userHP -= damage;
        }
        const forfeit = () => {
            if (userTurn) userHP =0
            else uyeHP = 0
        }
        while (userHP > 0 && uyeHP > 0) {
            const user = userTurn ? message.author : uye
            var yetenek
            if (!uye.bot || (uye.bot && userTurn)) {
                await message.channel.send(stripIndents`
                ${user}, ne yapmak istersin \`yumruk\`, \`tekmele\`, \`savun\`, \`ultra güç\`, veya \`kaç\`?
                **${message.author.username}**: ${userHP} :heartpulse:
                **${uye.user.username}**: ${uyeHP} :heartpulse:
                `)
                const filter = res =>
                    res.author.id === user.id && ['yumruk', 'tekmele', 'savun', 'ultra güç', 'kaç', 'thor saldırısı'].includes(res.content.toLowerCase());
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
                const yetenekler = ['yumruk', 'tekmele', 'savun', 'ultra güç', 'thor saldırısı']
                yetenek = yetenekler[Math.floor(Math.Random() * yetenekler.length)]
            }
            if (yetenek === 'yumruk') {
                const damage = Math.floor(Math.random() * (guard ? 10 : 50)) +1
                await message.channel.send(`${user}, **${damage}** hasar vurdu!`)
                dealDamage(damage)
                reset()
            } else if (yetenek === 'tekmele') {
                const damage = Math.floor(Math.random() * (guard ? 20 : 60))
                await message.channel.send(`${user}, **${damage}** hasar vurdu!`)
                dealDamage(damage)
                reset()
            } else if (yetenek === 'savun') {
                await message.channel.send(`${user} kalkanını çekti!`)
                guard = true
                reset(false)
            } else if (yetenek === 'ultra güç') {
                const şans = Math.floor(Math.random() * 4)
                if (!şans) {
                    const damage = randomRange(100, guard ? 100 : 170)
                    await message.channel.send(`${user} tüm gücünü toplayarak **${damage}** hasar vurdu!`)
                    dealDamage(damage)
                } else {
                    await message.channel.send(`${user} tüm gücünü toplayamadığı için ultra gücünü kullanamadı`)
                }
                reset()
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
            } else {
                await message.reply('hangi yeteneği kullanmak istediğini anlamadım?')
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
        return message.channel.send(`Oyun bitti! Tebrikler, **${winner}** kazandı! \n**${message.author.username}**: ${userHP} :heartpulse: \n**${uye.user.username}**: ${uyeHP} :heartpulse:`)
    } catch(err) {
        this.fighting.delete(message.channel.id);
        db.delete('düello' + message.channel.id)
        throw err;
    }
}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['eski1vs1', 'eski1v1', 'eskisavaş', 'oldduel', 'eskiduello'],
    permLevel: 0
};

exports.help = {
    name: 'eski düello',
    description: 'İstediğiniz bir kişi ile düello atarsınız!',
    usage: 'eskidüello <@kullanıcı>'
};