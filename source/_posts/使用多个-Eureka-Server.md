---
title:  使用多个 Eureka
date: 2018-05-21 00:00:00
tags: [java, spring-cloud]
typora-root-url: ../
---

## 使用多个 Eureka

通过不同的配置文件 application.yml 启动多个实例来实现

```yml
#Server 1
server:
  port: 8761
eureka:
  server:
    enable-self-preservation: false 
  client:
    service-url:
      defaultZone: http://localhost:8762/eureka/ #两个server相互注册
    register-with-eureka: false 
spring:
  application:
    name: eureka-demo
```
```yml
#Server 2
server:
  port: 8762
eureka:
  server:
    enable-self-preservation: false 
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/ #两个server相互注册
    register-with-eureka: false 
spring:
  application:
    name: eureka-demo
```
这样 在 idea 或者 Eclipse 中我们需要启动一个实例，然后修改配置再启动一个实例，有点乱。
可以把 application.yml 定义为下面的形式：
```yml 
# 无参数启动
spring:
  application:
    name: eureka-demo
server:
  port: 8761
eureka:
  server:
    enable-self-preservation: false #防止由于eureka的机制导致 client 被错误显示在线 在开发环境使用
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
---
# 启动参数 --spring.profiles.active=server1
spring:
  profiles: server1
server:
  port: 8761
eureka:
  client:
​    service-url:
      defaultZone: http://localhost:8762/eureka/
---
# 启动参数 --spring.profiles.active=server2
spring:
  profiles: server2
server:
  port: 8762
eureka:
  client:
​    service-url:
​      defaultZone: http://localhost:8761/eureka/
```
运行方式
1. 在idea中运行
新建2个运行配置 server1 server2，按图片所示分别添加参数
​```--spring.profiles.active=server1```
​```--spring.profiles.active=server2```
![](https://upload-images.jianshu.io/upload_images/3867641-311c2582738563e3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
1. 打包运行
启动两个cmd窗口，切换到项目目录下，分别运行
​```java -jar target/eureka-0.0.1-SNAPSHOT.jar --spring.profiles.active=server1```
​```java -jar target/eureka-0.0.1-SNAPSHOT.jar --spring.profiles.active=server2```

我们同时运行刚才创建的 Client，注意我们只把 Client 注册到了```http://localhost:8761/eureka/``` 也就是server1中
此时，localhost:8761,localhost:8762的Eureka Server 均显示如下，即只在server1中注册的Client也被注册到了server2![](https://upload-images.jianshu.io/upload_images/3867641-b9e6e0ebca02eea4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

虽然，Client被自动注册到了server2，但是如果server1不启动，server2无法得到Client的注册（Client在server2注册后，server1变成不可用并不影响）。所以我们在Client中做修改,配置2个defaultZone
​```yml
eureka:
  client:
​    service-url:
​      defaultZone: http://localhost:8761/eureka/,http://localhost:8762/eureka/
```
当有3个Eureka Server时，以此类推，三个Server相互配置另外2个地址，Client 配置 3个地址

```