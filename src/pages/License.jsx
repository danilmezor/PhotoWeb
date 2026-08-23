import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import ContactForm from '../components/ContactForm';
import { SITE_AUTHOR, buildBreadcrumbs, toAbsoluteUrl } from '../utils/site';
import '../styles/License.css';

// The page every photo's JSON-LD points at via `license` and
// `acquireLicensePage`. Google requires the former to describe the terms
// governing use and accepts a contact route for the latter, which is why the
// form is rendered inline here rather than linking off to /about.

const licenseDescription =
    'How to use photographs by Danil Zanozin: all rights reserved, licensed on request for editorial and non-commercial use, with credit and a link.';

const License = () => {
    const pageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Licensing & Use',
        description: licenseDescription,
        url: toAbsoluteUrl('/license'),
        about: {
            '@type': 'CreativeWork',
            name: `Photographs by ${SITE_AUTHOR}`,
            copyrightHolder: { '@type': 'Person', name: SITE_AUTHOR },
        },
    };

    const breadcrumbsJsonLd = buildBreadcrumbs([
        { name: 'Home', path: '/' },
        { name: 'Licensing & Use', path: '/license' },
    ]);

    return (
        <motion.div
            className="license-page container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <SEO
                title="Licensing & Use"
                description={licenseDescription}
                path="/license"
                jsonLd={[pageJsonLd, breadcrumbsJsonLd]}
            />

            <div className="license-content">
                <h1>Licensing &amp; Use</h1>

                <p className="license-lede">
                    I license these photographs on request, and I say yes more often
                    than not.
                </p>

                <p>
                    That goes especially for trail organisations, park nonprofits,
                    tourism boards, and anyone writing something genuine about these
                    places. Tell me which photograph and where it'll appear; I usually
                    reply within the week.
                </p>

                <h2>When I say yes, this is what comes with it</h2>

                <ol className="license-terms">
                    <li>
                        <strong>Credit, exactly:</strong>
                        <code className="license-credit">Photo: Danil Zanozin — danilzanozin.com</code>
                    </li>
                    <li>
                        <strong>Linked</strong>, to the photograph's own page or to the site
                        root. Mark it <code>rel="nofollow"</code> if your policy requires —
                        no objection here.
                    </li>
                    <li>
                        <strong>Crop and resize freely</strong> to fit your layout. No
                        filters, recolouring, compositing, or text and logos over the image.
                    </li>
                    <li>
                        <strong>The yes covers the placement we discussed</strong> — not
                        redistribution, resale, or adding the file to a stock or media
                        library.
                    </li>
                    <li>
                        <strong>No use for training</strong>, fine-tuning or evaluating
                        machine-learning models, and no inclusion in a dataset.
                    </li>
                    <li>
                        <strong>Permission is revocable</strong>, and doesn't transfer if the
                        site it appears on is sold or syndicated.
                    </li>
                    <li>
                        <strong>I'm licensing my copyright only.</strong> No model, property
                        or trademark release is granted or implied — where people or private
                        property appear, clearing that is yours.
                    </li>
                </ol>

                <h2>Needs a different conversation</h2>
                <p>
                    Advertising, packaging, merchandise, or anything that sells or promotes
                    a product, service or brand. Still ask — just say what it's for.
                </p>

                <h2>Prints</h2>
                <p>
                    Not selling them at the moment. If you want one on a wall, write anyway;
                    I'd rather hear it than not.
                </p>

                <h2>Seen one of mine somewhere uncredited?</h2>
                <p>I'd like to know.</p>

                <p className="license-notice">
                    All photographs © {new Date().getFullYear()} Danil Zanozin.
                    All rights reserved.
                </p>

                <ContactForm
                    heading="Ask about a photograph"
                    source="Licensing enquiry"
                    messagePlaceholder="Which photograph, and where will it appear?"
                />
            </div>
        </motion.div>
    );
};

export default License;
