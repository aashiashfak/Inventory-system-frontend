import React, {useState} from "react";
import SignUpForm from "@/components/forms/SignUpForm";
import {InputOTPControlled} from "@/components/forms/OtpComponent";
import {noAuthInstance} from "@/utils/axios";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {setUser} from "@/redux/slices/authslice";
import useToastNotification from "@/hooks/SonnerToast";
import BackButton from "@/components/Buttons/BackButton";
import {setExpiryTime} from "@/utils/axiosFunctions";

const SignUp = () => {
  const [isOTPsent, setIsOTPsent] = useState(false);
  const [userData, setUserData] = useState({});
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const showToast = useToastNotification();

  console.log("otp", otp);

  const verifyAndLogin = async () => {
    try {
      setLoading(true);
      const updatedData = {
        ...userData,
        otp: otp,
        role: "User",
      };
      const response = await noAuthInstance.post(
        "/accounts/sign-up/verify-otp/",
        updatedData
      );
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
      setExpiryTime();
      showToast("User created and logged in successfully", "success");
      navigate("/");
      console.log("OTP verified successfully", response.data);
    } catch (error) {
      showToast(
        error?.response?.data?.error || "An unknown error occurred",
        "error"
      );
      console.error("Error during OTP verification:", error);
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
    <>
      <div className="max-w-md mx-auto my-10 p-6 border rounded-md shadow-md ">
        <BackButton handleBackClick={handleBackClick} />
        <h1 className="text-2xl font-bold mb-6 text-center"> Sign Up</h1>
        {!isOTPsent ? (
          <SignUpForm setUserData={setUserData} setIsOTPsent={setIsOTPsent} />
        ) : (
          <InputOTPControlled
            email={userData?.email}
            verifyAndLogin={verifyAndLogin}
            setOtp={setOtp}
            isLoading={loading}
          />
        )}
      </div>
    </>
  );
};

export default SignUp;
