---
title: 自制hexo评论插件（一）
date: 2019-06-13 01:13:00
tags: []
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



---

[![](https://img.shields.io/badge/lzlz000-%E4%B8%AA%E4%BA%BA%E7%A9%BA%E9%97%B4-brightgreen.svg?style=flat&logo=data:image/gif;base64,R0lGODlhPAA8APf/AP/TAHsbG6ZJAGsBAcertKL75+jsZ93teMTk+o5BRruVm+72/3ILC7OGjbS7zIIqK4QyNZDDtKFbWqZuc//sN/v//8+7xN7X4eDc5JFJTa59gsHtpL+cpJx9iZ1dYpnu431xae/4/5Jpc6H965RNUIqonPH8/7rJ3MOlq/bsTm4KC9bI0ZpZXcPh9opTW6NpbKl0eqVkZOzy/nkeH8Da79jM0nUaHJNDQ3wgIZ2Cj6mcq7f1vbaLkaSToYItL4wpAHUQEIs0M+3z+ptTVOnt9enu+JFjbNO+yMHc8e/3/N3V3tXGz4E8Qoy+t5ZxfK2ru9rR2ujr9cTj+GUAAMPi+Obm7bW+0P/aAMmxuaGLmLK1xrCxwXwuMvL8/7nG2Y09Qv/WAJZPVMh6AMLg9cDb8MDY7bLuvplWWp9gZevx/IVHTo4+PrfD1r/Y7O71+nYVFXgVFdC9xW4VFqORnsy2vn4lKHY1M9rP2YY2ObmSmHMWG8KhqHwzOeLg65FGSHspLXEOD7yYnolNVI46OY5cZWsHCOzx/evw+ubn8dbJztPDzYs7Pqx4fcWoros5OYk2OHAQEoJDVnETFHYTE3gXGO30//T///X///P//34nM4VLX77W6r/X68Lf9O31//H7//b//8Pi96pwd/L+/+zy/fD6//D7/8DZ7u/5//L//8Le8/P+/8Hd8r7U6L/X7L/W6m8HB4ZNYuz0/7vN4IMnJ9fK1I04N+akANLtiv/sMNPEzMXm+6aZp6ecq69/hKhra5hMS5dUWKL/9Ojq76H349bH0KnvzKLt1af32I2zpciAAH+AduGdAMTi97eQlpVJSIcvL28kIl8AAKdxd2sNFufp77+fpbrusu32/6Jnae31/LT1w5335rK3yO30/qFGAII5Prbttezw9qqgr6ynuMHe8sLd8ngjJ+jq8uns8aD45Ofo88uzvMu1vX84PnY4NnBHQHwxNrvtrYg9P3gSDI07PdjN1nYOBbGzxM65wNPEyfH6/6NfXuzz/r7V6QAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4QUY2MjJFMDk2QTgxMUU5QjE4QTlEMjI1ODQ3MTdFQSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo4QUY2MjJFMTk2QTgxMUU5QjE4QTlEMjI1ODQ3MTdFQSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhBRjYyMkRFOTZBODExRTlCMThBOUQyMjU4NDcxN0VBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjhBRjYyMkRGOTZBODExRTlCMThBOUQyMjU4NDcxN0VBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEg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)](https://lzlz000.github.io)