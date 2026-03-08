import React from 'react';
import { useAuth } from '../context/AuthContext';
import FarmerDashboard from './FarmerDashboard';
import WorkerDashboard from './WorkerDashboard';
import Welcome from './Welcome';

const Dashboard = () => {
    const { role } = useAuth();

    if (!role) {
        return <Welcome />;
    }

    return (
        <div className="flex-1 flex flex-col">
            {role === 'FARMER' ? <FarmerDashboard /> : <WorkerDashboard />}
        </div>
    );
};

export default Dashboard;
