import {instance} from "@/utils/axios";

export const ProductServices = {
  getProducts: async () => {
    const response = await instance.get("/product/list-create/");
    return response.data;
  },
  createProduct: async (formData) => {
    const response = await instance.post("/product/list-create/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
