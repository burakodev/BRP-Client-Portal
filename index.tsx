// @ts-nocheck
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut,
    updateProfile
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    getDocs,
    deleteDoc
} from 'firebase/firestore';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'firebase/storage';


// --- 1. SET UP YOUR FIREBASE CLIENT --- //
// IMPORTANT: Replace this with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
    alert("Firebase is not configured. Please add your project's firebaseConfig object in index.tsx");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- DATA STRUCTURES / TYPES (Unchanged)--- //
interface ProgressItem { id: string; text: string; status: 'Not Started' | 'In Progress' | 'Awaiting Feedback' | 'Complete'; }
interface Payment { id: string; item: string; amount: number; dueDate: string; status: 'Paid' | 'Upcoming'; }
interface ProgressData { nextAction: string; items: { [category: string]: ProgressItem[]; }; payments: Payment[]; }
interface Color { id: string; name: string; hex: string; rgb: string; cmyk: string; }
interface Typography { family: string; type: 'Heading' | 'Body'; previewText: string; }
interface LogoUsage { id:string; imageUrl: string; description: string; type: 'light' | 'dark'; }
interface GuidelinesData { colors: Color[]; typography: Typography[]; logos: LogoUsage[]; }
interface AssetFile { id: string; name: string; url: string; }
interface AssetCategoryData { id: string; name: string; files: AssetFile[]; }
interface ClientData { progress: ProgressData; guidelines: GuidelinesData; assets: AssetCategoryData[]; }
interface Client { id: string; name: string; email: string; data: ClientData; }


// --- UTILITY FUNCTIONS (Unchanged) --- //
const generateId = () => `id_${new Date().getTime()}_${Math.random()}`;
const createNewClientData = (): ClientData => ({
  progress: {
    nextAction: "",
    items: { "Strategy": [], "Identity": [], "Website": [], "Packaging": [], "Social Media Ads": [] },
    payments: []
  },
  guidelines: { colors: [], typography: [
      { type: 'Heading', family: 'Inter', previewText: 'This is a Heading' },
      { type: 'Body', family: 'Inter', previewText: 'This is body text.' },
  ], logos: [] },
  assets: []
});


// --- FIREBASE DATABASE API --- //
const firebaseDb = {
    // Auth
    onAuthStateChange: (callback) => onAuthStateChanged(auth, callback),
    signUp: async (name, email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Create a client document in Firestore
        const clientRef = doc(db, 'clients', userCredential.user.uid);
        await setDoc(clientRef, {
            id: userCredential.user.uid,
            name: name,
            email: email,
            data: createNewClientData()
        });
        return userCredential.user;
    },
    signIn: async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    },
    signInWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        // Check if user exists in Firestore, if not, create them
        const clientRef = doc(db, 'clients', user.uid);
        const clientDoc = await getDoc(clientRef);
        if (!clientDoc.exists()) {
             await setDoc(clientRef, {
                id: user.uid,
                name: user.displayName,
                email: user.email,
                data: createNewClientData()
            });
        }
        return user;
    },
    signOut: async () => await signOut(auth),

    // Client Data
    getClients: async () => {
        const querySnapshot = await getDocs(collection(db, "clients"));
        return querySnapshot.docs.map(doc => doc.data());
    },
    getClientById: async (userId) => {
        const docRef = doc(db, "clients", userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    },
    updateClientData: async (clientId, clientData) => {
        const clientRef = doc(db, 'clients', clientId);
        await updateDoc(clientRef, { data: clientData });
    },
    deleteClientDoc: async (clientId) => {
        const clientRef = doc(db, 'clients', clientId);
        await deleteDoc(clientRef);
    },

    // File Storage
    uploadFile: async (file, clientId, categoryName) => {
        const filePath = `${clientId}/${categoryName}/${file.name}_${generateId()}`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return { name: file.name, url: url };
    }
};


// --- HELPER COMPONENTS (Unchanged) --- //
const Logo = () => <div className="logo">Brandpreneur</div>;
const ThemeToggle = ({ theme, toggleTheme }) => (
  <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
    {theme === 'light' ? '🌙' : '☀️'}
  </button>
);

