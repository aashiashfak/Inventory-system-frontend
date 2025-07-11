import {Button} from "@/components/ui/button";
import {Home, ShoppingBag, FileText} from "lucide-react";
import {useSelector, useDispatch} from "react-redux";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {logoutUser} from "@/utils/axiosFunctions";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(
    (state) => state.userAuth.isAuthenticated
  );

  const activePath = (path) => location.pathname === path;

  const navItems = [
    {
      title: "Home",
      icon: <Home className="w-5 h-5 text-gray-700" />,
      path: "/",
      authRequired: false,
    },
    {
      title: "All Products",
      icon: <ShoppingBag className="w-5 h-5 text-gray-700" />,
      path: "/products",
      authRequired: true,
    },
    {
      title: "Stock Report",
      icon: <FileText className="w-5 h-5 text-gray-700" />,
      path: "/stock-report",
      authRequired: true,
    },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth/sign-in");
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 bg-white shadow-md sticky top-0 z-50">
        <h2 className="text-xl font-bold text-gray-800">
          <Link to="/">STORE</Link>
        </h2>

        <div className="hidden md:flex space-x-6">
          {navItems
            .filter((item) => !item.authRequired || isAuthenticated)
            .map((item) => (
              <Button
                key={item.title}
                variant="link"
                className={`text-gray-700 hover:text-black ${
                  activePath(item.path) ? "font-bold" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.title}
              </Button>
            ))}
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button onClick={() => navigate("/auth/sign-in")}>Login</Button>
          )}
        </div>
      </div>

      {/* Bottom Navigation for Small Screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="flex justify-around py-2">
          {navItems
            .filter((item) => !item.authRequired || isAuthenticated)
            .map((item) => (
              <div className="flex flex-col items-center" key={item.title}>
                <Button
                  variant="ghost"
                  className="p-2"
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                </Button>
                <p
                  className={`text-xs ${
                    activePath(item.path) ? "font-bold" : ""
                  }`}
                >
                  {item.title}
                </p>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;
