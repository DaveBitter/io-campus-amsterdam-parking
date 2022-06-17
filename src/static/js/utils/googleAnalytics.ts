import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-Z1T119T2XT");
};
export const logPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};
