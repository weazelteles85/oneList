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

        const documentRef = db.collection("shoppingLists").doc(sharingWith);

        documentRef.update({
            incomingRequests: admin.firestore.FieldValue.arrayUnion(fromEmail)
        }).then((res) => {
            console.log(res);
            response.status(200).send('New share request sent to: ' + sharingWith);
        }).catch((err) => {
            console.log(err.message);
            if (err.code == '5') {
                response.status(499).send('Email Not Found');
            }
            else {
                response.status(400).send('Something went wrong: ' + err);
            }
        })
    });

})