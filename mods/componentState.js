const lowerFirstLetter = w => w.charAt(0).toLowerCase() + w.slice(1);

const component = d => babel => {
  const { types: t } = babel;

  return {
    name: "component",
    visitor: {
      Program(path) {
        // Add action to mapDispatchToProps
        // Find way of surfacing messages if things aren't added.
        const vars = path.node.body.filter(
          i => i.type === "VariableDeclaration"
        );

        let mapStateToPropsExists = false;
        vars.forEach(v => {
          // if property already exists don't add it.
          if (v.declarations[0].id.name === "mapStateToProps") {
            mapStateToPropsExists = true;
            const splitKey = d.stateKey.split(".");
            const key = splitKey[splitKey.length - 1];

            const value =
              d.stateKey.split(".").length > 1
                ? d.stateKey
                : `${d.reducer || lowerFirstLetter(d.component)}.${d.stateKey}`;

            if (
              !v.declarations[0].init.body.properties
                .map(p => p.key.name)
                .includes(key)
            ) {
              v.declarations[0].init.body.properties.push(
                t.objectProperty(
                  t.identifier(key),
                  t.identifier(`state.${value}`)
                )
              );
            }
          }
        });

        // If mapStateToProps object doesn't exist, add it
        // with property
        if (!mapStateToPropsExists) {
          // DUPLICATED FROM ABOVE
          const splitKey = d.stateKey.split(".");
          const key = splitKey[splitKey.length - 1];

          const value =
            d.stateKey.split(".").length > 1
              ? d.stateKey
              : `${d.reducer || lowerFirstLetter(d.component)}.${d.stateKey}`;
          // DUPLICATED FROM ABOVE

          const mapStateToProps = t.variableDeclarator(
            t.identifier("mapStateToProps"),
            t.arrowFunctionExpression(
              [t.identifier("state")],
              t.objectExpression([
                t.objectProperty(
                  t.identifier(key),
                  t.identifier(`state.${value}`)
                )
              ])
            )
          );
          const variable = t.variableDeclaration("const", [mapStateToProps]);
          path.node.body.splice(path.node.body.length - 1, 0, variable);
        }
      }
    }
  };
};

module.exports = component;
