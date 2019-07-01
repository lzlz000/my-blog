---
title: mysql优化问题（一）慢查询
date: 2019-06-25 20:24:03
tags: [mysql]
typora-root-url: ../
---

[lzlz000的个人主页](https://lzlz000.github.io)

总结一下最近学习整理的mysql优化问题 😀

我感觉mysql优化特别像看病：通过慢查询来定位症状，执行计划则是检测项目-CT,X光,验血...，sql优化就是治疗手段。当然好的业务设计就像是良好的生活习惯，能减少疾病的发生。

## 慢查询

即慢查询日志，是指mysql记录所有执行超过long_query_time参数设定的时间阈值的SQL语句的日志。该日志能为SQL语句的优化带来很好的帮助

默认情况下，慢查询日志是关闭的，要使用慢查询日志功能，首先要开启慢查询日志功能。

**通过下面命令查看下的配置：**

show VARIABLES like '%配置变量%'

**慢查询相关配置信息：**

- slow_query_log 启动停止技术慢查询日志
- slow_query_log_file 指定慢查询日志得存储路径及文件（默认和数据文件放一起）
- long_query_time 指定记录慢查询日志SQL执行时间得伐值（单位：秒，默认10秒）
- log_queries_not_using_indexes  是否记录未使用索引的SQL
- log_output 日志存放的地方【TABLE】【FILE】【FILE,TABLE】

```TEXT
-- 慢查询没有开启
mysql> SHOW VARIABLES LIKE '%slow_query_log%';
+---------------------+--------------------------------------+
| Variable_name       | Value                                |
+---------------------+--------------------------------------+
| slow_query_log      | OFF                                  |
| slow_query_log_file | /var/lib/mysql/21502193a9d9-slow.log |
+---------------------+--------------------------------------+

-- 开启慢查询功能
mysql> SET GLOBAL  slow_query_log=true;
Query OK, 0 rows affected (0.09 sec)

-- 默认10秒，这里为了演示方便设置为0
mysql> set global long_query_time=0;   
Query OK, 0 rows affected (0.05 sec)

```

- 这里有个小问题，**set global long_query_time** "不生效"的问题，long_query_time 这个属性是有global值和session值的，你可以关闭并重启会话，或者使用 SHOW GLOBAL VARIABLES LIKE 'long_query_time' 查询当前值



