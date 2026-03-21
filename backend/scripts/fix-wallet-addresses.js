/**
 * Migration Script: Fix Invalid Wallet Addresses
 * 
 * This script identifies and fixes users with invalid wallet addresses
 * (addresses that don't match the format: 0x + 40 hex characters)
 * 
 * Usage: node scripts/fix-wallet-addresses.js
 */

import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/innervex';

// Ethereum wallet address validation regex
const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Generate a valid Ethereum-style wallet address
 */
function generateValidWallet() {
    return '0x' + crypto.randomBytes(20).toString('hex');
}

/**
 * Main migration function
 */
async function fixWalletAddresses() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all users
        const users = await User.find({});
        console.log(`📊 Found ${users.length} users in database\n`);

        let invalidCount = 0;
        let fixedCount = 0;
        let skippedCount = 0;

        for (const user of users) {
            const walletId = user.walletId;

            // Check if wallet is invalid or missing
            if (!walletId || !WALLET_REGEX.test(walletId)) {
                invalidCount++;
                
                console.log(`❌ Invalid wallet for user: ${user.name} (${user.email})`);
                console.log(`   Current: ${walletId || 'null'}`);
                
                // Generate new valid wallet
                const newWallet = generateValidWallet();
                user.walletId = newWallet;
                
                await user.save();
                fixedCount++;
                
                console.log(`   ✅ Fixed: ${newWallet}\n`);
            } else {
                skippedCount++;
            }
        }

        console.log('\n📈 Migration Summary:');
        console.log(`   Total users: ${users.length}`);
        console.log(`   Invalid wallets found: ${invalidCount}`);
        console.log(`   Fixed: ${fixedCount}`);
        console.log(`   Already valid: ${skippedCount}`);

        if (fixedCount > 0) {
            console.log('\n✨ Migration completed successfully!');
        } else {
            console.log('\n✅ No wallets needed fixing.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run migration
fixWalletAddresses();
