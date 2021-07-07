我们知道  

1. `promise` 构造函数接收一个函数参数(`fn`)，且该函数参数也接受另外两个函数参数，分别为 `resolve` 和 `reject`。
2. 当构建一个 `promise` 实例时，`fn` 是立即执行的。
3. `promise` 有 `'pending'`、`'fulfilled'`、`'rejected'` 三个状态。初始状态为 `'pending'` ，调用 `resolve` 会将其改为 `'fulfilled'` ，调用 `reject` 会改为 `'rejected'` 。

由此实现
```js
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

    function resolve(value) {
        if(self.state === PENDING) {
            self.state = FULFILLED; 
            self.value = value;
        }
    }
    function reject(reason) {
        if(self.state === PENDING) {
            self.state = REJECTED;
            self.reason = reason;
        }
    }

    // 在执行 fn 的过程中，如果捕获到错误就要 reject ，所以要加上 try...catch 结构
    try{
        fn(resolve, reject); 
    } catch(reason) {
        reject(reason);
    }
}
```
<!-- 4.  `resolve` 的作用是将 `promise` 的状态从 `'pending'` 变为 `'fulfilled'`，在异步操作成功时调用，并将异步操作的结果作为参数传递出去。
5.  `reject` 的作用是将 `promise` 的状态从 `'pending'` 变为 `'rejected'`，在异步操作失败时调用，并将异步操作报出的错误作为参数传递出去。 -->

1. `Promise` 实例具有`then`方法，也就是说，`then`方法是定义在原型对象`Promise.prototype`上的。它的作用是为 Promise 实例添加状态改变时的回调函数。
2. `then`方法接收两个回调函数作为参数。第一个参数是`resolved`状态的回调函数（`onFulfilled`），第二个参数是`rejected`状态的回调函数（`onRejected`），它们都是可选的。
3. 判断这两个参数是不是函数，如果不是，则必须忽略。
   > 注意：这里的“忽略”不是指什么都不做：对于`onFulfilled`来说“忽略”就是将`value`原封不动的返回；对于`onRejected`来说就是返回`reason`，`onRejected`因为是错误分支，我们返回`reason`应该`throw`一个`Error`
3. 如果`onFulfilled` 是函数，则必须在 `promise` 的状态变为 `FULFILLED` 时才调用 `onFulfilled`回调函数，并且将此 `promise` 的 `value` 作为 `onFulfilled`函数的第一个参数执行。  
    > 注意：在 `promise` 完成之前不能调用它，同时不能被多次调用。
4. 如果 `onRejected` 是函数，则必须在 `promise` 的状态变为 `REJECTED` 时才调用 `onRejected`回调函数，并且将此 `promise` 的 `reason` 作为 `onRejected`函数的第一个参数执行。  
    > 注意：在 `promise` 被拒绝之前不能调用它，同时不能被多次调用。
```js
MyPromise.prototype.then = function(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
    onRejected = typeof onRejected === 'function' ? onRejected : (reason) => { throw reason };

    const _self = this;

    if(this.state === FULFILLED) {
        onFulfilled(_self.value);
    }
    if(this.state === REJECTED) {
        onRejected(_self.reason);
    }
}
``` 
1. 有种情况需要考虑：如果`then`方法是在`promise`实例对象一创建好就调用了，这时候如果 `fn` 里面的异步操作还没结束，即 `state` 还是 `PENDING` 的时候，是不能调用 `onFulfilled` 和 `onRejected` 回调函数的（由上面的4、5点可知，只有在相对应的状态下，这两个回调函数才能被调用）  

    那么如何知道 `fn` 里的异步操作结束了，状态变为`FULFILLED`还是`REJECTED`？答案是 `fn` 在调用 `resolve` 或者 `reject` 的时候，如果这时候 `state` 状态还是 `PENDING` ，我们应该将`onFulfilled` 和 `onRejected` 这两个回调函数存起来，等`resolve/reject`函数真正执行完的时候再调用。  
    因为后面`then`还有链式调用，会有多个`onFulfilled`和`onRejected`，所以这里用两个数组将他们存起来，等`resolve`或者`reject`的时候将数组里面的全部方法拿出来执行一遍：

    这种方式其实有点类似于**订阅发布模式**：  
    我们往回调数组里push回调函数 **相当于** 订阅者往事件调度中心注册事件  
    resolve/reject执行对应的回调数组里的回调函数 **相当于** 发布者发布执行后的事件到调度中心  
    resolve/reject按数组中的顺序执行回调函数 **相当于** 事件触发时，由调度中心统一调度（Fire Event）订阅者注册到调度中心的待处理代码
