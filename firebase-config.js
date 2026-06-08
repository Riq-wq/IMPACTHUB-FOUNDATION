// Firebase Admin SDK Configuration
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const SERVICE_ACCOUNT_PATHS = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    path.join(__dirname, 'serviceAccountKey.json'),
    '/etc/secrets/serviceAccountKey.json'
].filter(Boolean);

let serviceAccountPath = null;
for (const p of SERVICE_ACCOUNT_PATHS) {
    if (fs.existsSync(p)) {
        serviceAccountPath = p;
        break;
    }
}

// Initialize Admin SDK
if (!admin.apps.length) {
    if (serviceAccountPath) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized with service account:', serviceAccountPath);
    } else {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
        console.log('Firebase Admin initialized with application default credentials');
    }
}

const db = admin.firestore();

class FirebaseDB {
    constructor() {
        this.transactionsCollection = 'transactions';
    }

    get collection() {
        return db.collection(this.transactionsCollection);
    }

    async saveTransaction(transactionData) {
        try {
            const docRef = await this.collection.add({
                ...transactionData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            console.log('Transaction saved to Firebase with ID:', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error saving transaction to Firebase:', error);
            throw error;
        }
    }

    async getTransaction(checkoutRequestId) {
        try {
            const snapshot = await this.collection
                .where('checkoutRequestId', '==', checkoutRequestId)
                .limit(1)
                .get();

            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Error getting transaction from Firebase:', error);
            throw error;
        }
    }

    async updateTransaction(checkoutRequestId, updateData) {
        try {
            const transaction = await this.getTransaction(checkoutRequestId);

            if (!transaction) {
                console.log('Transaction not found:', checkoutRequestId);
                return { success: false, message: 'Transaction not found' };
            }

            await this.collection.doc(transaction.id).update({
                ...updateData,
                updatedAt: new Date().toISOString()
            });

            console.log('Transaction updated in Firebase:', checkoutRequestId);
            return { success: true };
        } catch (error) {
            console.error('Error updating transaction in Firebase:', error);
            throw error;
        }
    }

    async getRecentTransactions(limitCount = 100) {
        try {
            const snapshot = await this.collection
                .orderBy('createdAt', 'desc')
                .limit(limitCount)
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting recent transactions from Firebase:', error);
            throw error;
        }
    }

    async getAllTransactions() {
        try {
            const snapshot = await this.collection.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting all transactions from Firebase:', error);
            throw error;
        }
    }

    async getTransactionsByStatus(status) {
        try {
            const snapshot = await this.collection
                .where('status', '==', status)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error getting transactions by status from Firebase:', error);
            throw error;
        }
    }

    async getStatistics() {
        try {
            const transactions = await this.getAllTransactions();

            const completed = transactions.filter(t => t.status === 'completed');
            const pending = transactions.filter(t => t.status === 'pending');
            const failed = transactions.filter(t => t.status === 'failed');
            const totalAmount = completed.reduce((sum, t) => sum + (t.amount || 0), 0);

            return {
                totalTransactions: transactions.length,
                completedCount: completed.length,
                pendingCount: pending.length,
                failedCount: failed.length,
                totalAmount,
                averageAmount: completed.length > 0 ? totalAmount / completed.length : 0
            };
        } catch (error) {
            console.error('Error getting statistics from Firebase:', error);
            throw error;
        }
    }

    async cleanupOldTransactions(daysOld = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const snapshot = await this.collection
                .where('createdAt', '<', cutoffDate.toISOString())
                .where('status', '==', 'failed')
                .get();

            let count = 0;
            const batch = db.batch();

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
                count++;
            });

            if (count > 0) await batch.commit();
            console.log(`Cleaned up ${count} old transactions from Firebase`);
            return count;
        } catch (error) {
            console.error('Error cleaning up old transactions from Firebase:', error);
            return 0;
        }
    }
}

module.exports = FirebaseDB;
