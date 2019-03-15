const fs = require('fs');
const path = require('path');
const { HttpClient, SocketClient } = require('../lib/index');
const config = require('../examples/config');
const client = new HttpClient(config);
const socket = new SocketClient(config);

const httpMethods = client.getEndpoints().map(x => `${x}(params:any): Promise<any>;`);
const socketMethods = socket.getMessageSenders().map(x => `${x}(params:any): Promise<any>;`);
const filePath = path.join(__dirname, '../lib/index.d.ts');
let fileContent = fs.readFileSync(filePath).toString();
fileContent = fileContent.replace(/__HttpClientMethods__/, `\n${httpMethods.join('\n')}\n`);
fileContent = fileContent.replace(/__SocketClientMethods__/, `\n${socketMethods.join('\n')}\n`);
fs.writeFileSync(filePath, fileContent);

console.log('dts file written', filePath);
