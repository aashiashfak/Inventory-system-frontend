import {instance} from "@/utils/axios";

export const stockService = {
  updateStock: async (id, data) => {
    const response = await instance.post(
      `/product/variant/${id}/update-stock/`,
      data
    );
    return response.data;
  },
};
