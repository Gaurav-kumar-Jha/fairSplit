const mongoose = require('mongoose');
const User = require('./models/user');
const dotenv = require('dotenv');
dotenv.config();

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/expense-splitter';
mongoose.connect(dbUrl, {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async () => {
    console.log("Database connected");

    try {
        // Cleanup test user if exists
        await User.deleteOne({ username: 'testuser_verify' });

        // Register
        const user = new User({ email: 'test@test.com', username: 'testuser_verify' });
        const registeredUser = await User.register(user, 'password123');
        console.log("User registered:", registeredUser.username);

        // Authenticate (Simulating LocalStrategy)
        const { user: authenticatedUser } = await User.authenticate()('testuser_verify', 'password123');

        if (authenticatedUser) {
            console.log("Authentication successful for:", authenticatedUser.username);
        } else {
            console.error("Authentication failed");
        }

    } catch (e) {
        console.error("Verification failed:", e);
    } finally {
        mongoose.disconnect();
    }
});
