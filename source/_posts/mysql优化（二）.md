---
title: mysql优化问题（二）执行计划
date: 2018-9-27 23:46:31
tags: [mysql]
typora-root-url: ../
---

## **执行计划** 

使用EXPLAIN关键字可以模拟优化器执行SQL查询语句，从而知道MySQL是如何处理你的SQL语句的。分析你的查询语句或是表结构的性能瓶颈

```mysql
Explain [SQL语句]
```

### 详解

执行 Explain 语句得到的结果将包含以下列

![](/images/1561914397839.png)

#### ID列

id列表明了语句间的执行顺序，顺序判断规则如下

- id相同：执行顺序由上至下
- id不同：如果是子查询，id的序号会递增，id值越大优先级越高，越先被执行

举个栗子：

这是一个复杂的关联查询语句的执行计划内容，其查询顺序按照1->2->3->4的顺序执行。

![](/images/1561915413315.png)

#### select_type列

![](/images/clip_image002.jpg)

#### table列
当前查询的表，没有可解释的地方

#### Type列

访问类型，一个重要的参数指标，结果值从最好到最坏依次是：
system > const > eq_ref > ref > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > range > index > ALL 

常见的有 system>const>eq_ref>ref>range>index>ALL 这几种类型