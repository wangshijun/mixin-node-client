sed -i -E "s/getAccessToken\(code: any\): Promise<any>;/getAccessToken(code: any): Promise<any>;__RpcClientMethods__/" lib/index.d.ts

echo "lib/index.d.ts was patched";
