    目录
- [实现一个深拷贝函数](#实现一个深拷贝函数)
  - [实现深拷贝需要考虑几个因素：](#实现深拷贝需要考虑几个因素)
  - [代码实现](#代码实现)
- [实践：函数柯里化](#实践函数柯里化)
  - [代码实现：](#代码实现-1)
- [实现一个 instanceof 函数](#实现一个-instanceof-函数)
  - [语法：a instanceof b](#语法a-instanceof-b)
  - [代码实现：](#代码实现-2)
- [模拟实现 new 函数](#模拟实现-new-函数)
  - [new 的原理](#new-的原理)
  - [代码实现](#代码实现-3)
- [模拟实现 call、apply、bind 函数](#模拟实现-callapplybind-函数)
  - [call](#call)
  - [apply](#apply)
  - [bind](#bind)
- [模拟实现防抖和节流函数](#模拟实现防抖和节流函数)
  - [防抖](#防抖)
  - [节流](#节流)

==========

    正文

==========
## 实现一个深拷贝函数
### 实现深拷贝需要考虑几个因素：
- 传入的对象是使用对象字面量{}创建的对象，还是由构造函数生成的对象
- 如果对象是由构造函数创建出来的，那么是否要拷贝原型链上的属性
- 如果要拷贝原型链上的属性，那么如果原型链上存在多个同名的属性，保留哪个
- 处理循环引用的问题
### 代码实现
```js
// 原生js中递归函数拷贝
function deepCopy(obj) {
    // 定义一个变量接收新对象
    var newObj = null;

    if(obj instanceof Array) {
        newObj = [];
        // 复制法一
        for(let index in obj) {
            var prop = obj[index]; 
            if (prop == obj) {
                continue;
            }
            // callee, 该属性是一个指针，指向拥有这个 arguments 对象的函数,相当于deepCopy(),即递归调用自身;有利于降低代码的耦合度（如果更换函数名，也可正常递归，不受其他代码影响）
            newObj.push(arguments.callee(obj[index]));
            // newObj.push(deepCopy(obj[index]));
        }
        // 复制法二
        // obj.forEach(item => {
        //     newObj = arguments.callee(item);
        // });
    } else if(obj instanceof Object) {
        newObj = {};
        for(let index in obj) {
            newObj[index] = arguments.callee(obj[index]);
            // newObj[index] = deepCopy(obj[index]);
        }
    } else {
        newObj = obj;
    }            

    return newObj;

    // 该函数存在的问题：
    // 同名的属性会发生覆盖现象

    // 如果对象是由构造函数创建出来的，那么是否要拷贝原型链上的属性
    // 传入的对象是使用对象字面量{}创建的对象还是由构造函数生成的对象
}

let obj={
    abc:'123',
    def:[{a:1,b:2,c:3},{q:8,w:9}],
    qwe:{e: 4, f: 5}
};
let news = deepCopy(obj);   
console.log(news);
/* 复制法一console：                       复制法二console：  
{abc: "123" ,                             {abc: "123",
def: Array(2),                             def: {q: 8, w: 9},
    0: {a: 1, b: 2, c: 3}                  qwe: {e: 4, f: 5}}
    1: {q: 8, w: 9}
qwe: {e: 4, f: 5}}
*/

// // 实现jQuery中的extend函数进行拷贝
// function deepCopy(obj) {
//     if (obj && obj instanceof Object) {
//         var result = obj.constructor === Array ? [] : {};
//         for(let i in obj) {
//             // 避免相互引用造成死循环
//             var prop = obj[i]; 
//             if (prop == obj) {
//                 continue;
//             }
//             // hasOwnProperty(propertyName)方法 是用来检测属性是否为对象的自有属性，如果是，返回true，否者false; 参数propertyName指要检测的属性名；
//             if (obj.hasOwnProperty(i)) {
//                 result[i] = typeof obj[i] === 'object' ? deepCopy(obj[i]) : obj[i];
//             }
//         }
//     } else {
//         var result = obj;
//     }
    
//     return result;
// }

// let obj={
//     abc:'123',
//     def:[{a:1,b:2,c:3},{q:8,w:9}],
//     qwe:{e: 4, f: 5}
// };
// let news = deepCopy(obj);
// console.log(news);
```
## 实践：函数柯里化
接收函数作为参数的函数，都可以叫做高阶函数。柯里化，其实就是高阶函数的一种特殊用法。  
柯里化（Currying），是一种将使用多个参数的一个函数转换成一系列使用一个参数的函数的技术。如：
```js
// 普通的 add 函数
function add(x, y) {
    return x + y
}

// Currying 后
function curryingAdd(x) {
    return function(y) {
        return x + y
    }
}

add(1, 2);         // 3
curryingAdd(1)(2); // 3
```
作用：简化代码结构，提高系统的维护性，一个方法，只有一个参数，强制了功能的单一性，很自然就做到了功能内聚，降低耦合。
### 代码实现：
```js
function add(...arg) {
    // 第一次执行时，定义一个数组专门用来存储所有的参数
    var args = Array.prototype.slice.call(arguments);

    // 在内部声明一个函数，利用闭包的特性保存args并收集所有的参数值
    var _adder = function() {
        args.push(...arguments);
        return _adder;
    }

    // var arr = [...arg];
    // console.log(arr);
    // var _adder = function(...arg1) {
    //     // var arg1 = [...arg1];
    //     // console.log(arg1)
    //     arr.push(...arg1);
    //     console.log(arr);
    //     return _adder;
    // }

    // 利用隐式转换的特性，当最后执行时隐式转换，并计算最终的值返回
    _adder.toString = function() {
        return args.reduce(function(a, b) {
            return a + b;
        });
    }

    return _adder;
}
// console.log( add(1)(2)(3)(4) );   // f 10
// console.log( add(1, 2, 3, 4) );   // f 10
// console.log( add(1, 2)(3, 4) );   // f 10
console.log( add(1, 2, 3)(4) );   // f 10
```
## 实现一个 instanceof 函数
### 语法：a instanceof b
- a：某个实例对象；b：某个构造函数
- instanceof 运算符用于检测 b.prototype 是否存在于参数 a的原型链上。  
- instanceof函数用来判断一个对象是否为某个函数的实例。
- 综上，只需要循环去取 a 的原型，然后同 b 的原型比较即可
### 代码实现：
```js
function Person() { // 构造函数
    this.name = "siyang";
}
let p = new Person(); // 实例
console.log(p.name); // siyang

function myInstanceof(a, b) {
    let _a = a.__proto__;
    let _b = b.prototype;
    while(true) {
        if(_a === _b) return true;
        if(!_a) return false;
        _a = _a.__proto__;
    }
}
console.log(myInstanceof(p, Object)); // true
console.log(myInstanceof(p, Array)); // false
```
## 模拟实现 new 函数
### new 的原理
1. 创建一个新对象
2. 新对象的原型指向构造函数的原型--->继承构造函数的方法
3. 构造函数内部的this被赋值为这个新对象（即this指向新对象）
4. 执行构造函数内部的代码（即给新对象添加属性）
5. 如果构造函数返回非空对象，则返回该对象；否则，返回刚创建的新对象
### 代码实现
```js
function create_new(fn) {
    // 如果 fn 不能作为构造函数，则抛出 TypeError 异常
    if(typeof fn !== 'function'){
        throw `${fn} must be a function`;
    }

    // Object.create()方法接收两个参数：一个用作新对象原型的对象，一个为新对象定义额外属性的对象（这个参数是可选的）
    const obj = Object.create(fn.prototype);
    // 等价于 
    // var obj = new Object ();
    // var constructor = Array.prototype.shift.call(arguments);
    // obj._proto_ = constructor.prototype;
    // 注意：用这种方法的话是不用给create_new()传参的

    var result = fn.apply(obj, [...arguments].slice(1));

    // 确保构造器总是返回一个对象
    const isObject = typeof result === 'object' && result !== null;
    const isFunction = typeof result === 'function';
	return (isObject || isFunction) ? result : obj;
}

function person(name, age) {
    this.name = name;
}
person.prototype.color = 'red';
person.prototype.sayHi = function() {
    console.log("Hello " + this.name);
}

let child = create_new(person, 'siyang');
console.log(child.name); // siyang
console.log(child.color); // red
child.sayHi(); // Hello siyang
```
> 更加深入请参考：[模拟实现 new 操作符(js)](https://www.jianshu.com/p/5541477481bd)
## 模拟实现 call、apply、bind 函数
### call
```js
// call函数模拟思路
Function.prototype.simulate_call = function(context, ...arg) {
    // 7.假如this参数为null，视为指向window
    context = context || window;
    // 1.考虑到对象本身已经有同名的方法，使用Symbol保证不出现同名的属性
    const fn = Symbol('fn');
    // 2.改变this的指向
    context[fn] = this;
    // 3.执行函数 + 5.把参数数组放到要执行的函数的参数里
    const result = context[fn](...arg);
    // 4.删除函数
    delete context[fn];
    // 6.函数是可以有返回值的
    return result;
}

var foo = {
    value:1
};
function bar(name, age) {
    console.log(this.value);
    return{
        value:this.value,
        name:name,
        age:age
    }
}
bar.simulate_call(foo, 'siyang', '19');
```
### apply
```js
// apply函数模拟思路：与call只有一个传参不同的差别
Function.prototype.simulate_apply = function(context, arr) {
    var context = context || window;
    const fn = Symbol('fn');
    context[fn] = this;
    // 这里要将数组展开，散列传参
    var result = context[fn](...arr);
    delete context[fn];
    return result;
}
var foo = {
    value:2
}
function bar(name, age) {
    console.log(this.value);
    return {
        value:this.value,
        name:name,
        age:age
    }
}
bar.simulate_apply(foo, ['hcy', '20']);
```
### bind  
该方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数。
- bind 函数的特点：
    - 可以指定this。
    - 返回一个可以传参的新函数，需要再次调用新函数才能达到最终执行
    - 支持函数柯里化。
    - 返回的这个绑定了this的新函数，之后this无法再被修改
```js
// bind函数模拟思路
Function.prototype.simulate_bind = function(context, ...arg) {
    if (typeof this !== "function") {
        throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
    }

    // 提前保存，表示调用 bind 的函数（也就是bar函数）。否则在执行 bindFoo 时内部 this 会指向 window
    let _this = this;
    // console.log(this); // f bar(name, age) {...}
    
    // 匿名函数里传入另外的参数，实现柯里化
    let fn = function(...arg1) {
        // 如果是new调用，this会指向实例，执行环境就为实例
        // 如果是普通函数调用，this会指向window，执行环境为最初的context
        // console.log(this);
        // console.log(this instanceof fn);
        context = this instanceof fn ? this : context;
        return _this.apply(context, arg.concat(arg1)); // 用concat()将两次传参合并
    }

    // 若返回的函数作为构造函数时，实例要继承原先绑定函数的属性方法。这里用空函数充当中间代理，通过原型链就可以实现继承
    var empty = function () {};
    empty.prototype = this.prototype;
    fn.prototype = new empty();

    return fn;
}

var foo = {
    value:1
};
function bar(name, age) {
    console.log(this.value);
    console.log(name); 
    console.log(age); 
}
var bindFoo = bar.simulate_bind(foo, 'siyang');
bindFoo('19');
var text = new bindFoo("@hg");
```
> bind的模拟实现参考：  
> [@听风是风 的文章](https://www.cnblogs.com/echolun/p/12178655.html)  
> [@DangoSky 的博客](http://blog.dangosky.com/2019/03/28/JS%E4%B9%8B%E6%A8%A1%E6%8B%9F%E5%AE%9E%E7%8E%B0/#toc-heading-4)
## 模拟实现防抖和节流函数
### 防抖
```html
<div id="container">防抖</div>
<button id="button">取消防抖</button>
```
```css
#container{
    width: 100%;
    height: 100px;
    border: 1px solid black;
    background-color: skyblue;
    font-size:
}
```
```js
function debounce(fn, wait, immediate) {
    let time = null;

    let debounced = function(...args) {
        // 将 this 指向当前绑定监听函数的 DOM 对象
        let _this = this;
        // console.log(_this)

        // 以新的事件的时间为准，更新时间，n秒后才执行
        if(time) {
            clearTimeout(time);
        }

        // 事件触发的时候立刻执行 fn ，再防抖
        if(immediate) {
            if(!time) {
                fn.apply(_this, args);
            }
            time = setTimeout(function() {
                time = null;
            }, wait)
        } else {
            time = setTimeout(function() {
                fn.apply(_this, args);
            }, wait);
        }
    };

    // 另一个需求：希望有一个按钮，点击后，取消防抖，这样再去触发的时候，就可以又立刻执行
    debounced.cancel = function() {
        clearTimeout(time);
        time = null;
    };

    return debounced;
}
                
var count = 1;
var container = document.getElementById("container");
function getUserAction() {
    container.innerHTML = count++;
};
var setUserAction = debounce(getUserAction, 1000, true);
container.onmousemove = setUserAction;
document.getElementById("button").addEventListener('click', function() {
    setUserAction.cancel();
})
```
### 节流
函数节流的两种方法
  - 时间戳：只要触发，就用 Date 获取现在的时间，与上一次的时间比较。
      ```js
      function rottle(func, wait) {
          var previous = 0;

          return function(...args) {
              var now = +new Date();
              // 如果时间差大于规定的等待时间，就可以执行一次
              // 目标函数执行以后，就更新 previous 值，确保它是“上一次”的时间
              // 否则就等下一次触发时继续比较。
              if(now - previous > wait) {
                  func.apply(this, args);
                  previous = now;
              }
          }
      }
      ```
  - 定时器：当触发事件的时候，我们设置一个定时器。再触发事件的时候，如果定时器存在，就不执行；直到定时器执行后，执行函数，清空定时器，这样就可以设置下个定时器。
      ```js
      function throttle(func, wait) {
          var timeout = null;

          return function(...args) {
              let context = this;
              if(!timeout) {
                  timeout = setTimeout(function() {
                      timeout = null;
                      func.apply(context, args);
                  }, wait)
              }
          }
      }
      ```
  - 比较两个方法：
      - 时间戳事件会立刻执行，定时器事件会在 n 秒后第一次执行
      - 时间戳事件停止触发后没有办法再执行事件，定时器事件停止触发后依然会再执行一次事件
  
时间戳和定时器的结合（可实现 有头有尾、有头无尾、无头有尾 三种形式）  
有头有尾：鼠标移入能立刻执行，停止触发的时候还能再执行一次；  
有头无尾：鼠标移入能立刻执行，停止触发后不再执行；  
无头无尾：鼠标移入不能立刻执行，停止触发后不再执行；
```js
function throttle(fn, wait, options) {
    let time = null, previous = 0;

    // 根据传的值判断要有头无尾还是无头有尾
    // leading：false 表示禁用第一次执行（无头有尾）
    // trailing: false 表示禁用停止触发的回调（有头无尾）
    if(!options) {
        // 代表要执行有头有尾
        options = {
            leading：true;
            trailing: true;
        };
    }

    let throttled = function(...args) {
        let _this = this;
        let now = new Date().getTime();
        // 无头有尾的准备工作
        if(!previous && options.leading===false) {
            previous = now;
        }
        let remaining = wait - (now - previous);
        // 有头的代码：即时间戳
        // 如果没有剩余的时间了或者你改了系统时间
        if(remaining<=0 || remaining>wait) {
            if(time) {
                clearTimeout(time);
                time = null;  // 设置为null，让定时器可以启动
            }
            previous = now;  // 及时更新时间戳
            fn.apply(_this, args);
            // if(!time) context = args = null;
        } 
        // 有尾的代码：即定时器
        else if(!time && options.trailing!==false) {
            time = setTimeout(() {
                previous = 0;
                time = null;
                fn.apply(_this, args);
                // if(!time) context = args = null;
            }, remaining);
        }
    };

    throttled.cancel = function() {
        clearTimeout(time);
        time = null;
        previous = 0;
    }

    return throttled;
}

var count = 1;
var container = document.getElementById("container");
function getUserAction() {
    container.innerHTML = count++;
};
// leading:false 表示禁用第一次执行
// trailing:false 表示禁用停止触发的回调
var setUserAction = throttle(getUserAction, 1000, {leading:false});
container.onmousemove = setUserAction;
```