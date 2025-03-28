module.exports = (app, prisma) => {
    app.get("/", async (req, res) => {
        try {
            const data = req.body;

            // input valiation

            // business logic

            // output validation

            // output
            const response = {

            };

            res.json({ response });
        } catch (error) {
            console.log('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}