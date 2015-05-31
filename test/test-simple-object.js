'use strict';

var jsonValidator = require('./../index.js');

describe('validate object', function () {
  it('should pass the object validation', function () {
    var json = {};
    var schema = {
      type: 'object'
    };

    jsonValidator(json, schema);
  });

  it('should pass object of strings', function () {
    var json = {
      test1: 'test1',
      test2: 'test2'
    };

    var schema = {
      type: 'object',
      content: {
        test1: {
          type: 'string'
        },
        test2: {
          type: 'string'
        }
      }
    };

    jsonValidator(json, schema);
  });

  it('should fail to validate becuase of lenght of string', function () {
    var json = {
      test1: 'test1',
      test2: 'test2'
    };

    var schema = {
      type: 'object',
      content: {
        test1: {
          type: 'string',
          min: 2,
          max: 4
        },
        test2: {
          type: 'string'
        }
      }
    };

    try {
      jsonValidator(json, schema);
    } catch(err) {
      if (err.message !== 'test1 is not in the defined range') {
        throw err;
      }
    }
  });

  it('should fail to validate because one of the field is missing', function () {
    var json = {
      username: 'johnny'
    };

    var schema = {
      type: 'object',
      content: {
        username: {
          type: 'string',
          isRequired: true
        },
        password: {
          type: 'string',
          isRequired: true
        }
      }
    };

    try {
      jsonValidator(json, schema);
    } catch(err) {
      if (err.message !== 'password is required') {
        throw err;
      }
    }
  });
});
