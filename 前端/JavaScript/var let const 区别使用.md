## var let const 区别使用<!-- omit in toc -->
    目录
- [var](#var)
- [let](#let)
- [const](#const)
- [变量提升](#变量提升)

=========

    正文

=========
### var 
**用于声明变量 ,变量声明的同时，可以赋值也可不赋值。**
- 注意1：
    - 变量名可以包含字母，数字，下划线和美元符号，但要以字母开头【也可以以$和_开头（但一般不这么用）】。
    - 变量名是大小写敏感的（y和Y是不同的变量）
    - 保留字（如JavaScript关键字）不能作为变量名使用
- 注意2：var会发生“变量提升”现象。

### let
**它的用法类似于var，但是所声明的变量，只在let命令所在的代码块内有效。**
- 注意1：只在声明所在的块级作用域内有效。
- 注意2：let不允许在相同作用域内，重复声明同一个变量。
- 注意3：let不像var那样会发生“变量提升”现象。
    ```js
    // 报错
    function() {
        let a = 10;
        var a = 1;
    }
    // 报错
    function() {
        let a = 10;
        let a = 1;
    }
    // 报错
    function func(arg) {
        let arg; 
    }

    // 不报错
    function func(arg) {
        {
            let arg; 
        }
    }
    ```     
    因此，不能在函数内部重新声明参数。

### const
**声明一个只读的常量。一旦声明，常量的值就不能改变；且声明变量时，就必须立即初始化，不能留到以后赋值。**
- 注意1：const的作用域与let命令相同：只在声明所在的块级作用域内有效。
- 注意2：const命令声明的常量也是不提升，只能在声明的位置后面使用。
- 注意3：const声明的常量，也与let一样不可重复声明。
- 注意4：对于复合类型的变量，变量名不指向数据，而是指向数据所在的地址。**const命令只是保证变量名指向的地址不变，并不保证该地址的数据不变**，所以将一个对象声明为常量必须非常小心。   
    栗子1：
    ```js
    const foo = {};
    foo.prop = 123;

    foo.prop // 123

    foo = {}; // TypeError："foo" is read-only
    ```
    上面代码中，常量foo储存的是一个地址，这个地址指向一个对象。不可变的只是这个地址，即不能把foo指向另一个地址，但对象本身是可变的，所以依然可以为其添加新属性。  
    栗子2：
    ```js
    const a = [];
    a.push('Hello'); // 可执行
    a.length = 0;    // 可执行
    a = ['Dave'];    // 报错
    ```
    上面代码中，常量a是一个数组，这个数组本身是可写的，但是如果将另一个数组赋值给a，就会报错。

### 变量提升
把变量声明提升到当前执行环境的最顶端  
```js
console.log(foo); // 输出undefined
console.log(bar); // 报错ReferenceError

var foo = 2;
let bar = 2;

// 可隐式地理解为：
var foo;
console.log(foo); // undefined
console.log(bar); // 报错ReferenceError
foo = 2;

let bar = 2;
```
上面代码中，由于 `var` 发生了“变量提升”现象，将 `foo` 的声明提升到了 `console.log(foo)` 前面，即脚本开始运行时，变量 `foo` 已经存在了，但是没有值，所以会输出 `undefined`。  
变量 `bar` 用 let命令声明，不会发生变量提升。这表示在声明它之前，变量bar是不存在的，这时如果用到它，就会抛出一个错误。

- `var` 和 `function` 的变量提升是有优先级的，且 `function` 的高于 `var` 的。如果函数名字相同，后面函数会覆盖前面的函数。
```js
var a;
function a() {};
console.log(a) // ƒ a() {}

// 可以隐式地理解为：
function a() {};
var a;
console.log(a); // ƒ a() {}
```
- 当遇到函数和变量同名且都会被提升的情况，由于函数声明优先级比较高，因此变量声明会被函数声明所覆盖，但是可以重新赋值。
```js
alert(a); // 输出：function a(){ alert('我是函数') }
function a() { alert('我是函数') }
var a = '我是变量';
alert(a);   //输出：'我是变量'

// 上面代码可以隐式的理解为：
function a(){alert('我是函数')} 
var a;    // undefined
alert(a);    //输出：function a(){ alert('我是函数') }
a = '我是变量';//赋值
alert(a);   //输出：'我是变量'
```
- var 和 function 的变量提升优先级显而易见，但如果是函数声明`function foo(){}`和函数表达式`var foo = function(){}`呢？
```js
console.log(f1) // function f1(){}
console.log(f2) // undefined
var f2 = function() {} // 函数表达式
function f1() {} // 函数声明
```
上面的代码并不是说函数声明的提升优先级高于函数表达式，而是因为当遇到函数表达式的时候，首先会将**关键字+变量名**提升到当前执行环境的最顶端，也就是`var f2` 先被提升，然而此时 `f2` 的值为 `undefined`，所以 `f2` 打印值为 `undefined`。