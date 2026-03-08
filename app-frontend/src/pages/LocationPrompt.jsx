import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const LocationPrompt = () => {
    const { saveLocation } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const requestLocation = () => {
        setLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    saveLocation(position.coords.latitude, position.coords.longitude);
                    setLoading(false);
                    navigate('/login');
                },
                (error) => {
                    console.error("Error getting location", error);
                    setLoading(false);
                    // Fallback: Proceed anyway
                    navigate('/login');
                },
                { enableHighAccuracy: true }
            );
        } else {
            setLoading(false);
            navigate('/login');
        }
    };

    return (
        <div className="flex-1 flex flex-col p-8 text-center bg-white justify-center">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-10"
            >
                <div className="mx-auto w-24 h-24 bg-indian-navy/5 rounded-full flex items-center justify-center mb-6">
                    <MapPin className="w-12 h-12 text-indian-navy animate-bounce" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Where are you?</h2>
                <p className="text-gray-500 text-lg leading-relaxed">
                    We use your location to find jobs within <span className="text-indian-green font-bold text-xl">5km</span> of you.
                    <br />
                    <span className="text-sm font-medium">(हम आपका स्थान ढूंढ रहे हैं)</span>
                </p>
            </motion.div>

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={requestLocation}
                disabled={loading}
                className={`w-full py-5 rounded-2xl text-xl font-bold transition-all shadow-premium flex items-center justify-center gap-3 ${loading ? 'bg-gray-300' : 'bg-indian-saffron text-white hover:bg-orange-600'
                    }`}
            >
                <Navigation className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Finding you...' : 'ENABLE LOCATION'}
            </motion.button>

            <p className="mt-8 text-gray-400 text-sm italic italic">
                * You can also type your location later.
            </p>
        </div>
    );
};

export default LocationPrompt;
