# rapid-stream
![](http://img.shields.io/badge/stability-experimental-orange.svg?style=flat)
![](http://img.shields.io/npm/v/rapid-stream.svg?style=flat)
![](http://img.shields.io/npm/dm/rapid-stream.svg?style=flat)
![](http://img.shields.io/npm/l/rapid-stream.svg?style=flat)

Through stream that processes elements in parallel, with no regard for input order.

Similar to [parallel-transform](http://github.com/mafintosh/parallel-transform),
however because it ignores input order it can process input faster when incoming
chunks take a variable amount of time to resolve, e.g. network requests behind
a caching layer.

## Usage

[![NPM](https://nodei.co/npm/rapid-stream.png)](https://nodei.co/npm/rapid-stream/)

### `rapid(parallelism, [opts], handle)`

Creates a new rapid stream that will handle at most `parallelism` chunks at any one
time. Optionally, you may pass in `opts` to override the default stream options.
Note that this is an object mode stream by default.

`handle(chunk, encoding, next)` is called for each incoming chunk, and works more
or less the same as it does in [through2](http://github.com/rvagg/through2).

``` javascript
const RapidStream = require('rapid-stream')
const from2       = require('from2')

var stream = RapidStream(2, function(chunk, encoding, next) {
  setTimeout(function() {
    next(null, chunk)
  }, 1000 * Math.random())
})

from2([1, 2, 3, 4, 5]).pipe(stream).on('data', function(data) {
  console.log(data)
})

// 2
// 1
// 3
// 5
// 4
```

## License

MIT. See [LICENSE.md](http://github.com/nodesource/rapid-stream/blob/master/LICENSE.md) for details.
