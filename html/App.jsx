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
    const [successMessage, setSuccessMessage] = useState('');

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
                setSuccessMessage('');
            } else if (type === 'closeDutyUI') {
                setIsVisible(false);
            } else if (type === 'goOnDutyResult') {
                if (!data.success) setErrorMessage(data.error || 'Failed to go on duty.');
                else {
                    setSuccessMessage('You are now on duty!');
                    setTimeout(() => setIsVisible(false), 1000);
                }
            } else if (type === 'clockOffResult') {
                if (!data.success) setErrorMessage(data.error || 'Failed to clock off.');
                else {
                    setSuccessMessage('You are now off duty!');
                    setTimeout(() => setIsVisible(false), 1000);
                }
            }
        });
    }, []);

    useEffect(() => {
        fetchNui('setNuiFocus', { focus: isVisible, cursor: isVisible });
    }, [isVisible]);

    const handleGoOnDuty = async () => {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
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
        setSuccessMessage('');
        await fetchNui('clockOff');
        setLoading(false);
    };

    const handleCancel = () => {
        fetchNui('cancelDutyUI');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 font-sans">
            <div className="bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-lg border-2 border-blue-700 relative animate-fadeIn">
                <div className="flex items-center mb-6">
                    <img src="https://cdn.discordapp.com/attachments/112233445566778899/123456789012345678/ghostline_logo.png" alt="Logo" className="h-12 w-12 rounded-full mr-4 border-2 border-blue-700" />
                    <div>
                        <h2 className="text-3xl font-extrabold text-blue-400 tracking-wide">Duty Menu</h2>
                        <div className="text-gray-300 text-sm">Welcome, <span className="font-semibold">{playerName}</span></div>
                    </div>
                </div>
                {errorMessage && <div className="bg-red-600 text-white p-2 mb-2 rounded text-center animate-shake">{errorMessage}</div>}
                {successMessage && <div className="bg-green-600 text-white p-2 mb-2 rounded text-center animate-fadeIn">{successMessage}</div>}
                {loading && <div className="text-center mb-2 text-blue-300">Loading...</div>}
                {!onDuty ? (
                    <>
                        <div className="mb-4">
                            <label className="block mb-1 text-blue-300 font-semibold">Department</label>
                            <select
                                className="w-full p-2 rounded bg-gray-800 text-white border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={department}
                                onChange={e => setDepartment(e.target.value)}
                            >
                                <option value="">Select Department</option>
                                {availableDepartments.map(dep => (
                                    <option key={dep.id} value={dep.name}>{dep.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-6">
                            <label className="block mb-1 text-blue-300 font-semibold">Callsign</label>
                            <input
                                className="w-full p-2 rounded bg-gray-800 text-white border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                type="text"
                                value={callsign}
                                onChange={e => setCallsign(e.target.value)}
                                placeholder="Enter your callsign"
                                maxLength={12}
                            />
                        </div>
                        <div className="flex justify-between gap-4">
                            <button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-bold shadow transition-all duration-150"
                                onClick={handleGoOnDuty}
                                disabled={loading}
                            >Go On Duty</button>
                            <button
                                className="flex-1 bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white font-semibold shadow transition-all duration-150"
                                onClick={handleCancel}
                                disabled={loading}
                            >Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-6 text-center">
                            <div className="mb-2 text-lg text-blue-300">On Duty as <span className="font-bold text-blue-400">{department}</span></div>
                            <div className="text-gray-200">Callsign: <span className="font-bold">{callsign}</span></div>
                            {startTime && <div className="mt-2 text-sm text-gray-400">Clocked on: {new Date(startTime * 1000).toLocaleString()}</div>}
                        </div>
                        <div className="flex justify-between gap-4">
                            <button
                                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-bold shadow transition-all duration-150"
                                onClick={handleClockOff}
                                disabled={loading}
                            >Clock Off</button>
                            <button
                                className="flex-1 bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-white font-semibold shadow transition-all duration-150"
                                onClick={handleCancel}
                                disabled={loading}
                            >Cancel</button>
                        </div>
                        {startTime && (
                            <div className="mt-4 text-center text-xs text-gray-400">
                                Shift started: {new Date(startTime * 1000).toLocaleString()}<br />
                                {`Duration: ${formatDuration(Math.floor((Date.now()/1000) - startTime))}`}
                            </div>
                        )}
                    </>
                )}
                <div className="absolute bottom-2 right-4 text-xs text-gray-600 opacity-60 select-none">Vibed_Duty &bull; {new Date().getFullYear()}</div>
            </div>
        </div>
    );
}

export default App;
