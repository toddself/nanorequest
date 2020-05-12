"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const url_1 = __importDefault(require("url"));
function json(obj) {
    return !!(obj.headers && (String(obj.headers['content-type']).indexOf('application/json') > -1));
}
function text(obj) {
    return !!(obj.headers && (String(obj.headers['content-type']).indexOf('text') > -1));
}
function nanorequest(_opts, cb) {
    let _promise = false;
    return new Promise((resolve, reject) => {
        if (!cb || typeof cb !== 'function') {
            _promise = true;
            cb = (err, res, body) => {
                if (err) {
                    err.res = res;
                    err.body = body;
                    return reject(err);
                }
                resolve({ res, body });
            };
        }
        const opts = Object.assign({}, _opts);
        let reqBody = '';
        if (typeof opts.url === 'string') {
            Object.assign(opts, url_1.default.parse(opts.url));
            opts.url = void 0;
        }
        if (opts.body) {
            if (json(opts) && typeof opts.body !== 'string') {
                try {
                    reqBody = JSON.stringify(opts.body);
                }
                catch (err) {
                    return reject(err);
                }
            }
            else {
                reqBody = opts.body;
            }
            if (!opts.headers) {
                opts.headers = {};
            }
            opts.headers['content-length'] = Buffer.byteLength(reqBody, 'utf8');
        }
        let req;
        if (opts.protocol === 'https:') {
            req = https_1.default.request(opts, response);
        }
        else {
            req = http_1.default.request(opts, response);
        }
        req
            .on('error', handleError)
            .end(reqBody);
        if (!_promise)
            return req;
        function response(res) {
            const len = parseInt(res.headers['content-length'] || '', 10) || 0;
            let bufs = [];
            res
                .on('error', handleError)
                .on('data', (chunk) => {
                bufs.push(chunk);
            })
                .on('end', () => {
                const len = bufs.reduce((acc, buf) => (acc = acc + buf.length), 0);
                const buf = Buffer.concat(bufs, len);
                end(res, buf);
            });
        }
        function end(res, buf) {
            let err = null;
            let body = buf;
            if (json(res)) {
                try {
                    body = JSON.parse(buf.toString('utf8'));
                }
                catch (err) {
                    return handleError(err, res);
                }
            }
            if (text(res)) {
                body = buf.toString('utf8');
            }
            if (res.statusCode && res.statusCode > 299) {
                err = new Error(`${res.statusCode}: ${res.statusMessage || 'error'}`);
            }
            if (cb)
                cb(err, res, body);
        }
        function handleError(err, res) {
            if (!(err instanceof Error)) {
                err = new Error(err);
            }
            res = res || { statusCode: null };
            if (cb)
                cb(err, res, err.message);
        }
    });
}
exports.nanorequest = nanorequest;
