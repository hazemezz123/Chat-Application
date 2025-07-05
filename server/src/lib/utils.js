import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
  };

  res.cookie("jwt", token, cookieOptions);

  return token;
};

export const handleServerError = (res, error, context = "Unknown") => {
  console.error(`${context} Error:`, error?.message || error);
  return res.status(500).json({ message: "Internal Server Error" });
};
