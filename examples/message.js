const path = require('path');
const { HttpClient } = require('../');
const config = require('./config');
const client = new HttpClient(config);

const senderId = '7701e7bf-2a86-4655-982e-023564fa8945'; // UserID

console.log('Supported MessageSenders by HttpClient', client.getMessageSenders());

(async () => {
  try {
    // conversation & message
    const conversation = await client.createConversation({
      category: 'CONTACT',
      participants: [senderId],
    });
    const text = await client.sendText({
      conversationId: conversation.conversation_id,
      data: 'Hello from node.js new client sdk',
    });
    const button = await client.sendButton({
      conversationId: conversation.conversation_id,
      data: { label: 'Open Baidu', color: '#FF0000', action: 'https://www.baidu.com' },
    });
    const contact = await client.sendContact({
      conversationId: conversation.conversation_id,
      data: senderId,
    });
    const app = await client.sendApp({
      conversationId: conversation.conversation_id,
      data: {
        icon_url:
          'https://images.mixin.one/PQ2dYjNNXYYCCcSi_jDxrh0PJM8XBaiwu4I5_5e7tJhpQNbCVULnc5VRzR4AHF2e7AK6mVpvaHxO0EZr24cUjbg=s256',
        title: '福来红包DEV',
        description: '方便好用的红包发送工具',
        action: 'https://www.baidu.com',
      },
    });
    const image = await client.sendImage({
      conversationId: conversation.conversation_id,
      data: path.join(__dirname, './demo.jpg'),
    });
    console.log({ conversation, text, button, contact, app, image });
  } catch (err) {
    console.error(err);
  }
})();
