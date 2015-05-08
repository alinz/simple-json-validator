'use strict';

var jsonValidator = require('./../index.js');

describe('validate simple object json', function () {
  it('should pass the object validation', function () {
    var json = {};
    var schema = {
      type: Object
    };

    jsonValidator(json, schema);
  });
});