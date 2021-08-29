# 手写Promise

手写Promise之前, 我们先看看Promise有哪些方法需要我们封装:

## Promise常用方法

详情点击查看链接, 这里只是简单的说明

| 常用方法                                                     | 说明                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| executor(resolve, reject)                                    | 执行器, Promise的参数, 包含resolve和reject两个回调函数       |
| resolve                                                      | executor的回调, 接收成功的数据                               |
| reject                                                       | executor的回调,接收失败的数据                                |
| [.then(onResolved, onRejected)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) | Promise原型链上的方法,返回Promise, 处理成功和失败情况        |
| [.catch(onRejectd)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) | Promise原型链上的方法, 返回Promise, 处理失败情况             |
| onResolved                                                   | .then()传入的回调, 处理接收到的成功的数据                    |
| onRejected                                                   | .then()和.catch()传入的回调, 处理接收到的失败的数据          |
| [.resolve](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve) | 静态方法, 返回一个`以给定值解析后`的Promise对象              |
| [.reject](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject) | 静态方法, 返回一个`带有拒绝原因`的Promise对象。              |
| [.all](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) | 静态方法, 接收promise数组 只返回一个Promise实例, 返回的结果顺序不变 |
| [.race](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/race) | 静态方法, 接收promise数组 返回第一个处理完的Promise的结果    |

## Promise结构

```json
Promise
├── 实例属性↓
├── PromiseState // 当前Promise状态属性
├── PromiseREsult // 存储结果数据
├── resolve()
├── reject()
├
├── 原型方法 ↓
├── Promise.prototype.then(onResolved, onRejected)
├── Promise.prototype.catch(onRejected)
├
├── 静态方法 ↓
├── Promise.all()
├── Promise.race()
├── Promise.resolve()
├── Promise.reject()
```



## 封装resolve和reject方法

>特点:
>
>1. Promise的`PromiseState`状态属性只能被修改一次
>2. 存储接收的数据`PromiseResult`
>3. 如果.then()或.catch()有传异步回调进来, 那就要在返回Promise对象后去执行(settimeout开启新的进程)

```js
// 1. 返回的还是Promise
// 2. 走处理失败的reject方法(包含拒绝的原因)
Promise.reject = function (error) {
    return new Promise((resolve, reject) => {
        reject(error)
    })
};

// 1. 返回的还是Promise
// 2. value 本身也是一个Promise, 走.then
// 3. value 是一个除Promise外的其他类型, 走resolve
Promise.resolve = function (value) {
    return new Promise((resolve, reject) => {
        if (value instanceof Promise) {
            value.then(resolve, reject);
        } else {
            resolve(value);
        }
    });
};
```



## 核心难点——封装prototype.then()

> 步骤:
>
> 1. 返回 new Promise
>
> 2. 根据当前pending状态, 指定onResolved/onRejected回调 或 存入回调数组中
>
>    1. 'pending':  存入onResolved和onRejected
>
>    2. 'rejected': 
>
>       
>
>    3. 'resolved':  返回的Promise结果 由 onResolved/onRejected执行结果决定
>
>       1. 抛出异常
>       2. 返回Promise, 结果就是当前这个执行结果
>       3. 返回非Promise值, 成功