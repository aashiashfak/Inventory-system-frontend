import {noAuthInstance} from "@/utils/axios";

const logoutService = async () => {
  const response = await noAuthInstance.post(
    "accounts/logout/",
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

export default logoutService;
