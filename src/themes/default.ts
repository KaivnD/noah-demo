import { createMuiTheme } from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";
import blue from "@material-ui/core/colors/blue";

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: green,
    text: {
      primary: "#fff",
      secondary: "#fff",
      disabled: "#fff",
      hint: "#fff",
    },
    background: { paper: "#fff", default: "#021122" },
  },
});

export default theme;
