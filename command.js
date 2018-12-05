const constantCase = require("constant-case");

const NONE = "NONE";

const lowerFirstLetter = w => w.charAt(0).toLowerCase() + w.slice(1);
const upperFirstLetter = w => w.charAt(0).toUpperCase() + w.slice(1);

// const genStateFlags = data => ({
//   "-c": [
//     {
//       filepath: `./src/components/${data.component}.js`,
//       mod: "componentState",
//       default: "component"
//     }
//   ],
//   "-r": [
//     {
//       filepath: `./src/redux/reducers/${data.reducer}.js`,
//       mod: "reducerState",
//       default: "reducer"
//     }
//   ]
// });

// It would be nice to merge somehow all of mods into this
// To make state and actions one
// <action> <Component>
// -o -e -c -r
// [o, e, c, r]
// [t, t, t, f]
// =>
// g: [r, ]
// m: [o e c r t]

// mod m <m> -c <Counter>
// mod <m> -c Counter

// const command = {
//   "*a": ["-a:action", "-c:component", "-r:reducer"],
//   "*s": ["-c:componentState", "-r:reducerState"]
// };

// <*a=-a>
// const command = ["-A <-a>[mod] <-c|-r>[mod]"]
// const command = {"-A": [{"-a": "m1"}, ] }

// commands = {

// }

// "-a <flag.name> -c <flag.name> -s "
// "<-a> <-c|-r>"
// fetchSomething counter
// d.actionConstant = "fetchSomething"
// d.actionCreator = "fetchSomething"
// d.component = counter
// d.reducer = counter

// -A
// -S
// "*<-a> <-c|-r>"
// "-a <a>
// "-c <c> -a <a>
// "<-c> => flag is both runs a command but then the argument is passed to itself

// const getActionFlags = data => ({
// "-a": [
//   {
//     filepath: `./src/redux/actions/constants.js`,
//     mod: "actionConstants",
//     default: NONE
//   },
//   {
//     mod: "actionCreators",
//     filepath: `./src/redux/actions/creators.js`,
//     default: NONE
//   }
// ],
// "-c": [
//   {
//     filepath: `./src/components/${upperFirstLetter(data.component)}.jsx`,
//     mod: "component",
//     default: "component"
//   }
// ],
//   "-r": [
//     {
//       filepath: `./src/redux/reducers/${data.reducer}.js`,
//       mod: "reducer",
//       default: "reducer"
//     },
//     {
//       filepath: `./src/redux/reducers/rootReducer.js`,
//       mod: "rootReducer",
//       default: NONE
//     }
//   ],
//   "-s": [
//     {
//       filepath: `./src/redux/sagas/${data.saga}.js`,
//       mod: NONE,
//       default: "saga"
//     },
//     {
//       filepath: `./src/redux/sagas/rootSaga.js`,
//       mod: "rootSaga",
//       default: NONE
//     },
//     {
//       filepath: `./src/redux/sagas/requests/${data.saga}.js`,
//       mod: NONE,
//       default: "request"
//     }
//   ]
// });

const command = input => {
  // const asynchronous = input.includes("async");
  // input = input.filter(i => i !== "async");
  // const getFlagsAndNames = (arr, flaggedTasks) => {
  //   for (let i = 0; i < input.length; i++) {
  //     if (input[i].match(/-[acrs]/)) {
  //       flaggedTasks.push({ flag: input[i], name: input[i + 1] });
  //     }
  //   }
  //   return flaggedTasks;
  // };

  fetchSomething;

  let flaggedTasks = [];
  if (!input[0].match(/-[a-z]/) && !input[1].match(/-[a-z]/)) {
    // <action> <Component|reducer>
    flaggedTasks.push({ flag: "-a", name: input[0] });
    flaggedTasks.push({ flag: "-c", name: input[1] });
    flaggedTasks.push({ flag: "-r", name: input[1] });
    if (asynchronous) {
      flaggedTasks.push({ flag: "-s", name: input[1] });
    }
  } else if (!input[0].match(/-[a-z]/)) {
    // <action> -c <Component> -r <reducer>
    flaggedTasks.push({ flag: "-a", name: input[0] });
    flaggedTasks = getFlagsAndNames(input.slice(1), flaggedTasks);
  }
  // This was for stateKey - Now -s applies to sagas
  // else if (input[0].match(/-s/) && !input[2].match(/-[a-z]/)) {
  //   flaggedTasks.push({ flag: "-s", name: input[1] });
  //   flaggedTasks.push({ flag: "-c", name: input[2] });
  //   flaggedTasks.push({ flag: "-r", name: input[2] });
  else {
    // -a <action> -c <Component> -r <reducer>
    // -s <state> -c <Component> -r <reducer>
    flaggedTasks = getFlagsAndNames(input, []);
  }

  let d = flaggedTasks.reduce((prev, curr) => {
    const flags = {
      "-a": "action",
      "-c": "component",
      "-r": "reducer",
      "-s": "saga"
    };

    const name =
      flags[curr.flag] === "component"
        ? upperFirstLetter(curr.name)
        : lowerFirstLetter(curr.name);
    return { ...prev, [flags[curr.flag]]: name };
  }, {});

  const actionConstants = asynchronous
    ? [
        constantCase(d.action),
        constantCase(`${d.action}_SUCCESS`),
        constantCase(`${d.action}_FAILURE`)
      ]
    : [constantCase(d.action)];
  const data = {
    ...d,
    actionConstants,
    pathToActionCreators: "../redux/actions/creators",
    pathToActionConstantsReducer: "../actions/constants"
  };

  // Rewrite
  const flagsMapping = flaggedTasks.map(i => i.flag).includes("-a")
    ? getActionFlags(data)
    : genStateFlags(data);

  const tasks = flaggedTasks.reduce((prev, curr) => {
    // if (curr.flag === "-s") return prev;
    return prev.concat(flagsMapping[curr.flag]);
  }, []);

  return tasks.map(task => ({ ...task, data }));
};

module.exports = command;

// commands : input => {
//     const data = {
//       actionConstants: ["FETCH_B", "FETCH_B_SUCCESS", "FETCH_B_FAILURE"],
//       actionCreators: ["fetchB", "fetchBSuccess", "fetchBFailure"],
//       action: "fetchB",
//       saga: "testSaga",
//       reducer: "testSaga",
//       pathToActionConstantsReducer: "./actions/constants"
//     };
//     const tasks1 = getActionFlags(data)["-r"];
//     return tasks1.map(t => ({ ...t, data }));
//   }
