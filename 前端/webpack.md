## webpack
webpack是一种前端资源构建工具，一个静态模块打包器。  
它会根据入口文件的依赖关系，将资源引进来，形成chunk代码块，根据不同资源进行编译，这个处理过程我们叫打包，打包输出的文件叫bundle
### 五个核心概念
1. entry  
入口(Entry)指示 webpack 以哪个文件为入口起点开始打包，分析构建内部依赖图。
2. output  
输出(Output)指示 webpack 打包后的资源 bundles 输出到哪里去，以及如何命名。
3. loader  
Loader 让 webpack 能 够 去 处 理 那 些 非 JavaScript 文 件 (webpack 自 身 只 理 解 JavaScript)
4. plugins  
插件(Plugins)可以用于执行范围更广的任务。插件的范围包括，从打包优化和压缩， 一直到重新定义环境中的变量等。
5. mode  
模式(Mode)指示 webpack 使用相应模式的配置。

|选项|描述|特点|
|:--:|:--|:--:|
|development|会将 DefinePlugin 中 process.env.NODE_ENV 的值设置 为 development。<br>启用 NamedChunksPlugin 和 NamedModulesPlugin。（开发模式）|能让代码本地调试 运行的环境|
|production|会将 DefinePlugin 中 process.env.NODE_ENV 的值设置 为 production。<br>启用 FlagDependencyUsagePlugin, FlagIncludedChunksPlugin, ModuleConcatenationPlugin, NoEmitOnErrorsPlugin, OccurrenceOrderPlugin, SideEffectsFlagPlugin 和 TerserPlugin。（生产模式）|能让代码优化上线 运行的环境|
### webpack 开发环境的基本配置
#### 创建配置文件
1. 创建文件   
webpack.config.js 
2. 配置代码
    ```js
    const { resolve } = require('path'); // node 内置核心模块，用来处理路径问题。
    module.exports = { 
        // 入口文件 
        entry: './src/js/index.js',
        // 输出配置 
        output: {  
            filename: './built.js', // 输出文件名 
            path: resolve(__dirname, 'build/js') // 输出文件路径配置 
        },
        //开发环境 
        mode: 'development' 
    };
    ```
3. 运行指令: webpack
#### 打包样式资源
