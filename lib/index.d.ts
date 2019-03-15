// Generate by [js2dts@0.3.2](https://github.com/whxaxes/js2dts#readme)

export interface T101 {
  clientId: any;
  clientSecret: any;
  assetPin: any;
  aesKey: any;
  sessionId: any;
  privateKey: any;
  shareSecret?: string;
  timeout?: number;
}
declare class MixinClient {
  clientId: any;
  clientSecret: any;
  assetPin: any;
  aesKey: any;
  sessionId: any;
  timeout: number;
  shareSecret: string;
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
export interface T103 {
  assetId: any;
  recipientId: any;
  amount: any;
  memo?: string;
}
declare class HttpClient_1 extends MixinClient {
  constructor(args: any);
  getAccessToken(code: any): Promise<any>;
  getUserAssets(params: any): Promise<any>;
  getUserAsset(params: any): Promise<any>;
  getNetworkAssets(params: any): Promise<any>;
  getNetworkAsset(params: any): Promise<any>;
  getWithdrawAddress(params: any): Promise<any>;
  createWithdrawAddress(params: any): Promise<any>;
  deleteWithdrawAddress(params: any): Promise<any>;
  withdraw(params: any): Promise<any>;
  deposit(params: any): Promise<any>;
  getSnapshots(params: any): Promise<any>;
  getSnapshot(params: any): Promise<any>;
  verifyPin(params: any): Promise<any>;
  updatePin(params: any): Promise<any>;
  createTransfer(params: any): Promise<any>;
  getTransfer(params: any): Promise<any>;
  verifyPayment(params: any): Promise<any>;
  getProfile(params: any): Promise<any>;
  updatePreference(params: any): Promise<any>;
  updateProfile(params: any): Promise<any>;
  getUser(params: any): Promise<any>;
  getUsers(params: any): Promise<any>;
  getFriends(params: any): Promise<any>;
  getContacts(params: any): Promise<any>;
  createConversation(params: any): Promise<any>;
  readConversation(params: any): Promise<any>;
  sendMessage(params: any): Promise<any>;

  transferFromBot(T102: T103): Promise<any>;
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
export interface T104 {
  conversation_id: any;
  category: any;
  status: string;
  message_id: any;
  data: any;
}
export interface T105 {
  id: any;
  action: string;
  params: T104;
}
export function createMessage(type: any, args: any, genUUID: any): T105;
