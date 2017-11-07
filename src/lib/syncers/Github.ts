import * as debug from 'debug';
import * as BaseGithub from 'github';
import { Cache } from '../Cache';
import { lazyInject } from '../Container';

const log  = debug('syncer:github:handler')
const Util = require('github/lib/util.js')

// const originalHandler = BaseGithub.prototype[ 'handler' ];

export interface Options extends BaseGithub.Options {
    url: string;
    cache: boolean;

}

export class Github extends BaseGithub {

    config: Options

    @lazyInject(Cache)
    cache: Cache

    constructor(options?: any) {
        super(options)
        this.cache.load();
        process.on('beforeExit', () => this.cache.save());
        // super[ 'handler' ]()
    }

    private handler(msg, block, callback) {
        log({ msg, block, callback })


        function getRequestFormat(hasBody, block) {
            if ( hasBody ) {
                return block.requestFormat || this.constants.requestFormat
            }
            return 'query'
        }

        function getQueryAndUrl(msg, def, format, config) {
            let url = def.url;
            if ( config.pathPrefix && url.indexOf(config.pathPrefix) !== 0 ) {
                url = config.pathPrefix + def.url
            }
            const ret: any = {};
            if ( ! def || ! def.params ) {
                ret.url = url
                return ret
            }

            Object.keys(def.params).forEach(function (paramName) {
                paramName = paramName.replace(/^[$]+/, '')
                if ( ! (paramName in msg) ) {
                    return
                }

                const isUrlParam = url.indexOf(':' + paramName) !== - 1;
                const valFormat  = isUrlParam || format !== 'json' ? 'query' : format;
                let val;
                if ( valFormat !== 'json' ) {
                    if ( typeof msg[ paramName ] === 'object' ) {
                        try {
                            msg[ paramName ] = JSON.stringify(msg[ paramName ])
                            val              = encodeURIComponent(msg[ paramName ])
                        } catch ( ex ) {
                            return Util.log('httpSend: Error while converting object to JSON: ' +
                                (ex.message || ex), 'error')
                        }
                    } else if ( def.params[ paramName ] && def.params[ paramName ].combined ) {
                        // Check if this is a combined (search) string.
                        val = msg[ paramName ].split(/[\s\t\r\n]*\+[\s\t\r\n]*/)
                            .map(function (part) {
                                return encodeURIComponent(part)
                            })
                            .join('+')
                    } else {
                        // the ref param is a path so we don't want to [fully] encode it but we do want to encode the # if there is one
                        // (see https://github.com/mikedeboer/node-github/issues/499#issuecomment-280093040)
                        if ( paramName === 'ref' ) {
                            val = msg[ paramName ].replace(/#/g, '%23')
                        } else {
                            val = encodeURIComponent(msg[ paramName ])
                        }
                    }
                } else {
                    val = msg[ paramName ]
                }

                if ( isUrlParam ) {
                    url = url.replace(':' + paramName, val)
                } else {
                    if ( format === 'json' && def.params[ paramName ].sendValueAsBody ) {
                        ret.query = val
                    } else if ( format === 'json' ) {
                        if ( ! ret.query ) {
                            ret.query = {}
                        }
                        ret.query[ paramName ] = val
                    } else if ( format !== 'raw' ) {
                        if ( ! ret.query ) {
                            ret.query = []
                        }
                        ret.query.push(paramName + '=' + val)
                    }
                }
            })
            ret.url = url
            return ret
        }

        const method    = block.method.toLowerCase();
        let hasFileBody = block.hasFileBody;
        let hasBody     = ! hasFileBody && (typeof (msg.body) !== 'undefined' || 'head|get|delete'.indexOf(method) === - 1)
        let format      = getRequestFormat.call(this, hasBody, block)
        const obj       = getQueryAndUrl(msg, block, format, this.config);
        const query     = obj.query;
        let path        = this.config.url ? this.config.url + obj.url : obj.url
        // let path        = url;
        if ( ! hasBody && query && query.length ) {
            path += '?' + query.join('&')
        }

        if ( this.config.cache ) {
            // const etag = (path + 'ETAG');
            if ( this.cache.has(path + 'ETAG') ) {
                this.config.headers[ 'If-None-Match' ] = this.cache.get(path + 'ETAG');
            }
        }

        let cachingCallback = (err, res) => {
            if ( err ) return callback(err, res);

            if ( this.config.cache ) {
                if ( parseInt(res.meta.status) === 304 ) {
                    // return cached data
                    res.data = this.cache.get(path)
                }
                else {
                    this.cache.put(path, res.data);
                    this.cache.put(path + 'ETAG', res.meta.etag);
                }


            }

            return callback(err, res);
        }

        super[ 'handler' ](msg, block, cachingCallback)
        // originalHandler.apply(this, [ msg, block, callback ])
    }

}


// Github.prototype[ 'handler' ] = function (msg, block, callback) {
//     log({ msg, block, callback })
//
//     function getRequestFormat(hasBody, block) {
//         if ( hasBody ) {
//             return block.requestFormat || this.constants.requestFormat
//         }
//         return 'query'
//     }
//
//     function getQueryAndUrl(msg, def, format, config) {
//         let url = def.url;
//         if ( config.pathPrefix && url.indexOf(config.pathPrefix) !== 0 ) {
//             url = config.pathPrefix + def.url
//         }
//         const ret: any = {};
//         if ( ! def || ! def.params ) {
//             ret.url = url
//             return ret
//         }
//
//         Object.keys(def.params).forEach(function (paramName) {
//             paramName = paramName.replace(/^[$]+/, '')
//             if ( ! (paramName in msg) ) {
//                 return
//             }
//
//             const isUrlParam = url.indexOf(':' + paramName) !== - 1;
//             const valFormat  = isUrlParam || format !== 'json' ? 'query' : format;
//             let val;
//             if ( valFormat !== 'json' ) {
//                 if ( typeof msg[ paramName ] === 'object' ) {
//                     try {
//                         msg[ paramName ] = JSON.stringify(msg[ paramName ])
//                         val              = encodeURIComponent(msg[ paramName ])
//                     } catch ( ex ) {
//                         return Util.log('httpSend: Error while converting object to JSON: ' +
//                             (ex.message || ex), 'error')
//                     }
//                 } else if ( def.params[ paramName ] && def.params[ paramName ].combined ) {
//                     // Check if this is a combined (search) string.
//                     val = msg[ paramName ].split(/[\s\t\r\n]*\+[\s\t\r\n]*/)
//                         .map(function (part) {
//                             return encodeURIComponent(part)
//                         })
//                         .join('+')
//                 } else {
//                     // the ref param is a path so we don't want to [fully] encode it but we do want to encode the # if there is one
//                     // (see https://github.com/mikedeboer/node-github/issues/499#issuecomment-280093040)
//                     if ( paramName === 'ref' ) {
//                         val = msg[ paramName ].replace(/#/g, '%23')
//                     } else {
//                         val = encodeURIComponent(msg[ paramName ])
//                     }
//                 }
//             } else {
//                 val = msg[ paramName ]
//             }
//
//             if ( isUrlParam ) {
//                 url = url.replace(':' + paramName, val)
//             } else {
//                 if ( format === 'json' && def.params[ paramName ].sendValueAsBody ) {
//                     ret.query = val
//                 } else if ( format === 'json' ) {
//                     if ( ! ret.query ) {
//                         ret.query = {}
//                     }
//                     ret.query[ paramName ] = val
//                 } else if ( format !== 'raw' ) {
//                     if ( ! ret.query ) {
//                         ret.query = []
//                     }
//                     ret.query.push(paramName + '=' + val)
//                 }
//             }
//         })
//         ret.url = url
//         return ret
//     }
//
//     let hasFileBody = block.hasFileBody;
//     var hasBody     = ! hasFileBody && (typeof (msg.body) !== 'undefined' || 'head|get|delete'.indexOf(method) === - 1)
//     var format      = getRequestFormat.call(this, hasBody, block)
//     const obj       = getQueryAndUrl(msg, block, format, this.config);
//     const query     = obj.query;
//     var url         = this.config.url ? this.config.url + obj.url : obj.url
//     let path        = url;
//     if ( ! hasBody && query && query.length ) {
//         path += '?' + query.join('&')
//     }
//
//     if ( this.config.cache ) {
//         const etag = readCache(path + 'ETAG');
//
//         if ( etag ) {
//             this.config.headers[ 'If-None-Match' ] = etag;
//         }
//     }
//
//     let cachingCallback = (err, res) => {
//         if ( err ) return callback(err, res);
//
//         if ( this.config.cache ) {
//             if ( res.statusCode === 304 ) {
//                 // return cached data
//                 res.data = readCache(path)
//             }
//             else {
//                 writeCache(path, res.data);
//                 writeCache(path + 'ETAG', res.headers.etag);
//             }
//
//
//         }
//
//         return callback(err, res);
//     }
//
//     originalHandler.apply(this, [ msg, block, callback ])
// }
// export { Github }