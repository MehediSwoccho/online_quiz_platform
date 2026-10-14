import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { genToken } from "../lib/genToken.js";
import cloudinary, { isCloudinaryConfigured } from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const signup = async (req, res) => {
  try {
    const userData = req.userData;

    const findUser = await User.findOne({ email: userData.email });
    if (findUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = new User({
      fullName: userData.fullName,
      email: userData.email,
      password: hashedPassword,
      userType: userData.userType
    });

    await newUser.save(); 
    genToken(newUser._id, res);

    
    return res.status(201).json({
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic
    });

  } catch (error) {
    console.error("Error in signup controller:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
export const login = async (req,res) =>{
  try{
    const {email,password} = req.body;
  const user = await User.findOne({email}).select("+password");
  if(!user){
    return res.status(400).json({
      message: "Wrong credentials"
    });
  }
  const isPasswordCorrect = await bcrypt.compare(password,user.password);
  if(!isPasswordCorrect){
    return res.status(400).json({
      message: "Wrong credentials"
    });
  }
  genToken(user._id,res);
  res.status(200).json({
    id:user._id,
    fullName:user.fullName, 
    email:user.email,
    profilePic:user.profilePic 
  });

  }catch(error){
    console.error("Error in login controller:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
  
}
export const logout = async (req,res) =>{
  try{
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    return res.status(200).json({
      message: "Logged out successfully"
    });
  }
  catch(error){
    console.error("Error in logout controller:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
}
export const updateProfile = async(req,res)=>{
  try{
    const { profilePic, fullName, email } = req.body;
    const userId = req.user._id;
    
    
    const updateFields = {};
    
    
    if(profilePic) {
      if (!isCloudinaryConfigured) {
        return res.status(503).json({
          message: "Profile image uploads are unavailable because Cloudinary is not configured"
        });
      }
      const uploadResult = await cloudinary.uploader.upload(profilePic);
      updateFields.profilePic = uploadResult.secure_url;
    }
    
    if(fullName) {
      updateFields.fullName = fullName;
    }
    
    if(email) {
      
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if(existingUser) {
        return res.status(400).json({
          message: "Email is already in use by another account"
        });
      }
      updateFields.email = email;
    }
    
    
    if(Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        message: "No update data provided"
      });
    }
    
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, select: '-password' }
    );
    
    res.status(200).json({
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      userType: updatedUser.userType
    });
    
  } catch(error) {
    console.error("Error in update profile controller:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

const hashParentAccessCode = (accessCode) =>
  createHash("sha256").update(accessCode).digest("hex");

export const generateParentAccessCode = async (req, res) => {
  try {
    if (req.user.userType !== "student") {
      return res.status(403).json({ message: "Only students can create a parent access code" });
    }

    const accessCode = randomBytes(24).toString("base64url");
    await User.findByIdAndUpdate(req.user._id, {
      $set: { parentAccessCodeHash: hashParentAccessCode(accessCode) }
    });

    return res.status(200).json({ accessCode });
  } catch (error) {
    console.error("Error generating parent access code:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Parent login requires a code created from the authenticated student's account.
export const parentLogin = async (req, res) => {
  try {
    const { studentEmail, accessCode } = req.body;
    const normalizedStudentEmail = typeof studentEmail === "string"
      ? studentEmail.trim().toLowerCase()
      : "";
    if (!normalizedStudentEmail || normalizedStudentEmail.length > 254
      || typeof accessCode !== "string" || !/^[A-Za-z0-9_-]{32}$/.test(accessCode)) {
      return res.status(401).json({ message: "Invalid student email or parent access code" });
    }

    const student = await User.findOne({ email: normalizedStudentEmail, userType: "student" })
      .select("+parentAccessCodeHash");
    const suppliedHash = Buffer.from(hashParentAccessCode(accessCode), "hex");
    const storedHash = student?.parentAccessCodeHash
      ? Buffer.from(student.parentAccessCodeHash, "hex")
      : Buffer.alloc(suppliedHash.length);
    const validCode = student?.parentAccessCodeHash
      && storedHash.length === suppliedHash.length
      && timingSafeEqual(storedHash, suppliedHash);

    if (!validCode) {
      return res.status(401).json({ message: "Invalid student email or parent access code" });
    }

    let parent = await User.findOne({ childEmail: student.email, userType: "parent" });
    if (!parent) {
      const randomParentPassword = randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomParentPassword, 10);

      parent = new User({
        fullName: `Parent of ${student.fullName}`,
        email: `parent_${student._id}@parent.local`,
        password: hashedPassword,
        userType: "parent",
        childEmail: student.email
      });

      await parent.save();
    }

    genToken(parent._id, res);

    return res.status(200).json({
      id: parent._id,
      fullName: parent.fullName,
      email: parent.email,
      profilePic: parent.profilePic,
      userType: parent.userType,
      childEmail: parent.childEmail,
      studentName: student.fullName
    });

  } catch (error) {
    console.error("Error in parent login controller:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const checkAuth = async (req,res) =>{
  try{
    // Check if there's a JWT token in cookies
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(200).json(null);
    }
    
    // If there's a token, try to verify it
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(200).json(null);
      }
      
      const response = {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        userType: user.userType
      };

      // Add child info for parent accounts
      if (user.userType === 'parent') {
        const student = await User.findOne({ email: user.childEmail, userType: "student" });
        response.childEmail = user.childEmail;
        response.studentName = student ? student.fullName : 'Unknown Student';
      }
      
      return res.status(200).json(response);
    } catch (jwtError) {
      // Invalid or expired token
      return res.status(200).json(null);
    }
  }catch(error){
    console.error("Error in check controller:", error);
    return res.status(200).json(null); // Return null instead of error
  }
}

