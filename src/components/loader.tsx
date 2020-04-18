import React, { FC } from "react";
import {
  Slider,
  SvgIcon,
  Typography,
  Avatar,
  Grid,
  Button,
} from "@material-ui/core";
import { StyleSheet, css } from "aphrodite";

interface LoaderProp {
  onLaunch: () => void;
}

const Loader: FC<LoaderProp> = (props) => {
  const styles = StyleSheet.create({
    paper: {
      textAlign: "center",
    },
    icon: {},
  });
  return (
    <div className={css(styles.paper)}>
      <Grid
        container
        style={{ height: "100vh" }}
        direction="row"
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <SvgIcon style={{ fontSize: "128px" }} viewBox="0 0 1024 1024">
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
          <Typography component="h1" variant="h5">
            Welcom to Noah.
          </Typography>
          <Button
            onClick={props.onLaunch}
            variant="outlined"
            style={{ margin: "1em 0" }}
          >
            Start | 开始体验
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export { Loader };
