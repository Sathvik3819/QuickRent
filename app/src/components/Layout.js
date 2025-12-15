import { Outlet } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useContext } from "react";
import { contextStore } from "../context/contextStore";
import SignIn from "../Pages/SignIn";
import SignUp from "../Pages/SignUp";
import { useSelector } from "react-redux";

export const Layout = () => {
    const {user} = useSelector((state)=>state.auth);
    console.log(user);
    
    const { isLoginOpen, setIsLoginOpen, isRegisterOpen, setIsRegisterOpen } = useContext(contextStore);
    return (
        <div>
            <Navbar />
            {
                isLoginOpen && <SignIn />
            }
            {
                isRegisterOpen && <SignUp />
            }
            <Outlet />
            <Footer />
        </div>
    );
}