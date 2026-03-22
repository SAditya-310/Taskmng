import Navbar from "./navbar";
import { Outlet } from "react-router-dom";

function PrivateLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default PrivateLayout;