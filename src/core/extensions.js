import { isPowiainaNum } from "../utility/type-check";

Array.prototype.distinct = function() {
  return this.filter((value, index, self) => self.indexOf(value) === index);
};

Math.wrap = function(number, min, max) {
  const range = max - min + 1;
  const offset = ((number - min) % range);
  return offset < 0 ? max + 1 + offset : min + offset;
};

Math.clamp = function(value, min, max) {
  return Math.clampMax(Math.clampMin(value, min), max);
};

Math.clampMin = function(value, min) {
  return Math.max(value, min);
};

Math.clampMax = function(value, max) {
  return Math.min(value, max);
};

Array.prototype.nextSiblingIndex = function(current) {
  const currentIndex = this.indexOf(current);
  if (currentIndex === -1)
    throw "Current item is not in array";
  return currentIndex === this.length - 1 ? 0 : currentIndex + 1;
};

Array.prototype.nextSibling = function(current) {
  return this[this.nextSiblingIndex(current)];
};

Array.prototype.previousSiblingIndex = function(current) {
  const currentIndex = this.indexOf(current);
  if (currentIndex === -1)
    throw "Current item is not in array";
  return currentIndex === 0 ? this.length - 1 : currentIndex - 1;
};

Array.prototype.previousSibling = function(current) {
  return this[this.previousSiblingIndex(current)];
};

PowiainaNum.sumReducer = function(accumulator, previous) {
  return PowiainaNum.add(accumulator, previous);
};

PowiainaNum.prodReducer = function(accumulator, previous) {
  return PowiainaNum.mul(accumulator, previous);
};

Number.sumReducer = function(accumulator, previous) {
  return accumulator + previous;
};

Number.prodReducer = function(accumulator, previous) {
  return accumulator * previous;
};

PowiainaNum.maxReducer = function(a, b) {
  return PowiainaNum.max(a, b);
};

PowiainaNum.prototype.copyFrom = function(powiainaNum) {
  if (!(powiainaNum instanceof PowiainaNum) && !(powiainaNum instanceof PowiainaNumCurrency)) {
    throw "Copy value is not PowiainaNum or PowiainaNumCurrency";
  }
  this.mantissa = powiainaNum.mantissa;
  this.exponent = powiainaNum.exponent;
};

window.copyToClipboard = (function() {
  const el = document.createElement("textarea");
  document.body.appendChild(el);
  el.style.position = "absolute";
  el.style.left = "-9999999px";
  el.setAttribute("readonly", "");
  return function(str) {
    try {
      el.value = str;
      el.select();
      return document.execCommand("copy");
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log(ex);
      return false;
    }
  };
}());

window.safeCall = function safeCall(fn) {
  if (fn) fn();
};

String.prototype.capitalize = function() {
  return this.toLowerCase().replace(/^\w/u, c => c.toUpperCase());
};

String.prototype.splice = function(start, delCount, newSubStr) {
  return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
};

/**
 * @param {number} start
 * @param {number} count
 * @returns {number[]}
 */
Array.range = function(start, count) {
  return [...Array(count).keys()].map(i => i + start);
};

/**
 * @param {number} value
 * @param {number} count
 * @returns {number[]}
 */
Array.repeat = function(value, count) {
  return Array(count).fill(value);
};

/**
 * @param {function} predicate
 */
Array.prototype.first = function(predicate) {
  if (predicate === undefined) {
    return this.length > 0 ? this[0] : undefined;
  }
  if (typeof predicate !== "function")
    throw "Predicate must be a function";
  for (let i = 0; i < this.length; i++) {
    if (predicate(this[i]) === true) return this[i];
  }
  throw "Array doesn't contain a matching item";
};

/**
 * @param {function?} predicate
 */
Array.prototype.last = function(predicate) {
  if (predicate === undefined) {
    return this.length > 0 ? this[this.length - 1] : undefined;
  }
  if (typeof predicate !== "function")
    throw "Predicate must be a function";
  for (let i = this.length - 1; i >= 0; i--) {
    if (predicate(this[i]) === true) return this[i];
  }
  throw "Array doesn't contain a matching item";
};

/**
 * @param {function?} keyFun
 * @param {function?} valueFun
 * @returns {object}
 */
Array.prototype.mapToObject = function(keyFun, valueFun) {
  if (typeof keyFun !== "function" || typeof valueFun !== "function")
    throw "keyFun and valueFun must be functions";
  const out = {};
  for (let idx = 0; idx < this.length; ++idx) {
    out[keyFun(this[idx], idx)] = valueFun(this[idx], idx);
  }
  return out;
};

/**
 * @type {number[]}
 */
Array.dimensionTiers = Array.range(1, 8);

/**
 * @returns {number}
 */
Array.prototype.sum = function() {
  if (this.length === 0) return 0;
  return this.reduce(Number.sumReducer);
};

/**
 * @returns {number}
 */
Array.prototype.max = function() {
  if (this.length === 0) return 0;
  return this.reduce((a, b) => Math.max(a, b));
};

/**
 * @returns {number}
 */
Array.prototype.min = function() {
  if (this.length === 0) return 0;
  return this.reduce((a, b) => Math.min(a, b));
};

/**
 * @param {function} predicate
 * @returns {number}
 */
Array.prototype.countWhere = function(predicate) {
  let count = 0;
  for (const item of this) {
    if (predicate(item))++count;
  }
  return count;
};

/**
 * @returns {PowiainaNum}
 */
PowiainaNum.prototype.clampMaxExponent = function(maxExp) {
  return this.exponent >= maxExp
    ? PowiainaNum.fromMantissaExponent_noNormalize(1, maxExp) : this;
};

/**
 * @return {PowiainaNum}
 */
Number.prototype.toPowiainaNum = function() {
  return new PowiainaNum(this.valueOf());
};

Math.log4 = Math.log(4);

Array.prototype.randomElement = function() {
  return this[Math.floor(Math.random() * this.length)];
};

PowiainaNum.prototype.valueOf = () => {
  throw new Error("Implicit conversion from PowiainaNum to number");
};

Set.prototype.countWhere = function(predicate) {
  let count = 0;
  for (const item of this) {
    if (predicate(item))++count;
  }
  return count;
};

Set.prototype.find = function(predicate) {
  for (const item of this) {
    if (predicate(item)) return item;
  }
  return undefined;
};

Set.prototype.some = function(predicate) {
  for (const item of this) {
    if (predicate(item)) return true;
  }
  return false;
};

Set.prototype.every = function(predicate) {
  for (const item of this) {
    if (!predicate(item)) return false;
  }
  return true;
};

Array.prototype.compact = function() {
  return this.filter(x => x !== undefined && x !== null);
};

Array.prototype.toBitmask = function() {
  return this.reduce((prev, val) => prev | (1 << val), 0);
};

Set.prototype.toBitmask = function() {
  let mask = 0;
  for (const id of this) mask |= (1 << id);
  return mask;
};

Array.fromBitmask = function(mask) {
  const bitIndices = [];
  let currentIndex = 0;
  while (mask !== 0) {
    if (mask & 1) bitIndices.push(currentIndex);
    // eslint-disable-next-line no-param-reassign
    mask >>= 1;
    ++currentIndex;
  }
  return bitIndices;
};

String.isWhiteSpace = function(value) {
  return value && !value.trim();
};

PowiainaNum.isFinite = function(value) {
  if (!isPowiainaNum(value)) return isFinite(value);
  return (isFinite(value.m) || isFinite(value.e)) && !(value.e >= 9e15);
};