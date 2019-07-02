---
title: 基于element-ui的页面内面包屑组件
date: 2019-07-02 17:54:20
tags: [前端]
typora-root-url: ../
---

elment-ui提供了面包屑组件 **el-breadcrumb** 然而他要配合url跳转路由使用，在项目中需要用到页面内的面包屑，因此我写了一个组件 **inner-breadcrumb**

inner-breadcrumb 包装了 el-breadcrumb 显示效果基本相同，不同的是，不再跳转页面，而是提供一个v-model控制当前的path值，并且提供了动态路径显示的功能（样式只是因为，我们的需求如此，这个可以很容易更改）
原版样式 
![](/images/5d037c361553b.png)
本组件样式
![](/images/5d037bd441e48.png)

### 属性



| 名称       | 说明                        | 类型          | 默认值 |
| ---------- | --------------------------- | ------------- | ------ |
| v-model    | 绑定路径值                  | string/number | 必填   |
| path       | 面包屑全路径参数，详见下文  | object        | 必填   |
| showInRoot | 是否在根页面显示该组件      | boolean       | false  |
| showBack   | 是否在右侧显示“返回上一级”  | boolean       | false  |
| labelArgs  | 面包屑标签动态参数,详见下文 | object        | -      |

### 例

```html
<inner-breadcrumb
  v-model="innerPath"
  :path="{
    label: '一级页面',
    key: '1',
    children: [
      {
        key: '2A',
        label: '二级页面A'
      },
      {
        key: '2B',
        label: '二级页面B',
        children: [
          {
            key: '3',
            label: '三级页面'
          }
        ]
      }
    ]
}"/>
```

当 v-model绑定值为"3"时，页面为：
![](/images/5d037bd441e48.png)

- 控制页面的方式

```
<div v-if="innerPath=='1'">...</div>
<div v-else-if="innerPath=='2A'">...</div>
<div v-else-if="innerPath=='2B'">...</div>
<div v-else-if="innerPath=='3'">...</div>
```

以此类推，页面会按照树形结构自动生成当前位置的面包屑，你可以无限添加。

值得注意的是，当回到主页面时候，面包屑默认隐藏，因为绝大多数需求和常理都不需要在主页面显示孤零零的面包屑。当然可以通过添加参数 **showInRoot** 来显示它

### 属性path的设置

| 名称       | 说明                        | 类型          | 默认值 |
| ---------- | --------------------------- | ------------- | ------ |
| label    | 页面标签显示的值        | string/number | 必填   |
| key    | 标签的key | string/number | 必填   |
| children | 下一级路径的集合 | array,其中每个元素都是一个节点，多叉树结构 | -  |
| disable | 如果当前路径不允许被点击则加上 | boolean       | false |



- 注意，开启“返回上一级”按钮，若上一级目录是disable，则会跳过，若所有上级目录均为disable，则无效，控制台会打印警告信息

```json
{
	label: "一级页面", 
	key: "1",
	children: [
	  {
		key: "2A",
		label: "二级页面A",
		disable: true
	  },
	  {
		key: "2B",
		label: "二级页面B",
		children: [
		  {
			key: "3",
			label: "三级页面"
		  }
		]
	  }
	]
}
```

### 动态参数

动态参数通过属性 **labelArgs** 设置，适用于需要路径动态标签的情况

#### 例

```html
<inner-breadcrumb
  v-model="pathKey"
  :label-args ="{code: active.code}"
  :path="{
    label: '排课管理',
    key:'main',
    children:[{
      label: '教学班排课({code})',
      key:'arrange'
    },]
  }"/>
```

当切换到对应路径**arrange**时候，会显示：
![](/images/5d037be97b8c2.png)



源码如下:

