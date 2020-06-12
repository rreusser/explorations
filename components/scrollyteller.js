const React = require('react');
const { Children, isValidElement, cloneElement } = React;
const classNames = require('classnames');

function addProps (children, props) {
  return Children.map(children, child => {
    if (isValidElement(child)) {
      return cloneElement(child, props);
    }
    return child;
  });
}

class ScrollytellerFrame extends React.Component {
  render () {
    return <div className="scrollyteller__frame">
      {this.props.children}
    </div>
  }
}

class ScrollytellerFixedContent extends React.Component {
  render () {
    return <div className="scrollyteller__fixedContent">
      {addProps(this.props.children, {
        passiveScrollChannel: this.props.passiveScrollChannel
      })}
    </div>
  }
}

class Scrollyteller extends React.Component {
  constructor (props) {
    super(props);

    let frameCount = 0;
    Children.forEach(this.props.children, function (child) {
      if (isValidElement(child) && child.type === ScrollytellerFrame) {
        frameCount += 1;
      }
    });

    this.state = {
      contentState: 'static-top',
    };

    this.passiveScrollChannel = {
      position: 0,
      frameCount: frameCount
    };
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.boundScrollHandler);
  }

  handleScroll (event) {
    const rect = this.ref.getBoundingClientRect();
    this.passiveScrollChannel.position = -rect.top / (rect.height - window.innerHeight);

    if (rect.top > 0) {
      if (this.state.contentState !== 'static-top') {
        this.setState({contentState: 'static-top'})
      }
    } else if (window.innerHeight - rect.bottom > 0) {
      if (this.state.contentState !== 'static-bottom') {
        this.setState({contentState: 'static-bottom'})
      }
    } else {
      if (this.state.contentState !== 'fixed') {
        this.setState({contentState: 'fixed'})
      }
    }
  }

  containerClass () {
    return `js-scrollyteller--${this.state.contentState}`;
  }

  getRef (ref) {
    if (this.ref) return;

    this.ref = ref;

    if (typeof window !== "undefined") {
      this.boundScrollHandler = this.handleScroll.bind(this)
      this.boundScrollHandler();
      window.addEventListener('scroll', this.boundScrollHandler);
    }
  }

  render () {
    return <div
      ref={this.getRef.bind(this)}
      className={classNames("scrollyteller", this.containerClass())}
    >
      {addProps(this.props.children, {
        passiveScrollChannel: this.passiveScrollChannel
      })}
    </div>
  }
}

Scrollyteller.Frame = ScrollytellerFrame;
Scrollyteller.FixedContent = ScrollytellerFixedContent;
module.exports = Scrollyteller;
