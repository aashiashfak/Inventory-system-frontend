import React, {useState} from "react";
import {useForm, useFieldArray, Controller} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import BackButton from "../buttons/BackButton";
import {useNavigate} from "react-router-dom";
import useToastNotification from "@/hooks/SonnerToast";
import {ProductServices} from "@/services/productServices";

const schema = Yup.object().shape({
  ProductID: Yup.number().required("Product ID is required").min(0),
  ProductCode: Yup.string().required("Product Code is required"),
  ProductName: Yup.string().required("Product Name is required"),
  ProductImage: Yup.mixed().required("Product image is required"),
  variants: Yup.array()
    .of(
      Yup.object().shape({
        sku: Yup.string().required("SKU is required"),
        stock: Yup.number().required("Stock is required").min(0),
        price: Yup.number().required("Price is required").min(0),
        image: Yup.mixed().required("Variant image is required"),
        option_data: Yup.array()
          .of(
            Yup.object().shape({
              variant_type: Yup.string()
                .oneOf(
                  ["Color", "Size"],
                  "Variant type must be 'Color' or 'Size'"
                )
                .required("Variant type required"),
              value: Yup.string().required("Value required"),
            })
          )
          .min(1, "At least one option required")
          .test(
            "no-duplicate-options",
            "Duplicate variant type and value within a variant are not allowed",
            (options) => {
              if (!options) return true;
              const seen = new Set();
              for (const opt of options) {
                const key = `${opt.variant_type}-${opt.value}`;
                if (seen.has(key)) return false;
                seen.add(key);
              }
              return true;
            }
          ),
      })
    )
    .min(1, "At least one variant required")
    .test({
      name: "no-duplicate-variant-combinations",
      message: "Duplicate variant option combinations are not allowed",
      test(value) {
        if (!value) return true;
        const seen = new Set();
        for (const variant of value) {
          const combo = (variant.option_data || [])
            .map((o) => `${o.variant_type}-${o.value}`)
            .sort()
            .join("|");
          if (seen.has(combo)) {
            console.log("Duplicate variant combo found:", combo);
            // Attach error to the array path so RHF sees it in errors.variants.message
            return this.createError({path: this.path, message: this.message});
          }
          seen.add(combo);
        }
        return true;
      },
    }),
});

