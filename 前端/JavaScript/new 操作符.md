## new 操作符
- new 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象类型之一
- new的功能
```js
function Otaku(name, age) {
    this.name = name;
    this.age = age;
    this.habit = 'Games';
}

Otaku.prototype.strength = 60;
Otaku.prototype.sayYourNmae = function() {
    console.log('I am ' + this.name);
}

var person = new Otaku('Kevin', '18');

console.log(person.name); // Kevin
console.log(person.habit); // Games
console.log(person.strength); // 60
person.sayYourName(); // I am Kevin
```
从这个例子中，我们可以看到，实例 person 可以：
- 访问到 Otaku 构造函数里的属性
- 访问到 Otaku.prototype 中的属性
  
实践：模拟实现 new 函数
```js
function create_new() {
    // 要实现的功能：
    // 1.返回一个新对象
    // 2.访问到 person 构造函数里的属性
    // 3.访问到 person.prototype 中的属性

    // 1.从Object.prototype上克隆一个对象
    let obj = new Object();
    // 2.取得外部传入的构造器
    let constructor = [].shift.call(arguments);
    // 3.指向正确的原型
    let F = function() {};
    F.prototype = constructor.prototype;
    obj = new F();
    // 2.借用外部传入的构造器给obj设置属性
    let res = constructor.apply(obj, arguments);
        // obj：这个对象将代替constructor类里this对象
        // arguments：这个是数组，它将作为参数传给constructor
    return typeof ret === 'object' ? res : obj; // 确保构造器总是返回一个对象

}

function person(name, age) {
    this.name = name;
    this.age = age;
    this.idol = 'hcy';
}
person.prototype.color = 'red';
person.prototype.sayHi = function() {
    console.log("Hello " + this.name);
}
let child = create_new(person, 'siyang', '19');
console.log(child.name); // siyang
console.log(child.age); // 19
console.log(child.idol); // hcy
console.log(child.color); // red
child.sayHi(); // Hello siyang
```