```js
// 构造函数
function MyPromise(fn) {
  // ...省略其他代码...
  
  // 构造函数里面添加两个数组存储成功和失败的回调
  self.onFulfilledCallbacks = [];
  self.onRejectedCallbacks = [];
  
  function resolve(value) {
    if(self.state === PENDING) {
      // ...省略其他代码...

      // resolve里面将所有成功的回调拿出来执行
      self.onFulfilledCallbacks.forEach(callback => {
        callback(self.value);
      });
    }
  }
  
  function reject(reason) {
    if(self.state === PENDING) {
      // ...省略其他代码...

      // resolve里面将所有失败的回调拿出来执行
      self.onRejectedCallbacks.forEach(callback => {
        callback(self.reason);
      });
    }
  }
}

// then方法
MyPromise.prototype.then = function(onFulfilled, onRejected) {
  // ...省略其他代码...

  // 如果还是PENDING状态，将回调保存下来
  if(this.state === PENDING) {
    this.onFulfilledCallbacks.push(onFulfilled);
    this.onRejectedCallbacks.push(onRejected);
  }
}
```
2. `then` 返回一个新的 `promise` 实例，这里命名为 `promise2`。  
有几种情况需要注意：  
2.1 如果 onFulfilled 或者 onRejected 抛出一个异常 e ，则 promise2 必须拒绝执行，并返回拒因 e  
    ```js
    MyPromise.prototype.then = function(onFulfilled, onRejected) {
        // ... 省略其他代码 ...
    
        // 有了这个要求，在RESOLVED和REJECTED的时候就不能简单的运行onFulfilled和onRejected了。
        // 我们需要将他们用try...catch...包起来，如果有错就reject。
        if(this.state === FULFILLED) {
            var promise2 = new MyPromise(function(resolve, reject) {
                try {
                    onFulfilled(_self.value);
                } catch (error) {
                    reject(error);
                }
            });
        
            return promise2;
        }

        if(this.state === REJECTED) {
            var promise2 = new MyPromise(function(resolve, reject) {
                try {
                    onRejected(_self.reason);
                } catch (error) {
                    reject(error);
                }
            });
        
            return promise2;
        }
        
        // 如果还是PENDING状态，也不能直接保存回调方法了，需要包一层来捕获错误
        if(this.state === PENDING) {
            var promise2 = new MyPromise(function(resolve, reject) {
                this.onFulfilledCallbacks.push(function() {
                    try {
                        onFulfilled(_self.value);
                    } catch (error) {
                        reject(error);
                    }
                });
                this.onRejectedCallbacks.push(function() {
                    try {
                        onRejected(_self.reason);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        
            return promise2;
        }
    }
    ```
    2.2 如果 onFulfilled 不是函数且 promise1 成功执行， promise2 必须成功执行并返回相同的值（try里加判断）  
    ```js
    MyPromise.prototype.then = function(onFulfilled, onRejected) {
    // 我们就根据要求加个判断，注意else里面是正常执行流程，需要resolve
        // 这是个例子，每个realOnFulfilled后面都要这样写
        if(this.status === FULFILLED) {
            var promise2 = new MyPromise(function(resolve, reject) {
                try {
                    if (typeof onFulfilled !== 'function') {
                        resolve(this.value);
                    } else {
                        onFulfilled(this.value);
                        resolve(this.value);
                    }
                } catch (error) {
                    reject(error);
                }
            });

            // 剩余的代码也要按上面的例子进行补充
    
            return promise2;
        }
    }
    ```
    2.3 如果 onRejected 不是函数且 promise1 拒绝执行， promise2 必须拒绝执行并返回相同的据因。这个要求其实在我们检测 onRejected 不是函数的时候已经做到了，因为我们默认给的onRejected里面会throw一个Error，所以代码肯定会走到catch里面去。  
    2.4 如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的 Promise 解决过程：[[Resolve]](promise2, x)。前面我们代码的实现，其实只要onRejected或者onFulfilled成功执行了，我们都要resolve promise2。多了这条，我们还需要对onRejected或者onFulfilled的返回值进行判断，如果有返回值就要进行 Promise 解决过程。我们专门写一个方法来进行Promise 解决过程。
    ```js
    MyPromise.prototype.then = function(onFulfilled, onRejected) {
        if(this.state === FULFILLED) {
            var promise2 = new MyPromise(function(resolve, reject) {
                try {
                    if (typeof onFulfilled !== 'function') {
                        resolve(this.value);
                    } else {
                        var x = onFulfilled(this.value);
                        ResolvePromise(promise2, x, resolve, reject);   // 调用Promise 解决过程
                    }
                } catch (error) {
                    reject(error);
                }
            });
        
            return promise2;
        }
    }
    ```
