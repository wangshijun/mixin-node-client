# mixin-node-sdk

[![build status](https://img.shields.io/travis/wangshijun/mixin-node-sdk.svg)](https://travis-ci.org/wangshijun/mixin-node-sdk)
[![code coverage](https://img.shields.io/codecov/c/github/wangshijun/mixin-node-sdk.svg)](https://codecov.io/gh/wangshijun/mixin-node-sdk)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/wangshijun/mixin-node-sdk.svg)](LICENSE)

> Node.js SDK for Mixin Network, heavily inspired by [mixin-node](https://www.npmjs.com/package/mixin-node)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Contributors](#contributors)
- [License](#license)

## Install

[npm][]:

```sh
npm install mixin-node-sdk
```

[yarn][]:

```sh
yarn add mixin-node-sdk
```

## Usage

### HttpClient

> Provide neat API for Mixin Network and Messenger, such as pin/user/asset/snapshot

```javascript
const path = require('path');
const { HttpClient } = require('mixin-node-sdk');

const client = new HttpClient({
  clientId: '1946399e-4303-4c44-bbe8-6fb39f82bdf9',
  clientSecret: '8bb1734940a4a95d7edd0393c18d848f298b3d3099a274876da57877736b067e',
  aesKey: 'hB/M96xzZRcda2iYklIBKE9pqwxQxl+nHsChqcWpl2M=',
  assetPin: '123456',
  sessionId: '28b8dc2a-5df6-4ead-8c7e-5af61fe7f27d',
  privateKey: path.join(__dirname, './private.key'),
});

const recipientId = 'ca630936-5af6-427e-ac4a-864a4c64f372'; // rao
const senderId = '7701e7bf-2a86-4655-982e-023564fa8945'; // wang
const assetId = '965e5c6e-434c-3fa9-b780-c50f43cd955c'; // CNB

(async () => {
  // Asset related
  const asset = await client.getAsset(assetId);
  const assets = await client.getAssets();
  console.log({ assets, asset });

  // PIN related
  const verifyPin = await client.verifyPin(config.assetPin);
  const updatePin = await client.updatePin({ oldPin: config.assetPin, newPin: '123456' }); // CAUTION
  console.log({ verifyPin });

  const profile = await client.getProfile();
  const user = await client.getUser(senderId);
  const users = await client.getUsers([recipientId, senderId]);
  const friends = await client.getFriends();
  const contacts = await client.getContacts();
  console.log({ profile, friends, user, users, friends, contacts });
})();
```

### SocketClient

> Provide basic wrapper for Mixin Messenger WebSocket Messages

```javascript
const path = require('path');
const { SocketClient } = require('mixin-node-sdk');

const client = new SocketClient({
  clientId: '1946399e-4303-4c44-bbe8-6fb39f82bdf9',
  clientSecret: '8bb1734940a4a95d7edd0393c18d848f298b3d3099a274876da57877736b067e',
  aesKey: 'hB/M96xzZRcda2iYklIBKE9pqwxQxl+nHsChqcWpl2M=',
  assetPin: '123456',
  sessionId: '28b8dc2a-5df6-4ead-8c7e-5af61fe7f27d',
  privateKey: path.join(__dirname, './private.key'),
});

// Listen to message, note the `getMessageHandler` call
socket.on(
  'message',
  socket.getMessageHandler(message => {
    console.log('Message Received', message);
    if (message.data && message.data.category === 'PLAIN_TEXT' && message.data.data.toLowerCase() === 'hi') {
      // We support `sendText`, `sendButton`, `sendImage` here
      return socket.sendText('Hi there!', message);
    }

    return Promise.resolve(message);
  })
);
```

## Contributors

| Name           |
| -------------- |
| **wangshijun** |

## License

[MIT](LICENSE) © wangshijun

##

[npm]: https://www.npmjs.com/
[yarn]: https://yarnpkg.com/
