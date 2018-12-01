const actionConstants = (d, m) => babel => {
  const { types: t } = babel;

  return {
    name: "action constants",
    visitor: {
      Program(path) {
        const newActionConstants = d.actionConstants.filter(ac => {
          const currentConstants = path.node.body.map(
            i => i.declaration.declarations[0].id.name
          );

          return !currentConstants.includes(ac);
        });

        const exports = newActionConstants.map(ac => {
          const variable = t.variableDeclaration("const", [
            t.variableDeclarator(t.identifier(ac), t.stringLiteral(ac))
          ]);

          return t.exportNamedDeclaration(variable, []);
        });

        exports.forEach(exp => {
          path.node.body.push(exp);
        });
      }
    }
  };
};

module.exports = actionConstants;
