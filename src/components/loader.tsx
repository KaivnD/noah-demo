import React, { Component } from "react";
import { SvgIcon, Typography, Button } from "@material-ui/core";
import { StyleSheet, css } from "aphrodite";
import eve from "../libs/eve";

interface LoaderProp {
  onLaunch?: () => void;
}

interface LoaderState {
  stat: string;
  loadStarted: boolean;
  loadDone: boolean;
}

class Loader extends Component<LoaderProp, LoaderState> {
  constructor(prop: LoaderProp) {
    super(prop);

    this.state = {
      stat: "Welcom to Noah.",
      loadStarted: false,
      loadDone: false,
    };
  }
  render() {
    const opacityKeyframes = {
      from: {
        opacity: 0,
      },

      to: {
        opacity: 1,
      },
    };
    const styles = StyleSheet.create({
      paper: {
        position: "absolute",
        textAlign: "center",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        transition: "all 600ms ease-in-out",
      },
      zippyHeader: {
        animationName: opacityKeyframes,
        animationDuration: "3s, 1200ms",
        animationIterationCount: "infinite",
      },
      none: {},
      icon: {
        top: 0,
        left: 0,
        transform: "translate(0, 0)",
      },
    });
    return (
      <div
        className={css(
          styles.paper,
          this.state.loadDone ? styles.icon : styles.none
        )}
      >
        <SvgIcon
          style={{ fontSize: this.state.loadDone ? "86px" : "128px" }}
          viewBox="0 0 1024 1024"
        >
          <g
            style={{
              fill: "rgba(255,255,255,0.1)",
              stroke: "#fff",
              strokeWidth: 3,
            }}
          >
            <path d="M371.5,612.5v-200a40,40,0,0,1,80,0v200a160,160,0,0,0,320,0v-400a40,40,0,0,1,80,0v400c0,132.55-107.45,240-240,240S371.5,745.05,371.5,612.5Z" />
            <path d="M651.5,412.5v40a40,40,0,0,1-80,0v-40a160,160,0,0,0-320,0v400a40,40,0,0,1-80,0v-400c0-132.55,107.45-240,240-240S651.5,280,651.5,412.5Z" />
            <path d="M571.5,612.3a40,40,0,1,1,39.8,40.2,40,40,0,0,1-39.8-40.2Z" />
          </g>
        </SvgIcon>
        <Typography
          className={
            this.state.loadStarted ? css(styles.zippyHeader) : css(styles.none)
          }
          component="h1"
          style={{ display: this.state.loadDone ? "none" : "inherit" }}
          variant={
            this.state.loadStarted || this.state.stat === "加载完成"
              ? "caption"
              : "h5"
          }
        >
          {this.state.stat}
        </Typography>
        <Button
          onClick={() => {
            this.setState({ stat: "加载中 | Loading", loadStarted: true });
            setTimeout(() => {
              this.setState({
                stat: "加载完成",
                loadStarted: false,
              });

              setTimeout(() => {
                this.setState({ loadDone: true });
                setTimeout(() => {
                  eve.emit("start-clicked");
                }, 600);
              }, 600);
            }, 3000);
          }}
          fullWidth
          variant="outlined"
          style={{
            margin: "1em 0",
            display:
              this.state.loadStarted ||
              this.state.loadDone ||
              this.state.stat === "加载完成"
                ? "none"
                : "inherit",
          }}
        >
          Start | 开始体验
        </Button>
      </div>
    );
  }
}

export { Loader };
