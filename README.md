# mixin-node-client

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
yarn add mixin-node-client
# OR npm install mixin-node-client -S
```

## Usage

### 1. Generate Config

Steps to use generate config for dapp:

1. Create a dapp on [developers.mixin.one](https://developers.mixin.one), get clientId and clientSecret(the result when **Click to generate a new secret**)
2. Generate config from a new session info of your dapp (the result when **Click to generate a new session**) using [mixin-cli](https://github.com/wangshijun/mixin-cli) (**a command line tool by me**).

Config file format, **remember to replace `clientId` and `clientSecret` with yours**:

```javascript
// Generated with awesome https://github.com/wangshijun/mixin-cli
module.exports = {
  clientId: '<PUT YOUR DAPP CLIENT_ID HERE>',
  clientSecret: '<PUT YOUR DAPP CLIENT_SECRET HERE>',
  assetPin: '310012',
  sessionId: '621c905b-1739-45e7-b668-b5531dd83646',
  aesKey: '56GcGs2EFHBPV2Xsb/OiwLdgjGt3q53JcFeLmbUutEk=',
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCsNaGbDx1UeKrTux01nC6R7/bu2GUELe6Q2mBSPymkZW2fpiaO
FjkTI1MkEE8Eq1kGm/+6vAP84LMXG/W49UqZTBkKkrQ=
-----END RSA PRIVATE KEY-----`,
};
```

### 2. HttpClient

`HttpClient` provides wrapper for all API supported by mixin network and mixin messenger, such as pin/user/asset/snapshot:

```javascript
const { HttpClient } = require('mixin-node-client');
const config = require('./config');

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

- **getUserAssets**, get asset list owned by user
- **getUserAsset**, get asset detail owned by user
- **getNetworkAssets**, get top asset list by mixin network
- **getNetworkAsset**, get top asset detail by mixin network
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
- **sendMessage**, send raw message to specific conversation, see next section for message sender util.

**Working example for `HttpClient` can be found [HERE](./examples/http.js)**

#### Message Sender Util

Because we can send messages to a conversation, `HttpClient` provide neat methods to send all kinds of message to Mixin Messenger:

```javascript
console.log(client.getMessageSenders());
// [ 'sendText',
//   'sendImage',
//   'sendVideo',
//   'sendData',
//   'sendSticker',
//   'sendContact',
//   'sendButton',
//   'sendButtons',
//   'sendApp' ]
const text = await client.sendText({
  conversationId: conversation.conversation_id,
  data: 'Hello from node.js new client sdk',
});
const button = await client.sendButton({
  conversationId: conversation.conversation_id,
  data: { label: 'Open Mixin', color: '#FF0000', action: 'https://mixin.one' },
});
```

For syntax of sending messages, see working example [HERE](./examples/message.js).

### 3. SocketClient

`SocketClient` provide basic wrapper for Mixin Messenger WebSocket Messages, you can use it to listen and react to socket messages.

```javascript
const { SocketClient } = require('mixin-node-client');
const config = require('./config');

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

Same set of message sender utils are also supported by `SocketClient` (**Note**: parameters are different for message sender utils of `HttpClient` and `SocketClient`, because we have the conversationId from the `onMessage` callback):

```javascript
socket.sendText('Hi there!', message);
socket.sendButton({ label: 'Open Mixin', color: '#FF0000', action: 'https://mixin.one' }, message);
```

### Debugging

If you are curious what happened during each API call, try run example code with following command:

```bash
DEBUG=MixinClient:* node examples/http.js
DEBUG=MixinClient:* node examples/socket.js
DEBUG=MixinClient:* node examples/message.js
```

The mixin dapp included in the examples folder can be found with the following qrcode:

![](./examples/qrcode.png)

## Contributors

| Name           |
| -------------- |
| **wangshijun** |

## License

[MIT](LICENSE) © wangshijun
