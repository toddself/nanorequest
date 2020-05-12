import http from 'http'
import https from 'https'
import url, { Url } from 'url'
import { Stream } from 'stream'

interface NROpts extends http.RequestOptions{
  url?: string | Url
  body?: any
}
function json (obj:NROpts):boolean {
  return !!(obj.headers && (String(obj.headers['content-type']).indexOf('application/json') > -1))
}

function text (obj:NROpts):boolean {
  return !!(obj.headers && (String(obj.headers['content-type']).indexOf('text') > -1))
}

interface NRError extends Error {
  res?: http.IncomingMessage
  body?: body
}

type body = Buffer | string | {[key:string]: any}
type NRCB = (err:NRError | null, res:http.IncomingMessage, body:body ) => void

export function nanorequest (_opts:NROpts, cb?:NRCB):Promise<{res:http.IncomingMessage, body:body}> | http.ClientRequest {
  let _promise = false
  return new Promise((resolve, reject) => {
    if (!cb || typeof cb !== 'function') {
      _promise = true
      cb = (err:NRError | null, res:http.IncomingMessage, body:any) => {
        if (err) {
          err.res = res
          err.body = body
          return reject(err)
        }
        resolve({res, body})
      }
    }

    const opts = Object.assign({}, _opts)
    let reqBody = ''
    if (typeof opts.url === 'string') {
      Object.assign(opts, url.parse(opts.url))
      opts.url = void 0
    }

    if (opts.body) {
      if (json(opts) && typeof opts.body !== 'string') {
        try {
          reqBody = JSON.stringify(opts.body)
        } catch (err) {
          return reject(err)
        }
      } else {
        reqBody = opts.body
      }

      if (!opts.headers) {
        opts.headers = {}
      }
      opts.headers['content-length'] = Buffer.byteLength(reqBody, 'utf8')
    }

    let req
    if (opts.protocol === 'https:') {
      req = https.request(opts, response)
    } else {
      req = http.request(opts, response)
    }

    req
      .on('error', handleError)
      .end(reqBody)

    if (!_promise) return req

    function response (res:http.IncomingMessage):void {
      const len = parseInt(res.headers['content-length'] || '', 10) || 0
      let bufs:Buffer[] = []
      res
        .on('error', handleError)
        .on('data', (chunk:Buffer) => {
          bufs.push(chunk)
        })
        .on('end', () => {
          const len = bufs.reduce((acc, buf) => (acc = acc + buf.length), 0)
          const buf = Buffer.concat(bufs, len)
          end(res, buf)
        })
    }

    function end (res:http.IncomingMessage, buf:Buffer):void {
      let err = null
      let body:body = buf

      if (json(res)) {
        try {
          body = JSON.parse(buf.toString('utf8'))
        } catch (err) {
          return handleError(err, res)
        }
      }

      if (text(res)) {
        body = buf.toString('utf8')
      }

      if (res.statusCode && res.statusCode > 299) {
        err = new Error(`${res.statusCode}: ${res.statusMessage || 'error'}`)
      }

      if (cb) cb(err, res, body)
    }

    function handleError (err:NRError, res:http.IncomingMessage) {
      if (!(err instanceof Error)) {
        err = new Error(err)
      }
      res = res || {statusCode: null}
      if (cb) cb(err, res, err.message)
    }
  })
}
