import React from 'react';
import { DEMO_CONTACTS } from '../utils/storage';
import { UserPlus } from 'lucide-react';

export const QuickContacts = ({ onSelectContact, onNewContact }) => {
  return (
    <div className="quick-contacts-section">
      <div className="section-header">
        <h3 className="section-title">Quick Demo Contacts</h3>
        <span className="section-subtitle">Tap to send</span>
      </div>
      <div className="contacts-scroll-row">
        <button className="contact-avatar-btn new" onClick={onNewContact}>
          <div className="avatar-circle new">
            <UserPlus size={18} />
          </div>
          <span className="contact-name">New UPI</span>
        </button>

        {DEMO_CONTACTS.map((c) => (
          <button
            key={c.upiId}
            className="contact-avatar-btn"
            onClick={() => onSelectContact(c)}
          >
            <div 
              className="avatar-circle"
              style={{ backgroundColor: c.avatarColor }}
            >
              {c.name.charAt(0)}
            </div>
            <span className="contact-name">{c.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
