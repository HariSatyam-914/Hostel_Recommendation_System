import axios from "axios";


const API_BASE_URL = "http://localhost:8080";


export const getAdminHostels = async () => {


   const token = localStorage.getItem("token");


   const response = await axios.get(
       `${API_BASE_URL}/api/admin/hostels`,
       {
           headers: {
               Authorization: `Bearer ${token}`
           }
       }
   );


   return response.data;
};




