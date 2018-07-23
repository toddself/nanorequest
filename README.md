# nanorequest

<div align="center">
  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-green.svg?style=flat-square"
      alt="API stability" />
  </a>
  <!-- NPM version -->
  <a href="https://npmjs.org/package/nanorequest">
    <img src="https://img.shields.io/npm/v/nanorequest.svg?style=flat-square"
      alt="NPM version" />
  </a>
  <!-- Build Status -->
  <a href="https://travis-ci.org/toddself/nanorequest">
    <img src="https://img.shields.io/travis/toddself/nanorequest/master.svg?style=flat-square"
      alt="Build Status" />
  </a>
  <!-- Standard -->
  <a href="https://standardjs.com">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"
      alt="Standard" />
  </a>
</div>

Sometimes, when you're testing an API for example, [request](https://github.com/request/request)
is too large to install as as devDependency. Or might you don't need hawk
authentication? Perhaps you're just sending JSON so you don't really care about
multipart/mime.  (Although this can handle that, you just gotta do the work
yourself...).

This is *not* a full-featured library for sending and working with HTTP requests
though. If you need something that isn't supported, you're likely looking at the
wrong library. The idea here to really just wrap the built-in `http.request`
method so you can use a callback and not deal with all the events crap.

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
  .then(({res, body}) => // do something with these things)
  .catch((err) => // error out!)

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
* `text/*': the buffer will be converted to a string and returned
* otherwise a buffer will be returned

If the callback is omitted, the function with return a Promise **instead** of
returning the request.

## License
Apache-2.0 © 2017 Todd Kennedy
