## 阅前声明：  
本文旨在模拟实现 `promise` ，因此默认您已掌握 `promise` 相关知识。  
如果需要加深理解，可以学习阮一峰老师的 [Promise对象](https://javascript.ruanyifeng.com/advanced/promise.html) 和 [ECMAScript 6 入门之Promise 对象](https://es6.ruanyifeng.com/#docs/promise)。  
参考规范：[Promises/A+](https://promisesaplus.com/)  
[中文版](https://www.ituring.com.cn/article/66566)
## 第一版
Promise 是一个对象，也是一个构造函数。它的设计思想是，所有异步任务都返回一个 Promise 实例。  
首先写一段 `promise` 的代码来分析一下构造函数的实现：
```js
var p = new Promise((resolve, reject) => {
    // do something async job
    // resolve(data); // 任务结束，触发状态变化，通知成功回调的处理，并传递结果数据
    // reject(err); // 任务异常，触发状态变化，通知失败回调的处理，并传递失败原因
}).then(value => console.log(value))
  .catch(err => console.log(err));

p.then(v => console.log(v), err=> console.log(err));
```
我们知道  

1. `promise` 构造函数接收一个函数参数，且该函数参数也接受另外两个函数参数，分别为 `resolve` 和 `reject`。
2. 每个 `promise` 对象都有一个 `onFulfilledCallback` 队列和一个 `onRejectedCallback` 队列，用来分别存储**成功**和**失败**时调用的**回调函数**
3. `promise` 对象有三个状态，分别是 `pending` 、`fulfilled` 和 `rejected`。初始状态是 `pending`，随着异步操作的进行，`pending` 只能转化为 `fulfilled` 或 `rejected` 其中一种，即要么成功要么失败，并且状态一经转化就不能再发生改变。
4.  `resolve` 的作用是将 `promise` 的状态从 `'pending'` 变为 `'fulfilled'`，在异步操作成功时调用，并将异步操作的结果作为参数传递出去。
    > 这里有一点需要注意，**不是 resolve 一调用，Promise 的状态就一定发生变化**。**状态的变更，其实依赖于 resolve 调用时，传递过去的参数的类型**，因为这里可以传递任意类型的值，比如可以是基本类型，也可以是 Promise。当类型不一样时，对状态的变更处理是不一样的。
    - 当传递的参数类型为promise对象时，例如
         ```js
        const p1 = new Promise(function (resolve, reject) {
            // ...
        });
        const p2 = new Promise(function (resolve, reject) {
            // ...
            resolve(p1);
        })
        ``` 
        上面代码中，p1和p2都是 Promise 的实例，但是p2的resolve方法将p1作为参数，即一个异步操作的结果是返回另一个异步操作。

        注意，这时p1的状态就会传递给p2，也就是说，p1的状态决定了p2的状态。如果p1的状态是pending，那么p2的回调函数就会等待p1的状态改变；如果p1的状态已经是resolved或者rejected，那么p2的回调函数将会立刻执行。
    > 所以，“resolve 一调用，Promise 的状态就一定发生变化”这样的说法是不正确的。    
5.  `reject` 的作用是将 `promise` 的状态从 `'pending'` 变为 `'rejected'`，在异步操作失败时调用，并将异步操作报出的错误作为参数传递出去。
### 基本框架
```js
function mypromise(executor) {
    const _this = this;
    _this.state = 'pending';
    _this.value = null;
    _this.reason = null;
    _this.onFulfilledCallback = [];
    _this.onRejectedCallback = [];

    function resolve(value) {
        if(_this.state === 'pending') {
            _this.state = 'fulfilled'; 
            _this.value = value;
            // 如果有待执行的回调函数,立即异步执行onResolved
            // _this.onFulfilledCallback.foreach(fn => fn(_this.value));
        }
    }
    function reject(reason) {
        if(_this.state === 'pending') {
            _this.state = 'rejected';
            _this.reason = reason;
            // _this.onRejectedCallback.foreach(fn => fn(_this.reason));
        }
    }

    try{
        executor(resolve, reject);
    } catch(reason) {
        reject(reason);
    }
}
```
## 第二版
### Promise.prototype.then()
<!-- `then`是定义在原型对象`Promise.prototype`上的，目的是为 Promise 实例添加状态改变时的回调函数。既然跟两个状态的改变有关，所以它的第一个参数是resolved状态的回调函数，第二个参数是rejected状态的回调函数，它们都是可选的。该方法最后会返回一个新的`promise`实例（注意，不是原来那个Promise实例）。  
于是有： -->
1. `then` 方法接收两个回调函数（，这里将其命名为） `onFulfilled、onRejected` 作为参数。
2. 这两个参数是可选的，如果它们不是函数，则必须忽略，并且将成功或失败的值传递给下一个then注册的回调函数及下一个then的onFulfilled 和 onRejected
3. 如果`onFulfilled` 是一个函数，则必须在 `promise` 的状态变为 `'fulfilled'` 时才调用 `onFulfilled`回调函数，并且将此 `promise` 的 `value` 作为 `onFulfilled`函数的第一个参数执行。  
注意：在 `promise` 完成之前不能调用它，同时不能被多次调用。
4. 如果 `onRejected` 是一个函数，则必须在 `promise` 的状态变为 `'rejected'` 时才调用 `onRejected`回调函数，并且将此 `promise` 的 `reason` 作为 `onRejected`函数的第一个参数执行。  
注意：在 `promise` 被拒绝之前不能调用它，同时不能被多次调用。
5. `then`方法返回的是一个新的Promise实例（注意，不是原来那个Promise实例）。

2.1版本
```js
mypromise.prototype.then = function(onFulfilled, onRejected) {
    const _this = this;
    return new mypromise((resolve, reject) => {
        // onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (val) => val;
        // onRejected = typeof onRejected === 'function' ? onRejected : (err) => { throw err };
        const _onFulfilled = () => {
            if(onFulfilled && onFulfilled instanceof Function) {
                try{
                    const result = onFulfilled(_this.value);
                    resolve(result);
                } catch(e) {
                    reject(e);
                }
            } else {
                resolve(_this.value);
            }
        }
        const _onRejected = () => {
            if(onRejected && onRejected instanceof Function) {
                try{
                    const result = onRejected(_this.reason);
                    resolve(result);
                } catch(e) {
                    reject(e);
                }
            } else {
                reject(_this.reason);
            }
        }
        if(_this.state === 'pending') {
            // 如果当前 Promise 状态还没变更，则将回调函数放入队列里等待执行
            // 否则直接创建微任务来处理这些回调函数
            _this.onFulfilledCallback.push(onFulfilled);
            _this.onRejectedCallback.push(onRejected);
        } else if(_this.state === 'fulfilled') {
            onFulfilled(_this.value);
        } else if(_this.state === 'rejected') {
            onRejected(_this.reason);
        } 
    })
}
```
1. 由于 `then`方法返回了一个新的promise实例，所以可以采用链式写法。其实链式调用无非就是再返回一个类的实例。
   > Q：那为什么是这样呢？  
   A：因为 `promise` 的状态一旦发生转变，就不能再次改变了，而链式调用中的 `then` 返回的 `promise` 是可以选择 `resolve` 或者 `reject` 的，所以 `then` 必须返回一个新的 `promise`
2. 所有的 `then` 中注册的回调函数，都应该是异步执行
    > 注意：标准 `promise` 的 `then` 中注册的回调函数是属于微观任务，我们这里可以用 `setTimeout` 来模拟，但是 `setTimeout` 是属于宏观任务的
3. 所有的then中注册的异步回调函数都应该放在try{}catch中执行，当执行then 中的回调函数抛出异常时，应该捕获这个异常，并将异常对象传递给reject，并调用reject
4. 一个 `promise` 可以绑定多个 `then`
### Promise.prototype.catch()
### Promise.prototype.finally()
### Promise.all()
- 参数：接受一个数组，数组内都是Promise实例
- 返回值：返回一个Promise实例，这个Promise实例的状态转移取决于参数的Promise实例的状态变化。当参数中所有的实例都处于resolve状态时，返回的Promise实例会变为resolve状态。如果参数中任意一个实例处于reject状态，返回的Promise实例变为reject状态。
```js
Promise.all([p1, p2]).then(function (result) { 
    console.log(result); // [ '2.txt', '2' ] 
});
```
> 不管两个promise谁先完成，Promise.all 方法会按照数组里面的顺序将结果返回

不管两个promise谁先完成，Promise.all 方法会按照数组里面的顺序将结果返回
### Promise.race()
- 参数：接受一个数组，数组内都是Promise实例
- 返回值：返回一个Promise实例，这个Promise实例的状态转移取决于参数的Promise实例的状态变化。当参数中任何一个实例处于resolve状态时，返回的Promise实例会变为resolve状态。如果参数中任意一个实例处于reject状态，返回的Promise实例变为reject状态。
```js
Promise.race([p1, p2]).then(function (result) {
  console.log(result); // [ '2.txt', '2' ]
});
```
### Promise.allSettled()
### Promise.any()
### Promise.resolve()
- 返回一个Promise实例，这个实例处于resolve状态。
- 根据传入的参数不同有不同的功能：值(对象、数组、字符串等) 会 作为resolve传递出去的值; Promise实例：原封不动返回。
### Promise.reject()
- 返回一个Promise实例，这个实例处于reject状态。
- 参数一般就是抛出的错误信息。
### 应用
### Promise.try()