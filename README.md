# nanorequest

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
```

### API

#### `nanorequest(opts:object(key:string), cb:function):undefined`
The `opts` object matches the options used in [`http.request`](https://nodejs.org/api/http.html#http_http_request_options_callback), but accepts an optional `url` field.
* `opts.url:string` - the URL you want to request. Will be parsed with [`url.parse`](https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost).

## License
Apache-2.0 © 2017 Todd Kennedy
