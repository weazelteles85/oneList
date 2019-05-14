import * as functions from 'firebase-functions';

import { environment } from './environments/environments'
const cors = require('cors')({ origin: true });
const SENDGRID_API_KEY = environment.sendGridKey;


const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);

export const sendEmail = functions.https.onRequest((request, response) => {
    cors(request, response, () => {

        const toEmail = request.body.toEmail;
        const fromEmail = request.body.fromEmail;
        const eMailSubject = request.body.eMailSubject;
        const htmlBody = request.body.htmlBody;

        const data = {
            "to": toEmail,
            "from": fromEmail,
            "subject": eMailSubject,
            "html": htmlBody
        };


        return sgMail.send(data)
            .then((res) => {
                response.status(200).send('email sent!')
            })
            .catch((err) => {
                console.error('error occured on response from sendgrid')
                response.status(400).send(err)
            })
    });
})