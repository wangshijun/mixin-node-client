const { types } = require('./message');

const messageTypes = Object.keys(types).map(x => types[x].category);
const validateAssetId = (assetId, client) => (client.validateUUID(assetId) ? true : new Error('assetId not valid'));
const validateAddressId = (addressId, client) =>
  client.validateUUID(addressId) ? true : new Error('addressId not valid');

module.exports = {
  // mixin network related api: https://developers.mixin.one/api/alpha-mixin-network/beginning/
  // assets
  getUserAssets: {
    method: 'get',
    url: '/assets',
  },
  getUserAsset: {
    method: 'get',
    url: '/assets/{assetId}',
    param: {
      name: 'assetId',
      type: String,
      validate: validateAssetId,
    },
  },
  getNetworkAssets: {
    method: 'get',
    url: '/network/assets/top',
  },
  getNetworkAsset: {
    method: 'get',
    url: '/network/assets/{assetId}',
    param: {
      name: 'assetId',
      type: String,
      validate: validateAssetId,
    },
  },

  // addresses
  getWithdrawAddress: {
    method: 'get',
    url: '/assets/{assetId}/addresses',
    param: {
      name: 'assetId',
      type: String,
      validate: validateAssetId,
    },
  },
  createWithdrawAddress: {
    method: 'post',
    url: '/addresses',
    payload: {
      format: (args, client) => {
        const payload = {
          asset_id: args.assetId,
          public_key: args.publicKey,
          account_name: args.accountName,
          account_tag: args.accountTag,
          label: args.label,
          pin: client.getEncryptedPin(client.assetPin),
        };

        return Object.keys(payload)
          .filter(x => payload[x] !== undefined)
          .reduce((obj, x) => {
            obj[x] = payload[x];
            return obj;
          }, {});
      },
      validate: (args, client) => {
        if (!client.validateUUID(args.assetId)) {
          return new Error('assetId must be a valid UUID');
        }
        if (!args.publicKey) {
          return new Error('publicKey must not be empty');
        }

        return true;
      },
    },
  },
  deleteWithdrawAddress: {
    method: 'post',
    url: '/addresses/{addressId}/delete',
    param: {
      name: 'addressId',
      type: String,
      description: 'addressId',
      validate: validateAddressId,
    },
    payload: {
      format: (args, client) => ({
        pin: client.getEncryptedPin(client.assetPin),
      }),
    },
  },

  // deposit & withdraw
  withdraw: {
    method: 'post',
    url: '/withdrawals',
    payload: {
      format: (args, client) => ({
        address_id: args.addressId,
        amount: args.amount.toString(),
        pin: client.getEncryptedPin(client.assetPin),
        trace_id: args.traceId || client.getUUID(),
        memo: args.memo || '',
      }),
      validate: (args, client) => {
        if (!client.validateUUID(args.addressId)) {
          throw new Error('args.addressId is required');
        }
        if (Number(args.amount) < 0) {
          throw new Error('args.amount must be greater thant 0');
        }
        if (args.traceId && !client.validateUUID(args.traceId)) {
          throw new Error('args.traceId must be valid UUID');
        }

        return true;
      },
    },
  },
  deposit: {
    method: 'get',
    url: '/assets/{assetId}',
    param: {
      name: 'assetId',
      type: String,
      validate: validateAssetId,
    },
  },

  // snapshots
  getSnapshots: {
    method: 'get',
    url: '/network/snapshots',
    param: {
      validate: (args, client) => {
        const limit = Number(args.limit);
        if (limit <= 0 || limit > 500) {
          throw new Error('args.limit must between 0 ~ 500');
        }
        if (!args.offset) {
          throw new Error('args.offset is required');
        }
        if (args.asset && !client.validateUUID(args.asset)) {
          throw new Error('args.assetId is invalid');
        }
        if (args.order && !['ASC', 'DESC'].includes(args.order)) {
          throw new Error('args.assetId is invalid');
        }

        return true;
      },
    },
  },
  getSnapshot: {
    method: 'get',
    url: '/network/snapshots/{snapshotId}',
    param: {
      name: 'snapshotId',
      type: String,
      validate: (snapshotId, client) => (client.validateUUID(snapshotId) ? true : new Error('snapshotId not valid')),
    },
  },

  // pin code
  verifyPin: {
    method: 'post',
    url: '/pin/verify',
    payload: {
      format: (pin, client) => ({ pin: client.getEncryptedPin(pin) }),
      validate: pin => {
        if (!/\d{6}/.test(pin)) {
          return new Error('pin must be 6 digit number');
        }

        return true;
      },
    },
  },
  updatePin: {
    method: 'post',
    url: '/pin/update',
    payload: {
      format: (args, client) => ({
        old_pin: args.oldPin ? client.getEncryptedPin(args.oldPin) : '',
        pin: client.getEncryptedPin(args.newPin),
      }),
      validate: args => {
        if (!/\d{6}/.test(args.newPin)) {
          return new Error('newPin must be 6 digit number');
        }
        if (args.oldPin && args.oldPin === args.newPin) {
          return new Error('newPin must be different with oldPin');
        }
        if (args.oldPin && !/\d{6}/.test(args.oldPin)) {
          return new Error('oldPin must be 6 digit number');
        }

        return true;
      },
    },
  },

  // payment and transfer
  createTransfer: {
    method: 'post',
    url: '/transfers',
    payload: {
      format: (args, client) => {
        const payload = {
          asset_id: args.assetId,
          opponent_id: args.recipientId,
          trace_id: args.traceId,
          amount: args.amount,
          memo: args.memo || '',
          pin: client.getEncryptedPin(client.assetPin),
        };

        return Object.keys(payload)
          .filter(x => payload[x] !== undefined)
          .reduce((obj, x) => {
            obj[x] = payload[x];
            return obj;
          }, {});
      },
      validate: (args, client) => {
        if (!client.validateUUID(args.assetId)) {
          return new Error('assetId must be a valid UUID');
        }
        if (!client.validateUUID(args.recipientId)) {
          return new Error('recipientId must be a valid UUID');
        }
        if (!client.validateUUID(args.traceId)) {
          return new Error('traceId must be a valid UUID');
        }
        if (Number(args.amount) <= 0) {
          return new Error('amount must be a number string');
        }

        return true;
      },
    },
  },
  getTransfer: {
    method: 'get',
    url: '/transfers/trace/{traceId}',
    param: {
      name: 'traceId',
      type: String,
      validate: (traceId, client) => (client.validateUUID(traceId) ? true : new Error('traceId not valid')),
    },
  },
  verifyPayment: {
    method: 'post',
    url: '/payments',
    payload: {
      format: args => {
        const payload = {
          asset_id: args.assetId,
          opponent_id: args.recipientId,
          trace_id: args.traceId,
          amount: args.amount,
        };

        return Object.keys(payload)
          .filter(x => payload[x] !== undefined)
          .reduce((obj, x) => {
            obj[x] = payload[x];
            return obj;
          }, {});
      },
      validate: (args, client) => {
        if (!client.validateUUID(args.assetId)) {
          return new Error('assetId must be a valid UUID');
        }
        if (!client.validateUUID(args.recipientId)) {
          return new Error('recipientId must be a valid UUID');
        }
        if (!client.validateUUID(args.traceId)) {
          return new Error('traceId must be a valid UUID');
        }
        if (Number(args.amount) <= 0) {
          return new Error('amount must be a number string');
        }

        return true;
      },
    },
  },

  // mixin messenger related api: https://developers.mixin.one/api/beta-mixin-message/beginning/
  getProfile: {
    method: 'get',
    url: '/me',
  },
  updatePreference: {
    method: 'post',
    url: '/me/preferences',
    payload: {
      format: args => ({
        receive_message_source: args.receiveMessageSource,
        accept_conversation_source: args.acceptConversationSource,
      }),
      validate: args => {
        const types = ['EVERYBODY', 'CONTACTS'];
        if (!types.includes(args.receiveMessageSource)) {
          return new Error('receiveMessageSource must be valid');
        }
        if (!types.includes(args.acceptConversationSource)) {
          return new Error('acceptConversationSource must be valid');
        }

        return true;
      },
    },
  },
  updateProfile: {
    method: 'post',
    url: '/me',
    payload: {
      format: args => ({
        full_name: args.fullName,
        avatar_base64: args.avatar,
      }),
      validate: args => {
        if (!args.fullName) {
          return new Error('fullName must not be empty');
        }

        return true;
      },
    },
  },
  getUser: {
    method: 'get',
    url: '/users/{userId}',
    param: {
      name: 'userId',
      type: String,
      description: 'userId must not be empty',
      validate: (userId, client) => (client.validateUUID(userId) ? true : new Error('userId not valid')),
    },
  },
  getUsers: {
    method: 'post',
    url: '/users/fetch',
    payload: {
      validate: (ids, client) => {
        if (!Array.isArray(ids)) {
          return new Error('userId list must not be empty');
        }
        if (!ids.every(id => client.validateUUID(id))) {
          return new Error('each userId must be valid');
        }

        return true;
      },
    },
  },
  searchUser: {
    method: 'post',
    url: '/search/{query}',
    deprecated: true,
    param: {
      name: 'query',
      type: String,
      description: 'user_id or phone_number',
    },
  },
  // TODO: support create user

  // friends and contacts
  getFriends: {
    method: 'get',
    url: '/friends',
  },
  getContacts: {
    method: 'get',
    url: '/contacts',
  },

  // conversations
  createConversation: {
    method: 'post',
    url: '/conversations',
    payload: {
      format: (args, client) => {
        const participants = args.participants.map(x => {
          if (typeof x === 'string') {
            return { user_id: x, action: 'ADD', role: '' };
          }

          // TODO: validate each participant?
          return x;
        });

        const conversationId =
          args.category === 'CONTACT'
            ? client.getConversationId(client.clientId, participants[0].user_id)
            : client.getUUID();

        return {
          category: args.category,
          conversation_id: args.conversationId || conversationId, // create | update conversation
          participants,
        };
      },
      validate: args => {
        if (!['GROUP', 'CONTACT'].includes(args.category)) {
          return new Error('category must be valid');
        }
        // TODO: support group conversation member add/remove/edit
        if (!Array.isArray(args.participants) || args.participants.length === 0) {
          return new Error('participants must be a valid array');
        }

        return true;
      },
    },
  },
  readConversation: {
    method: 'get',
    url: '/conversations/{conversationId}',
    param: {
      name: 'conversationId',
      type: String,
      validate: (conversationId, client) =>
        client.validateUUID(conversationId) ? true : new Error('conversationId not valid'),
    },
  },

  // messages
  sendMessage: {
    method: 'post',
    url: '/messages',
    payload: {
      format: (args, client) => ({
        category: args.category,
        conversation_id: args.conversationId,
        message_id: args.messageId || client.getUUID(),
        data: args.data,
      }),
      validate: (args, client) => {
        if (!messageTypes.includes(args.category)) {
          return new Error('category must be valid');
        }
        if (!args.data) {
          return new Error('message must not be empty');
        }
        if (!client.validateUUID(args.conversationId)) {
          return new Error('conversationId must not be empty');
        }

        return true;
      },
    },
  },
};
