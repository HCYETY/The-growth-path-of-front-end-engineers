## 实现一个 instanceof 函数
### 语法：a instanceof b
- a：某个实例对象；b：某个构造函数
- instanceof 运算符用于检测 b.prototype 是否存在于参数 a的原型链上。
- instanceof函数用来判断一个对象是否为一个对象的实例。
### 代码实现：（getPrototypeOf：获取某个实例对象的原型）
```js
function Person() { // 构造函数
    this.name = "siyang";
}
let p = new Person(); // 实例
console.log(p.name); // siyang

function myInstanceof(a, b) {
    let proto = Object.getPrototypeOf(a);
    while(true) {
        if(proto === b.prototype) return true;
        if(!proto) return false;
        proto = Object.getPrototypeOf(proto);
    }
}
console.log(myInstanceof(p, Object)); // true
console.log(myInstanceof(p, Array)); // false
```
## 模拟实现 call、apply、bind 函数
### call和apply的
apply
```js
// apply函数模拟思路
Function.prototype.simulate_apply = function(context, arr) {
    var context = context || window;
    context.fn = this;
    var result;
    if(!arr) {
        result = context.fn();
    } else {
        var args = [];
        for(let i=0; i<arr.length; i++) {
            args.push('arr['+i+']');
        }
        result = eval('context.fn('+args+')');
    }
    delete context.fn;
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
console.log(bar.simulate_apply(foo, ['hcy', '20']));
```
call
```js
// call函数模拟思路
Function.prototype.simulate_call = function(context) {
    // 6.假如this参数为null，视为指向window
    context = context || window;
    // 1.改变this的指向
    context.fn = this;
    // 4.用数组存放不定长的参数
    var args = [];
    for(let i=1; i<arguments.length; i++) {
        args.push('arguments['+i+']');
    }
    // 2.执行函数 + 5.把参数数组放到要执行的函数的参数里
    var result = eval('context.fn('+args+')');
    // 3.删除函数
    delete context.fn;
    // 7.函数是可以有返回值的
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
console.log(bar.simulate_call(foo, 'siyang', '19'));
```
bind
- bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数。(来自于 MDN )
- bind 函数的三个特点：
    - 返回一个函数
    - 可以传入参数
    - 一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this值被忽略，同时调用时的参数被提供给模拟函数。
```js
// bind函数模拟思路
Function.prototype.simulate_bind = function(context) {
    if (typeof this !== "function") {
        throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
    }
    var _this = this;
    // 获取 simulate_bind函数 从第二个参数到最后一个参数，转换成一个正式数组
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function () {};

    // bind函数特点之一：返回一个函数
    var fBound = function() {
        // 这个时候的arguments是指bind返回的函数传入的参数
        var bindArgs = Array.prototype.slice.call(arguments);
        // 之所以return，是考虑到绑定函数可能是有返回值的
        return _this.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));
    }
    
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
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
```