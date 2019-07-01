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

### 开启慢查询

默认情况下，慢查询日志是关闭的，要使用慢查询日志功能，首先要开启慢查询日志功能。

**通过下面命令查看下的配置：**

show VARIABLES like '%配置变量%'

**慢查询相关配置信息：**

- slow_query_log 启动停止技术慢查询日志
- slow_query_log_file 指定慢查询日志得存储路径及文件（默认和数据文件放一起）
- long_query_time 指定记录慢查询日志SQL执行时间得伐值（单位：秒，默认10秒）
- log_queries_not_using_indexes  是否记录未使用索引的SQL
- log_output 日志存放的地方【TABLE】【FILE】【FILE,TABLE】

```
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
注意:
- 当前开启的参数在mysql重启后都会无效，如果想要永久开启慢查询并配置阈值，请在配置文件中加上 slow_query_log=1，long_query_time=你想设置的时间
- **long_query_time** 参数存在session属性和global属性 设置完之后查询 ：

  SHOW VARIABLES LIKE 'long_query_time' 

  可能会发生不生效的情况，可以重启会话，或者  

  SHOW GLOBAL VARIABLES LIKE 'long_query_time';

### 慢查询分析

上文中的 slow_query_log_file 路径下保存了 慢查询日志文件。在本人所装的mysql5.7版本中，一条慢查询日志包括以下内容：

```
# Time: 2019-06-30T16:08:45.138780Z
# User@Host: root[root] @  [119.98.146.86]  Id:     2
# Query_time: 22.573668  Lock_time: 0.000150 Rows_sent: 28922  Rows_examined: 28922
SET timestamp=1561910925;
SELECT * FROM class_t t1 WHERE NAME_ IS NOT NULL;

```

- 这里有个小问题，**set global long_query_time** "不生效"的问题，long_query_time 这个属性是有global值和session值的，你可以关闭并重启会话，或者使用 SHOW GLOBAL VARIABLES LIKE 'long_query_time' 查询当前值

| 行数 | 内容                                                         |
| ---- | ------------------------------------------------------------ |
| 1    | 时间                                                         |
| 2    | 用户名 、用户的IP信息、线程ID号                              |
| 3    | 执行花费的时间【单位：毫秒】、执行获得锁的时间、获得的结果行数、扫描的数据行数 |
| 4    | SQL执行的具体时间戳(与第一行时间一致，注意mysql时间戳和其他语言中的毫秒时间戳的差别) |
| 5    | 具体的SQL语句                                                |

不同版本的mysql，行数和内容有些许差别，但区别不大

#### mysqldumpslow

mysql自带的慢查询分析工具，简单尝试下功能

```
mysqldumpslow --help

  --verbose    verbose
  --debug      debug
  --help       write this text to standard output

  -v           verbose
  -d           debug
  # 排序：
  c:总次数
  t:总时间
  l:锁的时间
  r:总数据行
  at,al,ar  :t,l,r平均数  【例如：at = 总时间/总次数】
  -s ORDER     what to sort by (al, at, ar, c, l, r, t), 'at' is default
                al: average lock time
                ar: average rows sent
                at: average query time
                 c: count
                 l: lock time
                 r: rows sent
                 t: query time  
  -r           reverse the sort order (largest last instead of first)
  -t NUM       just show the top n queries
  -a           don't abstract all numbers to N and strings to 'S'
  -n NUM       abstract numbers with at least n digits within names
  -g PATTERN   grep: only consider stmts that include this string
  -h HOSTNAME  hostname of db server for *-slow.log filename (can be wildcard),
               default is '*', i.e. match all
  -i NAME      name of server instance (if using mysql.server startup script)
  -l           don't subtract lock time from total time
```



一些例子：

```
mysqldumpslow -s r -t 10 /var/lib/mysql/21502193a9d9-slow.log
得到返回记录集最多的10个查询。

mysqldumpslow -s t -t 10 -g “left join” /var/lib/mysql/21502193a9d9-slow.log
得到按照时间排序的前10条里面含有左连接的查询语句。

mysqldumpslow -a -s t -t 2 /var/lib/mysql/21502193a9d9-slow.log
-a 参数，说明不合并类似的SQL语句，显示具体的SQL语句中的数字和字符串。

