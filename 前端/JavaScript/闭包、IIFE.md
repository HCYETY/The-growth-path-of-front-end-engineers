## 闭包、IIFE
闭包是指有权访问外层函数作用域中的变量的函数。  
**创建闭包的常见方式：就是在一个函数内部创建另一个函数。**

下面从执行上下文的角度看下闭包是怎么一回事：
```js
var scope = "global scope";
function checkscope() {
    var scope = "local scope";
    function f() {
        return scope;
    }
    return f;
}

var foo = checkscope();
foo();
```
首先要分析一下这段代码中执行上下文栈和执行上下文的变化情况。
1. 进入全局代码，创建全局执行上下文，全局执行上下文压入执行上下文栈
2. 全局执行上下文初始化
3. 执行 checkscope 函数，创建 checkscope 函数执行上下文，checkscope 执行上下文被压入执行上下文栈
4. checkscope 执行上下文初始化，创建变量对象、作用域链、this等
5. checkscope 函数执行完毕，checkscope 执行上下文从执行上下文栈中弹出
6. 执行 f 函数，创建 f 函数执行上下文，f 执行上下文被压入执行上下文栈
7. f 执行上下文初始化，创建变量对象、作用域链、this等
8. f 函数执行完毕，f 函数上下文从执行上下文栈中弹出

> 思考一个问题：当 f 函数执行的时候，checkscope 函数上下文已经被销毁了(即从执行上下文栈中被弹出)，怎么还会读取到 checkscope 作用域下的 scope 值呢？
- 这是因为 f 执行上下文维护了一个作用域链：
    ```js
    fContext = {
        Scope:[AO, checkscopeContext.AO, globalContext.VO]
    }
    ```
- 就是因为这个作用域链，`f` 函数依然可以读取到 `checkscopeContext.AO` 的值，说明当 `f` 函数引用了 `checkscopeContext.AO` 中的值的时候，即使 `checkscopeContext` 被销毁了，但是 JavaScript 依然会让 `checkscopeContext.AO` 活在内存中，`f` 函数依然可以通过 `f` 函数的作用域链找到它，正是因为 JavaScript 做到了这一点，从而实现了闭包这个概念。


### 一道刷题必刷，面试必考的闭包题：
```js
var data = [];
for(var i = 0; i < 3; i++) {
    data[i] = function() {
        console.log(i);
    };
}

data[0](); // 3
data[1](); // 3
data[2](); // 3
```
我们来分析一下为什么答案全为 3 ？
- 当执行到 data[0] 函数之前，此时全局上下文的 VO 为：
```js
globalContext = {
    VO:{
        data:[...],
        i:3
    }
}
```
- 当执行 data[0] 函数的时候，data[0] 函数的作用域链为：
```js
data[0]Context = {
    Scope:[AO, globalContext.VO]
}
```
- data[0]Context 的 AO 并没有 i 值，所以会从 globalContext.VO 中查找，i 为 3，所以打印的结果就是 3。
- data[1] 和 data[2] 是一样的道理。

**将上面的题改成闭包看看：**
```js
var data = [];
for(var i = 0; i < 3; i++) {
    data[i] = (function(i) {
        return function() {
            console.log(i);
        }
    })(i);
}

data[0]();
data[1]();
data[2]();
```
- 当执行到 data[0] 函数之前，此时全局上下文的 VO 为：（跟没改之前一模一样）
    ```js
    globalContext = {
        VO:{
            data:[...],
            i:3
        }
    }
    ```
- 当执行 data[0] 函数的时候，data[0] 函数的作用域链发生了改变：
    ```js
    data[0]Context = {
        Scope:[AO, 匿名函数Context.AO, globalContext.VO]
    }
    ```
- 匿名函数执行上下文的AO为：
    ```js
    匿名函数Context = {
        AO:{
            arguments:{
                0:0,
                length:1
            },
            i:0
        }
    }
    ```
- `data[0]Context` 的 AO 并没有 i 值，所以会沿着作用域链从匿名函数` Context.AO` 中查找，这时候就会找 i 为 0，找到了就不会往 `globalContext.VO` 中查找了（即使 `globalContext.VO` 也有 i 的值--为3），所以打印的结果就是0。
- data[1] 和 data[2] 是一样的道理。

以下代码块中，c 会报错，并不会读取到bar 执行上下文中变量对象c
```js
var fn = null;
function foo() {
    var a = 2;
    function innerFoo() {
        console.log(c);
        console.log(a);
    }
    fn = innerFoo;
}
function bar() {
    var c = 100;
    fn();
}

foo();
bar();
```
- 虽然fn()，即innerFoo()是在bar里面执行的，但是innerFoo函数的时候他的作用域scope里面分别是`[AO,fooContext.AO, globalContext.AO]`，并没有包括barContext.AO在里面，所以根本就没有声明c这个变量，所以报错

### IIFE
当函数变成立即执行的函数表达式时，表达式中的变量不能从外部访问
```js
(function() {
    var name = "Barry";
})();
// 无法从外部访问变量 name
name // 抛出错误："Uncaught ReferenceError:name is not defined"
```
将 IIFE 分配给一个变量，不是存储 IIFE 本身，而是存储 IIFE 执行后返回的结果。
```js
var result = (function() {
    var name = "Barry";
    return name;
})();
// IIFE 执行后返回的结果：
result; // "Barry"
```