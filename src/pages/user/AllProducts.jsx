import React from "react";
import {useQuery} from "@tanstack/react-query";
import {ProductServices} from "@/services/productServices";
import ProductCard from "@/components/cards/ProductCard";
import PageHeader from "@/components/pageHeader/pageHeader";
import {useNavigate} from "react-router-dom";

const AllProducts = () => {
  const navigate = useNavigate();
  const fetchProducts = async () => {
    try {
      const response = await ProductServices.getProducts();
      console.log(response)
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  };

  const {
    data: productsData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["Products"],
    queryFn: fetchProducts,
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
          <PageHeader title="All Products" link={{pathname: "/add-Product/"}} />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {productsData?.length > 0 ? (
              productsData.map((product) => (
                <ProductCard
                  onClick={() =>
                    navigate("/product-variants", {
                      state: {product},
                    })
                  }
                  key={product.id}
                  product={product}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No products found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