```



值得注意的是，若不加-a参数，mysql是会默认合并类似的语句，例如：

```mysql
SELECT * FROM teaching_class_t t1 WHERE id_>10000  LIMIT 0,20000
```

mysqldumpslow中会得到的结果,并且把类似的合并为同一个Count：

```
Count: 1  Time=16.81s (16s)  Lock=0.00s (0s)  Rows=20000.0 (20000), root[root]@[119.98.146.86]
  SELECT * FROM teaching_class_t t1 WHERE id_>N  LIMIT N,N
```

#### pt_query_digest

一个更加强大的mysql慢查询分析工具，安装:

```
yum -y  install 'perl(Data::Dumper)';
yum -y install perl-Digest-MD5
yum -y install perl-DBI
yum -y install perl-DBD-MySQL
```

##### 语法及重要选项

由于安装出现问题，一直装不上没有实际尝试，我先记录下来以备以后使用，来源于 https://www.cnblogs.com/luyucheng/p/6265873.html

```
pt-query-digest [OPTIONS] [FILES] [DSN]

--create-review-table 当使用--review参数把分析结果输出到表中时，如果没有表就自动创建。
--create-history-table 当使用--history参数把分析结果输出到表中时，如果没有表就自动创建。
--filter 对输入的慢查询按指定的字符串进行匹配过滤后再进行分析
--limit 限制输出结果百分比或数量，默认值是20,即将最慢的20条语句输出，如果是50%则按总响应时间占比从大到小排序，输出到总和达到50%位置截止。
--host mysql服务器地址
--user mysql用户名
--password mysql用户密码
--history 将分析结果保存到表中，分析结果比较详细，下次再使用--history时，如果存在相同的语句，且查询所在的时间区间和历史表中的不同，则会记录到数据表中，可以通过查询同一CHECKSUM来比较某类型查询的历史变化。
--review 将分析结果保存到表中，这个分析只是对查询条件进行参数化，一个类型的查询一条记录，比较简单。当下次使用--review时，如果存在相同的语句分析，就不会记录到数据表中。
--output 分析结果输出类型，值可以是report(标准分析报告)、slowlog(Mysql slow log)、json、json-anon，一般使用report，以便于阅读。
--since 从什么时间开始分析，值为字符串，可以是指定的某个”yyyy-mm-dd [hh:mm:ss]”格式的时间点，也可以是简单的一个时间值：s(秒)、h(小时)、m(分钟)、d(天)，如12h就表示从12小时前开始统计。
--until 截止时间，配合—since可以分析一段时间内的慢查询

