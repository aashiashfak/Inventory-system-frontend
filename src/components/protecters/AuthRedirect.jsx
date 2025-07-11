import {useEffect} from "react";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";

const AuthRedirect = ({children}) => {
  const user = useSelector((state) => state.userAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.isAuthenticated) {
      navigate("/");
    }
  }, [user.isAuthenticated, user.role]);

  return user.isAuthenticated ? null : children;
};

export default AuthRedirect;
