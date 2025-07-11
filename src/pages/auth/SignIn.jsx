import BackButton from "@/components/buttons/BackButton";
import { InputOTPControlled } from "@/components/forms/OtpComponent";
import SignInForm from "@/components/forms/SignInForm";
import { setUser } from "@/redux/slices/authslice";
import {noAuthInstance} from "@/utils/axios";
import useToastNotification from "@/hooks/SonnerToast";
import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {setExpiryTime} from "@/utils/axiosFunctions";

const SignIn = () => {
  const [isOTPsent, setIsOTPsent] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [isError, setIsError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const showToast = useToastNotification();

  const handleFormSubmit = async (values, {setErrors}) => {
    setEmail(values.email);
    setLoading(true);
    try {
      const response = await noAuthInstance.post("/accounts/sign-in/", {
        email: values.email,
      });
      setExpiryTime();
      showToast(response.data.message || "otp sent succuss", "success");
      setIsOTPsent(true);
    } catch (error) {
      if (error.response?.data?.error) {
        setErrors({email: error.response?.data?.error});
      }
      console.error("OTP sent failed", error);
      console.error("OTP sent failed message ", error.response?.data?.error);
      showToast(error.response?.data?.error || "error sending otp", "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndLogin = async () => {
    try {
      setLoading(true);
      const response = await noAuthInstance.post("/accounts/verify-otp/", {
        email: email,
        otp: otp,
      });
      const {access, user} = response.data;
      dispatch(
        setUser({
          isAuthenticated: true,
          isActive: user.is_active || "",
          email: user.email || "",
          username: user.username || "",
          accessToken: access || "",
          role: user.role || "",
        })
      );
      showToast("User Logined Succussfully", "success");
    } catch (error) {
      showToast(error.response?.data?.error, "error");
      if (error) {
        setIsError(
          error.response?.data?.error ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const handleBackClick = () => {
    if (isOTPsent) {
      setIsOTPsent(false);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded-md shadow-md border-gray-100 overflow-y-auto">
      <BackButton handleBackClick={handleBackClick} />
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isOTPsent ? "Verify OTP " : "Sign In"}
      </h1>
      {!isOTPsent ? (
        <SignInForm onSubmit={handleFormSubmit} isLoading={loading} />
      ) : (
        <InputOTPControlled
          email={email}
          verifyAndLogin={verifyAndLogin}
          setOtp={setOtp}
          isLoading={loading}
          setIsError={setIsError}
          isError={isError}
        />
      )}
    </div>
  );
};

export default SignIn;
