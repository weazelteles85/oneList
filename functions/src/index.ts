import * as functions from 'firebase-functions';
import * as auth from './auth';
import { api } from './api';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export { sendShareRequest } from './request-share'
export { sendUpdateShared } from './updateShared'
export { cancelSharingRequest } from './cancel-share'
export { sendEmail } from './send-email'

// Auth Functions
export const createStripeCustomer = auth.createStripeCustomer;

// Main Authenticated User API
export const app = api;
