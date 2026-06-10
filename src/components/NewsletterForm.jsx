import React, { useState } from 'react';
import '../styles/NewsletterForm.css';

// Custom-styled subscribe form that posts directly to MailerLite's public
// embedded-form endpoint — no backend, no secret. The account/form IDs are
// public values (safe in client code), read from env.
//
// MailerLite returns an opaque response under `no-cors`, so we can't read the
// status; we optimistically show success and let MailerLite handle the rest
// (it sends the double opt-in confirmation email). This is the standard
// static-site integration pattern.
//
// variant: 'inline' (compact row, e.g. footer) | 'card' (block with heading,
// e.g. end of a blog post).

const ACCOUNT_ID = import.meta.env.VITE_MAILERLITE_ACCOUNT_ID;
const FORM_ID = import.meta.env.VITE_MAILERLITE_FORM_ID;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NewsletterForm = ({ variant = 'inline' }) => {
    const [email, setEmail] = useState('');
    const [state, setState] = useState('idle'); // idle | loading | success | error

    const configured = Boolean(ACCOUNT_ID && FORM_ID);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (state === 'loading') return;

        const value = email.trim();
        if (!EMAIL_RE.test(value)) {
            setState('error');
            return;
        }
        if (!configured) {
            // Misconfigured env — fail loudly in dev, gracefully in prod.
            if (import.meta.env.DEV) {
                console.warn('[newsletter] VITE_MAILERLITE_ACCOUNT_ID / VITE_MAILERLITE_FORM_ID are not set.');
            }
            setState('error');
            return;
        }

        setState('loading');
        try {
            await fetch(
                `https://assets.mailerlite.com/jsonp/${ACCOUNT_ID}/forms/${FORM_ID}/subscribe`,
                {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    // Mirror the fields MailerLite's own embedded form submits.
                    body: new URLSearchParams({
                        'fields[email]': value,
                        'ml-submit': '1',
                        anticsrf: 'true',
                    }).toString(),
                }
            );
            // Opaque response under no-cors — treat a completed request as success.
            setState('success');
            setEmail('');
        } catch {
            setState('error');
        }
    };

    if (state === 'success') {
        return (
            <div className={`newsletter newsletter--${variant} newsletter--done`}>
                <p className="newsletter-status success">
                    Thanks — check your inbox to confirm your subscription.
                </p>
            </div>
        );
    }

    return (
        <div className={`newsletter newsletter--${variant}`}>
            {variant === 'card' && (
                <div className="newsletter-pitch">
                    <h3 className="newsletter-heading">Get new posts by email</h3>
                    <p className="newsletter-sub">
                        Occasional field notes and trip guides — new photo essays straight to your inbox. No spam,
                        unsubscribe anytime.
                    </p>
                </div>
            )}
            <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
                <label className="newsletter-label" htmlFor={`newsletter-email-${variant}`}>
                    Email address
                </label>
                <div className="newsletter-row">
                    <input
                        id={`newsletter-email-${variant}`}
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (state === 'error') setState('idle');
                        }}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="newsletter-input"
                    />
                    <button type="submit" className="newsletter-btn" disabled={state === 'loading'}>
                        {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
                    </button>
                </div>
                {state === 'error' && (
                    <p className="newsletter-status error">
                        Please enter a valid email and try again.
                    </p>
                )}
            </form>
        </div>
    );
};

export default NewsletterForm;
