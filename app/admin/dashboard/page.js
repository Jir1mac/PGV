"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
    const router = useRouter();
    const ADMIN_SESSION_KEY = "pgv-admin";
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const adminData = sessionStorage.getItem(ADMIN_SESSION_KEY);
        if (!adminData) {
            router.replace("/admin");
        } else {
            try {
                setAdmin(JSON.parse(adminData));
            } catch {
                router.replace("/admin");
            }
        }
    }, [router]);

    const handleLogout = () => {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        router.push("/");
    };

    if (!admin) return null;

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="brand">
                    <ShieldIcon />
                    <span>Admin Panel</span>
                </div>

                <div className="nav">
                    <SidebarLink href="/admin/dashboard/videos" label="Správa videí">
                        <VideoIcon />
                    </SidebarLink>

                    <SidebarLink href="/admin/dashboard/articles" label="Správa článků">
                        <ArticleIcon />
                    </SidebarLink>

                    <SidebarLink href="/admin/dashboard/messages" label="Správa vzkazů">
                        <MessageIcon />
                    </SidebarLink>
                </div>

                <button className="logout" onClick={handleLogout}>
                    Odhlásit
                </button>
            </aside>

            <main className="content">
                <h1 className="title">Dashboard</h1>
                <p className="welcome">Vítej, {admin.username}!</p>

                <div className="cards">
                    <Card href="/admin/dashboard/videos" label="Správa videí">
                        <VideoIcon />
                    </Card>

                    <Card href="/admin/dashboard/articles" label="Správa článků">
                        <ArticleIcon />
                    </Card>

                    <Card href="/admin/dashboard/messages" label="Správa vzkazů">
                        <MessageIcon />
                    </Card>
                </div>
            </main>

            {/* STYLY */}
            <style jsx global>{`
        :root {
          --bg: #f3f6fa;
          --panel: #ffffff;
          --text: #1e293b;
          --muted: #64748b;
          --brand: #3b82f6;
          --border: #e2e8f0;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
        }

        .layout {
          display: grid;
          grid-template-columns: 230px 1fr;
          height: 100vh;
        }

        /* SIDEBAR */
        .sidebar {
          background: var(--panel);
          border-right: 1px solid var(--border);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 18px;
        }

        .nav {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 20px;
        }

        .navLink {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          color: var(--text);
          transition: 0.2s;
        }

        .navLink:hover {
          background: var(--brand);
          color: white;
        }

        .logout {
          margin-top: 20px;
          border: none;
          background: #e11d48;
          color: white;
          padding: 10px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.2s;
        }

        .logout:hover {
          background: #be123c;
        }

        /* MAIN CONTENT */
        .content {
          padding: 32px;
        }

        .title {
          font-size: 28px;
          margin: 0;
        }

        .welcome {
          color: var(--muted);
          margin-top: 4px;
          margin-bottom: 28px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .card {
          background: var(--panel);
          border: 1px solid var(--border);
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: 0.2s;
          text-align: center;
          cursor: pointer;
        }

        .card:hover {
          border-color: var(--brand);
          transform: translateY(-3px);
        }

        .card svg {
          width: 48px;
          height: 48px;
          color: var(--brand);
        }

        .cardLabel {
          margin-top: 12px;
          font-weight: 600;
        }
      `}</style>
        </div>
    );
}

/* COMPONENTS */
function SidebarLink({ href, label, children }) {
    return (
        <Link href={href} className="navLink">
            {children}
            {label}
        </Link>
    );
}

function Card({ href, label, children }) {
    return (
        <Link href={href} className="card">
            {children}
            <div className="cardLabel">{label}</div>
        </Link>
    );
}

/* SVG ICONS – malé, decentní, profesionální */
function ShieldIcon() {
    return (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s7-4 7-10V6l-7-3-7 3v6c0 6 7 10 7 10z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}

function VideoIcon() {
    return (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="12" height="14" rx="2" />
            <path d="M15 9l6-3v12l-6-3z" />
        </svg>
    );
}

function ArticleIcon() {
    return (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2z" />
            <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
    );
}

function MessageIcon() {
    return (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
    );
}
