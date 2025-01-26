const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');
const client = new Discord.Client();
const prefix = ayarlar.prefix;

module.exports = async client => {
  client.user.setStatus('online')
  client.user.setActivity(`-help | v${ayarlar.version}`)
  console.log(`Bot aktif`);
}
