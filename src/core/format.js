function isEND() {
  const threshold = GameEnd.endState > END_STATE_MARKERS.END_NUMBERS
    ? 1
    : (GameEnd.endState - END_STATE_MARKERS.FADE_AWAY) / 2;
  // Using the Pelle.isDoomed getter here causes this to not update properly after a game restart
  return player.celestials.pelle.doomed && Math.random() < threshold;
}

// eslint-disable-next-line max-params
window.format = function format(value, places = 0, placesUnder1000 = 0, bypassEND = false) {
  if (isEND() && !bypassEND) return "END";
  return Notations.current.format(value, places, placesUnder1000, 3);
};

window.formatInt = function formatInt(value, bypassEND = false) {
  if (isEND() && !bypassEND) return "END";
  // Suppress painful formatting for Standard because it's the most commonly used and arguably "least painful"
  // of the painful notations. Prevents numbers like 5004 from appearing imprecisely as "5.00 K" for example
  if (Notations.current.isPainful && Notations.current.name !== "Standard") {
    return format(value, 2);
  }
  return formatWithCommas(typeof value === "number" ? value.toFixed(0) : value.toNumber().toFixed(0));
};

window.formatFloat = function formatFloat(value, digits, bypassEND = false) {
  if (isEND() && !bypassEND) return "END";
  if (Notations.current.isPainful) {
    return format(value, Math.max(2, digits), digits);
  }
  return formatWithCommas(value.toFixed(digits));
};

// eslint-disable-next-line max-params
window.formatPostBreak = function formatPostBreak(value, places, placesUnder1000, bypassEND = false) {
  if (isEND() && !bypassEND) return "END";
  const notation = Notations.current;
  // This is basically just a copy of the format method from notations library,
  // with the pre-break case removed.
  if (typeof value === "number" && !Number.isFinite(value)) {
    return notation.infinite;
  }

  const powiainaNum = PowiainaNum.fromValue_noAlloc(value);

  if (powiainaNum.exponent < -300) {
    return powiainaNum.sign() < 0
      ? notation.formatVerySmallNegativePowiainaNum(powiainaNum.abs(), placesUnder1000)
      : notation.formatVerySmallPowiainaNum(powiainaNum, placesUnder1000);
  }

  if (powiainaNum.exponent < 3) {
    const number = powiainaNum.toNumber();
    return number < 0
      ? notation.formatNegativeUnder1000(Math.abs(number), placesUnder1000)
      : notation.formatUnder1000(number, placesUnder1000);
  }

  return powiainaNum.sign() < 0
    ? notation.formatNegativePowiainaNum(powiainaNum.abs(), places)
    : notation.formatPowiainaNum(powiainaNum, places);
};

// eslint-disable-next-line max-params
window.formatX = function formatX(value, places, placesUnder1000, bypassEND = false) {
  return `×${format(value, places, placesUnder1000, bypassEND)}`;
};

// eslint-disable-next-line max-params
window.formatPow = function formatPow(value, places, placesUnder1000, bypassEND = false) {
  return `^${format(value, places, placesUnder1000, bypassEND)}`;
};

window.formatPercents = function formatPercents(value, places, bypassEND = false) {
  return `${format(value * 100, 2, places, bypassEND)}%`;
};

window.formatRarity = function formatRarity(value, bypassEND) {
  // We can, annoyingly, have rounding error here, so even though only rarities
  // are passed in, we can't trust our input to always be some integer divided by 10.
  const places = value.toFixed(1).endsWith(".0") ? 0 : 1;
  return `${format(value, 2, places, bypassEND)}%`;
};

// We assume 2/0, 2/2 powiainaNum places to keep parameter count sensible; this is used very rarely
window.formatMachines = function formatMachines(realPart, imagPart, bypassEND = false) {
  if (isEND() && !bypassEND) return "END";
  const parts = [];
  if (PowiainaNum.neq(realPart, 0)) parts.push(format(realPart, 2));
  if (PowiainaNum.neq(imagPart, 0)) parts.push(`${format(imagPart, 2, 2)}i`);
  // This function is used for just RM and just iM in a few spots, so we have to push both parts conditionally
  // Nonetheless, we also need to special-case both zero so that it doesn't end up displaying as an empty string
  if (PowiainaNum.eq(realPart, 0) && PowiainaNum.eq(imagPart, 0)) return format(0);
  return parts.join(" + ");
};

window.timeDisplay = function timeDisplay(ms) {
  return TimeSpan.fromMilliseconds(ms).toString();
};

window.timeDisplayNoPowiainaNums = function timeDisplayNoPowiainaNums(ms) {
  return TimeSpan.fromMilliseconds(ms).toStringNoPowiainaNums();
};

