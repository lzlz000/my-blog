---
title:  RSA算法原理
date: 2019-03-15 00:00:00
tags: [算法, python]
typora-root-url: ../
---



#### 算法介绍

1. 随意选择两个大的素数  p q
1. ```n = p * q```
1. ```φ(n) = (p-1)(q-1)```  (欧拉函数)
1. 公钥e: 满足 ```1<e<φ(n)```的整数 且和 φ(n)互质
1. 私钥d: 满足 ```e*d mod φ(n)==1```
1. 销毁p, q
1. 公开发布 n和公钥 e

加密解密：
1. 加密，明文m (m应为小于n的整数)，m的e次幂取n的余数，得到值c即为密文
$c = m^e mod(n)$
2. 解密， 计算密文c的d次幂取n的余数，即得到明文m

整体流程的简易代码 (python3)
```python
# 欧几里得算法 （辗转相除法） 求最大公约数
def gcd(m, n):
    mod = 1
    # 将小数放到d1中
    if(m <= n):
        d1 = m
        d2 = n
    else:
        d1 = n
        d2 = m

    while mod != 0:
        mod = d2 % d1
        d2 = d1
        d1 = mod
    return d2

# 真实情况下应该是很大的素数 通常为512、1024、2048位二进制数,如1024位二进制整数大约为十进制10^308数量级
# 计算得到秘钥然后以一定规则编码成字符串形式，形成常见的秘钥
p = 41
q = 43
n = p * q
# 欧拉函数
phi = (p-1)*(q-1)
# 1<e<φ(n)的整数 且和 φ(n)互质
publicKey = 2
# 检查是否互质 否则+1
while gcd(phi, publicKey) != 1:
    publicKey = publicKey+1

# 私钥d: e*d%φ(n)==1
privateKey = (phi + 1) * publicKey
print("公钥:", publicKey,"私钥:", privateKey,"n:", n)
# 存储在计算机里的一切信息都可以认为是一串按一定规则序列化成的数字
content = 412  # 密文的值要小于 p * q,否则需要分段加密
cipher = pow(content, publicKey, n)
print("密文", cipher)
content1 = pow(cipher, privateKey, n)
print("明文", content1)
```

##### 幂模运算
上述代码中 通过 **pow(a, b, c)**获取 a的b次幂取c的模，该函数在python中是一个自带的函数，然而在其他常见语言的自带库（如java、js等）中，pow() 函数/方法 通常没有取模的功能，**千万不可用 pow(a,b)%c代替该运算**。上文的简单例子中，私钥的值已经高达 18491，任何一个大于1整数的18491次幂都已经是个天文数字，在大多数语言中运行时得到的已经不是一个精确的结果，取模的值是错误的。更不要说实际上使用的大素数，经过这样的运算，得到的值大到计算机内存肯定是存不下的。

如果你不想深入了解该问题，在任何常用语言中，可以轻易找到科学计算库，都带有该算法，如果你还有兴趣，请搜索“蒙哥马利幂模运算”，也很容易理解。

##### 获取大素数
我们知道判断一个数是否为素数的方法是这样：
```python
import math    
     
def isPrime(n):    
    if n <= 1:    
        return False   
    for i in range(2, int(math.sqrt(n)) + 1):    
    if n % i == 0:    
        return False   
    return True   
```
然而我们如果要获取一个大素数，如果把大数一个一个遍历直到找到一个素数其实是很低效的。因此我们通过一些素数的性质或者其规律，通过更有效率的办法筛选出可能符合要求的整数，然后对其进行精确的判断是实际常用的方法。参考下面的链接：
[https://www.zhihu.com/question/293656940/answer/512820832](https://www.zhihu.com/question/293656940/answer/512820832)
#### 为什么RSA算法能保证安全？
公开场合只能获取到公钥对 (n,publicKey)
publicKey 和 privateKey 的对应关系为  *publicKey = privateKey((p-1)(q-1)+1)*,
而p,q在算法中已经被销毁了，我们只知道p,q的乘积n，通过n分解质因数找到质数p,q的是一个指数级别复杂度的算法，在实际使用中，p,q都是10的几百次方数量级的大数，计算出p,q对于现代计算机来说可以认为是一个在有限时间内不可解的问题。

#### 随便写点
相比技术问题，我更喜欢谈谈技术和技术以外事物的关系，从今天起开始写简明知识系列文章，其内容一般以代码作为载体，以简明的方式，短小的篇幅写下和编程相关的技术问题，也谈谈相关的非技术问题。

RSA算法被认为是世界上最重要的算法之一。二战时期，科技强如德国，密码都可以被盟军破译。然而现在个人就可以对信息做到理论级别不可破解的方式加密，2016年“苹果fbi事件”就是如此。因此双向加密算法被用在了了生活中的方方面面，从https到你的银行账户，无处不在。
>联邦调查局将CNET引向联邦调查局长詹姆斯·科米（James Comey）的言论，科米谈到美国如何始终平衡隐私与公共安全，以及加密技术如何破坏了这种平衡。“强加密的逻辑意味着所有人的生命，包括执法，都将很快受到强加密的影响。”他说。“在我看来，根据我们的历史和我们的价值观，绝对的隐私以及那些认为政府应该把手从人民手机上拿开的想法没有任何意义。”

拿不到私钥，即使强如国家暴力也无法获取你加密的任何信息，打破了强弱力量之间的平衡，让个人通过技术获取了可以对抗强权的小小手段。

量子计算机的发展让在有限时间内破解私钥在未来变得有可能实现，因此情报部门如今会截获并保存他们认为有可能有价值的密文信息和公钥对，在破解私钥实现后便可得到其信息。然而每天世界上通讯中的加密数据海量，数据价值的时效性也有限，因此RSA算法保证信息的安全性在目前还是没有问题滴 : ）






