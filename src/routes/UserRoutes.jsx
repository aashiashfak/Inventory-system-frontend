import React from "react";
import {Route, Routes} from "react-router-dom";
import Home from "@/pages/user/Home";
import Navbar from "@/components/layout/Navbar";
import AllProducts from "@/pages/user/AllProducts";
import AddProduct from "@/pages/user/AddProduct";
import ProductVarients from "@/pages/user/ProductVarients";


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
        </Routes>
      </div>
    </>
  );
};

export default UserRoutes;
