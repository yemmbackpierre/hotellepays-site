// components/ContactForm.tsx
import React from "react";
import {defaultContactData} from "@/app/types/hotelData";

const ContactForm = () => {
    const data = defaultContactData;

    return (
        <div className="contact-form">
            <div className="sec-title">
                <span className="sub-title before-none">Send us email</span>
                <h2>Feel free to write</h2>
            </div>

            <form id="contact_form" name="contact_form" action={data.formAction} method="post">
                <div className="row">
                    <div className="col-sm-6 mb-3">
                        <input name="form_name" className="form-control" type="text" placeholder="Enter Name" />
                    </div>
                    <div className="col-sm-6 mb-3">
                        <input name="form_email" className="form-control" type="email" placeholder="Enter Email" />
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-6 mb-3">
                        <input name="form_subject" className="form-control" type="text" placeholder="Enter Subject" />
                    </div>
                    <div className="col-sm-6 mb-3">
                        <input name="form_phone" className="form-control" type="text" placeholder="Enter Phone" />
                    </div>
                </div>

                <div className="mb-3">
                    <textarea name="form_message" className="form-control" rows={7} placeholder="Enter Message" />
                </div>

                <div className="mb-5">
                    <button type="submit" className="theme-btn-nine animation-box">
                        <span className="royle-btn__text">Send message</span>
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={`royle-btn__hover royle-btn__hover--${i + 1}`}></span>
                        ))}
                    </button>

                    <button type="reset" className="theme-btn-nine animation-box ml-3">
                        <span className="royle-btn__text">Reset</span>
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={`royle-btn__hover royle-btn__hover--${i + 1}`}></span>
                        ))}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactForm;
