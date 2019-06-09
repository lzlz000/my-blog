---
title: java正则表达式-环视、反向引用、贪婪
date: 2019-03-01 13:29:42
tags: [java]
---

### 环视

#### 什么是环视

 环视顾名思义就是从四周看。正则表达式一向都是从左向右工作的，但是环视也能从右向左工作。最典型的列子就是给你一个数字如12345678，需要你改成12，345，678这种格式。如果按照我们的思维来，应该是会从右边开始划分吧，每三个数字加一个逗号。环视就能按照我们的思维去解决这样的问题。这里要注意的是环视不匹配任何字符，只是匹配位置而已。作用和^,&相似。环视又分为顺序环视和逆序环视。也就是从左到右工作和从右到左的区别.顺序环视在正则中用(?=)表示，包含括号。逆序用(?<=)

#### 语法

**(?=Expression)**  顺序肯定环视，表示所在位置右侧能够匹配Expression
**(?!Expression)**   顺序否定环视，表示所在位置右侧不能匹配Expression
**(?<=Expression)** 逆序肯定环视，表示所在位置左侧能够匹配Expression
**(?<!Expression)**  逆序否定环视，表示所在位置左侧不能匹配Expression

**java中的使用方法**

```java
// 匹配 前缀为 test的字母
String s = "123testabc abc 123testLttt";
Pattern pattern = Pattern.compile("(?<=test)\\w+");
Matcher matcher = pattern.matcher(s);
while (matcher.find()) {
	System.out.println(matcher.group());
}
```

### 反向引用

按照()子表达式划分成若干组；每出现一对()就是一个捕获组；引擎会对捕获组进行编号，编号规则是左括号(从左到右出现的顺序，从1开始编号。

**例：**

**\1** 代表对第一次匹配 **(\\w+)** 的引用

在使用了括号来包裹表达式后，matcher.groupCount()的值>0，可以通过其获取捕获的值

```java
String s = "123testabc abc 123testLttt";
Pattern pattern = Pattern.compile("(\\w+) \\1");
Matcher matcher = pattern.matcher(s);
System.out.println(matcher.groupCount());
while (matcher.find()) {
    System.out.println(matcher.group(0));
    System.out.println(matcher.group(1));
}
```

### 贪婪

java中正则默认为贪婪模式，即尽可能多的匹配多的字符， “趋向于最大长度匹配”

```java
String s = "<div>hello</div><div>world</div>";
Pattern pattern = Pattern.compile("<div>.*</div>");
Matcher matcher = pattern.matcher(s);
while (matcher.find()) {
    System.out.println(matcher.group());
}
```

结果 

```
<div>hello</div><div>world</div>
```

**非贪婪**

使用方法 在需要匹配的串后面加上 **?**

```java
String s = "<div>hello</div><div>world</div>";
Pattern pattern = Pattern.compile("<div>.*?</div>");
Matcher matcher = pattern.matcher(s);
while (matcher.find()) {
    System.out.println(matcher.group());
}
```

结果

```
<div>hello</div>
<div>world</div>
```