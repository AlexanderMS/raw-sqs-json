'use strict';

const
  chai = require('chai'),
  assert = chai.assert,
  rawSqsJson = require('../index.js');

chai.use(require('chai-as-promised'));

describe('csv-split-stream', function() {
  it('placeholder', function() {
    assert(rawSqsJson.processJsonMessages);
  });
});
