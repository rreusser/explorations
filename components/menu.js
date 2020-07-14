import React from 'react';
import classNames from 'classnames';

class Menu extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      expanded: false
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick () {
    this.setState({expanded: !this.state.expanded});
  }

  render () {
    return (
      <nav className="menu">
        <a className="menu__item" href="/">rreusser.github.io</a>
        <a className="menu__item" href="/sketches/">sketches</a>
        <a className="menu__item" href="/projects/">projects</a>
      </nav>
    );
  }
}

export default Menu;
