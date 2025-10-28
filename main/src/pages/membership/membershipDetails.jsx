import React from 'react';

import membershipData from '../../data/membership'; 
import './membership.css';

import { Link } from '../../components/link'; 
import { useRouter } from '../../context/routerContext';
import { useUserData } from '../../context/userDataContext'; 

const MembershipDetailPage = ({ id }) => {
    const { navigate } = useRouter(); 
    const { userInfo } = useUserData(); 

    const membershipItem = membershipData.find(
        (item) => item.id === id
    );

// Checks to see if user is logged in for directing purposes
const handlePurchaseClick = () => {
        const purchaseUrl = `/membership/buy/${membershipItem.id}`; //target URL

        if (userInfo) {
            navigate(purchaseUrl);
        } else {

            navigate(`/login?redirect=${encodeURIComponent(purchaseUrl)}`); 
        }
    };


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
                

                <Link to={`/membership/buy/${membershipItem.id}`} className="buy-button">
                 {membershipItem.title.toUpperCase()} MEMBERSHIP </Link>

                <Link to="/membership" className="back-link">← Back to Membership Options</Link>
            </div>
        </div>
    );
};

export default MembershipDetailPage;