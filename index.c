#include <sys/xattr.h>
#include <napi-macros.h>
#include <node_api.h>

#include <stdio.h>
#include <errno.h>

#define FSX_MAX_PATH 2048
#define FSX_MAX_VALUE 16384

typedef struct {
  uint8_t type;
  const char path[FSX_MAX_PATH];
  const char key[FSX_MAX_PATH];
  char value[FSX_MAX_VALUE];
  uint32_t value_length;
  napi_async_work worker;
  napi_ref callback;
  napi_ref ctx;
  int error;
} fsx_t;

static void fsx_execute_callback (napi_env env, void* data) {
  fsx_t *self = (fsx_t *) data;

  ssize_t ret = -1;
  size_t val_len = self->value_length;
  const char *path = (const char *) &(self->path);
  const char *key = (const char *) &(self->key);
  char *val = (char *) self->value;

  if (self->type == 0) {
    ret = getxattr(path, key, val, FSX_MAX_VALUE);
    if (ret < 0 && errno == ENODATA) ret = 0;
  }

  if (self->type == 1) {
    ret = setxattr(path, key, val, val_len, 0);
  }

  self->error = ret < 0 ? 1 : 0;
  if (ret >= 0) self->value_length = (uint32_t) ret;
}

static void fsx_complete_callback (napi_env env, napi_status status, void* data) {
  fsx_t *self = (fsx_t *) data;

  napi_delete_async_work(env, self->worker);

  napi_handle_scope scope;
  napi_open_handle_scope(env, &scope);
  napi_value ctx;
  napi_get_reference_value(env, self->ctx, &ctx);
  napi_value callback;
  napi_get_reference_value(env, self->callback, &callback);
  napi_value argv[2];
  napi_create_uint32(env, self->error, &(argv[0]));
  napi_create_uint32(env, self->value_length, &(argv[1]));
  napi_make_callback(env, NULL, ctx, callback, 2, argv, NULL);
  napi_close_handle_scope(env, scope);
}

NAPI_METHOD(fsx_init) {
  NAPI_ARGV(3)
  NAPI_ARGV_BUFFER_CAST(fsx_t *, data, 0)

  napi_create_reference(env, argv[1], 1, &(data->ctx));
  napi_create_reference(env, argv[2], 1, &(data->callback));

  return NULL;
}

NAPI_METHOD(fsx_run) {
  NAPI_ARGV(3)
  NAPI_ARGV_BUFFER_CAST(fsx_t *, data, 0)
  NAPI_ARGV_UINT32(value_len, 1)

  data->value_length = value_len;

  napi_create_async_work(
    env,
    NULL, // resource
    argv[2],
    fsx_execute_callback,
    fsx_complete_callback,
    data,
    &(data->worker)
  );

  napi_queue_async_work(env, data->worker);

  return NULL;
}

NAPI_INIT() {
  NAPI_EXPORT_FUNCTION(fsx_init)
  NAPI_EXPORT_FUNCTION(fsx_run)
  NAPI_EXPORT_SIZEOF(fsx_t)
}
