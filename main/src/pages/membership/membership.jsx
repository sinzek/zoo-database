import React from 'react';
import './membership.css'; 
import memberships from "../../data/membership";
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
  const memberships = [
    { title: "Family & Friends Premium", price: "349", details: "3 adults + guests", bestValue: true, image: "/images/capybara.jpg", link: "/membership/premium" },
    { title: "Family", price: "239", details: "2 adults + 3 children", bestValue: false, image: "/images/penguin.jpg", link: "/membership/family" },
    { title: "Individual Plus", price: "169", details: "1 adult + 1 guest", bestValue: false, image: "/images/jaguar.jpg", link: "/membership/individualplus" },
    { title: "Senior 65+", price: "189", details: "2 adults + 5 children", bestValue: false, image: "/images/quail.jpg", link: "/membership/senior" },
  ];

  const donorClubs = [
    { title: "Flock", price: "190+", details: "For 21+ and Young Professionals", bestValue: false, image: "/images/flamingos.jpg", link: "/membership/flock" },
    { title: "Asante Society", price: "1,500+", details: "Exclusive Events Private Animal Tour", bestValue: false, image: "/images/tiger.jpg", link: "/membership/asante" },
  ];

  return (
    <div className="membership-page">
      <h1 className="page-title">CHOOSE THE MEMBERSHIP LEVEL THAT'S RIGHT FOR YOU</h1>

      <div className="membership-grid">
        {memberships.map((mem, index) => (
          <MembershipCard key={index} {...mem} />
        ))}
      </div>

  
      <div className="donor-club-section">
        {donorClubs.map((club, index) => (
          <MembershipCard key={index} {...club} />
        ))}
      </div>

      <p className="footer-note"> </p>
    </div>
  );
};

export default MembershipPage;