// --- AUTHENTICATION COMPONENTS (Updated for Firebase) --- //
const LoginPage = ({ onSwitchToSignup, onSwitchToAdminLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await firebaseDb.signIn(email, password);
    } catch (error) {
        alert(error.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async (e) => {
      e.preventDefault();
      try {
        await firebaseDb.signInWithGoogle();
      } catch (error) {
        alert(error.message);
      }
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>Client Login</h2>
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button type="submit" className="button auth-button" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          <button type="button" className="google-signin-button" onClick={handleGoogleSignIn}>Sign in with Google</button>
        </form>
        <p className="auth-switch">Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignup(); }}>Sign Up</a></p>
        <a href="#" className="admin-login-link" onClick={(e) => { e.preventDefault(); onSwitchToAdminLogin(); }}>Admin Login</a>
      </div>
    </div>
  );
};

const SignupPage = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await firebaseDb.signUp(name, email, password);
            alert("Success! A confirmation might be sent to your email. You can now log in.");
            onSwitchToLogin();
        } catch (error) {
            alert(error.message);
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <h2>Create Client Account</h2>
                <form onSubmit={handleSubmit} className="contact-form">
                     <div className="form-group"><label htmlFor="name">Full Name</label><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                    <div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                    <div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                    <button type="submit" className="button auth-button" disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</button>
                </form>
                <p className="auth-switch">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Login</a></p>
            </div>
        </div>
    );
};

const AdminLoginPage = ({ onSwitchToClientLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await firebaseDb.signIn(email, password);
        } catch (error) {
            alert(error.message);
        }
        setLoading(false);
    };
    return (
        <div className="auth-container">
            <div className="card auth-card">
                <h2>Admin Login</h2>
                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group"><label htmlFor="admin-email">Email</label><input type="email" id="admin-email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                    <div className="form-group"><label htmlFor="admin-password">Password</label><input type="password" id="admin-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                    <button type="submit" className="button auth-button" disabled={loading}>{loading ? 'Logging in...' : 'Admin Login'}</button>
                </form>
                 <a href="#" className="admin-login-link" onClick={(e) => { e.preventDefault(); onSwitchToClientLogin(); }}>Back to Client Login</a>
            </div>
        </div>
    );
};

