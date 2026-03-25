import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Plus, Tractor, Leaf, Droplets, Hammer, Users, List, LogOut, X, ChevronRight, IndianRupee, CheckCircle2, XCircle, Phone, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    { id: 'Harvest', name: 'Harvest / कटाई', icon: Tractor, color: 'bg-indian-saffron', text: 'text-indian-saffron' },
    { id: 'Sowing', name: 'Sowing / बुवाई', icon: Leaf, color: 'bg-indian-green', text: 'text-indian-green' },
    { id: 'Watering', name: 'Watering / सिंचाई', icon: Droplets, color: 'bg-blue-500', text: 'text-blue-500' },
    { id: 'Other', name: 'Other / अन्य', icon: Hammer, color: 'bg-gray-600', text: 'text-gray-600' }
];

const WORKER_OPTIONS = [1, 2, 3, 5, 8, 10, 15, 20];
const DURATION_OPTIONS = [
    { value: 1, label: '1 Day' },
    { value: 2, label: '2 Days' },
    { value: 3, label: '3 Days' },
    { value: 5, label: '5 Days' },
    { value: 7, label: '1 Week' },
    { value: 14, label: '2 Weeks' },
    { value: 30, label: '1 Month' },
];
const START_DATE_OPTIONS = () => {
    const today = new Date();
    const options = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${dayNames[d.getDay()]} ${dd}/${mm}`;
        options.push({ value: `${yyyy}-${mm}-${dd}`, label });
    }
    return options;
};
const LOCATION_OPTIONS = [
    'My Farm / मेरा खेत',
    'Nearby Field / पास का खेत',
    'Village Center / गाँव का केंद्र',
    'Other Location / अन्य'
];

const FarmerDashboard = () => {
    const { user, logout } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [formStep, setFormStep] = useState(0);
    const [selectedWorkType, setSelectedWorkType] = useState('');
    const [selectedWorkers, setSelectedWorkers] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [selectedStartDate, setSelectedStartDate] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [wagePerDay, setWagePerDay] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const [showApplicants, setShowApplicants] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    const [applicants, setApplicants] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [updatingAppId, setUpdatingAppId] = useState(null);

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

    const resetForm = () => {
        setShowForm(false);
        setFormStep(0);
        setSelectedWorkType('');
        setSelectedWorkers(null);
        setSelectedDuration(null);
        setSelectedStartDate('');
        setSelectedLocation('');
        setWagePerDay('');
        setFormError('');
    };

    const openFormWithCategory = (categoryId) => {
        resetForm();
        setSelectedWorkType(categoryId);
        setFormStep(1);
        setShowForm(true);
    };

    const openFormFresh = () => {
        resetForm();
        setFormStep(0);
        setShowForm(true);
    };

    const handleSubmitJob = async () => {
        if (submitting) return;
        if (!selectedWorkers || !selectedDuration || !selectedStartDate || !selectedLocation) {
            setFormError('Please select all options.');
            return;
        }
        if (!wagePerDay || isNaN(Number(wagePerDay)) || Number(wagePerDay) <= 0) {
            setFormError('Enter a valid wage per day.');
            return;
        }

        setSubmitting(true);
        setFormError('');

        try {
            const jobData = {
                work_types: [selectedWorkType],
                location: selectedLocation,
                required_workers: selectedWorkers,
                start_date: selectedStartDate,
                duration_days: selectedDuration,
                wage_per_day: Number(wagePerDay),
                latitude: user?.latitude || null,
                longitude: user?.longitude || null
            };

            const res = await api.createJob(jobData);
            if (res.id) {
                resetForm();
                fetchFarmerJobs();
            } else {
                setFormError(res.detail || 'Failed to create job.');
            }
        } catch (e) {
            setFormError('Network error. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const openApplicants = async (jobId, jobTitle) => {
        setSelectedJobId(jobId);
        setSelectedJobTitle(jobTitle);
        setShowApplicants(true);
        setLoadingApplicants(true);
        try {
            const data = await api.getJobApplicants(jobId);
            setApplicants(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingApplicants(false);
        }
    };

    const handleUpdateStatus = async (appId, status) => {
        if (updatingAppId) return;
        setUpdatingAppId(appId);
        try {
            await api.updateApplicationStatus(appId, status);
            const data = await api.getJobApplicants(selectedJobId);
            setApplicants(Array.isArray(data) ? data : []);
            fetchFarmerJobs();
        } catch (e) {
            console.error(e);
        } finally {
            setUpdatingAppId(null);
        }
    };

    const dateOptions = START_DATE_OPTIONS();
    const isFormComplete = selectedWorkType && selectedWorkers && selectedDuration && selectedStartDate && selectedLocation && wagePerDay;

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
                <div className="bg-white p-6 rounded-3xl shadow-premium border border-gray-50 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Active Postings</p>
                        <p className="text-4xl font-black text-indian-navy">{jobs.length}</p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={openFormFresh}
                        className="w-16 h-16 bg-indian-saffron rounded-2xl shadow-lg flex items-center justify-center text-white"
                    >
                        <Plus className="w-8 h-8" />
                    </motion.button>
                </div>

                <div>
                    <h2 className="text-xl font-black text-gray-800 mb-4 px-2">Create New Job / नया काम</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {CATEGORIES.map((cat) => (
                            <motion.div
                                key={cat.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => openFormWithCategory(cat.id)}
                                className="bg-white p-6 rounded-3xl shadow-premium border border-gray-50 flex flex-col items-center text-center group cursor-pointer hover:shadow-xl transition-shadow"
                            >
                                <div className={`${cat.color} p-4 rounded-2xl mb-3 text-white shadow-lg`}>
                                    <cat.icon className="w-8 h-8" />
                                </div>
                                <span className="font-black text-gray-700">{cat.name}</span>
                                <span className="text-[10px] uppercase tracking-tighter text-gray-400 font-bold mt-1">Select / चुनें</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

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
                            <div key={job.id} className="bg-white p-6 rounded-3xl shadow-premium border border-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-black text-gray-900 leading-tight">
                                            {job.work_types?.join(', ')}
                                        </h3>
                                        <p className="text-gray-400 text-sm font-bold mt-1">
                                            {job.required_workers} workers · {job.duration_days} days
                                        </p>
                                        {job.wage_per_day && (
                                            <p className="text-indian-green text-sm font-black mt-1 flex items-center gap-1">
                                                <IndianRupee className="w-3 h-3" /> {job.wage_per_day}/day
                                            </p>
                                        )}
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => openApplicants(job.id, job.work_types?.join(', '))}
                                        className="bg-indian-navy/10 p-4 rounded-2xl text-indian-navy font-bold flex flex-col items-center gap-1 relative"
                                    >
                                        <Users className="w-5 h-5" />
                                        <span className="text-[10px]">Applicants</span>
                                        {(job.applicant_count > 0) && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                                                {job.applicant_count}
                                            </span>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <nav className="fixed bottom-6 left-6 right-6 h-20 glass-card flex items-center justify-around px-4">
                <button className="flex flex-col items-center text-indian-green"><List className="w-6 h-6" /><span className="text-[10px] font-bold">Jobs</span></button>
                <button onClick={openFormFresh} className="flex flex-col items-center text-gray-300 hover:text-indian-saffron transition-colors"><Plus className="w-6 h-6" /><span className="text-[10px] font-bold">Post</span></button>
                <button className="flex flex-col items-center text-gray-300"><Users className="w-6 h-6" /><span className="text-[10px] font-bold">Profile</span></button>
            </nav>

            <AnimatePresence>
                {showApplicants && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowApplicants(false); }}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="bg-white w-full max-w-md rounded-t-[2rem] max-h-[80vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center rounded-t-[2rem]">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setShowApplicants(false)} className="p-1">
                                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                                    </button>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900">Applicants / आवेदक</h2>
                                        <p className="text-xs text-gray-400">{selectedJobTitle}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowApplicants(false)} className="p-2 bg-gray-100 rounded-full">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {loadingApplicants && (
                                    <div className="text-center py-10 text-gray-400">Loading...</div>
                                )}

                                {!loadingApplicants && applicants.length === 0 && (
                                    <div className="text-center py-10 text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed">
                                        No applicants yet / कोई आवेदक नहीं
                                    </div>
                                )}

                                {applicants.map((app) => (
                                    <div key={app.application_id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indian-navy/10 rounded-full flex items-center justify-center">
                                                    <Phone className="w-4 h-4 text-indian-navy" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900">{app.worker_phone}</p>
                                                    <p className="text-xs text-gray-400">Worker</p>
                                                </div>
                                            </div>
                                            {app.status !== 'pending' && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                                                    app.status === 'approved'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {app.status === 'approved' ? 'Accepted' : 'Rejected'}
                                                </span>
                                            )}
                                        </div>

                                        {app.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleUpdateStatus(app.application_id, 'approved')}
                                                    disabled={updatingAppId === app.application_id}
                                                    className="flex-1 py-3 rounded-xl font-black text-sm bg-indian-green text-white flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Accept / स्वीकार
                                                </motion.button>
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleUpdateStatus(app.application_id, 'rejected')}
                                                    disabled={updatingAppId === app.application_id}
                                                    className="flex-1 py-3 rounded-xl font-black text-sm bg-red-500 text-white flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject / अस्वीकार
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
                        onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="bg-white w-full max-w-md rounded-t-[2rem] max-h-[85vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center rounded-t-[2rem]">
                                <h2 className="text-xl font-black text-gray-900">
                                    {formStep === 0 ? 'Select Work Type / काम चुनें' : 'Job Details / काम विवरण'}
                                </h2>
                                <button onClick={resetForm} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {formStep === 0 && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {CATEGORIES.map((cat) => (
                                            <motion.button
                                                key={cat.id}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => { setSelectedWorkType(cat.id); setFormStep(1); }}
                                                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                                                    selectedWorkType === cat.id
                                                        ? 'border-indian-green bg-indian-green/5 shadow-lg'
                                                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                                                }`}
                                            >
                                                <div className={`${cat.color} p-3 rounded-xl text-white`}>
                                                    <cat.icon className="w-7 h-7" />
                                                </div>
                                                <span className="font-black text-gray-700 text-sm">{cat.name}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {formStep === 1 && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-400 font-bold">Work Type:</span>
                                            <span className="bg-indian-green/10 text-indian-green font-black px-3 py-1 rounded-full text-sm">
                                                {selectedWorkType}
                                            </span>
                                            <button onClick={() => setFormStep(0)} className="text-xs text-gray-400 underline hover:text-gray-600 ml-auto">
                                                Change
                                            </button>
                                        </div>

                                        <div>
                                            <label className="text-sm font-black text-gray-600 uppercase tracking-widest mb-3 block">Workers Needed / मजदूर</label>
                                            <div className="flex flex-wrap gap-2">
                                                {WORKER_OPTIONS.map((num) => (
                                                    <motion.button key={num} whileTap={{ scale: 0.95 }} onClick={() => setSelectedWorkers(num)}
                                                        className={`px-5 py-3 rounded-xl font-black text-lg transition-all ${selectedWorkers === num ? 'bg-indian-navy text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >{num}</motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-black text-gray-600 uppercase tracking-widest mb-3 block">Start Date / शुरुआत</label>
                                            <div className="flex flex-wrap gap-2">
                                                {dateOptions.map((opt) => (
                                                    <motion.button key={opt.value} whileTap={{ scale: 0.95 }} onClick={() => setSelectedStartDate(opt.value)}
                                                        className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${selectedStartDate === opt.value ? 'bg-indian-saffron text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >{opt.label}</motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-black text-gray-600 uppercase tracking-widest mb-3 block">Duration / अवधि</label>
                                            <div className="flex flex-wrap gap-2">
                                                {DURATION_OPTIONS.map((opt) => (
                                                    <motion.button key={opt.value} whileTap={{ scale: 0.95 }} onClick={() => setSelectedDuration(opt.value)}
                                                        className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${selectedDuration === opt.value ? 'bg-indian-green text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >{opt.label}</motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-black text-gray-600 uppercase tracking-widest mb-3 block">Location / स्थान</label>
                                            <div className="space-y-2">
                                                {LOCATION_OPTIONS.map((loc) => (
                                                    <motion.button key={loc} whileTap={{ scale: 0.98 }} onClick={() => setSelectedLocation(loc)}
                                                        className={`w-full px-4 py-3 rounded-xl font-bold text-left text-sm transition-all ${selectedLocation === loc ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >{loc}</motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-black text-gray-600 uppercase tracking-widest mb-3 block">Wage Per Day / दैनिक मजदूरी (₹)</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                    <IndianRupee className="w-5 h-5" />
                                                </div>
                                                <input type="number" placeholder="e.g. 500" value={wagePerDay} onChange={(e) => setWagePerDay(e.target.value)}
                                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-4 pl-12 pr-4 text-xl font-black focus:border-indian-green focus:bg-white outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        {formError && <p className="text-red-500 font-bold text-center text-sm">{formError}</p>}

                                        <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmitJob} disabled={submitting || !isFormComplete}
                                            className={`w-full py-4 rounded-2xl text-lg font-black shadow-premium flex items-center justify-center gap-2 transition-all ${
                                                submitting || !isFormComplete ? 'bg-gray-200 text-gray-400' : 'bg-indian-green text-white hover:bg-green-700'
                                            }`}
                                        >
                                            {submitting ? 'Posting...' : 'POST JOB / काम पोस्ट करें'}
                                            {!submitting && <ChevronRight className="w-5 h-5" />}
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FarmerDashboard;
