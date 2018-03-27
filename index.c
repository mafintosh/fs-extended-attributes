#include <sys/xattr.h>
#include <napi-macros.h>
#include <node_api.h>

#include <stdio.h>
#include <errno.h>

#define FSX_MAX_PATH 1024

#define FSX_CALL(ret, op) \
  ret = op; \
  if (ret < 0) { \
    if (errno == ENODATA) ret = 0; \
  }

NAPI_METHOD(fsx_setattr) {
  NAPI_ARGV(4)
  NAPI_ARGV_UTF8(path, FSX_MAX_PATH, 0)
  NAPI_ARGV_UTF8(key, FSX_MAX_PATH, 1)
  NAPI_ARGV_BUFFER(val, 2)
  NAPI_ARGV_INT32(flags, 3)

  ssize_t ret;

  FSX_CALL(
    ret,
    setxattr((const char *) &path, (const char *) &key, val, val_len, flags)
  )

  NAPI_RETURN_INT32(ret);
}

NAPI_METHOD(fsx_getattr) {
  NAPI_ARGV(3)
  NAPI_ARGV_UTF8(path, FSX_MAX_PATH, 0)
  NAPI_ARGV_UTF8(key, FSX_MAX_PATH, 1)
  NAPI_ARGV_BUFFER(val, 2)

  ssize_t ret;

  FSX_CALL(
    ret,
    getxattr((const char *) &path, (const char *) &key, val, val_len)
  )

  NAPI_RETURN_INT32(ret);
}

NAPI_INIT() {
  NAPI_EXPORT_FUNCTION(fsx_getattr)
  NAPI_EXPORT_FUNCTION(fsx_setattr)
}
