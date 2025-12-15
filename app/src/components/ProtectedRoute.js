import { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { contextStore } from "../context/contextStore";

function ProtectedRoute({ children }) {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const { setIsLoginOpen } = useContext(contextStore);

    useEffect(() => {
        // If user is not authenticated, open the SignIn modal
        if (!isAuthenticated || !user) {
            setIsLoginOpen(true);
        }
    }, [isAuthenticated, user, setIsLoginOpen]);

    // If user is authenticated, render the protected component
    if (isAuthenticated && user) {
        return children;
    }

    // If not authenticated, don't render the protected content
    // The SignIn modal will be shown by the useEffect above
    return null;
}

export default ProtectedRoute;

