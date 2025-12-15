import { createContext, useState } from "react";

const contextStore = createContext();

const ContextStoreProvider = ({ children }) => {

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    return (
        <contextStore.Provider value={{ isLoginOpen, setIsLoginOpen, isRegisterOpen, setIsRegisterOpen }}>
            {children}
        </contextStore.Provider>
    );
}

export { ContextStoreProvider, contextStore };
