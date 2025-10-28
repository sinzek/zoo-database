import React from 'react';

import membershipData from '../../data/membership'; 
import { Link } from '../../components/link'; 
import './membership.css';

const MembershipDetailPage = ({ id }) => {
    

    const membershipItem = membershipData.find(
        (item) => item.id === id
    );


    if (!membershipItem) {
        return (
            <div className="membership-detail-page">
                <div className="detail-content-wrapper">
                    <h1>Membership Not Found</h1>
                    <p>The requested membership level could not be found.</p>
                    <Link to="/membership" className="back-link">Return to All Memberships</Link>
                </div>
            </div>
        );
    }


    return (
        <div className="membership-detail-page">
            <div className="detail-content-wrapper">
                <h1 className="detail-title">{membershipItem.title}</h1>
                <h2 className="detail-price">${membershipItem.price}/YEAR</h2>
                
                <p className="detail-description">{membershipItem.fullDetails.description}</p>
                
                <p className="detail-benefits-heading">All basic benefits PLUS:</p>
                <ul>
                    {membershipItem.fullDetails.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                    ))}
                </ul>
                
                <button className="buy-button">{membershipItem.title.toUpperCase()} MEMBERSHIP</button>
                <Link to="/membership" className="back-link">← Back to Membership Options</Link>
            </div>
        </div>
    );
};

export default MembershipDetailPage;