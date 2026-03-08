import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Briefcase, MapPin, Calendar, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkerDashboard = () => {
    const { user, logout } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyingId, setApplyingId] = useState(null);

    const fetchJobs = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const data = await api.getJobs(user.id);
            setJobs(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [user]);

    const handleApply = async (jobId) => {
        setApplyingId(jobId);
        try {
            await api.applyForJob(jobId, user.id);
            fetchJobs();
        } catch (e) {
            console.error(e);
        } finally {
            setApplyingId(null);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50">
            <header className="bg-indian-navy p-6 pt-10 text-white rounded-b-[3rem] shadow-premium">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-black">Namaste! / नमस्ते!</h1>
                        <p className="opacity-80 font-medium">{user?.phone}</p>
                    </div>
                    <button onClick={logout} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                    <p className="text-sm font-bold uppercase tracking-widest opacity-60">My Status</p>
                    <p className="text-xl font-black flex items-center gap-2">
                        Looking for Work <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </p>
                </div>
            </header>

            <main className="p-6 flex-1 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indian-saffron" />
                        Jobs Near You (5km)
                    </h2>
                    <button onClick={fetchJobs} className="text-indian-navy p-2 hover:bg-indian-navy/5 rounded-full">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <section className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {jobs.length === 0 && !loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200"
                            >
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-400 font-bold">No jobs nearby / कोई काम नहीं मिला</p>
                                <p className="text-sm text-gray-300">Try refreshing later</p>
                            </motion.div>
                        )}

                        {jobs.map((job) => (
                            <motion.div
                                key={job.id}
                                layout
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-white p-6 rounded-3xl shadow-premium border border-gray-50 overflow-hidden relative"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 leading-tight">
                                            {job.work_types?.join(', ')}
                                        </h3>
                                        <div className="flex items-center gap-2 text-gray-500 mt-1 font-medium italic italic">
                                            <MapPin className="w-4 h-4" />
                                            {job.location}
                                        </div>
                                    </div>
                                    <div className="bg-indian-saffron/10 px-3 py-1 rounded-full text-indian-saffron font-black text-xs">
                                        5KM RADIUS
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-gray-600 font-bold bg-gray-50 px-3 py-2 rounded-xl">
                                        <Calendar className="w-4 h-4" />
                                        {job.duration_days} Days
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        Starting: {job.start_date}
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleApply(job.id)}
                                    disabled={applyingId === job.id}
                                    className={`w-full py-4 rounded-2xl font-black text-lg shadow-premium flex items-center justify-center gap-2 ${applyingId === job.id
                                            ? 'bg-gray-100 text-gray-400'
                                            : 'bg-indian-green text-white hover:bg-green-700'
                                        }`}
                                >
                                    {applyingId === job.id ? 'Applying...' : 'APPLY / काम लें'}
                                    {applyingId !== job.id && <CheckCircle2 className="w-5 h-5" />}
                                </motion.button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </section>
            </main>
        </div>
    );
};

export default WorkerDashboard;
