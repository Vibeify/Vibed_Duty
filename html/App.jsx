import React, { useEffect, useState } from 'react';

const fetchNui = (event, data) => {
    return new Promise((resolve) => {
        window.fetch(`https://${GetParentResourceName()}/${event}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(data)
        })
        .then(resp => resp.json())
        .then(resolve)
        .catch(() => resolve(null));
    });
};

const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
};

function App() {
    const [isVisible, setIsVisible] = useState(false);
    const [onDuty, setOnDuty] = useState(false);
    const [department, setDepartment] = useState('');
    const [callsign, setCallsign] = useState('');
    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [playerName, setPlayerName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        window.addEventListener('message', (event) => {
            const { type, data } = event.data;
            if (type === 'setDutyUI') {
                setIsVisible(true);
                setOnDuty(data.onDuty);
                setAvailableDepartments(data.availableDepartments || []);
                setPlayerName(data.playerName || '');
                setDepartment(data.department || '');
                setCallsign(data.callsign || '');
                setStartTime(data.startTime || null);
                setErrorMessage(data.error || '');
            } else if (type === 'closeDutyUI') {
                setIsVisible(false);
            } else if (type === 'goOnDutyResult') {
                if (!data.success) setErrorMessage(data.error || 'Failed to go on duty.');
                else setIsVisible(false);
            } else if (type === 'clockOffResult') {
                if (!data.success) setErrorMessage(data.error || 'Failed to clock off.');
                else setIsVisible(false);
            }
        });
    }, []);

    useEffect(() => {
        fetchNui('setNuiFocus', { focus: isVisible, cursor: isVisible });
    }, [isVisible]);

    const handleGoOnDuty = async () => {
        setLoading(true);
        setErrorMessage('');
        if (!department || !callsign) {
            setErrorMessage('Please select a department and enter a callsign.');
            setLoading(false);
            return;
        }
        await fetchNui('goOnDuty', { department, callsign });
        setLoading(false);
    };

    const handleClockOff = async () => {
        setLoading(true);
        setErrorMessage('');
        await fetchNui('clockOff');
        setLoading(false);
    };

    const handleCancel = () => {
        fetchNui('cancelDutyUI');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Duty Management</h2>
                {errorMessage && <div className="bg-red-600 text-white p-2 mb-2 rounded">{errorMessage}</div>}
                {loading && <div className="text-center mb-2">Loading...</div>}
                {!onDuty ? (
                    <>
                        <div className="mb-4">
                            <label className="block mb-1">Department</label>
                            <select
                                className="w-full p-2 rounded bg-gray-700 text-white"
                                value={department}
                                onChange={e => setDepartment(e.target.value)}
                            >
                                <option value="">Select Department</option>
                                {availableDepartments.map(dep => (
                                    <option key={dep.id} value={dep.name}>{dep.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Callsign</label>
                            <input
                                className="w-full p-2 rounded bg-gray-700 text-white"
                                type="text"
                                value={callsign}
                                onChange={e => setCallsign(e.target.value)}
                                placeholder="Enter your callsign"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button
                                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-bold"
                                onClick={handleGoOnDuty}
                                disabled={loading}
                            >Go On Duty</button>
                            <button
                                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
                                onClick={handleCancel}
                                disabled={loading}
                            >Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-4 text-center">
                            <div className="mb-2">On Duty as <span className="font-bold">{department}</span></div>
                            <div>Callsign: <span className="font-bold">{callsign}</span></div>
                            {startTime && <div className="mt-2 text-sm">Clocked on: {new Date(startTime * 1000).toLocaleString()}</div>}
                        </div>
                        <div className="flex justify-between">
                            <button
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-bold"
                                onClick={handleClockOff}
                                disabled={loading}
                            >Clock Off</button>
                            <button
                                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
                                onClick={handleCancel}
                                disabled={loading}
                            >Cancel</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
