const env = require("babel-preset-env");

const mods = require("./mods");
const gens = require("./gens");
const parser = require("./parser");

const constantCase = require("constant-case");
const lowerFirstLetter = w => w.charAt(0).toLowerCase() + w.slice(1);
const upperFirstLetter = w => w.charAt(0).toUpperCase() + w.slice(1);

const NONE = "NONE";

const commands = {
  a: "addAction",
  x: "addState"
};

// Several of these don't actually need a name (rootReducer, rootSaga)
// in the data object. However, they are required for other tasks.
// Since their isn't easy way to let Mod CLI to remove them from data
// object they're left in. Harmless. Note: reducer is named twice.
// Is there a way to do better?
const flagToFlagName = {
  "-a": "action",
  "-o": "actionConstant",
  "-e": "actionCreator",
  "-c": "component",
  "-r": "reducer",
  "-d": "reducer",
  "-t": "rootReducer",
  "-s": "saga",
  "-u": "sagaGenerator",
  "-g": "rootSaga",
  "-q": "request"
};

const chains = {
  "-a": ["-o", "-e"],
  "-s": ["-u", "-g", "-q"],
  "-r": ["-d", "-t"]
};

const modFlags = data => ({
  "-o": {
    name: "actionConstant",
    filepath: `./src/redux/actions/constants.js`
  },
  "-e": {
    name: "actionCreator",
    filepath: `./src/redux/actions/creators.js`
  },
  "-c": {
    name: "component",
    filepath: `./src/components/${upperFirstLetter(data.component || NONE)}.jsx`
  },
  "-d": {
    name: "reducer",
    filepath: `./src/redux/reducers/${data.reducer}.js`
  },
  "-t": {
    name: "rootReducer",
    filepath: `./src/redux/reducers/rootReducer.js`
  },
  "-u": {
    name: "saga",
    filepath: `./src/redux/sagas/${data.saga}.js`
  },
  "-g": {
    name: "rootSaga",
    filepath: `./src/redux/sagas/rootSaga.js`
  },
  "-q": {
    name: "request",
    filepath: `./src/redux/sagas/requests/${data.saga}.js`
  }
});

const hook = mod => {
  const { input } = mod;
  const inputIncludesAsync = input.includes("async");
  let newInput =
    !input[0].match(/-[a-z]/) && !input[1].match(/-[a-z]/) && inputIncludesAsync
      ? ["a", "-a", input[0], "-c", input[1], "-r", input[1], "-s", input[1]]
      : !input[0].match(/-[a-z]/) && !input[1].match(/-[a-z]/)
      ? ["a", "-a", input[0], "-c", input[1], "-r", input[1]]
      : !input[0].match(/-[a-z]/)
      ? ["a", "-a", input[0]].concat(input.slice(1))
      : input;

  let action;
  for (let i = 0; i < newInput.length; i++) {
    if (newInput[i] === "-a") {
      action = newInput[i + 1];
    }
  }

  const actionConstants = inputIncludesAsync
    ? [
        constantCase(action),
        constantCase(`${action}_SUCCESS`),
        constantCase(`${action}_FAILURE`)
      ]
    : [constantCase(action)];

  const data = {
    pathToActionCreators: "../redux/actions/creators",
    pathToActionConstantsReducer: "../actions/constants",
    actionConstants
  };

  const ret = {
    ...mod,
    data: { ...mod.data, ...data },
    input: newInput
  };

  return ret;
};

const man = `
Mod CLI mod-react-plugin

mod <command> <flag> <name>

  command
  a - add a Redux action
  x - add Redux state

  flag
  -a: action [-o, -e],
  -s: saga [-u, -g, -q],
  -r: reducer [-d, -t]

  -o: actionConstant
  -e: actionCreator
  -c: component
  -r: reducer
  -d: reducer
  -t: rootReducer
  -s: saga
  -u: sagaGenerator
  -g: rootSaga
  -q: request

  name
  
`;

const config = {
  commands,
  chains,
  modFlags,
  flagToFlagName,
  parser,
  mods,
  gens,
  hook,
  man
};

module.exports = config;
