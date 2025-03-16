import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import Text, { IText } from "../models/Text";
import { AppError } from "../middleware/error";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const generateAccessToken = () => {
  // Generate a more user-friendly but secure token (16 chars)
  return crypto.randomBytes(8).toString("hex");
};

export const createText = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Log request details for debugging
    console.log("Create text request received:");
    console.log("- User ID:", req.user?.id);
    console.log("- Content length:", req.body.content?.length || 0);

    const {
      content,
      encryptionKey,
      isProtected,
      password,
      maxViews,
      viewOnce,
      expirationMinutes,
      customExpiryDate,
      isMarkdown,
    } = req.body;

    if (!content) {
      return next(new AppError("Content is required", 400));
    }

    // Validate encryption key
    if (!encryptionKey) {
      return next(new AppError("Encryption key is required", 400));
    }

    // Validate content length
    if (content.length > 100000) {
      return next(
        new AppError(
          "Content exceeds maximum length of 100,000 characters",
          400
        )
      );
    }

    // If protected, password is required
    if (isProtected && !password) {
      return next(
        new AppError("Password is required for protected texts", 400)
      );
    }

    // Generate access token
    const accessToken = generateAccessToken();

    // Calculate expiration date
    let expiresAt: Date;

    if (customExpiryDate) {
      // Use custom expiry date if provided
      expiresAt = new Date(customExpiryDate);
      if (isNaN(expiresAt.getTime())) {
        return next(new AppError("Invalid custom expiry date", 400));
      }

      // Ensure date is in the future
      if (expiresAt <= new Date()) {
        return next(new AppError("Expiry date must be in the future", 400));
      }
    } else {
      // Use expiration minutes
      expiresAt = new Date();
      const minutes = expirationMinutes || 60; // Default to 1 hour if not specified
      expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
    }

    // Detect if content is potentially markdown (only as fallback)
    const hasMarkdown = isMarkdown === true || /[*#`>-]/.test(content);

    // Ensure user ID is properly set if user is authenticated
    const userId = req.user?.id || null;

    // Log text creation details
    console.log("Creating text with the following details:");
    console.log("- User ID:", userId);
    console.log("- Access Token:", accessToken);
    console.log("- Is Protected:", isProtected);
    console.log("- Has Markdown:", hasMarkdown);
    console.log("- isMarkdown flag from client:", isMarkdown);

    // Create text
    const text = await Text.create({
      content,
      encryptionKey,
      accessToken,
      userId, // Use the extracted userId
      isProtected,
      password,
      maxViews,
      viewOnce,
      expiresAt,
      isMarkdown: hasMarkdown,
    });

    // Cast to IText to access properties
    const textDoc = text as unknown as IText;

    console.log("Text created successfully with ID:", textDoc._id);

    const shareUrl = `${req.protocol}://${req.get("host")}/view/${
      textDoc.accessToken
    }`;

    res.status(201).json({
      success: true,
      data: {
        id: textDoc._id,
        accessToken: textDoc.accessToken,
        expiresAt: textDoc.expiresAt,
        shareUrl: shareUrl,
        isMarkdown: hasMarkdown,
      },
    });
  } catch (error) {
    console.error("Error in createText:", error);
    next(error);
  }
};

