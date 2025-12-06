import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './App.css'; // Make sure this path is correct

// --- FEATURE 1: CREATE ID (Registration Form) ---
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
    
    if (!name || !color) return alert("OPERATIVE NAME or SQUADRON COLOR is missing!");
    
    // 1. Generate a unique ID (e.g., ID-RED-1234)
    const newId = `ID-${color.toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`;
    
    // 2. Prepare the data for the QR code
    const rangerData = JSON.stringify({ name, mobile, color, id: newId });

    // 3. Save the new ID to local storage
    const existing = JSON.parse(localStorage.getItem('rangers') || '[]');
    existing.push({ name, mobile, color, id: newId });
    localStorage.setItem('rangers', JSON.stringify(existing));

    // 4. Show the QR code
    setGeneratedData(rangerData);
  };
  return (
    
    
    <div className="container">
      {!generatedData ? (
        <div className="card">
          <h2 className="title">IDENTITY GENERATION</h2>
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label>OPERATIVE NAME</label>
              <input 
                type="text" 
                placeholder="Enter Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>COMM LINK ID (Mobile)</label>
              <input 
                type="tel" 
                placeholder="XXXXXXXXXX" 
                maxLength="10" 
                value={mobile} 
                onChange={e => setMobile(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>SQUADRON COLOR</label>
              <select 
                value={color} 
                onChange={e => setColor(e.target.value)}
              >
                <option value="">-- Select Division --</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="Black">Black</option>
                <option value="Pink">Pink</option>
                <option value="Yellow">Yellow</option>
              </select>
            </div>
            <button type="submit" className="action-btn">ENCODE IDENTITY</button>
          </form>
        </div>
      ) : (
        <div className="card qr-card">
          <h3 className="qr-title">ACCESS GRANTED</h3>
          <div className="qr-code-wrapper">
            <QRCode value={generatedData} size={180} fgColor="var(--primary-dark)" />
          </div>
          <p className="qr-info">{name} // {color}</p>
          <button className="action-btn" onClick={() => window.location.reload()}>NEW ENTRY</button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------
// --- FEATURE 2: SCANNER (FIXED) ---
// ---------------------------------------------
function Scanner() {
  const [scanResult, setScanResult] = useState(null); // Holds "GRANTED" or "DENIED"
  const [scannedName, setScannedName] = useState("");
  // State to hold the scanner instance so we can properly clear it
  const [qrScanner, setQrScanner] = useState(null); 

  // Function to verify the scanned data against local storage
  const verifyRanger = (qrData) => {
    // 1. Stop the scanner once data is received
    if (qrScanner) {
        qrScanner.clear().catch(e => console.error("Error stopping scanner:", e));
        setQrScanner(null); // Clear the scanner state
    }
    
    try {
        const parsed = JSON.parse(qrData);
        const rangers = JSON.parse(localStorage.getItem('rangers') || '[]');
        const isValid = rangers.find(r => r.id === parsed.id);
        
        setScanResult(isValid ? "GRANTED" : "DENIED");
        setScannedName(parsed.name || "Unknown Operative");
        
        // Log access
        const logs = JSON.parse(localStorage.getItem('logs') || '[]');
        logs.push({ time: new Date().toLocaleTimeString(), name: parsed.name, status: isValid ? "GRANTED" : "DENIED" });
        localStorage.setItem('logs', JSON.stringify(logs));
    } catch { 
        setScanResult("DENIED"); 
        setScannedName("Corrupt Data");
    }
  };


  useEffect(() => {
    // Only initialize the scanner if it hasn't been initialized yet
    if (qrScanner) return; 

    // Define the scanner object
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
    
    // Save the scanner instance to state
    setQrScanner(scanner); 

    // Function called on successful scan
    function onScanSuccess(decodedText) {
      verifyRanger(decodedText);
    }
    
    // Start rendering the scanner
    scanner.render(onScanSuccess, (err) => { /* Ignore errors */ });

    // Cleanup function: runs when component unmounts
    return () => {
      // Check if the scanner object was successfully created and attempt to stop it
      if (scanner && typeof scanner.clear === 'function') {
        scanner.clear()
          .then(() => console.log("QR Scanner successfully stopped."))
          .catch((error) => console.error("Failed to stop QR Scanner:", error));
      }
    };
    // Dependency array: only re-run if qrScanner state changes (which we handle manually)
  }, []); 

  // Handle RESET SCANNER button click
  const handleResetScanner = () => {
    setScanResult(null); 
    setScannedName("");
    // Setting qrScanner to null will cause the useEffect to re-initialize it
    setQrScanner(null); 
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">RETINA SCAN</h2>
        {scanResult ? (
          <div className="scan-result-display">
            <h1 className={`scan-status-${scanResult.toLowerCase()}`}>
                {scanResult}
            </h1>
            <p className="scan-subject">Subject: **{scannedName}**</p>
            <button className="action-btn" onClick={handleResetScanner}>RESET SCANNER</button> 
          </div>
        ) : (
            <div className="scanner-wrapper">
                <div className="scan-line"></div> 
                <div id="reader"></div> 
            </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------

// --- FEATURE 3: ROSTER (List of Personnel) ---
function Roster() {
  const [rangers, setRangers] = useState([]);

  useEffect(() => { 
    setRangers(JSON.parse(localStorage.getItem('rangers') || '[]')); 
  }, []);

  const deleteRanger = (id) => {
    if(!window.confirm("CONFIRMATION: Revoke this Operative ID?")) return;
    
    const updated = rangers.filter(r => r.id !== id);
    
    localStorage.setItem('rangers', JSON.stringify(updated));
    setRangers(updated);
  };

  return (
    <div className="container">
      <div className="card roster-card">
        <h2 className="title">ACTIVE PERSONNEL</h2>
        {rangers.length === 0 ? <p className="empty-message">Database Empty</p> : (
          <table>
            <thead>
              <tr>
                <th>NAME</th>
                <th>DIVISION</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {rangers.map((r) => (
                <tr key={r.id}>
                  <td>**{r.name}**</td>
                  <td style={{color: r.color}}>{r.color.toUpperCase()}</td>
                  <td className="text-right">
                    <button className="delete-btn" onClick={() => deleteRanger(r.id)}>REVOKE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// --- FEATURE 4: LOGS (Access History) ---
function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => { 
    setLogs(JSON.parse(localStorage.getItem('logs') || '[]').reverse()); 
  }, []);

  const wipeAllData = () => {
    if(!window.confirm("WARNING: Wipe ALL data (Rangers and Logs)? This cannot be undone.")) return;
    localStorage.clear();
    window.location.reload(); 
  }

  return (
    <div className="container">
      <div className="card roster-card">
        <div className="log-header">
            <h2 className="title" style={{margin:0}}>SECURITY LOGS</h2>
            <button onClick={wipeAllData} className="delete-btn">WIPE ALL</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>TIME</th>
              <th>SUBJECT</th>
              <th>RESULT</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i}>
                <td className="log-time">{log.time}</td>
                <td>{log.name}</td>
                <td className={`log-status-${log.status.toLowerCase()}`}>
                    **{log.status}**
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- MAIN APPLICATION COMPONENT (Navigation) ---
function App() {
  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="nav-btn">🆔 Register</Link>
        <Link to="/roster" className="nav-btn">🛡️ Roster</Link>
        <Link to="/scan" className="nav-btn">👁️ Scan</Link>
        <Link to="/admin" className="nav-btn">📝 Logs</Link>
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