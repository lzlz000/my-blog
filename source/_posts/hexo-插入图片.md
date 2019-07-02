---
title: hexo+typora 插入图片的简便解决方案
date: 2019-06-08 10:37:22
tags: hexo
typora-root-url: ../
---

hexo 官方有推荐的方式，但是结合实际使用，我的文章通过typora编辑，希望能得到所见即所得的效果，还能尽可能的减少重复操作。

### 方法1

通过搜索得到的解决方案最常见的是安装插件：

```
npm install hexo-asset-image --save
```

这个方式其实非常不好用，首先这插件是基于 hexo2开发的，在hexo3上使用有bug,解析的图片地址 都变成了形如  xxx/.io//xxx.png ，搜索下解决方法 ，还要自己手动去 node_modules 中修改脚本才能用，我们知道，node_modules 实际上都是npm install的时候自动生成的，这样的改动以后还要反复手动操作，太难受了，此方法不可取。

### 方法2

hexo官方给了两种解决方式 <https://hexo.io/zh-cn/docs/asset-folders> 

一个是使用hexo的标签：

![](/images/1559990605779.png)

这个方式看起来完美解决了问题，但是在我本地通过typora编辑文档时，是看不到图片的，不方便使用。

### 方法3

使用最简单的方式在 source 目录下创建images目录，然后图片都保存在这里。

关键是要在typora上做以下设置：

在md文件头部的配置项中，添加 `typora-root-url: ../`
```
---
title:  hexo+typora 插入图片
date: 2019-06-08 10:37:22
tags:
typora-root-url: ../
---
```

这样引用的图片都以上一级目录即 sourse作为根目录了，此时插入的图片时，只要点击“复制图片到...”并选择一次文件夹，以后每次都会自动保存在 sourse/image目录下，并且本地的显示和服务器上的根目录完全一致，使用体验还是很方便的。

![本地路径和服务器路径一致](/images/1559989480817.png)