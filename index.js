const binding = require('node-gyp-build')(__dirname)
const pool = []

exports.get = get
exports.set = set

function set (path, name, val, flags, cb) {
  if (typeof flags === 'function') return set(path, name, val, 0, flags)
  if (!cb) cb = noop
  if (!Buffer.isBuffer(val)) val = Buffer.from(val)

  const n = binding.fsx_setattr(path, name, val, flags || 0)
  if (n < 0) return process.nextTick(cb, new Error('Could not set attribute'))

  process.nextTick(cb, null)
}

function get (path, name, cb) {
  const buf = pool.pop() || Buffer.alloc(4096)

  const n = binding.fsx_getattr(path, name, buf)
  if (n < 0) return process.nextTick(cb, new Error('Could not get attribute'))
  if (n === 0) return process.nextTick(cb, null, null)

  const copy = Buffer.allocUnsafe(n)
  buf.copy(copy, 0, 0, n)
  pool.push(buf)

  process.nextTick(cb, null, copy)
}

function noop () {}
