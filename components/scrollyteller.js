const React = require('react');
const { Children, isValidElement, cloneElement } = React;
const classNames = require('classnames');

function addProps (children, props) {
  return Children.map(children, (child, i) => {
    if (isValidElement(child)) {
      return cloneElement(child, Object.assign({}, props, {key: `frame-${i}`}));
    }
    return child;
  });
}

function offset(el) {
  const rect = el.getBoundingClientRect(),
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return {
    top: rect.top + scrollTop,
    height: rect.height
  }
}

class ScrollytellerFrame extends React.Component {
  getRef (ref) {
    if (!this.props.registerFrame) {
      throw new Error("Expected ScrollytellFrame to be a child of Scrollyteller");
    }
    if (this.observer) {
      this.observer.unobserve(this.ref);
      this.observer = null;
    }

    if (this.props.id === undefined) return;
    this.ref = ref;

    if (!this.ref) return;

    this.observer = new ResizeObserver(entries => {
      const rect = offset(this.ref);
      this.props.registerFrame(this.props.id, rect);
    });

    this.observer.observe(this.ref);
  }

  componentWillUnmount () {
    if (!this.observer) return;
    this.observer.unobserve(this.ref);
    this.observer = null;
  }

  render () {
    return <div
      className={classNames("scrollyteller__frame", this.props.className)}
      ref={this.getRef.bind(this)}
      id={this.props.id}
      style={this.props.style}
    >
      {this.props.children}
    </div>
  }
}

class ScrollytellerFixedContent extends React.Component {
  render () {
    return <div
      className={classNames("scrollyteller__fixedContent", this.props.className)}
      id={this.props.id}
      style={this.props.style}
    >
      {addProps(this.props.children, {
        passiveScrollChannel: this.props.passiveScrollChannel
      })}
    </div>
  }
}

class Scrollyteller extends React.Component {
  constructor (props) {
    super(props);

    this.frameRects = new Map ();

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

    const y = window.scrollY;
    let activeFrame = null;
    let progress = 0;
    for (let [key, rect] of this.frameRects) {
      if (y >= rect.top && y < rect.top + rect.height) {
        activeFrame = key;
        progress = (y - rect.top) / rect.height;
      }
    }
    console.log(activeFrame, progress);

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

  registerFrame (id, rect) {
    this.frameRects.set(id, rect);
  }

  deregisterFrame (id) {
    this.frameRects.delete(id);
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
        passiveScrollChannel: this.passiveScrollChannel,
        registerFrame: this.registerFrame.bind(this),
        deregisterFrame: this.deregisterFrame.bind(this),
      })}
    </div>
  }
}

Scrollyteller.Frame = ScrollytellerFrame;
Scrollyteller.FixedContent = ScrollytellerFixedContent;
module.exports = Scrollyteller;
