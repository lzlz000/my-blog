---
title: 升级hexo
typora-root-url: ../
date: 2020-11-04 22:44:48
tags: hexo
index_img: /img/fluid-console.png
---

长时间没有使用，本地的hexo版本是3.8

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

更换主题，我一直使用的是默认的 landscape 主题，自己修改里面的模板文件ejs来满足需求。尝试了几个主题之后我选择了 [fluid](https://hexo.fluid-dev.com/)，原因是它自带的搜索功能太好用了，可以搜索正文。这正是我想要的，本来就主要是写给自己看的，方便后面回来查找。其实是内置了hexo-generator-search插件，然而我以前并不知道，永远滴神。配置也非常丰富，虽然默认风格不是太喜欢，不过很容易修改。