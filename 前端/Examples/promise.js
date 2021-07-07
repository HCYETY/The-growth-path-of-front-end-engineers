// 先用三个变量分别保存三个状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected'

function MyPromise(fn) {
    // 这里存一下this,以便resolve和reject里面访问
    const self = this;

    self.state = PENDING;
    self.value = null;
    self.reason = null;

    // 构造函数里面添加两个数组存储成功和失败的回调
    self.onFulfilledCallbacks = [];
    self.onRejectedCallbacks = [];
  
    function resolve(value) {
        if(self.state === PENDING) {
            self.state = FULFILLED; 
            self.value = value;

            // resolve里面将所有成功的回调拿出来执行
            self.onFulfilledCallbacks.forEach(callback => {
                callback(self.value);
            });
        }
    }
  
    function reject(reason) {
        if(self.state === PENDING) {
            self.state = REJECTED;
            self.reason = reason;

            // resolve里面将所有失败的回调拿出来执行
            self.onRejectedCallbacks.forEach(callback => {
                callback(self.reason);
            });
        }
    }

    // 在执行 fn 的过程中，如果捕获到错误就要 reject ，所以要加上 try...catch 结构
    try{
        fn(resolve, reject); 
    } catch(error) {
        reject(error);
    }
}

function ResolvePromise(promise, x, resolve, reject) {
    if(promise === x) {
        return reject(new TypeError('The promise and the return value are the same'));
    }
    
    if(x instanceof MyPromise) {
        if (x.state === PENDING) {
            x.then(function(value) {
                ResolvePromise(promise2, value, resolve, reject)
            }, reject)
        } else { 
            // 如果x状态已经确定了，直接取它的状态
            x.then(resolve, reject)
        }
    } else if(typeof x === 'object' || typeof x === 'function') {
        // 这个坑是跑测试的时候发现的，如果x是null，应该直接resolve
        if (x === null) {
            return resolve(x);
        }

        try{
            var then = x.then;
        } catch(error) {
            return reject(error);
        }

        if(typeof then === 'function') {
            var called = false;

            try{
                then.call(x, function resolvePromise(y) {
                    if(called) return;
                    called = true;
                    ResolvePromise(promise, y, resolve, reject);
                }, function rejectPromise(r) {
                    if(called) return;
                    called = true;
                    reject(r);
                });
            } catch(error) {
                if(called) return;
                reject(error);
            }
        } else {
            resolve(x);
        }
    } else {
        resolve(x);
    }
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
    onRejected = typeof onRejected === 'function' ? onRejected : (reason) => { throw reason };

    const _self = this;
    
    // 有了这个要求，在RESOLVED和REJECTED的时候就不能简单的运行onFulfilled和onRejected了。
    // 我们需要将他们用try...catch...包起来，如果有错就reject。
    if(this.state === FULFILLED) {
        var promise2 = new MyPromise(function(resolve, reject) {
            setTimeout(function() {
                try {
                    if (typeof onFulfilled !== 'function') {
                        resolve(_self.value);
                    } else {
                        var x = onFulfilled(_self.value);
                        ResolvePromise(promise2, x, resolve, reject);   // 调用Promise 解决过程
                    }
                } catch (error) {
                    reject(error);
                }
            }, 0);
        });
    
        return promise2;
    }

    if(this.state === REJECTED) {
        var promise2 = new MyPromise(function(resolve, reject) {
            setTimeout(function() {
                try {
                    if (typeof onFulfilled !== 'function') {
                        resolve(_self.value);
                    } else {
                        var x = onRejected(_self.value);
                        ResolvePromise(promise2, x, resolve, reject);   // 调用Promise 解决过程
                    }
                } catch (error) {
                    reject(error);
                }
            }, 0);
        });
    
        return promise2;
    }
        
    // 如果还是PENDING状态，也不能直接保存回调方法了，需要包一层来捕获错误
    if(this.state === PENDING) {
        var promise2 = new MyPromise(function(resolve, reject) {
            _self.onFulfilledCallbacks.push(function() {
                setTimeout(function() {
                    try {
                        if (typeof onFulfilled !== 'function') {
                            resolve(_self.value);
                        } else {
                            var x = onFulfilled(_self.value);
                            ResolvePromise(promise2, x, resolve, reject);   // 调用Promise 解决过程
                        }
                    } catch (error) {
                        reject(error);
                    }
                }, 0);
            });
            _self.onRejectedCallbacks.push(function() {
                setTimeout(function() {
                    try {
                        if (typeof onFulfilled !== 'function') {
                            resolve(_self.value);
                        } else {
                            var x = onRejected(_self.value);
                            ResolvePromise(promise2, x, resolve, reject);   // 调用Promise 解决过程
                        }
                    } catch (error) {
                        reject(error);
                    }
                }, 0);
            });
        });
        
        return promise2;
    }
}

MyPromise.deferred = function() {
    var result = {};
    result.promise = new MyPromise(function(resolve, reject){
      result.resolve = resolve;
      result.reject = reject;
    });
  
    return result;
}