3. Promise 解决过程
- x 与 promise 相等  
如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
    ```js
    function ResolvePromise(promise, x, resolve, reject) {
        if(promise === x) {
            return reject(new TypeError('The promise and the return value are the same'));
        }
    }
    ```
- x 为 Promise  
如果 x 为 Promise ，则使 promise 接受 x 的状态：
    - 如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
    - 如果 x 处于执行态，用相同的值执行 promise
    - 如果 x 处于拒绝态，用相同的据因拒绝 promise
    ```js
    function ResolvePromise(promise, x, resolve, reject) {
        if(promise === x) { // some code}

        if(x instanceof MyPromise) {
            if (x.state === PENDING) {
                x.then(function(value) {
                    ResolvePromise(promise2, value, resolve, reject)
                }, reject)
            } else { 
                // 如果x状态已经确定了，直接取它的状态
                x.then(resolve, reject)
            }
        }
    }
    ``` 
- x 为对象或函数  
  - 如果 x 为对象或者函数：
      - 把 x.then 赋值给新的变量 then
      - 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      - 如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
          - 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          - 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          - 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
          - 如果调用 then 方法抛出了异常 e：
              - 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
              - 否则以 e 为据因拒绝 promise
      - 如果 then 不是函数，以 x 为参数执行 promise
  - 如果 x 不为对象或者函数，以 x 为参数执行 promise
```js
function ResolvePromise(promise, x, resolve, reject) {
    if(promise === x) { // some code}

    if(x instanceof MyPromise) { // some code}
    else if(typeof x === 'object' || typeof x === 'function') {
        try{
            var then = x.then;
        } catch(error) {
            reject(error);
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
                })
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
```
整体代码
```js
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
    } catch(reason) {
        reject(reason);
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
        try{
            var then = x.then;
        } catch(error) {
            reject(error);
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
                })
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
            try {
                if (typeof onFulfilled !== 'function') {
                    resolve(this.value);
                } else {
                    var x = onFulfilled(this.value);
                    ResolvePromise(promise2, x, resolve, reject);   // 调用Promise 解决过程
                }
            } catch (error) {
                reject(error);
            }
        });
    
        return promise2;
    }

    if(this.state === REJECTED) {
        var promise2 = new MyPromise(function(resolve, reject) {
            try {
                if (typeof onFulfilled !== 'function') {
                    resolve(this.value);
                } else {
                    var x = onRejected(this.value);
                    ResolvePromise(promise2, x, resolve, reject);   // 调用Promise 解决过程
                }
            } catch (error) {
                reject(error);
            }
        });
    
        return promise2;
    }
        
    // 如果还是PENDING状态，也不能直接保存回调方法了，需要包一层来捕获错误
    if(this.state === PENDING) {
        var promise2 = new MyPromise(function(resolve, reject) {
            this.onFulfilledCallbacks.push(function() {
                try {
                    if (typeof onFulfilled !== 'function') {
                        resolve(this.value);
                    } else {
                        var x = onFulfilled(this.value);
                        ResolvePromise(promise2, x, resolve, reject);   // 调用Promise 解决过程
                    }
                } catch (error) {
                    reject(error);
                }
            });
            this.onRejectedCallbacks.push(function() {
                try {
                    if (typeof onFulfilled !== 'function') {
                        resolve(this.value);
                    } else {
                        var x = onRejected(this.value);
                        ResolvePromise(promise2, x, resolve, reject);   // 调用Promise 解决过程
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        return promise2;
    }
}
```