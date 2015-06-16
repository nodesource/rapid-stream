const from2       = require('from2')
const test        = require('tape')
const RapidStream = require('./')

test('rapid-stream: works as normal when under threshold', function(t) {
  t.plan(2)

  var stream = RapidStream(10, delayed(100))
  var count  = 0

  from2({ objectMode: true }, ['a', 'b', 'c'])
    .pipe(stream)
    .on('data', function() { count++ })
    .once('end', function() {
      t.pass('end event fired')
    })

  setTimeout(function() {
    t.equal(count, 3, 'flushes available entries')
  }, 90)
})

test('rapid-stream: queues extra entries', function(t) {
  t.plan(2)

  var stream = RapidStream(10, delayed(100))
  var count  = 0

  from2({ objectMode: true }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .pipe(stream)
    .on('data', function() { count++ })

  setTimeout(function() {
    t.equal(count, 10, 'flushes available entries')
  }, 90)

  setTimeout(function() {
    t.equal(count, 11, 'waits for room before continuing')
  }, 110)
})

test('rapid-stream: multiple batches', function(t) {
  t.plan(4)

  var stream = RapidStream(3, delayed(100))
  var count  = 0

  from2({ objectMode: true }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .pipe(stream)
    .on('data', function() { count++ })

  setTimeout(function() {
    t.equal(count, 3, 'flushes available entries')
  }, 90)

  setTimeout(function() {
    t.equal(count, 6, 'flushes available entries')
  }, 190)

  setTimeout(function() {
    t.equal(count, 9, 'flushes available entries')
  }, 290)

  setTimeout(function() {
    t.equal(count, 11, 'waits for room before continuing')
  }, 310)
})

test('rapid-stream: no cares about order', function(t) {
  var list   = []
  var count  = 0
  var stream = RapidStream(10, function(chunk, _, next) {
    setTimeout(function() {
      next(null, chunk)
    }, 100 - count++ * 10)
  })

  from2({ objectMode: true }, [0, 1, 2, 3, 4])
    .pipe(stream)
    .on('data', function(data) {
      list.push(data)
    })
    .once('end', function() {
      t.deepEqual(list, [4, 3, 2, 1, 0], 'array reversed')
      t.end()
    })
})

function delayed(time) {
  return function(chunk, _, next) {
    this.push(chunk)
    setTimeout(function() { next() }, time)
  }
}
