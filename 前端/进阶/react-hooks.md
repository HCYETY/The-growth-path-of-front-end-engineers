> [阮一峰的网络日志：React Hooks 入门教程](https://www.ruanyifeng.com/blog/2019/09/react-hooks.html)    
> [官网：Hook 概览](https://react.docschina.org/docs/hooks-overview.html)   
> [react-hooks如何使用？](https://juejin.cn/post/6864438643727433741)    
> [一文吃透react-hooks原理](https://juejin.cn/post/6944863057000529933)  


1. 在无状态组件每一次函数上下文执行的时候，react用什么方式记录了hooks的状态？
2. 多个react-hooks用什么来记录每一个hooks的顺序的 ？ 换个问法！为什么不能条件语句中，声明hooks? hooks声明为什么在组件的最顶部？
3. function函数组件中的useState，和 class类组件 setState有什么区别？
4. react 是怎么捕获到hooks的执行上下文，是在函数组件内部的？
5. useEffect,useMemo 中，为什么useRef不需要依赖注入，就能访问到最新的改变值？
6. useMemo是怎么对值做缓存的？如何应用它优化性能？
7. 为什么两次传入useState的值相同，函数组件不更新?