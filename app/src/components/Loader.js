import React from 'react';

const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="Loader text-center py-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">{text}</p>
        </div>
    );
};

export default Loader;
