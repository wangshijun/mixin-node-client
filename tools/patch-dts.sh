sed -i -E "s/getOAuthToken\(code: string\): Promise<any>;/getOAuthToken(code: string): Promise<any>;__HttpClientMethods__/" lib/index.d.ts
sed -i -E "s/sendRaw\(message: any\): Promise<any>;/sendRaw(message: any): Promise<any>;__SocketClientMethods__/" lib/index.d.ts

echo "lib/index.d.ts was patched";
