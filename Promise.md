# 手写Promise

手写Promise之前, 我们先看看Promise有哪些方法需要我们封装:

## Promise常用方法

详情点击查看链接, 这里只是简单的说明

| 常用方法                                                     | 说明                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| executor(resolve, reject)                                    | 执行器, 包含resolve和reject两个回调函数                      |
| resolve                                                      | executor的回调, 接收成功的数据                               |
| reject                                                       | executor的回调,接收失败的数据                                |
| [.then(onResolved, onRejected)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) | Promise原型链上的方法,返回Promise, 处理成功和失败情况        |
| [.catch(onRejectd)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) | Promise原型链上的方法, 返回Promise, 处理失败情况             |
| onResolved                                                   | .then()的回调, 处理接收到的成功的数据                        |
| onRejected                                                   | .then()和.catch()的回调, 处理接收到的失败的数据              |
| [.resolve](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve) | 静态方法, 返回一个`以给定值解析后`的Promise对象              |
| [.reject](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject) | 静态方法, 返回一个`带有拒绝原因`的Promise对象。              |
| [.all](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) | 静态方法, 接收promise数组 只返回一个Promise实例, 返回的结果顺序不变 |
| [.race](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/race) | 静态方法, 接收promise数组 返回第一个处理完的Promise的结果    |

