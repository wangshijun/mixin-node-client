const test = require('ava');
const config = require('../examples/config');
const { HttpClient, createMessage } = require('../lib');

const client = new HttpClient(config);
const recipientId = 'ca630936-5af6-427e-ac4a-864a4c64f372'; // UserId
const senderId = '7701e7bf-2a86-4655-982e-023564fa8945'; // UserID

test('should create/verify message', t => {
  const conversationId = client.getConversationId(senderId, recipientId);
  const message = createMessage(
    'text',
    {
      conversationId,
      text: 'hello world',
    },
    client.getUUID
  );

  t.true(message.action === 'CREATE_MESSAGE');
  t.true(client.validateUUID(message.id));
  t.true(client.validateUUID(message.params.message_id));
  t.true(message.params.conversation_id === conversationId);
  t.true(message.params.data === Buffer.from('hello world').toString('base64'));
});
