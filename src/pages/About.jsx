import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import ContactForm from '../components/ContactForm';
import { SITE_AUTHOR, SITE_NAME, SOCIAL_PROFILES, buildBreadcrumbs, toAbsoluteUrl } from '../utils/site';
import '../styles/About.css';

const About = () => {
    const portraitImage = '/photos/000245650034.jpg';
    const aboutDescription = 'Learn more about Danil Zanozin, a photographer and machine learning engineer sharing personal work across landscapes, cities, events, and people.';
    const personJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: SITE_AUTHOR,
        description: aboutDescription,
        url: toAbsoluteUrl('/about'),
        image: toAbsoluteUrl(portraitImage),
        sameAs: SOCIAL_PROFILES,
        worksFor: {
            '@type': 'Organization',
            name: SITE_NAME,
        },
    };
    const breadcrumbsJsonLd = buildBreadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
    ]);

    return (
        <motion.div
            className="about-page container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <SEO
                title="About Danil Zanozin — Photographer & ML Engineer"
                description={aboutDescription}
                path="/about"
                image={portraitImage}
                jsonLd={[personJsonLd, breadcrumbsJsonLd]}
            />
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
                        Curious about my engineering work? You can find it on my{' '}
                        <a
                            href="https://danilzanozin.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            personal portfolio at danilzanozin.dev
                        </a>.
                    </p>


                    <ContactForm source="About page" />

                </motion.div>

                <motion.div
                    className="about-image"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    <img
                        src={portraitImage}
                        alt="Portrait of photographer Danil Zanozin"
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default About;
