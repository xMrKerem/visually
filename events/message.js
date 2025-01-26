const db = require('quick.db');
const ayarlar = require('../ayarlar.json');
const Discord = require('discord.js')
module.exports = async message => {
  
  const prefix = db.has(`prefix_${message.guild.id}`) ? db.fetch(`prefix_${message.guild.id}`) : ayarlar.prefix;
  const client = message.client;
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const command = message.content.split(' ')[0].slice(prefix.length).toString().toLowerCase();
  const params = message.content.split(' ').slice(1);
  const perms = client.elevation(message);
  if (client.commands.has(command) || client.aliases.has(command)) {
    const cmd = client.commands.get(command) ? client.commands.get(command) : client.aliases.get(command);
    if (perms < cmd.conf.permLevel) return;
    cmd.run(client, message, params, perms);
  }
}
