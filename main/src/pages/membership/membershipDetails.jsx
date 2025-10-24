import React from 'react';
// Assuming your detailed data is exported as ALL_MEMBERSHIP_DETAILS
import { MEMBERSHIPS_DATA } from '../../data/membership'; 
import { Link } from '../../components/link'; 

const MembershipDetailPage = ({ id }) => {
    // 1. Find the specific membership details using the ID from the URL
    const membership = MEMBERSHIPS_DATA.find(
        (item) => item.id === id
    );

    // 2. Handle cases where the membership ID is invalid
    if (!membership) {
        return (
            <div className="membership-detail-page">
                <h1>Membership Not Found</h1>
                <p>The requested membership level could not be found.</p>
                <Link to="/membership">Return to All Memberships</Link>
            </div>
        );
    }

    // 3. Render the details using the found membership data
    return (
        <div className="membership-detail-page">
            <h1 className="detail-title">{membership.title}</h1>
            <h2 className="detail-price">${membership.price}/YEAR</h2>
            
            <p className="detail-description">{membership.fullDetails.description}</p>
            
            <p className="detail-benefits-heading">All basic benefits PLUS:</p>
            <ul>
                {membership.fullDetails.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                ))}
            </ul>
            
            <button className="buy-button">{membership.title.toUpperCase()} MEMBERSHIP</button>
            <Link to="/membership" className="back-link">← Back to Membership Options</Link>
        </div>
    );
};

export default MembershipDetailPage;