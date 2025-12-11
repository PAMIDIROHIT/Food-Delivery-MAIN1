import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import useDeliveryTracking from "../../hooks/useDeliveryTracking";
import "./DeliveryMap.css";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const mapStyles = {
    height: "400px",
    width: "100%",
    borderRadius: "12px",
};

const defaultCenter = {
    lat: 12.9716,
    lng: 77.5946,
};

// Custom marker icons
const markerIcons = {
    restaurant: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#FF6B35" stroke="white" stroke-width="3"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">🍕</text>
      </svg>
    `),
        scaledSize: { width: 40, height: 40 },
    },
    delivery: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#4CAF50" stroke="white" stroke-width="3"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🚗</text>
      </svg>
    `),
        scaledSize: { width: 40, height: 40 },
    },
    destination: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#2196F3" stroke="white" stroke-width="3"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🏠</text>
      </svg>
    `),
        scaledSize: { width: 40, height: 40 },
    },
};

const DeliveryMap = ({
    orderId,
    restaurantLocation = defaultCenter,
    deliveryAddress = { lat: 12.98, lng: 77.60 },
    initialDeliveryLocation = null
}) => {
    const { location: trackingLocation, isConnected, partner, progress } = useDeliveryTracking(orderId);
    const [map, setMap] = useState(null);

    // Use tracked location or initial/simulated location
    const deliveryLocation = trackingLocation || initialDeliveryLocation;

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Fit bounds to show all markers
    useEffect(() => {
        if (map && deliveryLocation) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(restaurantLocation);
            bounds.extend(deliveryLocation);
            bounds.extend(deliveryAddress);
            map.fitBounds(bounds, { padding: 50 });
        }
    }, [map, deliveryLocation, restaurantLocation, deliveryAddress]);

    // Path points for the route line
    const pathCoordinates = deliveryLocation
        ? [restaurantLocation, deliveryLocation, deliveryAddress]
        : [restaurantLocation, deliveryAddress];

    return (
        <div className="delivery-map-container">
            <div className="map-header">
                <h3>📍 Live Tracking</h3>
                <div className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
                    {isConnected ? "● Live" : "○ Connecting..."}
                </div>
            </div>

            {partner && (
                <div className="partner-info">
                    <div className="partner-avatar">
                        {partner.profileImage ? (
                            <img src={partner.profileImage} alt={partner.name} />
                        ) : (
                            <div className="avatar-placeholder">🚴</div>
                        )}
                    </div>
                    <div className="partner-details">
                        <h4>{partner.name}</h4>
                        <p>{partner.vehicleNumber}</p>
                        <div className="partner-rating">⭐ {partner.rating}</div>
                    </div>
                    <a href={`tel:${partner.phone}`} className="call-partner">
                        📞 Call
                    </a>
                </div>
            )}

            {progress > 0 && (
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    <span className="progress-text">{progress}% Complete</span>
                </div>
            )}

            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={mapStyles}
                    zoom={14}
                    center={deliveryLocation || restaurantLocation}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: true,
                        styles: [
                            {
                                featureType: "poi",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }],
                            },
                        ],
                    }}
                >
                    {/* Restaurant Marker */}
                    <Marker
                        position={restaurantLocation}
                        title="Restaurant"
                        label={{
                            text: "🍕",
                            fontSize: "24px",
                        }}
                    />

                    {/* Delivery Partner Marker (updates in real-time) */}
                    {deliveryLocation && (
                        <Marker
                            position={deliveryLocation}
                            title="Delivery Partner"
                            label={{
                                text: "🚗",
                                fontSize: "24px",
                            }}
                            animation={window.google?.maps?.Animation?.BOUNCE}
                        />
                    )}

                    {/* Delivery Address Marker */}
                    <Marker
                        position={deliveryAddress}
                        title="Your Location"
                        label={{
                            text: "🏠",
                            fontSize: "24px",
                        }}
                    />

                    {/* Route Line */}
                    <Polyline
                        path={pathCoordinates}
                        options={{
                            strokeColor: "#FF6B35",
                            strokeOpacity: 0.8,
                            strokeWeight: 4,
                            geodesic: true,
                        }}
                    />
                </GoogleMap>
            </LoadScript>

            <div className="map-legend">
                <div className="legend-item">
                    <span className="legend-icon">🍕</span>
                    <span>Restaurant</span>
                </div>
                <div className="legend-item">
                    <span className="legend-icon">🚗</span>
                    <span>Delivery Partner</span>
                </div>
                <div className="legend-item">
                    <span className="legend-icon">🏠</span>
                    <span>Your Location</span>
                </div>
            </div>
        </div>
    );
};

export default DeliveryMap;
