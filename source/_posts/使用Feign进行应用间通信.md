---
title:  使用Feign进行应用间通信
date: 2018-05-23 00:00:00
tags: [java, spring-cloud]
typora-root-url: ../
---

## 使用Feign进行应用间通信

##### 添加maven依赖
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-feign</artifactId>
    <version>2.0.0.M2</version>
</dependency>
```
**坑** 
我是用了 **Spring Boot 2.0.2.RELEASE**  以及其对应的spring-cloud版本 **Spring-Cloud Finchley.RC2** 即2.0.0.RC2
按理说，spring-cloud-starter-feign 应该不再需要指定版本，然而maven的中央仓库中甚至都没有2.0版本的 Feign。spring官方仓库也没有对应版本，因此不指定版本就无法导入依赖了，但是好歹有可兼容的2.0.x版本，所以指定版本 **2.0.0.M2** 

大概是因为Spring Boot 2.0刚发布没几个月，对应的版本还没有发布吧？作为一个菜鸟，就不该作死用2.0版本学习spring cloud，一堆麻烦:(

![maven中央仓库](https://upload-images.jianshu.io/upload_images/3867641-30328eaf1c0a8a05.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![spring官方仓库](https://upload-images.jianshu.io/upload_images/3867641-d9745dbf1964ad6a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##### 使用Feign
Feign 的使用非常简单
新建类：
```java
package lzlz.demo.springcloud.consumer.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

// 其实不需要加@Component注解，只是idea无法识别，在注入的地方提示错误
// 虽然不影响编译运行，但是看着不舒服，不在意的可以忽略
@Component  
@FeignClient(name = "product") //对应的应用名
public interface ProductClient {
    @GetMapping("/echo")
    String productMsg();
}
```
在需要使用的地方注入此对象，调用对应方法即可：
```String resp = productClient.productMsg();```

在FeignClient中 可以完全像Controller那样使用各种 ```@RequestMapping``` 注解，用于类和方法上。
```
@Component
@FeignClient(name = "product")
@RequestMapping("test")
public interface ProductClient {
    @GetMapping("/echo")
    String productMsg();

    @PostMapping("/echo")
    String productMsg1();
}
```
使用Feign，我们就如同调用本地方法一样使用rest远程调用，体验还是不错滴。
