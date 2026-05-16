import jwt from "jsonwebtoken";

export function getUserFromToken(req: Request) {
  const cookie = req.headers.get("cookie");

  if (!cookie) return null;

  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
    };

    return decoded; // ✅ NOW RETURNS { userId, role }
  } catch {
    return null;
  }
}