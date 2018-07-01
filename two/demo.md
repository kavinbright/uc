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
2. DOM Diff 阶段优化，提高Diff的效率
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