import { upsertStreamUser } from '../lib/stream.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
export async function signup (req, res) {
  const {email,password,fullName}=req.body; 
  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const idx =  Math.floor(Math.random() * 100)+1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      password,
      fullName,
      profilePic: randomAvatar
    });
    //stream user upsert
    try {
      await upsertStreamUser ({
      id: newUser._id.toString(), 
      name: newUser.fullName,
      image: newUser.profilePic || "",
    });
    console.log(`Stream user upserted successfully ${newUser.fullName}`);
    
    } catch (error) {
      console.error('Error upserting Stream user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );
    res.cookie('jwt', token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      sameSite: 'strict', // Helps prevent CSRF attacks
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic
      }
    });
  } catch (error) {
    console.log('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error' });
    
  }
}

export async function login (req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    } 
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );
    res.cookie('jwt', token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      sameSite: 'strict', // Helps prevent CSRF attacks
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic
      }
    });
  } 
  catch (error) {
    console.log('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export function logout (req, res) {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.status(200).json({ message: 'Logout successful' 
    ,success: true
  });
}

export async function onboard (req, res) {
 try {
  const userId = req.user._id; // Assuming user is attached to req in auth middleware

  const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;
  if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
    return res.status(400).json({ message: 'All fields are required' ,
      missingFields: [
        !fullName && 'fullName',
        !bio && 'bio',
        !nativeLanguage && 'nativeLanguage',
        !learningLanguage && 'learningLanguage',
        !location && 'location' 
      ].filter(Boolean) // Filter out null values
    });
  }
  const updatedUser= await User.findByIdAndUpdate(userId, {
    ...req.body,
    isOnboarded: true
  }, { new: true });
  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found' });
  } 
  // Upsert Stream user with updated information
  try {
    await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullName,
      image: updatedUser.profilePic || "",
    });
    console.log(`Stream user upserted successfully for ${updatedUser.fullName}`);
  } catch (error) {
    console.error('Error upserting Stream user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
  res.status(200).json({
    message: 'User onboarded successfully',
    user: updatedUser,
    success: true })
  // Upsert Stream user with updated information
 } catch (error) {
  console.error('Error during onboarding:', error);
  return res.status(500).json({ message: 'Internal server error' });
 }
}