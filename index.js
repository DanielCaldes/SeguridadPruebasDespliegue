require('dotenv').config();
const app = require("./app");
const connectDB = require("./src/database/database")

const PORT = process.env.PORT || 3000;

async function runServer() {
    try {
        await connectDB();
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
}

runServer();