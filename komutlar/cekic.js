const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

exports.run = async (client, message) => {

    let kisi;
//çekiç komutu gifleri
    const çekiç = [
      "https://cdn.discordapp.com/attachments/762047051533123584/763053770510303242/tenor.gif",
      "https://cdn.discordapp.com/attachments/762047051533123584/763330922186801162/dbhf.gif",
      "https://cdn.discordapp.com/attachments/762047051533123584/763330924556713984/5dafyushd.gif"
    ]

    //çekiç komutu random gif alma
    const çekiçler = çekiç[Math.floor(Math.random() * çekiç.length)]

    const args = message.content.split(' ').slice(1)

    var kisi1 = message.mentions.users.first()
    if (kisi1) {
        kisi = kisi1.id;
    
        if (!message.guild.members.cache.get(kisi)) {
            message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
            return
        }
    } else {
        if (args[0]) {
            kisi = args[0];
        
            if (!message.guild.members.cache.get(kisi)) {
                message.reply('belirttiğiniz kullanıcıyı bu sunucuda bulamadım').then(msg => msg.delete({timeout: 5000}))
                return
            }
        } else {
            message.reply('kime çekiç atacağım?').then(msg => msg.delete({timeout: 5000}))
            return
        }
    }

    var uye = message.guild.members.cache.get(kisi)

    if (uye.id === message.member.id) return message.reply('Kendine çekiç atamazsın.')

    if (uye.id == "381137379290775555") {
      var embed = new Discord.MessageEmbed()
      .setAuthor('Visually', client.user.avatarURL())
      .setTitle(`YAPIMCIM ÇEKİCİNİ KIRDI!!!!!!!`)
      .addField(`­`, `<@${message.author.id}>, **YAPIMCIM ${uye} ÇEKİCİNİ BİR CAM PARÇASI GİBİ KIRDI!!!!!!!**`)
      .setImage("https://cdn.discordapp.com/attachments/762047051533123584/786276274079006730/tenor.gif")
      .setFooter(`Komutu çalıştıran kişi ${message.author.tag}`, message.author.avatarURL())
      .setColor('DARK_BLUE')
      message.channel.send(embed)
      return
    }

    if (message.author.id == "381137379290775555") { 
      var embed = new Discord.MessageEmbed()
      .setAuthor('Visually', client.user.avatarURL())
      .setTitle(`BİR ÇEKİÇ DARBESİ İLE EZİLDİN!!!!!`)
      .addField(`­`, `**${uye}, YAPIMCIM <@${message.author.id}> SENİ BİR ÇEKİÇ DARBESİ İLE EZDİ!!!!!**`)
      .setImage("https://cdn.discordapp.com/attachments/762047051533123584/763404781045022760/tenor.gif")
      .setFooter(`Komutu çalıştıran kişi ${message.author.tag}`, message.author.avatarURL())
      .setColor('DARK_BLUE')
      message.channel.send(embed)
      return
    };

    if (message.author.id == "398831809309442049") {
      var embed = new Discord.MessageEmbed()
      .setAuthor('Visually', client.user.avatarURL())
      .setTitle(`BİR BALTAYLA PARÇALANDIN!!!!!`)
      .addField(`­`, `**${uye}, <@${message.author.id}> SENİ BİR BALTAYLA PARÇALADI!!!!!**`)
      .setImage("https://cdn.discordapp.com/attachments/398872071372931075/787286690023866368/tenor.gif")
      .setFooter(`Komutu çalıştıran kişi ${message.author.tag}`, message.author.avatarURL())
      .setColor('DARK_BLUE')
      message.channel.send(embed)
      return
    }

    var embed = new Discord.MessageEmbed()
    .setAuthor('Visually', client.user.avatarURL())
    .setTitle(`Bir Çekiç Yollandı!`)
    .addField(`­`, `**${uye}, <@${message.author.id}> sana bir çekiç yolladı!**`)
    .setImage(çekiçler)
    .setFooter(`Komutu çalıştıran kişi ${message.author.tag}`, message.author.avatarURL())
    .setColor('BLUE')
    message.channel.send(embed)
}

exports.conf = {
    enabled: true, 
    guildOnly: false, 
    aliases: ["çekiç", "hammer"],
    permLevel: 0
  };
  
  exports.help = {
    name: 'çekiç', 
    description: 'çekiç atar',
    usage: 'çekiç'
  };
