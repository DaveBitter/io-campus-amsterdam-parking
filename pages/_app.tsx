// Libs
import React, { useEffect } from "react";
import { useRouter } from "next/router";

// Utils
import meta from "../meta.config.js";
import { initGA, logPageView } from "../src/static/js/utils/googleAnalytics";

// Resources
import "../src/styles/all.scss";

// Components
import SiteMeta from "../src/components/Site/SiteMeta/SiteMeta";
import useServiceWorker from "../src/static/js/utils/hooks/useServiceWorker";

// Interface
interface IProps {
  Component: any;
  pageProps: any;
}

// Component
const App = ({ Component, pageProps }: IProps) => {
  useServiceWorker();
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }, [router.route]);

  return (
    <>
      <SiteMeta {...meta} />

      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
};

// Props
App.defaultProps = {};

export default App;
