import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(localStorage.getItem('user_role') || null);
    const [token, setToken] = useState(localStorage.getItem('access_token') || null);
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        if (token) {
            // Logic to verify token or load user if needed
        }
    }, [token]);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        setRole(userData.role);
        localStorage.setItem('access_token', userToken);
        localStorage.setItem('user_role', userData.role);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
    };

    const saveLocation = (lat, lng) => {
        setCoords({ latitude: lat, longitude: lng });
    };

    return (
        <AuthContext.Provider value={{ user, role, setRole, token, login, logout, coords, saveLocation }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
