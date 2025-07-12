import React from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ImageOff} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { stockService } from "@/services/stockService";
import { useQueryClient } from "@tanstack/react-query";
import useToastNotification from "@/hooks/SonnerToast";

const ProductVariantCard = ({variant}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const queryClient = useQueryClient();
  const showToast = useToastNotification()

  const schema = Yup.object().shape({
    change_type: Yup.string()
      .oneOf(["purchase", "sale"], "Operation must be purchase or sale")
      .required("Operation type is required"),
    change_amount: Yup.number()
      .typeError("Amount must be a number")
      .required("Amount is required")
      .min(1, "Minimum amount is 1")
      .test(
        "check-stock-limit",
        "Sale amount exceeds available stock",
        function (val) {
            if (this.parent.change_type === "sale") {
              return val < variant.stock;
            }
              return true; 
        }
      ),
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: {errors, isSubmitting},
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      change_type: "purchase",
      change_amount: "",
    },
  });

  const change_type = watch("change_type");

  const onSubmit = async (data) => {
    console.log(data);
    try{
        const response = await stockService.updateStock(variant.id, data)
        console.log("response after success", response?.new_stock);
        variant.stock = response?.new_stock
        queryClient.invalidateQueries(["products"]);
        queryClient.invalidateQueries(["productVarients", variant.id]);
        showToast(`${variant.sku} stock updated successfully`, "success");

    }catch(error){
        console.error(error);
    }finally{
        setIsEditing(false);
        reset();
    }
  };

  const colorOption = variant.options?.find(
    (opt) => opt.variant_type === "Color"
  );
  const sizeOption = variant.options?.find(
    (opt) => opt.variant_type === "Size"
  );

  return (
    <Card className="hover:shadow-xl transition duration-300 ease-in-out cursor-pointer">
      <CardHeader className="flex items-center justify-center">
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
        <CardTitle className="text-sm font-medium text-gray-800 truncate">
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

        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="border w-full"
            variant="outline"
          >
            Edit Stock
          </Button>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
            <div>
              <Label>Operation</Label>
              <Select
                value={change_type}
                onValueChange={(val) => setValue("change_type", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                </SelectContent>
              </Select>
              {errors.change_type && (
                <p className="text-sm text-red-500">
                  {errors.change_type.message}
                </p>
              )}
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                {...register("change_amount")}
                placeholder="Enter amount"
              />
              {errors.change_amount && (
                <p className="text-sm text-red-500">
                  {errors.change_amount.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  reset();
                  setIsEditing(false);
                }}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductVariantCard;
