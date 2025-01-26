const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const fs = require('fs');
const db = require('quick.db');
const moment = require('moment');
const ms = require("ms");
const express = require('express');
const app = express();
const http = require('http');
const math = require('mathjs')
const randomstring = require('randomstring');
require('./util/eventLoader')(client);

const prefix = ayarlar.prefix;

const log = message => {
  console.log(`Visually || ${moment().format('HH:mm:ss')} | ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', async (err, files) => {
  if (!files) return console.log('Komut yok')
  if (err) console.log('Komut yok');
  for (const x of files.filter(x => x.endsWith('.js'))) {
    const details = require(`./komutlar/${x}`);
    log(`${details.help.name} yüklendi`);
    client.commands.set(details.help.name, details);
    if (details.conf.aliases.length != 0) {
      for (const alias of details.conf.aliases) {
        client.aliases.set(alias, details.help.name);
      }
    }
  }
});

client.on('guildMemberAdd', async member => {
  if (db.has('ototag' + member.guild.id)) {
    const tag = db.fetch('ototag' + member.guild.id);
    member.setNickname(`${tag} ${member.user.username}`)
  }
})


client.on('guildMemberAdd', async member => {
    if (!await db.has(`hoşgeldin_${member.guild.id}`)) return
  const kanal = client.channels.cache.get(db.fetch(`hoşgeldin_${member.guild.id}`));
  if (member.id === ayarlar.sahip) {
    return kanal.send(`Yapımcım ${member} bu sunucuya iniş yaptı.`)
  }
  if (await db.has('premium' + member.id)) {
    return kanal.send(`${member} adlı premium üye bu sunucuya giriş yaptı.`)
  } else {
    return kanal.send(`${member} sunucuya hoşgeldin.`)
  }
})


client.on('guildMemberRemove', async member => {

    if (!await db.has(`görüşürüz_${member.guild.id}`)) return

  const kanal = client.channels.cache.get(db.fetch(`görüşürüz_${member.guild.id}`))

  if (member.id === ayarlar.sahip) {
    return kanal.send(`Yapımcım ${member.user.tag} bu sunucudan ayrıldı ayrıldığına üzüldük.`)
  }

  if (await db.has('premium' + member.id)) {
    return kanal.send(`${member.user.tag} adlı premium üye sunucudan ayrıldı ayrıldığına üzüldük.`)
  } else {
    return kanal.send(`${member.user.tag} sunucudan ayrıldığına üzüldük.`)
  }
})


client.on('guildMemberAdd', async member => {
  if (db.has(`otorol_${member.guild.id}`)) {
    const otorol = db.fetch(`otorol_${member.guild.id}`);
    member.roles.add(otorol)
  }
})

client.on('message', async message => {
  const prefixx = db.has(`prefix_${message.guild.id}`) ? db.fetch(`prefix_${message.guild.id}`) : ayarlar.prefix;
  const args = message.content.split(' ').slice(0)
  const kisi = message.mentions.members.first();
  if (!kisi) return
  if (kisi.id == client.user.id && !args[1]) {
    message.channel.send(`Bu sunucu için prefixim = **${prefixx}**`)
  }
})

client.on('ready', async () => {
  if (db.has('reboot')) {
    client.channels.cache.get(db.fetch('reboot')).send('Yeniden başlatma başarılı.')
    db.delete('reboot')
  }
})

 client.elevation = async message => {
  if (message.guild) {
    let permlvl = 0;
    if (message.member.hasPermission("MANAGE_MESSAGES")) permlvl = 1;
    if (message.member.hasPermission("MANAGE_ROLES")) permlvl = 2;
    if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 3;
    if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 4;
    if (message.author.id == ayarlar.sahip) permlvl = 5;
    return permlvl;
  }
};

client.login(ayarlar.token);
