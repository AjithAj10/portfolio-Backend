/**
 * copy to config.js, and write configure
 */
module.exports = {
    /** set API baseUrl, */
    /**   if not set this key, or empty, or false, or undefined, */
    /**   default baseUrl will be set by `process.env.PRODUCTION` */
    /**   if process.env.PRODUCTION === 'prod', the default value will be https://api.kucoin.io */
    /**   else use sandbox as https://openapi-sandbox.kucoin.io */
    baseUrl: 'https://api.kucoin.com',
    /** Auth infos */
    /**   key is API key */
    /**   secret is API secret */
    
    /**   passphrase as API passphrase */
    apiAuth: {
      key: '657d361f6767a80001ea49b2',
      secret: 'ef8a0b1b-d6da-4104-bb34-0616f780cc42',
      passphrase: 'portfolio_crypto'
    },
    authVersion: 2
  }