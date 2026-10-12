'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface CardModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialTitle?: string;
  initialDetails?: string;
  columnTitle?: string;
  onSave: (title: string, details: string) => void;
  onClose: () => void;
}

export function CardModal({
  isOpen,
  mode,
  initialTitle = '',
  initialDetails = '',
  columnTitle,
  onSave,
  onClose,
}: CardModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [details, setDetails] = useState(initialDetails);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setDetails(initialDetails);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialTitle, initialDetails]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), details.trim());
    onClose();
  };

  const modalHeading =
    mode === 'add'
      ? columnTitle
        ? `Add Card to ${columnTitle}`
        : 'Add New Card'
      : 'Edit Card';

  return (
    <div
      className="modal-overlay"
      data-testid="card-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-header-accent" />
        <div className="modal-header">
          <h2 className="modal-title" data-testid="modal-title">
            {modalHeading}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            data-testid="modal-close-button"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="card-title-input" className="form-label">
                Card Title
              </label>
              <input
                id="card-title-input"
                ref={inputRef}
                type="text"
                className="form-input"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="modal-title-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="card-details-input" className="form-label">
                Card Details
              </label>
              <textarea
                id="card-details-input"
                className="form-textarea"
                placeholder="Enter card details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                data-testid="modal-details-input"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              data-testid="modal-cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!title.trim()}
              data-testid="modal-submit-button"
            >
              {mode === 'add' ? 'Add Card' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
