const actionConstant = require("./actionConstant");
const actionCreator = require("./actionCreator");
const component = require("./component");
const reducer = require("./reducer");
const rootReducer = require("./rootReducer");
const rootSaga = require("./rootSaga");

const componentState = require("./componentState");
const reducerState = require("./reducerState");

module.exports = {
  addAction: {
    actionConstant,
    actionCreator,
    component,
    reducer,
    rootReducer,
    rootSaga
  },
  addState: {
    component: componentState,
    reducer: reducerState,
  }
};
