import React, {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {ProductServices} from "@/services/productServices";
import ProductCard from "@/components/cards/ProductCard";
import PageHeader from "@/components/pageHeader/pageHeader";
import {useNavigate} from "react-router-dom";
import PaginationButtons from "@/components/buttons/PaginationButtons";

const AllProducts = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async () => {
    try {
      const params = {page: currentPage};
      const response = await ProductServices.getProducts(params);
      console.log(response);
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
    queryKey: ["products", currentPage],
    queryFn: fetchProducts,
    refetchOnWindowFocus: false,
  });

  const totalProducts = productsData?.count || 0;
  const totalPages = Math.ceil(totalProducts / 4);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="px-4 pt-6 pb-20 lg:px-12 lg:py-12">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div>
          <PageHeader title="All Products" link={{pathname: "/add-Product/"}} />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productsData?.results?.length > 0 ? (
              productsData.results.map((product) => (
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
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <PaginationButtons
              handlePageChange={handlePageChange}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AllProducts;
