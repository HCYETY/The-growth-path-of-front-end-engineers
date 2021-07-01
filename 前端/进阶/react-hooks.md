> [react-hooks如何使用？](https://juejin.cn/post/6864438643727433741)    
> [一文吃透react-hooks原理](https://juejin.cn/post/6944863057000529933)  

Q：什么是Hook？   
A：Hook 是一些可以让你在函数组件里“钩入” React state 及生命周期等特性的函数。

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

#### React 默认提供的四个最常用的钩子。
1. useState()：状态钩子  
在一个组件中多次使用 State Hook
```js
const [state, setState] = useState(initialState);
```
- 语法：该函数返回一个数组，数组的第一个成员是一个变量（state），指向状态的当前值。第二个成员是一个函数（更新 state 的函数），用来更新状态，约定是set前缀加上状态的变量名。
    - 在初始渲染期间，返回的状态 (state) 与传入的第一个参数 (initialState) 值相同。
    - setState 函数用于更新 state。它接收一个新的 state 值并将组件的一次重新渲染加入队列。
    - 在后续的重新渲染中，useState 返回的第一个值将始终是更新后最新的 state。
- 这个函数运用了数组解构，上面的代码相当于
```js
var stateVariable = useState(initialState); // 返回一个有两个元素的数组
var state = stateVariable[0]; // 数组里的第一个值
var setState = stateVariable[1]; // 数组里的第二个值
```

2. useContext()：共享状态钩子
```js
const value = useContext(MyContext);
```
- 语法：接收一个 context **对象**（`React.createContext` 的返回值）并返回该 context 的当前值。当前的 context 值由上层组件中距离当前组件最近的 `<MyContext.Provider>` 的 `value` prop 决定。
- 实现过程：当组件上层最近的 `<MyContext.Provider>` 更新时，该 Hook 会触发重渲染，并使用最新传递给 `MyContext` provider 的 context `value` 值。即使祖先使用 React.memo 或 shouldComponentUpdate，也会在组件本身使用 `useContext` 时重新渲染。
> `useContext(MyContext)` 只是让你能够读取 `context` 的值以及订阅 `context` 的变化。你仍然需要在上层组件树中使用 `<MyContext.Provider>` 来为下层组件提供 `context`。
- 步骤：
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
- 用途：在组件之间共享状态

3. useReducer()：action 钩子
```js
const [state, dispatch] = useReducer(reducer, initialState);
```
- 语法：它接受状态的初始值和 Reducer 函数作为参数，返回一个数组。数组的第一个成员是状态的当前值，第二个成员是发送 action 的dispatch函数。
- 用途：在某些场景下，useReducer 会比 useState 更适用，例如 state 逻辑较复杂且包含多个子值，或者下一个 state 依赖于之前的 state 等。并且，使用 useReducer 还能给那些会触发深更新的组件做性能优化，因为你可以向子组件传递 dispatch 而不是回调函数。

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

4. useEffect()：副作用钩子   

Effect Hook 可以让你在函数组件中执行副作用操作   
副作用：与业务主逻辑关联不大而且在特定的时间或事件中执行
> 提示:   
如果你熟悉 React class 的生命周期函数，你可以把 useEffect Hook 看做 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数的组合。

```js
useEffect(()  =>  {
  // Async Action
}, [dependencies])
```
- 该函数接受两个参数。第一个参数是一个函数，异步操作的代码放在里面。第二个参数是一个数组，用于给出 Effect 的依赖项，只要这个数组发生变化，useEffect()就会执行。第二个参数**可以省略**，这时**每次组件渲染时**，就会执行useEffect()。
    - 赋值给 useEffect 的函数会在组件渲染到屏幕之后执行。
    - 默认情况下，effect 将在每轮渲染结束后执行，但你可以选择让它 在只有某些值改变的时候 才执行。
- 在 React 组件中有两种常见副作用操作：需要清除的和不需要清除的。
    - 清除 effect   
    通常，组件卸载时需要清除 effect 创建的诸如订阅或计时器 ID 等资源。要实现这一点，useEffect 函数需返回一个清除函数（如果你的 effect 返回一个函数，React 将会在执行清除操作时调用它，这是 effect 可选的清除机制）。以下就是一个创建订阅的例子：
        ```js
        useEffect(() => {
            const subscription = props.source.subscribe();
            return () => {
                // 清除订阅
                subscription.unsubscribe();
            };
        });
        ```
        - Q：React 何时清除 effect？    
          A：为防止内存泄漏，React 会在组件卸载的时候执行清除操作。另外，如果组件多次渲染（通常如此），则**在执行下一个 effect 之前，上一个 effect 就已被清除**。
    - 不清除 effect   
    有时候，我们只想在 React 更新 DOM 之后运行一些额外的代码。比如发送网络请求，手动变更 DOM，记录日志，这些都是常见的无需清除的操作。因为我们在执行完这些操作之后，就可以忽略他们了。
        - 如果不需要清除副作用，就可以不用返回函数
- 用途：向服务器请求数据，设置订阅，手动更改 React 组件中的 DOM 等都属于副作用。
> 参考链接 ->   
> [阮一峰的网络日志：React Hooks 入门教程](https://www.ruanyifeng.com/blog/2019/09/react-hooks.html)
> [官网：使用 Effect Hook](https://react.docschina.org/docs/hooks-effect.html)   
> [官网：Hook API 索引](https://react.docschina.org/docs/hooks-reference.html)

#### 自定义 Hook


**更多 hooks 可参考官网学习：**[Hook API 索引](https://react.docschina.org/docs/hooks-reference.html)

1. 在无状态组件每一次函数上下文执行的时候，react用什么方式记录了hooks的状态？
2. 多个react-hooks用什么来记录每一个hooks的顺序的 ？ 换个问法！为什么不能条件语句中，声明hooks? hooks声明为什么在组件的最顶部？
3. function函数组件中的useState，和 class类组件 setState有什么区别？
4. react 是怎么捕获到hooks的执行上下文，是在函数组件内部的？
5. useEffect,useMemo 中，为什么useRef不需要依赖注入，就能访问到最新的改变值？
6. useMemo是怎么对值做缓存的？如何应用它优化性能？
7. 为什么两次传入useState的值相同，函数组件不更新?
> [官网：Hooks FAQ](https://react.docschina.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback)