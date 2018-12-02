const test = require('ava');

const { HttpClient } = require('..');
const { beforeEach, afterEach } = require('./helpers');

test.beforeEach(beforeEach);
test.afterEach(afterEach);

test('returns itself', t => {
  t.true(t.context.client instanceof HttpClient);
});

// TODO: add more tests