// --- CLIENT-FACING COMPONENTS (Unchanged, but now receive live data) --- //
const Header = ({ activePage, setActivePage, theme, toggleTheme, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleNavClick = (e, page) => { e.preventDefault(); setActivePage(page); setIsMenuOpen(false); };
  const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>);
  const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
  return (
    <header className="header">
      <Logo />
      <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
        <ul>{['Progress', 'Guidelines', 'Assets', 'Contact'].map(page => (<li key={page}><a href="#" className={activePage === page ? 'active' : ''} onClick={(e) => handleNavClick(e, page)}>{page}</a></li>))}</ul>
        <div className="header-actions"><ThemeToggle theme={theme} toggleTheme={toggleTheme} /><button onClick={onLogout} className="logout-button">Log Out</button></div>
      </nav>
      <div className="mobile-menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <CloseIcon /> : <MenuIcon />}</div>
    </header>
  );
};
const ProgressPage = ({ data }) => {
    if (!data) return <div className="loading-state">Loading Progress...</div>;
    const { nextAction, items, payments } = data;
    const categories = ["Strategy", "Identity", "Website", "Packaging", "Social Media Ads"];
    return (
        <div className="page-content"><h1>Project Progress</h1><div className="dashboard-grid"><div className="card alert-card"><h3>Next Action Required</h3><p>{nextAction || 'No immediate actions required.'}</p></div><div className="card"><h3>Upcoming Payments</h3><ul className="payment-list">{payments && payments.length > 0 ? payments.map(p => (<li key={p.id} className="payment-item"><div className="payment-details"><strong>{p.item}</strong><span>Due: {p.dueDate}</span></div><span className="payment-amount">${p.amount.toLocaleString()}</span><span className={`payment-status ${p.status.toLowerCase()}`}>{p.status}</span></li>)) : <p className="no-items">No payments scheduled.</p>}</ul></div></div><div className="card timeline-card"><h2>Project Timeline</h2>{categories.map(category => (items[category] && items[category].length > 0 &&<div key={category} className="timeline-category"><h4>{category}</h4>{items[category].map(item => {const statusClass = item.status.toLowerCase().replace(/ /g, '-');return (<div key={item.id} className="timeline-item"><div className={`status-dot ${statusClass}`}></div><div className="item-details"><p>{item.text}</p><span className="item-status">{item.status}</span></div></div>);})}</div>))}</div></div>
    );
};
const GuidelinesPage = ({ data }) => {
   if (!data) return <div className="loading-state">Loading Guidelines...</div>;
   const { colors, typography, logos } = data;
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text).then(() => { alert(`Copied "${text}" to clipboard!`); }); };
  return (
    <div className="page-content"><h1>Brand Guidelines</h1><div className="card"><h2>Color Palette</h2><div className="grid-3">{colors && colors.map(color => (<div key={color.id} className="color-card"><div className="color-swatch" style={{ backgroundColor: color.hex }}></div><h3>{color.name}</h3><ul className="color-codes"><li>HEX: <span onClick={() => copyToClipboard(color.hex)}>{color.hex}</span></li><li>RGB: <span onClick={() => copyToClipboard(color.rgb)}>{color.rgb}</span></li><li>CMYK: <span onClick={() => copyToClipboard(color.cmyk)}>{color.cmyk}</span></li></ul></div>))}</div></div><div className="card"><h2>Typography</h2>{typography && typography.map(font => (<div key={font.type}><div className="typography-header"><h3>{font.type} - {font.family}</h3><a href={`https://fonts.google.com/specimen/${font.family.replace(' ','+')}`} target="_blank" rel="noopener noreferrer" className="button button-small">Download Font</a></div><p style={{ fontFamily: font.family, fontSize: font.type === 'Heading' ? '2rem' : '1rem' }}>{font.previewText}</p><hr style={{margin: '2rem 0', border: 'none', borderTop: '1px solid var(--border-color)'}}/></div>))}</div><div className="card"><h2>Logo Usage</h2><div className="grid-2">{logos && logos.map(logo => (<div key={logo.id} className="logo-usage-item"><div className={logo.type === 'light' ? 'logo-preview' : 'logo-preview-dark'}><img src={logo.imageUrl} alt={logo.description} /></div><p>{logo.description}</p></div>))}</div></div></div>
  );
};
const AssetCategory = ({ category, isOpen, onToggle }) => (<div className="asset-category"><button className="accordion-header" onClick={onToggle}><span>{category.name}</span><span>{isOpen ? '−' : '+'}</span></button>{isOpen && (<div className="accordion-content"><ul className="file-list">{category.files.map(file => (<li key={file.id}><span>{file.name}</span><a href={file.url} className="button button-small" target="_blank" rel="noopener noreferrer">View</a></li>))}</ul></div>)}</div>);
const AssetsPage = ({ data }) => {
  const [openCategoryId, setOpenCategoryId] = useState(null);
  if (!data) return <div className="loading-state">Loading Assets...</div>;
  const handleToggle = (categoryId) => { setOpenCategoryId(openCategoryId === categoryId ? null : categoryId); };
  useEffect(() => { if (data && data.length > 0) { setOpenCategoryId(data[0].id); } }, [data]);
  return (<div className="page-content"><h1>Assets Library</h1><div className="card">{data.map(category => (<AssetCategory key={category.id} category={category} isOpen={openCategoryId === category.id} onToggle={() => handleToggle(category.id)}/>))}</div></div>);
};
const ContactPage = () => (<div className="page-content"><h1>Contact Us</h1><div className="card"><form className="contact-form"><div className="form-group"><label htmlFor="project">Project Name</label><select id="project"><option>Brand Identity Project</option><option>Website Redesign</option></select></div><div className="form-group"><label htmlFor="subject">Subject</label><input type="text" id="subject" /></div><div className="form-group"><label htmlFor="category">Category</label><select id="category"><option>Design Revision</option><option>Content Request</option><option>Technical Issue</option><option>Billing Question</option></select></div><div className="form-group"><label htmlFor="details">Details of Request</label><textarea id="details" rows={6}></textarea></div><div className="form-group"><label htmlFor="attachment">Attachment (Optional)</label><input type="file" id="attachment" /></div><button type="submit" className="button">Submit Request</button></form></div></div>);

