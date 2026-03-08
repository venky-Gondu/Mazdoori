const BASE_URL = 'http://localhost:8000'; // Replace with your production URL

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
        return res.json();
    },

    getFarmerJobs: async (farmerId) => {
        const res = await fetch(`${BASE_URL}/Jobs/UserJobs/${farmerId}`, {
            headers: getHeaders()
        });
        return res.json();
    },

    updateJobStatus: async (appId, status) => {
        const res = await fetch(`${BASE_URL}/Jobs/UpdateJobApplicationStatus/${appId}?status=${status}`, {
            method: 'PUT',
            headers: getHeaders()
        });
        return res.json();
    }
};
