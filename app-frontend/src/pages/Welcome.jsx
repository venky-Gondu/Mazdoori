import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tractor, Users, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Welcome = () => {
    const { setRole } = useAuth();
    const navigate = useNavigate();

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        navigate('/location');
    };

    return (
        <div className="flex-1 flex flex-col p-6 text-center">
            <div className="mt-12 mb-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-block p-4 bg-indian-saffron/10 rounded-full mb-4"
                >
                    <Heart className="w-12 h-12 text-indian-saffron fill-current" />
                </motion.div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">Mazdoori</h1>
                <p className="text-xl text-gray-500 font-medium">Namaste! / नमस्ते!</p>
            </div>

            <div className="space-y-6 flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Who are you? / आप कौन हैं?</h2>

                <div className="grid grid-cols-2 gap-6">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRoleSelect('FARMER')}
                        className="giant-icon-btn p-6 border-2"
                    >
                        <Tractor className="w-16 h-16 text-indian-green mb-4" />
                        <span className="text-lg font-bold">Farmer</span>
                        <span className="text-sm text-gray-500">(किसान)</span>
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRoleSelect('WORKER')}
                        className="giant-icon-btn p-6 border-2"
                    >
                        <Users className="w-16 h-16 text-indian-navy mb-4" />
                        <span className="text-lg font-bold">Worker</span>
                        <span className="text-sm text-gray-500">(मजदूर)</span>
                    </motion.button>
                </div>
            </div>

            <div className="mt-auto py-8">
                <p className="text-gray-400 font-medium">Simple. Easy. Fast.</p>
            </div>
        </div>
    );
};

export default Welcome;
