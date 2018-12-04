const { SocketClient } = require('../');
const config = require('./config');
const client = new SocketClient(config);

console.log('Supported MessageSenders by SocketClient', client.getMessageSenders());

// Listen and react to socket messages
client.on(
  'message',
  client.getMessageHandler(message => {
    console.log('Message Received', message);
    if (message.data && message.data.category === 'PLAIN_TEXT' && message.data.data.toLowerCase() === 'hi') {
      return client.sendText('Hi there!', message);
    }

    return Promise.resolve(message);
  })
);

client.on('error', err => console.error(err.message));
