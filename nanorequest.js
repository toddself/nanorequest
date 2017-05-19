const http = require('http')
const https = require('https')
const url = require('url')

function json (obj) {
  return obj.header && obj.header['content-type'] === 'application/json'
}

module.exports = function sendRequest (opts, cb) {
  if (typeof opts.url === 'string') {
    Object.assign(opts, url.parse(opts.url))
    opts.url = void 0
  }

  if (json(opts) && typeof body !== 'string') {
    opts.body = JSON.stringify(opts.body)
  }

  let lib = http
  if (opts.protocol === 'https') {
    lib = https
  }

  const req = lib.request(opts, response)
  req
    .on('error', handleError)
    .end(opts.body ? opts.body : null)

  function response (res) {
    const body = []
    res
      .on('error', handleError)
      .on('data', (chk) => body.push(chk.toString('utf8')))
      .on('end', () => end(res, body))
  }

  function end (res, body) {
    let content = body.join('')
    let err = null
    if (json(res)) {
      try {
        content = JSON.parse(content)
      } catch (err) {
        return handleError(err, res)
      }
    }

    if (res.statusCode > 299) {
      err = new Error(`${res.statusCode}: ${res.statusText || 'error'}`)
    }

    cb(err, res, content)
  }

  function handleError (err, res) {
    if (!(err instanceof Error)) {
      err = new Error(err)
    }
    res = res || {statusCode: null}
    cb(err, res, err.message)
  }
}

