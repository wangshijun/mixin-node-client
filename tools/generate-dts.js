const fs = require('fs');
const path = require('path');
const { HttpClient } = require('../lib/index');
const config = require('../examples/config');
const client = new HttpClient(config);

const methods = client.getEndpoints().map(x => `${x}(params:any): Promise<any>;`);
const filePath = path.join(__dirname, '../lib/index.d.ts');
let fileContent = fs.readFileSync(filePath).toString();
fileContent = fileContent.replace(/__RpcClientMethods__/, `\n${methods.join('\n')}\n`);
fs.writeFileSync(filePath, fileContent);

console.log('dts file written', filePath);
