const express = require('express');
const compression = require('compression');
const rateLimiter = require('express-rate-limit');
const path = require('path');

const app = express();

// Middleware untuk kompresi dengan level optimal
app.use(compression({ level: 5, threshold: 0 }));

// Konfigurasi view engine
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

// Middleware CORS dan Logging
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Middleware untuk parsing body request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware rate limiter (100 request per 15 menit)
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));

// Route untuk login dashboard
app.all('/player/login/dashboard', (req, res) => {
    const tData = {};
    try {
        const uData = JSON.stringify(req.body).split('"')[1].split('\\n');
        const uName = uData[0].split('|');
        const uPass = uData[1].split('|');

        for (let i = 0; i < uData.length - 1; i++) {
            const d = uData[i].split('|');
            tData[d[0]] = d[1];
        }

        if (uName[1] && uPass[1]) {
            return res.redirect('/player/growid/login/validate');
        }
    } catch (err) {
        console.warn(`Warning: ${err.message}`);
    }

    res.render(path.join(__dirname, 'public/html/dashboard.ejs'), { data: tData });
});

// Route untuk check token
app.post('/player/growid/checktoken', (req, res) => {
    res.json({
        status: "success",
        message: "Account Validated.",
        token: req.body.refreshToken,
        url: "",
        accountType: "growtopia"
    });
});

// Route untuk login validation
app.all('/player/growid/login/validate', (req, res) => {
    const { _token, growId, password } = req.body;
    const token = Buffer.from(`_token=${_token}&growId=${growId}&password=${password}`).toString('base64');

    res.send(
        `{"status":"success","message":"Account Validated.","token":"${token}","url":"","accountType":"growtopia"}`,
    );
});

// Route root
app.get('/', (req, res) => {
    res.send('VALLEN ANDALAN MU');
});

// Menjalankan server
const PORT = 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));