import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Restore user from localStorage on mount
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user_data');
        return saved ? JSON.parse(saved) : null;
    });
    const [role, setRole] = useState(localStorage.getItem('user_role') || null);
    const [token, setToken] = useState(localStorage.getItem('access_token') || null);
    const [coords, setCoords] = useState(null);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        setRole(userData.role);
        localStorage.setItem('access_token', userToken);
        localStorage.setItem('user_role', userData.role);
        localStorage.setItem('user_data', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
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
