const rootReducer = d => babel => {
  const { types: t } = babel;

  return {
    name: "rootReducer",
    visitor: {
      Program(path) {
        const imports = path.node.body.filter(
          i => i.type === "ImportDeclaration"
        );
        const importReducers = imports.filter(
          i => i.source.value === `./${d.reducer}`
        );

        if (importReducers.length === 0) {
          const lastImportIdx = path.node.body.reduce((prev, curr, idx) => {
            if (curr.type === "ImportDeclaration") return idx;
            return prev;
          }, null);

          const imp = t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(d.reducer))],
            t.stringLiteral(`./${d.reducer}`)
          );

          const rest = path.node.body.slice(lastImportIdx);

          const ins = lastImportIdx === null ? 0 : lastImportIdx + 1;
          path.node.body.splice(ins, 0, imp);
        }
      },
      ObjectExpression(path, state) {
        if (
          path.parent &&
          path.parent &&
          path.parent.callee &&
          path.parent.callee.name === "combineReducers"
        ) {
          const reducerExists = path.node.properties
            .map(i => i.value.name)
            .includes(d.reducer);
          if (!reducerExists) {
            const objectProperty = t.objectProperty(
              t.identifier(d.reducer),
              t.identifier(d.reducer),
              false,
              true
            );
            path.node.properties.push(objectProperty);
          }
        }
      }
    }
  };
};

module.exports = rootReducer;
