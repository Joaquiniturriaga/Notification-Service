const jwt = require('jsonwebtoken');

const verifyToken = (raw) => {
    const token = raw.startsWith('AUTH-') ? raw.slice(5) : raw;
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { verifyToken };