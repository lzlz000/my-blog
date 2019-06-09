---
title: 最长递增子序列问题
date: 2018-03-10 00:00:00
tags: [算法, java]
typora-root-url: ../
---



最长递增子序列问题 LIS(longest increasing subsequence) 例如

> 给定一个数列，长度为N，
求这个数列的最长上升（递增）子数列（LIS）的长度.
以
1, 7, 2, 8, 3, 4
为例。
这个数列的最长递增子数列是 1 2 3 4，长度为4；
次长的长度为3， 包括 1 7 8; 1 2 3 等.

设数组为：arr
设  foo(k) 为：以数列中第k项 (为了与java数组逻辑一致，这里的k从0开始计算) 结尾的最长递增子序列的长度
则：
```java
foo(0) == 1 
foo(k) == max(arr[k]>arr[0]?foo(0)+1:foo(0),
              arr[k]>arr[1]?foo(1)+1:foo(1) , 
              ... ,
              arr[k]>arr[k-1]?foo(k-1)+1:foo(k-1))
```
java代码
```
public class LISDemo {
    public static void main(String[] args){
        int[] arr = new int[10];
        Random random = new Random();
        for (int i = 0; i < arr.length; i++) {
            arr[i] = random.nextInt(100);
        }
        System.out.println("数组"+Arrays.toString(arr));
        long time = System.currentTimeMillis();
        System.out.println("结果: "+foo(arr, arr.length-1));
        System.out.println("耗时: "+(System.currentTimeMillis()-time));
    }
    private static int foo(int[] arr,int end){
        if (end==0) {
            return 1;
        }
        int len = 0;
        for (int i = 0; i < end; i++) {
            int temp = foo(arr,i);
            len = Math.max(len,arr[end]>arr[i]?temp+1:temp);
        }
        return len;
    }
}
```
这段代码能计算出正确的结果，但是存在问题：
要计算 foo(n)必须先得到 foo(0)~foo(n-1)的值
要计算 foo(n-1)必须先得到 foo(0)~foo(n-2)的值
...
以此类推，可以把他画成一颗多叉树，时间复杂度达到O(2^n) 

运行这段代码就会发现 每当数组长度+1 运行耗时大致翻倍，数组长度为几十的时候，运行时间已经无法容忍的长了。

以foo(3)为例，可以画成下面这棵树
![](/images/1240123.png)
可以发现，相同参数的方法被重复计算了多遍，我们可以建立一个hashmap把参数和对应的值存入其中，当结果已经计算过，就直接从hashmap中取出结果不再计算，修改代码为如下,保留了原来的方法做个对比，执行效率天差地别:

```java
public class LISDemo {
    public static void main(String[] args){
        int[] arr = new int[31];
        Random random = new Random();
        for (int i = 0; i < arr.length; i++) {
            arr[i] = random.nextInt(100);
        }
        System.out.println("数组"+Arrays.toString(arr));
        LIS lis = new LIS(arr);

        long time = System.currentTimeMillis();
        System.out.println("结果1: "+lis.foo());
        System.out.println("耗时1: "+(System.currentTimeMillis()-time));

        time = System.currentTimeMillis();
        System.out.println("结果2: "+foo(arr, arr.length-1));
        System.out.println("耗时2: "+(System.currentTimeMillis()-time));
    }
    // 最长递增子序列 longest increasing subsequence
    private static class LIS{
        int[] arr;
        HashMap<Integer,Integer> values = new HashMap<>();

        LIS(int[]arr){
            this.arr = arr;
        }
        int foo(){
            return foo(arr,arr.length-1);
        }
        private int foo(int[] arr,int end){
            Integer value = values.get(end);
            if (value != null) {
                return value;
            }
            if (end==0) {
                values.put(0,1);
                return 1;
            }
            int len = 0;
            for (int i = 0; i < end; i++) {
                int temp = foo(arr,i);
                len = Math.max(len,arr[end]>arr[i]?temp+1:temp);
            }
            values.put(end,len);
            return len;
        }

    }
    private static int foo(int[] arr,int end){
        if (end==0) {
            return 1;
        }
        int len = 0;
        for (int i = 0; i < end; i++) {
            int temp = foo(arr,i);
            len = Math.max(len,arr[end]>arr[i]?temp+1:temp);
        }
        return len;
    }
}
```





