const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');
const db = require('quick.db');

exports.run = async (client, message) => {

    if (await db.has('prefix_' + message.guild.id)) {
        prefix = db.fetch('prefix_' + message.guild.id)
    } else {
        prefix = ayarlar.prefix
    }

    var embed = new Discord.MessageEmbed()
    .setAuthor('Visually', client.user.avatarURL())
    .setTitle('Eğlence Yardım Menüsü')
    .addField(`**\`${prefix}8ball\`**`, `**${prefix}8ball komutu ile bota soru sorabilir ve botun cevabını alabilirsiniz.\nKullanımı: \`${prefix}8ball <Soru>\`\n(geliştirilecek)**`)
    .addField(`**\`${prefix}avatar\`**`, `**${prefix}avatar komutu ile istediğiniz kişinin avatarını görebilirsiniz.\nKullanımı: \`${prefix}avatar <kullanıcı Etiketi>\`**`)
    .addField(`**\`${prefix}çekiç\`**`, `**${prefix}çekiç komutu istediğiniz kişiye çekiç atar.\nKullanımı: \`${prefix}çekiç <Kullanıcı Etiketi>\`**`)
    .addField(`**\`${prefix}söylet\`**`, `**${prefix}söylet komutu ile bota istediğinizi yazdırabilirsiniz.\nKullanımı: \`${prefix}söylet <Mesaj>\`**`)
    .addField(`**\`${prefix}sunucubilgi\`**`, `**${prefix}sunucubilgi komutu ile sunucu bilgilerini görebilirsiniz.\nKullanımı: \`${prefix}sunucubilgi\`**`)
    .addField(`**\`${prefix}havadurumu\`**`, `**${prefix}havadurumu komutu ile istediğiniz bölgede ki hava durumunu öğrenebilirsiniz.\nKullanımı: \`${prefix}havadurumu <Bölge>\`**`)
    .addField(`**\`${prefix}düello\`**`, `**${prefix}düello komutu istediğiniz bir kişi ile düello yapmanızı sağlar.\nYeni düello sistemi hakkında bilgi almak için \`${prefix}düelloyardım\`\nKullanımı: \`${prefix}düello <Kulllanıcı Etiketi>\`**`)
    .addField(`**\`${prefix}eskidüello\`**`, `**${prefix}eskidüello komutu istediğiniz kişiyle eski düello sisteminde düello yapmanızı sağlar.\nKullanımı: \`${prefix}eskidüello <Kullanıcı Etiketi>\`**`)
    .addField(`**\`${prefix}herkeseçay\`**`, `**${prefix}herkeseçay komutu ile herkese çay verebilirsiniz.\nKullanımı: \`${prefix}herkeseçay\`**`)
    .addField(`**\`${prefix}düelloyardım\`**`, `**${prefix}düelloyardım yeni düello sistemi hakkında bilgi verir.\nKullanımı: \`${prefix}düelloyardım\`**`)
    .setFooter(`komutu çalıştıran kişi ${message.author.tag}`, message.author.avatarURL())
    .setColor('GREEN')
    message.channel.send(embed)
}


exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['eğlence', 'eğlence-yardım', 'fun', 'fun-help', 'funhelp'],
    permLeve: 0
};

exports.help = {
    name: 'eğlenceyardım',
    description: 'eğlence yardım menüsünü açar',
    usage: 'eğlence-yardım'
}