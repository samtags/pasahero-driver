import { Component } from "react";
import log from "../log";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError = (error) => {
    log.error("Crash detected.", { fatal: true, error });
    throw new Error(error.message);
  };

  render() {
    const { children } = this.props;
    return children;
  }
}
