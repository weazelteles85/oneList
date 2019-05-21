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

        const usersRef = db.collection('users');
        usersRef.where('email', '==', userToDeleteFrom).get().then((usersSnapshot) => {
            if(usersSnapshot.empty) {
                response.status(499).send('No User with that email was found, likely he has been removed from the server');
            }
            const editedUser = usersSnapshot.docs[0].data();
            const index:number = editedUser.sharedEmails.emails.findIndex(e => e === emailToDelete);
            editedUser.sharedEmails.emails.splice(index);

            usersRef.doc(editedUser.UserId).set(editedUser, {merge: true}).then((res) => {
                response.status(200).send('No longer sharing List with ' + editedUser.email);
            }).catch((err) => {
                response.status(400).send('Something went wrong: ' + err);
            })
        }).catch((err) => {
            response.status(400).send('Something went wrong: ' + err);
        })


        // const documentRef = db.collection("shoppingLists").doc(userToDeleteFrom);

        // documentRef.update({
        //     cancelShare: admin.firestore.FieldValue.arrayUnion(emailToDelete)
        // }).then((res) => {
        //     console.log(res);
        //     response.status(200).send('Stopped sharing with ' + userToDeleteFrom);
        // }).catch((err) => {
        //     console.error(err);
        //     response.status(400).send('Something went wrong: ' + err);
        // })

    });
})