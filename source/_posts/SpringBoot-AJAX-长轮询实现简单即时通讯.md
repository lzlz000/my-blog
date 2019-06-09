---
title:  SpringBoot+ajax长轮询实现简单即时通讯
date: 2018-03-10 00:00:00
tags: [java, 前端]
typora-root-url: ../
---



先来看看需要实现的效果

```
// 客户端A
> IM.subscribe('频道1')
> IM.subscribe('频道2')
< undefined
订阅 [频道1] 成功

// 客户端B 发送了消息
> IM.send('频道1','hello world')
// 客户端C 短时间内向 [频道1] 和 [频道2] 发送了多条消息 “频道1message1”-"频道1message10",“频道2message1”-"频道2message10"
for(...){IM.send('频道1','....')};for(...){IM.send('频道2','....')}
发送成功

// 客户端A收到消息
[{"text":"hello world"}]
// 客户端A收到消息
[{"text":"频道1message1"},{"text":"频道1message2"}, ...... 
{"text":"频道1message10"},{"text":"频道2message1"}, ...... 
{"text":"频道2message10"}]

//取消订阅 频道2
> IM.unsubscribe('频道2')
```

需要实现
1. 订阅频道
1. 取消订阅
1. 发送消息
1. 接收消息
---
首先，我们需要使用 ```org.springframework.web.context.request.async.DeferredResult``` 来做消息的异步返回。
关于```DeferredResult```的用法，不做详细介绍，可以看看这个简单的例子：
```java
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.async.DeferredResult;

import java.util.LinkedList;
import java.util.List;

@RestController
@RequestMapping("/test/deferredResult")
public class DeferredResultController {
    //DeferredResult存储在队列中，若同时有多个request1接收到时，request2可以把消息发送给所有的request1请求
    private final List<DeferredResult<String>> queue = new LinkedList<>();

    @RequestMapping("request1")
    public DeferredResult<String> request1(){
        DeferredResult<String> result = new DeferredResult<>(10000L); //设置过期时间 10000ms
        result.onTimeout(()->result.setResult("deferredResult已过期"));
        synchronized (queue){
            queue.add(result);
        }
        return result;
    }

    @RequestMapping("request2")
    public String request2(String message){
        synchronized (queue){
            queue.forEach(deferredResult -> {
                deferredResult.setResult(message);
                queue.remove(deferredResult);
            });
        }
        return "success";
    }

}
```
1.  向request1 */test/deferredResult/request1* 发送请求
1.  向request1 */test/deferredResult/request2* 发送请求，data为 *{"message":"hello world"}* 。此时request1、request2分别返回了值*"hello world","success"*
1. 若过期时间内没有请求request2 返回消息 "deferredResult已过期"

这就是通过长轮询接收消息的基本方式：发送请求到服务器，服务器收到请求后保持请求，当收到消息时通过此请求返回消息。

---
定义客户端和频道这两个类：
```
//客户端
@Data
public class IMClient{
    String id;
    String name;
    long saveTime;
    /**
     * 过期时间 ms，<=0即不过期
     */
    int expire;
}
//频道
@Data
public class Channel {
    String name;
    Set<IMClient> subscriptionSet;
}
```
我们在客户端通过循环调用的方式-收到返回的结果时再次发送请求，来保证服务器一直手握着客户端的请求，而且对于一个客户端至多只有一个请求，节省资源。
![](/images/1240)

通过jquery实现的代码如下
```js
function poll(){
    $.ajax({
        url:"/im/poll",
        type: "POST",
        success: function (data) {
            console.log(JSON.stringify(data));
            setTimeout(poll,500);//给点延时 减少请求的频率
        },
        error: function (err) {
            console.log(JSON.stringify(err));
            setTimeout(poll,5000);
        }
    });
}

```
然而 ，在服务器端返回请求后直到收到客户端下一个请求之前的这段时间，服务器并没有维持着客户端的请求。这段时间内发送给服务器的消息将被丢失，因此我们需要一个消息队列来保存未发送的消息：![](/images/12401)通过在收到消息和收到轮询请求时都调用flush方法，消息可以尽可能即时地发送给客户端 -- 当DeferredResult可用时，收到消息立刻返回，当DeferredResult不可用时，在收到轮询请求后立刻返回消息。

