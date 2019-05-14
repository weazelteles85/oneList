import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';

const app = express();
const cors = require('cors')({ origin: true });
const db = admin.firestore();
app.use(cors);

export const cancelSharingRequest = functions.https.onRequest((request, response) => {
    cors(request, response, () => {

        const emailToDelete = request.body.emailToDelete;
        const userToDeleteFrom:string = request.body.userToDeleteFrom;

        const documentRef = db.collection("shoppingLists").doc(userToDeleteFrom);

        documentRef.update({
            cancelShare: admin.firestore.FieldValue.arrayUnion(emailToDelete)
        }).then((res) => {
            console.log(res);
            response.status(200).send('Stopped sharing with ' + userToDeleteFrom);
        }).catch((err) => {
            console.error(err);
            response.status(400).send('Something went wrong: ' + err);
        })

    });
})