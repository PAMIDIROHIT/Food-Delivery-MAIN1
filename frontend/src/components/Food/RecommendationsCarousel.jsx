import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import "./RecommendationsCarousel.css";

const RecommendationsCarousel = ({ title, type = "trending", category = null }) => {
    const { url, token } = useContext(StoreContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mealTime, setMealTime] = useState("");
    const carouselRef = useRef(null);

    useEffect(() => {
        fetchRecommendations();
    }, [type, category, token]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            let endpoint = `${url}/api/recommendations`;
            let config = {};

            switch (type) {
                case "personalized":
                    endpoint += "/personalized";
                    config = { headers: { token } };
                    break;
                case "trending":
                    endpoint += "/trending";
                    break;
                case "time-based":
                    endpoint += "/time-based";
                    break;
                case "category":
                    endpoint += `/category/${category}`;
                    break;
                default:
                    endpoint += "/trending";
            }

            const response = await axios.get(endpoint, config);

            if (response.data.success) {
                setItems(response.data.data);
                if (response.data.mealTime) {
                    setMealTime(response.data.mealTime);
                }
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            // Silently fail - recommendations are optional
        } finally {
            setLoading(false);
        }
    };

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
    };

    const getTitle = () => {
        if (title) return title;

        switch (type) {
            case "personalized":
                return "🎯 Recommended for You";
            case "trending":
                return "🔥 Trending Now";
            case "time-based":
                return getMealTimeTitle();
            case "category":
                return `More ${category} dishes`;
            default:
                return "Recommendations";
        }
    };

    const getMealTimeTitle = () => {
        switch (mealTime) {
            case "breakfast":
                return "🌅 Perfect for Breakfast";
            case "lunch":
                return "☀️ Lunch Specials";
            case "dinner":
                return "🌙 Dinner Favorites";
            case "snacks":
                return "🍪 Snack Time";
            default:
                return "🍽️ For You Right Now";
        }
    };

    if (loading) {
        return (
            <div className="recommendations-carousel">
                <h2 className="carousel-title">{getTitle()}</h2>
                <div className="carousel-loading">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="loading-skeleton"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return null; // Don't show empty carousels
    }

    return (
        <div className="recommendations-carousel">
            <div className="carousel-header">
                <h2 className="carousel-title">{getTitle()}</h2>
                <div className="carousel-controls">
                    <button className="scroll-btn" onClick={scrollLeft}>
                        ←
                    </button>
                    <button className="scroll-btn" onClick={scrollRight}>
                        →
                    </button>
                </div>
            </div>

            <div className="carousel-container" ref={carouselRef}>
                <div className="carousel-track">
                    {items.map((item) => (
                        <div key={item._id} className="carousel-item">
                            <FoodItem
                                id={item._id}
                                name={item.name}
                                description={item.description}
                                price={item.price}
                                image={item.image}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecommendationsCarousel;
