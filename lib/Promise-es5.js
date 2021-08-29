// es5

/**
 * new Promise((resolve, reject) => { ... })
 *  .then(onResolved, onRejected)
 *  .catch(onRejected)
 */
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
        function resolve(value) {
            if (_this.PromiseState !== PENDING) return;
            _this.PromiseState = RESOLVED;
            _this.PromiseResult = value;
            // 执行.then传进来的异步回调(在返回Promise之后)
            if (_this.callbacks.length) {
                setTimeout(() => {
                    _this.callbacks.forEach((callbackObj) => {
                        callbackObj.onResolved(value); // 执行成功的处理函数
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
                        callbackObj.onRejected(value); // 执行失败的处理函数
                    });
                });
            }
        }
    }

    Promise.prototype.then = function (onResolved, onRejectd) {};

    Promise.prototype.catch = function (onRejectd) {};

    /**
     * @params {Promise} promises
     */
    Promise.resolve = function (params) {

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
    Promise.all = function (promises) {};

    /**
     * @param {Array} promises promise数组
     * @return {Promise}
     */
    Promise.race = function (promises) {};

    window.Promise = Promise;
})(window);
