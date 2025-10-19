import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  const [page, setPage] = useState('Progress');
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) return storedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const pages = {
    'Progress': <ProgressPage />,
    'Guidelines': <GuidelinesPage />,
    'Assets': <AssetsPage />,
    'Contact': <ContactPage />,
  };

  return (
    <>
      <Header currentPage={page} setPage={setPage} theme={theme} toggleTheme={toggleTheme} />
      <main>
        {pages[page]}
      </main>
    </>
  );
};

const Header = ({ currentPage, setPage, theme, toggleTheme }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNavClick = (e, page) => {
        e.preventDefault();
        setPage(page);
        setIsMenuOpen(false);
    }
  
    return (
    <header className="header">
      <div className="logo">
        <svg height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0L32 16L16 32L0 16L16 0Z" fill="var(--accent-color)"/>
          <path d="M16 5L27 16L16 27L5 16L16 5Z" fill="var(--background-color)"/>
        </svg>
        <h1>Brandpreneur</h1>
      </div>
      <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle navigation menu">
         {isMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         )}
      </button>
      <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
        <ul>
          {['Progress', 'Guidelines', 'Assets', 'Contact'].map(p => (
            <li key={p}>
              <a href="#" className={currentPage === p ? 'active' : ''} onClick={(e) => handleNavClick(e, p)}>{p}</a>
            </li>
          ))}
        </ul>
        <button onClick={toggleTheme} className="theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>
    </header>
  );
};

