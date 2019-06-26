---
title: mysql优化问题（二）执行计划
date: 2019-06-26 23:46:31
tags: [mysql]
typora-root-url: ../
---

**执行计划** 使用EXPLAIN关键字可以模拟优化器执行SQL查询语句，从而知道MySQL是如何处理你的SQL语句的。分析你的查询语句或是表结构的性能瓶颈

```mysql
Explain [SQL语句]
```

执行 Explain 语句得到的结果将包含以下列



