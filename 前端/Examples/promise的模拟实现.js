```js
function MyPromise(executor) {
    const self = this;
    self.state = 'pending';
    self.value = null;
    self.reason = null;
    self.onFulfilledCallback = [];
    self.onRejectedCallback = [];

    function resolve(value) {  
        if(self.state === 'pending') {
            self.state = 'fulfilled';
            self.value = value;
            
            self.onFulfilledCallback.foreach(func => {
                func(self.value);
            })
        }
    }
    function reject(reason) {
        if(self.state = 'pending') {
            self.state = 'rejected';
            self.reason = reason;
            
            self.onRejectedCallback.foreach(func => {
                func(self.reason);
            })
        }
    }

    try{
        executor(resolve, reject);
    } catch(e) {
        reject(e);
    }
}

function resolvePromise(promise, x, resolve, reject) {
    if(promise === x) {
        return reject(new TypeError('The promise and the return value are the same'));
    }

    // 待理解
    if (x instanceof MyPromise) {
        // 如果 x 为 Promise ，则使 promise 接受 x 的状态
        // 也就是继续执行x，如果执行的时候拿到一个y，还要继续解析y
        // 这个if跟下面判断then然后拿到执行其实重复了，可有可无
        x.then(function (y) {
        resolvePromise(promise, y, resolve, reject);
        }, reject);
    }

}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
    const self = this;
    onFulfilled = type onFulfilled === 'function' ? onFulfilled : (val) => {val};
    onRejected = type onRejected === 'function' ? onRejected : (reason) => {throw reason};

    if(self.state === 'fulfilled') {
        var promise2 = new MyPromise(function(resolve, reject) {
            setTimeout(function() {
                try{
                    if (typeof onFulfilled !== 'function') {
                        resolve(self.value);
                    } else {
                        var x = onFulfilled(self.value);
                        resolvePromise(promise2, x, resolve, reject); 
                    }
                } catch(error) {
                    reject(error);
                }
            }, 0);
        });

        return promise2;
    }
    if(self.state === 'rejected') {
        var promise2 = new MyPromise(function(resolve, reject) {
            setTimeout(function() {
                try{
                    if(typeof onRejected !== 'function') {
                        reject(self.reason);
                    } else {
                        var x = onRejected(self.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    }
                } catch(error) {
                    reject(error);
                }
            }, 0);
        });

        return promise2;
    }
    if(self.state === 'pending') {
        var promise2 = new MyPromise(function(resolve, reject) {
            self.onFulfilledCallback.push(function() {
                setTimeout(function() {
                    try{
                        if (typeof onFulfilled !== 'function') {
                        resolve(self.value);
                    } else {
                        var x = onFulfilled(self.value);
                        resolvePromise(promise2, x, resolve, reject); 
                    }
                    } catch(error) {
                        reject(error);
                    }
                }, 0);
            });
            self.onRejectedCallback.push(function() {
                setTimeout(function() {
                    try{
                        if(typeof onRejected !== 'function') {
                        reject(self.reason);
                    } else {
                        var x = onRejected(self.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    }
                    } catch(error) {
                        reject(error);
                    }
                }, 0);
            });
        })

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
```