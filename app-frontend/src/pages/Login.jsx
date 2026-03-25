import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (phone.length < 10) {
            setError('Enter valid 10-digit number');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await api.checkPhone(phone);
            if (res.access_token && res.user) {
                // Existing user — login directly and go to dashboard
                login(res.user, res.access_token);
                navigate('/dashboard');
            } else if (res.message === "OTP sent for verification") {
                // New user — go to OTP verification page
                navigate('/otp', { state: { phone } });
            } else {
                setError(res.detail || 'Something went wrong.');
            }
        } catch (e) {
            setError('Network error. Check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-8 bg-white">
            <div className="mt-10 mb-12">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Login / लॉगिन</h2>
                <p className="text-gray-500">Enter your mobile number to continue.</p>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-8">
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Phone className="w-6 h-6" />
                    </div>
                    <input
                        type="tel"
                        placeholder="98765 43210"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 pl-14 pr-4 text-2xl font-bold focus:border-indian-saffron focus:bg-white outline-none transition-all tracking-widest"
                    />
                </div>

                {error && <p className="text-red-500 font-bold text-center">{error}</p>}

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-5 rounded-2xl text-xl font-bold shadow-premium flex items-center justify-center gap-2 text-white ${isLoading ? 'bg-gray-300' : 'bg-indian-navy hover:bg-black'
                        }`}
                >
                    {isLoading ? 'Sending...' : 'SEND OTP'}
                    <ChevronRight className="w-6 h-6" />
                </motion.button>
            </form>

            <div className="mt-auto text-center py-6">
                <p className="text-sm text-gray-400">By continuing, you agree to our terms.</p>
            </div>
        </div>
    );
};

export default Login;
