/* ===================================

ISC License

Copyright (c) [2021], [Ankit Kumar Jat]

======================================*/

const express = require("express");
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => console.log(`Server is rinning on 127.0.0.1:${PORT}`));