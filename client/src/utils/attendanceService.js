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

export const getAttendanceById = (attendanceId) => {
    return API.get(`/attendance/${attendanceId}`);
};

export const updateAttendance = (attendanceId, data) => {
    return API.put(`/attendance/${attendanceId}`, data);
};

export const markAbsentees = () => {
    return API.post("/attendance/mark-absentees");
};

export const getAttendanceSettings = () => {
    return API.get("/attendance/settings");
};

export const updateAttendanceSettings = (settings) => {
    return API.put("/attendance/settings", settings);
};


