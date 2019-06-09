---
title: nginx配置反向代理
date: 2019-06-09 04:23:49
tags: nginx
typora-root-url: ../
---

### 安装nginx

```
yum install -y nginx
```

启动Nginx并设置开机自动运行 ：

```shell
systemctl start nginx.service
systemctl enable nginx.service
```

默认端口80 
浏览器输入 服务器地址 即可看到 nginx的首页
yum 安装的 nginx 配置路径在 **/etc/nginx/nginx.conf** ,可以修改端口号再重启

### 域名转发

在本机上，我事先装了一个 nexus 私服，端口是8081，以此为例子, 我们通过域名转发把 nexus.xx.xx 转发到 xx.xx:8081.

首先，要有一个域名。

###### 配置dns 解析

然后新建一个DNS解析配置，把子域名 nexus.xx.xx  解析到服务器IP地址，稍等片刻，等待DNS服务器更新解析，我自己的域名使用了 https://www.dns.com/ 提供的 DNS服务器
![image.png](/images/12404.png)

浏览器键入 nexus.xx.xx，进入了nginx的首页。此步骤完成

###### 配置nginx域名转发

在 nginx.conf的 http 模块中 加入一个 server 

```shell
 server
    {
        listen 80;
        server_name nexus.xx.xx;
        location / {
            proxy_redirect off;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_pass http://127.0.0.1:8081; # 转发地址 可以是 baidu.com 或者任何地址
        }
        access_log logs/nexus.log;
    }
```

保存并重启服务器 （我尝试使用nginx -s reload 重新加载配置文件无效，只能重启）

```shell
nginx -s quit
nginx
```

浏览器键入 nexus.xx.xx 咦 404? 没错啦，这是nexus的404 nexus的web 首页在 nexus.xx.xx/nexus 

END



