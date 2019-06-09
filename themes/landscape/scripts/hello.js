hexo.extend.helper.register('js', function(path){
    // console.log(path)
    if (path=='js/script')
        return '<script src="/js/script.js"></script><script type="text/javascript" src="/comment.js"></script>';
});