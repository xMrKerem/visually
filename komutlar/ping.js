const Discord = require('discord.js');


exports.run = async (client, message) => {
     
message.delete()
message.channel.send('Ölçülüyor...').then((msg)=>{
  const botping = (msg.createdTimestamp - message.createdTimestamp).toLocaleString();
  const apiping = client.ws.ping.toLocaleString();
  msg.edit(`**Bot pingi:** \`${botping} ms\`\n**API pingi:** \`${apiping} ms\``)
  msg.delete({timeout: 10000})
})
};

exports.conf = {
  enabled: true, 
  guildOnly: true, 
  aliases: [],
  permLevel: 0 
};

exports.help = {
  name: 'ping', 
  description: 'Botun pingini gösterir',
  usage: 'ping'
};