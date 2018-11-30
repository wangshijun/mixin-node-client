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
    },
  },
  getUsers: {
    method: 'post',
    url: '/users/fetch',
    param: {
      name: 'userIds',
      type: Array,
    },
  },
  searchUser: {
    method: 'post',
    url: '/users/{query}',
    param: {
      name: 'query',
      type: String,
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
      description: 'Asset ID is required',
      type: String,
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
