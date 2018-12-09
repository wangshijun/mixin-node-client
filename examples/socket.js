const { SocketClient, isMessageType } = require('../');
const config = require('./config');
const client = new SocketClient(config);

console.log('Supported MessageSenders by SocketClient', client.getMessageSenders());

// Listen and react to socket messages
client.on(
  'message',
  client.getMessageHandler(message => {
    console.log('Message Received', message);

    if (isMessageType(message, 'text')) {
      const text = message.data.data.toLowerCase();
      if (text === 'button') {
        return client.sendButton(
          {
            label: 'Open Node.js Client SDK',
            color: '#FF0000',
            action: 'https://github.com/wangshijun/mixin-node-client',
          },
          message
        );
      }

      if (text === 'contact') {
        return client.sendContact('7701e7bf-2a86-4655-982e-023564fa8945', message);
      }

      if (text === 'app') {
        return client.sendApp(
          {
            icon_url:
              'https://images.mixin.one/PQ2dYjNNXYYCCcSi_jDxrh0PJM8XBaiwu4I5_5e7tJhpQNbCVULnc5VRzR4AHF2e7AK6mVpvaHxO0EZr24cUjbg=s256',
            title: 'Mixin Node.js SDK',
            description: 'Utilities to easy Mixin dapp development',
            action: 'https://github.com/wangshijun/mixin-node-client',
          },
          message
        );
      }

      return client.sendText('Hi there!', message);
    }

    return Promise.resolve(message);
  })
);

client.on('error', err => console.error(err.message));
