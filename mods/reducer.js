const reducer = d => babel => {
  const { types: t } = babel;

  return {
    name: "reducer",
    visitor: {
      Program(path) {
        const imports = path.node.body.filter(
          i => i.type === "ImportDeclaration"
        );
        const importActionConstants = imports.filter(
          i => i.source.value === d.pathToActionConstantsReducer
        );

        if (importActionConstants.length > 0) {
          const actionAlreadyImported = !importActionConstants[0].specifiers
            .map(s => s.imported.name)
            .includes(d.actionConstants[0]);
          if (actionAlreadyImported && d.actionConstants[0]) {
            importActionConstants[0].specifiers.push(
              t.importSpecifier(
                t.identifier(d.actionConstants[0]),
                t.identifier(d.actionConstants[0])
              )
            );
          }
        } else {
          const lastImportIdx = path.node.body.reduce((prev, curr, idx) => {
            if (curr.type === "ImportDeclaration") return idx;
            return prev;
          }, null);

          if (d.actionConstants[0]) {
            const importDeclaration = t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier(d.actionConstants[0]),
                  t.identifier(d.actionConstants[0])
                )
              ],
              t.stringLiteral(d.pathToActionConstantsReducer)
            );

            const rest = path.node.body.slice(lastImportIdx);

            const ins = lastImportIdx === null ? 0 : lastImportIdx + 1;
            path.node.body.splice(ins, 0, importDeclaration);
          }
        }
      },

      SwitchStatement(path) {
        const currentActions = path.node.cases
          .map(i => i.test && i.test.name)
          .filter(i => i);

        for (let i = 0; i < d.actionConstants.length; i++) {
          if (currentActions.includes(d.actionConstants[i])) continue;

          const switchSt = t.switchCase(
            t.identifier(`${d.actionConstants[i]}`),
            [t.expressionStatement(t.identifier("return state"))]
          );

          path.node.cases.splice(path.node.cases.length - 1, 0, switchSt);
        }
      }
    }
  };
};

module.exports = reducer;