```java
import lzlz000.entity.CommonMessage;
import org.springframework.web.context.request.async.DeferredResult;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class IMMessageQueue {
    private DeferredResult<List<CommonMessage>> result;
    //使用LinkedList作为消息队列
    private final LinkedList<CommonMessage> messageQueue = new LinkedList<>();

    public synchronized void send(CommonMessage message){
        messageQueue.add(message);
        flush();
    }
    public DeferredResult<List<CommonMessage>> poll(){
        result = new DeferredResult<>(10000L);
        flush();
        result.onTimeout(()->result.setResult(null));
        return result;
    }
/**
 * flush()方法会在DeferredResult可用（非空且未被使用）时把消息发送出去，在send和poll时都会执行flush(),
 * 这样无论什么情况下消息最终都会被发送出去
 */
    private synchronized void flush(){
        if (result!=null&&!result.hasResult()&&messageQueue.size()>0) {
            //这里需要拷贝一份消息，因为此处为异步调用，而在当前线程中，messageQueue的引用随后将被clear()
            result.setResult(new ArrayList<>(messageQueue));
            messageQueue.clear();
        }
    }
}
```

---
接下来就是要维护频道和客户端了，我通过ClientService 和 ChannelService来实现
```java
import lzlz000.entity.im.IMClient;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;
import java.util.Date;
import java.util.UUID;

@Service
public class ClientService {
    private final int expire = 600 * 1000;//user的过期时间 600s没有活动 频道中的user自动过期

    /**
     * 过期时间间隔
     * @return 过期时间间隔(ms)
     */
    public int getExpire(){
        return expire;
    }
    /**
     * 获取默认过期时间的IMClient 
     * @param session httpSession
     */
    public IMClient getIMClient(HttpSession session){
        return getIMClient(session,this.expire);
    }

    /**
     * 获取指定过期时间的IMClient 
     * @param session httpSession
     * @param expire 过期时间，<=0代表不会过期
     */
    private IMClient getIMClient(HttpSession session, int expire){
        IMClient client =(IMClient)session.getAttribute("imUser");
        if(client != null&&client.getSaveTime()<= new Date().getTime()){//如果过期 则从session中删除用户
            session.removeAttribute("imUser");
            client = null;
        }
        if (client == null) {
            client = new IMClient();//测试时client的作用仅仅是作为map的key所以new一个即可
            client.setId(UUID.randomUUID().toString());
            client.setSaveTime(new Date().getTime()+expire);//设置过期时间
            session.setAttribute("imUser",client);
        }
        client.setExpire(expire);
        return client;
    }

    public boolean isExpired(IMClient client) {
        return client.getExpire() > 0 && client.getSaveTime() <= new Date().getTime();
    }
}
```
**ChannelService**  实现订阅、取消订阅、发送、接收的方法
```java
import lzlz000.entity.im.Channel;
import lzlz000.entity.CommonMessage;
import lzlz000.entity.im.IMClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.async.DeferredResult;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChannelService implements IChannelService{
    private final ClientService clientService;

    //客户端ID与消息队列映射
    private final Map<String,IMMessageQueue> resultMap = new ConcurrentHashMap<>();
    //客户端ID与频道的映射
    private final Map<String,Channel> channelMap = new ConcurrentHashMap<>();

    @Autowired
    public ChannelService(ClientService imUserService) {
        this.clientService = imUserService;
    }

    public void subscribe(String channelName, IMClient client) {
        Channel channel = channelMap.get(channelName);
        if (channel==null) {
            channel = new Channel(channelName,new HashSet<>());
            channelMap.put(channelName,channel);
        }
        channel.getSubscriptionSet().add(client);
    }

    public void unsubscribe(String channelName, IMClient client) {
        Channel channel = channelMap.get(channelName);
        if (channel==null) {
            return;
        }
        Set subscriptionSet = channel.getSubscriptionSet();
        subscriptionSet.remove(client);
        if(subscriptionSet.size()==0){
            channelMap.remove(channelName);
        }
    }

    public void unsubscribe(IMClient client) {
        if (client != null) {
            channelMap.values().forEach(channel -> channel.getSubscriptionSet().remove(client));
        }
    }

    public void emit(String channelName, IMClient sender , CommonMessage data) {
        sender.setSaveTime(new Date().getTime() + clientService.getExpire());//发送消息时候更新savetime
        Channel channel = channelMap.get(channelName);
        if (channel!=null) {
            //当已达到过期时间 删除此client,并且从resultMap中删除对应的消息
            channel.getSubscriptionSet().forEach(imUser -> {
                boolean isExpired = clientService.isExpired(imUser);
                if(isExpired){
                    channel.getSubscriptionSet().remove(imUser);
                    resultMap.remove(imUser.getId());
                }
            });
            channel.getSubscriptionSet().forEach(client-> send(client,data));
            //当channel中没有订阅者，删除此channel
            if( channel.getSubscriptionSet().size()==0){
                channelMap.remove(channelName);
            }
        }

    }


    public DeferredResult<List<CommonMessage>> poll(IMClient receiver){
        IMMessageQueue queue = resultMap.get(receiver.getId());
        if (queue==null) {
            queue = new IMMessageQueue();
            resultMap.put(receiver.getId(),queue);
        }
        return queue.poll();
    }


    private void send(IMClient receiver, CommonMessage message){
        IMMessageQueue queue = resultMap.get(receiver.getId());
        if (queue != null) {
            queue.send(message);
        }
    }
}

```
Controller
```java
import lzlz000.entity.im.Message;
import lzlz000.service.im.ChannelService;
import lzlz000.service.im.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 长轮询即时通讯Controller
 */
@RestController
@RequestMapping("im")
public class IMController {
    private final ChannelService channelService;
    private final ClientService userService;

    @Autowired
    public IMController(ChannelService channelService, ClientService userService) {
        this.channelService = channelService;
        this.userService = userService;
    }

    //长轮询
    @PostMapping("poll")
    @ResponseBody
    public DeferredResult<List<CommonMessage>> poll(HttpServletRequest req){
        return channelService.poll(userService.getIMClient(req.getSession()));
    }

    //订阅
    @PostMapping("subscribe")
    public String subscribe(HttpServletRequest req,Message channel){
        channelService.subscribe(channel.getChannel(),userService.getIMClient(req.getSession()));//测试时User的作用仅仅是作为map的key所以new一个即可
        return "订阅: "+channel.getChannel();
    }
    //取消订阅
    @PostMapping("unsubscribe")
    public String unsubscribe(HttpServletRequest req,Message channel){
        if (channel != null&&channel.getChannel()!=null) {
            channelService.unsubscribe(channel.getChannel(),userService.getIMClient(req.getSession()));//测试时User的作用仅仅是作为map的key所以new一个即可
            return "取消订阅:"+channel.getChannel();
        }else{
            channelService.unsubscribe(userService.getIMClient(req.getSession()));//测试时User的作用仅仅是作为map的key所以new一个即可
            return "取消订阅全部频道";
        }
    }

    // 似乎识别不了内部的自定义对象CommonMessage,需要HTTP请求设置contentType: "application/json",
    // 把json转化为字符串传给data,并且此方法设置@RequestBody
    @PostMapping("emit")
    public String emit(HttpServletRequest req, @RequestBody Message msg){
        msg.setSender(userService.getIMClient(req.getSession()));
        channelService.emit(msg.getChannel(),msg.getSender(),msg.getMessage());
        return "发送成功";
    }
}
```
最后把controller提供的方法在封装在js中
```js
/**
 * 长轮询即时通讯
 */
var IM =(function(jQuery){
    var $ =jQuery;
    return {
        poll : function() {
            $.ajax({
                url:"/im/poll",
                type: "POST",
                success: function (data) {
                    console.log(JSON.stringify(data));
                    IM.poll();
                },
                error: function (err) {
                    console.log(JSON.stringify(err));
                    setTimeout(IM.poll,2000);
                }
            });
        },

        subscribe : function(channel) {
            $.post('/im/subscribe',{
                channel:channel
            },function (e) {
                console.log(e);
            })
        },
        unsubscribe : function (channelName) {
            var channel = channelName?{channel:channelName}:null;
            $.post('/im/unsubscribe',channel,function (e) {
                console.log(e);
            })
        },
        send : function(channel,text) {
            $.ajax({
                url:"/im/emit",
                type: "POST",
                data: JSON.stringify({
                    channel:channel,
                    message:{
                        text:text
                    }
                }),
                success: function (e) {
                    console.log(e);
                },
                dataType: "json",
                contentType: "application/json"
            });
        }
    };
})(jQuery);

```
至此，可实现文章开头所说的效果

---

这其实就是一种 **发布订阅模式** 
客户端既是订阅者（Subscriber）又是发布者（Publisher）
但是http请求是客户端主动向服务器发送请求获取返回，发布订阅模式是被动的接收被订阅频道的通知。
因此我们只能把客户端的请求存储在服务器中（请求存储在**DeferredResult**对象中），当服务器数据发生改变时，通知订阅者（返回请求）。
![](https://upload-images.jianshu.io/upload_images/3867641-ee9130c763f5f948.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
为了保证数据的及时性以及完整性，获取消息-->返回消息-->获取消息 循环执行（即**长轮询**），而服务器对应频道的对应客户端有一个队列保存着未发送的消息，在收到**获取消息**的请求或者**发送消息**的请求时都会尝试**返回消息**。