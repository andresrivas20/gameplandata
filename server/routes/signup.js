const express = require('express');
const db = require('../database');
const validator = require('validator');

const router = express.Router();

router.post('/', async (req, res) => {
    const { firstName, lastName, email, username, password, retypedPassword, type } = req.body;

    //Validate user input
    var error = {};
    try {
        error = await validateInput(firstName, lastName, email, username, password, retypedPassword, type);
    } catch (err) {
        error = { error: { server: err.message } }
    }

    //Send http response
    if(error.error && error.error.server) {
        res.status(500).json(error);
    } else if (error != {}) {
        res.status(400).json(error)
    } else {
        res.status(200).json({ msg: firstName });
    }

    //addUser(firstName, lastName, email, username, password, 'athlete')
});

async function validateInput(firstName, lastName, email, username, password, retypedPassword, type) {
    var error = { error: {} };

    //First name validation
    if (firstName == "") {
        error.error.firstName = "First name is required";
    }

    //Last name validation
    if (lastName == "") {
        error.error.lastName = "Last name is required";
    }

    //Email validation
    if (email == "") {
        error.error.email = "Email is required";
    } else if (!validator.isEmail(email)) {
        error.error.email = "Invalid email address";
    } else if (await doesEmailExist(email)) {
        error.error.email = "Account with this email already exists"
    }

    //Username validation
    if (username == "") {
        error.error.username = "Username is required";
    } else if (await doesUsernameExist(username)) {
        error.error.username = "Username already exists";
    }

    //Password validation
    if (password == "") {
        error.error.password = "Password is required";

    } else if (!validator.isStrongPassword(password)) {
        error.error.password = "Password not strong enough";
        //list requirements
    }

    //Retyped password validation
    if (password != retypedPassword) {
        error.error.retypedPassword = "Passwords do not match";
    }

    //Account type validation
    if (type != "athlete" && type != "sponser") {
        error.error.type = "Select account type";
    }

    return error;
}

async function addUser(firstName, lastName, email, username, password, type) {

    const rows = await db.query(`INSERT INTO Users (FirstName, LastName, UserName, Email, Password, Type) VALUES ('${firstName}', '${lastName}', '${username}', '${email}', '${password}', '${type}');`);
    console.log(rows);
}

async function doesEmailExist(email) {
    try {
        const rows = await db.query(`SELECT * FROM Users WHERE Email = '${email}'`);
        return rows.length != 0;
    } catch (err) {
        throw Error('Database Error')
    }
}

async function doesUsernameExist(username) {
    try {
        const rows = await db.query(`SELECT * FROM Users WHERE UserName = '${username}'`);
        return rows.length != 0;
    } catch (err) {
        throw Error('Database Error')
    }
}

module.exports = router;