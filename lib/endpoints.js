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
      validate: (id, client) => client.validateUUID(id),
    },
  },

  // addresses
  getAssetAddressList: {
    method: 'get',
    url: '/assets/{assetId}/addresses',
    param: {
      name: 'assetId',
      type: String,
      description: 'Asset ID is required',
      validate: (id, client) => client.validateUUID(id),
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
    url: '/users/{id}',
    param: {
      name: 'id',
      type: String,
      description: 'user_id',
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
