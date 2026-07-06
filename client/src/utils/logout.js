import axios from "axios";

export function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    // Also clear the in-memory Axios header so no stale token can
    // be sent in any request made during the same browser session.
    delete axios.defaults.headers.common["Authorization"];
    window.location.href = "/";
}