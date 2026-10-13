import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const protectRoute = async (req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        
        if(!token){
            return res.status(401).json({
                message: "Authentication required. Please login first."
            });
        }
        
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.error("JWT verification error:", jwtError);
            return res.status(401).json({
                message: "Invalid or expired token. Please login again."
            });
        }
        
        if(!decoded || !decoded.userId){
            return res.status(401).json({
                message: "Invalid token format. Please login again."
            });  
        }
        
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(404).json({
                message: "User account not found. Please login again."
            });
        }
        
        req.user = user;
        next();
    } catch(error) {
        console.error("Error in protect middleware:", error);
        return res.status(500).json({
            message: "Internal server error. Please try again later."
        });
    }
    

}