const usersRouter = require('express').Router(); //importar el router de express
const User = require ('../models/user'); //importar el modelo de usuario
const bcrypt = require('bcrypt'); //libreria para hashear contraseñas
const jwt = require('jsonwebtoken'); //libreria para crear y verificar tokens
const { createTestAccount } = require('nodemailer'); //libreria para enviar correos
const nodemailer = require('nodemailer'); //libreria para enviar correos
const { PAGE_URL } = require('../config'); //importar la url de la pagina desde config
const { data } = require('autoprefixer'); //importar datos de autoprefixer


// Obtener todos los usuarios 
//post para crear un nuevo usuario


usersRouter.post('/', async (request, response) => {
    const { name, email, password } = request.body; 
    console.log('datos recibidos en el backend:', name, email, password);
    
    if (!name || !email || !password) {
        return response.status(400).json({ error: 'todos los espacios son requeridos' });
    } 

    const userexists = await User.findOne({ email });
    if (userexists) {
        return response.status(400).json({ error: 'el correo ya esta en uso' });
    }
const saltRounds = 10;  
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
        name,
        email,
        passwordHash,
    });
//guardar el usuario en la base de datos
    const saveUser = await newUser.save(); 
     console.log('usuario guardado:', saveUser);
   const token = jwt.sign({ id: saveUser.id }, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1d' }); // crear un token con el id del usuario
   console.log('token generado:', token);
    // Configurar el transporte de nodemailer
// enviar el correo de verificación
     const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 465,
   secure: true, // true for 465, false for other ports
   auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
 });
// // Configurar el correo electrónico
 await transporter.sendMail({ // enviar el correo de verificación
     from: process.env.EMAIL_USER, //gmail usuario
     to: saveUser.email,  // receptor
    subject: 'verificacion de usuario ',
     html: `<a href="${PAGE_URL}/verify/${saveUser.id}/${token}">Verificar correo</a>`, // HTML body
   });
   return response.status(201).json( 'Usuario creado. Por favor verifica tu correo' );
 });
 //201 Created

// Ruta para verificar el correo electrónico del usuario

 usersRouter.patch('/:id/:token', async (request, response) => {
try {
    const token = request.params.token; // obtener el token de los parámetros de la ruta
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //decodificar el token para obtener el id del usuario
    //  console.log(decodedToken);// obtener el id del token decodificado
    const id = decodedToken.id;
    await User.findByIdAndUpdate(id, { verified: true });
    return response.sendStatus(200);

} catch (error) {
    //encontrar el email del usuario    
    const id = request.params.id;
    const { email } = await User.findById(id);
   // console.log(email);
    
    //firmar el nuevo token
const token = jwt.sign({ id: id }, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1d' });
   console.log('token generado:', token);

    // enviar el correo de nuevo

     const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 465,
   secure: true, // true for 465, false for other ports
   auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
 });
// // Configurar el correo electrónico
 await transporter.sendMail({
     from: process.env.EMAIL_USER,
     to: email,
    subject: 'verificacion de usuario ',
     html: `<a href="${PAGE_URL}/verify/${id}/${token}">Verificar correo</a>`, // HTML body
   });

    return response.status(400).json({ error: 'El link ya ha expirado. Se ha enviado un nuevo link de verificación a su correo' });
}
});

// Exportar el router
module.exports = usersRouter;