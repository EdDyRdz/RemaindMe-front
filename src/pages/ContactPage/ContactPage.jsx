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
          <div className="icon-circle">
            <i className="fab fa-whatsapp"></i>
          </div>
          <p>Whatsapp<br />ejemplo numérico</p>
        </div>
        <div className="icon-item">
          <div className="icon-circle">
            <i className="fab fa-facebook"></i>
          </div>
          <p>Facebook<br />ejemplo</p>
        </div>
        <div className="icon-item">
          <div className="icon-circle">
            <i className="fab fa-twitter"></i>
          </div>
          <p>Twitter<br />ejemplo</p>
        </div>
        <div className="icon-item">
          <div className="icon-circle">
            <i className="fas fa-globe"></i>
          </div>
          <p>Etc.<br />ejemplo</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
