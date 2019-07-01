---
title: 量子密钥分发是如何实现的
date: 2019-03-20 13:57:15
tags: [探索与发现, python]
typora-root-url: ../
---

我只是一个程序员，对自然科学比较感兴趣。首先说明，我对量子力学仅停留在科普级别的了解。我仅仅利用其性质，来用代码尝试说明量子加密是如何实现的，仅供拓展思维。打个比方，本文对量子加密的讨论就如同通过“窜天猴”鞭炮作为demo来了解运载火箭的原理。

![本文内容](/images/12402.png) ![量子通讯](/images/124.png)

#### 观测对测量结果的影响

观测对测量结果产生影响的这种思想，真的对我的世界观产生了极大的挑战，世间万物居然遵循着这样的规律运行，让人感觉十分奇妙。

一个宏观对象，假设他有a,b,c 3个属性，该属性在对象生成时就确定，值可以为0或者1。就如同你生来就是男生/女生 不可修改，当然现在可以变性，但是实际上你的基因并不会改变，仅仅是“形似”罢了。

```python
import random

class Object:
    def __init__(self):
        self.__a = random.randint(0,1)
        self.__b = random.randint(0,1)
        self.__c = random.randint(0,1)
    
    def get_a(self):
        return self.__a

    def get_b(self):
        return self.__b

    def get_c(self):
        return self.__b

o = Object()
print("a:"+str(o.get_a())+" b:"+str(o.get_b())+" c:"+str(o.get_c()))
print("b:"+str(o.get_b())+" a:"+str(o.get_a()))
print("c:"+str(o.get_a())+" b:"+str(o.get_b()))
print("a:"+str(o.get_a())+" c:"+str(o.get_b()))
```

显而易见，对象生成后它的属性便是一个确定的值，该结果不会因为你的测量顺序而改变。比如你是一个汉族男性，不会因为先检查你的性别还是先检查你的民族而有所差别，在人类没有发现量子世界的性质之前，世间万物皆为如此。可能的运行结果：

```shell
a:1 b:0 c:0
b:0 a:1
c:0 b:0
a:1 c:0
```

**量子的观测不对异性**
对量子的不同特征进行测量，观测的顺序会影响测量的结果，这种性质被称为 “量子的观测不对异性” 。嗯，一个充满哲♂学气息的性质，可见量子是个gay，观测只对同性。
注意，该结果不是随机的，而是“叠加的”，因为当你的测量顺序一定时得到的结果是确定的。在两个属性（a,b）的情况下，一个量子的观测方式有[a,b],[b,a]两种，因此其a,b属性应该是两种状态的叠加。以此类推我们用代码来描述一个拥有a,b,c 3个属性的“量子对象”。

```python
class TreeNode:
        def __init__(self):
            self.__children = {}
            self.__val = random.randint(0,1)
        
        def set_child(self, name, child):
            self.__children[name]=child
            return child # 方便连续调用简化代码
        
        def get_child(self, name):
            return self.__children[name]
        
        def get_val(self):
            return self.__val

class Quantum:
    #关于叠加态 我们可以用树结构来维护
    #一个3个属性的量子，可表示为,
    #     root
    #   /   |   \
    #  a    b    c
    #  /\   /\   /\
    # b  c a  c a  b 
    # |  | |  | |  |
    # c  b c  a b  a
    

    # 测量方式，队列，如果新的测量属性和队列中最后一个值不一致则加入队列，
    # 如果队列长度大于（属性数-1）则头部数据出列，，为了便于理解，假设有abc三个属性
    # 测量属性 队列值
    # a       [a]
    # b       [a,b]  
    # c       [b,c]  
    # c       [b,c]   和最后一次测量一样 不发生改变
    # a       [c,a]  
    def __init__(self):
        self.route = []
        root = TreeNode()
        self.root = root
        root.set_child('a',TreeNode()).set_child('b',TreeNode()).set_child('c',TreeNode())
        root.get_child('a').set_child('c',TreeNode()).set_child('b',TreeNode())
        root.set_child('b',TreeNode()).set_child('a',TreeNode()).set_child('c',TreeNode())
        root.get_child('b').set_child('c',TreeNode()).set_child('a',TreeNode())
        root.set_child('c',TreeNode()).set_child('a',TreeNode()).set_child('b',TreeNode())
        root.get_child('c').set_child('b',TreeNode()).set_child('a',TreeNode())
    
    def __get(self, name):
        length = len(self.route)
        if (length == 0 or self.route[-1]!=name):
            self.route.append(name)
            if (len(self.route) >2):
                self.route.pop(0)
        node = self.root
        for name in self.route:
            node = node.get_child(name)
        return node.get_val()


    def get_a(self):
        return self.__get('a')

    def get_b(self):
        return self.__get('b')

    def get_c(self):
        return self.__get('c')
```

好了，我们已经通过代码实现了“观测对测量结果产生影响”的效果。每一次get属性值，就是对对象的一次观测，不同观测顺序下，变量会返回不同的值。

```python
# 创造一个量子并对他的属性反复观测
q = Quantum()
print('a',q.get_a())
print('b',q.get_a())
print('a',q.get_b())
print('c',q.get_c())
print('a',q.get_a())
print('b',q.get_a())
print('a',q.get_a())
```

可能的运行结果

```shell
a 0
b 0
a 1
c 1
a 0
b 0
a 0
```

