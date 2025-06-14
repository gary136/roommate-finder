const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Simple schema without middleware for direct updates
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('TempUser', userSchema, 'users'); // Use existing users collection

async function fixDoubleHashedPasswords() {
  try {
    console.log('🔧 Fixing double-hashed passwords...');
    
    // Find the debug user specifically
    const debugUser = await User.findOne({ 'account.email': 'debug@example.com' });
    
    if (debugUser) {
      console.log('Found debug user, fixing password...');
      
      // Hash the original password correctly (just once)
      const salt = await bcrypt.genSalt(12);
      const correctHash = await bcrypt.hash('password123', salt);
      
      // Update directly in database
      await User.updateOne(
        { 'account.email': 'debug@example.com' },
        { $set: { 'account.password': correctHash } }
      );
      
      console.log('✅ Fixed debug user password');
    }
    
    // Also fix any other users that might have double-hashed passwords
    const allUsers = await User.find({ 'account.password': { $exists: true } });
    console.log(`Checking ${allUsers.length} users for double-hashing...`);
    
    for (const user of allUsers) {
      // If password is very long (>80 chars), it's likely double-hashed
      if (user.account.password.length > 80) {
        console.log(`Fixing potentially double-hashed password for: ${user.account.email}`);
        
        // Set a new known password for testing
        const salt = await bcrypt.genSalt(12);
        const newHash = await bcrypt.hash('password123', salt);
        
        await User.updateOne(
          { _id: user._id },
          { $set: { 'account.password': newHash } }
        );
        
        console.log(`✅ Reset password for: ${user.account.email}`);
      }
    }
    
    console.log('🎉 Password fix complete!');
    console.log('🧪 Test login now with: debug@example.com / password123');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
    process.exit(1);
  }
}

fixDoubleHashedPasswords();