const constantCase = require("constant-case");
const camelCase = require("camelcase");

const actionCreators = d => babel => {
  const { types: t } = babel;

  return {
    name: "action creators",
    visitor: {
      Program(path) {
        const currentCreators = path.node.body
          .filter(i => i.type === "ExportNamedDeclaration")
          .map(i => i.declaration.declarations[0].id.name);

        const newActionCreators = d.actionConstants
          .map(i => camelCase(i))
          .filter(ac => {
            return !currentCreators.includes(ac);
          });

        newActionCreators.forEach(ac => {
          const actionCreator = t.variableDeclarator(
            t.identifier(ac),
            t.arrowFunctionExpression(
              [t.identifier("payload")],
              t.objectExpression([
                t.objectProperty(
                  t.identifier("type"),
                  t.identifier(`types.${constantCase(ac)}`)
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
        });
      }
    }
  };
};

module.exports = actionCreators;
