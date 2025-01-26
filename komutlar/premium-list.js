const Discord = require('discord.js');
const db = require('quick.db');


exports.run = async (client, message) => {

    db.has('premium')
}

exports.conf = {
    enabled: false,
    guildOnly: false,
    aliases: ['premium-list', 'p-list', 'premiumlist', 'plist'],
    permLevel: 0
};

exports.help = {
    name: 'premium list',
    description: 'Botu yeniden başlatır',
    usage: 'premium-list'
};