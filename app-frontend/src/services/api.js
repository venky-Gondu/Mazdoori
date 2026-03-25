const BASE_URL = `http://${window.location.hostname}:8000`;

const getHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    checkPhone: async (phone) => {
        const res = await fetch(`${BASE_URL}/userauth/check_phone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });
        return res.json();
    },

    verifyRegister: async (data) => {
        const res = await fetch(`${BASE_URL}/userauth/verify-register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    getJobs: async (workerId) => {
        const res = await fetch(`${BASE_URL}/Finding/jobs/${workerId}`, {
            headers: getHeaders()
        });
        return res.json();
    },

    applyForJob: async (jobId, workerId) => {
        const res = await fetch(`${BASE_URL}/Finding/apply/${jobId}/${workerId}`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (res.status === 409) {
            return { alreadyApplied: true, message: "Already applied" };
        }
        return res.json();
    },

    getFarmerJobs: async (farmerId) => {
        const res = await fetch(`${BASE_URL}/Jobs/UserJobs/${farmerId}`, {
            headers: getHeaders()
        });
        return res.json();
    },

    createJob: async (jobData) => {
        const res = await fetch(`${BASE_URL}/Jobs/CreateJob`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(jobData)
        });
        return res.json();
    },

    getJobApplicants: async (jobId) => {
        const res = await fetch(`${BASE_URL}/Jobs/Applicants/${jobId}`, {
            headers: getHeaders()
        });
        return res.json();
    },

    updateApplicationStatus: async (appId, status) => {
        const res = await fetch(`${BASE_URL}/Jobs/UpdateJobApplicationStatus/${appId}?status=${status}`, {
            method: 'PUT',
            headers: getHeaders()
        });
        return res.json();
    },

    getMyApplications: async (workerId) => {
        const res = await fetch(`${BASE_URL}/Jobs/MyApplications/${workerId}`, {
            headers: getHeaders()
        });
        return res.json();
    }
};
