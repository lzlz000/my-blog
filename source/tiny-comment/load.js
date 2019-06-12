(function () {
    const typeAppend ={
        // 在指定节点后插入节点
        "sibling": (target, created)=>{ 
            let parent = target.parentNode;
            if (parent.lastChild == target) {
                parent.appendChild(created);
            } else {
                parent.insertBefore(created, target.nextSibling)
            }
        },
        // 在指定节点中添加该节点
        "child": (target, created)=>{
            target.appendChild(created);
        },
    }
    function initTinyComment(node,type) {
        content = `
            <div id="tiny-comment">
            <i>评论插件开发中,以下只是个样式 O(∩_∩)O</i>
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
            `;
        let newElement = document.createElement('div')
        newElement.innerHTML = content;
        typeAppend[type](node,newElement);
    }
    // 获取相对路径
    function getUrlRelativePath() {
        let url = window.location.href;
        let arrUrl = url.split("//");

        let start = arrUrl[1].indexOf("/");
        let relUrl = arrUrl[1].substring(start);//stop省略，截取从start开始到结尾的所有字符

        if (relUrl.indexOf("?") != -1) {
            relUrl = relUrl.split("?")[0];
        }
        return relUrl;
    }
    // 获取域名
    function getHost() {
        return window.location.host;
    }
    
    function loadScript(url, loadCallback) {
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        document.body.appendChild(script);
        //IE 不支持IE
        // if (script.readyState) {
        //     script.onreadystatechange = function () {
        //         if (script.readyState == "loaded" || script.readyState == "complete") {
        //             script.onreadystatechange = null;
        //             if (loadCallback)
        //                 loadCallback();
        //         }
        //     }
        // } else {
        //非IE
        script.onload = function () {
            if (loadCallback)
                loadCallback();
        }
        // }

    }
    function loadCss(url) {
        let cssElem = document.createElement("link");
        cssElem.href = url;
        cssElem.rel = "stylesheet";
        document.head.appendChild(cssElem);
    }
    
    let _path = "/tiny-comment";

    loadCss(_path + "/style.css");
    loadScript(_path + "/config.js",()=>{
        let filter = tinyCommentConfig.filter(getHost(),getUrlRelativePath());
        if (filter){
            const targetNode = document.querySelector(filter.selector);
            if(!targetNode){
                throw "找不到选择器 "+filter.selector+" 对应的节点";
            }
            initTinyComment(targetNode,filter.type);
            tinyCommentConfig = undefined;
        }
    })
})();