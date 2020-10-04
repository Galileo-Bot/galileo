/**
 * Coupe le texte en ajoutant '...' si il est plus long que la maxLength.
 * @param {string} text - Texte.
 * @param {number} maxLength - Longueur maximale.
 * @returns {string} - Texte coupé.
 */
function formatWithRange(text, maxLength) {
	return text.length > maxLength ? `${text.substring(0, maxLength - 3)}...` : text;
}

/**
 * Formatte le pattern pour pouvoir ajouter des éléments d'une date, un peu comme moments mais ne fonctionne qu'avec :
 *
 *   * Année `(yyyy)`
 *   * Mois `(MM) | (MMM (pour le nom complet))`
 *   * Nom des jours de la semaine. `(DD)`
 *   * Jours `(jj)`
 *   * Heures `(hh)`
 *   * Minutes `(mm)`
 *   * Secondes `(ss)`
 *   * Millisecondes `(SSSS)`
 *   * Nom du fuseau horraire `(TTTT)`
 *
 * @example
 * const pattern = "Il est hh heure et mm minutes et on est DDD.";
 * const result = parseDate(pattern);
 *
 * console.log(result); // Il est 01 heure et 50 minutes et on est Jeudi.
 *
 * @param {string} pattern - Le patterne demandé.
 * @param {Date} [date = new Date()] - La date.
 * @param {Boolean} [removeOneDay = false] - Si on doit supprimer un jour ({@param options
@link parseRelativeDate}).
 * @param {Intl.DateTimeFormatOptions} [options = {}] - Les options pour Intl.
 * @returns {string} - La date reformatté.
 */
function parseDate(pattern, date = new Date(), removeOneDay = false, options = {}) {
	const settings = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		weekday: 'long',
		hour12: false,
		timeZone: 'Europe/Paris',
		timeZoneName: 'long',
	};
	Object.keys(options).forEach(key => {
		settings[key] = options[key];
	});

	const formater = new Intl.DateTimeFormat('fr-fr', settings);
	const parts = new Map();
	formater.formatToParts(date).forEach(part => parts.set(part.type, part.value));

	let result = pattern;
	result = result
		.replace(/y{4}/g, parts.get('year'))
		.replace(/M{2}/g, parts.get('month'))
		.replace(/M{3}/g, new Intl.DateTimeFormat('fr', {month: 'long'}).format(date))
		.replace(/D{2}/g, parts.get('weekday'))
		.replace(/[d|j]{2}/g, addMissingZeros(removeOneDay ? parts.get('day') - 1 : parts.get('day')))
		.replace(/h{2}/g, parts.get('hour'))
		.replace(/m{2}/g, parts.get('minute'))
		.replace(/s{2}/g, parts.get('second'))
		.replace(/S{4}/g, addMissingZeros(date.getMilliseconds(), 3))
		.replace(/T{4}/g, parts.get('timeZoneName'));

	return result;
}

/**
 * Fait la même chose que {@link parseDate} mais avec une date relative.
 * @see parseDate
 *
 * @param {string} pattern - Le patterne.
 * @param {Date} [relativeDate = new Date()] - La date relative.
 * @returns {string} - La date relative reformatée.
 */
function parseRelativeDate(pattern, relativeDate = new Date()) {
	relativeDate.setFullYear(relativeDate.getFullYear() - 1900);
	relativeDate.setHours(relativeDate.getHours() - 1);
	return parseDate(pattern, relativeDate, true);
}

/**
 * Ajoute le(s) zéro(s) manquant(s) à un nombre avec une taille maximale cherchée.
 * @param {string|number} number - Le nombre.
 * @param {number} size - La taille voulue.
 * @returns {string} - Le résultat.
 */
function addMissingZeros(number, size) {
	return String(number).length < size ? '0'.repeat(size - String(number).length) + number : number;
}

/**
 * Utile pour la commande "remind" par exemple.
 * @example
 * const result = getTime("Je veux attendre 5h");
 * console.log(result);
 * {
 *   type: 'h',
 *   value: 18000000 (1000 * 60 * 60 * 5)
 * }
 *
 * @param {String|String[]} args - Texte.
 * @returns {{type: string, value: number}} - Retourne un objet contenant le type de temps et le nombre de millisecondes.
 */
function getTime(args) {
	function setTime(text, time) {
		if (['d', 'j', 'jour', 'jours'].some(s => text.endsWith(s))) {
			time.value = 1000 * 60 * 60 * 24 * parseInt(text.slice(0, text.length - 1));
			time.type = 'd';
		} else if (['h', 'heure', 'heures', 'hour', 'hours'].some(s => text.endsWith(s))) {
			time.value = 1000 * 60 * 60 * parseInt(text.slice(0, text.length - 1));
			time.type = 'h';
		} else if (['m', 'minute', 'minutes'].some(s => text.endsWith(s))) {
			time.value = 1000 * 60 * parseInt(text.slice(0, text.length - 1));
			time.type = 'm';
		} else if (['s', 'seconde', 'secondes', 'second', 'seconds'].some(s => text.endsWith(s))) {
			time.value = 1000 * parseInt(text.slice(0, text.length - 1));
			time.type = 's';
		}
	}

	const time = {
		value: 0,
		type: '',
	};

	const argsArray = (typeof args === 'string' ? args : args.join(' ')).toLowerCase().trim().split(/ +/g);
	const text = typeof args === 'string' ? argsArray[argsArray.length - 1] : args[args.length - 1];
	setTime(text, time);

	if (time.value === 0) {
		setTime(args[0], time);
	}
	return time;
}

/**
 * Permet de transformer un gros nombre en KB/MB/GB
 * @param {number} bytes - Le nombre d'octets
 * @returns {string} - Le résultat.
 */
function formatByteSize(bytes) {
	if (bytes < 1000) return `${bytes} octets`;
	else if (bytes < 1000000) return `${(bytes / 1000).toFixed(3)} KB`;
	else if (bytes < 1000000000) return `${(bytes / 1000000).toFixed(3)} MB`;
	else return `${(bytes / 1000000000).toFixed(3)} GB`;
}

module.exports = {
	getTime,
	parseDate,
	addMissingZeros,
	formatWithRange,
	parseRelativeDate,
	formatByteSize,
};
