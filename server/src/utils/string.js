/**
 * String utils
 * @module utils/string
 */
'use strict';


/**
 * Slugify a string
 * @param {String} 
 * @return {String}
 */
var slugify = function(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

/**
 * Slugify a string
 * @param {String} 
 * @return {String}
 */
module.exports.slugify = slugify;



/**
 * Orderify a string (heuristic)
 * @param {String} 
 * @return {String}
 */
var orderify = function(text, isName) {
  if(isName) {
    text = text.split(/[\s,]+/).reverse().join(', ');
  } else {
    var textlc = text.toString().toLowerCase();
    if(textlc.indexOf('the ') === 0) {
      text = text.substr(4) + ', The';
    } else if(textlc.indexOf('le ') === 0) {
      text = text.substr(3) + ', Le';
    } else if(textlc.indexOf('la ') === 0) {
      text = text.substr(3) + ', La';
    } else if(textlc.indexOf('les ') === 0) {
      text = text.substr(4) + ', Les';
    }
  }
  return text;
};

/**
 * Orderify a string (heuristic)
 * @param {String} 
 * @return {String}
 */
module.exports.orderify = orderify;