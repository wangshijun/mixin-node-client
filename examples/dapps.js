const { HttpClient } = require('../');
const config = require('./config');
const client = new HttpClient(config);

// Read/write data on mixin blockchain and messenger through HTTP API
(async () => {
  try {
    const user = await client.searchUser(7000);
    console.log({ user });
  } catch (err) {
    console.error(err);
  }
})();
