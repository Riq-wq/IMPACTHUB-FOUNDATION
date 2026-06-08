// Simple JSON-based database for M-Pesa transactions
const fs = require('fs').promises;
const path = require('path');

class TransactionDB {
    constructor() {
        this.dbPath = path.join(__dirname, 'data', 'transactions.json');
        this.ensureDataDirectory();
    }

    async ensureDataDirectory() {
        try {
            await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
        } catch (error) {
            console.error('Error creating data directory:', error);
        }
    }

    async loadTransactions() {
        try {
            const data = await fs.readFile(this.dbPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // File doesn't exist or is invalid, return empty object
            return {};
        }
    }

    async saveTransactions(transactions) {
        try {
            await fs.writeFile(this.dbPath, JSON.stringify(transactions, null, 2));
        } catch (error) {
            console.error('Error saving transactions:', error);
            throw error;
        }
    }

    async saveTransaction(transactionData) {
        try {
            const transactions = await this.loadTransactions();
            const transactionId = transactionData.checkoutRequestId || `TXN-${Date.now()}`;
            
            transactions[transactionId] = {
                ...transactionData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await this.saveTransactions(transactions);
            return transactionId;
        } catch (error) {
            console.error('Error saving transaction:', error);
            throw error;
        }
    }

    async getTransaction(transactionId) {
        try {
            const transactions = await this.loadTransactions();
            return transactions[transactionId] || null;
        } catch (error) {
            console.error('Error getting transaction:', error);
            return null;
        }
    }

    async updateTransaction(transactionId, updateData) {
        try {
            const transactions = await this.loadTransactions();
            
            if (transactions[transactionId]) {
                transactions[transactionId] = {
                    ...transactions[transactionId],
                    ...updateData,
                    updatedAt: new Date().toISOString()
                };
                
                await this.saveTransactions(transactions);
                return transactions[transactionId];
            }
            
            return null;
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    }

    async getTransactionsByStatus(status) {
        try {
            const transactions = await this.loadTransactions();
            return Object.values(transactions).filter(tx => tx.status === status);
        } catch (error) {
            console.error('Error getting transactions by status:', error);
            return [];
        }
    }

    async getRecentTransactions(limit = 50) {
        try {
            const transactions = await this.loadTransactions();
            return Object.values(transactions)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        } catch (error) {
            console.error('Error getting recent transactions:', error);
            return [];
        }
    }

    async cleanupOldTransactions(daysOld = 30) {
        try {
            const transactions = await this.loadTransactions();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const filteredTransactions = {};
            let cleanedCount = 0;

            for (const [id, transaction] of Object.entries(transactions)) {
                const transactionDate = new Date(transaction.createdAt);
                if (transactionDate > cutoffDate) {
                    filteredTransactions[id] = transaction;
                } else {
                    cleanedCount++;
                }
            }

            if (cleanedCount > 0) {
                await this.saveTransactions(filteredTransactions);
                console.log(`Cleaned up ${cleanedCount} old transactions`);
            }

            return cleanedCount;
        } catch (error) {
            console.error('Error cleaning up old transactions:', error);
            return 0;
        }
    }
}

module.exports = TransactionDB;
