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
    },
  },

  // pin code
  verifyPin: {
    method: 'post',
    url: '/pin/verify',
    payload: {
      name: 'pin',
      type: String,
      description: 'asset pin from user, not encrypted',
      format: (pin, client) => ({ pin: client.getEncryptedPin(pin) }),
      validate: pin => {
        if (!/\d{6}/.test(pin)) {
          return new Error('pin must be 6 digit number');
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
      name: 'userIds',
      type: Array,
      description: 'userId list to fetch',
      validate: ids => {
        if (!Array.isArray(ids)) {
          return new Error('userId list must not be empty');
        }
        if (!ids.every(id => id.length === 36)) {
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
