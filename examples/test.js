const { HttpClient, SocketClient } = require('../lib/index');
const config = require('./config');
const client = new HttpClient(config);
const socket = new SocketClient(config);

const botId = '1946399e-4303-4c44-bbe8-6fb39f82bdf9'; // dev only
const recipientId = 'ca630936-5af6-427e-ac4a-864a4c64f372'; // rao
const senderId = '7701e7bf-2a86-4655-982e-023564fa8945'; // wang
const assetId = '965e5c6e-434c-3fa9-b780-c50f43cd955c'; //CNB
const etherId = '0x4e088890f58dba45eb215613e9f01ed362ec87fb'; // imtoken

socket.on('message', socket.getMessageHandler(message => {
  console.log('Message Received', message);
  if (message.data && message.data.category === 'PLAIN_TEXT' && message.data.data.toLowerCase() === 'hi') {
    return socket.sendText('Hi there!', message);
  }

  return Promise.resolve(message);
}));

(async () => {
  try {
    const traceId = client.getUUID();
    // const asset = await client.getAsset(assetId);
    // const assets = await client.getAssets();
    // console.log({ assets, asset });

    // const verifyPin = await client.verifyPin(config.assetPin);
    // const updatePin = await client.updatePin({ oldPin: config.assetPin, newPin: '123456' }); // CAUTION
    // console.log({ verifyPin });

    // const withdrawAddress = await client.createWithdrawAddress({
    //   assetId,
    //   label: 'Chui Niu Bi',
    //   publicKey: etherId,
    // });
    // const addressList = await client.getWithdrawAddress(assetId);
    // const deleteAddress = await client.deleteWithdrawAddress(withdrawAddress.address_id);
    // console.log({ withdrawAddress, addressList, deleteAddress });

    // const createTransfer = await client.createTransfer({
    //   assetId,
    //   recipientId: senderId,
    //   traceId,
    //   amount: '1',
    //   memo: 'Test',
    // });
    // const readTransfer = await client.getTransfer(traceId);
    // const verifyPayment = await client.verifyPayment({
    //   assetId,
    //   recipientId: senderId,
    //   traceId,
    //   amount: '1',
    // });
    // console.log({ createTransfer, readTransfer, verifyPayment });

    // const conversation = await client.createConversation({
    //   category: 'CONTACT',
    //   participants: [senderId],
    // });
    // const group = await client.createConversation({
    //   category: 'GROUP',
    //   participants: [senderId, recipientId],
    //   conversationId: traceId,
    // });
    // const message = await client.sendMessage({
    //   category: 'PLAIN_TEXT',
    //   conversationId: conversation.conversation_id,
    //   recipientId: senderId,
    //   message: 'Hello from node.js new client sdk',
    // });
    // console.log({ conversation, group, message });

    // const snapshots = await client.getSnapshots({ limit: 10, asset: assetId, offset: new Date().toString() });
    // const snapshot = await client.getSnapshot(snapshots[0].snapshot_id);
    // console.log({ snapshots, snapshot })

    // const profile = await client.getProfile();
    // const user = await client.getUser(senderId);
    // const users = await client.getUsers([recipientId, senderId]);
    // const friends = await client.getFriends();
    // const contacts = await client.getContacts();
    // console.log({ profile, friends, user, users});
    // console.log({ contacts })

  } catch (err) {
    console.error(err);
  }
})();
