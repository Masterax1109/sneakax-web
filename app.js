//CONFIGURACION PARA ACCEDER A LAS VARIABLES DE ENTORNO
require('dotenv').config();

//importamos express
const express = require('express');

//creamos el servidor
const app = express();

//importamos mongoose
const mongoose = require('mongoose');

const path = require('path');
const loginRouter = require('./controllers/login');

const usersRouter = require('./controllers/users'); // 1. IMPORTA LA RUTA DE USUARIOS
const cookieParser = require('cookie-parser');
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

})()



    //RUTAS FRONTEND
    app.use('/', express.static(path.resolve('views', "home"))); //ruta del home
    app.use('/signup', express.static(path.resolve('views','signup'))) //ruta del signup
    app.use('/login', express.static(path.resolve('views', 'login'))); //ruta del login
    app.use('/components', express.static(path.resolve('views', 'components')));
    app.use('/images', express.static(path.resolve('img')));
    app.use('/styles', express.static(path.resolve('styles')));
    app.use('/verify', express.static(path.resolve('views', 'verify')));
    app.get('/verify/:id/:token', (req, res) => {
    res.sendFile(path.resolve('views', 'verify', 'index.html'));
    });// Ruta para leer el link del correo y mostrar la pantalla de verificación

    //RUTAS BACKEND
    app.use(express.json());
    app.use(cookieParser());                  // 3. ACTIVA EL LECTOR DE COOKIES AQUÍ
    app.use('/api/login', loginRouter);    
    app.use('/api/users', usersRouter);       // 4. CONECTA LA RUTA DE REGISTRO AQUÍ  

    module.exports = app;
