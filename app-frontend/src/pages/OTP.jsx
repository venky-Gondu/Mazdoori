import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OTP = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login, role, coords } = useAuth();

    const phone = location.state?.phone || '';

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length < 4) {
            setError('Enter valid OTP');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await api.verifyRegister({
                phone,
                otp,
                role,
                latitude: coords?.latitude,
                longitude: coords?.longitude
            });

            if (res.access_token) {
                login(res.user, res.access_token);
                navigate('/dashboard');
            } else {
                setError(res.detail || 'Invalid OTP');
            }
        } catch (e) {
            setError('Verification failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-8 bg-white">
            <div className="mt-10 mb-12">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Verify / सत्यापन</h2>
                <p className="text-gray-500">Enter the OTP sent to <span className="text-indian-navy font-bold">{phone}</span></p>
            </div>

            <form onSubmit={handleVerify} className="space-y-8 text-center">
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="w-6 h-6" />
                    </div>
                    <input
                        type="number"
                        placeholder="0000"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 text-center text-4xl font-black focus:border-indian-green focus:bg-white outline-none transition-all tracking-[1em] pl-6"
                    />
                </div>

                {error && <p className="text-red-500 font-bold">{error}</p>}

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-5 rounded-2xl text-xl font-bold shadow-premium flex items-center justify-center gap-2 text-white ${isLoading ? 'bg-gray-300' : 'bg-indian-green hover:bg-green-700'
                        }`}
                >
                    {isLoading ? 'Verifying...' : 'VERIFY & CONTINUE'}
                    <ShieldCheck className="w-6 h-6" />
                </motion.button>
            </form>

            <div className="mt-8 text-center">
                <button onClick={() => navigate('/login')} className="text-indian-navy font-bold hover:underline">
                    Change Phone Number
                </button>
            </div>
        </div>
    );
};

export default OTP;
