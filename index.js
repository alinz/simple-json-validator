'use strict';

var _ = require('lodash');

/*
 // [{},{}]
 // type: Array, Object, Number, String, Boolean, null

 var arraySample = {
 type: Array,

 //default value is any length
 min: 0,
 max: 100,


 content: {
 type: Number,
 min: 0,
 max: 100,
 float: true, false
 convertByForce: true, // parseInt(value, 10), parseFloat(value, 10)
 canBeNull: true,
 isRequired: true
 },



 content: {
 type: String,
 min: 2,
 max: 20,
 pattern: '',
 convertByForce: true,
 canBeNull: true,
 isRequired: true
 }

 content: {
 type: Boolean,
 convertByForce: true,  //!! -> Boolean null -> false, 0 -> false, 1 -> true, "" -> true
 isRequired: true
 }

 content: {
 type: Object,
 content: {
 username: {
 type: String,
 min: 2,
 max: 20,
 pattern: 'regular expression pattern',
 convertByForce: true,
 canBeNull: true,
 isRequired: true
 }
 }
 }
 };

 var objectSample = {
 type: Object,
 content: {

 }
 };
 */

function valid(value, type) {
  return type === typeof value;
}

function updateSchema(schema) {
  if (!valid(schema.min, 'number')) {
    if (schema.type === Array || schema.type === String) {
      schema.min = 0;
    } else {
      schema.min = Number.MIN_VALUE;
    }
  }

  if (!valid(schema.max, 'number')) {
    schema.max = Number.MAX_VALUE;
  }

  if (!valid(schema.float, 'boolean')) {
    schema.float = false;
  }

  if (!valid(schema.convertByForce, 'boolean')) {
    schema.convertByForce = false;
  }

  if (!valid(schema.canBeNull, 'boolean')) {
    schema.canBeNull = false;
  }

  if (!valid(schema.isRequired, 'boolean')) {
    schema.isRequired = false;
  }

  if (!valid(schema.pattern, 'object')) {
    schema.pattern = false;
  }

  return schema;
}

function number(value, schema, label) {
  label = label || 'value';
  schema = updateSchema(schema);
  /*
   type: Number,

   canBeNull: true,
   float: true, false
   convertByForce: true, // parseInt(value, 10), parseFloat(value, 10)

   isRequired: true
   min: 0,
   max: 100,
   */

  if (schema.canBeNull && value === null) {
    value = 0;
  }

  if (schema.convertByForce) {
    value = schema.float? parseFloat(value) : parseInt(value, 10);

    if (isNaN(value)) {
      throw new Error(label + ' is not a number type');
    }
  }

  if (!valid(value, 'number')) {
    throw new Error(label + ' is not a number');
  }

  if (schema.isRequired) {
    if (!valid(value, 'number')) {
      throw new Error(label + ' is required');
    }
  }

  if (!(value >= schema.min && value <= schema.max)) {
    throw new Error(label + ' is not in the range');
  }

  return value;
}

function string(value, schema, label) {
  label = label || 'value';
  schema = updateSchema(schema);
  /*
   type: String,
   min: 2,
   max: 20,
   pattern: 'regular expression pattern',
   convertByForce: true,
   canBeNull: true,
   isRequired: true
   */

  if (schema.isRequired && !valid(value, 'string')) {
    throw new Error(label + ' is not a string type');
  }

  if (schema.canBeNull && value === null) {
    value = '';
  }

  if (schema.convertByForce) {
    if (valid(value, 'undefined')) {
      value = '';
    } else {
      value = value + '';
    }
  }

  if (!(value.length >= schema.min && value.length <= schema.max)) {
    throw new Error(label + ' is not in the range');
  }

  if (schema.pattern) {
    if (!schema.pattern.test(value)) {
      throw new Error('pattern is not a match for ' + label);
    }
  }

  return value;
}

function boolean(value, schema, label){
  label = label || 'value';
  schema = updateSchema(schema);

  /*
   type: Boolean,
   convertByForce: true,  //!! -> Boolean null -> false, 0 -> false, 1 -> true, "" -> true
   isRequired: true
   */

  if (schema.convertByForce && !valid(value, 'undefined')) {
    value = !!value;
  }

  if (schema.isRequired && valid(value, 'undefined')) {
    throw new Error(label + ' is required');
  }

  return value;
}

function select(value, schema, label) {
  if (_.isNumber(value)) {
    return number(value, schema, label);
  } else if (_.isString(value)) {
    return string(value, schema, label);
  } else if (_.isBoolean(value)) {
    return boolean(value, schema, label);
  } else if (_.isArray(value)) {
    return array(value, schema, label);
  } else if (_.isPlainObject(value)) {
    return object(value, schema, label);
  } else {
    throw new Error('type unknown');
  }
}

function array(value, schema, label) {
  label = label || 'value';
  schema = updateSchema(schema);

  /*
   isRequired
   canBeNull
   min
   max
   */

  if (schema.isRequired && !Array.isArray(value)) {
    throw new Error(label + ' is required to be an array type');
  }

  if (schema.canBeNull && value === null) {
    value = [];
  }

  if (!(value.length >= schema.min && value.length <= schema.max)) {
    throw new Error(label + ' is not in the range');
  }

  //we need to go to all the items and recursively apply schema to each item
  value = value.map(function (item) {
    return select(item, schema.content);
  });

  return value;
}

function object(value, schema, label) {
  label = label || 'value';
  schema = updateSchema(schema);

  /*
   isRequired
   canBeNull
   */

  if (schema.isRequired && !_.isPlainObject(value)) {
    throw new Error(label + ' is required to be a plain object type');
  }

  if (schema.canBeNull && value === null) {
    value = {};
  }

  var fieldSchemas = schema.content;
  _.forEach(value, function (obj, field) {
    var fieldSchema = fieldSchemas[field];
    if (valid(fieldSchema, 'undefined')) {
      throw new Error(label + 'is not recognisable');
    }

    value[field] = select(obj, fieldSchema, field);
  });

  return value;
}

module.exports = function (json, schema) {
  if (_.isArray(json)) {
    return array(json, schema);
  } else if (_.isPlainObject(json)) {
    return object(json, schema);
  } else {
    throw new Error('not a valid json');
  }
};
