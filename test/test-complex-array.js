'use strict';

var jsonValidator = require('./../index.js');

describe('validate complex array json', function () {
  it('should pass the complex json', function () {
    var json = [
      {
        username: 'johnny',
        password: '1234'
      },
      {
        username: 'ted',
        password: '4321'
      }
    ];
    var schema = {
      type: 'array',
      content: {
        type: 'object',
        content: {
          username: {
            type: 'string'
          },
          password: {
            type: 'string'
          }
        }
      }
    };

    jsonValidator(json, schema);
  });

  it('should not pass and throw an exception range', function () {
    var json = [
      {
        username: 'j',
        password: '1234'
      },
      {
        username: 'ted',
        password: '4321'
      }
    ];
    var schema = {
      type: 'array',
      content: {
        type: 'object',
        content: {
          username: {
            type: 'string',
            min: 2,
            max: 8
          },
          password: {
            type: 'string'
          }
        }
      }
    };

    try{
      jsonValidator(json, schema);
    } catch(err) {
      if (err.message !== 'username is not in the defined range') {
        throw err;
      }
    }
  });
});
