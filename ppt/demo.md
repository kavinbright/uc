title: 学习总结
speaker: 张亮
url: https://github.com/ksky521/nodeppt
transition: cards
files: /js/demo.js,/css/demo.css,

[slide]

# 学习总结
## react性能优化

[slide]
# 性能检测工具
- 在react16版本以及以后的版本中，只需要在URL的后面添加```?react_pref```，就可以在chrome浏览器的performance，我们可以查看User Timeing来查看组件的加载时间.
```js
http://localhost:3000/?react_pref
```
- 如果是react16之前的版本，则需要单独引入react_pref工具。
开始记录：Perf.start()
结束记录：Perf.stop()
打印结果：printInclusive()
```js
import Perf from 'react-addons-perf'
window.Perf = Perf //
```



[slide]

# Demo / index.js {:&.flexbox.vleft}
## 
```es
import App from './App';
const initial_state = [];
const STORE_SIZE = 5000;
for (let i = 0; i < STORE_SIZE; i++) {
  initial_state.push({id: i, marked: false});
}

function itemsReducer(state = initial_state, action) {
  switch (action.type) {
  case 'MARK':
    return state.map((item) =>
      action.id === item.id ? {...item, marked: !item.marked } : item
    );
  default:
    return state;
  }
}

const store = createStore(combineReducers({items: itemsReducer}));

export default class NaiveList extends Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}

render(
    <NaiveList />,
    document.getElementById('root')
)
``` 

[slide] 
# Demo / App.js  {:&.flexbox.vleft}
```js
class Item extends Component {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.id);
  }

  render() {
    const {id, marked} = this.props;
    const bgColor = marked ? 'red' : '#fff';
    console.log(id);
    return (
      <div
        style={{
          padding:'20px',
          border: '1px solid',
          fontSize: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bgColor,
          height: "20px"
        }}
        onClick={this.onClick}
      >
        {id}
      </div>
    );
  }
}

class App extends Component {
  render() {
    const { items, markItem } = this.props;
    return (
      <div className="main" style={{overflow: 'scroll', height: '600px'}}>
        {items.map(item =>
          <Item key={item.id} id={item.id} marked={item.marked} onClick={markItem} />
        )}
      </div>
    );
  }
};

function mapStateToProps(state) {
  return state;
}

const markItem = (id) => ({type: 'MARK', id});

export default connect(mapStateToProps, {markItem})(App);

```

[slide]
# 测试数据
  ![react组件](/image/react-render-all.png "haha")
  - 将近70%的耗时都是由脚本执行引起的.
  - 通过工具检测工具发现，其实时间主要开销在updateComponent函数中。

[slide]

# 引入讨论
- 如上所述，我们定义一个父组件，其包含了5000个子组件。当我们点击某一个子组件时候，对应的那个子组件背景色变红。
```js
<Components>
  <Components-1 />
  <Components-2 />
  <Components-3 />
  ...
  <Components-5000 />
</Components>
```
- 这样我们点击序号为98的列的时候，则子组件98背景色变化，但是在这个过程中，所有的子组件都进行了重新渲染，导致整体渲染变慢。造成这种现象的原因是 React中父组件更新默认触发所有子组件更新。
- 同时，我们经常在遍历列表元素时候会遇到这样的提示：
```js
Warning: Each child in an array or iterator should have a unique "key" prop.
```
- 父组件更新默认触发所有子组件更新。


[slide]
# React组件更新流程
  ![react组件](/image/react-update.png "haha")
- React的性能瓶颈主要出现在生成DOM及DOM Diff的过程
1. shouldComponentUpdate 阶段判断，如果属性及状态与上一次相同，这个时候很明显UI不会变化，也不需要执行后续生成DOM，DOM Diff的过程了，可以提高性能。
2. DOM Diff 阶段优化，提高Diff的效率。
----

[slide]

## 解决试探
- 子组件执行 ** shouldComponentUpdate ** 方法，自行决定是否更新
- 给列表中的组件添加key属性
----


[slide]
- 阻止渲染的发生

```
  shouldComponentUpdate(nextProps) {
    if (this.props["marked"] === nextProps["marked"]) {
      return false;
    }
    return true;
  }
```

- 给每一个子组件添加唯一的key

```
class App extends Component {
  render() {
    const { ids } = this.props;
    return (
      <div>
        {ids.map(id => {
          return <Item key={id} id={id} />;
        })}
      </div>
    );
  }
}
```
----

[slide]
# 改善之后耗时统计
  ![react组件](/image/react-render-update.png "haha")
  - 默认情况下，状态改变之后就会执行render函数，但是并不意味着浏览器中的DOM树会发生改变，DOM树的修改与否是由Virtual Tree决定（diff算法）。
  - 在默认情况下，只要状态发生改变，组件就会执行render函数重新渲染。我们可以通过shouldComponentUpdate来组织这种默认行为，只让状态发生改变的子组件渲染。

[slide]
# Tips
- 在shouldUpdateComponent函数中做限定。
- 使用pureComponent纯组件（在state或者props经常改变的时候不推荐使用，反而会使得性能底下）。
- 设置正确的缺省值。
```js
//错误
<RadioGroup options={this.props.options || []} />
//正确
const DEFAULT_OPTIONS = []
<RadioGroup options={this.props.options || DEFAULT_OPTIONS} />
```
- 合理使用key属性。（react采用启发式算法对组件进行更新，销毁的，唯一的key可以帮助react快速找到相应的目标组件）
```js
> 1. 数组动态创建的子组件。
> 2. 为一个有复杂繁琐逻辑的组件添加key后，后续操作可以改变该组件的key属性值，从而达到先销毁之前的组件，再重新创建该组件。
```

[slide]
#  第三方工具immutableJS
-  shallowCopy（浅复制）或 deepCopy（深复制）
- javascript在对象中一般是引用赋值。虽然可以节约内存，但是应用复杂之后会造成状态混乱和不可预测。
- shouldUpdateComponent是浅比较对象，深层次的数据结构根本不管用，性能非常差。。而immutanleJs使用hashcode可以解决。
```js
var foo = {a: 1};
var bar = foo; 
bar.a = 2;
console.log(foo.a)  //输出： 2
```
- Immutable应运而生。Immutable并不是专门应用于react的。

[slide]
# ImmutableJs
  ![react组件](/image/immutableJs.gif "haha")
- persistent data structure （持久化数据结构）
- structural sharing （结构共享）
- support lazy operation （惰性操作）

[slide]
# ImmutableJs
- 丰富的语法糖
> 之前的方式，为了在不污染原对象的前提下增加新的KV。
```js
var state = Object.assign({}, state, {
	key: value
});
```
> 使用了immutableJs之后
```js
var state = state.set('key', value);
```
> 很显然，对于复杂的state结构，使用immutableJs提供的api接口，更为容易。

- 性能的提升
> 由于 immutable 内部使用了 Trie 数据结构来存储，只要两个对象的 hashCode 相等，值就是一样的。这样的算法避免了深度遍历比较，性能非常好。这对我们在进行具体渲染过程中的性能优化非常有用。同事也能都解决浅复制导致的不可控。

[slide]
# 使用了immutableJs之后
![immutable](/image/react-immutable.png "性能检测")

[slide]
# Immutable的缺陷
- 文件大，压缩之后50多k，增加资源文件的大小。
- 有很多新的api需要学习成本
- 容易与原生对象混淆
- 代码侵入性太强，适合新的项目，就项目改造成本太大

[slide]
# Thinks
