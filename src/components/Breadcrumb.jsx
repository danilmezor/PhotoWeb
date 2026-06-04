import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Breadcrumb.css';

// items: [{ name: 'Home', path: '/' }, ...]. The last item is rendered as
// plain text (the current page) — it doesn't link anywhere.
const Breadcrumb = ({ items }) => {
    if (!items || items.length === 0) return null;
    return (
        <nav className="breadcrumb" aria-label="Breadcrumb">
            {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                    <React.Fragment key={item.path || item.name}>
                        {isLast ? (
                            <span className="breadcrumb-current" aria-current="page">{item.name}</span>
                        ) : (
                            <Link to={item.path} className="breadcrumb-link">{item.name}</Link>
                        )}
                        {!isLast && <span className="breadcrumb-sep">/</span>}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumb;
