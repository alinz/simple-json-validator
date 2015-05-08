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
      type: Array,
      content: {
        type: Object,
        content: {
          username: {
            type: String
          },
          password: {
            type: String
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
      type: Array,
      content: {
        type: Object,
        content: {
          username: {
            type: String,
            min: 2,
            max: 8
          },
          password: {
            type: String
          }
        }
      }
    };

    try{
      jsonValidator(json, schema);
    } catch(err) {
      if (err.message !== 'username is not in the range') {
        throw err;
      }
    }
  });
});