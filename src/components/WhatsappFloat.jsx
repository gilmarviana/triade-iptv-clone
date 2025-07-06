import React from 'react';
import './WhatsappFloat.css';

const whatsappNumber = '5519998305956';
const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Ol%C3%A1,%20Gostaria%20de%20testar%20o%20Barato%20IPTV!`;

const WhatsappFloat = () => (
  <a
    href={whatsappLink}
    className="whatsapp-float"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Fale conosco no WhatsApp"
  >
    <span className="whatsapp-float-icon">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="19" cy="19" r="19" fill="#25D366"/>
        <path d="M28.5 21.5c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.5-.2-.7.2-.2.4-.8 1.2-1 1.4-.2.2-.4.3-.8.1-.4-.2-1.7-.6-3.2-2-1.2-1.1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.4.6-.6.2-.2.2-.4.3-.6.1-.2.1-.4 0-.6-.1-.2-.7-1.7-1-2.3-.3-.6-.6-.5-.8-.5-.2 0-.4 0-.6 0-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9 0 1.7 1.2 3.3 1.4 3.5.2.2 2.3 3.6 5.7 4.9.8.3 1.4.5 1.9.6.8.2 1.5.2 2 .1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.1-.4-.2-.8-.4z" fill="#fff"/>
      </svg>
    </span>
    <span className="whatsapp-float-message-inside">Gostaria de Testar nosso IPTV?</span>
  </a>
);

export default WhatsappFloat; 