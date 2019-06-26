---
title: mysql的Ferderated引擎
date: 2019-06-25 01:19:14
tags: [mysql]
typora-root-url: ../
---

**Ferderated** 引擎提供了以本地一张独立的表访问远程MySQL服务器上表的方法。本地不存储数据，数据全部放到远程服务器上，但是本地需要保存表结构和远程服务器的连接信息。

首先Ferderated引擎在mysql中是默认关闭的，可以使用 **show engines** 命令查看是否开启了该引擎：

![](/images/1561399282036.png)

可以发现 Ferderated 的 support为 NO

我们需要在mysql配置文件中加入 federated

```
[mysqld]
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock
federated #加入这一行
...
...
```

重启服务，会发现Ferderated 已经开启

![](/images/1561399506237.png)



```mysql
# 在任意mysql服务器上创建一个表，作为Ferderated的目标远程服务器，该服务器不需要开启Ferderated引擎
# 本例中，表创建在127.0.0.1:3307/mysql-test
CREATE TABLE remote_fed (
	id INT auto_increment NOT NULL,
	c1 VARCHAR ( 10 ) NOT NULL DEFAULT '',
	c2 CHAR ( 10 ) NOT NULL DEFAULT '',
PRIMARY KEY ( id ) 
) ENGINE = INNODB

# 在开启了Ferderated引擎创建表
CREATE TABLE local_fed (
	id INT auto_increment NOT NULL,
	c1 VARCHAR ( 10 ) NOT NULL DEFAULT '',
	c2 CHAR ( 10 ) NOT NULL DEFAULT '',
PRIMARY KEY ( id ) 
) ENGINE=federated CONNECTION ='mysql://root:123456@127.0.0.1:3307/mysql-test/remote_fed'
```

一些注意事项

1. 对本地虚拟表的结构修改，并不会修改远程表的结构，但是改变自身的表结构会出现意想不到的错误
2. truncate 命令，会清除远程表数据 
3.  drop命令只会删除虚拟表，并不会删除远程表
