const { transform } = require("babel-core");
const jsx = require("babel-plugin-syntax-jsx");
const classProperties = require("babel-plugin-syntax-class-properties");
const objectRestSpread = require("babel-plugin-syntax-object-rest-spread");
const env = require("babel-preset-env");
const recast = require("recast");
const constantCase = require("constant-case");

const mods = require("./mods");
const defaults = require("./defaults");

const lowerFirstLetter = w => w.charAt(0).toLowerCase() + w.slice(1);
const upperFirstLetter = w => w.charAt(0).toUpperCase() + w.slice(1);

const genStateFlags = data => ({
  "-c": [
    {
      filepath: `./src/components/${data.component}.js`,
      mod: "componentState",
      default: "component"
    }
  ],
  "-r": [
    {
      filepath: `./src/redux/reducers/${data.reducer}.js`,
      mod: "reducerState",
      default: "reducer"
    }
  ]
});

const getActionFlags = data => ({
  "-a": [
    {
      filepath: `./src/redux/actions/constants.js`,
      mod: "actionConstants",
      default: "NONE"
    },
    {
      mod: "actionCreators",
      filepath: `./src/redux/actions/creators.js`,
      default: "NONE"
    }
  ],
  "-c": [
    {
      filepath: `./src/components/${data.component}.js`,
      mod: "component",
      default: "component"
    }
  ],
  "-r": [
    {
      filepath: `./src/redux/reducers/${data.reducer}.js`,
      mod: "reducer",
      default: "reducer"
    }
  ],
  "-t": [
    {
      filepath: `./src/redux/reducers/rootReducer.js`,
      mod: "rootReducer",
      default: "NONE"
    }
  ]
});

const config = {
  parser: (filestring, mod) => {
    const transformedFile = transform(filestring, {
      parserOpts: {
        parser: recast.parse
      },
      generatorOpts: {
        generator: recast.print
      },
      plugins: [objectRestSpread, classProperties, jsx, mod]
    });

    return transformedFile && transformedFile.code;
  },
  commands: input => {
    const getFlagsAndNames = (arr, flaggedTasks) => {
      for (let i = 0; i < input.length; i++) {
        if (input[i].match(/-[acrs]/)) {
          flaggedTasks.push({ flag: input[i], name: input[i + 1] });
        }
      }
      return flaggedTasks;
    };

    let flaggedTasks = [];
    if (!input[0].match(/-[a-z]/) && !input[1].match(/-[a-z]/)) {
      // <action> <Component|reducer>
      flaggedTasks.push({ flag: "-a", name: input[0] });

      flaggedTasks.push({ flag: "-c", name: input[1] });

      flaggedTasks.push({ flag: "-r", name: input[1] });
    } else if (!input[0].match(/-[a-z]/)) {
      // <action> -c <Component> -r <reducer>
      flaggedTasks.push({ flag: "-a", name: input[0] });
      flaggedTasks = getFlagsAndNames(input.slice(1), flaggedTasks);
    } else if (input[0].match(/-s/) && !input[2].match(/-[a-z]/)) {
      flaggedTasks.push({ flag: "-s", name: input[1] });

      flaggedTasks.push({ flag: "-c", name: input[2] });

      flaggedTasks.push({ flag: "-r", name: input[2] });
    } else {
      // -a <action> -c <Component> -r <reducer>
      // -s <state> -c <Component> -r <reducer>
      flaggedTasks = getFlagsAndNames(input, []);
    }

    let d = flaggedTasks.reduce((prev, curr) => {
      const flags = {
        "-a": "action",
        "-c": "component",
        "-r": "reducer",
        "-s": "stateKey"
      };

      const name =
        flags[curr.flag] === "component"
          ? upperFirstLetter(curr.name)
          : lowerFirstLetter(curr.name);
      return { ...prev, [flags[curr.flag]]: name };
    }, {});

    const actionConstant = constantCase(d.action);

    const data = {
      ...d,
      actionConstants: [actionConstant].filter(i => i),
      pathToActionCreators: "../redux/actions/creators",
      pathToActionConstantsReducer: "../actions/constants"
    };

    // Rewrite
    const flagsMapping = flaggedTasks.map(i => i.flag).includes("-a")
      ? getActionFlags(data)
      : genStateFlags(data);

    const tasks = flaggedTasks.reduce((prev, curr) => {
      if (curr.flag === "-s") return prev;
      return prev.concat(flagsMapping[curr.flag]);
    }, []);

    return tasks.map(task => ({ ...task, data }));
  }
};

module.exports = { defaults, config, mods };
