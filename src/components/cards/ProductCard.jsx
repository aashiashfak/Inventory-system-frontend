import React, {useEffect, useRef, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

const ProductCard = ({product, onClick}) => {
  const stockRef = useRef(null);
  const [displayStock, setDisplayStock] = useState(
    parseInt(product.TotalStock)
  );
  const previousStock = useRef(displayStock);

  useEffect(() => {
    const targetStock = parseInt(product.TotalStock);
    const start = previousStock.current;
    const end = targetStock;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const value = Math.round(start + (end - start) * progress);
      setDisplayStock(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousStock.current = targetStock;
      }
    };

    requestAnimationFrame(animate);
  }, [product.TotalStock]);

  return (
    <Card
      onClick={onClick}
      className="w-full shadow-sm hover:shadow-lg transition-shadow duration-300 p-0"
    >
      <CardHeader className="p-0 relative">
        {product?.ProductImage ? (
          <img
            src={product.ProductImage}
            alt={product.ProductName}
            className="w-full h-48 object-cover rounded-t-md"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}

        {!product.Active && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Inactive
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-3 space-y-1">
        <CardTitle className="text-base font-semibold truncate">
          {product.ProductName}
        </CardTitle>

        <div className="text-sm text-gray-500">
          Stock:{" "}
          <span
            ref={stockRef}
            className={
              product.TotalStock > 0 ? "text-green-600" : "text-red-500"
            }
          >
            {displayStock}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
