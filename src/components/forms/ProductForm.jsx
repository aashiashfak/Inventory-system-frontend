import React, {useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {ProductServices} from "@/services/productServices";
import BackButton from "../buttons/BackButton";
import { useNavigate } from "react-router-dom";
import useToastNotification from "@/hooks/SonnerToast";

const ProductForm = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate()
  const showToast = useToastNotification()
  const [isLoading, setIsLoading] = useState(false)

  const formik = useFormik({
    initialValues: {
      ProductID: "",
      ProductCode: "",
      ProductName: "",
      ProductImage: null,
      HSNCode: "",
      IsFavourite: false,
      Active: true,
    },
    validationSchema: Yup.object({
      ProductID: Yup.string().required("Required"),
      ProductCode: Yup.string().required("Required"),
      ProductName: Yup.string().required("Required"),
      ProductImage: Yup.mixed().required("Image required"),
    }),
    onSubmit: async (values, {resetForm, setErrors}) => {
      const formData = new FormData();
      for (let key in values) {
        if (key === "ProductImage" && values[key]) {
          formData.append("ProductImage", values[key]);
        } else {
          formData.append(key, values[key]);
        }
      }

      try {
        setIsLoading(true)
        const response =  await ProductServices.createProduct(formData);
        console.log("response of createProduct", response)
        showToast(`Product ${response.ProductName} created successfully`,"success")
          resetForm();
          setImagePreview(null);
          navigate('/products')
        } catch (error) {
          console.error("Error creating product:", error);
          if (error.response && error.response) {
            const backendErrors = error.response.data;
            const formikErrors = Object.fromEntries(
              Object.entries(backendErrors).map(([field, messages]) => [
                field,
                messages.join(" "),
              ])
            );

            console.log(formikErrors)

            setErrors(formikErrors);
          }
          showToast("Failed to create Product", "error");
        }finally{
            setIsLoading(false)
        }}
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="space-y-6 p-6 max-w-xl mx-auto shadow-lg"
    >
      <BackButton handleBackClick={() => navigate(-1)} />
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          ProductForm
        </h1>
        <Label htmlFor="ProductID">Product ID</Label>
        <Input
          id="ProductID"
          name="ProductID"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.ProductID}
        />
        {formik.touched.ProductID && formik.errors.ProductID && (
          <p className="text-sm text-red-500">{formik.errors.ProductID}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="ProductCode">Product Code</Label>
        <Input
          id="ProductCode"
          name="ProductCode"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.ProductCode}
        />
        {formik.touched.ProductCode && formik.errors.ProductCode && (
          <p className="text-sm text-red-500">{formik.errors.ProductCode}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="ProductName">Product Name</Label>
        <Input
          id="ProductName"
          name="ProductName"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.ProductName}
        />
        {formik.touched.ProductName && formik.errors.ProductName && (
          <p className="text-sm text-red-500">{formik.errors.ProductName}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="HSNCode">HSN Code</Label>
        <Input
          id="HSNCode"
          name="HSNCode"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.HSNCode}
        />
      </div>

      {/* <div className="flex flex-col space-y-2">
        <Label htmlFor="TotalStock">Total Stock</Label>
        <Input
          id="TotalStock"
          name="TotalStock"
          type="number"
          onChange={formik.handleChange}
          value={formik.values.TotalStock}
        />
        {formik.touched.TotalStock && formik.errors.TotalStock && (
          <p className="text-sm text-red-500">{formik.errors.TotalStock}</p>
        )}
      </div> */}

      <div className="flex flex-col space-y-2">
        <Label htmlFor="ProductImage">Product Image</Label>
        <Input
          id="ProductImage"
          name="ProductImage"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            formik.setFieldValue("ProductImage", file || null);

            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                setImagePreview(reader.result);
              };
              reader.readAsDataURL(file);
            } else {
              // User cancelled file selection -> clear preview
              setImagePreview(null);
            }
          }}
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-2 w-32 h-32 object-cover border rounded"
          />
        )}
        {formik.touched.ProductImage && formik.errors.ProductImage && (
          <p className="text-sm text-red-500">{formik.errors.ProductImage}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="IsFavourite"
          name="IsFavourite"
          checked={formik.values.IsFavourite}
          onCheckedChange={(val) => formik.setFieldValue("IsFavourite", val)}
        />
        <Label htmlFor="IsFavourite">Mark as Favourite</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="Active"
          name="Active"
          checked={formik.values.Active}
          onCheckedChange={(val) => formik.setFieldValue("Active", val)}
        />
        <Label htmlFor="Active">Active</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant={"outline"} onClick={() => navigate("/products")}>
          cancel
        </Button>
        <Button disabled={isLoading} type="submit">Create Product</Button>
      </div>
    </form>
  );
};

export default ProductForm;
