// InputBlockContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface InputBlockContextProps {
    isInputBlocked: boolean;
    toggleInputBlocking: () => void;
}

interface InputBlockProviderProps {
    children: ReactNode;
}

const InputBlockContext = createContext<InputBlockContextProps>({
    isInputBlocked: false,
    toggleInputBlocking: () => {},
});

export const InputBlockProvider: React.FC<InputBlockProviderProps> = ({ children }) => {
    const [isInputBlocked, setIsInputBlocked] = useState(false);

    const toggleInputBlocking = () => {
        setIsInputBlocked((prev) => !prev);
        console.log("Blocking or unblocking input");
    };

    return (
        <InputBlockContext.Provider value={{ isInputBlocked, toggleInputBlocking }}>
            {children}
        </InputBlockContext.Provider>
    );
};

export const useInputBlock = () => useContext(InputBlockContext);
