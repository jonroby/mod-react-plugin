const component = d => babel => {
  const { types: t } = babel;

  return {
    name: "component",
    visitor: {
      Program(path) {
        const imports = path.node.body.filter(
          i => i.type === "ImportDeclaration"
        );
        const importActionCreators = imports.filter(
          i => i.source.value === "../redux/actions/creators"
        );

        if (importActionCreators.length > 0) {
          const actionAlreadyImported = !importActionCreators[0].specifiers
            .map(s => s.imported.name)
            .includes(d.action);
          if (actionAlreadyImported && d.action) {
            importActionCreators[0].specifiers.push(
              t.importSpecifier(t.identifier(d.action), t.identifier(d.action))
            );
          }
        } else {
          if (d.action) {
            const lastImportIdx = path.node.body.reduce((prev, curr, idx) => {
              if (curr.type === "ImportDeclaration") return idx;
              return prev;
            }, null);
            const importDeclaration = t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier(d.action),
                  t.identifier(d.action)
                )
              ],
              t.stringLiteral(d.pathToActionCreators)
            );

            const rest = path.node.body.slice(lastImportIdx);

            const ins = lastImportIdx === null ? 0 : lastImportIdx + 1;
            path.node.body.splice(ins, 0, importDeclaration);
          }
        }

        if (d.action) {
          // Add action to mapDispatchToProps
          // Find way of surfacing messages if things aren't added.
          const vars = path.node.body.filter(
            i => i.type === "VariableDeclaration"
          );

          let mapDispatchToPropsExists = false;
          vars.forEach(v => {
            // if property already exists don't add it.

            if (v.declarations[0].id.name === "mapDispatchToProps") {
              mapDispatchToPropsExists = true;
              if (
                !v.declarations[0].init.properties
                  .map(i => i.key.name)
                  .includes(d.action)
              ) {
                v.declarations[0].init.properties.push(
                  t.objectProperty(
                    t.identifier(d.action),
                    t.identifier(d.action),
                    false,
                    true
                  )
                );
              }
            }
          });

          // If mapDispatchToProps object doesn't exist, add it
          // with property
          if (!mapDispatchToPropsExists) {
            const mapDispatchToProps = t.variableDeclarator(
              t.identifier("mapDispatchToProps"),
              t.objectExpression([
                t.objectProperty(
                  t.identifier(d.action),
                  t.identifier(d.action),
                  false,
                  true
                )
              ])
            );
            const variable = t.variableDeclaration("const", [
              mapDispatchToProps
            ]);
            path.node.body.splice(path.node.body.length - 1, 0, variable);
          }
        }
      }
    }
  };
};

module.exports = component;