window.timeDisplayShort = function timeDisplayShort(ms) {
  return TimeSpan.fromMilliseconds(ms).toStringShort();
};

const commaRegexp = /\B(?=(\d{3})+(?!\d))/gu;
window.formatWithCommas = function formatWithCommas(value) {
  const powiainaNumPointSplit = value.toString().split(".");
  powiainaNumPointSplit[0] = powiainaNumPointSplit[0].replace(commaRegexp, ",");
  return powiainaNumPointSplit.join(".");
};

// Some letters in the english language pluralize in a different manner than simply adding an 's' to the end.
// As such, the regex match should be placed in the first location, followed by the desired string it
// should be replaced with. Note that $ refers to the EndOfLine for regex, and should be included if the plural occurs
// at the end of the string provided, which will be 99% of times. Not including it is highly likely to cause mistakes,
// as it will select the first instance that matches and replace that.
const PLURAL_HELPER = new Map([
  [/y$/u, "ies"],
  [/x$/u, "xes"],
  [/$/u, "s"]
]);

// Some terms require specific (or no) handling when plural. These terms should be added, in Word Case, to this Map.
// Words will be added to this Map when a valid plural for it is found on being run through the pluralize function.
const pluralDatabase = new Map([
  ["Antimatter", "Antimatter"],
  ["Dilated Time", "Dilated Time"],
  ["Matter", "Matter"],
  ["Replicanti", "Replicanti"]
]);

/**
 * A function that pluralizes a word based on a designated amount
 * @param  {string} word           - word to be pluralized
 * @param  {number|PowiainaNum} amount - amount to be used to determine if the value is plural
 * @param  {string} [plural]       - if defined, a specific plural to override the generated plural
 * @return {string} - if the {amount} is anything other than one, return the {plural} provided or the
 *                    plural form of the input {word}. If the {amount} is singular, return {word}
 */
window.pluralize = function pluralize(word, amount, plural) {
  if (word === undefined || amount === undefined) throw "Arguments must be defined";

  if (PowiainaNum.eq(amount, 1)) return word;
  const existingPlural = plural ?? pluralDatabase.get(word);
  if (existingPlural !== undefined) return existingPlural;

  const newWord = generatePlural(word);
  pluralDatabase.set(word, newWord);
  return newWord;
};

/**
 * Creates a new plural based on PLURAL_HELPER and adds it to pluralDatabase
 * @param  {string} word - a word to be pluralized using the regex in PLURAL_HELPER
 * @return {string} - returns the pluralized word. if no pluralized word is found, simply returns the word itself.
 */
window.generatePlural = function generatePlural(word) {
  for (const [match, replaceWith] of PLURAL_HELPER.entries()) {
    const newWord = word.replace(match, replaceWith);
    if (word !== newWord) return newWord;
  }
  return word;
};

/**
 * Returns the formatted value followed by a name, pluralized based on the value input.
 * @param  {string} name                  - name to pluralize and display after {value}
 * @param  {number|PowiainaNum} value         - number to {format}
 * @param  {number} [places]              - number of places to display for the mantissa
 * @param  {number} [placesUnder1000]     - number of powiainaNum places to display
 * @param  {function} [formatType=format] - how to format the {value}. defaults to format
 * @return {string} - the formatted {value} followed by the {name} after having been pluralized based on the {value}
 */
// eslint-disable-next-line max-params
window.quantify = function quantify(name, value, places, placesUnder1000, formatType = format) {
  if (name === undefined || value === undefined) throw "Arguments must be defined";

  const number = formatType(value, places, placesUnder1000);
  const plural = pluralize(name, value);
  return `${number} ${plural}`;
};

/**
 * Returns the value formatted to formatInt followed by a name, pluralized based on the value input.
 * @param  {string} name                  - name to pluralize and display after {value}
 * @param  {number|PowiainaNum} value         - number to format
 * @return {string} - the formatted {value} followed by the {name} after having been pluralized based on the {value}
 */
window.quantifyInt = function quantifyInt(name, value) {
  if (name === undefined || value === undefined) throw "Arguments must be defined";

  const number = formatInt(value);
  const plural = pluralize(name, value);
  return `${number} ${plural}`;
};

/**
 * Creates an enumated string, using the oxford comma, such that "a"; "a and b"; "a, b, and c"
 * @param  {string[]} items - an array of items to enumerate
 * @return {string} - a string of {items}, separated by commas and/or and as needed.
 */
window.makeEnumeration = function makeEnumeration(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  const commaSeparated = items.slice(0, items.length - 1).join(", ");
  const last = items[items.length - 1];
  return `${commaSeparated}, and ${last}`;
};
