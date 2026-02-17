const axios = require("axios");
const translate = require("../utils/Translate");
const en = require("../locales/en.json");
const tr = require("../locales/tr.json");

const getLocalizations = (keyname) => {
    return {
        "tr": tr[keyname],
    }
}

module.exports = {
    name: "weather",
    aliases: ["havadurumu", "havad-urumu"],
    description: "CMD_DESC_WEATHER",
    displayName: "CMD_NAME_WEATHER",
    permLevel: 0,

    slashCommand: {
        name: "weather",
        name_localizations: getLocalizations("CMD_NAME_WEATHER"),
        description: en.CMD_DESC_WEATHER,
        description_localizations: getLocalizations("CMD_DESC_WEATHER"),
        type: 1,
        options: [
            {
                name: "city",
                name_localizations: { "tr": "şehir" },
                description: "The city name",
                description_localizations: { "tr": "Hava durumunu istediğin şehir" },
                type: 3,
                required: true
            }
        ]
    },

    execute: async (bot, msgOrInteraction, args, guildData) => {
        const lang = guildData ? guildData.language : "en";
        const isSlash = msgOrInteraction.createMessage && !msgOrInteraction.author;

        const reply = async (contentOrEmbed) => {
            const payload = typeof contentOrEmbed === "string" ? { content: contentOrEmbed } : contentOrEmbed;

            try {
                if (isSlash) {
                    await msgOrInteraction.createMessage(payload);
                    return {
                        edit: async (newContent) => {
                            const newPayload = typeof newContent === "string" ? { content: newContent } : newContent;
                            return msgOrInteraction.editOriginalMessage(newPayload);
                        }
                    };
                } else {
                    return bot.createMessage(msgOrInteraction.channel.id, payload);
                }
            } catch (e) {
                console.error("Mesaj gönderme hatası:", e);
                return null;
            }
        };

        if (!args[0]) {
            return reply(translate("ENTER_CITY", lang));
        }

        const loadingMsg = await reply(translate("LOADING_DATA", lang));

        try {
            const geoRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
                params: {
                    q: args.join(' '),
                    key: process.env.OPENCAGE_API_KEY,
                    language: lang,
                    limit: 1,
                }
            });

            if (geoRes.data.status.code !== 200 || geoRes.data.results.length === 0) {
                if (loadingMsg) return loadingMsg.edit(translate("CITY_NOT_FOUND", lang));
                return reply(translate("CITY_NOT_FOUND", lang));
            }

            const { lat, lng: lon } = geoRes.data.results[0].geometry;
            const formattedLocation = geoRes.data.results[0].formatted;

            const [currentRes, forecastRes, wbRes] = await Promise.all([
                axios.get("https://api.openweathermap.org/data/2.5/weather", {
                    params: {
                        lat, lon,
                        appid: process.env.OPENWEATHER_API_KEY,
                        units: "metric",
                        lang: lang
                    }
                }),
                axios.get("https://api.openweathermap.org/data/2.5/forecast", {
                    params: {
                        lat, lon,
                        appid: process.env.OPENWEATHER_API_KEY,
                        units: "metric",
                        lang: lang
                    }
                }),
                axios.get("https://api.weatherbit.io/v2.0/current", {
                    params: {
                        lat, lon,
                        key: process.env.WEATHERBIT_API_KEY,
                        lang: lang
                    }
                })
            ]);

            const owm = currentRes.data;
            const forecast = forecastRes.data;
            const wb = wbRes.data.data[0];
            const temp = Math.round(((owm.main.temp + wb.temp) / 2) * 10) / 10;
            const feelsLike = Math.round(((owm.main.feels_like + wb.app_temp) / 2) * 10) / 10;
            const pressure = Math.round((owm.main.pressure + wb.slp) / 2);
            const humidity = Math.round((owm.main.humidity + wb.rh) / 2);
            const windSpeed = Math.round(((owm.wind.speed * 3.6) + (wb.wind_spd * 3.6)) / 2);
            const clouds = Math.round((owm.clouds.all + wb.clouds) / 2);

            let desc = owm.weather[0].description;
            desc = desc.charAt(0).toUpperCase() + desc.slice(1);

            const embed = {
                title: translate("WEATHER_TITLE", lang, { location: formattedLocation }),
                description: `**${owm.weather[0].main}**\n${desc}`,
                color: 0x2F3136,
                thumbnail: { url: `http://openweathermap.org/img/wn/${owm.weather[0].icon}@2x.png` },
                footer: { text: translate("FOOTER_TEXT", lang) },
                fields: [
                    {
                        name: translate("MAIN_INFO_TITLE", lang),
                        value: `**${translate("TEMP_LABEL", lang)}:** ${temp}°C (${translate("FEELS_LIKE_LABEL", lang)}: ${feelsLike}°C)\n` +
                            `**${translate("HUMIDITY_LABEL", lang)}:** %${humidity}\n` +
                            `**${translate("WIND_LABEL", lang)}:** ${windSpeed} km/s (${wb.wind_cdir_full || "-"})\n` +
                            `**${translate("PRESSURE_LABEL", lang)}:** ${pressure} hPa\n` +
                            `**${translate("CLOUDS_LABEL", lang)}:** %${clouds}\n` +
                            `**${translate("VISIBILITY_LABEL", lang)}:** ${(owm.visibility / 1000).toFixed(1)} km`,
                        inline: false
                    }
                ]
            };

            const rain1h = (owm.rain && owm.rain["1h"]) ? owm.rain["1h"] : 0;
            if (rain1h > 0) {
                embed.fields.push({
                    name: translate("RAIN_1H_TITLE_EMOJI", lang),
                    value: `**${translate("TOTAL_RAIN_LABEL", lang)}:** ${rain1h} mm`,
                    inline: true
                });
            } else {
                embed.fields.push({
                    name: translate("FORECAST_1H_TITLE", lang),
                    value: translate("NO_RAIN_EXPECTED", lang),
                    inline: true
                });
            }

            let dailyText = "";
            const today = new Date().getDate();
            let daysFound = 0;

            for (const item of forecast.list) {
                const itemDate = new Date(item.dt * 1000);

                if (itemDate.getDate() !== today && itemDate.getHours() >= 11 && itemDate.getHours() <= 13) {
                    const dayName = itemDate.toLocaleDateString(lang, { weekday: 'long' });
                    const weatherDesc = item.weather[0].description;

                    dailyText += `**${dayName}:** ${Math.round(item.main.temp)}°C - ${weatherDesc}\n`;
                    daysFound++;
                }

                if (daysFound >= 2) break;
            }

            if (dailyText) {
                embed.fields.push({
                    name: translate("FORECAST_2D_TITLE", lang),
                    value: dailyText,
                    inline: true
                });
            }

            if (loadingMsg) {
                await loadingMsg.edit({ content: "", embed: embed });
            } else {
                await reply({ embed: embed });
            }

        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error("API Error Data:", error.response.data);
            }

            if (loadingMsg) {
                loadingMsg.edit(translate("GENERIC_ERROR", lang)).catch(() => {});
            } else {
                reply(translate("GENERIC_ERROR", lang)).catch(() => {});
            }
        }
    }
};