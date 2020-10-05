// Generate by [js2dts@0.3.2](https://github.com/whxaxes/js2dts#readme)

export interface T101 {
  clientId: any;
  clientSecret: any;
  assetPin: any;
  aesKey: any;
  sessionId: any;
  privateKey: any;
  timeout?: number;
}
declare class MixinClient {
  clientId: any;
  clientSecret: any;
  assetPin: any;
  aesKey: any;
  sessionId: any;
  timeout: number;
  privateKey: any;
  constructor(T100: T101);
  getEncryptedPin(assetPin: any): any;
  getUUID(): string;
  validateUUID(uuid: any): boolean;
  getConversationId(userId: any, recipientId: any): string;
  getRequestSignature(method: any, uri: any, body: any): any;
  getJwtToken(method: any, uri: any, body: any): any;
  getEndpoints(): any;
  getMessageSenders(): any;
}
declare class HttpClient_1 extends MixinClient {
  constructor(args: any);
  /**
   * Get OAuth access_token by authorization code
   *
   * @param {String} code
   * @returns Promise<object>
   * @memberof HttpClient
   */
  getOAuthToken(code: string): Promise<any>;
  /**
   * Transfer from dapp to mixin messenger user
   *
   * @param {Object} { assetId, recipientId, traceId, amount, memo = '' }
   * @returns Promise<object>
   * @memberof HttpClient
   */
  transferFromBot(T102: any): Promise<any>;
}
export const HttpClient: typeof HttpClient_1;
declare class SocketClient_1 extends MixinClient {
  autoStart: any;
  listPendingMessage: any;
  url: any;
  protocols: any;
  socket: any;
  isConnected: boolean;
  reconnectTimeoutId: number;
  reconnectInterval: any;
  shouldAttemptReconnect: boolean;
  constructor(args: any);
  start(): void;
  destroy(): void;
  sendRaw(message: any): Promise<any>;
  /**
   * Wrap a message handler to auto confirm message recipient after handling
   * @param {*} messageId
   */
  getMessageHandler(handler: any): (message: any) => void;
  /**
   * Enable pending message fetching
   */
  listPendingMessages(): Promise<any>;
  /**
   * Decode message to normalized object
   * @param {*} data
   */
  decode(data: any): Promise<any>;
  ping(): Promise<any>;
}
export const SocketClient: typeof SocketClient_1;
export function isMessageType(message: any, type: any): boolean;
export interface T103 {
  conversation_id: any;
  category: any;
  status: string;
  message_id: any;
  data: any;
}
export interface T104 {
  id: any;
  action: string;
  params: T103;
}
export function createMessage(type: any, args: any, genUUID: any): T104;