```html
<template>
  <!-- 页面内部使用的面包屑组件（URL不变,不适用router跳转） -->
  <div class="inner-breadcrumb" v-show="showInRoot || value!=root" style="height:24px;padding:0 3px 10px;">
    <el-breadcrumb class="breadcrumb" separator="/" style="float:left;">
      <el-breadcrumb-item v-for="(node, index) in pathArr" :key="index">
        <span v-if="node.disable && index<pathArr.length-1" class="disable" :class="{'last':index==pathArr.length-1}">{{parse(node.label)}}</span>
        <a v-else :class="{'last':index==pathArr.length-1}" href="javascript:;" @click="change(node.key,node.disable)">{{parse(node.label)}}</a>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <el-button v-if="showBack&&pathArr.length>1" style="float:right;padding:0;" type="text" @click="back">返回上一级</el-button>
  </div>
</template>
<script>
/**
 * 页面内部使用的面包屑组件（URL不变,不适用router跳转）
 */
export default {
  name: "InnerBreadcrumb",
  props: {
    value: {
      type: String,
    },
    path: {
      type: Object,
      required: true,
      // 形如：
      default: {
        label: "一级页面",
        key: "1",
        children: [
          {
            key: "2A",
            label: "二级页面A"
          },
          {
            key: "2B",
            label: "二级页面B",
            disable: true,
            children: [
              {
                key: "3",
                label: "三级页面"
              }
            ]
          }
        ]
      }
    },
    showBack:{ // 是否显示返回上一级
      type: Boolean,
      default: false
    },
    showInRoot: { // 是否在根目录显示
      type: Boolean,
      default: false
    },
    labelArgs:{ // 用于回显的参数 例如在 label 中使用 '设置:{info}',在 labelArgs传入{info:'用户信息'} 即可
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      pathMap: null,
      root: null,
      pathArr: []
    };
  },
  watch: {
    value(val) {
      this.buildPath(val);
    }
  },
  methods: {
    init() {
      let path = this.path;
      this.root = path.key;
      let pathMap = {};
      // 遍历path树,给每个节点加上父节点的key，parentKey空则是根节点
      let traverse = (node, parentKey) => {
        node.parentKey = parentKey;
        pathMap[node.key] = node;
        if (node.children && node.children.length) {
          for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            traverse(child, node.key);
          }
        }
      };
      traverse(path);
      this.pathMap = pathMap;
    },
    buildPath(key) {
      if(!key)
        return;
      // 建立路径数组
      let node = this.pathMap[key];
      if (!node) {
        // console.warn("InnerBreadcrumb 找不到key:" + key);
        return;
      }
      let arr = [];
      while (node) {
        arr.push(node);
        node = this.pathMap[node.parentKey];
      }
      arr.reverse();
      this.pathArr = arr;
    },
    parse(label){
      const reg = /\{[^\}]+\}/g;
      let labelCopy = label; // 复制一份
      let match;
      /* match的值
        0: "{abc}"
        groups: undefined
        index: 3
        input: "123{abc},{b}"
      */
      while((match = reg.exec(label))!=null){
        let key = match[0].substr(1,match[0].length-2);
        let value = this.labelArgs[key];
        if (value){
          // console.warn('InnerBreadcrumb 找不到参数:', key);
          labelCopy = labelCopy.replace(match[0],value);
        }
      }
      return labelCopy;
    },
    change(key, disable) {
      if (disable) return;
      // console.log(key);
      this.$emit("input", key);
    },
    back(){
      if(this.pathArr && this.pathArr.length>1){
        for (let i = this.pathArr.length-2; i >=0; i--) {
          const node = this.pathArr[i];
          if (!node.disable){
            this.change(node.key);
            return;
          }
        }
      }
      console.warn('InnerBreadcrumb 没有非disalbe的上级路径');
    }
  },
  created() {},
  mounted() {
    this.init();
    this.buildPath(this.value);
  }
};
</script>
<style lang="scss">
.inner-breadcrumb {
  .breadcrumb{
    span {
      font-weight: normal;
      color: #aaa;
    }
    a {
      font-weight: normal;
      color: #aaa;
    }
    a:hover{
      color: #409EFF;
    }
    .last{
      font-weight: bold!important;
      cursor: default!important;
    }
    .disable{
      cursor: default!important;
    }
  }
  
}
</style>
```

