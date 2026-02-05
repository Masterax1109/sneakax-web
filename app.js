//CONFIGURACION PARA ACCEDER A LAS VARIABLES DE ENTORNO
require('dotenv').config();

//importamos express
const express = require('express');

//creamos el servidor
const app = express();

//importamos mongoose
const mongoose = require('mongoose');

const path = require('path');

//funcion autoinvocada para conectar a la base de datos y levantar el servidor
// ()()

//funcion flecha
// ()=>{}

(async () => {
    try {
        //conexion a la base de datos
        await mongoose.connect(process.env.MONGO_URI_TEST);
            console.log("conectado a mongo db")
        

        } catch (error) {
            console.log("error de conexion a mongo db", error)
        }

    } ) ()

    module.exports = app;

    //RUTAS FRONTEND
    app.use('/', express.static(path.resolve('views', 'home'))); //ruta del home
    

