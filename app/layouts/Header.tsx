"use client";

import React from "react";
import { defaultheaderData } from "@/app/types/hotelData";

function Header() {
    const headerData = defaultheaderData;

    // 🔹 MÊME PRINCIPE DE RENDER QUE TON CODE
    const renderMenu = (menu: any[], parentKey: string = "") =>
        menu.map((item, idx) => {
            const key = parentKey ? `${parentKey}-${idx}` : `${idx}`;
            const hasSub = item.subMenu && item.subMenu.length > 0;

            return (
                <li key={key} className={hasSub ? "dropdown" : ""}>
                    <a href={item.link}>{item.title}</a>

                    {hasSub && (
                        <ul>
                            {item.subMenu.map((sub: any, subIdx: number) =>
                                renderMenu([sub], `${key}-${subIdx}`)
                            )}
                        </ul>
                    )}
                </li>
            );
        });

    return (
        <header className="main-header header-style-one">
            <div className="container">
                <div className="row">
                    <div className="col-xl-12">
                        <div className="main-box">
                            {/* Logo */}
                            <div className="header-logo">
                                <a href="/">
                                    <img src={headerData.logo} alt="logo" />
                                </a>
                            </div>

                            {/* Menu Desktop */}
                            <div className="header-menu">
                                <div className="nav-outer">
                                    <nav className="nav main-menu">
                                        <ul className="navigation">
                                            {renderMenu(headerData.menu)}
                                        </ul>
                                    </nav>
                                </div>
                            </div>

                            {/* Bouton + toggler mobile */}
                            <div className="header-right d-flex align-items-center">
                                <div className="header-button d-none d-md-block">
                                    <a className="theme-btn-main" href={headerData.button.link}>
                    <span className="theme-btn-arrow-left">
                      <img src={headerData.button.arrowIcon} alt="arrow" />
                    </span>
                                        <span className="theme-btn">{headerData.button.text}</span>
                                        <span className="theme-btn-arrow-right">
                      <img src={headerData.button.arrowIcon} alt="arrow" />
                    </span>
                                    </a>
                                </div>

                                {/* ⚠️ jQuery capte ce bouton */}
                                <div className="mobile-nav-toggler">
                                    <span className="icon fal fa-bars"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= MOBILE MENU ================= */}
            <div className="mobile-menu">
                <div className="menu-backdrop"></div>

                <nav className="menu-box">
                    <div className="upper-box">
                        <div className="nav-logo">
                            <a href="/">
                                <img src={headerData.logoMobile} alt="logo" />
                            </a>
                        </div>
                        <div className="close-btn">
                            <i className="icon fa fa-times"></i>
                        </div>
                    </div>

                    {/* Menu injecté par jQuery MAIS fallback React OK */}
                    <ul className="navigation clearfix">
                        {renderMenu(headerData.menu)}
                    </ul>

                    {/* Contact */}
                    <ul className="contact-list-one">
                        {headerData.contactInfo.map((info, idx) => (
                            <li key={idx}>
                                <div className="contact-info-box">
                                    {info.type === "phone" && <i className="icon lnr-icon-phone-handset"></i>}
                                    {info.type === "email" && <span className="icon lnr-icon-envelope1"></span>}
                                    {info.type === "hours" && <span className="icon lnr-icon-clock"></span>}
                                    <span className="title">{info.title}</span>
                                    {info.link ? <a href={info.link}>{info.value}</a> : <span>{info.value}</span>}
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Social */}
                    <ul className="social-links">
                        {headerData.socialLinks.map((s, idx) => (
                            <li key={idx}>
                                <a href={s.link}>
                                    <i className={s.icon}></i>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Search Popup */}
                <div className="search-popup">
                    <span className="search-back-drop" ></span>
                    <button className="close-search" >
                        <span className="fa fa-times"></span>
                    </button>
                    <div className="search-inner">
                        <form method="post" action="#">
                            <div className="form-group">
                                <input type="search" name="search-field" placeholder="Search..." required />
                                <button type="submit">
                                    <i className="fa fa-search"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>


            {/* Sticky Header */}
                <div className="sticky-header">
                    <div className="auto-container">
                        <div className="inner-container d-flex justify-content-between align-items-center">
                            <div className="logo">
                                <a href="/">
                                    <img src={headerData.logoSticky} alt="sticky logo" />
                                </a>
                            </div>
                            <div className="nav-outer">
                                <nav className="main-menu">
                                    <ul className="navigation clearfix"></ul>
                                </nav>

                                <div className="mobile-nav-toggler">
                                    <span className="icon fal fa-bars"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

        </header>
    );
}

export default Header;
