const actionCreators = d => babel => {
  const { types: t } = babel;

  return {
    name: "action creators",
    visitor: {
      Program(path) {
        const actionCreatorExists = path.node.body
          .filter(i => i.type === "ExportNamedDeclaration")
          .map(i => i.declaration.declarations[0].id.name)
          .includes(d.action);

        if (!actionCreatorExists) {
          const actionCreator = t.variableDeclarator(
            t.identifier(d.action),
            t.arrowFunctionExpression(
              [t.identifier("payload")],
              t.objectExpression([
                t.objectProperty(
                  t.identifier("type"),
                  t.identifier(`types.${d.actionConstants[0]}`)
                ),
                t.objectProperty(
                  t.identifier("payload"),
                  t.identifier("payload"),
                  false,
                  true
                )
              ])
            )
          );

          const v = t.exportNamedDeclaration(
            t.variableDeclaration("const", [actionCreator]),
            []
          );

          path.node.body.push(v);
        }
      }
    }
  };
};

module.exports = actionCreators;
