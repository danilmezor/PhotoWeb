import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import '../styles/About.css';

const About = () => {
    const form = useRef();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(false);
        setSuccess(false);

        // REPLACE THESE WITH YOUR ACTUAL KEYS FROM EMAILJS
        const SERVICE_ID = 'service_e5sxeph';
        const TEMPLATE_ID = 'template_rv5wo28';
        const PUBLIC_KEY = 'cdSKJ_oUwCU1ORaor';

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
            .then((result) => {
                setSuccess(true);
                setLoading(false);
                form.current.reset();
            }, (error) => {
                console.error(error.text);
                setError(true);
                setLoading(false);
            });
    };

    return (
        <motion.div
            className="about-page container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="about-content">
                <motion.div
                    className="about-text"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <h1>About Me</h1>
                    <p className="bio-intro">
                        Hi, I'm Danil—a photographer with over 10 years of experience capturing the world through my lens.
                    </p>
                    <p>
                        For much of my career, I worked as a professional photographer, shooting events, advertising campaigns, social media content, and everything in between. Photography taught me how to see the world differently, how to find beauty in unexpected moments, and how to tell compelling stories through images.
                    </p>
                    <p>
                        Today, I work as a Data Science and Machine Learning Engineer, but photography remains my passion. This website is a personal collection of work I've created over the years in my free time—a way to share my journey with the world. These days, my focus has shifted toward landscapes and visual storytelling, exploring the quiet moments and vast spaces that inspire me.
                    </p>
                    <p>
                        I'm still available for freelance projects and collaborations, and I'd be incredibly grateful for any support of my work here.
                    </p>

                    <div className="contact-section">
                        <h2>Get in Touch</h2>
                        <form className="contact-form" ref={form} onSubmit={sendEmail}>
                            <div className="form-group">
                                <input type="text" name="user_name" placeholder="Name" required />
                            </div>
                            <div className="form-group">
                                <input type="email" name="user_email" placeholder="Email" required />
                            </div>
                            <div className="form-group">
                                <textarea name="message" placeholder="Message" rows="5" required></textarea>
                            </div>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                            {success && <p className="form-status success">Message sent successfully!</p>}
                            {error && <p className="form-status error">Failed to send message. Please try again.</p>}
                        </form>
                    </div>

                    <div className="donation-section">
                        <h3>Support My Work</h3>
                        <p className="donation-intro">If you enjoy my photography and would like to support my work, you can send a donation via cryptocurrency.</p>
                        <div className="crypto-addresses">
                            <div className="crypto-item">
                                <span className="crypto-label">ETH (ERC20, L2):</span>
                                <code className="crypto-address">0x148f3798672dba6f647d079722cdcb956e5ac8d7</code>
                            </div>
                            <div className="crypto-item">
                                <span className="crypto-label">Bitcoin:</span>
                                <code className="crypto-address">bc1qy7fr7g0ruhw32x8fevj5u2540379te0ur9qaj2</code>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="about-image"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    <img
                        src="https://res.cloudinary.com/dmqhswybd/image/upload/v1764465263/000245650034_dxxma4.jpg"
                        alt="Portrait of photographer"
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default About;
