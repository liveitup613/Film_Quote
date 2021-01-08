
const Quote = require('../../models/Quote');

const searchQuote = async (req, res) => {
    let body = req.body;

    console.log(body);

    if (body.search == null) {
        res.status(400).json({
            'status': 400,
            'message': 'Bad Request'
        });
        return;
    };

    try {

        let quotes = await Quote.searchQuote(body.search);        

        res.status(200).json({
            'status': 200,
            'message': 'success',
            'quotes': quotes
        });

    } catch (error) {
        res.status(500).json({
            'status': 500,
            'message': error.toString()
        });
    }
}

const getQuote = async(req, res) => {
    let id = req.params.id;

    if (id == null || id == 0) {
        res.status(400).json({
            'status': 400,
            'message': 'Bad Request'
        });
        return;
    }

    try {
        let quotes = await Quote.getQuote(id);

        if (quotes == null || quotes.length == 0){
            res.status(204).json({
                'status': 204,
                'message': 'No Response'
            });
            return;
        }
        
        res.status(200).json({
            'status': 200,
            'message': 'Success',
            'quote': quotes[0]
        });
    }
    catch (error) {
        res.status(500).json({
            'status': 500,
            'message': error.toString()
        });
    }
}

module.exports = {
    searchQuote,
    getQuote
}