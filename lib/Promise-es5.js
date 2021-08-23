// es5

/**
 * new Promise((resolve, reject) => { ... })
 *  .then(onResolved, onRejected)
 *  .catch(onRejected)
 */
(function (window) {
  // 当前promise三种状态: 
  const PENDING = 'pending'
  const RESOLVED = 'resolved'
  const REJECTED = 'rejected'

  function Promise(executor) {
    // 成功时, resolve回调 接收响应数据
    function resolve(value) {}
    
    // 失败时, reject回调 接收失败信息
    function reject(error) {}

    try {
      executor()
    } catch (e) {
      reject(e)
    }
  }

  Promise.prototype.then = function (onResolved, onRejectd) {
    
  }

  Promise.prototype.catch = function (onRejectd) {
    
  }

  Promise.resolve = function (params) {
    
  }

  Promise.reject = function (params) {
    
  }

  /**
   * @param {Array} promises promise数组
   * @return {Promise}
   */
  Promise.all = function (promises) {
    
  }

  /**
   * @param {Array} promises promise数组
   * @return {Promise}
   */
  Promise.race = function (promises) {
    
  }

  window.Promise = Promise
})(window)
