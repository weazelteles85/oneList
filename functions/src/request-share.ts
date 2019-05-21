import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';

const app = express();
const cors = require('cors')({ origin: true });
const db = admin.firestore();
app.use(cors);

export const sendShareRequest = functions.https.onRequest((request, response) => {
    cors(request, response, () => {

        const sharingWith = request.body.shareWith;
        const fromEmail = request.body.fromEmail;

        const usersRef = db.collection('users');
        usersRef.where('email', '==', sharingWith).get().then((usersSnapshot) => {
            if(usersSnapshot.empty) {
                response.status(499).send('Email Not Found');
            }
            const userToShareWith = usersSnapshot.docs[0].data();
            console.log(usersSnapshot.docs)
            console.log(userToShareWith);
            userToShareWith.incomingRequests.emails.push(fromEmail);
            usersRef.doc(userToShareWith.UserId).set(userToShareWith, {merge: true}).then((res) => {
                response.status(200).send('New share request sent to: ' + sharingWith);
            }).catch((err) => {
                response.status(400).send('Something went wrong: ' + err);
            })
        }).catch((err) => {
            response.status(400).send('Something went wrong: ' + err);
        })
    });

})