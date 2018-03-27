# fs-extended-attributes

Work in progress, native module to do cross platform file attributes

```
npm install fs-extended-attributes
```

## Usage

``` js
const fsx = require('fs-extended-attributes')

// assuming index.js exists as a file
fsx.set('./index.js', 'user.foo', 'hello', function () {
  fsx.get('./index.js', 'user.foo', console.log)
})
```

## License

MIT
