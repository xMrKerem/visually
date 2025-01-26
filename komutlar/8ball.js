const Discord = require('discord.js');
const ayalar = require('../ayarlar.json')

const cevaplar = [
    "Bence",
    "Kesinlikle",
    "Çok düşük ihtimalle",
    "Büyük ihtimal",
    "İhtimali düşük olsa da"
];

exports.run = async (client, message, args) => {
    const soru = args.join(" ")
    if (args.length == 1) return message.reply(`**__Düzgün__** bir soru belirt.`)
    if (!soru) return message.reply('Bir soru belirt.')
    let sorufiil = ""
    let sorufiilmumkun = soru.filter(x => x.includes('yor') || x.includes('mekte') || x.includes('makta') || x.includes('di') || x.includes('dı') || x.includes('acak') || x.includes('ecek'))
    if (sorufiilmumkun.length > 1) {
        sorufiil = sorufiilmumkun[sorufiilmumkun.length - 1]
    }
    if (sorufiilmumkun.length == 1) {
        sorufiil = sorufiilmumkun[0]
    }
    if (sorufiilmumkun.length == 0) {
        sorufiilmumkun = soru.filter(x => x != "musun" && x != "misin" && x != "miydi" && x != "mi" && x != "mıydı" && x != "mısın" && x != "mı")
        if (sorufiilmumkun.length != 0) sorufiil = sorufiilmumkun[sorufiilmumkun.length - 1]
    }
    if (sorufiil == "") return message.reply(`**__Düzgün__** bir soru belirt.`)
    const cevap = cevaplar[Math.floor(Math.random() * cevaplar.length)];
    const embed = new Discord.MessageEmbed()
    .setDescription(`**${cevap}** ${sorufiil}.`)
    .setFooter(client.user.username, client.user.avatarURL())
    .setColor('#2F3136')
    message.channel.send(embed)
};  

exports.conf = {
  enabled: true, 
  guildOnly: true, 
  aliases: [],
  permLevel: 0 
};

exports.help = {
  name: '8ball', 
  description: 'Sihirli 8ball sorularınızı cevaplar',
  usage: '8ball <soru>'
};
