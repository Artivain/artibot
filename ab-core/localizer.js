const fs = require("fs");

/**
 * @typedef {Object} LocalizerConfig - Configuration for the localizer
 * @property {string} filePath - Path to file with the translations
 * @property {string} [lang] - Language code to use (ex.: "EN" for english)
 */

module.exports = class Localizer {
	/**
	 * Translation tool for Artibot
	 * @author GoudronViande24
	 * @since 2.0.0
	 * @param {LocalizerConfig} config - The configuration for this localizer
	 */
	constructor(config) {
		this.updateConfig(config);
	};

	/**
	 * Update this localizer's configuration
	 * @param {LocalizerConfig} config - Configuration for the localizer
	 */
	updateConfig(config) {
		if (!config.filePath || typeof config.filePath != "string") throw new Error("'file' parameter must be a non-empty string");
		this.updateTranslationsFile(config.filePath);
		this.setLocale(config.lang);
	};

	/**
	 * Update this localizer's lang without changing the entire config
	 * @param {LocalizerConfig.lang} [lang] - The language code to use (ex.: "EN")
	 * @return {string}
	 */
	setLocale(lang = this.file.default.toLowerCase()) {
		this.lang = lang;
		return this.lang;
	};

	/**
	 * Translate a string
	 * @param {string} string - The string to translate
	 * @param {string} [lang] - The lang to translate this string into
	 * @returns {string} The translated string
	 */
	translate(string, lang = this.lang) {
		if (!string || typeof string != "string") throw new Error("'string' parameter must be a non-empty string");
		lang = lang.toLowerCase();

		if (lang == this.file.default) return string;

		try {
			var translated = this.file.strings[string][lang];
		} catch {
			throw new Error("Localizer: An error occured when trying to translate this string. Maybe it just does not exist in the file or you made an error in it.")
		};

		if (translated) return translated;
		return string
	};

	/**
	 * Translate a string and replace the placeholders with specified values
	 * @param {string} string - The string to translate
	 * @param {Object} settings - Parameters for the translation
	 * @param {string} [settings.lang] - The lang to translate this string into
	 * @param {string[]} settings.placeholders - List of the placeholders values to insert into the translated string
	 * @returns {string}
	 */
	translateWithPlaceholders(string, { lang, placeholders }) {
		let translated = this.translate(string, lang);
		placeholders.forEach((placeholder, i) => translated = translated.replace(`[[${i}]]`, placeholder));
		return translated
	};

	_ = this.translate;

	__ = this.translateWithPlaceholders;

	/**
	 * Update the translation file
	 * @param {string} [filePath] - The path to the translation file
	 */
	updateTranslationsFile(filePath = this.filePath) {
		this.filePath = filePath;

		/** @type {Object} */
		this.file = JSON.parse(fs.readFileSync(filePath));
	};
};