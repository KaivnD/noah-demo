import React, { Component } from "react";
import { Tabs, Tab, Box, Button, Slider, Typography, FormControl, InputLabel, MenuItem, FormHelperText, Select, Divider } from "@material-ui/core";
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
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
}

interface ParamItem {
  name: string
  default: number
  min: number
  max: number
  step: number
  marks: {value: number, label: string}[]
  valueText: (value: number) => string
  value: number
  onChange: (e: React.ChangeEvent<{}>, v: number | number[]) => void
}

export class HUD extends Component<{}, HUDState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      page: 0,
      open: false,
      expand: false,
      info: "",
      a: 2,
      b: 1,
      c: 1,
      d: 1,
      e: 1
    };

  }
  componentDidMount() {
    eve.on("open-hud", (msg) => {
      // if (this.state.open) this.setState({ open: false });
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
        width: "360px",
        right: '0',
        top: "0",
        bottom: "0",
        padding: '3em',
        opacity: this.state.open ? 1 : 0,
        height: "100%",
        backgroundColor: "#92b3ec26",
        boxShadow: "0 0 12px 9px #0000001a",
        pointerEvents: this.state.open ? 'auto' : "none",
        transition: "all 300ms ease-in-out"
      },
    });

    const form: ParamItem[] = [
      {
        name: "窗面数量",
        default: 2,
        min: 2,
        max: 4,
        step: 1,
        marks: [
          {
            value: 2,
            label: "2个",
          },
          {
            value: 3,
            label: "3个",
          },
          {
            value: 4,
            label: "4个",
          }
        ],
        valueText: (value: number) => `${value}个`,
        value: this.state.a,
        onChange: (e, v) => {
          if (v instanceof Array) return
          const val = v as number
          this.setState({a: val})
        }
      },
      {
        name: "窗洞排列",
        default: 1,
        min: 1,
        max: 3,
        step: 1,
        marks: [
          {
            value: 1,
            label: "棋盘菱形",
          },
          {
            value: 2,
            label: "竖向对齐",
          },
          {
            value: 3,
            label: "完全随机",
          }
        ],
        valueText: (value: number) => `${value}个`,
        value: this.state.b,
        onChange: (e, v) => {
          if (v instanceof Array) return
          const val = v as number
          this.setState({b: val})
        }
      },
      {
        name: "窗洞形式",
        default: 1,
        min: 1,
        max: 3,
        step: 1,
        marks: [
          {
            value: 1,
            label: "幕墙",
          },
          {
            value: 2,
            label: "普通窗洞",
          },
          {
            value: 3,
            label: "凸窗",
          }
        ],
        valueText: (value: number) => `${value}个`,
        value: this.state.c,
        onChange: (e, v) => {
          if (v instanceof Array) return
          const val = v as number
          this.setState({c: val})
        }
      },
      {
        name: "墙面形式",
        default: 1,
        min: 1,
        max: 3,
        step: 1,
        marks: [
          {
            value: 1,
            label: "无墙面装饰",
          },
          {
            value: 2,
            label: "竖向",
          },
          {
            value: 3,
            label: "横向",
          }
        ],
        valueText: (value: number) => `${value}个`,
        value: this.state.d,
        onChange: (e, v) => {
          if (v instanceof Array) return
          const val = v as number
          this.setState({d: val})
        }
      },
      {
        name: "窗洞细分",
        default: 1,
        min: 1,
        max: 2,
        step: 1,
        marks: [
          {
            value: 1,
            label: "普通分割",
          },
          {
            value: 2,
            label: "竖向",
          },
        ],
        valueText: (value: number) => `${value}个`,
        value: this.state.e,
        onChange: (e, v) => {
          if (v instanceof Array) return
          const val = v as number
          this.setState({e: val})
        }
      },
    ]



    return (
      <>
        {this.props.children}
        <div className={css(styles.root)}>
          <div className={css(styles.wrap)}>
            <div className={css(styles.dataPanel)}>
              {
                form.map((item, i) => (
                  <div key={i} style={{margin: '2em 0'}}>
                    <Typography id="discrete-slider" gutterBottom>
                      {item.name}
                    </Typography>
                    <Slider
                      defaultValue={item.default}
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      marks={item.marks}
                      aria-labelledby="discrete-slider"
                      // style={{width: '30%'}}
                      getAriaValueText={item.valueText}
                      valueLabelDisplay="auto"
                      value={item.value}
                      onChangeCommitted={item.onChange}
                    />
                    <Divider/>
                  </div>
                ))
              }
              <Button variant="contained" color="primary" fullWidth onClick={() => {
                console.log(this.state)
              }}>提交</Button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
