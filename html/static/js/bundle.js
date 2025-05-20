// html/static/js/bundle.js
// This is a minimal React bundle for FiveM NUI drag-and-drop use.
// To use: Place this file in html/static/js/bundle.js. No build step required.
// This file includes the App component and mounts it to #root.

const e = React.createElement;

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
    const [isVisible, setIsVisible] = React.useState(false);
    const [onDuty, setOnDuty] = React.useState(false);
    const [department, setDepartment] = React.useState('');
    const [callsign, setCallsign] = React.useState('');
    const [availableDepartments, setAvailableDepartments] = React.useState([]);
    const [playerName, setPlayerName] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [startTime, setStartTime] = React.useState(null);

    React.useEffect(() => {
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

    React.useEffect(() => {
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

    return e('div', { className: 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50' },
        e('div', { className: 'bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md' },
            e('h2', { className: 'text-2xl font-bold mb-4 text-center' }, 'Duty Management'),
            errorMessage && e('div', { className: 'bg-red-600 text-white p-2 mb-2 rounded' }, errorMessage),
            loading && e('div', { className: 'text-center mb-2' }, 'Loading...'),
            !onDuty ? (
                e(React.Fragment, null,
                    e('div', { className: 'mb-4' },
                        e('label', { className: 'block mb-1' }, 'Department'),
                        e('select', {
                            className: 'w-full p-2 rounded bg-gray-700 text-white',
                            value: department,
                            onChange: e => setDepartment(e.target.value)
                        },
                            e('option', { value: '' }, 'Select Department'),
                            availableDepartments.map(dep => (
                                e('option', { key: dep.id, value: dep.name }, dep.name)
                            ))
                        )
                    ),
                    e('div', { className: 'mb-4' },
                        e('label', { className: 'block mb-1' }, 'Callsign'),
                        e('input', {
                            className: 'w-full p-2 rounded bg-gray-700 text-white',
                            type: 'text',
                            value: callsign,
                            onChange: e => setCallsign(e.target.value),
                            placeholder: 'Enter your callsign'
                        })
                    ),
                    e('div', { className: 'flex justify-between' },
                        e('button', {
                            className: 'bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-bold',
                            onClick: handleGoOnDuty,
                            disabled: loading
                        }, 'Go On Duty'),
                        e('button', {
                            className: 'bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white',
                            onClick: handleCancel,
                            disabled: loading
                        }, 'Cancel')
                    )
                )
            ) : (
                e(React.Fragment, null,
                    e('div', { className: 'mb-4 text-center' },
                        e('div', { className: 'mb-2' }, 'On Duty as ', e('span', { className: 'font-bold' }, department)),
                        e('div', null, 'Callsign: ', e('span', { className: 'font-bold' }, callsign)),
                        startTime && e('div', { className: 'mt-2 text-sm' }, 'Clocked on: ', new Date(startTime * 1000).toLocaleString())
                    ),
                    e('div', { className: 'flex justify-between' },
                        e('button', {
                            className: 'bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-bold',
                            onClick: handleClockOff,
                            disabled: loading
                        }, 'Clock Off'),
                        e('button', {
                            className: 'bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white',
                            onClick: handleCancel,
                            disabled: loading
                        }, 'Cancel')
                    )
                )
            )
        )
    );
}

window.addEventListener('DOMContentLoaded', function() {
    ReactDOM.render(React.createElement(App), document.getElementById('root'));
});
