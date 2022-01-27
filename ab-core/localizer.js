/**
 * @typedef {Object} LocalizerConfig - Configuration for the localizer
 * @property {string} file - Path to file with the translations
 * @property {string} lang - Language code to use (ex.: "EN" for english)
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
		if (!config.lang || typeof config.lang != "string") throw new Error("'lang' parameter must be a non-empty string");
		if (!config.file || typeof config.file != "string") throw new Error("'file' parameter must be a non-empty string");
		this.lang = config.lang;
		this.file = require(config.file);
	};

	/**
	 * Update this localizer's lang without changing the entire config
	 * @param {LocalizerConfig.lang} lang - The language code to use (ex.: "EN")
	 * @return {string}
	 */
	setLocale(lang) {
		if (!lang || typeof lang != "string") throw new Error("'lang' parameter must be a non-empty string");
		this.lang = lang;
		return this.lang;
	};

	translate(string) {
		if (!string || typeof string != "string") throw new Error("'string' parameter must be a non-empty string");
	};

	_ = this.translate;
};