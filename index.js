'use strict';

var _ = require('lodash');

function either(v1, v2) {
  return typeof v1 === 'undefined'? v2 : v1;
}

function applyDefaultValue(schema, key, defaultValue) {
  schema[key] = either(schema[key], defaultValue);
}

function setDefaultValueForSchema(schema) {
  if (schema.done) {
    return schema;
  }

  switch (schema.type) {
    case 'number':
      applyDefaultValue(schema, 'min', Number.MIN_VALUE);
      applyDefaultValue(schema, 'max', Number.MAX_VALUE);
      applyDefaultValue(schema, 'float', false);
      applyDefaultValue(schema, 'convertByForce', true);
      applyDefaultValue(schema, 'isRequired', false);

      schema.done = true;
      break;

    case 'string':
      applyDefaultValue(schema, 'min', 0);
      applyDefaultValue(schema, 'max', Number.MAX_VALUE);
      applyDefaultValue(schema, 'pattern', null);
      applyDefaultValue(schema, 'convertByForce', true);
      applyDefaultValue(schema, 'isRequired', false);

      schema.done = true;
      break;

    case 'boolean':
      applyDefaultValue(schema, 'convertByForce', true);
      applyDefaultValue(schema, 'isRequired', false);

      schema.done = true;
      break;

    case 'object':
      applyDefaultValue(schema, 'isRequired', false);

      schema.done = true;
      break;

    case 'array':
      applyDefaultValue(schema, 'min', 0);
      applyDefaultValue(schema, 'max', Number.MAX_VALUE);
      applyDefaultValue(schema, 'isRequired', false);

      schema.done = true;
      break;

    default:
      throw new Error('unknow type in schema');
  }
}

function error(label, message) {
  throw new Error(label + ' ' + message);
}

/**
 * label string
 * value number
 * schema object
 */
function validateNumber(label, value, schema) {
  setDefaultValueForSchema(schema);

  if (schema.isRequired && typeof value === "undefined") {
    error(label, 'is required');
  }

  if (schema.convertByForce) {
    if (schema.float) {
      value = parseFloat(value);
    } else {
      value = parseInt(value, 10);
    }
  }

  if (!_.isNumber(value)) {
    error(label, 'is not a number');
  }

  if (!(schema.min <= value && value <= schema.max)) {
    error(label, 'is not in the defined range');
  }

  return value;
}

/**
 * label string
 * value string
 * schema object
 */
function validateString(label, value, schema) {
  var isString,
      strLen;

  setDefaultValueForSchema(schema);

  if (schema.isRequired && typeof value === "undefined") {
    error(label, 'is required');
  }

  isString = _.isString(value)

  if (schema.convertByForce && !isString) {
    value += '';
  }

  if (isString) {
    strLen = value.length;

    if (!(schema.min <= strLen && strLen <= schema.max)) {
      error(label, 'is not in the defined range');
    }

    if (schema.pattern && !schema.pattern.test(value)) {
      error(label, 'is not match the defined pattern');
    }
  }

  return value;
}

/**
 * label string
 * value string
 * schema object
 */
function validateBoolean(label, value, schema) {
  setDefaultValueForSchema(schema);

  if (schema.isRequired && typeof value === "undefined") {
    error(label, 'is required');
  }

  if (schema.convertByForce) {
    value = !!value;
  }

  return value;
}

/**
 * label string
 * arr array
 * schema object
 */
function validateArray(label, arr, schema) {
  var isUndefined,
      arrLen;

  setDefaultValueForSchema(schema);

  isUndefined = typeof arr === 'undefined';

  if (schema.isRequired && isUndefined) {
    error(label, 'is required');
  }

  if (isUndefined) {
    return arr;
  }

  if (!_.isArray(arr)) {
    error(label, 'needs to be an array');
  }

  arrLen = arr.length;

  if (!(schema.min <= arrLen && arrLen <= schema.max)) {
    error(label, 'is not in the defined range');
  }

  arr = _.map(arr, function (item) {
    return select(label, item, schema.content);
  });

  return arr;
}

/**
 * label string
 * obj object
 * schema object
 */
function validatePlainObject(label, obj, schema) {
  var isUndefined;

  setDefaultValueForSchema(schema);

  isUndefined = typeof obj === 'undefined';

  if (schema.isRequired && isUndefined) {
    error(label, 'is required');
  }

  if (isUndefined) {
    return obj;
  }

  if (!_.isPlainObject(obj)) {
    error(label, 'is not an object');
  }

  //check if incomming data matches schema
  _.forEach(obj, function (target, field) {
    obj[field] = select(field, obj[field], schema.content[field]);
  });


  //check if schema matches incoming data
  _.forEach(schema.content, function (target, field) {
    //console.log(field, target);
    obj[field] = select(field, obj[field], target);
  });

  return obj;
}

function select(label, value, schema) {
  if (!schema) {
    error(label, 'not recognizable.');
  }

  switch (schema.type) {
    case 'number':
      return validateNumber(label, value, schema);
    case 'boolean':
      return validateBoolean(label, value, schema);
    case 'string':
      return validateString(label, value, schema);
    case 'array':
      return validateArray(label, value, schema);
    case 'object':
      return validatePlainObject(label, value, schema);
    default:
      error(label, 'schema type is invalid');
  }
}

function simpleJsonValidator(json, schema) {
  if (_.isArray(json)) {
    return validateArray('root', json, schema);
  } else if (_.isPlainObject(json)) {
    return validatePlainObject('root', json, schema);
  } else {
    throw new Error('not a valid json');
  }
};

module.exports = simpleJsonValidator;
