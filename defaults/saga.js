const saga = d => {
  return `import { call, put, takeEvery } from "redux-saga/effects";
import { ${d.action}Success, ${d.action}Failure } from "../actions/creators";
import { ${d.actionConstants[0]} } from "../actions/constants";
import request from "./requests/${d.saga}";

export function* ${d.saga}Request(action) {
  try {
    const data = yield call(...request);
    yield put(${d.action}Success(data));
  } catch (error) {
    yield put(${d.action}Failure(error));
  }
}

function* ${d.saga}() {
  yield takeEvery(${d.actionConstants[0]}, ${d.saga}Request);
}

export default ${d.saga};
`;
}

module.exports = saga;
