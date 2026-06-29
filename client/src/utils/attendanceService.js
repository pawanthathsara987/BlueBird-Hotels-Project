import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
});

export const scanAttendance = (data) => {
    return API.post("/attendance/scan", data);
};

export const getAttendanceRecords = (params) => {
    return API.get("/attendance/records", { params });
};

export const getDailyAttendanceStats = () => {
    return API.get("/attendance/daily-stats");
};

