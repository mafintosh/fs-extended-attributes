const tape = require('tape')
const fsx = require('./')

tape('basic', function (t) {
  const random = Buffer.from(Math.random().toString(16).slice(2))
  fsx.set(__filename, 'user.test', random, function (err) {
    t.error(err, 'no error')
    fsx.get(__filename, 'user.test', function (err, buf) {
      t.error(err, 'no error')
      t.same(buf, random, 'correct attribute')
      t.end()
    })
  })
})
