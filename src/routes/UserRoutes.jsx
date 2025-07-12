import React from "react";
import {Route, Routes} from "react-router-dom";
import Home from "@/pages/user/Home";
import Navbar from "@/components/layout/Navbar";
import AllProducts from "@/pages/user/AllProducts";
import AddProduct from "@/pages/user/AddProduct";
import ProductVarients from "@/pages/user/ProductVarients";
import StockReportDashboard from "@/pages/user/StockReport";


const UserRoutes = () => {
  return (
    <>
      <div className="">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/product-variants" element={<ProductVarients />} />
          <Route path="/stock-report" element={<StockReportDashboard />} />
        </Routes>
      </div>
    </>
  );
};

export default UserRoutes;
