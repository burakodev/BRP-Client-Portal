/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

type Page = 'Progress' | 'Guidelines' | 'Assets' | 'Contact';
type Theme = 'light' | 'dark';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

const Header = ({ activePage, setActivePage, theme, toggleTheme }: { activePage: Page, setActivePage: (page: Page) => void, theme: Theme, toggleTheme: () => void }) => {
    const pages: Page[] = ['Progress', 'Guidelines', 'Assets', 'Contact'];

    return (
        <header className="header">
            <div className="header-logo">
                Brandpreneur<span>.</span>
            </div>
            <nav className="nav">
                {pages.map(page => (
                    <a
                        key={page}
                        href="#"
                        className={`nav-link ${activePage === page ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setActivePage(page); }}
                    >
                        {page}
                    </a>
                ))}
                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
            </nav>
        </header>
    );
};

const ProgressPage = () => {
    const progressData = [
        {
            stage: 'Strategy', status: 'Complete', milestones: [
                { title: 'Initial Consultation', date: 'Completed: Aug 5, 2024', complete: true },
                { title: 'Strategy Questionnaire', date: 'Completed: Aug 10, 2024', complete: true },
                { title: 'Brand Strategy Delivery', date: 'Completed: Aug 15, 2024', complete: true },
            ]
        },
        {
            stage: 'Identity', status: 'Awaiting Feedback', milestones: [
                { title: 'Moodboard Presentation', date: 'Completed: Aug 20, 2024', complete: true },
                { title: 'Logo Concept Delivery', date: 'Awaiting Review', complete: false },
                { title: 'Final Logo Package', date: 'Est. Sep 5, 2024', complete: false },
            ]
        },
        {
            stage: 'Website', status: 'In Progress', milestones: [
                { title: 'Sitemap & Wireframes', date: 'Est. Sep 10, 2024', complete: false },
                { title: 'UI Design', date: 'Est. Sep 20, 2024', complete: false },
                { title: 'Development', date: 'Est. Oct 5, 2024', complete: false },
            ]
        },
        {
            stage: 'Launch', status: 'Not Started', milestones: [
                { title: 'Final Asset Delivery', date: 'TBD', complete: false },
                { title: 'Launch Support', date: 'TBD', complete: false },
            ]
        },
    ];

    return (
        <main className="container">
            <h1>Project Progress</h1>
            <div className="action-alert">
                <h3>Next Action Required</h3>
                <p>Please review the Logo Concepts delivered on Aug 20, 2024 and provide your feedback by Aug 25, 2024.</p>
            </div>
            <div className="progress-timeline">
                {progressData.map(item => (
                    <div className="card progress-stage" key={item.stage}>
                        <h3>
                            {item.stage}
                            <span className={`status-indicator status-${item.status.replace(' ', '-')}`}>{item.status}</span>
                        </h3>
                        <ul className="milestones-list">
                            {item.milestones.map(milestone => (
                                <li className={`milestone ${milestone.complete ? 'complete' : ''}`} key={milestone.title}>
                                    <div className="milestone-title">{milestone.title}</div>
                                    <div className="milestone-date">{milestone.date}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </main>
    );
};

const ColorSwatch = ({ name, hex, rgb, cmyk }: { name: string, hex: string, rgb: string, cmyk: string }) => {
    const [copied, setCopied] = useState('');

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(''), 2000);
    };

    return (
        <div className="color-swatch">
            <div className="color-display" style={{ backgroundColor: hex }}></div>
            <div className="color-info">
                <strong>{name}</strong><br />
                HEX: {hex} <button onClick={() => handleCopy(hex, 'hex')}>📋</button><br />
                RGB: {rgb} <button onClick={() => handleCopy(rgb, 'rgb')}>📋</button><br />
                CMYK: {cmyk} <button onClick={() => handleCopy(cmyk, 'cmyk')}>📋</button>
            </div>
            <div className="copy-feedback">
                {copied && `${copied.toUpperCase()} copied!`}
            </div>
        </div>
    );
}

const GuidelinesPage = () => {
    return (
        <main className="container">
            <h1>Brand Guidelines</h1>
            <div className="guidelines-grid">
                <div className="card">
                    <h2>Color Palette</h2>
                    <p>Use these colors to ensure brand consistency across all materials.</p>
                    <div className="color-palette">
                        <ColorSwatch name="Primary Pink" hex="#f90a79" rgb="249, 10, 121" cmyk="0, 96, 51, 2" />
                        <ColorSwatch name="Dark Blue" hex="#172b4d" rgb="23, 43, 77" cmyk="69, 44, 0, 70" />
                        <ColorSwatch name="Neutral Gray" hex="#5e6c84" rgb="94, 108, 132" cmyk="29, 18, 0, 48" />
                        <ColorSwatch name="Light BG" hex="#f4f5f7" rgb="244, 245, 247" cmyk="1, 1, 0, 3" />
                    </div>
                </div>
                <div className="card">
                    <h2>Typography</h2>
                    <p>Our brand uses 'Inter' for its clean and modern look.</p>
                    <div className="typography-example">
                        <h4>Primary Font: Inter Bold (Headlines)</h4>
                        <p style={{ fontWeight: 700, fontSize: '1.5rem' }}>This is a primary headline.</p>
                    </div>
                    <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--border-color)'}}/>
                    <div className="typography-example">
                        <h4>Secondary Font: Inter Regular (Body)</h4>
                        <p>This is for body copy. It's chosen for readability and should be used for paragraphs and longer text content.</p>
                    </div>
                </div>
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <h2>Logo Usage</h2>
                    <div className="logo-usage-grid">
                        <div className="logo-usage-item">
                           <div style={{fontSize: '3rem', fontWeight: 700, padding: '2rem', borderRadius: '8px', backgroundColor: 'var(--background-color)'}}>Brandpreneur<span style={{color: 'var(--accent-color)'}}>.</span></div>
                           <p className="do">✔️ Do: Use the full color logo on light backgrounds.</p>
                        </div>
                        <div className="logo-usage-item">
                           <div style={{fontSize: '3rem', fontWeight: 700, padding: '2rem', borderRadius: '8px', backgroundColor: '#172b4d', color: 'white'}}>Brandpreneur<span style={{color: 'var(--accent-color)'}}>.</span></div>
                           <p className="do">✔️ Do: Use the full color logo on dark backgrounds.</p>
                        </div>
                        <div className="logo-usage-item">
                           <div style={{fontSize: '3rem', fontWeight: 700, padding: '2rem', borderRadius: '8px', backgroundColor: 'var(--background-color)', transform: 'scale(0.8, 1.2)'}}>Brandpreneur<span style={{color: 'var(--accent-color)'}}>.</span></div>
                           <p className="dont">❌ Don't: Stretch or distort the logo.</p>
                        </div>
                        <div className="logo-usage-item">
                           <div style={{fontSize: '3rem', fontWeight: 700, padding: '2rem', borderRadius: '8px', backgroundColor: 'var(--background-color)'}}>Brand<span style={{color: 'var(--accent-color)'}}>.</span></div>
                           <p className="dont">❌ Don't: Alter or remove elements from the logo.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

// FIX: Made the `children` prop optional to resolve TypeScript errors. The
// type checker was failing to recognize the JSX children being passed to the
// component, causing a compilation failure. This change makes the prop
// optional in the type definition, satisfying the compiler without affecting
// the runtime behavior, as children are always provided in practice.
const AssetCategory = ({ title, children, defaultOpen = false }: { title: string, children?: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="asset-category">
            <div className="category-header" onClick={() => setIsOpen(!isOpen)}>
                <h3>{title}</h3>
                <span className={`toggle-icon ${isOpen ? 'open' : ''}`}>▼</span>
            </div>
            <ul className={`asset-list ${isOpen ? 'open' : ''}`}>
                {children}
            </ul>
        </div>
    );
}

const AssetsPage = () => {
    return (
        <main className="container">
            <h1>Assets Library</h1>
            <p>Download your final brand assets here. All files are organized into categories for your convenience.</p>
            <div className="card">
                <AssetCategory title="Vector Logos (AI, EPS, SVG)" defaultOpen={true}>
                    <li className="asset-item">
                        <div className="asset-info"><span>📄</span> Primary Logo</div>
                        <div className="asset-actions"><a href="#" download>Download All</a></div>
                    </li>
                    <li className="asset-item">
                        <div className="asset-info"><span>📄</span> Wordmark</div>
                        <div className="asset-actions"><a href="#" download>Download</a></div>
                    </li>
                </AssetCategory>
                <AssetCategory title="Raster Logos (PNG, JPG)">
                    <li className="asset-item">
                        <div className="asset-info"><span>🖼️</span> Primary Logo (Color, Transparent BG)</div>
                        <div className="asset-actions"><a href="#">Preview</a><a href="#" download>Download</a></div>
                    </li>
                    <li className="asset-item">
                        <div className="asset-info"><span>🖼️</span> Primary Logo (White, Transparent BG)</div>
                        <div className="asset-actions"><a href="#">Preview</a><a href="#" download>Download</a></div>
                    </li>
                </AssetCategory>
                <AssetCategory title="Brand Strategy">
                    <li className="asset-item">
                        <div className="asset-info"><span>📊</span> Brand Strategy Deck.pdf</div>
                        <div className="asset-actions"><a href="#">Preview</a><a href="#" download>Download</a></div>
                    </li>
                </AssetCategory>
            </div>
        </main>
    );
};

const ContactPage = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Your request has been submitted!');
        (e.target as HTMLFormElement).reset();
    };

    return (
        <main className="container">
            <h1>Contact Us</h1>
            <p>Have a question or a revision request? Fill out the form below and we'll get back to you shortly.</p>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="projectName">Project Name</label>
                        <select id="projectName" className="form-control" required>
                            <option>Brand Identity & Website</option>
                            <option>Social Media Campaign</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="subject">Subject / Summary</label>
                        <input type="text" id="subject" className="form-control" required placeholder="e.g., Revision: Logo concept 1" />
                    </div>
                     <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select id="category" className="form-control" required>
                            <option>Design Revision</option>
                            <option>Content Request</option>
                            <option>Technical Issue</option>
                            <option>Billing Question</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="details">Details of Request</label>
                        <textarea id="details" className="form-control" required></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="attachment">Attachment (Optional)</label>
                        <input type="file" id="attachment" className="form-control" />
                    </div>
                    <button type="submit" className="btn">Submit Request</button>
                </form>
            </div>
        </main>
    );
};

const App = () => {
    const [activePage, setActivePage] = useState<Page>('Progress');
    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return (storedTheme as Theme) || (prefersDark ? 'dark' : 'light');
    });

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const renderPage = () => {
        switch (activePage) {
            case 'Progress': return <ProgressPage />;
            case 'Guidelines': return <GuidelinesPage />;
            case 'Assets': return <AssetsPage />;
            case 'Contact': return <ContactPage />;
            default: return <ProgressPage />;
        }
    };

    return (
        <>
            <Header activePage={activePage} setActivePage={setActivePage} theme={theme} toggleTheme={toggleTheme} />
            {renderPage()}
        </>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
