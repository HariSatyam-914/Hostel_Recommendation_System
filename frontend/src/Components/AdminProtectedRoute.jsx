import { Navigate, Outlet } from "react-router-dom";


const AdminProtectedRoute = () => {


   const token = localStorage.getItem("token");
   const user = JSON.parse(localStorage.getItem("user"));


   if (!token) {
       return <Navigate to="/login" replace />;
   }


   if (!user || user.role !== "ADMIN") {
       return <Navigate to="/home" replace />;
   }


   return <Outlet />;
};


export default AdminProtectedRoute;




