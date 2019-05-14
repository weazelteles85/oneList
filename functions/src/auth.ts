import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
import { createCustomer } from './helpers';

const db     = admin.firestore();

export const createStripeCustomer = functions.auth

    .user().onCreate(event => {
        const user = event;
        const userRef = db.collection('users').doc(user.uid)

        return createCustomer(user).then(customer => {
            
            /// update Firestore with stripe customer id
            const data = { stripeCustomerId: customer.id }
            return userRef.set(data, { merge:true });
        })
    });