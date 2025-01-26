const Discord = require('discord.js');
const db = require('quick.db');

exports.run = async (client, message) => {

    message.delete()
    if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('Bu komutu kullanmak için `YÖNETİCİ` yetkisine ihtiyacın var.').then(msg => msg.delete({timeout: 5000}))

    if (!await db.has('ototag' + message.guild.id)) return message.reply('zaten bu sunucuda mevcut bir oto tag yok.')

    db.delete('ototag' + message.guild.id)
    message.reply('bu sunucuda bulunun oto tag\'ı başarı ile sildim.')
}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['oto-tag-sil', 'ototagsil', 'tagsil', 'tag-delete', 'tagdelete', 'autotagdelete', 'auto-tag-delete', 'autotag-delete', 'ototagdelete', 'oto-tag-delete', 'ototag-delete'],
    permLevel: 0
};

exports.help = {
    name: 'oto tag sil',
    description: 'Suncunuz için otomatik tag ayarlar',
    usage: 'ototagsil'
};