# mixin-node-sdk

[![build status](https://img.shields.io/travis/wangshijun/mixin-node-sdk.svg)](https://travis-ci.org/wangshijun/mixin-node-sdk)
[![code coverage](https://img.shields.io/codecov/c/github/wangshijun/mixin-node-sdk.svg)](https://codecov.io/gh/wangshijun/mixin-node-sdk)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/wangshijun/mixin-node-sdk.svg)](LICENSE)

> Node.js SDK for Mixin Network, heavily inspired by [mixin-node](https://www.npmjs.com/package/mixin-node), but is much more developer friendly

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Contributors](#contributors)
- [License](#license)

## Install

```sh
yarn add mixin-node-sdk
# OR npm install mixin-node-sdk -S
```

## Usage

### 1. Create DApp

To use this library, first we need to create a DApp on [developers.mixin.one](https://developers.mixin.one), then obtain the following information as config:

```javascript
const config = {
  clientId: '1946399e-4303-4c44-bbe8-6fb39f82bdf9',
  clientSecret: '8bb1734940a4a95d7edd0393c18d848f298b3d3099a274876da57877736b067e',
  aesKey: 'hB/M96xzZRcda2iYklIBKE9pqwxQxl+nHsChqcWpl2M=',
  assetPin: '123456',
  sessionId: '28b8dc2a-5df6-4ead-8c7e-5af61fe7f27d',
  privateKey: path.join(__dirname, './private.key'),
};
```

### 2. HttpClient

`HttpClient` provides wrapper for all API supported by mixin network and mixin messenger, such as pin/user/asset/snapshot:

```javascript
const path = require('path');
const { HttpClient } = require('mixin-node-sdk');

const client = new HttpClient(config);

const recipientId = 'ca630936-5af6-427e-ac4a-864a4c64f372'; // UserId
const senderId = '7701e7bf-2a86-4655-982e-023564fa8945'; // UserID
const assetId = '965e5c6e-434c-3fa9-b780-c50f43cd955c'; // CNB

(async () => {
  const assets = await client.getAssets();
  const verifyPin = await client.verifyPin(config.assetPin);
  const user = await client.getUser(senderId);
  console.log({ assets, verifyPin, user });
})();
```

Full API list supported by `HttpClient`:

- **getAssets**, get asset list owned by user
- **getAsset**, get asset detail owned by user
- **getTopAssets**, get top asset list by mixin network
- **getTopAsset**, get top asset detail by mixin network
- **getWithdrawAddress**, get withdraw address
- **createWithdrawAddress**, create withdraw address
- **deleteWithdrawAddress**, delete withdraw address
- **withdraw**, request withdraw from mixin network
- **deposit**, get deposit address for asset
- **getSnapshots**, get network snapshot list
- **getSnapshot**, get network snapshot detail
- **verifyPin**, verify asset pin
- **updatePin**, update/create asset pin
- **createTransfer**, create transfer with an asset
- **getTransfer**, read transfer detail
- **verifyPayment**, verify transfer state
- **getProfile**, get user profile
- **updatePreference**, update user preference
- **updateProfile**, update user profile
- **getUser**, get user by id
- **getUsers**, get multiple users by id
- **getFriends**, get friend list
- **getContacts**, get contact list
- **createConversation**, create new conversation
- **readConversation**, read conversation detail
- **sendMessage**, send message to specific conversation

**Working example for `HttpClient` can be found [HERE](./examples/http.js)**

### 3. SocketClient

`SocketClient` provide basic wrapper for Mixin Messenger WebSocket Messages, you can use it to listen and react to socket messages.

```javascript
const path = require('path');
const { SocketClient } = require('mixin-node-sdk');

const client = new SocketClient(config);

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

**Working example for `SocketClient` can be found [HERE](./examples/socket.js)**

### Debugging

If you are curious what happened during each API call, try run example code with following command:

```bash
DEBUG=MixinClient:* node examples/http.js
DEBUG=MixinClient:* node examples/socket.js
```

## Contributors

| Name           |
| -------------- |
| **wangshijun** |

## License

[MIT](LICENSE) © wangshijun
