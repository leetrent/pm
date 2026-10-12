'use client';

import React from 'react';
import { Columns3, CheckSquare2 } from 'lucide-react';

interface HeaderProps {
  totalColumns: number;
  totalCards: number;
}

export function Header({ totalColumns, totalCards }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-brand">
          <span className="header-badge">PM Board</span>
          <div>
            <h1 className="header-title" id="main-heading">Project Management Board</h1>
            <p className="header-subtitle">Single Board Workflow &amp; Delivery</p>
          </div>
        </div>
        <div className="header-meta">
          <div className="meta-pill" data-testid="meta-columns">
            <Columns3 size={15} color="#209dd7" />
            <span><strong>{totalColumns}</strong> Columns</span>
          </div>
          <div className="meta-pill" data-testid="meta-cards">
            <CheckSquare2 size={15} color="#ecad0a" />
            <span><strong>{totalCards}</strong> Cards</span>
          </div>
        </div>
      </div>
    </header>
  );
}
