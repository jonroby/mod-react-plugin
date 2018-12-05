const reducerState = d => babel => {
  const { types: t } = babel;

  return {
    name: "add state to reducer",
    visitor: {
      Program(path) {
        const vars = path.node.body.filter(
          i => i.type === "VariableDeclaration"
        );

        let initalStateExists = false;
        vars.forEach(v => {
          // if property already exists don't add it.
          d.stateKeys.forEach(stateKey => {
            if (v.declarations[0].id.name === "initialState") {
              initalStateExists = true;
              if (
                !v.declarations[0].init.properties
                  .map(i => i.key.name)
                  .includes(stateKey)
              ) {
                v.declarations[0].init.properties.push(
                  t.objectProperty(t.identifier(stateKey), t.identifier())
                );
              }
            }
          });
        });

        // If initialState object doesn't exist, add it
        // with property
        // if (!initalStateExists) {
        //   const initialState = t.variableDeclarator(
        //     t.identifier("initialState"),
        //     t.objectExpression([
        //       t.objectProperty(t.identifier(d.stateKey), null)
        //     ])
        //   );
        //   const variable = t.variableDeclaration("const", [initialState]);
        //   path.node.body.splice(path.node.body.length - 1, 0, variable);
        // }
      }
    }
  };
};

module.exports = reducerState;
