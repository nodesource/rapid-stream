var Symbol   = global.Symbol || require('es6-symbol')
var through2 = require('through2')

module.exports = createStream

var PARALLELISM = Symbol('parallelism')
var FINISHED    = Symbol('finished')
var COUNTER     = Symbol('counter')
var MAPFN       = Symbol('mapFn')
var QUEUE       = Symbol('queue')

var RapidStream = through2.ctor({
  objectMode: true
}, function(chunk, encoding, next) {
  if (this[COUNTER] < this[PARALLELISM]) {
    this[COUNTER]++
    next()
    this[MAPFN].call(this, chunk, encoding, done(this))
    return
  }

  this[QUEUE].push([chunk, encoding, next])
}, function() {
  if (!this[COUNTER]) return this.push(null)
  this[FINISHED] = true
})

function done(self) {
  return function(err, value) {
    if (err) return self.emit('error', err)
    if (value !== undefined) self.push(value)

    if (!--self[COUNTER] && self[FINISHED]) {
      return self.push(null)
    }

    if (self[COUNTER] > self[PARALLELISM]) return
    if (!self[QUEUE].length) return

    var entry = self[QUEUE].shift()
    self[COUNTER]++
    entry[2]()
    self[MAPFN].call(self, entry[0], entry[1], done(self))
  }
}

function createStream(parallelism, opts, mapFn) {
  if (typeof opts === 'function') (mapFn = opts), (opts = {})

  var stream = new RapidStream(opts)

  stream[PARALLELISM] = parallelism
  stream[FINISHED]    = false
  stream[MAPFN]       = mapFn
  stream[QUEUE]       = []
  stream[COUNTER]     = 0

  return stream
}
