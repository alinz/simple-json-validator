'use strict';

var jsonValidator = require('./../index.js');

describe('Test cases for simple array validation', function () {
  it('should pass the array validation', function () {
    var json = [];
    var schema = {
      type: Array
    };

    jsonValidator(json, schema);
  });

  it('should pass the array validation', function () {
    var json = [1, 2, 3];
    var schema = {
      type: Array,
      min: 0,
      max: 3,
      content: {
        type: Number
      }
    };

    jsonValidator(json, schema);
  });

  it('should throw an exception because of array size limtation', function () {
    var json = [1, 2, 3, 4];
    var schema = {
      type: Array,
      min: 0,
      max: 3,
      content: {
        type: Number
      }
    };

    try {
      jsonValidator(json, schema);
    } catch(err) {
      if (err.message !== 'value is not in the range') {
        throw err;
      }
    }
  });





});