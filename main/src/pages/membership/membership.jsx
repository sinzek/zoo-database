import React from 'react';
import './membership.css'; 
import membershipData from "../../data/membership"; 
import { Link } from "../../components/link";


const MembershipCard = ({ title, price, details, bestValue = false, image, link }) => (
  <Link to={link} className={`membership-card-link ${bestValue ? 'best-value' : ''}`}>
    <div className="membership-card">
      <div className="card-image-container">
        <img src={image} alt={`${title} membership`} className="card-image" />
      </div>
      <div className="card-content">
        <h3 className="card-title">{title} {bestValue && <span className="best-value-tag">(Best Value)</span>}</h3>
        <p className="card-price">${price}</p>
        <p className="card-details">{details}</p>
      </div>
    </div>
  </Link>
);



const MembershipPage = () => {
  

  const memberships = membershipData.filter(m => m.id !== 'flock' && m.id !== 'asante');
  const donorClubs = membershipData.filter(m => m.id === 'flock' || m.id === 'asante');

  return (
    <div className="membership-page">
      <h1 className="page-title">CHOOSE THE MEMBERSHIP LEVEL THAT'S RIGHT FOR YOU</h1>

      <div className="membership-grid">

        {memberships.map((mem) => (
          <MembershipCard key={mem.id} {...mem} />
        ))}
      </div>

 
      <div className="donor-club-section">

        {donorClubs.map((club) => (
          <MembershipCard key={club.id} {...club} />
        ))}
      </div>

      <p className="footer-note"> </p>
    </div>
  );
};

export default MembershipPage;