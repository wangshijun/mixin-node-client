const test = require('ava');
const config = require('../examples/config');
const { HttpClient } = require('../lib');

const client = new HttpClient(config);
const recipientId = 'ca630936-5af6-427e-ac4a-864a4c64f372'; // UserId
const senderId = '7701e7bf-2a86-4655-982e-023564fa8945'; // UserID
const assetId = '965e5c6e-434c-3fa9-b780-c50f43cd955c'; // CNB

test('should returns itself', t => {
  const endpoints = client.getEndpoints();
  const senders = client.getMessageSenders();
  t.true(client instanceof HttpClient);
  t.true(Array.isArray(endpoints) && endpoints.length > 0);
  t.true(Array.isArray(senders) && senders.length > 0);
});

test('should generate and validate uuid', t => {
  t.true(client.validateUUID(client.getUUID()));
});

test('should get bot asset list', async t => {
  const assets = await client.getUserAssets();
  t.true(Array.isArray(assets));
  t.true(assets.length > 0);
});

test('should can bot get asset item', async t => {
  const asset = await client.getUserAsset(assetId);
  t.true(Boolean(asset));
  t.true(asset.asset_id === assetId);
});

test('should get network asset list', async t => {
  const topAssets = await client.getNetworkAssets();
  t.true(Array.isArray(topAssets));
  t.true(topAssets.length > 10);
});

test('should get network asset item', async t => {
  const topAsset = await client.getNetworkAsset(assetId);
  t.true(Boolean(topAsset));
  t.true(topAsset.asset_id === assetId);
});

test('should get snapshot list/detail', async t => {
  const snapshots = await client.getSnapshots({ limit: 10, asset: assetId, offset: new Date().toString() });
  const snapshot = await client.getSnapshot(snapshots[0].snapshot_id);
  t.true(Array.isArray(snapshots));
  t.true(snapshots.length === 10);
  t.true(Boolean(snapshot));
});

test('should get profile/user/friends/contacts', async t => {
  const [profile, user, users, friends, contacts] = await Promise.all([
    client.getProfile(),
    client.getUser(senderId),
    client.getUsers([recipientId, senderId]),
    client.getFriends(),
    client.getContacts(),
  ]);

  t.true(Boolean(profile));
  t.true(Boolean(user));
  t.true(Array.isArray(users) && users.length > 0);
  t.true(Array.isArray(friends));
  t.true(Array.isArray(contacts));
});

test('should get conversation id', t => {
  t.true(client.getConversationId(senderId, recipientId) === client.getConversationId(recipientId, senderId));
  t.true(client.validateUUID(client.getConversationId(senderId, recipientId)));
});

test('should create/read/verify transfer', async t => {
  const traceId = client.getUUID();
  const createTransfer = await client.createTransfer({
    assetId,
    recipientId: senderId,
    traceId,
    amount: 1,
    memo: 'Test',
  });
  const readTransfer = await client.getTransfer(traceId);
  const verifyPayment = await client.verifyPayment({
    assetId,
    recipientId: senderId,
    traceId,
    amount: 1,
  });

  console.log({ createTransfer, readTransfer, verifyPayment });
  t.true(Boolean(createTransfer));
  t.true(Boolean(readTransfer));
  t.true(Boolean(verifyPayment));
});
