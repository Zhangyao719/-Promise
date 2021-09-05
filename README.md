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
> ​	**step1:** 返回一个Promise实例
>
> ​	**step2: **根据Promise的pending状态, 先保存onResolved和onRejectd, 再执行
>
> ​			(2.1) 'pending': 存入onResolved和onRejectd
>
> ​			(2.2) 'rejected': 执行onRejectd
>
> ​			(2.3) 'resolved': 执行onResolved
>
> ↓↓↓ 为确保能够一直.then链式调用下去(让下一次的.then始终能拿到上一次的结果), 我们要对上一次回调执行得到的结果进行处理
>
> ​	**step3:** 处理 执行onResolved或onRejectd得到的结果:
>
> ​			(3.1) 结果是异常				→	reject(error)
>
> ​			(3.2) 结果是promise		→	取出这个promise的结果, 当做当前这个return new Promise的结果
>
> ​			(3.3) 结果是非promise	→	resolved(data)

![使用结构图](.\assets\Snipaste_2021-08-30_22-28-51.jpg)

```js
Promise.prototype.then = function (onResolved, onRejected) {
    const _this = this;
    // step 1:
    return new Promise(function (resolve, reject) {
        // 检查参数, 两个参数必须都是函数: (形参data/error 其实都是_this.PromiseResult的结果)
        onResolved = typeof onResolved === 'function' ? onResolved : data => data;
        onRejected = typeof onRejected === 'function' ? onRejected : error => { throw error;}

        // step 3(可以提取成公共处理步骤):
        function handle(callback) {
            try {
                const res = callback(_this.PromiseResult);
                if (res instanceof Promise) {
                    res.then(resolve, reject); // step 3.2
                    // res.then((data) => resolve(data), (error) => reject(error)); // 写法同上
                } else {
                    resolve(res); // step 3.3
                }
            } catch (error) {
                reject(error); // step 3.1
            }
        }

        // step 2:
        if (_this.PromiseState === RESOLVED) {
            setTimeout(() => { handle(onResolved)});
        } else if (_this.PromiseState === REJECTED) {
            setTimeout(() => { handle(onRejected)});
        } else {
            _this.callbacks.push({
				onResolved() {
					handle(onResolved);
				},
                onRejected() {
                    handle(onRejected);
                },
            })
        }
    })
};

// .then封装完, .catch就可以直接使用了:
Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected)
};
```

## Promise.resolve和Promise.reject

>**Promise.resolve**:
>
>返回一个以给定值(resolve的参数)解析后的Promise
>
>1. 如果resolve的参数是一个promise,  则返回这个Promise
>2. 如果resolve的参数是一个非promise, (比如固定值, Promise.resolve(1) ), 则返回带有这个值的Promise

```js
Promise.resolve = function (value) {
    return new Promise((resolve, reject) => {
        // 1. value 本身也是一个Promise, 走.then, 用resolve或reject去接收value的结果
        if (value instanceof Promise) {
            value.then(resolve, reject);
        } else {
            // 2. value 是一个除Promise外的其他类型, 走resolve
            resolve(value);
        }
    });
};
// reject就直接用reject去接收就可以了
Promise.reject = function (error) {
    return new Promise((resolve, reject) => {
        reject(error)
    })
};
```

## Promise.all

>特点:
>
>1. 接收一个promise数组, 只返回一个Promise实例, 结果是一个数组
>2. 结果的顺序不能变
>3. 只有所有的promise都成功, 才返回成果的结果, 否则将返回第一个失败的结果

```js
Promise.all = function (promiseList) {
    const dataList = new Array(promiseList.length);
    let successCount = 0;
    return new Promise((resolve, reject) => {
        promiseList.forEach((p, index) => {
            // 考虑到p可能不是一个promise
            Promise.resolve(p).then(
                data => {
                    // 数据顺序需要保持一致
                    dataList[index] = data;
                    successCount++;
                    // 检查是否全部成功
                    if (successCount === promiseList.length) {
                        resolve(dataList);
                    }
                },
                // 失败就返回第一个失败的结果
                error => reject(error)
            )
        });
    });
};
```

