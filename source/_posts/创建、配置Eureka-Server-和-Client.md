---
title:  创建配置Eureka
date: 2018-05-20 00:00:00
tags: [java, spring-cloud]
typora-root-url: ../
---

开发环境 Windows10、 IDEA 2018.1.3 ，Spring Boot 版本 2.0.2.RELEASE
##### 通过 idea 创建Eureka server项目

New Project-> Spring Initalizr
next 修改group 和 artifact
next 我使用的是2.0.2版本的SpringBoot 注意在选择依赖时 勾选 Web 和 Eureka Server
![](https://upload-images.jianshu.io/upload_images/3867641-9a7c8bf374c7217f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
一路确定 完成创建。

##### 配置启动项目
首先就有一个坑，在墙内我们喜欢用阿里云的maven仓库，
与 _SpringBoot_  ```2.0.2.RELEASE```版本对应的 _Spring Cloud_ 版本是```Finchley.RC2```，通过_Spring Initalizr_创建的项目会自动选择合适的版本。
但是阿里云仓库里似乎没有这个版本的 _Spring Cloud_ ，导致 _Eureka_ 相关的包都找不到。

哎，我也是搞了好久才发现是这个问题，以前都以为阿里云maven仓库应该是完整的。后来我发现这个锅也不能让阿里仓库背，maven中央仓库的版本甚至比阿里仓库还低，在pom中手动添加spring官方仓库，里面有所需版本 ```Finchley.RC2```。菜鸟学习技术需谨慎啊，盲目使用最新版本，给自己带来不必要的麻烦。
```
<repositories>
    <repository>
        <id>spring-milestones</id>
        <name>Spring Milestones</name>
        <url>https://repo.spring.io/milestone</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>
```

使用 application.yml 的配置
```yml
server:
  port: 8761 # 8761是eureka server的默认端口
eureka:
  server:
    enable-self-preservation: false #防止由于Eureka的机制导致Client被错误显示在线 仅在开发环境使用
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/ #这便是此eureka server的应用注册地址
    register-with-eureka: false #不显示对server应用的注册
spring:
  application:
    name: eureka-demo
```
记得在springboot 启动类上加上注解```@EnableEurekaServer```
```
package lzlz.demo.springcloud.eureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class EurekaApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaApplication.class, args);
    }
}
```
现在就可以启动啦，红色的警告部分就是配置``` enable-self-preservation: false ```造成的
![image.png](https://upload-images.jianshu.io/upload_images/3867641-247ff9a28424023f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

也可以通过 ```mvn clean package``` 把此项目编译成jar包方便使用，jar包在 target目录下。

##### 创建 配置Eureka Client项目

New Project-> Spring Initalizr
next 修改group 和 artifact
next 我使用的是2.0.2版本的SpringBoot 选择 Web 和 Eureka Discovery 依赖
![](https://upload-images.jianshu.io/upload_images/3867641-6ea44056d7fa4fee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

一路确定 完成创建。

使用 application.yml 的配置
```yml
server:
  port: 8081
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/ #注册到刚才那台Eureka Server地址
spring:
  application:
    name: client-0
```
记得在 _SpringBoot_ 启动类上加上注解```@EnableDiscoveryClient```

###### 运行Server 和 Client
可以看到名为 _client-0_ 的应用已经注册到 _Eureka_ 中
![](https://upload-images.jianshu.io/upload_images/3867641-485fb1c48cf134f0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

注意 Eureka 服务端和客户端的连接有心跳检测的机制，因此客户端连接或者断开连接都可能不是即时反应的。
















