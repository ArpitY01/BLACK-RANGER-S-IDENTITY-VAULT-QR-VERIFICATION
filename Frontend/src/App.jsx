import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './App.css';

// --- FEATURE 1: REGISTRATION ---
function CreateID() {
 /* const l =fetch('api/',{
    method:"GET"
  })*/
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [color, setColor] = useState('');
  const [generatedData, setGeneratedData] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!name || !color) return alert("Credentials missing!");
    
    const newId = `ID-${color.toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`;
    const rangerData = JSON.stringify({ name, mobile, color, id: newId });

    // Save
    const existing = JSON.parse(localStorage.getItem('rangers') || '[]');
    existing.push({ name, mobile, color, id: newId });
    localStorage.setItem('rangers', JSON.stringify(existing));

    setGeneratedData(rangerData);
  };
  return (
    
    
    <div className="container">
      {!generatedData ? (
        <div className="card">
          <h2>Identity Generation</h2>
          <form onSubmit={handleGenerate}>
            <div className="form-group">
                <label>OPERATIVE NAME</label>
                <input type="text" placeholder="Enter Name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
                <label>COMM LINK ID (Mobile)</label>
                <input type="tel" placeholder="XXXXXXXXXX" maxLength="10" value={mobile} onChange={e => setMobile(e.target.value)} />
            </div>
            <div className="form-group">
                <label>SQUADRON COLOR</label>
                <select value={color} onChange={e => setColor(e.target.value)}>
                    <option value="">-- Select Division --</option>
                    <option value="Red">Red</option>
                    <option value="Blue">Blue</option>
                    <option value="Black">Black</option>
                    <option value="Pink">Pink</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Green">Green</option>
                    <option value="White">White</option>
                </select>
            </div>
            <button className="action-btn">ENCODE IDENTITY</button>
          </form>
        </div>
      ) : (
        <div className="card" style={{textAlign:'center', background:'white'}}>
          <h3 style={{color:'black', margin:'0 0 20px 0', fontFamily:'Orbitron'}}>ACCESS GRANTED</h3>
          <div style={{padding:'10px', border:'2px dashed #000', display:'inline-block'}}>
            <QRCode value={generatedData} size={180} />
          </div>
          <p style={{color:'black', fontWeight:'bold', marginTop:'20px'}}>{name} // {color}</p>
          <button className="action-btn" style={{background:'#000', color:'#fff'}} onClick={() => window.location.reload()}>NEW ENTRY</button>
        </div>
      )}
    </div>
  );
}

// --- FEATURE 2: SCANNER ---
function Scanner() {
  const [scanResult, setScanResult] = useState(null);
  const [scannedName, setScannedName] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
    scanner.render(onScanSuccess, (err) => {});
    function onScanSuccess(decodedText) {
      scanner.clear();
      verifyRanger(decodedText);
    }
    return () => scanner.clear().catch(e => console.error(e));
  }, []);

  const verifyRanger = (qrData) => {
    try {
      const parsed = JSON.parse(qrData);
      const rangers = JSON.parse(localStorage.getItem('rangers') || '[]');
      const isValid = rangers.find(r => r.id === parsed.id);
      
      setScanResult(isValid ? "GRANTED" : "DENIED");
      setScannedName(parsed.name || "Unknown");

      const logs = JSON.parse(localStorage.getItem('logs') || '[]');
      logs.push({ time: new Date().toLocaleTimeString(), name: parsed.name, status: isValid ? "GRANTED" : "DENIED" });
      localStorage.setItem('logs', JSON.stringify(logs));
    } catch { setScanResult("DENIED"); }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Retina Scan</h2>
        {scanResult ? (
          <div style={{textAlign:'center'}}>
            <h1 style={{color: scanResult==="GRANTED"?'var(--success)':'var(--danger)', fontSize:'3rem', textShadow:'0 0 20px currentColor'}}>
                {scanResult}
            </h1>
            <p style={{color:'#888'}}>Subject: {scannedName}</p>
            <button className="action-btn" onClick={() => window.location.reload()}>RESET SCANNER</button>
          </div>
        ) : (
            <div className="scanner-wrapper">
                {/* THIS IS THE ANIMATED LASER LINE */}
                <div className="scan-line"></div> 
                <div id="reader"></div>
            </div>
        )}
      </div>
    </div>
  );
}

// --- FEATURE 3: ROSTER ---
function Roster() {
  const [rangers, setRangers] = useState([]);
  useEffect(() => { setRangers(JSON.parse(localStorage.getItem('rangers') || '[]')); }, []);

  const deleteRanger = (id) => {
    if(!confirm("Revoke this ID?")) return;
    const updated = rangers.filter(r => r.id !== id);
    localStorage.setItem('rangers', JSON.stringify(updated));
    setRangers(updated);
  };

  return (
    <div className="container">
      <div className="card" style={{maxWidth:'600px'}}>
        <h2>Active Personnel</h2>
        {rangers.length === 0 ? <p style={{textAlign:'center', color:'#555'}}>Database Empty</p> : (
          <table>
            <thead><tr><th>NAME</th><th>DIVISION</th><th>STATUS</th></tr></thead>
            <tbody>
              {rangers.map((r) => (
                <tr key={r.id}>
                  <td style={{fontWeight:'bold'}}>{r.name}</td>
                  <td style={{color: r.color.toLowerCase() === 'white' ? '#aaa' : r.color}}>{r.color}</td>
                  <td style={{textAlign:'right'}}><button className="delete-btn" onClick={() => deleteRanger(r.id)}>REVOKE</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// --- FEATURE 4: LOGS ---
function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { setLogs(JSON.parse(localStorage.getItem('logs') || '[]').reverse()); }, []);

  return (
    <div className="container">
      <div className="card" style={{maxWidth:'600px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 style={{margin:0}}>Security Logs</h2>
            <button onClick={() => {localStorage.clear(); window.location.reload()}} className="delete-btn">WIPE ALL</button>
        </div>
        <table>
          <thead><tr><th>TIME</th><th>SUBJECT</th><th>RESULT</th></tr></thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i}>
                <td style={{color:'#888', fontSize:'0.8rem'}}>{log.time}</td>
                <td>{log.name}</td>
                <td style={{color: log.status==="GRANTED"?'var(--success)':'var(--danger)', fontWeight:'bold'}}>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- MAIN NAV ---
function App() {
  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="nav-btn">Register</Link>
        <Link to="/roster" className="nav-btn">Roster</Link>
        <Link to="/scan" className="nav-btn">Scan</Link>
        <Link to="/admin" className="nav-btn">Logs</Link>
      </nav>

      <Routes>
        <Route path="/" element={<CreateID />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/scan" element={<Scanner />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;