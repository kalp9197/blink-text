import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { AppError } from "../middleware/error";

// Helper function to create a JWT token
const createToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  return jwt.sign({ id }, secret, { 
    expiresIn: process.env.JWT_EXPIRE || '30d' 
  } as jwt.SignOptions);
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("User already exists", 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Cast to IUser to access _id
    const userDoc = user as unknown as IUser;

    // Generate token
    const token = createToken(userDoc._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }
    
    // Cast to IUser to access comparePassword
    const userDoc = user as unknown as IUser;
    
    if (!(await userDoc.comparePassword(password))) {
      return next(new AppError("Invalid email or password", 401));
    }

    // Generate token
    const token = createToken(userDoc._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    
    // Cast to IUser to access properties
    const userDoc = user as unknown as IUser;

    res.status(200).json({
      success: true,
      user: {
        id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
