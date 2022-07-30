const cors = require("cors");
const { response } = require("express");
const express = require("express");
const app = express();
const PORT = "8081";
const request = require("request");
const apiKey = "a1aa20bfdba29afe055d";
const urlFirstStr = "https://free.currconv.com/api/v7";
app.use(cors({ origin: "*" }));
app.listen(process.env.PORT || PORT, () => console.log(`Listening on port ${PORT}`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.get("/convertCurrency", (req, res) => {

    let conversionObj = req.query;
    conversionObj.firstCurrency = conversionObj.symbols.split(',')[0].toUpperCase();
    conversionObj.secondCurrency = conversionObj.symbols.split(',')[1].toUpperCase();
    let amount = conversionObj.amount;
    const symbols = `${conversionObj.firstCurrency}_${conversionObj.secondCurrency}`;
    let urlQuery = `convert?q=${symbols}`;
    const requestParams = {
        symbols,
        urlQuery,
        res,
        amount
    };
    makeExternalRequest(requestParams);
});

app.get("/getCountries", (req, res) => {
    url = `${urlFirstStr}/currencies?apiKey=${apiKey}`;
    const countries = [];
    request(url, { json: true }, (err, resFromApi) => {
        if (err) {
            res.send(err);
        }
        Object.entries([resFromApi.body.results][0]).forEach(([key, value]) =>
            countries.push(value)
        );
        res.send(countries);
    });
});

function makeExternalRequest({
    symbols,
    urlQuery,
    res,
    amount
}) {
    const url = `${urlFirstStr}/${urlQuery}&compact=ultra&apiKey=${apiKey}`;

    request(url, { json: true }, (err, rate) => {
        let response;
        if (err) {
            return res.send(err);
        } else {
            let body = rate?.body;
            if (!body[symbols] || isNaN(amount)) {
                response = {
                    "err": "Please check the currency code or amount"
                };
            } else {
                let conversionRate = body[symbols].toString();
                let convertedAmount = amount * conversionRate;
                response = {
                    symbols: symbols,
                    amountToConvert: amount,
                    rate: conversionRate,
                    convertedAmount: convertedAmount
                }
            }
        }
        res.send(response);
    })
}