import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Plus, Tractor, Leaf, Droplets, Hammer, Users, List, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const FarmerDashboard = () => {
    const { user, logout } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFarmerJobs = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await api.getFarmerJobs(user.id);
            setJobs(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarmerJobs();
    }, [user]);

    const categories = [
        { id: 'harvest', name: 'Harvest', icon: Tractor, color: 'bg-indian-saffron', text: 'text-indian-saffron' },
        { id: 'sow', name: 'Sowing', icon: Leaf, color: 'bg-indian-green', text: 'text-indian-green' },
        { id: 'irrigate', name: 'Watering', icon: Droplets, color: 'bg-blue-500', text: 'text-blue-500' },
        { id: 'maint', name: 'Other', icon: Hammer, color: 'bg-gray-600', text: 'text-gray-600' }
    ];

    return (
        <div className="flex-1 flex flex-col bg-gray-50 pb-20">
            <header className="bg-indian-green p-6 pt-10 text-white rounded-b-[3rem] shadow-premium">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-black">Farm Home / खेत</h1>
                        <p className="opacity-80 font-medium">Farmer Dashboard</p>
                    </div>
                    <button onClick={logout} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="p-6 space-y-8 -mt-6">
                {/* Quick Stats / Action */}
                <div className="bg-white p-6 rounded-3xl shadow-premium border border-gray-50 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Active Postings</p>
                        <p className="text-4xl font-black text-indian-navy">{jobs.length}</p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-16 h-16 bg-indian-saffron rounded-2xl shadow-lg flex items-center justify-center text-white"
                    >
                        <Plus className="w-8 h-8" />
                    </motion.button>
                </div>

                {/* Categories Grid */}
                <div>
                    <h2 className="text-xl font-black text-gray-800 mb-4 px-2">Create New Job / नया काम</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {categories.map((cat) => (
                            <motion.div
                                key={cat.id}
                                whileTap={{ scale: 0.98 }}
                                className="bg-white p-6 rounded-3xl shadow-premium border border-gray-50 flex flex-col items-center text-center group cursor-pointer"
                            >
                                <div className={`${cat.color} p-4 rounded-2xl mb-3 text-white shadow-lg`}>
                                    <cat.icon className="w-8 h-8" />
                                </div>
                                <span className="font-black text-gray-700">{cat.name}</span>
                                <span className="text-[10px] uppercase tracking-tighter text-gray-400 font-bold mt-1 uppercase mt-1">Select / चुनें</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recent Jobs List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <List className="w-6 h-6 text-indian-green" />
                            My Postings / मेरे काम
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {jobs.length === 0 && !loading && (
                            <div className="text-center py-10 text-gray-400 font-medium bg-white rounded-3xl border-2 border-dashed">
                                No jobs posted yet.
                            </div>
                        )}

                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white p-6 rounded-3xl shadow-premium border border-gray-50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 leading-tight">
                                        {job.work_types?.join(', ')}
                                    </h3>
                                    <p className="text-gray-400 text-sm font-bold mt-1">
                                        {job.required_workers} workers needed
                                    </p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    className="bg-gray-100 p-4 rounded-2xl text-indian-navy font-bold flex flex-col items-center gap-1"
                                >
                                    <Users className="w-5 h-5" />
                                    <span className="text-[10px]">Applicants</span>
                                </motion.button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Bottom Floating Nav Simulation */}
            <nav className="fixed bottom-6 left-6 right-6 h-20 glass-card flex items-center justify-around px-4">
                <button className="flex flex-col items-center text-indian-green"><List className="w-6 h-6" /><span className="text-[10px] font-bold">Jobs</span></button>
                <button className="flex flex-col items-center text-gray-300"><Plus className="w-6 h-6" /><span className="text-[10px] font-bold">Post</span></button>
                <button className="flex flex-col items-center text-gray-300"><Users className="w-6 h-6" /><span className="text-[10px] font-bold">Profile</span></button>
            </nav>
        </div>
    );
};

export default FarmerDashboard;
