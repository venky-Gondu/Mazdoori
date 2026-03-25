import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Briefcase, MapPin, Calendar, RefreshCw, CheckCircle2, Clock, XCircle, IndianRupee, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
    pending: { label: 'Pending / बाकी', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    approved: { label: 'Accepted / स्वीकृत', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
    rejected: { label: 'Rejected / अस्वीकृत', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

const WorkerDashboard = () => {
    const { user, logout } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [myApps, setMyApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyingId, setApplyingId] = useState(null);
    const [activeTab, setActiveTab] = useState('browse');

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

    const fetchMyApplications = async () => {
        if (!user?.id) return;
        try {
            const data = await api.getMyApplications(user.id);
            setMyApps(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchJobs();
        fetchMyApplications();
    }, [user]);

    const handleApply = async (jobId) => {
        if (applyingId) return;
        setApplyingId(jobId);
        try {
            const res = await api.applyForJob(jobId, user.id);
            if (!res.alreadyApplied) {
                fetchJobs();
                fetchMyApplications();
            }
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
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-2 bg-white/10 p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                            activeTab === 'browse' ? 'bg-white text-indian-navy shadow-lg' : 'text-white/70'
                        }`}
                    >
                        Browse Jobs
                    </button>
                    <button
                        onClick={() => { setActiveTab('applied'); fetchMyApplications(); }}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                            activeTab === 'applied' ? 'bg-white text-indian-navy shadow-lg' : 'text-white/70'
                        }`}
                    >
                        My Applications ({myApps.length})
                    </button>
                </div>
            </header>

            <main className="p-6 flex-1 space-y-6">
                {activeTab === 'browse' && (
                    <>
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
                                                <div className="flex items-center gap-2 text-gray-500 mt-1 font-medium">
                                                    <MapPin className="w-4 h-4" />
                                                    {job.location}
                                                </div>
                                            </div>
                                            <div className="bg-indian-saffron/10 px-3 py-1 rounded-full text-indian-saffron font-black text-xs">
                                                5KM
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-gray-600 font-bold bg-gray-50 px-3 py-2 rounded-xl">
                                                <Calendar className="w-4 h-4" />
                                                {job.duration_days} Days
                                            </div>
                                            <div className="text-gray-400 text-sm">
                                                Starting: {job.start_date}
                                            </div>
                                        </div>

                                        {job.wage_per_day && (
                                            <div className="flex items-center gap-1 text-indian-green font-black mb-4">
                                                <IndianRupee className="w-4 h-4" />
                                                {job.wage_per_day}/day
                                            </div>
                                        )}

                                        {job.already_applied ? (
                                            <div className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 bg-gray-100 text-gray-400">
                                                <CheckCircle2 className="w-5 h-5" />
                                                Applied / आवेदन किया
                                            </div>
                                        ) : (
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleApply(job.id)}
                                                disabled={applyingId === job.id}
                                                className={`w-full py-4 rounded-2xl font-black text-lg shadow-premium flex items-center justify-center gap-2 ${
                                                    applyingId === job.id
                                                        ? 'bg-gray-100 text-gray-400'
                                                        : 'bg-indian-green text-white hover:bg-green-700'
                                                }`}
                                            >
                                                {applyingId === job.id ? 'Applying...' : 'APPLY / काम लें'}
                                                {applyingId !== job.id && <CheckCircle2 className="w-5 h-5" />}
                                            </motion.button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </section>
                    </>
                )}

                {activeTab === 'applied' && (
                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-indian-navy" />
                            My Applications / मेरे आवेदन
                        </h2>

                        {myApps.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold">No applications yet</p>
                            </div>
                        )}

                        {myApps.map((app) => {
                            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                            const StatusIcon = cfg.icon;
                            return (
                                <motion.div
                                    key={app.application_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-5 rounded-2xl shadow-premium border border-gray-50"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-black text-gray-900">
                                            {app.work_types?.join(', ')}
                                        </h3>
                                        <div className={`${cfg.bg} ${cfg.text} px-3 py-1 rounded-full text-xs font-black flex items-center gap-1`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {cfg.label}
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {app.location}
                                    </p>
                                    {app.wage_per_day && (
                                        <p className="text-indian-green text-sm font-black mt-1 flex items-center gap-1">
                                            <IndianRupee className="w-3 h-3" /> {app.wage_per_day}/day
                                        </p>
                                    )}
                                </motion.div>
                            );
                        })}
                    </section>
                )}
            </main>
        </div>
    );
};

export default WorkerDashboard;
