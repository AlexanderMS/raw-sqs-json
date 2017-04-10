'use strict';

const
  chai = require('chai'),
  assert = chai.assert,
  sqsJson = require('../index.js');

chai.use(require('chai-as-promised'));

describe('sqs-json', function() {
  it('placeholder', function() {
    assert(sqsJson.processJsonMessages);
  });
});
