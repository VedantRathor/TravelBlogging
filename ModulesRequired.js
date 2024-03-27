const mongoose = require("mongoose")
const express = require("express")
const app = express()
const colors = require("colors")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
const PORT = process.env.PORT || 2000
const hbs = require('hbs')