import React, { Component } from "react";
import Three from "./scene";
import { CssBaseline } from "@material-ui/core";
import { HUD } from "./components/HUD";

interface AppProp {}
interface AppState {
  checkedB: boolean;
}
class App extends Component<AppProp, AppState> {
  constructor(prop: AppProp) {
    super(prop);

    this.state = {
      checkedB: false,
    };
  }
  render() {
    return (
      <div className="App">
        <CssBaseline />
        <HUD />
        <Three />
      </div>
    );
  }
}

export default App;
