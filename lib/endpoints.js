module.exports = {
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

  // transfer
  createTransfer: {},
  getTransfer: {},

  // payments
  verifyPayment: {},
};