const ProductForm = () => {
  
  const navigate = useNavigate();
  const showToast = useToastNotification();

  const {
    register,
    control,
    setError,
    handleSubmit,
    watch,
    setValue,
    formState: {errors, isSubmitting},
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ProductID: "",
      ProductCode: "",
      ProductName: "",
      ProductImage: null,
      HSNCode: "",
      IsFavourite: false,
      Active: true,
      variants: [
        {
          sku: "",
          stock: "",
          price: "",
          image: null,
          option_data: [{variant_type: "", value: ""}],
        },
      ],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const onerror = (errors) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element && element.scrollIntoView) {
        element.scrollIntoView({behavior: "smooth", block: "center"});
        element.focus();
      }
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("ProductID", data.ProductID);
    formData.append("ProductCode", data.ProductCode);
    formData.append("ProductName", data.ProductName);
    formData.append("ProductImage", data.ProductImage);
    formData.append("HSNCode", data.HSNCode);
    formData.append("IsFavourite", data.IsFavourite);
    formData.append("Active", data.Active);
    formData.append(
      "variants",
      JSON.stringify(data.variants.map(({image, ...rest}) => rest))
    );

    // Append each variant image separately
    data.variants.forEach((variant, index) => {
      formData.append(`variant_image_${index}`, variant.image);
    });

    try {
      const response = await ProductServices.createProduct(formData);
      showToast(
        `Product ${response.ProductName} created successfully`,
        "success"
      );
      reset();
      navigate("/products");
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        const backendErrors = error.response.data;

        // Set backend errors into RHF
        Object.entries(backendErrors).forEach(([field, messages]) => {
          const msg = Array.isArray(messages) ? messages.join(" ") : messages;
          setError(field, {type: "manual", message: msg});
        });
      }
      showToast("Failed to create product check the skus are not duplicate", "error");
    }
  };

  const productImageWatch = watch("ProductImage");
  const variantsWatch = watch("variants");

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onerror)}
      className="space-y-6 p-6 max-w-2xl mx-auto shadow-lg"
    >
      <BackButton handleBackClick={() => navigate(-1)} />
      <h2 className="text-2xl font-bold text-center">Create Product</h2>
      {/* Basic Fields */}
      <Label className="mb-2">Product ID</Label>
      <Input type="number" {...register("ProductID")} />
      {errors.ProductID && (
        <p className="text-sm text-red-500">{errors.ProductID.message}</p>
      )}

      <Label className="mb-2">Product Code</Label>
      <Input {...register("ProductCode")} />
      {errors.ProductCode && (
        <p className="text-sm text-red-500">{errors.ProductCode.message}</p>
      )}

      <Label className="mb-2">Product Name</Label>
      <Input {...register("ProductName")} />
      {errors.ProductName && (
        <p className="text-sm text-red-500">{errors.ProductName.message}</p>
      )}

      <Label className="mb-2">HSN Code</Label>
      <Input {...register("HSNCode")} />

      <Label className="mb-2">Product Image</Label>
      <Input
        className="w-1/2"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setValue("ProductImage", file);
          }
        }}
      />
      {errors.ProductImage && (
        <p className="text-sm text-red-500">{errors.ProductImage.message}</p>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          checked={watch("IsFavourite")}
          onCheckedChange={(val) => setValue("IsFavourite", val)}
        />
        <Label>Mark as Favourite</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={watch("Active")}
          onCheckedChange={(val) => setValue("Active", val)}
        />
        <Label>Active</Label>
      </div>

      {/* Variants */}
      <h3 className="text-lg font-semibold mt-6">Variants</h3>

      {variantFields.map((variant, vIdx) => (
        <div key={variant.id} className="border p-4 rounded mb-4">
          <Label className="my-2">SKU</Label>
          <Input {...register(`variants.${vIdx}.sku`)} />
          {errors.variants?.[vIdx]?.sku && (
            <p className="text-sm text-red-500">
              {errors.variants[vIdx].sku.message}
            </p>
          )}

          <Label className="my-2">Price</Label>
          <Input type="number" {...register(`variants.${vIdx}.price`)} />
          {errors.variants?.[vIdx]?.price && (
            <p className="text-sm text-red-500">
              {errors.variants[vIdx].price.message}
            </p>
          )}

          <Label className="my-2">Stock</Label>
          <Input type="number" {...register(`variants.${vIdx}.stock`)} />
          {errors.variants?.[vIdx]?.stock && (
            <p className="text-sm text-red-500">
              {errors.variants[vIdx].stock.message}
            </p>
          )}

          <Label className="my-2">Variant Image</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setValue(`variants.${vIdx}.image`, file);
              }
            }}
          />
          {errors.variants?.[vIdx]?.image && (
            <p className="text-sm text-red-500">
              {errors.variants[vIdx].image.message}
            </p>
          )}

          <h4 className="font-medium mt-4">Options</h4>
          <Controller
            control={control}
            name={`variants.${vIdx}.option_data`}
            render={({field}) => (
              <>
                {field.value.map((opt, oIdx) => {
                  const variantErrors =
                    errors.variants?.[vIdx]?.option_data?.[oIdx] || {};

                  return (
                    <div key={oIdx} className="flex flex-col gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <Input
                          className="w-1/2"
                          placeholder="Type (Color or Size)"
                          value={opt.variant_type}
                          onChange={(e) => {
                            const updated = [...field.value];
                            updated[oIdx].variant_type = e.target.value;
                            field.onChange(updated);
                          }}
                        />
                        <Input
                          className="w-1/2"
                          placeholder="Value (e.g., Red, M)"
                          value={opt.value}
                          onChange={(e) => {
                            const updated = [...field.value];
                            updated[oIdx].value = e.target.value;
                            field.onChange(updated);
                          }}
                        />
                        {field.value.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const updated = [...field.value];
                              updated.splice(oIdx, 1);
                              field.onChange(updated);
                            }}
                          >
                            -
                          </Button>
                        )}
                      </div>
                      {/* Show individual field errors */}
                      {variantErrors.variant_type && (
                        <p className="text-sm text-red-500">
                          {variantErrors.variant_type.message}
                        </p>
                      )}
                      {variantErrors.value && (
                        <p className="text-sm text-red-500">
                          {variantErrors.value.message}
                        </p>
                      )}
                    </div>
                  );
                })}

                <Button
                  type="button"
                  className={field.value.length > 1 && "hidden"}
                  variant="secondary"
                  disabled={field.value.length >= 2}
                  onClick={() =>
                    field.onChange([
                      ...field.value,
                      {variant_type: "", value: ""},
                    ])
                  }
                >
                  + Option
                </Button>

                {/* Array-level error (e.g., min one option or duplicate) */}
                {typeof errors.variants?.[vIdx]?.option_data?.message ===
                  "string" && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.variants[vIdx].option_data.message}
                  </p>
                )}
              </>
            )}
          />

          {variantFields.length > 1 && (
            <Button
              type="button"
              variant="destructive"
              className="mt-4"
              onClick={() => removeVariant(vIdx)}
            >
              -
            </Button>
          )}
        </div>
      ))}

      {/* Move array-level variants error display here */}
      {errors.variants?.root?.message && (
        <p className="text-sm text-red-500 mt-2">
          {errors.variants.root.message}
        </p>
      )}

      <Button
        className={variantFields.length > 2 && "hidden"}
        type="button"
        variant="secondary"
        disabled={variantFields.length > 2}
        onClick={() =>
          appendVariant({
            sku: "",
            stock: "",
            price: "",
            image: null,
            option_data: [{variant_type: "", value: ""}],
          })
        }
      >
        + Add Variant
      </Button>

      {/* Submit */}
      <div className="flex justify-end mt-6 gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => navigate("/products")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Create Product
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