#### 量子秘钥分发

通过量子的物理性质，保证了秘钥分发时的绝对安全
用代码来模拟该过程：

```
from quantum import Quantum
import random


class Observer:
    length = 20

    def __init__(self, name):
        self.name = name
        self.q_list = []  # 量子集合

    # 初始化量子集合
    def init_quantum(self):
        for i in range(Observer.length):
            self.q_list.append(Quantum())

    # 观测
    def observe(self):
        def __observe(quantum):
            ran = random.randint(0, 2)
            #最常见的光量子就有“线偏振”和“圆偏振”两种属性
            # 只使用a,b两个属性 来模拟这种情况
            if (ran == 0):
                return ('a', q.get_a())
            else:
                return ('b', q.get_b())
        self.path = []
        self.result = []
        for q in self.q_list:
            result = __observe(q)
            self.path.append(result[0])
            self.result.append(result[1])
        print(self.name,'观测方式：', self.path)
        print(self.name,'观测结果：', self.result)
    
    # 从另一个观测者获取量子序列
    def get_quantum(self, another):
        self.q_list=another.q_list
    
    # 从另一个观测者获取观测方式
    def get_path(self, another):
        self.key = []
        for i in range(Observer.length):
            if (another.path[i] == self.path[i]):
                self.key.append(self.result[i])
        print(self.name,'秘钥：', self.key)
```

观测和秘钥传输

```
sender = Observer('发送者')
sender.init_quantum() # 初始化量子序列
sender.observe() # 对量子序列进行观测

reciver = Observer('接收者')
reciver.get_quantum(sender) # 发送者把量子传输给接收者
reciver.observe() # 接收者对其观测

# 双方交换观察方式
sender.get_path(reciver)
reciver.get_path(sender)
```

可以得到这样的运行结果：

```shell
发送者 观测方式： ['b', 'b', 'a', 'a', 'a', 'b', 'b', 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'a', 'b', 'a', 'b', 'b', 'b']
发送者 观测结果： [0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1]
接收者 观测方式： ['a', 'b', 'a', 'a', 'b', 'b', 'a', 'a', 'b', 'b', 'b', 'b', 'a', 'b', 'b', 'b', 'b', 'b', 'b', 'a']
接收者 观测结果： [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0]
发送者 秘钥： [0, 0, 1, 1, 0, 1, 0, 0, 1, 1]
接收者 秘钥： [0, 0, 1, 1, 0, 1, 0, 0, 1, 1]
```

#### 如何保证安全

在模拟的代码中，“量子的观测不对异性” 通过存储观测方式 path 在Quantum对象中实现。这是我们在宏观世界来模拟这种现象的一种实现手段，实际上这是一种基本物理性质，观测者不可能从量子上得到之前对它观测的方式。

**量子不可克隆**
要保证安全还需要量子的另一个特性“量子不可克隆”。就是说，世间没有两个相同的量子，你不可能通过一个已得到的量子获得完全相同的另一个量子。没有这个原理，窃听者完全可以复制一个量子对它进行观测并把原来的量子传送给接收者。

**窃听过程**
知道上述两个物理性质后，如果有人试图监听，便是只能中截获了发送者传输的量子，并观测其值，然后再把它发送给接收者。然而此时所有人都不知道发送者的观测方式。窃听者也只能按自己的想法随意观测其属性。但没有关系，你对量子的观测便改变了量子的状态，当接收者获取到量子时，即便和发送者用同样的方式观测，也有可能得到不同的结果，当这个序列数量非常大的时候,这是必然发生的，结果就是得到了和发送者不一样的秘钥，这样窃听便被发现了。

模拟上述过程：

```python
sender = Observer('发送者')
sender.init_quantum() # 初始化量子序列
sender.observe() # 对量子序列进行观测

interceptor = Observer('窃听者')
interceptor.get_quantum(sender) # 截取信息
interceptor.observe() # 观测

reciver = Observer('接收者')
reciver.get_quantum(interceptor) # 发送者把量子传输给接收者
reciver.observe() # 接收者对其观测

# 双方交换观察方式
sender.get_path(reciver)
reciver.get_path(sender)
```

运行结果：

```shell
发送者 观测方式： ['b', 'a', 'b', 'a', 'b', 'b', 'b', 'a', 'b', 'a', 'b', 'b', 'a', 'a', 'b', 'b', 'b', 'a', 'b', 'a']
发送者 观测结果： [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1]
窃听者 观测方式： ['a', 'b', 'a', 'b', 'b', 'b', 'b', 'a', 'b', 'a', 'a', 'b', 'b', 'b', 'a', 'b', 'b', 'b', 'b', 'b']
窃听者 观测结果： [0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0]
接收者 观测方式： ['a', 'a', 'b', 'b', 'a', 'a', 'a', 'b', 'a', 'b', 'b', 'b', 'b', 'a', 'b', 'b', 'b', 'a', 'b', 'a']
接收者 观测结果： [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0]
发送者 秘钥： [1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1]
接收者 秘钥： [1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0]
```

代码请参考
[https://github.com/lzlz000/simple-clear-knowledge/tree/master/%5Bpython%5D%E9%87%8F%E5%AD%90%E9%80%9A%E8%AE%AF](https://github.com/lzlz000/simple-clear-knowledge/tree/master/%5Bpython%5D%E9%87%8F%E5%AD%90%E9%80%9A%E8%AE%AF)



