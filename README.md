## Hapi 项目初始化。

1. npm init自动创建一个项目，生成package.json文件。

2. 新建配置文件.babelrc，

```shell
$ npm install --save-dev babel-preset-es2015
```

```shell
$ npm install --save-dev babel-preset-react
```


# ES7不同阶段语法提案的转码规则（共有4个阶段），选装一个

```shell
$ npm install --save-dev babel-preset-stage-0
$ npm install --save-dev babel-preset-stage-1
$ npm install --save-dev babel-preset-stage-2
$ npm install --save-dev babel-preset-stage-3
```

然后将这些规则加入到.babelrc文件中：

```js
 {
    "presets": [
      "es2015",
      "react",
      "stage-1"
    ],
    "plugins": []
  }
  ```

3. 安装babel-register，就可以改写require命令，新建babel.js，写入：

```shell
npm install --save-dev babel-register
```

```js
require('babel-register');
module.exports = require('./server.js');
```

这样后面的文件就可以用import 代替require，import的优点在于可以引入所需方法或者变量，而不需要加载整个模块，提高了性能。

4. transform-runtime可以启用相应的es6语法插件。

```shell
npm install babel-plugin-transform-runtime
```

5. 安装eslint插件用于静态检查代码的语法和风格，

```shell
npm install --save-dev eslint babel-eslint
```

然后在根目录下新建一个.eslintrc配置文件，写入:

```js
{
  "parser": "babel-eslint",
  "rules": {
    ...
  }
}
```

     指定解析器parser是babel-eslint。

     rules写的是自定义eslint规则，具体参考官方文档。

     另外还需要指定环境，这里的环境env是node和es6，指定为true。

     .eslintrc格式可以有多种，分别为javascript格式：.eslintrc.js

     YAML格式：.eslintrc.yml（建议）

     JSON格式：.eslintrc.json（建议）

     .eslintrc,可以使json也可以是yaml

     也可以在package.json里面用eslintConfig配置。

     还可以添加扩展extends，比如添加自己喜爱的airbnb/base代码规范，这样rules里面的配置将覆盖扩展里面的父规则。

     创建.eslintignore可以忽略指定文件的代码检查。

6. 我们在使用 Git 进行版本控制的时候，有些文件是无需纳入 Git 管理的，通常都是些自动 生成的文件，像日志或者编译过程中创建的文件。我们可以创建一个名为 .gitignore 的文件，列出要忽略的文件来解决这个问题。
