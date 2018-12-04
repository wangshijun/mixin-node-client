/**
 * Websocket client that can reconnect on failure
 *
 * Please note that this file is refactored from https://github.com/virushuo/mixin-node/blob/master/ws-reconnect.js
 * Debug feature is added
 *
 * Data Structure for Mixin WebSocket Message Object (named as `msgObj` in following context)
 *
 * {
 *   id: 'e1e850e3-2a5a-4510-a18d-20a6267a9d87',
 *   action: 'CREATE_MESSAGE',
 *   data: {
 *     type: 'message',
 *     representative_id: '',
 *     quote_message_id: '',
 *     conversation_id: '1514dd62-0127-398c-b95a-012d841de265',
 *     user_id: '7701e7bf-2a86-4655-982e-023564fa8945',
 *     message_id: '93c7dcbb-c72c-499f-bb2e-64450dcad852',
 *     category: 'PLAIN_TEXT',
 *     data: 'emhlIHNoaSBnZSBzaGE=',
 *     status: 'SENT',
 *     source: 'CREATE_MESSAGE',
 *     created_at: '2018-12-02T07:36:41.764171Z',
 *     updated_at: '2018-12-02T07:36:41.764171Z',
 *   },
 * }
 */
const zlib = require('zlib');
const util = require('util');
const WebSocket = require('ws');
const camelcase = require('camelcase');
const interval = require('interval-promise');
const debug = require('debug')('MixinClient:Socket');

const { types, createMessage } = require('./message');
const BaseClient = require('./base');

class SocketClient extends BaseClient {
  constructor(args) {
    super(args);

    const socketUrl = args.socketUrl || 'wss://blaze.mixin.one/';
    const socketProtocols = args.socketProtocols || 'Mixin-Blaze-1';

    this.autoStart = args.autoStart || true;
    this.listPendingMessage = args.listPendingMessage || true;
    this.url = socketUrl && socketUrl.indexOf('ws') === -1 ? 'ws://' + socketUrl : socketUrl;
    this.protocols = socketProtocols;
    this.socket = null;
    this.isConnected = false;
    this.reconnectTimeoutId = 0;
    this.reconnectInterval = args.reconnectInterval === undefined ? 5 : args.reconnectInterval;
    this.shouldAttemptReconnect = Boolean(this.reconnectInterval);

    if (this.autoStart) {
      this.start();
    }
  }

  start() {
    const headers = {
      Authorization: `Bearer ${this.getJwtToken('GET', '/', '')}`,
      perMessageDeflate: false,
    };

    this.shouldAttemptReconnect = Boolean(this.reconnectInterval);
    this.isConnected = false;
    this.socket = new WebSocket(this.url, this.protocols, { headers });
    this.socket.onmessage = this._onMessage.bind(this);
    this.socket.onopen = this._onOpen.bind(this);
    this.socket.onerror = this._onError.bind(this);
    this.socket.onclose = this._onClose.bind(this);

    interval(async (iteration, _) => {
      debug('heartbeat check', { iteration });
      try {
        await this.ping();
      } catch (err) {
        this.socket.terminate();
        this.start();
      }
    }, 30 * 1000);
  }

  destroy() {
    clearTimeout(this.reconnectTimeoutId);
    this.shouldAttemptReconnect = false;
    this.socket.close();
  }

  sendRaw(message) {
    debug('sendRawMessage', message);
    return new Promise((resolve, reject) => {
      try {
        const buffer = Buffer.from(JSON.stringify(message), 'utf-8');
        zlib.gzip(buffer, (_, zipped) => {
          if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(zipped);
            resolve();
          } else {
            reject(new Error('Socket connection not ready'));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  _initMessageSenders() {
    this.messageSenders = [];
    if (typeof this.sendRaw !== 'function') {
      return;
    }

    Object.keys(types).forEach(x => {
      const key = camelcase(['send', x]);
      this[key] = async (data, msgObj) => {
        const message = createMessage(x, { conversationId: msgObj.data.conversation_id, [x]: data }, this.getUUID);
        return this.sendRaw(message);
      };

      debug(`Generate message sender fn: ${key}`);
      this.messageSenders.push(key);
    });
  }

  /**
   * Wrap a message handler to auto confirm message recipient after handling
   * @param {*} messageId
   */
  getMessageHandler(handler) {
    const promised = util.promisify(handler);
    return message => {
      promised(message).then(result => {
        if (
          message.action &&
          message.action !== 'ACKNOWLEDGE_MESSAGE_RECEIPT' &&
          message.action !== 'LIST_PENDING_MESSAGES'
        ) {
          return new Promise((resolve, reject) => {
            this.sendRaw({
              id: this.getUUID(),
              action: 'ACKNOWLEDGE_MESSAGE_RECEIPT',
              params: {
                message_id: message.data.message_id,
                status: 'READ',
              },
            })
              .then(() => resolve(result))
              .catch(reject);
          });
        }

        return result;
      });
    };
  }

  /**
   * Enable pending message fetching
   */
  listPendingMessages() {
    return new Promise((resolve, reject) => {
      const id = this.getUUID();
      this.sendRaw({ id, action: 'LIST_PENDING_MESSAGES' })
        .then(() => resolve(id))
        .catch(reject);
    });
  }

  /**
   * Decode message to normalized object
   * @param {*} data
   */
  decode(data) {
    return new Promise((resolve, reject) => {
      try {
        zlib.gunzip(data, (err, unzipped) => {
          if (err) {
            return reject(err);
          }
          const msgObj = JSON.parse(unzipped.toString());
          // TODO: decode messages automatically
          if (msgObj && msgObj.action === 'CREATE_MESSAGE' && msgObj.data && msgObj.data.category === 'PLAIN_TEXT') {
            msgObj.data.data = Buffer.from(msgObj.data.data, 'base64').toString('utf-8');
          }
          resolve(msgObj);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  ping() {
    return new Promise((resolve, reject) => {
      try {
        this.socket.ping();
        let pong = false;
        this.socket.once('pong', () => {
          pong = true;
          resolve();
        });
        setTimeout(() => {
          if (!pong) {
            reject(new Error('timeout'));
          }
        }, 5000);
      } catch (err) {
        reject(err);
      }
    });
  }

  _onOpen() {
    this.isConnected = true;
    debug('is connected');
    this.emit('connect');

    if (this.listPendingMessage) {
      this.listPendingMessages().then(receiptId => {
        debug(`List pending message: ${receiptId}`);
      });
    }
  }

  _onClose(event) {
    if (this.shouldAttemptReconnect) {
      this.emit('closed', event);
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = setTimeout(() => {
        this.emit('reconnect');
        this.start();
      }, this.reconnectInterval * 1000);
    } else {
      this.emit('destroyed', event);
    }
  }

  _onMessage(message) {
    debug('onMessage.raw', message.data);
    this.decode(message.data)
      .then(decoded => {
        debug('onMessage.decoded', decoded);
        this.emit('message', decoded);
      })
      .catch(err => {
        console.error('SocketClient.decodeError', err);
        this.emit('error', err);
      });
  }

  _onError(event) {
    this.emit('error', event);
  }
}

module.exports = SocketClient;
