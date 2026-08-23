import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import '../styles/ContactForm.css';

// Shared EmailJS contact form, rendered on /about and /license.
//
// `source` is submitted as a hidden field so the two pages arrive
// distinguishable in the inbox — a licensing request needs a different reply
// than a general hello. Add {{source}} to the EmailJS template to surface it;
// until then the field is simply carried and ignored, so this is safe to ship
// before the template is updated.

const SERVICE_ID = 'service_e5sxeph';
const TEMPLATE_ID = 'template_rv5wo28';
const PUBLIC_KEY = 'cdSKJ_oUwCU1ORaor';

const ContactForm = ({
    heading = 'Get in Touch',
    source = 'General',
    messagePlaceholder = 'Message',
}) => {
    const form = useRef();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(false);
        setSuccess(false);

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
            .then(() => {
                setSuccess(true);
                setLoading(false);
                form.current.reset();
            }, (err) => {
                console.error(err.text);
                setError(true);
                setLoading(false);
            });
    };

    return (
        <div className="contact-section">
            <h2>{heading}</h2>
            <form className="contact-form" ref={form} onSubmit={sendEmail}>
                <input type="hidden" name="source" value={source} />
                <div className="form-group">
                    <input type="text" name="user_name" placeholder="Name" required />
                </div>
                <div className="form-group">
                    <input type="email" name="user_email" placeholder="Email" required />
                </div>
                <div className="form-group">
                    <textarea name="message" placeholder={messagePlaceholder} rows="5" required></textarea>
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                </button>
                {/* Always-mounted live region: a container that appears only on
                    success wouldn't be announced by screen readers. */}
                <div aria-live="polite">
                    {success && <p className="form-status success">Message sent successfully!</p>}
                    {error && <p className="form-status error">Failed to send message. Please try again.</p>}
                </div>
            </form>
        </div>
    );
};

export default ContactForm;
