---
title: element-ui的响应式栅格布局
date: 2018-07-10 20:05:10
tags: 前端
typora-root-url: ../
---

要注意的问题

- xs、sm、md、lg、xl 五个尺寸的默认值均为24，意味着，任何一个尺寸属性不设置，则该尺寸下响应式宽度为24，这与bootstrap不同
- 尺寸属性可以设为0，则该el-col不显示
- 不论尺寸属性设置为多少，若el-col中没有任何内容则该el-col不显示（内部元素为空也不行，如
```
<el-col>
    <div></div>
    <span></span>
</el-col>
```
```
<el-row>
    <el-col :xs="12" :sm="9" :md="6" :lg="0" :xl="0">123</el-col>
    <el-col :xs="12" :sm="15" :md="18" :lg="21" :xl="24">456</el-col>
</el-row>
```
- offset 属性是没有响应式的，可以通过加入一个带一个空格的el-col解决： 

  ```
  <el-col :xs="0" :sm="1" :md="2" :lg="3" :xl="3">&nbsp;</el-col>
  ```


可以把固定的响应式布局作为组件
```
Vue.component('my-container',{
    template:`
    <el-row>
        <el-col :xs="0" :sm="1" :md="2" :lg="3" :xl="4">&nbsp;</el-col>
        <el-col :xs="24" :sm="22" :md="20" :lg="18" :xl="18">
            <slot></slot>
        </el-col>
        <el-col :xs="0" :sm="1" :md="2" :lg="3" :xl="4">&nbsp;</el-col>
    </el-row>
    `
});
```
就可以愉快的使用了
```
<my-container>
    <div style="background: red">内容</div>
</my-container>`
```
