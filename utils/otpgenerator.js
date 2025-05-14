exports.generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);  // ✅ Correct: JS Date object
    return { otp, expiresAt };
};