// --- ADMIN COMPONENTS (Updated for Firebase) --- //
const AdminDashboard = ({ clients, onSelectClient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    if(!clients) return <div className="loading-state">Loading clients...</div>;
    const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return (<div className="admin-page-content"><div className="admin-header"><h1>Clients Dashboard</h1></div><input type="text" placeholder="Search clients..." className="search-bar" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/><div className="client-list">{filteredClients.map(client => (<div key={client.id} className="client-card" onClick={() => onSelectClient(client.id)}><h3>{client.name}</h3><p>{client.email}</p><span>Edit Content →</span></div>))}</div></div>);
};
const ClientEditor = ({ client, onBack, onDataUpdated }) => {
    const [clientData, setClientData] = useState(client.data);
    const [isSaving, setIsSaving] = useState(false);
    const handleSave = async () => { setIsSaving(true); try { await firebaseDb.updateClientData(client.id, clientData); alert('Client data saved!'); onDataUpdated(); } catch (error) { alert(error.message); } setIsSaving(false); };
    const handleChange = (section, path, value) => { setClientData(prevData => { const newData = JSON.parse(JSON.stringify(prevData)); let current = newData[section]; for (let i = 0; i < path.length - 1; i++) { current = current[path[i]]; } current[path[path.length - 1]] = value; return newData; }); };
    const handleListChange = (section, listName, index, field, value) => { const path = [listName, index, field]; handleChange(section, path, value); };
    const handleAddListItem = (section, listName, newItem) => { setClientData(prevData => { const newData = JSON.parse(JSON.stringify(prevData)); newData[section][listName].push(newItem); return newData; }); };
    const handleRemoveListItem = (section, listName, index) => { setClientData(prevData => { const newData = JSON.parse(JSON.stringify(prevData)); newData[section][listName].splice(index, 1); return newData; }); };
    const handleFileUpload = async (e, categoryName, onComplete) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const { name, url } = await firebaseDb.uploadFile(file, client.id, categoryName);
                onComplete(url, name);
            } catch (error) {
                alert(`Upload failed: ${error.message}`);
            }
        }
    };
    const renderContent = () => {
        const { progress, guidelines, assets } = clientData;
        switch(activeTab) {
            case 'Progress': return (
                <div>
                  <fieldset><legend>Next Action</legend><input type="text" value={progress.nextAction} onChange={e => handleChange('progress', ['nextAction'], e.target.value)} /></fieldset>
                  <fieldset><legend>Timeline Items</legend>{Object.entries(progress.items).map(([category, items]) => (<div key={category}><h4>{category}</h4>{items.map((item, index) => (<div key={item.id} className="editor-list-item"><input type="text" value={item.text} onChange={e => handleChange('progress', ['items', category, index, 'text'], e.target.value)} /><select value={item.status} onChange={e => handleChange('progress', ['items', category, index, 'status'], e.target.value)}><option>Not Started</option><option>In Progress</option><option>Awaiting Feedback</option><option>Complete</option></select><button className="button-remove" onClick={() => { const newItems = { ...progress.items }; newItems[category].splice(index, 1); handleChange('progress', ['items'], newItems); }}>×</button></div>))}<button className="button button-small button-secondary" onClick={() => { const newItems = { ...progress.items }; newItems[category].push({ id: generateId(), text: 'New Item', status: 'Not Started' }); handleChange('progress', ['items'], newItems); }}>+ Add Item</button></div>))}</fieldset>
                  <fieldset><legend>Payments</legend>{progress.payments.map((p, index) => (<div key={p.id} className="editor-list-item"><input type="text" placeholder="Item" value={p.item} onChange={e => handleListChange('progress', 'payments', index, 'item', e.target.value)} /><input type="number" placeholder="Amount" value={p.amount} onChange={e => handleListChange('progress', 'payments', index, 'amount', parseFloat(e.target.value))} /><input type="date" value={p.dueDate} onChange={e => handleListChange('progress', 'payments', index, 'dueDate', e.target.value)} /><select value={p.status} onChange={e => handleListChange('progress', 'payments', index, 'status', e.target.value)}><option>Upcoming</option><option>Paid</option></select><button className="button-remove" onClick={() => handleRemoveListItem('progress', 'payments', index)}>×</button></div>))}<button className="button button-add" onClick={() => handleAddListItem('progress', 'payments', { id: generateId(), item: '', amount: 0, dueDate: '', status: 'Upcoming' })}>+ Add Payment</button></fieldset>
                </div>
            );
            case 'Guidelines': return (
                 <div>
                    <fieldset><legend>Colors</legend>{guidelines.colors.map((c, index) => (<div key={c.id} className="editor-list-item"><input type="color" value={c.hex} onChange={e => handleListChange('guidelines', 'colors', index, 'hex', e.target.value)} /><input type="text" placeholder="Name" value={c.name} onChange={e => handleListChange('guidelines', 'colors', index, 'name', e.target.value)} /><input type="text" placeholder="RGB" value={c.rgb} onChange={e => handleListChange('guidelines', 'colors', index, 'rgb', e.target.value)} /><input type="text" placeholder="CMYK" value={c.cmyk} onChange={e => handleListChange('guidelines', 'colors', index, 'cmyk', e.target.value)} /><button className="button-remove" onClick={() => handleRemoveListItem('guidelines', 'colors', index)}>×</button></div>))}<button className="button button-add" onClick={() => handleAddListItem('guidelines', 'colors', {id: generateId(), name: 'New Color', hex: '#ffffff', rgb: '255,255,255', cmyk: '0,0,0,0'})}>+ Add Color</button></fieldset>
                    <fieldset><legend>Typography</legend>{guidelines.typography.map((t, index) => (<div key={`${t.type}-${index}`} className="editor-list-item"><span>{t.type}</span><input type="text" placeholder="Font Family (e.g. Inter)" value={t.family} onChange={e => handleListChange('guidelines', 'typography', index, 'family', e.target.value)} /><input type="text" placeholder="Preview Text" value={t.previewText} onChange={e => handleListChange('guidelines', 'typography', index, 'previewText', e.target.value)} /></div>))}</fieldset>
                    <fieldset><legend>Logo Usage</legend>{guidelines.logos.map((l, index) => (<div key={l.id} className="editor-list-item vertical"><img src={l.imageUrl} alt="preview" style={{maxWidth: '200px', maxHeight: '100px', border: '1px solid #ccc'}}/><input type="text" placeholder="Description" value={l.description} onChange={e => handleListChange('guidelines', 'logos', index, 'description', e.target.value)} /><select value={l.type} onChange={e => handleListChange('guidelines', 'logos', index, 'type', e.target.value)}><option value="light">On Light</option><option value="dark">On Dark</option></select><button className="button-remove" onClick={() => handleRemoveListItem('guidelines', 'logos', index)}>×</button></div>))}<label className="button button-upload button-secondary">+ Upload Logo<input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'logos', (url) => { handleAddListItem('guidelines', 'logos', { id: generateId(), imageUrl: url, description: 'New Logo', type: 'light'})})}/></label></fieldset>
                </div>
            );
            case 'Assets': return (
                <div>{assets.map((category, catIndex) => (<fieldset key={category.id}><legend><input type="text" value={category.name} onChange={e => handleChange('assets', [catIndex, 'name'], e.target.value)} /></legend>{category.files.map((file, fileIndex) => (<div key={file.id} className="editor-list-item"><span>{file.name}</span><button className="button-remove" onClick={() => { const newAssets = [...assets]; newAssets[catIndex].files.splice(fileIndex, 1); handleChange('assets', [], newAssets); }}>×</button></div>))}<label className="button button-upload button-secondary">+ Upload File<input type="file" onChange={e => handleFileUpload(e, category.name, (url, name) => { const newAssets = [...assets]; newAssets[catIndex].files.push({ id: generateId(), name, url }); handleChange('assets', [], newAssets); })}/></label></fieldset>))}<button className="button button-add" onClick={() => { const newAssets = [...assets, { id: generateId(), name: 'New Category', files: [] }]; handleChange('assets', [], newAssets); }}>+ Add Category</button></div>
            );
            default: return null;
        }
    };
    return (<div className="main-content"><div className="editor-header"><h2>Editing Content: {client.name}</h2><div><button className="button button-secondary" onClick={onBack}>Back to Clients</button><button className="button" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button></div></div><div className="editor-tabs"><button className={activeTab === 'Progress' ? 'active' : ''} onClick={() => setActiveTab('Progress')}>Progress</button><button className={activeTab === 'Guidelines' ? 'active' : ''} onClick={() => setActiveTab('Guidelines')}>Guidelines</button><button className={activeTab === 'Assets' ? 'active' : ''} onClick={() => setActiveTab('Assets')}>Assets</button></div><div className="editor-content card">{renderContent()}</div></div>);
};
const UserManagement = ({ clients, refreshClients }) => {
    const handleDelete = async (clientId) => {
        if(window.confirm('Are you sure you want to delete this user\'s data from the database? This cannot be undone.')) {
            try {
                await firebaseDb.deleteClientDoc(clientId);
                alert('Client data deleted successfully. NOTE: The user must be deleted from the Firebase Authentication console separately.');
                refreshClients();
            } catch (error) {
                alert(error.message);
            }
        }
    };
    return (
        <div className="admin-page-content">
            <div className="admin-header"><h1>User Management</h1><p>Create new users via the main Sign Up page. Delete Auth users from the Firebase Console.</p></div>
            <div className="card user-list-card"><table className="user-table"><thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead><tbody>{clients && clients.map(client => (<tr key={client.id}><td>{client.name}</td><td>{client.email}</td><td><div className="user-actions"><button className="button button-small button-danger" onClick={() => handleDelete(client.id)}>Delete Data</button></div></td></tr>))}</tbody></table></div>
        </div>
    );
};
const AdminPage = ({ onLogout, theme, toggleTheme }) => {
    const [clients, setClients] = useState(null);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [adminView, setAdminView] = useState('dashboard');
    const fetchClients = async () => { setClients(await firebaseDb.getClients()); };
    useEffect(() => { fetchClients(); }, []);

    const selectedClient = clients?.find(c => c.id === selectedClientId);
    if(selectedClient) {
        return <ClientEditor client={selectedClient} onBack={() => setSelectedClientId(null)} onDataUpdated={fetchClients} />
    }
    return (
      <div className="app-container"><header className="header"><Logo /><nav className="nav open"><div className="admin-nav-tabs"><button className={adminView === 'dashboard' ? 'active' : ''} onClick={() => setAdminView('dashboard')}>Clients Dashboard</button><button className={adminView === 'users' ? 'active' : ''} onClick={() => setAdminView('users')}>User Management</button></div><div className="header-actions"><ThemeToggle theme={theme} toggleTheme={toggleTheme} /><button onClick={onLogout} className="logout-button">Log Out</button></div></nav></header><main className="main-content">{adminView === 'dashboard' ? (<AdminDashboard clients={clients} onSelectClient={setSelectedClientId} />) : (<UserManagement clients={clients} refreshClients={fetchClients}/>)}</main></div>
    );
};


