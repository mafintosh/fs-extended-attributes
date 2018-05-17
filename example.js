const fsx = require('./')

fsx.set(__filename, 'user.hello', Buffer.from('worlds'), function () {
  fsx.get(__filename, 'user.hello', console.log)
})
