import React, { Component } from "react";
import Three from "./components/scene";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { StyleSheet, css } from "aphrodite";
import { HUD } from "./components/HUD";
import { Loader } from "./components/loader";
import theme from "./themes/default";

class App extends Component<{}, { loading: boolean }> {
  constructor(prop: {}) {
    super(prop);
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    // setTimeout(() => {
    //   this.setState({ loading: false });
    // }, 1000);
  }
  render() {
    const styles = StyleSheet.create({
      root: {
        overflow: "hidden",
        height: "100vh",
      },
    });
    return (
      <ThemeProvider theme={theme}>
        <div className={css(styles.root)}>
          <CssBaseline />
          <HUD>
            <Loader
              onLaunch={() => {
                this.setState({ loading: false });
              }}
            />
            <Three />
          </HUD>
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
