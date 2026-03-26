"use client";

import React from "react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { id: "create", label: "Create", active: true },
    { id: "history", label: "History", active: false },
    { id: "settings", label: "Settings", active: false },
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.mobileHeader}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.menuButton} ${item.active ? styles.active : ""}`}
            onClick={onClose}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.status}>
          Status: <span className={styles.statusValue}>System Ready</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
