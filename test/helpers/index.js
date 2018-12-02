const { HttpClient } = require('../..');
const config = require('../../examples/config');

function beforeEach(t) {
  const client = new HttpClient(config);
  Object.assign(t.context, { client });
}

function afterEach() {}

module.exports = { beforeEach, afterEach };