```

**分析pt-query-digest输出结果**

第一部分：总体统计结果
Overall：总共有多少条查询
Time range：查询执行的时间范围
unique：唯一查询数量，即对查询条件进行参数化以后，总共有多少个不同的查询
total：总计   min：最小   max：最大  avg：平均
95%：把所有值从小到大排列，位置位于95%的那个数，这个数一般最具有参考价值
median：中位数，把所有值从小到大排列，位置位于中间那个数

```
# 该工具执行日志分析的用户时间，系统时间，物理内存占用大小，虚拟内存占用大小
# 340ms user time, 140ms system time, 23.99M rss, 203.11M vsz
# 工具执行时间
# Current date: Fri Nov 25 02:37:18 2016
# 运行分析工具的主机名
# Hostname: localhost.localdomain
# 被分析的文件名
# Files: slow.log
# 语句总数量，唯一的语句数量，QPS，并发数
# Overall: 2 total, 2 unique, 0.01 QPS, 0.01x concurrency ________________
# 日志记录的时间范围
# Time range: 2016-11-22 06:06:18 to 06:11:40
# 属性               总计      最小    最大    平均    95%  标准    中等
# Attribute          total     min     max     avg     95%  stddev  median
# ============     ======= ======= ======= ======= ======= ======= =======
# 语句执行时间
# Exec time             3s   640ms      2s      1s      2s   999ms      1s
# 锁占用时间
# Lock time            1ms       0     1ms   723us     1ms     1ms   723us
# 发送到客户端的行数
# Rows sent              5       1       4    2.50       4    2.12    2.50
# select语句扫描行数
# Rows examine     186.17k       0 186.17k  93.09k 186.17k 131.64k  93.09k
# 查询的字符数
# Query size           455      15     440  227.50     440  300.52  227.50
```

第二部分：查询分组统计结果
Rank：所有语句的排名，默认按查询时间降序排列，通过--order-by指定
Query ID：语句的ID，（去掉多余空格和文本字符，计算hash值）
Response：总的响应时间
time：该查询在本次分析中总的时间占比
calls：执行次数，即本次分析总共有多少条这种类型的查询语句
R/Call：平均每次执行的响应时间
V/M：响应时间Variance-to-mean的比率
Item：查询对象

```
# Profile
# Rank Query ID           Response time Calls R/Call V/M   Item
# ==== ================== ============= ===== ====== ===== ===============
#    1 0xF9A57DD5A41825CA  2.0529 76.2%     1 2.0529  0.00 SELECT
#    2 0x4194D8F83F4F9365  0.6401 23.8%     1 0.6401  0.00 SELECT wx_member_base
```

第三部分：每一种查询的详细统计结果
由下面查询的详细统计结果，最上面的表格列出了执行次数、最大、最小、平均、95%等各项目的统计。
ID：查询的ID号，和上图的Query ID对应
Databases：数据库名
Users：各个用户执行的次数（占比）
Query_time distribution ：查询时间分布, 长短体现区间占比，本例中1s-10s之间查询数量是10s以上的两倍。
Tables：查询中涉及到的表
Explain：SQL语句

```
# Query 1: 0 QPS, 0x concurrency, ID 0xF9A57DD5A41825CA at byte 802 ______
# This item is included in the report because it matches --limit.
# Scores: V/M = 0.00
# Time range: all events occurred at 2016-11-22 06:11:40
# Attribute    pct   total     min     max     avg     95%  stddev  median
# ============ === ======= ======= ======= ======= ======= ======= =======
# Count         50       1
# Exec time     76      2s      2s      2s      2s      2s       0      2s
# Lock time      0       0       0       0       0       0       0       0
# Rows sent     20       1       1       1       1       1       0       1
# Rows examine   0       0       0       0       0       0       0       0
# Query size     3      15      15      15      15      15       0      15
# String:
# Databases    test
# Hosts        192.168.8.1
# Users        mysql
# Query_time distribution
#   1us
#  10us
# 100us
#   1ms
#  10ms
# 100ms
#    1s  ################################################################
#  10s+
# EXPLAIN /*!50100 PARTITIONS*/
select sleep(2)\G
```

##### 用法示例

1.直接分析慢查询文件:

```
pt-query-digest  slow.log > slow_report.log
```

2.分析最近12小时内的查询：

```
pt-query-digest  --since=12h  slow.log > slow_report2.log
```

3.分析指定时间范围内的查询：

```
pt-query-digest slow.log --since '2017-01-07 09:30:00' --until '2017-01-07 10:00:00'> > slow_report3.log
```

4.分析指含有select语句的慢查询

```
pt-query-digest --filter '$event->{fingerprint} =~ m/^select/i' slow.log> slow_report4.log
```

5.针对某个用户的慢查询

```
pt-query-digest --filter '($event->{user} || "") =~ m/^root/i' slow.log> slow_report5.log
```

6.查询所有所有的全表扫描或full join的慢查询

```
pt-query-digest --filter '(($event->{Full_scan} || "") eq "yes") ||(($event->{Full_join} || "") eq "yes")' slow.log> slow_report6.log
```

7.把查询保存到query_review表

```
pt-query-digest --user=root –password=abc123 --review  h=localhost,D=test,t=query_review--create-review-table  slow.log
```

8.把查询保存到query_history表

```
pt-query-digest  --user=root –password=abc123 --review  h=localhost,D=test,t=query_history--create-review-table  slow.log_0001
pt-query-digest  --user=root –password=abc123 --review  h=localhost,D=test,t=query_history--create-review-table  slow.log_0002
```

9.通过tcpdump抓取mysql的tcp协议数据，然后再分析

```
tcpdump -s 65535 -x -nn -q -tttt -i any -c 1000 port 3306 > mysql.tcp.txt
pt-query-digest --type tcpdump mysql.tcp.txt> slow_report9.log
```

10.分析binlog

```
mysqlbinlog mysql-bin.000093 > mysql-bin000093.sql
pt-query-digest  --type=binlog  mysql-bin000093.sql > slow_report10.log
```

11.分析general log

```
pt-query-digest  --type=genlog  localhost.log > slow_report11.log
```
