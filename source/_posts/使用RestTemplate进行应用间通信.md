---
title:  使用RestTemplate进行应用间通信
date: 2018-05-22 00:00:00
tags: [java, spring-cloud]
typora-root-url: ../
---

## 使用RestTemplate进行应用间通信
上文中我们已经准备好了 Eureka Server，在测试环境中，就不需要多个Eureka了，启动一个应用即可，为了方便我们打包运行

```
java -jar .\target\eureka-0.0.1-SNAPSHOT.jar
```


![](https://upload-images.jianshu.io/upload_images/3867641-ae7dbf9d401a1954.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们再创建两个 Spring Boot 项目，分别为product，consumer 并修改配置文件注册到 Eureka 中
```yml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```
记得在启动类添加注解 ```@EnableEurekaClient```


###### product项目中
添加controller
```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@RestController
public class ServerController {
    @GetMapping("echo")
    public String echoeMessage(HttpServletRequest request){
        return "this is server "+ request.getServerName()+":"+request.getServerPort();
    }
}
```
###### consumer 项目中
添加config类，其中```@LoadBalanced```注解帮助提供一个负载均衡的RestTemplate Bean
```java
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }
}
```
添加 controller，其中 restTemplate直接在url中用在Eureka中注册的应用名代替地址和端口,在product项目中，我们配置的应用名
```yml
spring:
  application:
    name: product
```
代码调用（应用名不区分大小写）
```restTemplate.getForObject("http://product/echo",String.class);```
```
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@Slf4j
public class ClientController {

    private RestTemplate restTemplate;

    @Autowired
    public ClientController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/product-msg")
    public String getProductMsg(){
        String resp = restTemplate.getForObject("http://product/echo",String.class);
        log.info("response={}",resp);
        return resp;
    }
}
```
通过-Dserver.port=xxxx设置不同的端口，启动多个product实例，idea中：![](https://upload-images.jianshu.io/upload_images/3867641-05f910499d165abd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

或者打包执行 

```
java -jar xxxxx.jar --server.port=xxxx 
```

我们启动两个实例，使用8080和8081端口

启动consumer，反复请求地址 http://localhost:8180/product-msg
将会得到不同的返回：
```
this is server 192.168.1.107:8081
this is server 192.168.1.107:8080
this is server 192.168.1.107:8081
this is server 192.168.1.107:8080
```

可以发现，请求在两个服务器间轮换执行
我们可以在client的配置文件中配置负载均衡的规则，我们把负载均衡规则改为 随机
```yml
#应用名
PRODUCT:
  ribbon:
    NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RandomRule
```
所有规则均在 com.netflix.loadbalancer包下并实现 com.netflix.loadbalancer.IRule接口，默认使用 com.netflix.loadbalancer.RoundRobinRule
