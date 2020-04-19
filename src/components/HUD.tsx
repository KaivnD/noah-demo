import React, { Component } from "react";
import { SvgIcon, Tabs, Tab, Box, Button } from "@material-ui/core";
import { StyleSheet, css } from "aphrodite";
import {
  InfoOutlined,
  SettingsOutlined,
  WidgetsOutlined,
} from "@material-ui/icons";

import theme from "../themes/default";
import eve from "../libs/eve";

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {children}
    </Box>
  );
}

interface HUDState {
  page: number;
  open: boolean;
  expand: boolean;
  info: string;
}

export class HUD extends Component<{}, HUDState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      page: 0,
      open: false,
      expand: false,
      info: "",
    };

    eve.on("open-hud", (msg) => {
      if (this.state.open) this.setState({ open: false });
      setTimeout(() => {
        this.setState({ open: true, info: msg });
      }, 300);
    });
  }
  render() {
    const styles = StyleSheet.create({
      root: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        pointerEvents: "none",
      },
      wrap: {
        position: "relative",
        height: "100%",
        width: "100%",
      },
      dataPanel: {
        position: "absolute",
        width: "500px",
        top: "30px",
        right: "30px",
        bottom: "30px",
        transform: this.state.open ? "translateY(0px)" : "translateY(-100px)",
        opacity: this.state.open ? 1 : 0,
        height: this.state.expand ? "auto" : "300px",
        backgroundColor: "#92b3ec26",
        borderRadius: "9px",
        boxShadow: "0 0 12px 9px #0000001a",
        pointerEvents: "auto",
        transition: "all 300ms ease-in-out",
        "@media (max-width: 600px)": {
          width: "100%",
          height: "100px",
          top: "unset",
          left: "0",
          right: "0",
          bottom: "0",
        },
      },
    });
    // const marks = [
    //   {
    //     value: 0,
    //     label: "0°C",
    //   },
    //   {
    //     value: 20,
    //     label: "20°C",
    //   },
    //   {
    //     value: 37,
    //     label: "37°C",
    //   },
    //   {
    //     value: 100,
    //     label: "100°C",
    //   },
    // ];
    // function valuetext(value: number) {
    //   return `${value}°C`;
    // }

    return (
      <>
        {this.props.children}
        <div className={css(styles.root)}>
          {/* <Switch
            checked={this.state.checkedB}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              this.setState({ checkedB: event.target.checked });
              eve.emit("toggleHelper");
            }}
            color="primary"
            name="checkedB"
            inputProps={{ "aria-label": "primary checkbox" }}
          /> */}
          <div className={css(styles.wrap)}>
            <div>
              <SvgIcon
                style={{ fontSize: "128px", position: "absolute" }}
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
            </div>
            <div className={css(styles.dataPanel)}>
              <Tabs
                value={this.state.page}
                onChange={(e, v) => this.setState({ page: v })}
                variant="fullWidth"
                indicatorColor="secondary"
                textColor="secondary"
                aria-label="icon label tabs example"
              >
                <Tab icon={<InfoOutlined />} aria-label="RECENTS" />
                <Tab icon={<WidgetsOutlined />} aria-label="FAVORITES" />
                <Tab icon={<SettingsOutlined />} aria-label="NEARBY" />
              </Tabs>
              <TabPanel value={this.state.page} index={0} dir={theme.direction}>
                {this.state.info}
                <Button
                  onClick={() => eve.emit("block-reload", this.state.info)}
                  variant="outlined"
                  style={{ margin: "1em 0" }}
                >
                  Start | 开始体验
                </Button>
              </TabPanel>
              <TabPanel value={this.state.page} index={1} dir={theme.direction}>
                Item Two
              </TabPanel>
              <TabPanel value={this.state.page} index={2} dir={theme.direction}>
                Item Three
              </TabPanel>
              {/* <Slider
                defaultValue={20}
                getAriaValueText={valuetext}
                aria-labelledby="discrete-slider-custom"
                step={10}
                valueLabelDisplay="auto"
                marks={marks}
                onChangeCommitted={(e, v) => {
                  eve.emit("changeLightPos", v);
                }}
              /> */}
            </div>
          </div>
        </div>
      </>
    );
  }
}
