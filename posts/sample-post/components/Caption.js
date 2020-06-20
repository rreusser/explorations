const React = require('react');

class Caption extends React.Component {
  render () {
    const style = {
      top: this.props.top || 'auto',
      right: this.props.right || 'auto',
      bottom: this.props.bottom || 'auto',
      left: this.props.left || 'auto',
    }
    return <figcaption
      className="caption"
      style={style}
    >
      {this.props.children}
    </figcaption>
  }
}

module.exports = Caption;
