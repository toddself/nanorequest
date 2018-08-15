# nanorequest [![stability][0]][1]

[![npm version][2]][3] [![build status][4]][5]
[![downloads][8]][9] [![js-standard-style][10]][11]

Sometimes you just want to make a small request with a callback.

[0]: https://img.shields.io/badge/stability-stable-brightgreen.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/nanorequest.svg?style=flat-square
[3]: https://npmjs.org/package/nanorequest
[4]: https://img.shields.io/travis/toddself/nanorequest/master.svg?style=flat-square
[5]: https://travis-ci.org/toddself/nanorequest
[8]: http://img.shields.io/npm/dm/nanorequest.svg?style=flat-square
[9]: https://npmjs.org/package/nanorequest
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard

## About

Sometimes, when you're testing an API for example, [request](https://github.com/request/request)
is too large to install as as devDependency. Or might you don't need hawk
authentication? Perhaps you're just sending JSON so you don't really care about
multipart/mime (although this can handle that, you just gotta do the work
yourself...).

This is *not* a full-featured library for sending and working with HTTP requests
though. If you need something that isn't supported, you're likely looking at the
wrong library. The idea here to really just wrap the built-in `http.request`
method so you can use a callback and not deal with all the events crap.

Version 2.0.0 and higher requires node 8. If you want to use node 7 or earlier,
you can continue to use ^1.0.0.

## Installation

```
npm install nanorequest
```

## Usage

```js
const request = require('nanorequest')

const opts = {
  url: 'https://google.com'
}

const req = request(opts, (err, res, body) => {
  // do something with these things
})

// or with promises
request(opts)
  .then(({res, body}) => {}) // do something with these things
  .catch((err) => {}) // error out!

// or with async/await
try {
  const {res, body} = request(opts)
} catch (err) {
  console.log(err, err.res.statusCode, err.body)
}
```

### API

#### nanorequest(opts:object(key:string), cb(err:Error, res:[Response](https://nodejs.org/api/http.html#http_class_http_serverresponse), body:(mixed)):function):[Request](https://nodejs.org/api/http.html#http_class_http_clientrequest)|Promise

The `opts` object matches the options used in [`http.request`](https://nodejs.org/api/http.html#http_http_request_options_callback), but accepts an optional `url` field.

* `opts.url:string` - the URL you want to request. Will be parsed with [`url.parse`](https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost).

The final parameter to the callback will depend on the content-type header
returned from the server:

* `application/json`: this will be parsed and the object will returned
* `text/*`: the buffer will be converted to a string and returned
* otherwise a buffer will be returned

If the callback is omitted, the function with return a Promise **instead** of
returning the request.

## License

[Apache-2.0](LICENSE) © 2018 Todd Kennedy
