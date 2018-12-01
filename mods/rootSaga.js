const rootSaga = d => babel => {
  const { types: t } = babel;

  return {
    name: "rootReducer",
    visitor: {
      Program(path) {
        const imports = path.node.body.filter(
          i => i.type === "ImportDeclaration"
        );
        const importReducers = imports.filter(
          i => i.source.value === `./${d.saga}`
        );

        if (importReducers.length === 0) {
          const lastImportIdx = path.node.body.reduce((prev, curr, idx) => {
            if (curr.type === "ImportDeclaration") return idx;
            return prev;
          }, null);

          const imp = t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(d.saga))],
            t.stringLiteral(`./${d.saga}`)
          );

          const ins = lastImportIdx === null ? 0 : lastImportIdx + 1;
          path.node.body.splice(ins, 0, imp);
        }
      },

      YieldExpression(path) {
        const ys = path.node.argument.arguments[0].elements.map(
          i => i.arguments[0].name
        );
        if (!ys.includes(d.saga)) {
          path.node.argument.arguments[0].elements.push(
            t.callExpression(t.identifier("call"), [t.identifier(d.saga)])
          );
        }
      }
    }
  };
};

module.exports = rootSaga;
