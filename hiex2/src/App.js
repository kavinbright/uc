import { connect } from 'react-redux';
import React, {Component} from 'react';
import { _ } from "lodash";

class Item extends Component {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);

  }

  shouldComponentUpdate(nextProps){
    if (this.props["marked"] === nextProps["marked"]) {
      return false;
    }
    return true;
  }

  onClick() {
    this.props.onClick(this.props.id);
  }

  state = {
    times: 10,
  }

  render() {
    let data = this.state;
    data.times = data.times + 1;
    console.log(this.state.times);
    console.log(data);
    console.log("---------------------");

    let data1 = _.deepCopy(this.state);
    console.log();

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
          // <Item id={item.id} marked={item.marked} onClick={markItem} />
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