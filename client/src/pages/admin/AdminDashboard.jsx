import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// Import custom dashboard components
import DashboardHeader from "../../components/admin/dashboard/DashboardHeader";
import DashboardStats from "../../components/admin/dashboard/DashboardStats";
import RoomStatusGrid from "../../components/admin/dashboard/RoomStatusGrid";
import DashboardQuickActions from "../../components/admin/dashboard/DashboardQuickActions";

export default function AdminDashboard() {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        
        try {
            const [roomsRes, typesRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/rooms`),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/room-types`)
            ]);

            if (roomsRes.data && roomsRes.data.success) {
                setRooms(roomsRes.data.data || []);
            }
            if (typesRes.data && typesRes.data.success) {
                setRoomTypes(typesRes.data.data || []);
            }
        } catch (error) {
            console.error("Dashboard data fetch error:", error);
            toast.error("Failed to refresh dashboard details");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Enhance room data with visual dashboard statuses mapping to the exact reference image colors
    const enrichedRooms = useMemo(() => {
        return rooms.map((room) => {
            let dashboardStatus = "not_booked"; // default white/gray
            
            // Map SQL database statuses to the image legend states
            const dbStatus = String(room.status || "available").toLowerCase();
            
            if (dbStatus === "occupied") {
                dashboardStatus = "booked"; // solid green
            } else if (dbStatus === "maintenance") {
                dashboardStatus = "canceled"; // solid red
            } else {
                // Check if the room has an active booking that is in "pending" status
                const hasPendingBooking = room.bookedRooms?.some(
                    (br) => br.booking?.status === "pending" && br.status !== "cancelled"
                );
                
                if (hasPendingBooking) {
                    dashboardStatus = "pending"; // orange/amber pending state
                } else {
                    dashboardStatus = "not_booked"; // available (gray/white)
                }
            }

            return {
                ...room,
                dashboardStatus
            };
        });
    }, [rooms]);

    // Quick Stats Calculations
    const stats = useMemo(() => {
        const total = enrichedRooms.length;
        const booked = enrichedRooms.filter(r => r.dashboardStatus === "booked").length;
        const pending = enrichedRooms.filter(r => r.dashboardStatus === "pending").length;
        const canceled = enrichedRooms.filter(r => r.dashboardStatus === "canceled").length;
        const available = enrichedRooms.filter(r => r.dashboardStatus === "not_booked").length;
        const occupancyRate = total > 0 ? Math.round((booked / total) * 100) : 0;

        return { total, booked, pending, canceled, available, occupancyRate };
    }, [enrichedRooms]);

    return (
        <div className="w-full min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
            <DashboardHeader 
                refreshing={refreshing} 
                onRefresh={fetchDashboardData} 
            />
            
            <DashboardStats 
                loading={loading} 
                stats={stats} 
            />
            
            <RoomStatusGrid 
                loading={loading} 
                rooms={rooms} 
                roomTypes={roomTypes} 
            />
            
            <DashboardQuickActions 
                stats={stats} 
                loading={loading} 
            />
        </div>
    );
}
