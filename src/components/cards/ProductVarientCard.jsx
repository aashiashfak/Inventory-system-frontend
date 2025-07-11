import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ImageOff} from "lucide-react";

const ProductVariantCard = ({variant}) => {
  const colorOption = variant.options?.find(
    (opt) => opt.variant_type === "Color"
  );
  const sizeOption = variant.options?.find(
    (opt) => opt.variant_type === "Size"
  );

  return (
    <Card className="hover:shadow-xl transition duration-300 ease-in-out cursor-pointer">
      <CardHeader className="flex items-center justify-center ">
        {variant.image ? (
          <img
            src={variant.image}
            alt={variant.sku}
            className="w-32 h-32 object-cover rounded-md"
          />
        ) : (
          <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-md">
            <ImageOff className="text-gray-400 w-8 h-8" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        <CardTitle className="text-sm font-medium text-gray-800">
          {variant.sku}
        </CardTitle>
        <div className="text-sm text-gray-600 flex flex-wrap gap-2">
          {colorOption && (
            <Badge variant="outline" className="capitalize">
              {colorOption.value}
            </Badge>
          )}
          {sizeOption && (
            <Badge variant="outline" className="capitalize">
              {sizeOption.value}
            </Badge>
          )}
        </div>
        <div className="text-sm text-gray-700">
          <span className="font-semibold">Price:</span> ₹{variant.price}
        </div>
        <div className="text-sm text-gray-700">
          <span className="font-semibold">Stock:</span> {variant.stock}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductVariantCard;
