import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';

const app = express();
const cors = require('cors')({ origin: true });
const db = admin.firestore();
app.use(cors);

export const sendUpdateShared = functions.https.onRequest((request, response) => {
    cors(request, response, () => {

        const sharingWith = request.body.shareWith;
        const listToShare = request.body.listToShare
        db.collection('shoppingLists').doc(sharingWith).set(listToShare, { merge: true }).then(
            (msg) => {
                console.log('Update Shared Successfull');
                return response.status(200).send('Updated Shared List:' + sharingWith);
            }
        ).catch((err) => {
            console.error(err);
            console.log('error updating list with' + sharingWith);
            return response.status(400).send(err);
        });
    });
})