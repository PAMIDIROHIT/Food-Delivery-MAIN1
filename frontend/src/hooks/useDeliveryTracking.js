import { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const useDeliveryTracking = (orderId) => {
    const [socket, setSocket] = useState(null);
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState(null);
    const [partner, setPartner] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!orderId) return;

        // Connect to delivery namespace
        const newSocket = io(`${BACKEND_URL}/delivery`, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to delivery tracking");
            setIsConnected(true);
            setError(null);

            // Join order-specific room
            newSocket.emit("join-order", orderId);
        });

        newSocket.on("disconnect", () => {
            console.log("Disconnected from delivery tracking");
            setIsConnected(false);
        });

        newSocket.on("connect_error", (err) => {
            console.error("Connection error:", err);
            setError("Failed to connect to tracking server");
            setIsConnected(false);
        });

        // Listen for location updates
        newSocket.on("location-update", (data) => {
            console.log("Location update received:", data);
            setLocation(data.location);
            if (data.progress) {
                setProgress(data.progress);
            }
        });

        // Listen for status updates
        newSocket.on("status-update", (data) => {
            console.log("Status update received:", data);
            setStatus(data.status);
        });

        // Listen for partner assignment
        newSocket.on("partner-assigned", (data) => {
            console.log("Partner assigned:", data);
            setPartner(data.partner);
        });

        // Listen for delivery completion
        newSocket.on("delivery-complete", (data) => {
            console.log("Delivery complete:", data);
            setStatus("Delivered");
            setProgress(100);
        });

        // Listen for errors
        newSocket.on("error", (data) => {
            console.error("Socket error:", data);
            setError(data.message);
        });

        // Cleanup on unmount
        return () => {
            if (newSocket) {
                newSocket.emit("leave-order", orderId);
                newSocket.disconnect();
            }
        };
    }, [orderId]);

    // Manual reconnect function
    const reconnect = useCallback(() => {
        if (socket) {
            socket.connect();
        }
    }, [socket]);

    return {
        location,
        status,
        partner,
        isConnected,
        error,
        progress,
        reconnect,
    };
};

export default useDeliveryTracking;
