## react-hook <!-- omit in toc -->
    目录
- [三个常用的Hook](#三个常用的hook)
  - [State Hook（状态钩子）](#state-hook状态钩子)
  - [Effect Hook（副作用钩子）](#effect-hook副作用钩子)
  - [Ref Hook](#ref-hook)
- [其他常见钩子](#其他常见钩子)
  - [useContext()：共享状态钩子](#usecontext共享状态钩子)
  - [useReducer()：action 钩子](#usereduceraction-钩子)
- [其他 hooks](#其他-hooks)
  - [useMemo](#usememo)
  - [useCallback](#usecallback)
  - [useLayoutEffect](#uselayouteffect)
- [自定义 Hook](#自定义-hook)
- [关于 hook 的 FAQ](#关于-hook-的-faq)

=====

    正文

=====
Q：什么是Hook？   
A1：Hook是React 16.8.0版本增加的新特性/新语法  
A2：让我们可以在函数组件中使用 state 以及其他的 React 特性

> [react-hooks如何使用？](https://juejin.cn/post/6864438643727433741)    
> [一文吃透react-hooks原理](https://juejin.cn/post/6944863057000529933)  

react-hooks是react新增的钩子API，它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。目的是**增加代码的可复用性，逻辑性，弥补无状态组件没有生命周期，没有数据管理状态state的缺陷**。

Hook 本质就是 JavaScript 函数，但是在使用它时需遵循两条规则：
- 只在最顶层使用 Hook
    - 不要在**循环**，**条件**或**嵌套函数**中调用 Hook， 确保总是在你的 React 函数的最顶层以及任何 return 之前调用他们。
- 只在 React 函数中调用 Hook
    - 不要在普通的 JavaScript 函数中调用 Hook。你可以：
        - 在 React 的**函数组件**中调用 Hook
            - 注意：Hook 不能在 class 组件中使用，但这使得你不使用 class 也能使用 React
        - 在自定义 Hook 中调用其他 Hook 
> 具体原因参考 react官网：[Hook 规则](https://react.docschina.org/docs/hooks-rules.html)

### 三个常用的Hook
```
(1). State Hook: React.useState()
(2). Effect Hook: React.useEffect()
(3). Ref Hook: React.useRef()
```
#### State Hook（状态钩子）
State Hook让函数组件也可以有state状态, 并进行状态数据的读写操作

语法: `const [xxx, setXxx] = React.useState(initValue)`
- 这个函数运用了数组解构，上面的代码相当于
    ```js
    var stateVariable = useState(initialState); // 返回一个有两个元素的数组
    var xxx = stateVariable[0]; // 数组里的第一个值
    var setXxx = stateVariable[1]; // 数组里的第二个值
    ```
```
(1). useState()说明：
        参数: 第一次初始化指定的值在内部作缓存
        返回值: 包含2个元素的数组, 第1个为内部当前状态值, 第2个为更新状态值的函数
(2). setXxx()2种写法:
        setXxx(newValue): 参数为非函数值, 直接指定新的状态值, 内部用其覆盖原来的状态值
        setXxx(value => newValue): 参数为函数, 接收原本的状态值, 返回新的状态值, 内部用其覆盖原来的状态值
```

#### Effect Hook（副作用钩子）
Effect Hook 可以让你在函数组件中执行副作用操作（用于模拟类组件中的生命周期钩子）  
副作用：与业务主逻辑关联不大而且在特定的时间或事件中执行
```
(1). React中的副作用操作:
        发ajax请求数据获取
        设置订阅 / 启动定时器
        手动更改真实DOM
(2). 语法和说明: 
    赋值给 useEffect 的函数会在组件渲染到屏幕之后执行
    
        useEffect(() => { 
          // 在此可以执行任何带副作用操作
          
          // 如果不需要清除副作用，就可以不用返回函数
          return () => { // 在组件卸载前执行
            // 在此做一些收尾工作, 比如清除定时器/取消订阅等
            // 为防止内存泄漏，React 会在组件卸载的时候执行清除操作。另外，如果组件多次渲染（通常如此），则在执行下一个 effect 之前，上一个 effect 就已被清除。
          }
        }, [stateValue]) // 如果指定的是[], 回调函数只会在第一次render()后执行


        第二个参数用于给出 Effect 的依赖项，只要这个数组发生变化，useEffect()就会执行。
		如果不传入第二个参数，代表监控所有人，这时每次组件渲染时，就会执行useEffect()；如果传入一个空数组，代表谁也不监测；如果传入一个有变量的数组，代表监控该变量的数值变化，不仅如此，数组里还可以传入多个变量，代表可以监控多个变量的数值的改变。
    
(3). 可以把 useEffect Hook 看做如下三个函数的组合
        componentDidMount()---如果不传入第二个参数
        componentDidUpdate()---如果不传入第二个参数
    	componentWillUnmount() ---第一个参数的return的回调函数
```
#### Ref Hook
```js
const refContainer = useRef(initialValue); 
```
语法：useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（initialValue）。返回的 ref 对象在组件的整个生命周期内保持不变。
### 其他常见钩子
#### useContext()：共享状态钩子  
用途：在组件之间共享状态
 - ①使用 React Context API，需在组件外部建立一个 Context
    ```js
    const AppContext = React.createContext({});
    ```
 - ②用 `<MyContext.Provider>` 封装
    ```js
    <AppContext.Provider value={ {键:'值'} }>
        <div className="App">
            <组件1/>
            <组件2/>
        </div>
    </AppContext.Provider>
    ```
    上面代码中， `AppContext.Provider` 提供了一个 `Context` 对象，这个对象可以被子组件共享。
 - ③分别在子组件中获取该对象的值
    ```js
    // 组件1、2都是同样的操作：
    const { 步骤②中 `value` 的键 } = useContext(AppContext);
    ```
#### useReducer()：action 钩子
用途：在某些场景下，useReducer 会比 useState 更适用，例如 state 逻辑较复杂且包含多个子值，或者下一个 state 依赖于之前的 state 等。并且，使用 useReducer 还能给那些会触发深更新的组件做性能优化，因为你可以向子组件传递 dispatch 而不是回调函数。
```js
const [state, dispatch] = useReducer(reducer, initialState);
```
- 语法：它接受状态的初始值和 Reducer 函数作为参数，返回一个数组。数组的第一个成员是状态的当前值，第二个成员是发送 action 的dispatch函数。

下面是一个来自官网上栗子：
```js
const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  );
}
```
- 有两种不同初始化 useReducer state 的方式，你可以根据使用场景选择其中的一种。
    - 指定初始 state
        - 将初始 state 作为第二个参数传入 useReducer 是最简单的方法：
            ```js
            const [state, dispatch] = useReducer(
                reducer,
                {count: initialCount}
            );
            ```
    - 惰性初始化
        - 需要将 init 函数作为 useReducer 的第三个参数传入，这样初始 state 将被设置为 init(initialArg)
            ```js
            function init(initialCount) {       // <--
                return {count: initialCount};   // <--
            }                                   // <--

            function reducer(state, action) {
                switch (action.type) {
                    case 'increment':
                        return {count: state.count + 1};
                    case 'decrement':
                        return {count: state.count - 1};
                    case 'reset':                    // <--
                        return init(action.payload); // <--
                    default:
                        throw new Error();
                }
            }

            function Counter({initialCount}) {
                const [state, dispatch] = useReducer(reducer, initialCount, init);  // <--
                return (
                    <>
                        Count: {state.count}
                        <button onClick={() => dispatch({type: 'reset', payload: initialCount})}> // <--
                            Reset
                        </button>
                        <button onClick={() => dispatch({type: 'decrement'})}>-</button>
                        <button onClick={() => dispatch({type: 'increment'})}>+</button>
                    </>
                );
            }
            ```

> 由于 Hooks 可以提供共享状态和 Reducer 函数，所以它在这些方面可以取代 Redux。但是，它没法提供中间件（middleware）和时间旅行（time travel），如果你需要这两个功能，还是要用 Redux。
> [官网：Hook API 索引](https://react.docschina.org/docs/hooks-reference.html)
### 其他 hooks
#### useMemo
```js
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```
- 语法：把“创建”函数和依赖项数组作为参数传入 useMemo，它仅会在某个依赖项改变时才重新计算 memoized 值。如果没有提供依赖项数组，useMemo 在每次渲染时都会计算新的值。
- 注意：传入 useMemo 的函数会在渲染期间执行。不能在这个函数内部执行与渲染无关的操作，诸如副作用这类的操作属于 useEffect 的适用范畴，而不是 useMemo。
- 使用场景：我们知道无状态组件的更新是从头到尾的更新，如果你想要从新渲染一部分视图，而不是整个组件，那么用useMemo是最佳方案，避免了不需要的更新，和不必要的上下文的执行
- 优点：
  - 可以减少不必要的循环，减少不必要的渲染
  - 可以减少子组件的渲染次数
  - 让函数在某个依赖项改变的时候才运行，避免不必要的开销（这里要注意⚠️⚠️⚠️的是如果被useMemo包裹起来的上下文,形成一个独立的闭包，会缓存之前的state值,如果没有加相关的更新条件，是获取不到更新之后的state的值的，如下边⬇️）
    ```js
    const DemoUseMemo=()=>{
    const [ number ,setNumber ] = useState(0)
    const newLog = useMemo(()=>{
        const log =()=>{
            /* 点击span之后 打印出来的number 不是实时更新的number值 */
            console.log(number)
        }
        return log /* [] 没有 number */  
        
    },[])
    return <div>
        <div onClick={()=>newLog()} >打印</div>
        <span onClick={ ()=> setNumber( number + 1 )  } >增加</span>
    </div>
    }
    ```
#### useCallback
```js
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);

// 返回一个 memoized 回调函数。
```
- 语法：把内联回调函数及依赖项数组作为参数传入 useCallback，它将返回该回调函数的 memoized 版本，该回调函数仅在某个依赖项改变时才会更新。
- 使用场景：当你把回调函数传递给经过优化的并使用引用相等性去避免非必要渲染（例如 shouldComponentUpdate）的子组件时，它将非常有用。
- `useCallback(fn, deps)` 相当于 `useMemo(() => fn, deps)`。
#### useLayoutEffect
- `useLayoutEffect` 代码可能会阻塞浏览器的绘制
- useEffect 执行顺序 组件更新挂载完成 -> 浏览器dom 绘制完成 -> 执行useEffect回调 。
- useLayoutEffect 执行顺序 组件更新挂载完成 -> 执行useLayoutEffect回调-> 浏览器dom 绘制完成
- 如果我们在 `useEffect` 重新请求数据，渲染视图过程中，肯定会造成画面闪动的效果。而如果用 `useLayoutEffect` ，回调函数的代码就会阻塞浏览器绘制，所以肯定会引起画面卡顿等效果，那么具体要用 `useLayoutEffect` 还是 `useEffect` ，要看实际项目的情况，大部分的情况 `useEffect` 都可以满足的。
```js
const DemoUseLayoutEffect = () => {
    const target = useRef()
    useLayoutEffect(() => {
        /*我们需要在dom绘制之前，移动dom到制定位置*/
        const { x ,y } = getPositon() /* 获取要移动的 x,y坐标 */
        animate(target.current,{ x,y })
    }, []);
    return (
        <div >
            <span ref={ target } className="animate"></span>
        </div>
    )
}
```

**更多 hooks 可参考官网学习：**[Hook API 索引](https://react.docschina.org/docs/hooks-reference.html)

### 自定义 Hook
当两个函数组件需要共享相同的逻辑时，我们可以将其提取成第三个函数。

自定义 Hook 是一个函数，其名称必须以 “use” 开头（否则，由于无法判断某个函数是否包含对其内部 Hook 的调用，React 将无法自动检查你的 Hook 是否违反了），函数内部可以调用其他的 Hook。
> [自定义 Hook](https://react.docschina.org/docs/hooks-custom.html)
### 关于 hook 的 FAQ
1. 在无状态组件每一次函数上下文执行的时候，react用什么方式记录了hooks的状态？
2. 多个react-hooks用什么来记录每一个hooks的顺序的 ？ 换个问法！为什么不能条件语句中，声明hooks? hooks声明为什么在组件的最顶部？
3. function函数组件中的useState，和 class类组件 setState有什么区别？
4. react 是怎么捕获到hooks的执行上下文，是在函数组件内部的？
5. useEffect,useMemo 中，为什么useRef不需要依赖注入，就能访问到最新的改变值？
6. useMemo是怎么对值做缓存的？如何应用它优化性能？
7. 为什么两次传入useState的值相同，函数组件不更新?
> [官网：Hooks FAQ](https://react.docschina.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback)