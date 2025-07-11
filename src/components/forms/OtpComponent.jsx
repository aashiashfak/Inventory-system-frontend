import React, {useState} from "react";
import {InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp";
import {Button} from "../ui/button";

export function InputOTPControlled({
  email,
  verifyAndLogin,
  setOtp,
  isLoading,
  setIsError,
  isError,
}) {
  const [value, setValue] = useState("");
  const handleChange = (newValue) => {
    if (setIsError) {
      setIsError("");
    }
    console.log(newValue);
    if (newValue.length <= 6 && /^\d*$/.test(newValue)) {
      setValue(newValue);
      if (newValue.length === 6) {
        setOtp(newValue);
      }
    }
  };

  return (
    <div className="space-y-4 flex flex-col justify-center">
      <div className="text-center text-sm">
        Enter your one-time password sent to {email}
      </div>
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={handleChange}
          onComplete={(value) => {
            setOtp(value);
          }}
        >
          <InputOTPGroup>
            {Array.from({length: 6}).map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div className="text-center text-sm text-red-500 ">
        {isError ? isError : ""}
      </div>
      <Button disabled={value.length < 6 || isLoading} onClick={verifyAndLogin}>
        {isLoading ? " Loading..." : "Verify and Login"}
      </Button>
    </div>
  );
}
