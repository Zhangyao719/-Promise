// es5

(function (window) {
    // 当前promise三种状态:
    const PENDING = 'pending';
    const RESOLVED = 'resolved';
    const REJECTED = 'rejected';

    function Promise(executor) {
        const _this = this;
        _this.PromiseState = PENDING; // Promise的状态属性
        _this.PromiseResult = undefined; // 保存结果数据
        _this.callbacks = []; // 保存.then()和.catch()传进来的待执行的回调函数 结构: { onResolved: Function; onRejected: Function; }

        try {
            executor(resolve, reject);
        } catch (e) {
            reject(e);
        }

        // 成功时, resolve回调 接收响应数据
        function resolve(data) {
            if (_this.PromiseState !== PENDING) return;
            _this.PromiseState = RESOLVED;
            _this.PromiseResult = data;
            // 执行.then传进来的异步回调(在返回Promise之后)
            if (_this.callbacks.length) {
                setTimeout(() => {
                    _this.callbacks.forEach((callbackObj) => {
                        callbackObj.onResolved(data); // 执行成功的处理函数
                    });
                });
            }
        }

        // 失败时, reject回调 接收失败信息
        function reject(error) {
            if (_this.PromiseState !== PENDING) return;
            _this.PromiseState = REJECTED;
            _this.PromiseResult = error;
            // 执行.then和.catch传进来的异步回调(在返回Promise之后)
            if (_this.callbacks.length) {
                setTimeout(() => {
                    _this.callbacks.forEach((callbackObj) => {
                        callbackObj.onRejected(error); // 执行失败的处理函数
                    });
                });
            }
        }
    }

    Promise.prototype.then = function (onResolved, onRejected) {
        /**
         * step1: 返回一个Promise实例
         * step2: 根据Promise的pending状态, 先保存onResolved和onRejectd, 再执行
         *      (2.1) 'pending': 存入onResolved和onRejectd
         *      (2.2) 'rejected': 执行onRejectd
         *      (2.3) 'resolved': 执行onResolved
         * 
         * ↓↓↓ 为确保能够一直.then链式调用下去(让下一次的.then始终能拿到上一次的结果), 我们要对上一次回调执行得到的结果进行处理
         * step3: 处理 执行onResolved或onRejectd得到的结果:
         *          (3.1) 结果是异常      →	reject(error)
         *          (3.2) 结果是promise  →	取出这个promise的结果, 当做当前return new Promise的结果
         *          (3.3) 结果是非promise →	resolved(data)
         */
        const _this = this;
        // step 1:
        return new Promise(function (resolve, reject) {
            // 检查参数, 两个参数必须都是函数:
            onResolved = typeof onResolved === 'function' ? onResolved : data => data;
            onRejected = typeof onRejected === 'function' ? onRejected : error => { throw error;}

            // step 3 (可以提取公共处理步骤):
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

    Promise.prototype.catch = function (onRejected) {
        return this.then(undefined, onRejected)
    };

    /**
     * @params {Array} promises
     * @return {Promise<*>}
     */
    Promise.resolve = function (data) {
        return new Promise((resolve, reject) => {
            // 1. data 本身也是一个Promise, 走.then
            if (data instanceof Promise) {
               data.then(resolve, reject);
            } else {
            // 2. data 是一个除Promise外的其他类型, 走resolve
                resolve(data);
            }
        });
    };

    /**
     * @return {Promise<*>} 返回带有拒绝原因的Promise对象
     * Promise.reject中不能再传入Promise
     */
    Promise.reject = function (error) {
        return new Promise((resolve, reject) => {
            reject(error)
        })
    };

    /**
     * @param {Array} promises promise数组
     * @return {Promise}
     */
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

    /**
     * @param {Array} promises promise数组
     * @return {Promise}
     */
    Promise.race = function (promiseList) {
        return new Promise((resolve, reject) => {
            promiseList.forEach(p => {
                Promise.resolve(p).then(
                    data => resolve(data),
                    error => reject(error)
                )
            });
        });
    };

    window.Promise = Promise;
})(window);
