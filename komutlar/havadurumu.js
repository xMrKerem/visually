const Discord = require('discord.js');
const request = require('request');
const opencage = require('opencage-api-client');

exports.run = (client, message, args) => {
    
    if (!args[0]) return message.reply('Bir şehir belirtmelisin.')
    message.channel.send('Veriler toplanıyor ve işleniyor... Bu biraz uzun sürebilir').then(async msg => {
        opencage.geocode({q: args.join(" "), key: "5c0a7c5fc38a45008204e8b59d44119c", language: "tr"}).then(async bodys => {
            if (bodys.status.code != 200 || bodys.results.length == 0) return msg.edit(`Şehir bulunamadı.`)
            if (bodys.status.code == 402) return msg.edit(`Hava durumu API kullanımı aşıldı. Gün içinde hava durumu komudu kullanılamayacaktır.`)
            const lon = bodys.results[0].geometry.lng
            const lat = bodys.results[0].geometry.lat
            let sicaklik = 0
            let hissedilensicaklik = 0
            let basinc = 0
            let gorusmesafesi = 0
            let nem = 0
            let ruzgar = 0
            let ruzgaryonu = String()
            let anayazi = String()
            let aciklamaliyazi = String()
            let birsaatlikyagis = 0
            let birsaatlikkar = 0
            let ikincilanayazi = String()
            let bulutkapla = 0
            let ciynokta = 0
            let karderinlik = 0
            let toplamyagis = 0
            let iconlink = String()
            const mmconvert = 0.0166666667;
            let havakalitesi = 0
            let sehiricisicakliksapmasi = 0
            let sehirdisisicakliksapmasi = 0
    
            const options1 = {
                url: `https://api.openweathermap.org/data/2.5/onecall`,
                method: 'GET',
                qs: {
                    lat: lat,
                    lon: lon,
                    appid: "62ecc8fc69568788795c0d75a706278c",
                    units: "metric",
                    lang: "tr",
                    exclude: "alerts"
                }
            }
            
            const reqq = request(options1, async (error, response, bodie) => {
                const bodi = JSON.parse(bodie)
                if (error) return msg.edit(`**HATA:** \`\`\`${error}\`\`\``)
                if (bodi.message) return msg.edit(`**HATA:** \`\`\`${bodi.message}\`\`\``)
                sicaklik = Math.round(bodi.current.temp * 10) / 10 || 0
                hissedilensicaklik = Math.round(bodi.current.feels_like * 10) / 10 || 0
                basinc = Math.round((bodi.current.sea_level ? bodi.current.sea_level : bodi.current.pressure) * 10) / 10 || 0
                gorusmesafesi = bodi.current.visibility.toLocaleString()
                nem = bodi.current.humidity || 0
                ruzgar = Math.round(bodi.current.wind_speed * 3.6) || 0
                anayazi = bodi.current.weather[0].main
                ikincilanayazi = bodi.current.weather[0].description
                ikincilanayazi = ikincilanayazi.replace(ikincilanayazi[0], ikincilanayazi[0].toUpperCase())
                bulutkapla = bodi.current.clouds || 0
                if (bodi.rain && bodi.rain["1h"]) birsaatlikyagis = Math.round(bodi.rain["1h"] * 10) / 10 || 0
                if (bodi.snow && bodi.snow["1h"]) birsaatlikkar = Math.round(bodi.snow["1h"] * 10) / 10 || 0
                const options2 = {
                    url: `http://api.weatherbit.io/v2.0/current`,
                    method: 'GET',
                    qs: {
                        lat: lat,
                        lon: lon,
                        key: "734615d6fb20401892670d5faef93ad1",
                        lang: "tr"
                    }
                }
                const reqqq = request(options2, async (error, response, bodyye) => {
                    const bodye = JSON.parse(bodyye)
                    if (error || bodye.message || bodye.error || bodye.count == 0) {
                        let embed = new Discord.MessageEmbed()
                        .setTitle(`${bodys.results[0].formatted} için hava durumu`)
                        .setDescription(`**${ikincilanayazi}**\n${ikincilanayazi}`)
                        .setFooter("OpenCageData, OpenWeatherMap")
                        .setColor("#2F3136")
                        .addField('**__Ana bilgiler__**', `**Sıcaklık:** ${sicaklik}°C (Hissedilen: ${hissedilensicaklik}°C)\n**Nem:** %${nem}\n**Rüzgar:** ${ruzgar} km/s\n**Basınç:** ${basinc} hPa\n**Geçmiş 1 saatlik yağış:** ${birsaatlikyagis} mm (Kar yağışı: ${birsaatlikkar} mm)\n**Görüş mesafesi:** ${gorusmesafesi} metre`)
                        .setThumbnail(`http://openweathermap.org/img/wn/${body.weather[0].icon}@2x.png`)
                        const optionshard = {
                            url: `https://api.openweathermap.org/data/2.5/onecall`,
                            method: 'GET',
                            qs: {
                                lat: lat,
                                lon: lon,
                                appid: "62ecc8fc69568788795c0d75a706278c",
                                units: "metric",
                                lang: "tr",
                                exclude: "current,hourly,alerts"
                            }
                        }
                        const reqhard = request(optionshard, async (errortt, response, bodie) => {
                            const bodi = JSON.parse(bodie)
                            let yagisbaslama = 0
                            let yagisbitis = 0
                            let dakika = 0
                            let yagismiktari = 0
                            for (const data of bodi.minutely) {
                                dakika += 1
                                if (yagisbaslama == 0 && data.precipitation > 0) {
                                    yagisbaslama = dakika
                                    yagismiktari += data.precipitation * mmconvert
                                }
                                if (yagisbaslama != 0 && yagisbitis == 0 && data.precipitation > 0) {
                                    yagismiktari += data.precipitation * mmconvert
                                }
                                if (yagisbaslama != 0 && yagisbitis == 0 && data.precipitation == 0) yagisbitis = dakika
                            }
                            yagismiktari = Math.round(yagismiktari * 100) / 100
                            if (yagisbaslama == 0) embed.addField(`**__1 saatlik tahmin__**`, `1 saat boyunca yağış beklenmiyor`)
                            if (yagisbaslama != 0) {
                                let yagisturihtimal = "yağmur"
                                if (sicaklik <= 2.5 && sicaklik > 1) yagisturihtimal = "karla karışık yağmur"
                                if (sicaklik <= 1) yagisturihtimal = "kar"
                                if (yagisbitis == 0) {
                                    if (yagisbaslama != 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbaslama} dakika sonra başlayacak.\n${60 - yagisbaslama} dakikadan uzun sürecek.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                    if (yagisbaslama == 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış 1 saatten uzun sürecek.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturihtimal}`, true)
                                } else {
                                    if (yagisbaslama != 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbaslama} dakika sonra başlayacak.\n${yagisbitis - yagisbaslama} dakika boyunca sürecek.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                    if (yagisbaslama == 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbitis} dakika boyunca sürecek.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturihtimal}`, true)
                                }
                            }
                            return msg.edit('', {embed: embed})
                        })
                    }
                    sicaklik = Math.round(((sicaklik + bodye.data[0].temp) / 2) * 10) / 10 || 0
                    basinc = Math.round(((basinc + bodye.data[0].slp) / 2) * 10) / 10 || 0
                    ruzgar = Math.round((ruzgar + bodye.data[0].wind_spd * 3.6) / 2) || 0
                    ruzgaryonu = bodye.data[0].wind_cdir_full || "Belirlenemedi"
                    bulutkapla = Math.round((bodye.data[0].clouds + bulutkapla) / 2)
                    ciynokta = Math.round(bodye.data[0].dewpt * 10) / 10 || 0
                    karderinlik = Math.round(bodye.data[0].snow * 10) / 10 || 0
                    hissedilensicaklik = Math.round(((hissedilensicaklik + bodye.data[0].app_temp) / 2) * 10) / 10 || 0
                    nem = Math.round((nem + bodye.data[0].rh) / 2) || 0
                    havakalitesi = bodye.data[0].aqi
                    iconlink = `http://openweathermap.org/img/wn/${bodi.current.weather[0].icon}@2x.png`
                    aciklamaliyazi = bodye.data[0].weather.description
                    const options3 = {
                        method: 'GET',
                        url: `http://api.weatherbit.io/v2.0/forecast/minutely`,
                        qs: {
                            lat: lat, lon: lon, key: "734615d6fb20401892670d5faef93ad1"
                        }
                    }
                    const reqqqq = request(options3, async (error, response, bodyyye) => {
                        const options4 = {
                            method: 'GET',
                            url: `http://api.weatherbit.io/v2.0/forecast/daily`,
                            qs: {
                                lat: lat, lon: lon, key: "734615d6fb20401892670d5faef93ad1", lang: "tr", days: 3
                            }
                        }
                        const reqqqqqqqq = request(options4, async (errortttt, response, bodis) => {
                            const bods = JSON.parse(bodis)
                            const bodyyy = JSON.parse(bodyyye)
                            const embed = new Discord.MessageEmbed().setTitle(`${bodys.results[0].formatted} için hava durumu`).setDescription(`**${ikincilanayazi}**\nMümkün: ${aciklamaliyazi}`).setFooter("OpenWeatherMap, Weatherbit").setColor("#2F3136").addField('**__Ana bilgiler__**', `**Sıcaklık:** ${sicaklik}°C (Hissedilen: ${hissedilensicaklik}°C) (Çiy: ${ciynokta}°C)\n**Nem:** %${nem}\n**Rüzgar:** ${ruzgar} km/s ${ruzgaryonu}\n**Basınç:** ${basinc} hPa\n**Geçmiş 1 saatlik yağış:** ${birsaatlikyagis} mm (Kar yağışı: ${birsaatlikkar} mm)\n**Görüş mesafesi:** ${gorusmesafesi} metre\n**Bulut kaplılığı:** %${bulutkapla}\n**Hava kalitesi indeksi:** ${havakalitesi}`).setThumbnail(iconlink);
                            if (!bodi.message && !bodi.error) {
                                const coll = [];
                                let lastcondit = "-"
                                let lastconditsure = 0
                                for (const data of bodi.hourly.slice(0, 24)) {
                                    if (lastcondit == "-") {
                                        coll.push(`1-${data.weather[0].description}`)
                                        lastcondit = data.weather[0].description
                                        lastconditsure = 1
                                    }
                                    if (lastcondit == data.weather[0].description) {
                                        coll.splice(coll.length - 1, 1)
                                        lastconditsure += 1
                                        coll.push(`${lastconditsure}-${lastcondit}`)
                                    }
                                    if (lastcondit != data.weather[0].description) {
                                        lastconditsure = 1
                                        lastcondit = data.weather[0].description
                                        coll.push(`${lastconditsure}-${lastcondit}`)
                                    }
                                }
                                let string = String()
                                let ilkmi = true
                                for (const ver of coll) {
                                    if (ilkmi == true) {
                                        ilkmi = false
                                        string += `${ver.split('-')[0]} saat ${ver.split('-')[1]}`
                                    } else {
                                        string += `, ve ${ver.split('-')[0]} saat ${ver.split('-')[1]}`
                                    }
                                }
                                embed.addField(`**__24 saatlik tahmin__**`, string)
                                embed.setFooter("OpenCageData, OpenWeatherMap, Weatherbit")
                                if (!errortttt) {
                                    embed.addField(`**__2 günlük tahmin__**`, `**__1 gün sonra__**\n${bods.data[1].weather.description} ve ${bodi.daily[1].weather[0].description}\n${Math.round((bodi.daily[1].temp.min + bods.data[1].min_temp) / 2)}°C / ${Math.round((bodi.daily[1].temp.max + bods.data[1].max_temp) / 2)}°C\n**Nem:** %${Math.round((bodi.daily[1].humidity + bods.data[1].rh) / 2)}\n**Rüzgar:** ${Math.round((bodi.daily[1].wind_speed * 3.6 + bods.data[1].wind_spd * 3.6) / 2)}${bodi.daily[1].wind_gust ? ` - ${Math.round((bodi.daily[1].wind_gust * 3.6 + bods.data[1].wind_gust_spd * 3.6) / 2)}` : ` - ${Math.round(bods.data[1].wind_gust_spd * 3.6)}`} km/s ${bods.data[1].wind_cdir_full}°\n**Yağış ihtimali:** %${Math.round((bodi.daily[1].pop * 100 + bods.data[1].pop) / 2)}${bodi.daily[1].rain && bods.data[1].precip ? `\n**Yağmur miktarı:** ${Math.round(bodi.daily[1].rain * 10) / 10} mm` : ``}${bodi.daily[1].snow && bods.data[1].snow ? `\n**Kar yağışı:** ${Math.round(bodi.daily[1].snow * 10) / 10} mm` : ``}\n \n**__2 gün sonra__**\n${bods.data[2].weather.description} ve ${bodi.daily[2].weather[0].description}\n${Math.round((bodi.daily[2].temp.min + bods.data[2].min_temp) / 2)}°C / ${Math.round((bodi.daily[2].temp.max + bods.data[2].max_temp) / 2)}°C\n**Nem:** %${Math.round((bodi.daily[2].humidity + bods.data[2].rh) / 2)}\n**Rüzgar:** ${Math.round((bodi.daily[2].wind_speed * 3.6 + bods.data[2].wind_spd * 3.6) / 2)}${bodi.daily[2].wind_gust ? ` - ${Math.round((bodi.daily[2].wind_gust * 3.6 + bods.data[2].wind_gust_spd * 3.6) / 2)}` : ` - ${Math.round(bods.data[2].wind_gust_spd * 3.6)}`} km/s ${bods.data[2].wind_cdir_full}°\n**Yağış ihtimali:** %${Math.round((bodi.daily[2].pop * 100 + bods.data[2].pop) / 2)}${bodi.daily[2].rain && bods.data[2].precip ? `\n**Yağmur miktarı:** ${Math.round(bodi.daily[2].rain * 10) / 10} mm` : ``}${bodi.daily[2].snow && bods.data[2].snow ? `\n**Kar yağışı:** ${Math.round(bodi.daily[2].snow * 10) / 10} mm` : ``}`, true)
                                }
                                let yagisbaslama = 0
                                let yagisbitis = 0
                                let dakika = 0
                                let yagismiktari = 0
                                let yagisturu = String()
                                let yagisbaslamaa = 0
                                let yagisbitiss = 0
                                let dakikaa = 0
                                let yagismiktarii = 0
                                if (bodyyy.error) return msg.edit(`Birkaç saniye bekleyip tekrardan deneyin.`)
                                for (const data of bodyyy.data) {
                                    dakika += 1
                                    if (yagisbaslama == 0 && (data.precip > 0 || data.snow > 0)) {
                                        yagisbaslama = dakika
                                        yagismiktari += data.precip * mmconvert
                                        yagisturu = data.snow > 0 ? "kar" : "yağmur"
                                        if (yagisturu == "kar" && data.snow < data.precip / 2) yagisturu = "karla karışık yağmur"
                                    }
                                    if (yagisbaslama != 0 && yagisbitis == 0 && (data.precip > 0 || data.snow > 0)) {
                                        yagismiktari += data.precip * mmconvert
                                        let suanyagisturu = data.snow > 0 ? "kar" : "yağmur"
                                        if (yagisturu == "kar" && data.snow < data.precip / 2) suanyagisturu = "karla karışık yağmur";
                                        if ((yagisturu == "yağmur" || yagisturu == "karla karışık yağmur") && suanyagisturu == "kar") yagisturu = "yağmur ardından kar";
                                        if ((yagisturu == "kar" || yagisturu == "karla karışık yağmur") && suanyagisturu == "yağmur") yagisturu = "kar ardından yağmur";
                                        if (yagisturu == "yağmur" && suanyagisturu == "karla karışık yağmur") yagisturu = "karla karışık yağmur";
                                    }
                                    if (yagisbaslama != 0 && yagisbitis == 0 && data.precip == 0 && data.snow == 0) yagisbitis = dakika
                                }
                                for (const data of bodi.minutely) {
                                    dakikaa += 1
                                    if (yagisbaslamaa == 0 && data.precipitation > 0) {
                                        yagisbaslamaa = dakikaa
                                        yagismiktarii += data.precipitation * mmconvert
                                    }
                                    if (yagisbaslamaa != 0 && yagisbitiss == 0 && data.precipitation > 0) {
                                        yagismiktarii += data.precipitation * mmconvert
                                    }
                                    if (yagisbaslamaa != 0 && yagisbitiss == 0 && data.precipitation == 0) yagisbitiss = dakikaa
                                }
                                yagismiktarii = Math.round(yagismiktarii * 100) / 100
                                yagismiktari = Math.round(yagismiktari * 100) / 100
                                if (yagisbaslama == 0 && yagisbaslamaa != 0) {
                                    let yagisturihtimal = "yağmur"
                                    if (sicaklik <= 2.5 && sicaklik > 1) yagisturihtimal = "karla karışık yağmur"
                                    if (sicaklik <= 1) yagisturihtimal = "kar"
                                    if (yagisbitiss == 0) {
                                        if (yagisbaslamaa != 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbaslamaa} dakika sonra başlama ihtimali var.\nGelme ihtimali olan yağış ${60 - yagisbaslamaa} dakikadan uzun sürebilir.\nGelecek 1 saatteki toplam yağış miktarı ihtimali: ${yagismiktarii} mm\nYağış türü tahmini: ${yagisturihtimal}`, true)
                                        if (yagisbaslamaa == 1) embed.addField(`**__1 saatlik tahmin__**`, `Şuan yağış olma ihtimali var ve ${60 - yagisbaslamaa} dakikadan uzun sürme ihtimali var.\nGelecek 1 saatteki toplam yağış miktarı ihtimali: ${yagismiktarii} mm\nYağış türü tahmini: ${yagisturihtimal}`, true)
                                    } else {
                                        if (yagisbaslamaa != 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbaslamaa} dakika sonra başlama ihtimali var.\n${yagisbitiss - yagisbaslamaa} dakika boyunca sürme ihtimali var.\nGelecek 1 saatteki toplam yağış miktarı ihtimali: ${yagismiktarii} mm\nYağış türü tahmini: ${yagisturihtimal}`, true)
                                        if (yagisbaslamaa == 1) embed.addField(`**__1 saatlik tahmin__**`, `Şuan yağış olma ihtimali var ve ${yagisbitiss - yagisbaslamaa} dakika boyunca sürme ihtimali var.\nGelecek 1 saatteki toplam yağış miktarı ihtimali: ${yagismiktarii} mm\nYağış türü tahmini: ${yagisturihtimal}`, true)
                                    }
                                } else {
                                    if (yagisbaslamaa == 0 && yagisbaslama != 0) {
                                        if (yagisbitis == 0) {
                                            if (yagisbaslama != 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbaslama} dakika sonra başlama ihtimali var.\nGelme ihtimali olan yağış ${60 - yagisbaslama} dakikadan uzun sürebilir.\nGelecek 1 saatteki toplam yağış miktarı ihtimali: ${yagismiktari} mm\nYağış türü tahmini: ${yagisturu}`, true)
                                            if (yagisbaslama == 1) embed.addField(`**__1 saatlik tahmin__**`, `Şuan yağış olma ihtimali var ve 1 saatten uzun sürme ihtimali var.\nGelecek 1 saatteki toplam yağış miktarı ihtimali: ${yagismiktari} mm\nYağış türü tahmini: ${yagisturu}`, true)
                                        } else {
                                            if (yagisbaslama != 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbaslama} dakika sonra başlama ihtimali var.\n${yagisbitis - yagisbaslama} dakika boyunca sürme ihtimali var.\nGelecek 1 saatteki toplam yağış miktarı ihtimali: ${yagismiktari} mm\nYağış türü tahmini: ${yagisturu}`, true)
                                            if (yagisbaslama == 1) embed.addField(`**__1 saatlik tahmin__**`, `Şuan yağış olma ihtimali var ve ${yagisbitis} dakika boyunca sürme ihtimali var.\nGelecek 1 saatteki toplam yağış miktarı ihtimali: ${yagismiktari} mm\nYağış türü tahmini: ${yagisturu}`, true)
                                        }
                                    } else {
                                        if (yagismiktarii != 0) yagismiktari = yagismiktarii
                                        let eskibasla = yagisbaslama
                                        let eskibitir = yagisbitis
                                        if (yagisbaslamaa != 0) yagisbaslama = yagisbaslamaa
                                        if (yagisbitiss != 0) yagisbitis = yagisbitiss
                                        if (yagisbaslamaa != 0 && yagisbitiss == 0) yagisbitis = 0
                                        if (yagisbaslama == 0 && yagisbaslamaa == 0) embed.addField(`**__1 saatlik tahmin__**`, `1 saat boyunca yağış beklenmiyor`, true)
                                        if (yagisbaslamaa == 1 && eskibasla > 1) {
                                            if (eskibitir == 0) {
                                                embed.addField(`**__1 saatlik tahmin__**`, `Şuan yağış olma ihtimali var, yoksa bile ${eskibasla} dakika sonra başlayacak. ${60 - eskibasla} dakikadan uzun sürebilir.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                            } else {
                                                embed.addField(`**__1 saatlik tahmin__**`, `Şuan yağış olma ihtimali var, yoksa bile ${eskibasla} dakika sonra başlayacak. ${eskibitir - eskibasla} dakika boyunca sürebilir.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                            }
                                        } else {
                                            if (eskibasla == 1 && yagisbaslamaa > 1) {
                                                if (yagisbitiss == 0) {
                                                    embed.addField(`**__1 saatlik tahmin__**`, `Şuan yağış olma ihtimali var, yoksa bile ${yagisbaslamaa} dakika sonra başlayacak. ${60 - yagisbaslamaa} dakikadan uzun sürebilir.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                                } else {
                                                    embed.addField(`**__1 saatlik tahmin__**`, `Şuan yağış olma ihtimali var, yoksa bile ${yagisbaslamaa} dakika sonra başlayacak. ${yagisbitiss - yagisbaslamaa} dakika boyunca sürebilir.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                                }
                                            } else {
                                                if (yagisbaslama != 0 && eskibitir != 0 && yagisbitiss == 0) {
                                                    if (yagisbaslama != 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbaslama} dakika sonra başlayacak.\n${eskibitir - yagisbaslama} dakika boyunca sürme veya 1 saatten uzun sürme ihtimali var.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                                    if (yagisbaslama == 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${eskibitir} dakika boyunca sürme veya 1 saatten uzun sürme ihtimali var.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                                } else {
                                                    if (yagisbaslama != 0 && eskibitir == 0 && yagisbitiss != 0) {
                                                        if (yagisbaslama != 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbaslama} dakika sonra başlayacak.\n${yagisbitiss - yagisbaslama} dakika boyunca sürme veya 1 saatten uzun sürme ihtimali var.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                                        if (yagisbaslama == 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbitiss} dakika boyunca sürme veya 1 saatten uzun sürme ihtimali var.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                                    } else {
                                                        if (yagisbaslama != 0) {
                                                            if (yagisbitis == 0) {
                                                                if (yagisbaslama != 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbaslama} dakika sonra başlayacak.\n${60 - yagisbaslama} dakikadan uzun sürecek.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                                                if (yagisbaslama == 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış 1 saatten uzun sürecek.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                                            } else {
                                                                if (yagisbaslama != 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbaslama} dakika sonra başlayacak.\n${yagisbitis - yagisbaslama} dakika boyunca sürecek.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                                                if (yagisbaslama == 1) embed.addField(`**__1 saatlik tahmin__**`, `Yağış ${yagisbitis} dakika boyunca sürecek.\nGelecek 1 saatteki toplam yağış miktarı: ${yagismiktari} mm\nYağış türü: ${yagisturu}`, true)
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            return msg.edit('', {embed: embed})
                        })
                    })
                })
            })
        })
    })
}

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: "havadurumu",
    description: "hava durumunu gösterir",
    usage: "havadurumu"
};