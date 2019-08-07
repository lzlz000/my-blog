---
title: electron+vue的实践
typora-root-url: ../
date: 2019-07-09 17:59:26
tags: [electron, 前端]
---

[个人主页](https://lzlz000.github.io)

吐槽一下，我一个后端程序猿怎么天天在写前端呢😔？

我们项目要用到一个客户端程序，从我们本身的技术栈出发，最合适的就是electron+vue来实现了。网上有各种文章写到这些，我尝试了一下，记录一下踩坑的过程。

首先需要npm 和 vue-cli 这个就不再赘述了，

#### 初始化-开发-打包

百度上搜索关键词"electron vue" 找到的很多文章会让人误入歧途，比如这个：

<https://www.cnblogs.com/jiangxifanzhouyudu/p/9517651.html>， 搜到的第一个就是它。使用 vue-cli 常规webpack打包

```
vue init webpack xxx
```

初始化普通vue单页面项目的方式都是不对的，electron中运行和服务器上运行的web应用有很多区别，对于以后的开发和调试都非常不方便。这才是正确方式：

```
vue init simulatedgreg/electron-vue ele-vue
```

这个模板帮助定义好了开发、调试、打包成多平台客户端的各方面配置。值得注意的是，electron和打包工具都非常大，npm的墙内速度真的会让你等到天荒地老，然后网络异常重来一遍。 如果你可以翻墙，就完美了，如果不幸可以在package.json的 build属性下新增以下内容使用淘宝镜像

```json
"build": {
    "electronDownload": {
      "mirror": "https://npm.taobao.org/mirrors/electron/"
    },
    ...
}
```

仍然有一些其他依赖资源不，例如winCodeSign，参考文章  https://www.cnblogs.com/chenweixuan/p/7693718.html

但经过我在不同电脑上多次配置，还是或多或少存在问题，仅在本地开发时，淘宝镜像安装一切正常，electron-builder打包最好的解决方案仍然删除node_modules然后翻墙使用npm install 简单方便没有任何奇怪的问题发生。
