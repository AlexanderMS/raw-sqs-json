'use strict';

const
  chai = require('chai'),
  assert = chai.assert,
  rawSqsJson = require('../index.js');

chai.use(require('chai-as-promised'));

describe('raw-sqs-json', function() {
  it('placeholder', function() {
    assert(rawSqsJson.processJsonMessages);
  });
});
