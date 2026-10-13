import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { genToken } from "../lib/genToken.js";
import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";

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
  const user = await User.findOne({email});
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

// Parent login using student email
export const parentLogin = async (req, res) => {
  try {
    const { studentEmail } = req.body;
    
    // Find the student by email
    const student = await User.findOne({ email: studentEmail, userType: "student" });
    if (!student) {
      return res.status(400).json({
        message: "Student not found with this email"
      });
    }

    // Check if parent account already exists for this student
    let parent = await User.findOne({ childEmail: studentEmail, userType: "parent" });
    
    if (!parent) {
      // Create a temporary parent account
      const tempPassword = Math.random().toString(36).slice(-8);
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);

      parent = new User({
        fullName: `Parent of ${student.fullName}`,
        email: `parent_${studentEmail}`,
        password: hashedPassword,
        userType: "parent",
        childEmail: studentEmail
      });

      await parent.save();
    }

    genToken(parent._id, res);
    
    res.status(200).json({
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

