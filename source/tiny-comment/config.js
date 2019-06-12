/**
 * 获取路径的过滤器，返回一个
 * @param {*} host 
 * @param {*} path 
 */
let tinyCommentConfig = {
  filter : (host, path)=> {
    let filters = [
      {
        matcher: "^/?\\d{4}/\\d{2}/\\d{2}/[^/]+/?$",  // /2019/01/01/标题标题/
        selector: ".article-inner",
        type: "sibling" // 兄弟节点，在该节点后插入插件节点
  
      },
      {
        matcher: "^/?$", // 根目录
        selector: "#sidebar",
        type: "child" // 把插件节点添加到目标节点的末尾
      }
    ];
    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      if (new RegExp(filter.matcher).test(path)){
        return filter;
      }
    }
  }
}