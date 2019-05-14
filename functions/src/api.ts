import * as functions from 'firebase-functions';
import { app } from './config';
import * as helpers from './helpers';

// POST Charge
app.post('/charges', (req, res) => {

    const userId   = req.user.uid;
    const sourceId = req.body.sourceId;
    const amount   = req.body.amount;
    const currency = req.body.currency;

    const promise = helpers.createCharge(userId, sourceId, amount, currency)
    defaultHandler(promise, res)
});


// Get User Charges
app.get('/charges', (req, res) => {
    //console.log('inside get User Charges in api.ts');
    const userId   = req.user.uid;
    const promise = helpers.getUserCharges(userId)
    defaultHandler(promise, res)
});

// POST sources
app.post('/sources', (req, res) => {
    
    const userId    = req.user.uid;
    const sourceId  = req.body.sourceId;

    const promise = helpers.attachSource(userId, sourceId)
    defaultHandler(promise, res)
    
});

// GET customer (includes source and subscription data)
app.get('/customer', (req, res) => {
    //console.log('inside app.get /customer in api.ts');
    const userId   = req.user.uid;
    const promise = helpers.getCustomer(userId)
    defaultHandler(promise, res)
});


// Default handling of response
function defaultHandler(promise: Promise<any>, res: any): void {
    //console.log('inside defaultHandler in api.ts');
    promise
        .then(data => res.status(200).send(data) )
        .catch(err => res.status(400).send(err) )
}

export const api = functions.https.onRequest(app);