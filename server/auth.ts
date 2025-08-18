import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// In-memory users store for development when no DB is configured
// Stores hashed passwords like the DB would
const memUsers: Array<{
  id: string;
  email: string;
  name: string;
  mobile: string;
  password: string; // hashed
  emailNotifications: boolean;
  smsNotifications: boolean;
  createdAt: Date;
}> = [];

function findMemUserByEmail(email: string) {
  return memUsers.find((u) => u.email === email);
}

function findMemUserById(id: string) {
  return memUsers.find((u) => u.id === id);
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    mobile: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
}

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId, type: 'access' }, JWT_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: "7d" });
}

export function generateTokens(userId: string): { accessToken: string; refreshToken: string } {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId)
  };
}

export function verifyToken(token: string, expectedType?: 'access' | 'refresh'): { userId: string; type: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
    if (expectedType && decoded.type !== expectedType) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const storageInstance = req.app.get("db");
  const isMemMode = !storageInstance;

  // In-memory mode: require proper authentication
  if (isMemMode) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = verifyToken(token, 'access');
    if (!decoded) {
      return res.status(403).json({ message: "Invalid or expired access token" });
    }

    const mem = findMemUserById(decoded.userId);
    if (!mem) {
      return res.status(403).json({ message: "User not found" });
    }

    req.user = {
      id: mem.id,
      email: mem.email,
      name: mem.name,
      mobile: mem.mobile,
      emailNotifications: mem.emailNotifications,
      smsNotifications: mem.smsNotifications,
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const decoded = verifyToken(token, 'access');
  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired access token" });
  }

  try {
    const db = storageInstance?.getDb ? storageInstance.getDb() : storageInstance; // support PostgresStorage or raw db

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        mobile: users.mobile,
        emailNotifications: users.emailNotifications,
        smsNotifications: users.smsNotifications,
      })
      .from(users)
      .where(eq(users.id, decoded.userId));

    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication error" });
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function setupAuthRoutes(app: any, db: any) {
  // Register route
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, mobile, password, emailNotifications, smsNotifications } = req.body;

      const storage = app.get("db");
      const db = storage?.getDb ? storage.getDb() : storage;
      const isMemMode = !db;

      // Check if user already exists
      if (isMemMode) {
        const existingUser = findMemUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: "User already exists with this email" });
        }
      } else {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));
        if (existingUser) {
          return res.status(400).json({ message: "User already exists with this email" });
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const userId = randomUUID();
      let newUser: any;
      if (isMemMode) {
        const now = new Date();
        memUsers.push({
          id: userId,
          name,
          email,
          mobile,
          password: hashedPassword,
          emailNotifications: emailNotifications ?? true,
          smsNotifications: smsNotifications ?? true,
          createdAt: now,
        });
        newUser = {
          id: userId,
          name,
          email,
          mobile,
          emailNotifications: emailNotifications ?? true,
          smsNotifications: smsNotifications ?? true,
          createdAt: now,
        };
      } else {
        [newUser] = await db
          .insert(users)
          .values({
            id: userId,
            name,
            email,
            mobile,
            password: hashedPassword,
            emailNotifications: emailNotifications ?? true,
            smsNotifications: smsNotifications ?? true,
          })
          .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            mobile: users.mobile,
            emailNotifications: users.emailNotifications,
            smsNotifications: users.smsNotifications,
            createdAt: users.createdAt,
          });
      }

      // Generate tokens
      const tokens = generateTokens(userId);

      res.status(201).json({
        message: "User created successfully",
        user: newUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login route
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const storage = app.get("db");
      const db = storage?.getDb ? storage.getDb() : storage;
      const isMemMode = !db;

      // Find user
      let user: any;
      if (isMemMode) {
        user = findMemUserByEmail(email);
      } else {
        [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email));
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate tokens
      const tokens = generateTokens(user.id);

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current user route
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res: Response) => {
    res.json({ user: req.user });
  });

  // Refresh token route
  app.post("/api/auth/refresh", async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }

      const decoded = verifyToken(refreshToken, 'refresh');
      if (!decoded) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
      }

      const storage = app.get("db");
      const db = storage?.getDb ? storage.getDb() : storage;
      const isMemMode = !db;

      // Verify user still exists
      let user: any;
      if (isMemMode) {
        user = findMemUserById(decoded.userId);
      } else {
        [user] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            mobile: users.mobile,
            emailNotifications: users.emailNotifications,
            smsNotifications: users.smsNotifications,
          })
          .from(users)
          .where(eq(users.id, decoded.userId));
      }

      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      // Generate new tokens
      const tokens = generateTokens(decoded.userId);

      res.json({
        message: "Tokens refreshed successfully",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({ message: "Token refresh failed" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  });

  // Update user preferences
  app.patch("/api/auth/preferences", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { emailNotifications, smsNotifications } = req.body;
      const userId = req.user!.id;

      const storage = app.get("db");
      const db = storage?.getDb ? storage.getDb() : storage;
      const isMemMode = !db;

      let updatedUser: any;
      if (isMemMode) {
        const u = findMemUserById(userId);
        if (!u) return res.status(404).json({ message: 'User not found' });
        u.emailNotifications = emailNotifications ?? u.emailNotifications;
        u.smsNotifications = smsNotifications ?? u.smsNotifications;
        updatedUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          mobile: u.mobile,
          emailNotifications: u.emailNotifications,
          smsNotifications: u.smsNotifications,
        };
      } else {
        [updatedUser] = await db
          .update(users)
          .set({
            emailNotifications,
            smsNotifications,
          })
          .where(eq(users.id, userId))
          .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            mobile: users.mobile,
            emailNotifications: users.emailNotifications,
            smsNotifications: users.smsNotifications,
          });
      }

      res.json({
        message: "Preferences updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });
}