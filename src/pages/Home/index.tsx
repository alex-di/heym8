import React = require("react");

import { LayoutContext, SplashScreen } from "../../components";
import { Outlet } from "react-router-dom";

export function HomePage() {
  console.log('home page')
  return (
    <div className="rooms-container">
      {/* <h1>INDAFACE</h1> */}
      <SplashScreen></SplashScreen>
      {/* <Outlet></Outlet> */}
    </div>
  );
}
