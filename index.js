const ASYNC_GET = 'fs-extended-attributes-get'
const ASYNC_SET = 'fs-extended-attributes-set'
const IS_WINDOWS = process.platform === 'win32'

const binding = !IS_WINDOWS && require('node-gyp-build')(__dirname)
const fs = IS_WINDOWS && require('fs')

const workers = []
const free = []

exports.get = get
exports.set = set

function Worker () {
  this.handle = Buffer.alloc(binding.sizeof_fsx_t)
  this.dataLength = 0
  this.stringType = ASYNC_GET
  this.callback = null

  binding.fsx_init(this.handle, this, this._ondone)
}

Worker.prototype.setData = function (data) {
  if (data.length > 16384) throw new Error('Data must be <= 16KB')
  data.copy(this.handle, 1 + 2 * 2048)
  this.dataLength = data.length
}

Worker.prototype.getData = function () {
  const data = this.handle.slice(1 + 2 * 2048, 1 + 2 * 2048 + this.dataLength)
  const cpy = Buffer.allocUnsafe(data.length)
  data.copy(cpy)
  return cpy
}

Worker.prototype.run = function (type, path, key, data, cb) {
  this.stringType = type === 0 ? ASYNC_GET : ASYNC_SET
  this.handle[0] = type
  this._write(1, path)
  this._write(1 + 2048, key)
  if (data) this.setData(data)
  else this.dataLength = 0
  if (cb) this.callback = cb
  binding.fsx_run(this.handle, this.dataLength, this.stringType)
}

Worker.prototype._write = function (offset, str) {
  offset += this.handle.write(str, offset, 2047)
  this.handle[offset] = 0
}

Worker.prototype._ondone = function (hadError, len) {
  const get = this.handle[0] === 0
  const err = hadError
    ? new Error((get ? 'get' : 'set') + ' fs attribute failed')
    : null
  const cb = this.callback
  this.callback = null
  this.dataLength = len
  free.push(this)
  if (!cb) return
  if (err) return cb(err, null)
  const data = (get && len) ? this.getData() : null
  cb(null, data)
}

function alloc () {
  if (free.length) return free.pop()
  const worker = new Worker()
  workers.push(worker)
  return worker
}

function set (path, name, val, cb) {
  if (!Buffer.isBuffer(val)) val = Buffer.from(val)
  if (IS_WINDOWS) fs.writeFile(path + ':' + name, val, cb || noop)
  else alloc().run(1, path, name, val, cb)
}

function get (path, name, cb) {
  if (IS_WINDOWS) fs.readFile(path + ':' + name, onget(cb))
  else alloc().run(0, path, name, null, cb)
}

function noop () {}

function onget (cb) {
  return function (err, buf) {
    if (err && err.code === 'ENOENT') cb(null, null)
    else cb(err, buf)
  }
}
