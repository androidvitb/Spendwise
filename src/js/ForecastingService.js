/**
 * Service for predictive financial modeling and budget forecasting.
 * Uses Linear Regression from the global 'ss' (simple-statistics) library.
 */
export class ForecastingService {
    constructor(transactions, budgets) {
        this.transactions = transactions;
        this.budgets = budgets;
        this.currentDate = new Date();
    }

    getMonthlyForecast() {
        const currentMonthData = this._getCurrentMonthData();
        
        if (currentMonthData.daysElapsed < 3) {
            return {
                status: 'INSUFFICIENT_DATA',
                message: "Need at least 3 days of data to forecast."
            };
        }

        // 1. Prepare time-series data
        const dailyTotals = this._aggregateDailySpending(currentMonthData.transactions);
        const trendData = this._prepareTrendData(dailyTotals);

        // 2. CHECK: Ensure library is loaded
        if (!window.ss) {
            console.error("Simple-Statistics library (ss) is missing!");
            return { status: 'ERROR', message: "Library missing" };
        }

        // 3. Calculate Linear Regression (Using window.ss)
        const regressionLine = window.ss.linearRegression(trendData);
        const regressionLineFn = window.ss.linearRegressionLine(regressionLine);

        // 4. Project to end of month
        const daysInMonth = this._getDaysInMonth();
        const predictedTotal = this._calculateProjection(regressionLineFn, daysInMonth, dailyTotals);

        // 5. Analyze Health
        const totalBudget = this._getTotalBudget();
        const healthStatus = this._analyzeHealth(predictedTotal, totalBudget);

        return {
            status: 'SUCCESS',
            currentSpend: currentMonthData.totalSpent,
            predictedTotal: predictedTotal,
            totalBudget: totalBudget,
            health: healthStatus,
            trendSlope: regressionLine.m,
            daysRemaining: daysInMonth - currentMonthData.daysElapsed
        };
    }

    _aggregateDailySpending(transactions) {
        const daysInMonth = this._getDaysInMonth();
        const dailyMap = new Array(daysInMonth).fill(0);

        transactions.forEach(t => {
            const date = new Date(t.date);
            const dayIndex = date.getDate() - 1;
            if (t.type === 'expense') {
                dailyMap[dayIndex] += t.amount;
            }
        });

        const cumulativeMap = [];
        let runningTotal = 0;
        dailyMap.forEach((dailyAmount, index) => {
            if (index < this.currentDate.getDate()) {
                runningTotal += dailyAmount;
                cumulativeMap.push({ day: index + 1, total: runningTotal });
            }
        });

        return cumulativeMap;
    }

    _prepareTrendData(cumulativeData) {
        return cumulativeData.map(d => [d.day, d.total]);
    }

    _calculateProjection(regressionFn, daysInMonth, cumulativeData) {
        let projection = regressionFn(daysInMonth);
        const currentTotal = cumulativeData[cumulativeData.length - 1].total;
        return Math.max(projection, currentTotal);
    }

    _getCurrentMonthData() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const activeTransactions = this.transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && 
                   d.getFullYear() === currentYear &&
                   t.type === 'expense';
        });

        const totalSpent = activeTransactions.reduce((sum, t) => sum + t.amount, 0);

        return {
            transactions: activeTransactions,
            totalSpent: totalSpent,
            daysElapsed: now.getDate()
        };
    }

    _getTotalBudget() {
        return Object.values(this.budgets).reduce((a, b) => a + b, 0) || 1000;
    }

    _getDaysInMonth() {
        return new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
    }

    _analyzeHealth(predicted, budget) {
        const ratio = predicted / budget;
        if (ratio > 1.1) return { status: 'DANGER', color: 'red', label: 'Over Budget' };
        if (ratio > 0.9) return { status: 'WARNING', color: 'orange', label: 'At Risk' };
        return { status: 'SAFE', color: 'green', label: 'On Track' };
    }
}