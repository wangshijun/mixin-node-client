const qs = require('querystring');
const axios = require('axios');
const strformat = require('strformat');
const camelcase = require('camelcase');
const camelcaseKeys = require('camelcase-keys');

const debug = require('debug')('MixinClient:Http');

const { types, createMessage } = require('./message');
const endpoints = require('./endpoints');
const BaseClient = require('./base');

class HttpClient extends BaseClient {
  constructor(args) {
    super(args);

    this._api = axios.create({
      baseURL: 'https://api.mixin.one',
      timeout: 60000,
    });

    this._initEndpoints();
    this._initMessageSenders();
  }

  async getAccessToken(code) {
    const payload = {
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };
    const res = await this._api.post('/oauth/token', payload);
    return res.data;
  }

  async transferFromBot({ assetId, recipientId, amount, memo = '' }) {
    return this.createTransfer({ assetId, recipientId, traceId: this.getUUID(), amount, memo });
  }

  async _doRequest(method, endpoint, payload) {
    const methodUpper = method.toUpperCase();
    const methodLower = method.toLowerCase();
    const token = this.getJwtToken(methodUpper, endpoint, payload);
    const res = await this._api({
      method: methodLower,
      url: endpoint,
      data: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    debug('_doRequest', { method, endpoint, payload, response: res.data });
    return res.data;
  }

  _initEndpoints() {
    this.endpoints = [];

    Object.keys(endpoints).forEach(key => {
      const api = endpoints[key];
      if (!['get', 'post'].includes(api.method) || api.deprecated) {
        console.warn('Ignore invalid MixinClient endpoint declaration', api);
        return;
      }

      debug('Generate method for: ', key);
      this[key] = async (param, payload) => {
        let { url } = api;

        if (api.param) {
          const error = typeof api.param.validate === 'function' ? api.param.validate(param, this) : false;
          if (typeof error !== 'boolean') {
            throw error;
          }
          if (typeof param === 'object') {
            url = `${url}?${qs.stringify(param)}`;
          } else if (typeof param !== 'undefined') {
            url = strformat(api.url, { [api.param.name]: param.toString() });
          }
          debug('QueryParam', { spec: url, value: param });
        } else {
          payload = param;
        }

        let _payload = '';
        if (api.payload) {
          const error = typeof api.payload.validate === 'function' ? api.payload.validate(payload, this) : false;
          if (typeof error !== 'boolean') {
            throw error;
          }

          _payload = typeof api.payload.format === 'function' ? api.payload.format(payload, this) : payload;
          debug('PostPayload', { spec: api.payload, value: _payload });
        }

        const { error, data } = await this._doRequest(api.method.toUpperCase(), url, _payload);
        if (error) {
          const err = new Error(error.description);
          err.code = error.code;
          err.status = error.status;
          throw err;
        }

        return data;
      };

      this.endpoints.push(key);
    });
  }

  _initMessageSenders() {
    this.messageSenders = [];
    if (typeof this.sendMessage !== 'function') {
      return;
    }

    Object.keys(types).forEach(x => {
      const key = camelcase(['send', x]);
      this[key] = async ({ recipientId, conversationId, data }) => {
        const message = createMessage(x, { conversationId, recipientId, [x]: data }, this.getUUID);
        return this.sendMessage(camelcaseKeys(message.params));
      };

      debug(`Generate message sender fn: ${key}`);
      this.messageSenders.push(key);
    });
  }
}

module.exports = HttpClient;
