import { connect } from 'react-redux';
import React, {Component} from 'react';

class Row extends Component {
    render () {
      const {item, style} = this.props;
      return (
        <tr style={style}>
          <td>{item.id}</td>
        </tr>
      )
    }
  }
    
  class Table extends Component {
    render() {
      const {list} = this.props;
      const itemStyle = {
        color: 'red'
      }
      return (
        <table>
            {list.map(item => <Row key={item.id} item={item} style={itemStyle} />)}
        </table>
      )
    }
  }
    
  class Appl extends Component {
    state = {
      list: Array(10000).fill(0).map((val, index) => ({id: index}))
    }
    
    handleClick = () => {
      this.setState({
        otherState: 1
      })
    }
    
    render() {
      const {list} = this.state;
      return (
        <div>
          <button onClick={this.handleClick}>change state!</button>
          <Table list={list} />
        </div>
      );
    }
  }

  function mapStateToProps(state) {
    return state;
  }
  
  
  export default connect(mapStateToProps)(Appl);