import {
  createStore,
  combineReducers
} from 'redux';
import {
  Provider
} from 'react-redux'
import {
  render
} from "react-dom";
import React, {
  Component
} from 'react';
import {conenct} from 'react-redux'
// import App from './App';
import Appl from './APP2';

const initial_state = [];
const STORE_SIZE = 10;
for (let i = 0; i < STORE_SIZE; i++) {
  initial_state.push({
    id: i,
    marked: false
  });
}

function itemsReducer(state = initial_state, action) {
  switch (action.type) {
    case 'MARK':
      return state.map((item) =>
        action.id === item.id ? { ...item,
          marked: !item.marked
        } : item
      );
    default:
      return state;
  }
}

const store = createStore(combineReducers({
  items: itemsReducer
}));

export default class NaiveList extends Component {
  // render() {
  //   return ( <Provider store = {
  //       store
  //     } >
  //     <
  //     App / >
  //     </Provider>
  //   );
  // }

  render() {
    return ( 
      <Provider>
        <Appl />
      </Provider>
    );
  }
}

render( 
  <NaiveList / > ,
  document.getElementById('root')
)