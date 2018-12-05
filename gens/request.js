const request = d => {
  return `import { query } from '../requestMethods';

const url = "";
const graphqlString = \`\`;

export default [ query, url, graphqlString ];`;
}

module.exports = request;
