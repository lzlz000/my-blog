---
title: 升级hexo
typora-root-url: ../
date: 2020-11-02 22:44:48
tags: hexo
---

[个人主页](https://lzlz000.github.io)

长时间没有使用，本地的hexo版本还是3.8

```
> hexo version
hexo: 3.8.0
hexo-cli: 2.0.0
os: Windows_NT 10.0.18363 win32 x64
http_parser: 2.8.0
node: 10.1.0
v8: 6.6.346.27-node.6
uv: 1.20.2
zlib: 1.2.11
ares: 1.14.0
modules: 64
nghttp2: 1.29.0
napi: 3
openssl: 1.1.0h
icu: 61.1
unicode: 10.0
cldr: 33.0
tz: 2018c
```

升级执行 

```
npm i hexo-cli -g
```

等待升级完成...此时再次执行```hexo version```， 报错，原来本地的node环境还是版本10，于是升级node，windows环境下升级node最好还是官网下载安装包。

升级完成后再次执行```hexo version```， 升级成功。

