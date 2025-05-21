import React, { useEffect, useState } from 'react';

function App() {
    const [isVisible, setIsVisible] = useState(false);
    const [onDuty, setOnDuty] = useState(false);
    const [department, setDepartment] = useState('');
    const [departmentLabel, setDepartmentLabel] = useState('');
    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [playerName, setPlayerName] = useState('');
    const [callsign, setCallsign] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [noDepartments, setNoDepartments] = useState(false);

    useEffect(() => {
        window.addEventListener('message', (event) => {
            const { type, data } = event.data;
            if (type === 'setDutyUI') {
                setIsVisible(true);
                setOnDuty(data.onDuty);
                setAvailableDepartments(data.availableDepartments || []);
                setPlayerName(data.playerName || '');
                setDepartment(data.department || '');
                setDepartmentLabel(data.departmentLabel || '');
                setCallsign(data.callsign || '');
                setStartTime(data.startTime || null);
                setErrorMessage(data.error || '');
                setSuccessMessage('');
                setNoDepartments(!data.availableDepartments || data.availableDepartments.length === 0);
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
        if (isVisible) {
            window.postMessage({ type: 'setNuiFocus', data: { focus: true, cursor: true } }, '*');
        } else {
            window.postMessage({ type: 'setNuiFocus', data: { focus: false, cursor: false } }, '*');
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.25)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{background:'#fff',borderRadius:16,boxShadow:'0 8px 32px rgba(0,0,0,0.25)',padding:32,minWidth:340,maxWidth:400,width:'100%',display:'flex',flexDirection:'column',alignItems:'center',position:'relative'}}>
                <img src="https://ghostline.network/assets/img/logo.png" alt="Logo" style={{width:64,height:64,borderRadius:12,marginBottom:16}} />
                <h2 style={{fontSize:28,fontWeight:800,marginBottom:8,color:'#222'}}>Duty Menu</h2>
                <div style={{color:'#666',marginBottom:20}}>Welcome, <b>{playerName}</b></div>
                {noDepartments && <div style={{background:'#ffe066',color:'#222',padding:8,borderRadius:6,marginBottom:10,textAlign:'center'}}>You do not have any eligible departments. Please contact staff.</div>}
                {errorMessage && <div style={{background:'#ff6b6b',color:'#fff',padding:8,borderRadius:6,marginBottom:10,textAlign:'center'}}>{errorMessage}</div>}
                {successMessage && <div style={{background:'#51cf66',color:'#fff',padding:8,borderRadius:6,marginBottom:10,textAlign:'center'}}>{successMessage}</div>}
                {loading && <div style={{color:'#339af0',marginBottom:10}}>Loading...</div>}
                {!onDuty ? (
                    <>
                        <div style={{width:'100%',marginBottom:16}}>
                            <label style={{display:'block',marginBottom:4,color:'#222',fontWeight:600}}>Department</label>
                            <select
                                style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc',background:'#f8f9fa',color:'#222'}}
                                value={department}
                                onChange={e => setDepartment(e.target.value)}
                            >
                                <option value="">Select Department</option>
                                {availableDepartments.map(dep => (
                                    <option key={dep.job} value={dep.job}>{dep.label}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{width:'100%',marginBottom:24}}>
                            <label style={{display:'block',marginBottom:4,color:'#222',fontWeight:600}}>Callsign</label>
                            <input
                                style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc',background:'#f8f9fa',color:'#222'}}
                                type="text"
                                value={callsign}
                                onChange={e => setCallsign(e.target.value)}
                                placeholder="Enter your callsign"
                                maxLength={12}
                            />
                        </div>
                        <div style={{display:'flex',width:'100%',gap:8}}>
                            <button
                                style={{flex:1,background:'#339af0',color:'#fff',padding:'10px 0',border:'none',borderRadius:6,fontWeight:700,fontSize:16,cursor:'pointer'}}
                                onClick={async()=>{
                                    setLoading(true);
                                    setErrorMessage('');
                                    setSuccessMessage('');
                                    if (!department || !callsign) {
                                        setErrorMessage('Please select a department and enter a callsign.');
                                        setLoading(false);
                                        return;
                                    }
                                    window.fetch(`https://${GetParentResourceName()}/goOnDuty`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                                        body: JSON.stringify({ department, callsign })
                                    });
                                    setLoading(false);
                                }}
                                disabled={loading}
                            >Go On Duty</button>
                            <button
                                style={{flex:1,background:'#adb5bd',color:'#222',padding:'10px 0',border:'none',borderRadius:6,fontWeight:700,fontSize:16,cursor:'pointer'}}
                                onClick={()=>{
                                    window.fetch(`https://${GetParentResourceName()}/cancelDutyUI`, {method:'POST'});
                                    setIsVisible(false);
                                }}
                                disabled={loading}
                            >Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{width:'100%',marginBottom:24,textAlign:'center'}}>
                            <div style={{fontSize:20,color:'#339af0',fontWeight:700,marginBottom:4}}>On Duty as <span>{departmentLabel || department}</span></div>
                            <div style={{color:'#555'}}>Callsign: <b>{callsign}</b></div>
                            {startTime && <div style={{marginTop:8,fontSize:13,color:'#888'}}>Clocked on: {new Date(startTime * 1000).toLocaleString()}</div>}
                        </div>
                        <div style={{display:'flex',width:'100%',gap:8}}>
                            <button
                                style={{flex:1,background:'#ff6b6b',color:'#fff',padding:'10px 0',border:'none',borderRadius:6,fontWeight:700,fontSize:16,cursor:'pointer'}}
                                onClick={async()=>{
                                    setLoading(true);
                                    setErrorMessage('');
                                    setSuccessMessage('');
                                    window.fetch(`https://${GetParentResourceName()}/clockOff`, {method:'POST'});
                                    setLoading(false);
                                }}
                                disabled={loading}
                            >Clock Off</button>
                            <button
                                style={{flex:1,background:'#adb5bd',color:'#222',padding:'10px 0',border:'none',borderRadius:6,fontWeight:700,fontSize:16,cursor:'pointer'}}
                                onClick={()=>{
                                    window.fetch(`https://${GetParentResourceName()}/cancelDutyUI`, {method:'POST'});
                                    setIsVisible(false);
                                }}
                                disabled={loading}
                            >Cancel</button>
                        </div>
                        {startTime && (
                            <div style={{marginTop:16,textAlign:'center',fontSize:12,color:'#888'}}>
                                Shift started: {new Date(startTime * 1000).toLocaleString()}<br />
                                {/* Duration can be added if needed */}
                            </div>
                        )}
                    </>
                )}
                <div style={{position:'absolute',bottom:8,right:16,fontSize:11,color:'#bbb',opacity:0.7}}>Vibed_Duty &bull; {new Date().getFullYear()}</div>
            </div>
        </div>
    );
}

export default App;
