const fs = require('fs');
const axios = require('axios');
const qs = require('querystring');
const strformat = require('strformat');

const debug = require('debug')('MixinClient:Http');

const endpoints = require('./endpoints');
const BaseClient = require('./base');

class HttpClient extends BaseClient {
  constructor(args) {
    super(args);

    this.axios = axios.create({
      baseURL: 'https://api.mixin.one',
      timeout: 60000,
    });

    this._initialize();
  }

  getEndpoints() {
    return this._endpoints;
  }

  async getAccessToken(code) {
    const payload = {
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };
    const res = await this.axios.post('/oauth/token', payload);
    return res.data;
  }

  async _doRequest(method, endpoint, payload) {
    const methodUpper = method.toUpperCase();
    const methodLower = method.toLowerCase();
    const token = this.getJwtToken(methodUpper, endpoint, payload);
    const res = await this.axios({
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

  _initialize() {
    const _endpoints = [];

    Object.keys(endpoints).forEach(key => {
      const api = endpoints[key];
      if (!['get', 'post'].includes(api.method) || api.deprecated) {
        console.warn('Ignore invalid MixinClient endpoint declaration', api);
        return;
      }

      debug('Generate method for: ', key);
      this[key] = async (param, payload) => {
        let url = api.url;

        if (api.param) {
          const error = typeof api.param.validate === 'function' ? api.param.validate(param, this) : false;
          if (typeof error !== 'boolean') {
            throw error;
          }
          if (typeof param === 'object') {
            url = `${url}?${qs.stringify(param)}`;
          } else if (typeof param === 'string') {
            url = strformat(api.url, { [api.param.name]: param });
          }
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
          debug(`${key}.payload`, { payload, _payload });
        }

        const { error, data } = await this._doRequest(api.method.toUpperCase(), url, _payload);
        if (error) {
          error.message = error.description;
          throw new Error(error);
        }

        return data;
      };

      _endpoints.push(key);
    });

    this._endpoints = _endpoints;
  }

  async transferFromBot({ assetId, recipientId, amount, memo = '' }) {
    return this.createTransfer({ assetId, recipientId, traceId: this.getUUID(), amount, memo });
  }
}

module.exports = HttpClient;
