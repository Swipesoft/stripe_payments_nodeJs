const express = require('express');
const bodyParser = require('body-parser')
require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express(); 
const PORT = 3030; 

const urlencodedParser = bodyParser.urlencoded({extended: false}); //set extension to false
const jsonParser = bodyParser.json(); //parse input as json object


async function create_customer({email, name}) {
    stripe.customers.create({
    email: 'customer@example.com',
    name: 'customer_name customer_surname'})
    .then(customer => console.log(customer.id))
    .catch(error => console.error(error));
    return customer.id, customer; 
}

app.get('/', async (req, res) => {
    res.send(`
        <h2> PAYMENT PROJECT WITH STRIPE</h2>
        <form action="/customer"  method="post">
            <div>Create A Customer Account: 
                <input type="text" name="name"  />
                <input type="email" name="email"  />
            </div>
                <input type="submit" value="Create" />
        </form>

    `);
}); 

app.post('/customer',urlencodedParser, async (req, res) => {
    let {email, name} = JSON.stringify(req.body); 
    let customer_id, customer = create_customer({email, name})
    .then((customer) => {
        // have access to the customer object
        return stripe.invoiceItems
          .create({
            customer, 
            amount: 20, 
            currency: 'usd',
            description: 'One-time setup fee',
          })
          .then((invoiceItem) => {
            return stripe.invoices.create({
              collection_method: 'send_invoice',
              customer: invoiceItem.customer,
            });
          })
          .then((invoice) => {
            res.send(invoice); // sends  the invoice back to the page
          })
          .catch((err) => {
            if (err.type == 'StripeCardError') {
                message = err.message; 
            } else {
            console.err('Error processing payment:', err)
            }
          });

    }); 
}); 

app.listen(PORT, () => {
    console.log(`Stripe API on localhost ${PORT}`)
}); 