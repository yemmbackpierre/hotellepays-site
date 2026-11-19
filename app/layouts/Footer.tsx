import React from "react";
import {footerData} from "@/app/types/hotelData";
import WhatsappFloatingButton from "@/app/components/WhatsappFloatingButton";
import Chatbot from "@/app/components/chatbot/Chatbot";

const Footer: React.FC = () => {
    return (
        <footer className="main-footer footer-style-one">
            <WhatsappFloatingButton />

            {/*  <Chatbot /> */}
            <div className="wrapper">
                <div className="container">
                    <div className="widgets-section">
                        <div className="row">

                            {/* Logo + Description + Social */}
                            <div className="footer-column col-xl-3 col-lg-3 col-sm-6">
                                <div className="footer-widget">
                                    <div className="logo">
                                        <a href="#"><img src={footerData.logo} alt="logo"/></a>
                                    </div>
                                    <div className="widget-content">
                                        <div className="text mb-0">{footerData.description}</div>
                                    </div>
                                </div>
                                <div className="footer-widget widget-social">
                                    <div className="widget-content mt-40">
                                        <ul className="social-icon">
                                            {footerData.socialLinks.map((item, index) => (
                                                <li key={index}>
                                                    <a href={item.link}><i className={item.icon}></i></a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="footer-column col-xl-2 col-lg-3 col-sm-6">
                                <div className="footer-widget links-widget">
                                    <h4 className="widget-title">Liens rapides</h4>
                                    <div className="widget-content ml-20">
                                        <ul className="user-links">
                                            {footerData.quickLinks.map((link, index) => (
                                                <li key={index}><a href={link.link}>{link.title}</a></li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Support Links */}
                            <div className="footer-column col-xl-4 col-lg-4 col-sm-6">
                                <div className="footer-widget links-widget">
                                    <h4 className="widget-title">Legales</h4>
                                    <div className="widget-content ml-20">
                                        <ul className="user-links">
                                            {footerData.supportLinks.map((link, index) => (
                                                <li key={index}><a href={link.link}>{link.title}</a></li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="footer-column col-xl-3 col-lg-3 col-sm-6">
                                <div className="footer-widget info-widget">
                                    <h4 className="widget-title">Contact</h4>
                                    <div className="widget-content">
                                        <div className="contact-list">
                                            <div className="inner">
                                                <div className="list-info">
                                                    <a href={`tel:${footerData.contact.phone}`}>
                                                        <i className="fa-regular fa-phone-volume"></i> {footerData.contact.phone}
                                                    </a>
                                                </div>
                                                <div className="list-info">
                                                    <a href={`https://wa.me/${footerData.contact.whatsapp}`}>
                                                        <i className="fa fa-whatsapp"></i> {footerData.contact.phone}
                                                    </a>
                                                </div>
                                                <div className="list-info">
                                                    {footerData.contact.address}
                                                    <i className="fa-light fa-location-dot"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="auto-container">
                        <div className="row">
                            <div className="col-xl-5 col-lg-4">
                                <div className="footer-bottom-widget">
                                    <div className="footer-bottom-widget-text copyright-text text-center text-lg-start">
                                        {footerData.copyright}
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4">
                                <div className="footer-bottom-widget" title={footerData.createdByTitle}>
                                    <div className="footer-bottom-widget-text"><a href={footerData.createdByEmail}>{footerData.createdBy}</a></div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-4">
                                <div className="footer-bottom-widget">
                                    <div className="footer-bottom-widget-text back-to-top text-center text-lg-end">
                                        <a href="#">Back to top <span><i className="fa-regular fa-arrow-up"></i></span></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
