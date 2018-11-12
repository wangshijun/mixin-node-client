# mixin-node-sdk

[![build status](https://img.shields.io/travis/wangshijun/mixin-node-sdk.svg)](https://travis-ci.org/wangshijun/mixin-node-sdk)
[![code coverage](https://img.shields.io/codecov/c/github/wangshijun/mixin-node-sdk.svg)](https://codecov.io/gh/wangshijun/mixin-node-sdk)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/wangshijun/mixin-node-sdk.svg)](LICENSE)

> Node.js SDK for Mixin Network, heavily inspired by [mixin-node](https://www.npmjs.com/package/mixin-node)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Contributors](#contributors)
- [License](#license)

## Install

[npm][]:

```sh
npm install mixin-node-sdk
```

[yarn][]:

```sh
yarn add mixin-node-sdk
```

## Usage

```js
const MixinNodeSdk = require('mixin-node-sdk');

const mixinNodeSdk = new MixinNodeSdk();

console.log(mixinNodeSdk.renderName());
// script
```

## Contributors

| Name           |
| -------------- |
| **wangshijun** |

## License

[MIT](LICENSE) © wangshijun

##

[npm]: https://www.npmjs.com/
[yarn]: https://yarnpkg.com/
