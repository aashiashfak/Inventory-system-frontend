import {instance} from "@/utils/axios";

export const productVarientServices = {
  getVarients: async (id) => {
    const response = await instance.get(
      `product/varient-list-create/${id}/`
    );
    return response.data;
  },
  createProduct: async (formData) => {
    const response = await instance.post(
      `/product/varient-list-create/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
