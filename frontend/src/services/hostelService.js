import axios from "axios";

const BASE_URL = "http://localhost:8080/api/owner/hostels";

export const saveBasicInfo = (data) => {
    return axios.post(`${BASE_URL}/basic-info`, data);
};