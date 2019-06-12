---
title: 自制hexo评论插件（一）
date: 2019-06-13 01:13:00
tags: [hexo, 自制hexo评论插件]
typora-root-url: ../
---



hexo等静态博客，现在有很多可使用的评论插件，基本都需要繁琐的注册，国内的还需要实名制审核（我本人特别特别讨厌实名制审核，有一种我在网上干什么都有别人偷窥的感觉，虽然我是守法公民，但是即使我在床上只睡觉不干其他不可描述的事情，我也不希望有摄像头对着我拍不是吗？）我就在想，能不能自己做一个？

我仔细思考了一下，确实可以做，不过是一个前端界面和一个后端服务器。但是作为一个“插件”和一个前端页面还是有区别的，我希望能尽量让使用者简单的引入，最好启用一个服务器+引入一个js文件+少量配置就可以完成。

首先，不要太复杂的功能：基本功能针对每个页面的评论、回复、邮件即可，考虑后续加上markdown语法支持，管理界面等功能。

### 界面

我尝试使用了一些现有的插件，并试图模仿他们的样式并简化功能，于是我做出了下面这样的界面：

![](/images/1560364377217.png)

是不是还挺像那么回事的😀？

这部分的代码如下:

```css
#tiny-comment{
    margin: 10px 0;
    background: #ffffff;
    border: 1px solid #C0C4CC;
}
#tiny-comment .tiny-container{
    padding: 20px 20px 5px;
}
#tiny-comment .tiny-footer{
    padding: 5px  20px;
    background: #262A30;
    color: #999999;
    font-size: 12px;
}
#tiny-comment .tiny-footer a{
    color: #258FB8;
    text-decoration:none;
}
#tiny-comment input{
    width: 150px;
    border: none;
    border-bottom: 1px solid #C0C4CC;
    outline: none;
    margin-right: 10px;
}
#tiny-comment input:focus{
    border-bottom: 1px solid #409EFF;
}
#tiny-comment .input-wrapper{
    border: 1px dashed #C0C4CC;
    border-radius: 3px;
    padding: 5px;
    margin-bottom: 20px
}
#tiny-comment .input-wrapper textarea{
    /* border: 1px dashed #C0C4CC; */
    border: none;
    margin-top: 5px;
    width: 100%;
    resize: vertical;
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    outline: none;
}
#tiny-comment button{
    padding: 5px 20px;
    border: 1px solid #DCDFE6;
    border-radius: 3px;
    background: transparent;
    outline: none;
    cursor: pointer;
    
}
#tiny-comment button:active{
    border: 1px solid #409EFF;
    color: #409EFF;

}
#tiny-comment .comment-count{
    margin: 10px 0;
}
#tiny-comment .segment{
    margin: 10px 0;
    border-bottom: 1px solid #DCDFE6;
}
#tiny-comment .secondary{
    font-size: 12px;
    color: #C0C4CC;
    
}
#tiny-comment .segment .nickname{
    color: #409EFF;
    cursor: default;
}
#tiny-comment .comment-content{
    margin: 12px;
}
#tiny-comment .reply-btn{
    font-size: 12px;
    padding: 0;
    border: none;
    cursor: pointer;
    color: #F56C6C;
    outline: none;
}
#tiny-comment .reply-btn:active{
    border: none;
    color: rgb(214, 0, 0);
}
#tiny-comment .reply{
    margin: 5px 0 5px 20px;
    padding: 5px;
    border-top: 1px solid #DCDFE6;
    font-size: 13px;
}
#tiny-comment .reply .comment-content{
    margin: 5px;
}
```



```html
<div id="tiny-comment">
<div class="tiny-container">
    <div class="input-wrapper">
        <input type="text" placeholder="昵称">
        <input type="text" placeholder="邮箱" title="邮箱不会公布，有新的回复时接收邮件">
        <div>
            <textarea id="tiny-comment-textarea" placeholder="你的留言..."  rows="5"></textarea>
        </div>
        <div style="height:35px;"> <button style="float:right;">回复</button></div>
    </div>
    <div class="comment-count"><span style="font-weight: bold">2</span> 评论</div>
    <div class="segment">
        <span class="nickname">匿名用户</span>
        <span class="secondary">13秒前</span>
        <button class="reply-btn" style="float: right">回复</button>
        <div class="comment-content">
            这是一条评论
        </div>
    </div>
    <div class="segment">
        <span class="nickname">匿名用户</span>
        <span class="secondary">13秒前</span>
        <button class="reply-btn" style="float: right">回复</button>
        <div class="comment-content">
            这是一条评论
        </div>
    </div>
    <div class="segment">
        <span class="nickname">匿名用户</span>
        <span class="secondary">13秒前</span>
        <button class="reply-btn" style="float: right">回复</button>
        <div class="comment-content">
            这是一条评论
        </div>
        <div class="reply">
            <span class="nickname">匿名用户</span>
            <span class="secondary">13秒前</span>
            <button class="reply-btn" style="float: right">回复</button>
            <div class="comment-content">这是一条回复</div>
        </div>
        <div class="reply">
            <span class="nickname">匿名用户</span>
            <span class="secondary">13秒前</span>
            <button class="reply-btn" style="float: right">回复</button>
            <div class="comment-content">这是一条回复</div>
        </div>
        <div class="reply">
            <span class="nickname">匿名用户</span>
            <span class="secondary">13秒前</span>
            <button class="reply-btn" style="float: right">回复</button>
            <div class="comment-content">这是一条回复</div>
        </div>
    </div>
    <div class="load-more" style="text-align: center">
        <button>加载更多...</button>
    </div>
</div>
<div class="tiny-footer">
    Powerd by <a href="javascript:void(0)">lzlz000</a>
</div>
</div>
```

接下来，我们考虑如何让前端能简单的引入这个节点呢？