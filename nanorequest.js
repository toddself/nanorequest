var http = require('http')
var https = require('https')
var url = require('url')

var stringify = require('fast-safe-stringify')
var parse = require('fast-json-parse')
var concat = require('concat-stream')

function json (obj) {
  return obj.headers && (obj.headers['content-type'] || '').indexOf('application/json') > -1
}

function text (obj) {
  return obj.headers && (obj.headers['content-type'] || '').indexOf('text') > -1
}

module.exports = function sendRequest (opts, cb) {
  var reqBody = null
  if (typeof opts.url === 'string') {
    Object.assign(opts, url.parse(opts.url))
    opts.url = void 0
  }

  if (opts.body) {
    if (json(opts) && typeof opts.body !== 'string') {
      reqBody = stringify(opts.body)
    } else {
      reqBody = opts.body
    }

    if (!opts.headers) {
      opts.headers = {}
    }
    opts.headers['content-length'] = reqBody.length
  }

  var lib = opts.protocol === 'https:' ? https : http
  var req = lib.request(opts, response)
  req
    .on('error', handleError)
    .end(reqBody)

  return req

  function response (res) {
    var sink = concat(end.bind(end, res))
    res
      .on('error', handleError)
      .pipe(sink)
  }

  function end (res, buf) {
    var err = null

    if (json(res)) {
      var result = parse(buf.toString('utf8'))
      if (result.err) {
        return handleError(result.err, res)
      }
      buf = result.value
    }

    if (text(res)) {
      buf = buf.toString('utf8')
    }

    if (res.statusCode > 299) {
      err = new Error(`${res.statusCode}: ${res.statusMessage || 'error'}`)
    }

    cb(err, res, buf)
  }

  function handleError (err, res) {
    if (!(err instanceof Error)) {
      err = new Error(err)
    }
    res = res || {statusCode: null}
    cb(err, res, err.message)
  }
}

