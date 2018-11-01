'use strict';

var repeat = require('repeat-string');


/**
 * Align string with whitespace.
 *
 * @arg {*} string - Data to be aligned. Converted to a string.
 * @arg {number} width
 * @arg {"center","left","right","fill"} [alignment="center"]
 * @arg {string} [placeholder=" "]
 */
module.exports = function (string, width, alignment, placeholder) {
  string = string.toString();

  if (typeof width == 'object') {
    var options = width;

    width = options.width;
    alignment = options.alignment;
    placeholder = options.placeholder;
  }
  else if (typeof alignment == 'string' && alignment.length == 1) {
    placeholder = alignment;
    alignment = null;
  }

  alignment = alignment || 'center';
  placeholder = String(placeholder == null ? ' ' : placeholder);

  if (placeholder.length != 1) {
    throw new Error('Placeholder must be of length 1');
  }

  if (alignment == 'fill') {
    return repeat(string, Math.ceil(width / string.length)).slice(0, width);
  }

  if (width <= string.length) {
    return string;
  }

  if (alignment == 'center') {
    var left = Math.floor((width - string.length) / 2)
      , right = width - string.length - left;

    return repeat(placeholder, left) + string + repeat(placeholder, right);
  }
  else {
    var whitespace = repeat(placeholder, width);

    if (alignment == 'left') {
      return (string + whitespace).slice(0, width);
    }
    else if (alignment == 'right') {
      return (whitespace + string).slice(-width);
    }
  }

  throw new Error('Invalid alignment type: ' + alignment);
};
