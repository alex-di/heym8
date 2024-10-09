import React = require("react");
import { SplashScreen } from "../../shared/ui";


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
