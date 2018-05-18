# fs-extended-attributes

Native module to do cross platform file attributes.

```
npm install fs-extended-attributes
```

Uses setxattr, getxattr on Linux / Mac and Alternate Data Streams on Windows (NTFS)

[![build status](https://travis-ci.org/mafintosh/fs-extended-attributes.svg?branch=master)](https://travis-ci.org/mafintosh/fs-extended-attributes)
[![Build status](https://ci.appveyor.com/api/projects/status/os507604sys2dbj8/branch/master?svg=true)](https://ci.appveyor.com/project/mafintosh/fs-extended-attributes/branch/master)

## Usage

``` js
const fsx = require('fs-extended-attributes')

// assuming index.js exists as a file
fsx.set('./index.js', 'user.foo', 'hello', function () {
  fsx.get('./index.js', 'user.foo', console.log)
})
```

## CLI

There is also a CLI

```
npm install -g fs-extended-attributes
fsx set ./index.js user.foo hello
fsx get ./index.js user.foo # prints hello
```

## License

MIT
