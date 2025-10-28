
import React, { useMemo, useState, useEffect } from 'react';

import { useShoppingCart } from '../../../context/shoppingCartContext';
import { FormBuilder } from '../../../components/formBuilder/formBuilder';
import { useUserData } from '../../../context/userDataContext';
import { Button } from '../../../components/button';

import { Check } from 'lucide-react';
import membershipData from '../../../data/membership'; 
import NotFoundPage from '../../404/404'; 

import { Link } from '../../../components/link'; 
import { useRouter } from '../../../context/routerContext';

export function BuyMembershipPage({ id }) { 
    const { addItemToCart, cartItemCount, cartItems } = useShoppingCart();
    const { userEntityData, userInfo } = useUserData();
    

    const { navigate } = useRouter();


   
    const membership = useMemo(
        () => membershipData.find((m) => m.id === id),
        [id]
    );


    const [formData, setFormData] = useState({
        visitorName: `${userEntityData?.firstName || ''} ${
            userEntityData?.lastName || ''
        }`.trim(),
        email: userInfo?.email || '',
    
    });
    const [feedback, setFeedback] = useState('');

    const contactFields = useMemo(
        () => [
            {
                name: 'visitorName',
                label: 'Member Name', 
                type: 'text',
                placeholder: 'Jane Doe',
                autoComplete: 'name',
            },
            {
                name: 'email',
                label: 'Confirmation Email',
                type: 'email',
                placeholder: 'you@example.com',
                autoComplete: 'email',
            },
        ],
        []
    );

    const currencyFormatter = useMemo(
        () =>
            new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }),
        []
    );

   
    const handleAddToCart = () => {


        const { visitorName, email } = formData;
        if (!visitorName || !email) {
            setFeedback(
                'Please complete member details before adding to cart.'
            );
            return;
        }



        const cartItem = {
            itemId: membership.id,
            name: membership.title,
            description: membership.details,
            price: parseFloat(membership.price.replace(/,|\+/g, '')),
            uiPhotoUrl: membership.image,
            businessId: '9d924bce-2e2a-4a9a-8de0-1f4458a2d8a4', 
            quantity: 1, 
            purchaserName: visitorName,
            purchaserEmail: email,
            addedAt: new Date().toISOString(),
        };

        const successfullyAdded = addItemToCart(cartItem, 1); 

        if (successfullyAdded) {
            setFeedback(`${membership.title} added to cart.`);
        } else {
            //Warning
            setFeedback("You already have a membership in your cart. Only one allowed."); 
        }
    };

    if (userInfo === undefined) { 
        return <div>Loading...</div>; 
    }
   
    if (!membership) {
        return <NotFoundPage />;
    }


    return (
        <div
            className='page'
            style={{
                width: '100%',
                padding: '96px 24px 48px',
                boxSizing: 'border-box',
                backgroundColor: 'var(--color-dbrown)',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '1040px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '32px',
                    color: 'var(--color-green)',
                }}
            >
                <header style={{ display: 'grid', gap: '12px' }}>
                    <h1 style={{ fontSize: '2.75rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                        Purchase Membership
                    </h1>
                    <p style={{ maxWidth: '640px', margin: 0, color: 'var(--color-lgreen)' }}>
                        Confirm your details to purchase your new membership.
                    </p>
                </header>

             
                <div
                    style={{
                        borderRadius: '28px',
                        padding: '24px',
                        backgroundColor: 'var(--color-brown)', 
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        gap: '16px',
                    }}
                >
                   
                    <div>
                        <h2 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.45rem' }}>
                            Member Details
                        </h2>
                        <FormBuilder
                            fields={contactFields}
                            formData={formData}
                            setFormData={setFormData}
                        />
                    </div>

               
                    <div>
                        <article
                            key={membership.id}
                            style={{
                                borderRadius: '28px',
                                backgroundColor: 'var(--color-dbrown)',
                                boxShadow: '0 18px 36px rgba(0, 0, 0, 0.35)',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.45rem', color: 'var(--color-lgreen)' }}>
                                        {membership.title}
                                    </h3>
                                    <p style={{ margin: 0, color: 'var(--color-foreground)', opacity: 0.85 }}>
                                        {membership.fullDetails.description.substring(0, 120)}...
                                    </p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-green)' }}>
                                    {currencyFormatter.format(membership.price.replace(/,|\+/g, ''))} / year 
                                </span>
                                  
                                </div>

                                <button
                                    type='button'
                                    className='btn btn-green btn-lg'
                                    onClick={handleAddToCart}
                                    style={{ width: '100%', marginTop: '8px' }}
                                >
                                    Add Membership to Cart
                                </button>
                            </div>
                        </article>
                    </div>
                </div>

                
                <section style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '24px' }}>
                    <div>
                        {cartItemCount > 0 && (
                            <Link to='/portal/cart'>
                                <Button variant='outline' size='lg' disabled={cartItemCount === 0} style={{ /* styles from your code */ }}>
                                    <Check style={{ marginBottom: -3 }} />
                                    Proceed to Checkout ({cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in cart)
                                </Button>
                            </Link>
                        )}
                    </div>
                    <div style={{display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'flex-end', 
                            borderTop: '1px solid rgba(196, 163, 129, 0.4)', 
                            paddingTop: '16px',}}>

                        <span style={{ fontSize: '0.95rem', color: 'var(--color-lbrown)' }}>
                            Estimated total
                        </span>
                        <strong style={{ fontSize: '1.75rem', color: 'var(--color-green)' }}>
                            {currencyFormatter.format(membership.price.replace(/,|\+/g, ''))} 
                        </strong>
                    </div>
                </section>


                {feedback && (
                    <div role='status' style={{
                            borderRadius: '999px',
                            padding: '14px 22px',
                            fontWeight: 600,
                            alignSelf: 'flex-start',
                            background: 'rgba(187, 214, 134, 0.15)',
                            border: '1px solid var(--color-green)',
                            color: 'var(--color-lgreen)',}}>

                        {feedback}
                    </div>
                )}
            </div>
        </div>
    );
}