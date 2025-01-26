const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');
const db = require('quick.db');

exports.run = async (client, message) => {
    const prefix = db.has(`prefix_${message.guild.id}`) ? db.fetch(`prefix_${message.guild.id}`) : ayarlar.prefix;
    const embed = new Discord.MessageEmbed()
    .setAuthor('Visually', client.user.avatarURL())
    .setTitle('Admin Yardım Menüsü')
    .addField(`**\`${prefix}otorol-ayarla\`**`, `**${prefix}otorol-ayarla komutu ile sunucuya giren kişiye otomatik olarak istediğiniz rolü verebilirsiniz.\nKullanımı: \`${prefix}otorol-ayarla <rol etiket>\`**`)
    .addField(`**\`${prefix}hoşgeldin-ayarla\`**`, `**${prefix}hoşgeldin-ayarla komutu ile sunucunuza biri girdiğinde otomatik mesaj yazmasını sağlayabilirsiniz.\nKullanımı: \`${prefix}hoşgeldin-ayarla <kanal etiket>\`**`)
    .addField(`**\`${prefix}görüşürüz-ayarla\`**`, `**${prefix}görüşürüz-ayarla komutu ile sunucunuzdan biri çıktığında otomatik mesaj yazmasını sağlayabilirsiniz.\nKullanımı: \`${prefix}görüşürüz-ayarla <kanal etiket>\`**`)
    .addField(`**\`${prefix}log-ayarla\`**`, `**${prefix}log-ayarla komutu sunucu için bir log kanalı ayarlar.\nKullanımı: \`${prefix}log-ayarla <kanal>\`**`)
    .addField(`**\`${prefix}uyarı-rol-ayarla\`**`, `**${prefix}uyarı-rol-ayarla komutu ile uyar komutu için uyarı rolleri ayarlayabilirsiniz.\nKullanımı: \`${prefix}uyarı-rol-ayarla <1/2> <rol etiket>\`**`)
    .addField(`**\`${prefix}susturma-rol-ayarla\`**`, `**${prefix}susturma-rol-ayarla komutu ile susturma komutu için susturma rolü ayarlayabilirsiniz.\nKullanımı: \`${prefix}susturma-rol-ayarla <rol etiket>\`**`)
    .addField(`**\`${prefix}prefix\`**`, `**${prefix}prefix komutu botun sunucudaki prefixini değiştirir.\nKullanımı: \`${prefix}prefix <yeni prefix>\`**`)
    .addField(`**\`${prefix}ototag\`**`, `**${prefix}ototag komutu sunucunuza giren herkesin ismine tagınızı otomatik olarak ekler.\nKullanımı: \`${prefix}ototag <tag>\`**`)
    .addField(`**\`${prefix}ototag-sil\`**'`, `**${prefix}ototag-sil komutu ile sunucunuzda bulunan ototag\'ı silebilirsiniz\nKullanımı: \`${prefix}ototag-sil\`**`)
    .addField(`**\`${prefix}düello-kayıt-sil\`**`, `**${prefix}düellokayıtsil komutu ile kanaldaki silinmeyen düello kaydını silebilirsiniz.\nKullanımı: \`${prefix}düello-kayıt-sil\`**`)
    .addField(`**\`${prefix}oto-rol aç/kapat\`**`, `**${prefix}oto-rol aç komutu ile sunucunuza yeni gelen kişilere belirlediğiniz rolü otomatik olarak verirsiniz. ${prefix}oto-rol kapat ile daha önce otorol belirlediyseniz kapat yazarak kapatabilirsiniz.`)
    .setColor('DARK_RED')
    message.channel.send(embed)
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['admin', 'admin-yardım', 'adminyardım', 'admin-help', 'adminhelp'],
    permLevel: 0
};

exports.help = {
    name: 'admin yardım',
    description: 'moderasyon yardım menüsünü açar',
    usage: 'admin'
}
