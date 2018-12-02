/**
 * Websocket client that can reconnect on failure
 *
 * Please note that this file is refactored from https://github.com/virushuo/mixin-node/blob/master/ws-reconnect.js
 * Debug feature is added
 */
const zlib = require('zlib');
const util = require('util');
const events = require('events');
const WebSocket = require('ws');
const interval = require('interval-promise');
const debug = require('debug')('MixinClient:Socket');

const BaseClient = require('./base');

class SocketClient extends BaseClient {
  constructor(args) {
    super(args);

    const socketUrl = args.socketUrl || 'wss://blaze.mixin.one/';
    const socketProtocols = args.socketProtocols || 'Mixin-Blaze-1';

    this.autoStart = args.autoStart || true;
    this.listPendingMessage = args.listPendingMessage || true;

    this.url = socketUrl && socketUrl.indexOf('ws') == -1 ? 'ws://' + socketUrl : socketUrl;
    this.protocols = socketProtocols;
    this.socket = null;
    this.isConnected = false;
    this.reconnectTimeoutId = 0;
    this.reconnectInterval = args.reconnectInterval !== undefined ? args.reconnectInterval : 5;
    this.shouldAttemptReconnect = !!this.reconnectInterval;

    if (this.autoStart) {
      this.start();
    }
  }

  start() {
    console.log(this);
    const headers = {
      Authorization: `Bearer ${this.getJwtToken('GET', '/', '')}`,
      perMessageDeflate: false,
    };

    this.shouldAttemptReconnect = !!this.reconnectInterval;
    this.isConnected = false;
    this.socket = new WebSocket(this.url, this.protocols, { headers });
    this.socket.onmessage = this._onMessage.bind(this);
    this.socket.onopen = this._onOpen.bind(this);
    this.socket.onerror = this._onError.bind(this);
    this.socket.onclose = this._onClose.bind(this);

    interval(async (iteration, stop) => {
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
        const buffer = new Buffer(JSON.stringify(message), 'utf-8');
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

  sendMessage(opts, msgObj) {
    return new Promise((resolve, reject) => {
      try {
        const messageId = this.getUUID();
        const params = {
          conversation_id: msgObj.data.conversationId,
          recipient_id: msgObj.data.recipientId,
          message_id: messageId,
          category: opts.category,
          data: opts.data,
        };
        const message = { id: this.getUUID(), action: 'CREATE_MESSAGE', params: params };
        this.sendRaw(message)
          .then(() => resolve(messageId))
          .catch(reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  sendText(text, msgObj) {
    let opts = {};
    opts.category = 'PLAIN_TEXT';
    opts.data = new Buffer(text).toString('base64');
    return this.sendMessage(opts, msgObj);
  }

  sendImage(base64data, msgObj) {
    let opts = {};
    opts.category = 'PLAIN_IMAGE';
    opts.data = base64data;
    return this.sendMessage(opts, msgObj);
  }

  sendButton(text, msgObj) {
    let opts = {};
    opts.category = 'APP_BUTTON_GROUP';
    opts.data = new Buffer(text).toString('base64');
    return this.sendMessage(opts, msgObj);
  }

  /**
   * Should be called on message handler
   * @param {*} messageId
   */
  confirmMessageReceipt(messageId, msgObj) {
    if (msgObj.action && msgObj.action !== 'ACKNOWLEDGE_MESSAGE_RECEIPT' && msgObj.action !== 'LIST_PENDING_MESSAGES') {
      return new Promise((resolve, reject) => {
        try {
          const id = this.getUUID();
          const message = {
            id: id,
            action: 'ACKNOWLEDGE_MESSAGE_RECEIPT',
            params: {
              message_id: messageId,
              status: 'READ',
            },
          };
          this.sendRaw(message)
            .then(() => resolve(id))
            .catch(reject);
        } catch (err) {
          reject(err);
        }
      });
    }

    return Promise.resolve();
  }

  listPendingMessages() {
    return new Promise((resolve, reject) => {
      try {
        const id = this.getUUID();
        const message = { id: id, action: 'LIST_PENDING_MESSAGES' };
        this.sendRaw(message)
          .then(() => resolve(id))
          .catch(reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  decode(data) {
    return new Promise((resolve, reject) => {
      try {
        zlib.gunzip(data, (err, unzipped) => {
          let msgObj = JSON.parse(unzipped.toString());
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
        console.log('List receipt_id:' + receiptId);
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
    debug('onMessage', message.data);
    this.decode(message.data, decoded => {
      debug('onMessage.decoded', decoded);
      this.emit('message', decoded);
    });
  }

  _onError(event) {
    this.emit('error', event);
  }
}

util.inherits(SocketClient, events.EventEmitter);

module.exports = SocketClient;
