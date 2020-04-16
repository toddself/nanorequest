const test = require('tap').test
const http = require('http')
const concat = require('concat-stream')

const req = require('../').nanorequest

const httpServer = http.createServer((req, res) => {
  if (req.url === '/text') {
    res.setHeader('content-type', 'text/plain')
    res.end('this is a test')
  } else if (req.url === '/html') {
    res.setHeader('content-type', 'text/html')
    res.end('<html></html>')
  } else if (req.url === '/json') {
    res.setHeader('content-type', 'application/json;encoding=utf-8')
    res.end('{"message": "to you rudy"}')
  } else if (req.url === '/json-echo') {
    res.setHeader('content-type', 'application/json')
    const collect = concat((buf) => res.end(buf.toString('utf8')))
    req.pipe(collect)
  } else if (req.url === '/octet') {
    res.setHeader('content-type', 'application/octet-stream')
    res.end(Buffer.alloc(5))
  } else if (req.url === '/json-error') {
    res.statusCode = 400
    res.setHeader('content-type', 'application/json')
    res.end('{"message": "not good"}')
  } else if (req.url === '/bad-json') {
    res.setHeader('content-type', 'application/json')
    res.end('{message": "aseddd}')
  } else if (req.url === '/byte-me') {
    res.setHeader('content-type', 'application/json')
    res.end(`{"emojilength": ${req.headers['content-length']}}`)
  } else {
    res.statusCode = 404
    res.end('Not found')
  }
})
httpServer.listen(9999)

test('text/plain', (t) => {
  const opts = {
    method: 'get',
    url: 'http://localhost:9999/text'
  }
  req(opts, (err, res, body) => {
    t.error(err, 'no errors')
    t.equal(res.statusCode, 200, '200')
    t.ok(typeof body === 'string', 'string')
    t.equal(body, 'this is a test', 'it IS a test')
    t.end()
  })
})

test('text/plain (promises)', async (t) => {
  return new Promise((resolve, reject) => {
    const opts = {
      method: 'get',
      url: 'http://localhost:9999/text'
    }
    req(opts)
      .then(({res, body}) => {
        t.equal(res.statusCode, 200, '200')
        t.ok(typeof body === 'string', 'string')
        t.equal(body, 'this is a test', 'it IS a test')
        t.end()
        resolve()
      })
      .catch((err) => {
        t.fail(err, 'errored out')
        reject(err)
      })
  })
}).catch(test.threw)

test('text/html', (t) => {
  const opts = {
    method: 'get',
    url: 'http://localhost:9999/html'
  }
  req(opts, (err, res, body) => {
    t.error(err, 'no errors')
    t.equal(res.statusCode, 200, '200')
    t.ok(typeof body === 'string', 'string')
    t.equal(body, '<html></html>', 'html')
    t.end()
  })
})

test('json', (t) => {
  const opts = {
    method: 'get',
    url: 'http://localhost:9999/json'
  }
  req(opts, (err, res, body) => {
    t.error(err, 'no errors')
    t.equal(res.statusCode, 200, '200')
    t.ok(typeof body === 'object', 'object')
    t.equal(body.message, 'to you rudy', 'parsed')
    t.end()
  })
})

test('json-echo, body as object', (t) => {
  const opts = {
    method: 'post',
    url: 'http://localhost:9999/json-echo',
    body: {foo: 'bar'},
    headers: {
      'content-type': 'application/json'
    }
  }
  req(opts, (err, res, body) => {
    t.error(err, 'no errors')
    t.equal(res.statusCode, 200, '200')
    t.ok(typeof body === 'object', 'object')
    t.equal(body.foo, 'bar', 'echoed and parsed')
    t.end()
  })
})

test('json-echo, body as string, with header', (t) => {
  const opts = {
    method: 'post',
    url: 'http://localhost:9999/json-echo',
    body: '{"foo": "bar"}',
    headers: {
      'content-type': 'application/json'
    }
  }
  req(opts, (err, res, body) => {
    t.error(err, 'no errors')
    t.equal(res.statusCode, 200, '200')
    t.ok(typeof body === 'object', 'object')
    t.equal(body.foo, 'bar', 'echoed and parsed')
    t.end()
  })
})

test('json-echo, body as string, no header', (t) => {
  const opts = {
    method: 'post',
    url: 'http://localhost:9999/json-echo',
    body: '{"foo": "bar"}'
  }
  req(opts, (err, res, body) => {
    t.error(err, 'no errors')
    t.equal(res.statusCode, 200, '200')
    t.ok(typeof body === 'object', 'object')
    t.equal(body.foo, 'bar', 'echoed and parsed')
    t.end()
  })
})

test('octet-stream,', (t) => {
  const opts = {
    method: 'get',
    url: 'http://localhost:9999/octet'
  }
  req(opts, (err, res, body) => {
    t.error(err, 'no errors')
    t.equal(res.statusCode, 200, '200')
    t.ok(Buffer.isBuffer(body), 'buffer')
    t.ok(body.length, 5, '5 bytes')
    t.end()
  })
})

test('json-error,', (t) => {
  const opts = {
    method: 'get',
    url: 'http://localhost:9999/json-error'
  }
  req(opts, (err, res, body) => {
    t.ok(err, 'got error')
    t.equal(err.message, '400: Bad Request', 'Bad Request')
    t.equal(res.statusCode, 400, 'bad content')
    t.ok(typeof body === 'object', 'json response parsed')
    t.equal(body.message, 'not good', 'not good')
    t.end()
  })
})

test('bad json,', (t) => {
  const opts = {
    method: 'get',
    url: 'http://localhost:9999/bad-json'
  }
  req(opts, (err, res, body) => {
    t.ok(err, 'got error')
    t.ok(body.indexOf('Unexpected token m') > -1, 'bad parsing')
    t.end()
  })
})

test('byte length,', (t) => {
  const opts = {
    method: 'get',
    url: 'http://localhost:9999/byte-me',
    body: {emoji: '🐒'},
    headers: {
      'content-type': 'application/json'
    }
  }
  req(opts, (err, res, body) => {
    t.error(err, 'no error')
    t.equal(body.emojilength, 16, '2 bytes')
    t.end()
  })
})

test('error,', (t) => {
  const opts = {
    method: 'get',
    url: 'http://localhost:9999/beepboop'
  }
  req(opts, (err, res, body) => {
    t.ok(err, 'got error')
    t.equal(err.message, '404: Not Found', 'Not Found')
    t.equal(res.statusCode, 404, 'not found')
    t.ok(Buffer.isBuffer(body), 'buffer')
    t.equal(body.toString('utf8'), 'Not found', 'not found')
    t.end()
  })
})

test('error,', (t) => {
  const opts = {
    method: 'get',
    url: 'http://localhost:9999/beepboop'
  }
  req(opts)
    .then(() => {
      t.fail('should not be here')
    })
    .catch((err) => {
      t.ok(err, 'got error')
      t.equal(err.message, '404: Not Found', 'Not Found')
      t.equal(err.res.statusCode, 404, 'not found')
      t.ok(Buffer.isBuffer(err.body), 'buffer')
      t.equal(err.body.toString('utf8'), 'Not found', 'not found')
      t.end()
    })
})

test('teardown', (t) => {
  httpServer.close()
  t.end()
})
