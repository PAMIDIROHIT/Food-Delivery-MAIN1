import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import "./OAuthCallback.css";

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const { setToken } = useContext(StoreContext);
    const navigate = useNavigate();
    const [status, setStatus] = useState("processing");

    useEffect(() => {
        const token = searchParams.get("token");
        const role = searchParams.get("role");
        const error = searchParams.get("error");

        if (error) {
            setStatus("error");
            toast.error("Authentication failed. Please try again.");
            setTimeout(() => navigate("/"), 2000);
            return;
        }

        if (token) {
            // Save token to localStorage and context
            localStorage.setItem("token", token);
            if (role) {
                localStorage.setItem("role", role);
            }
            setToken(token);

            setStatus("success");
            toast.success("Login successful!");

            // Redirect to home page
            setTimeout(() => navigate("/"), 1000);
        } else {
            setStatus("error");
            toast.error("No authentication token received.");
            setTimeout(() => navigate("/"), 2000);
        }
    }, [searchParams, setToken, navigate]);

    return (
        <div className="oauth-callback">
            <div className="oauth-callback-container">
                {status === "processing" && (
                    <>
                        <div className="oauth-spinner"></div>
                        <h2>Signing you in...</h2>
                        <p>Please wait while we complete your authentication.</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="oauth-success-icon">✓</div>
                        <h2>Welcome!</h2>
                        <p>Redirecting you to the homepage...</p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="oauth-error-icon">✗</div>
                        <h2>Authentication Failed</h2>
                        <p>Redirecting you back...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuthCallback;
