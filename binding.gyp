{
  "targets": [{
    "target_name": "fs_extended_attributes",
    "include_dirs": [
      "<!(node -e \"require('napi-macros')\")"
    ],
    "sources": [
      "./index.c"
    ],
    "xcode_settings": {
      "OTHER_CFLAGS": [
        "-O3",
        "-std=c99",
        "-D_GNU_SOURCE"
      ]
    },
    "cflags": [
      "-O3",
      "-std=c99",
      "-D_GNU_SOURCE"
    ],
  }]
}

