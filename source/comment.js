console.log(location.href);
(function(path){
    // properties后续做成插件让它根据配置文件自动生成
    var properties = {
        urlFilter: [
            {
                matcher:"^/?\\d{4}/\\d{2}/\\d{2}/[^/]+/?$",
                className: "article-inner"
            }
        ]
    };
    // 获取相对路径
    function getUrlRelativePath(){
　　　　var url = path;
　　　　var arrUrl = url.split("//");

　　　　var start = arrUrl[1].indexOf("/");
　　　　var relUrl = arrUrl[1].substring(start);//stop省略，截取从start开始到结尾的所有字符

　　　　if(relUrl.indexOf("?") != -1){
　　　　　　relUrl = relUrl.split("?")[0];
　　　　}
　　　　return relUrl;
　　}
    var relativePath = getUrlRelativePath();
    for(var i=0; i< properties.urlFilter.length; i++){
        var filter = properties.urlFilter[i];
        if(new RegExp(filter.matcher).test(relativePath)){
            var parentElem = document.getElementsByClassName(filter.className)[0];
            if (!parentElem){
                console.error("不存在 class=\"+filter.className+\"的节点")
                return;
            }
            var commentElem = document.createElement("div");
            commentElem.innerHTML="自制评论插件...施工中"
            commentElem.style["text-align"]="center";
            commentElem.style["padding"]="5px";
            parentElem.appendChild(commentElem);
            break;
        }
    }

})(location.href);
