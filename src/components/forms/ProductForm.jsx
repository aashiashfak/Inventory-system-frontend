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
                  variant="secondary"
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
              Remove Variant
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
        type="button"
        variant="secondary"
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

// import React, {useState} from "react";
// import {useFormik} from "formik";
// import * as Yup from "yup";
// import {Input} from "@/components/ui/input";
// import {Switch} from "@/components/ui/switch";
// import {Button} from "@/components/ui/button";
// import {Label} from "@/components/ui/label";
// import {ProductServices} from "@/services/productServices";
// import BackButton from "../buttons/BackButton";
// import { useNavigate } from "react-router-dom";
// import useToastNotification from "@/hooks/SonnerToast";

// const ProductForm = () => {
//   const [imagePreview, setImagePreview] = useState(null);
//   const navigate = useNavigate()
//   const showToast = useToastNotification()
//   const [isLoading, setIsLoading] = useState(false)

//   const formik = useFormik({
//     initialValues: {
//       ProductID: "",
//       ProductCode: "",
//       ProductName: "",
//       ProductImage: null,
//       HSNCode: "",
//       IsFavourite: false,
//       Active: true,
//     },
//     validationSchema: Yup.object({
//       ProductID: Yup.string().required("Required"),
//       ProductCode: Yup.string().required("Required"),
//       ProductName: Yup.string().required("Required"),
//       ProductImage: Yup.mixed().required("Image required"),
//     }),
//     onSubmit: async (values, {resetForm, setErrors}) => {
//       const formData = new FormData();
//       for (let key in values) {
//         if (key === "ProductImage" && values[key]) {
//           formData.append("ProductImage", values[key]);
//         } else {
//           formData.append(key, values[key]);
//         }
//       }

//       try {
//         setIsLoading(true)
//         const response =  await ProductServices.createProduct(formData);
//         console.log("response of createProduct", response)
//         showToast(`Product ${response.ProductName} created successfully`,"success")
//           resetForm();
//           setImagePreview(null);
//           navigate('/products')
//         } catch (error) {
//           console.error("Error creating product:", error);
//           if (error.response && error.response) {
//             const backendErrors = error.response.data;
//             const formikErrors = Object.fromEntries(
//               Object.entries(backendErrors).map(([field, messages]) => [
//                 field,
//                 messages.join(" "),
//               ])
//             );

//             console.log(formikErrors)

//             setErrors(formikErrors);
//           }
//           showToast("Failed to create Product", "error");
//         }finally{
//             setIsLoading(false)
//         }}
//   });

//   return (
//     <form
//       onSubmit={formik.handleSubmit}
//       className="space-y-6 p-6 max-w-xl mx-auto shadow-lg"
//     >
//       <BackButton handleBackClick={() => navigate(-1)} />
//       <div className="flex flex-col space-y-2">
//         <h1 className="text-2xl font-bold text-gray-900 text-center">
//           ProductForm
//         </h1>
//         <Label htmlFor="ProductID">Product ID</Label>
//         <Input
//           id="ProductID"
//           name="ProductID"
//           type="text"
//           onChange={formik.handleChange}
//           value={formik.values.ProductID}
//         />
//         {formik.touched.ProductID && formik.errors.ProductID && (
//           <p className="text-sm text-red-500">{formik.errors.ProductID}</p>
//         )}
//       </div>

//       <div className="flex flex-col space-y-2">
//         <Label htmlFor="ProductCode">Product Code</Label>
//         <Input
//           id="ProductCode"
//           name="ProductCode"
//           type="text"
//           onChange={formik.handleChange}
//           value={formik.values.ProductCode}
//         />
//         {formik.touched.ProductCode && formik.errors.ProductCode && (
//           <p className="text-sm text-red-500">{formik.errors.ProductCode}</p>
//         )}
//       </div>

//       <div className="flex flex-col space-y-2">
//         <Label htmlFor="ProductName">Product Name</Label>
//         <Input
//           id="ProductName"
//           name="ProductName"
//           type="text"
//           onChange={formik.handleChange}
//           value={formik.values.ProductName}
//         />
//         {formik.touched.ProductName && formik.errors.ProductName && (
//           <p className="text-sm text-red-500">{formik.errors.ProductName}</p>
//         )}
//       </div>

//       <div className="flex flex-col space-y-2">
//         <Label htmlFor="HSNCode">HSN Code</Label>
//         <Input
//           id="HSNCode"
//           name="HSNCode"
//           type="text"
//           onChange={formik.handleChange}
//           value={formik.values.HSNCode}
//         />
//       </div>

//       {/* <div className="flex flex-col space-y-2">
//         <Label htmlFor="TotalStock">Total Stock</Label>
//         <Input
//           id="TotalStock"
//           name="TotalStock"
//           type="number"
//           onChange={formik.handleChange}
//           value={formik.values.TotalStock}
//         />
//         {formik.touched.TotalStock && formik.errors.TotalStock && (
//           <p className="text-sm text-red-500">{formik.errors.TotalStock}</p>
//         )}
//       </div> */}

//       <div className="flex flex-col space-y-2">
//         <Label htmlFor="ProductImage">Product Image</Label>
//         <Input
//           id="ProductImage"
//           name="ProductImage"
//           type="file"
//           accept="image/*"
//           onChange={(event) => {
//             const file = event.currentTarget.files?.[0];
//             formik.setFieldValue("ProductImage", file || null);

//             if (file) {
//               const reader = new FileReader();
//               reader.onloadend = () => {
//                 setImagePreview(reader.result);
//               };
//               reader.readAsDataURL(file);
//             } else {
//               // User cancelled file selection -> clear preview
//               setImagePreview(null);
//             }
//           }}
//         />
//         {imagePreview && (
//           <img
//             src={imagePreview}
//             alt="Preview"
//             className="mt-2 w-32 h-32 object-cover border rounded"
//           />
//         )}
//         {formik.touched.ProductImage && formik.errors.ProductImage && (
//           <p className="text-sm text-red-500">{formik.errors.ProductImage}</p>
//         )}
//       </div>

//       <div className="flex items-center space-x-2">
//         <Switch
//           id="IsFavourite"
//           name="IsFavourite"
//           checked={formik.values.IsFavourite}
//           onCheckedChange={(val) => formik.setFieldValue("IsFavourite", val)}
//         />
//         <Label htmlFor="IsFavourite">Mark as Favourite</Label>
//       </div>

//       <div className="flex items-center space-x-2">
//         <Switch
//           id="Active"
//           name="Active"
//           checked={formik.values.Active}
//           onCheckedChange={(val) => formik.setFieldValue("Active", val)}
//         />
//         <Label htmlFor="Active">Active</Label>
//       </div>
//       <div className="flex justify-end space-x-2">
//         <Button variant={"outline"} onClick={() => navigate("/products")}>
//           cancel
//         </Button>
//         <Button disabled={isLoading} type="submit">Create Product</Button>
//       </div>
//     </form>
//   );
// };

// export default ProductForm;
