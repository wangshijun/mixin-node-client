module.exports = {
  // mixin network related api: https://developers.mixin.one/api/alpha-mixin-network/beginning/
  // assets
  getAssets: {
    method: 'get',
    url: '/assets',
  },
  getAsset: {
    method: 'get',
    url: '/assets/{assetId}',
    param: {
      name: 'assetId',
      type: String,
      description: 'Asset ID is required',
      validate: (assetId, client) => (client.validateUUID(assetId) ? true : new Error('assetId not valid')),
    },
  },

  // addresses
  getAddressByAsset: {
    method: 'get',
    url: '/assets/{assetId}/addresses',
    param: {
      name: 'assetId',
      type: String,
      description: 'Asset ID is required',
      validate: (assetId, client) => (client.validateUUID(assetId) ? true : new Error('assetId not valid')),
    },
  },
  createAssetAddress: {
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
  deleteAssetAddress: {
    method: 'post',
    url: '/addresses/{addressId}/delete',
    param: {
      name: 'addressId',
      type: String,
      description: 'addressId',
      validate: (addressId, client) => (client.validateUUID(addressId) ? true : new Error('addressId not valid')),
    },
    payload: {
      format: (args, client) => ({
        pin: client.getEncryptedPin(client.assetPin),
      }),
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

  // transfer
  createTransfer: {},
  getTransfer: {},

  // payments
  verifyPayment: {},

  // mixin messenger related api: https://developers.mixin.one/api/beta-mixin-message/beginning/
  getProfile: {
    method: 'get',
    url: '/me',
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
    url: '/search/{id}',
    deprecated: true,
    param: {
      name: 'id',
      type: String,
      description: 'user_id or phone_number',
    },
  },

  // friends and contacts
  getFriends: {
    method: 'get',
    url: '/friends',
  },

  // conversations
  createConversation: {},
  readConversation: {},

  // messages
  sendMessage: {},
};