// --- MAIN APP COMPONENT --- //
const App = () => {
  const [theme, setTheme] = useState('light');
  const [activePage, setActivePage] = useState('Progress');
  const [user, setUser] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authView, setAuthView] = useState('login'); 

  // --- 2. Admin email check ---
  const ADMIN_EMAIL = "admin@brandpreneur.com"; 

  useEffect(() => {
    const unsubscribe = firebaseDb.onAuthStateChange(async (user) => {
        setUser(user);
        if (user) {
            const data = await firebaseDb.getClientById(user.uid);
            setClientData(data);
        } else {
            setClientData(null);
        }
        setIsLoading(false);
    });
    
    // Theme setup
    const storedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(storedTheme);
    document.body.setAttribute('data-theme', storedTheme);

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };
  
  const handleLogout = async () => {
      await firebaseDb.signOut();
      setAuthView('login');
  };

  if (isLoading) {
      return <div className="loading-state">Initializing Application...</div>;
  }
  
  if (!user) {
      switch (authView) {
        case 'signup': return <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
        case 'adminLogin': return <AdminLoginPage onSwitchToClientLogin={() => setAuthView('login')} />;
        case 'login': default: return <LoginPage onSwitchToSignup={() => setAuthView('signup')} onSwitchToAdminLogin={() => setAuthView('adminLogin')} />;
      }
  }

  // --- Role-based routing ---
  if (user.email === ADMIN_EMAIL) {
      return <AdminPage onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />;
  }

  // --- Client View ---
  const renderPage = () => {
    if (!clientData) return <div className="loading-state">Loading client data... This may take a moment if you've just signed up.</div>;
    switch (activePage) {
      case 'Progress': return <ProgressPage data={clientData.data.progress} />;
      case 'Guidelines': return <GuidelinesPage data={clientData.data.guidelines} />;
      case 'Assets': return <AssetsPage data={clientData.data.assets} />;
      case 'Contact': return <ContactPage />;
      default: return <ProgressPage data={clientData.data.progress} />;
    }
  };

  return (
    <div className="app-container">
      <Header activePage={activePage} setActivePage={setActivePage} theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}
