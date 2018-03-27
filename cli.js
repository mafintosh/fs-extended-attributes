#!/usr/bin/env node

const fsx = require('./')
const args = process.argv.slice(2)

if (args[0] === 'set') {
  fsx.set(args[1], args[2], args[3], function (err) {
    if (err) throw err
  })
} else if (args[0] === 'get') {
  fsx.get(args[1], args[2], function (err, buf) {
    if (err) throw err
    if (!buf) console.log('(no attribute found)')
    else console.log(buf.toString())
  })
}
