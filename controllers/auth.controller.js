const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { dburl, secretKey } = require("../utils");
const { users } = require("../models/schema");
const { eq } = require("drizzle-orm");
const mailer = require("../config/emailverfiy");
const { generateOtp } = require("../utils/otpgenerator");
const jwt = require("jsonwebtoken");
const sql = neon(dburl);
const db = drizzle(sql);
// ✅ Handle both Registration and Login OTP on the same page
exports.handleOtp = async (req, res) => {
    const { email, name } = req.body;
    try {
        // Check if the user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, email));

        if (existingUser.length > 0) {
            // User exists, send login OTP
            const { otp, expiresAt } = generateOtp();

            // Update the OTP for the user
            await db.update(users)
                .set({ otp, otpExpiresAt: expiresAt })
                .where(eq(users.email, email));

            // Send OTP via email
            const msg = `<h3>Login OTP</h3>
                         <p>Your OTP is: <strong>${otp}</strong></p>
                         <p>This OTP is valid for 2 minutes.</p>`;
            await mailer.emailMail(email, "Login OTP", msg);

            return res.status(200).json({
                message: "Login OTP has been sent.",
                action: "login", // Action for the client to know it's for login OTP
            });
        } else {
            // User doesn't exist, proceed with registration
            const { otp, expiresAt } = generateOtp();

            // Create new user with OTP
            const result = await db.insert(users).values({
                name: "User",
                email,
                otp,
                otpExpiresAt: expiresAt,
            }).returning();
            // console.log("User inserted successfully:", result);
            // Send registration OTP via email
            const msg = `<h3>Dear User,</h3>
                         <p>Your OTP for registration is: <strong>${otp}</strong></p>
                         <p>This OTP is valid for 2 minutes.</p>`;
            await mailer.emailMail(email, "Registration OTP", msg);

            return res.status(201).json({
                message: "Registration OTP has been sent.",
                action: "register", // Action for the client to know it's for registration OTP
            });
        }
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
// ✅ Verify OTP and complete registration/login
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const result = await db.select().from(users).where(eq(users.email, email));
        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result[0];

        // Check OTP expiration
        const now = Date.now();
        const expires = new Date(user.otpExpiresAt).getTime();
        if (now > expires) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // OTP is valid, now complete the process
        if (user.isVerified) {
            // Login successful
            const token = jwt.sign(
                { userId: user.id, name: user.name, email: user.email },
                secretKey,
                { expiresIn: "1d" }
            );

            // Set token in cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });

            return res.status(200).json({
                message: "Login successful",
                token,
                action: "login", // Specify login completion
            });
        } else {
            // Complete registration and mark user as verified
            await db.update(users)
                .set({ isVerified: true, otp: '', otpExpiresAt: new Date(0) })
                .where(eq(users.email, email));

            const token = jwt.sign(
                { userId: user.id, name: user.name, email: user.email },
                secretKey,
                { expiresIn: "1d" }
            );

            // Set token in cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });

            return res.status(200).json({
                message: "Registration successful",
                token,
                action: "register", // Specify registration completion
            });
        }

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
// ✅ Access Profile
exports.AccessProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized access" });
        }
        // Fetch fresh user data from database
        const freshUserData = await db.select()
            .from(users)
            .where(eq(users.id, user.userId));

        if (freshUserData.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "Your Profile",
            data: freshUserData[0],
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            data: error.message,
        });
    }
};
// ✅ Updata Profile
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId; // decoded from JWT

        await db.update(users)
            .set({ name })
            .where(eq(users.id, userId));

        res.json({ message: "Name updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// ✅ Logout access profile
exports.LogoutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    });
    return res.status(200).json({ message: "Logged out successfully" });
};


