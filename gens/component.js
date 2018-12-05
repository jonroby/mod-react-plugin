function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const component = d => {
  return `import React, { Component } from 'react';
import { connect } from 'react-redux';

class ${capitalize(d.component)} extends Component {
  render() {
    return (
        <div>
        </div>
    );
  }
}

const mapStateToProps = state => ({

});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(${capitalize(d.component)});\n`;
}

module.exports = component;
