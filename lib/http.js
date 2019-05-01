const qs = require('querystring');
const axios = require('axios');
const strformat = require('strformat');
const camelcase = require('camelcase');
const camelcaseKeys = require('camelcase-keys');

const debug = require('debug')(`${require('../package.json').name}:http`);

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

  /**
   * Get OAuth access_token by authorization code
   *
   * @param {String} code
   * @returns Promise<object>
   * @memberof HttpClient
   */
  async getOAuthToken(code) {
    const payload = {
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };
    const res = await this._api.post('/oauth/token', payload);
    const { data, error } = res.data;
    if (error) {
      const err = new Error(error.description);
      err.code = error.code;
      err.status = error.status;
      throw err;
    }

    return data;
  }

  /**
   * Transfer from dapp to mixin messenger user
   *
   * @param {Object} { assetId, recipientId, traceId, amount, memo = '' }
   * @returns Promise<object>
   * @memberof HttpClient
   */
  async transferFromBot({ assetId, recipientId, traceId, amount, memo = '' }) {
    return this.createTransfer({
      assetId,
      recipientId,
      traceId: traceId || this.getUUID(),
      amount,
      memo,
    });
  }

  /**
   * Send request to mixin API
   *
   * When authToken is provided, we are requesting on behalf of the user
   * If not, we are requesting on behalf of the dapp
   *
   * @param {*} method
   * @param {*} endpoint
   * @param {*} payload
   * @param {string} [authToken='']
   * @returns
   * @memberof HttpClient
   */
  async _doRequest(method, endpoint, payload, authToken = '') {
    const methodUpper = method.toUpperCase();
    const methodLower = method.toLowerCase();
    const token = authToken || this.getJwtToken(methodUpper, endpoint, payload);
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
      const endpoint = endpoints[key];
      if (!['get', 'post'].includes(endpoint.method) || endpoint.deprecated) {
        console.warn('Ignore invalid MixinClient endpoint declaration', endpoint);
        return;
      }

      debug('Generate method for: ', key);

      /**
       * An Generated shortcut methods to get data from mixin network
       *
       * @param {Undefined|String|Number|Object} queryParam
       * @param {Undefined|Object} postPayload
       * @param {String} authToken
       * @returns Promise
       */
      this[key] = async (queryParam, postPayload, authToken = '') => {
        let { url, param, payload, method } = endpoint;

        // Compose query param
        if (param) {
          const error = typeof param.validate === 'function' ? param.validate(queryParam, this) : false;
          if (typeof error !== 'boolean') {
            throw error;
          }
          if (typeof queryParam === 'object') {
            url = `${url}?${qs.stringify(queryParam)}`;
          } else if (typeof queryParam !== 'undefined') {
            url = strformat(endpoint.url, { [param.name]: queryParam.toString() });
          }
          debug('QueryParam', { spec: url, value: queryParam });
        } else {
          authToken = postPayload;
          postPayload = queryParam;
        }

        // Compose post payload
        let _payload = '';
        if (payload) {
          const error = typeof payload.validate === 'function' ? payload.validate(postPayload, this) : false;
          if (error && typeof error !== 'boolean') {
            throw error;
          }

          _payload = typeof payload.format === 'function' ? payload.format(postPayload, this) : postPayload;
          debug('PostPayload', { spec: payload, value: _payload });
        }

        // Error handling
        const { error, data } = await this._doRequest(method.toUpperCase(), url, _payload, authToken);
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
