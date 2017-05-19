const http = require('http')

module.exports = function sendRequest (method, path, body, headers, cb) {
  if (typeof headers === 'function') {
    cb = headers
    headers = {}
  }
  headers['content-type'] = 'application/json'
  const opts = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: method,
    headers
  }

  if (typeof body !== 'string') {
    body = JSON.stringify(body)
  }

  const req = http.request(opts, (res) => {
    const body = []
    let err = null

    if (res.statusCode > 299) {
      err = new Error(`Server returned ${res.statusCode}`)
    }

    if (res.statusCode === 204) {
      return cb(null, res, '')
    }

    res
      .on('error', (err) => {
        cb(err, {statusCode: null}, {message: 'response error'})
      })
      .on('data', (chk) => body.push(chk.toString('utf8')))
      .on('end', () => {
        let content
        try {
          content = JSON.parse(body.join(''))
        } catch (e) {
          return cb(e, res, content)
        }

        cb(err, res, content)
      })
  })
  .on('error', (err) => {
    cb(err, {statusCode: null}, {message: 'request error'})
  })
  req.end(body)
}
