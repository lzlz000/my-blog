---
title: electron-vue多窗口
typora-root-url: ../
date: 2019-07-16 11:05:45
tags: [electron, 前端]
---

[个人主页](https://lzlz000.github.io)

#### 打开子窗口

electron使用 vue-cli 模板 simulatedgreg/electron-vue 的开发过程其实和普通vue应用区别不大，普通vue组件可以直接迁移进来，还可以使用node丰富的api。由于我们的应用需要使用多个窗口，vue单页面应用只有一个页面入口，这是我目前的解决方案：

首先electron的窗口间通讯需要使用ipc，在主进程中使用ipcMain:

```js
const ipcMain = require('electron').ipcMain
```

在渲染进程，即组件中使用ipcRenderer

```js
const ipc = require('electron').ipcRenderer
ipc.(event, args);
// 模板已经把它封装到vue的参数中了,也可以这样使用
this.$electron.ipcRenderer.send(event, args);
```



在页面的入口组件上mounted钩子函数中加上,意味着接收主进程传来的router事件并指定路由参数

```js
this.$electron.ipcRenderer.on('router',(event,params)=>{
    this.$router.push(params)
})
```

在主进程脚本中接收事件并创建新窗口

```js
ipcMain.on('new-window',(event,router)=>{
   subWindow = new BrowserWindow({
        show: false,  // 设置自动显示为false以使用ready-to-show事件回调
        parent: mainWindow // 如果需要设置父窗口
    })	

    subWindow.on('ready-to-show',()=>{
        subWindow.show();
        subWindow.send('router',router); 
    })
})
```

在主窗口发送事件

```js
this.$electron.ipcRenderer.send('new-window',{
    name:'entry', // vue-router传递参数时候不能使用path作为路径
    params: { type: channelType.key } //传递参数
});
```

#### 窗口间数据交换

还是进程间通讯问题，根据需求定义好几个事件，首先是子窗口准备好接收信息的事件，

在子窗口的组件即你路由到的那个指定组件的钩子函数mounted上加上以下代码告诉主进程，子窗口已经初始化完成，注意这不是electron窗口初始化完成而是指定的vue页面初始化完成

```js
this.$electron.ipcRenderer.send('sub-ready'); 
this.$electron.ipcRenderer.on('data-to-sub',(event,data)=>{
    // 接收到数据
})
```

此时主进程通知主窗口可以向子窗口通讯了。

```
mainWindow.send('sub-ready')
```

```js
// 主窗口在合适位置监听：
this.$electron.ipcRenderer.on('sub-ready',(event,params)=>{
    // 这时候如果需要可以提示用户，或者变量标识可以发送消息了
})

// 发送消息的函数
sendData(data){
    this.$electron.ipcRenderer.send('data-to-sub',data)
}
```

#### 整体流程

1. 主窗口->主进程: 打开子窗口 
2. 子窗口->主进程:初始化完成
3. 主进程->子窗口:路由到指定页面
4. 子窗口->主进程:页面加载完成
5. 主进程->主窗口:子窗口已经可以使用了
6. 窗口间可以互相通信

![时序图](/images/1563257647260.png)

以上例子是在一个主窗口和一个子窗口的情况下进行的，如果存在多个窗口或者复杂的路由，可能需要把代码抽象封装的更合理。