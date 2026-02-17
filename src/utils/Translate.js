const locales = {
    tr: require("../locales/tr.json"),
    en: require("../locales/en.json"),
};

/*
* @param {string} key
* @param {string} lang
* @param {object} placeholders
*/

module.exports = (key, lang = "en", placeholders = {}) => {
    const selectedLanguage = locales[lang] ? locales[lang] : locales['en'];
    let text = selectedLanguage[key] || key;

    if (placeholders) {
        Object.keys(placeholders).forEach(ph => {
            text = text.replace(new RegExp(`{${ph}}`, "g"), placeholders[ph]);
        });
    }
    return text;
}