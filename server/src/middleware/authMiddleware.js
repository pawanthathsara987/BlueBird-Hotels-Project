import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
    const authorizationHeader = req.header("Authorization");

    if(!authorizationHeader){
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authorizationHeader.replace("Bearer ", "");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

}

export function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        }
        next();
    };
}