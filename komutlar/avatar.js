const Discord = require('discord.js');
const moment = require('moment');
const ayarlar = require('../ayarlar.json')

exports.run = async (client, message) => {

  let kisi;
  const kur = {
    "01": "Ocak",
    "02": "Şubat",
    "03": "Mart",
    "04": "Nisan",
    "05": "Mayıs",
    "06": "Haziran",
    "07": "Temmuz",
    "08": "Ağustos",
    "09": "Eylül",
    "10": "Ekim",
    "11": "Kasım",
    "12": "Aralık"
  };
  
  const args = message.content.split(' ').slice(1)
  
  const kisi1 = message.mentions.users.first();
  if (kisi1) {
    kisi = kisi1.id;
  
    if (!message.guild.members.cache.get(kisi)) {
      return message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
    }
  } else {
    if (args[0]) {
      kisi = args[0];
    
      if (!message.guild.members.cache.get(kisi)) {
        return message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
      }
    } else {
      kisi = message.author.id;
    }
  }
  const uye = message.guild.members.cache.get(kisi);
  const avatar = new Discord.MessageEmbed()
  .setAuthor('Visually', client.user.avatarURL())
  .setTitle(`Avatar`)
  .setThumbnail(uye.user.avatarURL({dynamic: true}))
  .addField(`­`,`${uye} adlı kullanıcının avatarı`)
  .addField('İsmi:', uye.user.tag)
  .addField('ID', uye.user.id)
  .addField('Hesap Kurulma Tarihi', `${moment(uye.user.createdAt).format('DD')} ${kur[moment(uye.user.createdAt).format('MM')]} ${moment(uye.user.createdAt).format('YYYY h:mm:ss')}`)
  .addField('BOT mu?', uye.user.bot ? '\n Evet' : 'Hayır')
  .setFooter(`Komutu Çalıştıran Kişi ${message.author.tag}`, message.author.avatarURL())
  message.channel.send(avatar)
};

exports.conf = {
    enabled: true, 
    guildOnly: true, 
    aliases: [],
    permLevel: 0 
  };
  
  exports.help = {
    name: 'avatar', 
    description: 'istediğiniz kişinin avatarını gösterir',
    usage: 'avatar'
  };
