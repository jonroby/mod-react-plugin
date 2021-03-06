const saga = d => {
  return `import { call, put, takeEvery } from "redux-saga/effects";
import { ${d.action}Success, ${d.action}Failure } from "../actions/creators";
import { ${d.actionConstants[0]} } from "../actions/constants";
import request from "./requests/${d.saga}";

export function* ${d.saga}Request(action) {
  try {
    const response = yield call(...request);

    if (response.status >= 200 && response.status < 300) {
      const data = yield response.json();
      yield put(${d.action}Success(data));
    } else {
      throw response;
    }
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
