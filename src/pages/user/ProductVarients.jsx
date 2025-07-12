import React, { useEffect } from "react";
import {useQuery} from "@tanstack/react-query";;
import PageHeader from "@/components/pageHeader/pageHeader";
import { productVarientServices } from "@/services/ProductVarientServices";
import { useLocation, useNavigate } from "react-router-dom";
import ProductVariantCard from "@/components/cards/ProductVarientCard";

const ProductVarients = () => {

  const location = useLocation();
  const product = location.state?.product;
  const navigate = useNavigate()
  useEffect(()=>{
    if (!product) {
      navigate('/products')
    }
  },[product])
  const fetchProductVarient = async () => {
    try {
      const response = await productVarientServices.getVarients(product.id);
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  };

  const {
    data: productVarients,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["productVarients", product.id],
    queryFn: fetchProductVarient,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="px-4 py-6 lg:px-12 lg:py-12">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div>
          <PageHeader
            title={product.ProductName}
            link={{pathname: "/add-Varients/"}}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productVarients?.length > 0 ? (
              productVarients.map((variant) => (
                <ProductVariantCard key={variant.id} variant={variant} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No products variants found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVarients;
