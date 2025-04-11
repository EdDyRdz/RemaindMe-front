import React from "react";
import { useLocation } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Contact.css';

const ContactPage = () => {
    const location = useLocation();
  return (
    <div className="contact-container">
      <h2 className="contact-title">Para mayor información</h2>
      <p className="contact-text">
        Nos importa tu satisfacción, por ello te ponemos las herramientas para solucionar
        cualquier duda o dificultad que tengas.
      </p>
      <div className="contact-icons">
        <div className="icon-item">
          <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
            <div className="icon-circle">
              <i className="fab fa-whatsapp"></i>
            </div>
          </a>
          <p>Whatsapp<br />+1 (234) 567-890</p>
        </div>
        <div className="icon-item">
          <a href="https://facebook.com/ejemploempresa" target="_blank" rel="noopener noreferrer">
            <div className="icon-circle">
              <i className="fab fa-facebook"></i>
            </div>
          </a>
          <p>Facebook<br />@ejemploempresa</p>
        </div>
        <div className="icon-item">
          <a href="https://twitter.com/ejemploempresa" target="_blank" rel="noopener noreferrer">
            <div className="icon-circle">
              <i className="fab fa-twitter"></i>
            </div>
          </a>
          <p>Twitter<br />@ejemploempresa</p>
        </div>
        <div className="icon-item">
          <a href="https://www.ejemploempresa.com" target="_blank" rel="noopener noreferrer">
            <div className="icon-circle">
              <i className="fas fa-globe"></i>
            </div>
          </a>
          <p>Sitio Web<br />www.ejemploempresa.com</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;