const ProgressPage = () => {
    const progressData = [
        { stage: 'Strategy', status: 'Complete', details: 'Brand questionnaire & discovery call.' },
        { stage: 'Identity', status: 'Awaiting Feedback', details: 'Logo concepts delivered.' },
        { stage: 'Website', status: 'In Progress', details: 'Homepage design mockups.' },
        { stage: 'Launch', status: 'Not Started', details: 'Final checks & deployment.' },
    ];
    
    const payments = [
        { id: 1, name: 'Project Deposit', amount: '$1,500', due: '2024-07-01', status: 'Paid' },
        { id: 2, name: 'Identity Milestone', amount: '$2,000', due: '2024-08-15', status: 'Upcoming' },
        { id: 3, name: 'Final Payment', amount: '$1,500', due: '2024-09-30', status: 'Upcoming' },
    ];

    const getStatusClass = (status) => {
        return status.toLowerCase().replace(' ', '-');
    }

    return (
        <div className="container">
            <h2>Project Progress</h2>
            <div className="dashboard-grid">
                <div className="card alert">
                    <h3>Next Action Required</h3>
                    <p>Please review the logo concepts sent to your email and provide feedback by EOD Friday.</p>
                </div>
                <div className="card">
                    <h3>Upcoming Payments</h3>
                    <ul className="payment-list">
                        {payments.map(p => (
                            <li key={p.id} className="payment-item">
                                <div className="payment-details">
                                    <strong>{p.name}</strong>
                                    <span>{p.amount} - Due {p.due}</span>
                                </div>
                                <div className="payment-status">
                                    <span className={`status-pill ${p.status.toLowerCase()}`}>{p.status}</span>
                                    {p.status !== 'Paid' && <button className="button button-small">Pay Now</button>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
           
            <div className="card">
                <h3>Stage Timeline</h3>
                <div className="timeline">
                    {progressData.map((item, index) => (
                         <div key={index} className="timeline-item">
                            <div className={`timeline-dot ${getStatusClass(item.status)}`}></div>
                            <div className="timeline-content">
                                <span className={`status-badge ${getStatusClass(item.status)}`}>{item.status}</span>
                                <h4>{item.stage}</h4>
                                <p>{item.details}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


const GuidelinesPage = () => {
    const colors = {
        primary: [
            { name: 'Brand Pink', hex: '#f90a79', rgb: '249, 10, 121', cmyk: '0, 96, 51, 2' },
            { name: 'Dark Grey', hex: '#1a1a1a', rgb: '26, 26, 26', cmyk: '0, 0, 0, 80' },
        ],
        secondary: [
            { name: 'Light Grey', hex: '#f2f2f2', rgb: '242, 242, 242', cmyk: '0, 0, 0, 5' },
            { name: 'White', hex: '#ffffff', rgb: '255, 255, 255', cmyk: '0, 0, 0, 0' },
        ]
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert(`Copied "${text}" to clipboard!`);
    }

    return (
        <div className="container">
            <h2>Brand Guidelines</h2>
            <div className="card">
                <h3>Color Palette</h3>
                <h4>Primary Colors</h4>
                <div className="color-grid">
                    {colors.primary.map(color => (
                        <div key={color.hex} className="color-swatch-container">
                             <div className="color-swatch" style={{ backgroundColor: color.hex }}></div>
                             <strong>{color.name}</strong>
                             <p>HEX: <span className="copyable" onClick={() => copyToClipboard(color.hex)}>{color.hex}</span></p>
                             <p>RGB: <span className="copyable" onClick={() => copyToClipboard(`rgb(${color.rgb})`)}>{color.rgb}</span></p>
                             <p>CMYK: <span className="copyable" onClick={() => copyToClipboard(`cmyk(${color.cmyk})`)}>{color.cmyk}</span></p>
                        </div>
                    ))}
                </div>
                <h4>Secondary Colors</h4>
                <div className="color-grid">
                    {colors.secondary.map(color => (
                        <div key={color.hex} className="color-swatch-container">
                             <div className="color-swatch" style={{ backgroundColor: color.hex, border: '1px solid var(--border-color)' }}></div>
                             <strong>{color.name}</strong>
                             <p>HEX: <span className="copyable" onClick={() => copyToClipboard(color.hex)}>{color.hex}</span></p>
                             <p>RGB: <span className="copyable" onClick={() => copyToClipboard(`rgb(${color.rgb})`)}>{color.rgb}</span></p>
                             <p>CMYK: <span className="copyable" onClick={() => copyToClipboard(`cmyk(${color.cmyk})`)}>{color.cmyk}</span></p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <h3>Typography</h3>
                <div className="typography-section">
                    <div className="typography-header">
                        <h4>Primary Font: Inter</h4>
                        <a href="https://fonts.google.com/specimen/Inter" target="_blank" rel="noopener noreferrer" className="button button-small">Download Font</a>
                    </div>
                    <p>Used for headlines and major calls to action.</p>
                    <p className="font-inter-bold">Aa - Bold Text</p>
                    <p className="font-inter-regular">Aa - Regular Text</p>
                </div>
                 <div className="typography-section">
                    <div className="typography-header">
                        <h4>Secondary Font: Inter</h4>
                         <a href="https://fonts.google.com/specimen/Inter" target="_blank" rel="noopener noreferrer" className="button button-small">Download Font</a>
                    </div>
                    <p>Used for body copy, paragraphs, and descriptions.</p>
                    <p className="font-inter-regular">The quick brown fox jumps over the lazy dog.</p>
                </div>
            </div>
            
            <div className="card">
                <h3>Logo Usage</h3>
                <div className="logo-usage-grid">
                    <div className="logo-usage-item">
                        <img src="https://i.imgur.com/gX33Y3G.png" alt="Logo on light background" className="logo-preview" />
                        <strong>✓ Do:</strong> Use on light backgrounds.
                    </div>
                    <div className="logo-usage-item">
                        <img src="https://i.imgur.com/G5g0j6F.png" alt="Logo on dark background" className="logo-preview-dark"/>
                        <strong>✓ Do:</strong> Use inverted on dark backgrounds.
                    </div>
                    <div className="logo-usage-item">
                         <img src="https://i.imgur.com/QhW1i8I.png" alt="Distorted logo" className="logo-preview"/>
                        <strong>✗ Don't:</strong> Distort or stretch the logo.
                    </div>
                    <div className="logo-usage-item">
                        <img src="https://i.imgur.com/qM1rxtB.png" alt="Recolored logo" className="logo-preview"/>
                        <strong>✗ Don't:</strong> Change the logo colors.
                    </div>
                </div>
            </div>
        </div>
    );
};

const AssetsPage = () => {
    const assets = [
        {
            category: 'Vector Logos',
            files: [
                { name: 'logo-primary.svg', size: '12 KB' },
                { name: 'logo-white.svg', size: '12 KB' },
                { name: 'favicon.svg', size: '8 KB' },
            ]
        },
        {
            category: 'Social Media Templates',
            files: [
                { name: 'instagram-post-template.psd', size: '5.2 MB' },
                { name: 'twitter-header-template.fig', size: '2.1 MB' },
            ]
        },
        {
            category: 'Brand Strategy PDF',
            files: [
                { name: 'Brandpreneur-Brand-Strategy.pdf', size: '1.8 MB' },
            ]
        }
    ];

    return (
        <div className="container">
            <h2>Asset Library</h2>
            <div className="card">
                <p>Download your brand assets here. Click a category to expand and view files.</p>
                <div className="assets-list">
                    {assets.map(cat => <AssetCategory key={cat.category} category={cat.category} files={cat.files} />)}
                </div>
                <button className="button">Download All (.zip)</button>
            </div>
        </div>
    );
};

const AssetCategory = ({ category, files }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="asset-category">
            <button className="asset-category-header" onClick={() => setIsOpen(!isOpen)}>
                <span>{category}</span>
                <span>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
                 <ul className="asset-file-list">
                    {files.map(file => (
                        <li key={file.name}>
                            <div className="file-info">
                                <span>📄</span> {file.name} <em>({file.size})</em>
                            </div>
                            <a href="#" className="button button-small">Download</a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

const ContactPage = () => {
    return (
        <div className="container">
            <h2>Contact Us</h2>
             <div className="card">
                <p>Have a question or a revision request? Fill out the form below and we'll get back to you within one business day.</p>
                <form className="contact-form">
                    <div className="form-group">
                        <label htmlFor="project-name">Project Name</label>
                        <select id="project-name" name="project-name">
                            <option>Brandpreneur Redesign</option>
                            <option>Marketing Campaign Q3</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="subject">Subject / Summary</label>
                        <input type="text" id="subject" name="subject" placeholder="e.g., Revision: Logo concept 1"/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select id="category" name="category">
                            <option>Design Revision</option>
                            <option>Content Request</option>
                            <option>Technical Issue</option>
                            <option>Billing Question</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="details">Details of Request</label>
                        {/* Fix: The `rows` attribute for a textarea in React expects a number, not a string. */}
                        <textarea id="details" name="details" rows={6} placeholder="Please provide as much detail as possible..."></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="attachment">Attachment (Optional)</label>
                        <input type="file" id="attachment" name="attachment"/>
                    </div>
                    <button type="submit" className="button">Submit Request</button>
                </form>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);