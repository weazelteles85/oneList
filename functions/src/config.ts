import { environment } from './environments/environments'

//// Initialize Express App and Middleware ////


import * as CORS from 'cors';
export const cors = CORS({ origin: true });

function corsMiddleware(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
}

import * as express from 'express';
export const app = express();

//import { authenticateUser } from './helpers'; //<---- *** This Import does not seem to be working, hence the function at the end of page

 app.use(cors);
 app.use(corsMiddleware)
 app.use(importingWorkAround); // <-- passing in functions at the end of page because this does not seem to be importing properly when firebase deploy --only functions

//// Initialize Firebase ////

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// //// Service account required for Stripe Connect OAuth
// const serviceAccount = require('../../credentials.json')

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://stripe-elements.firebaseio.com"
// });

 
// If not using Stripe Connect, initialize without service account
admin.initializeApp(functions.config().firebase);

export const db     = admin.firestore();
export const auth   = admin.auth();


//// Initalize Stripe NodeJS SDK ////

import * as Stripe from 'stripe'; 

// Possible bug with v1.0 and firebase-tools CLI
// export const stripeSecret       = functions.config().stripe.secret;
// export const stripePublishable  = functions.config().stripe.publishable;
// export const stripeClientId     = functions.config().stripe.clientid; // only used for stripe connect


export const stripeSecret       = environment.stripeSecretKey;
export const stripePublishable  = environment.stripePublishable;
//export const stripeClientId     = serviceAccount.stripe.clientid; // only used for stripe connect

export const stripe = new Stripe(stripeSecret);





//// The functions bellow is because there is a bug when importing { authenticateUser } from './helpers';
function importingWorkAround(req, res, next) {
    //console.log('inside the authenticateUser');
    let authToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        authToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        res.status(403).send('Must provide a header that looks like "Authorization: Bearer <Firebase ID Token>"');
    }

    auth.verifyIdToken(authToken)
        .then(decodedToken => {
            req.user = decodedToken;
            //console.log('decodedToken Happened');
            next();
        })
        .catch((err) => {
            //console.log('inside catch Error of authenticateUser');
            res.status(403).send(err);
        })
}

