/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./LandingPage/Header";
import Footer from "./LandingPage/Footer";
import MobileBottomNav from "./MobileBottomNav";

const MainLayout = () => {
  useEffect(() => {
    const prevHtmlOverflowX = document.documentElement.style.overflowX;
    const prevBodyOverflowX = document.body.style.overflowX;

    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";

    return () => {
      document.documentElement.style.overflowX = prevHtmlOverflowX;
      document.body.style.overflowX = prevBodyOverflowX;
    };
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white selection:bg-emerald-500 selection:text-white">
      <Header />

      <main className="flex-1 pt-24 sm:pt-24 lg:pt-36 pb-20 md:pb-0">
        <Outlet />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;