export const getText = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = performance.now();
  try {
    const { accessToken } = req.params;
    const password = req.headers["x-password"] as string;

    // Optimize query with lean() for better performance when password not needed
    const query = Text.findOne({ accessToken });

    // Only include password field if the header was provided
    if (password) {
      query.select("+password");
    }

    // Select only the required fields for better performance
    const text = await query
      .select(
        "content encryptionKey isProtected viewCount maxViews viewOnce expiresAt createdAt isMarkdown"
      )
      .lean();

    if (!text) {
      return next(new AppError("Text not found or has expired", 404));
    }

    // Check if text has expired
    if (new Date(text.expiresAt) < new Date()) {
      // Clean up expired text
      await Text.deleteOne({ accessToken });
      trackExecutionTime(startTime, `Get expired text (${accessToken})`);
      return next(new AppError("Text has expired and has been deleted", 404));
    }

    // Check if password is required and not provided
    if (text.isProtected && !password) {
      trackExecutionTime(
        startTime,
        `Password required for text (${accessToken})`
      );
      return next(new AppError("This text requires a password to access", 401));
    }

    // If password is provided, verify it
    if (text.isProtected && password) {
      // Need to fetch with password for verification (can't use lean here)
      const textWithPassword = await Text.findOne({ accessToken }).select(
        "+password"
      );

      if (!textWithPassword) {
        return next(new AppError("Text not found", 404));
      }

      const isPasswordValid = await textWithPassword.comparePassword(password);
      if (!isPasswordValid) {
        trackExecutionTime(
          startTime,
          `Invalid password for text (${accessToken})`
        );
        return next(new AppError("Invalid password", 401));
      }
    }

    // Check if max views reached
    if (text.maxViews && text.viewCount >= text.maxViews) {
      // Clean up if max views reached
      await Text.deleteOne({ accessToken });
      trackExecutionTime(
        startTime,
        `Max views reached for text (${accessToken})`
      );
      return next(
        new AppError("Maximum views reached and text has been deleted", 404)
      );
    }

    // Increment view count
    await Text.updateOne({ accessToken }, { $inc: { viewCount: 1 } });

    // Updated view count
    const updatedViewCount = text.viewCount + 1;

    // Remaining views calculation
    const remainingViews = text.maxViews
      ? text.maxViews - updatedViewCount
      : null;

    // Prepare response
    const now = new Date();
    const expiresAt = new Date(text.expiresAt);
    const response = {
      success: true,
      data: {
        id: text._id,
        content: text.content,
        encryptionKey: text.encryptionKey,
        createdAt: text.createdAt,
        expiresAt: text.expiresAt,
        viewCount: updatedViewCount,
        isMarkdown: text.isMarkdown || false,
        isExpiringSoon: expiresAt.getTime() - now.getTime() < 3600000, // Less than 1 hour
        remainingViews: remainingViews,
      } as any, // Using any for flexibility
    };

    // If viewOnce is true, delete the text after viewing
    if (text.viewOnce && updatedViewCount > 0) {
      await Text.deleteOne({ accessToken });
      response.data.viewOnce = true;
      response.data.isDeleted = true;
    }

    trackExecutionTime(startTime, `Get text success (${accessToken})`);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Simple execution time tracking for performance monitoring
const trackExecutionTime = (startTime: number, operation: string) => {
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`${operation} completed in ${executionTime.toFixed(2)}ms`);
};

export const getUserTexts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = performance.now();
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Execute queries in parallel for better performance
    const [texts, totalTexts] = await Promise.all([
      Text.find({ userId: req.user?.id })
        .select(
          "_id accessToken isProtected viewCount maxViews viewOnce expiresAt createdAt isMarkdown"
        )
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean for better performance

      Text.countDocuments({ userId: req.user?.id }),
    ]);

    // Process texts to add calculated fields
    const now = new Date();
    const processedTexts = texts.map((text) => {
      // Calculate remaining views
      const remainingViews =
        text.maxViews && text.maxViews > 0
          ? text.maxViews - text.viewCount
          : null;

      // Check if text is expiring soon (within next 24 hours)
      const expiryDate = new Date(text.expiresAt);
      const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / 3600000;

      let status = "active";
      if (expiryDate < now) {
        status = "expired";
      } else if (remainingViews === 0) {
        status = "max-views-reached";
      } else if (hoursUntilExpiry < 24) {
        status = "expiring-soon";
      }

      return {
        ...text,
        remainingViews,
        status,
      };
    });

    trackExecutionTime(
      startTime,
      `Get user texts (page ${page}, limit ${limit})`
    );

    res.status(200).json({
      success: true,
      count: processedTexts.length,
      total: totalTexts,
      page,
      pages: Math.ceil(totalTexts / limit),
      data: processedTexts,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteText = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Enhanced logging for debugging
    console.log("Delete text request received:");
    console.log("- Text ID:", req.params.id);
    console.log("- User ID:", req.user?.id);
    console.log("- Request headers:", JSON.stringify(req.headers, null, 2));

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error(`Invalid MongoDB ID format: ${req.params.id}`);
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("Invalid text ID format", 400));
    }

    // Find the text first to check if it exists and belongs to the user
    const text = await Text.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).session(session);

    if (!text) {
      console.log(
        `Text not found - ID: ${req.params.id}, User ID: ${req.user.id}`
      );
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("Text not found", 404));
    }

    // Log that we found the text
    console.log(`Text found and will be deleted - ID: ${req.params.id}`);

    // Use deleteOne within the transaction for consistent deletion
    const deleteResult = await Text.deleteOne(
      { _id: req.params.id },
      { session }
    );

    if (deleteResult.deletedCount === 0) {
      console.log(`Failed to delete text - ID: ${req.params.id}`);
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("Failed to delete text", 500));
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Log the deletion success
    console.log(
      `Text ${req.params.id} successfully deleted by user ${req.user.id}`
    );

    res.status(200).json({
      success: true,
      message: "Text deleted successfully",
      data: {},
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error("Error in deleteText controller:", error);
    next(error);
  }
};

// New method to clear expired texts (can be run as a cron job)
export const clearExpiredTexts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await Text.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} expired texts`,
    });
  } catch (error) {
    next(error);
  }
};
