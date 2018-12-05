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
  x: "addState",
};

// TODO: Potential bugs in the naming!
const flagToFlagName = {
  "-a": "action",
  "-o": "actionConstant",
  "-e": "action", // This is an issue!
  "-c": "component",
  "-r": "reducer", // The only d.reducer is set is because it gets
  "-d": "reducer", // double named here
  "-t": "rootReducer",
  "-s": "saga", // Same problem here
  "-u": "saga", // !
  "-g": "rootSaga",
  "-q": "request", // If you just tried request an error would occur
}; // because d.saga won't be set.

const chains = {
  "-a": ["-o", "-e"],
  "-s": ["-u", "-g", "-q"],
  "-r": ["-d", "-t"],
};

const modFlags = data => ({
  "-o": {
    name: "actionConstant",
    filepath: `./src/redux/actions/constants.js`,
  },
  "-e": {
    name: "actionCreator",
    filepath: `./src/redux/actions/creators.js`,
  },
  "-c": {
    name: "component",
    filepath: `./src/components/${upperFirstLetter(
      data.component || NONE
    )}.jsx`,
  },
  "-d": {
    name: "reducer",
    filepath: `./src/redux/reducers/${data.reducer}.js`,
  },
  "-t": {
    name: "rootReducer",
    filepath: `./src/redux/reducers/rootReducer.js`,
  },
  "-u": {
    name: "saga",
    filepath: `./src/redux/sagas/${data.saga}.js`,
  },
  "-g": {
    name: "rootSaga",
    filepath: `./src/redux/sagas/rootSaga.js`,
  },
  "-q": {
    name: "request",
    filepath: `./src/redux/sagas/requests/${data.saga}.js`,
  },
});

const handleActionCommand = (input, inputIncludesAsync) => {
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

  for (let i = 0; i < newInput.length; i++) {
    if (newInput[i].match(/-[a-z]/) && newInput[i] !== "-c") {
      newInput[i + 1] = lowerFirstLetter(newInput[i + 1]);
    } else if (newInput[i].match(/-[a-z]/) && newInput[i] === "-c") {
      newInput[i + 1] = upperFirstLetter(newInput[i + 1]);
    }
  }

  const actionConstants = inputIncludesAsync
    ? [
        constantCase(action),
        constantCase(`${action}_SUCCESS`),
        constantCase(`${action}_FAILURE`),
      ]
    : [constantCase(action)];
  return { newInput, data: {}, actionConstants };
};

const handleStateCommand = input => {
  // mod x {id, user} -r counter -c component
  // mod x -r counter -c component
  // set d.setKeys = ['id', 'user]
  let rightIdx = 1;
  for (let i = 0; i < input.length; i++) {
    if (input[i] && input[i].match(/-[a-z]/)) {
      rightIdx = i;
    }
  }
  const newInput = input.slice(0, 1).concat(input.slice(rightIdx));
  const data = { stateKeys: input.slice(1, rightIdx) };
  return { newInput, data, actionConstants: [] };
};

const hook = mod => {
  const { input } = mod;
  const inputIncludesAsync = input.includes("async");

  const { newInput, data, actionConstants } =
    input[0] === "x"
      ? handleStateCommand(input)
      : handleActionCommand(input, inputIncludesAsync);

  const additionalData = {
    pathToActionCreators: "../redux/actions/creators",
    pathToActionConstantsReducer: "../actions/constants",
    actionConstants,
  };

  return {
    ...mod,
    data: { ...mod.data, ...data, ...additionalData },
    input: newInput,
  };
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
  man,
};

module.exports = config;
