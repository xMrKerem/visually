const Discord = require('discord.js');
const db = require('quick.db')

exports.run = async (client, message) => {

    if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('bu komutu kullanmak için yetkin yok bu komutu kullanmak için `Yönetici` yetkisine ihtiyacın var').then(msg => msg.delete({timeout: 10000}))

    db.delete('düello' + message.channel.id)
    messgae.reply('bu kanaldaki düello kaydını başarıyla sildim.')
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['düellokayıtsil', 'düellosil', 'düello-sil', 'düello-kayıt-sil', 'duelremove', 'dueldeleterecord', 'duel-delete-record', 'duel-remove', 'dueldelete', 'duel-delete', 'duel-remove-record', 'duelremoverecord'],
    permLeve: 0
};

exports.help = {
    name: 'Yenilikler',
    description: 'eğlence yardım menüsünü açar',
    usage: 'yenilikler'
}