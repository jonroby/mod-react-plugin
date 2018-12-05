const reducer = d => {
  return `const initialState = {};

const ${d.reducer} = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default ${d.reducer};
`;
}

module.exports = reducer;
