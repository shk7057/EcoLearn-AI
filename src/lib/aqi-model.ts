export interface HistoricalReading {
  date: string;
  aqi: number;
  hour?: number;
}

export class AQITrendModel {
  trained: boolean = false;
  slope: number = 0;
  volatility: number = 0;
  weeklyAvg: number = 0;
  weeklyMin: number = 0;
  weeklyMax: number = 0;
  bestDay: HistoricalReading | null = null;
  worstDay: HistoricalReading | null = null;

  train(historicalData: HistoricalReading[]) {
    if (!historicalData.length) return this;

    const n = historicalData.length;
    const avgAQI = historicalData.reduce((s, d) => s + d.aqi, 0) / n;

    // Slope calculation
    let sumXY = 0, sumX2 = 0;
    historicalData.forEach((d, i) => {
      sumXY += i * (d.aqi - avgAQI);
      sumX2 += i * i;
    });
    this.slope = sumX2 ? sumXY / sumX2 : 0;

    // Volatility = standard deviation
    const variance = historicalData.reduce((s, d) => s + Math.pow(d.aqi - avgAQI, 2), 0) / n;
    this.volatility = Math.sqrt(variance);

    this.weeklyAvg = avgAQI;
    this.weeklyMin = Math.min(...historicalData.map(d => d.aqi));
    this.weeklyMax = Math.max(...historicalData.map(d => d.aqi));
    this.bestDay = historicalData.reduce((best, d) => d.aqi < best.aqi ? d : best);
    this.worstDay = historicalData.reduce((worst, d) => d.aqi > worst.aqi ? d : worst);

    this.trained = true;
    return this;
  }

  analyze(todayAQI: number) {
    if (!this.trained) return null;

    const diffFromAvg = ((todayAQI - this.weeklyAvg) / this.weeklyAvg) * 100;
    const trend = this.slope > 2 ? 'WORSENING' : this.slope < -2 ? 'IMPROVING' : 'STABLE';

    return {
      trend,
      slope: this.slope,
      diffFromAvg: Math.round(diffFromAvg),
      weeklyAvg: Math.round(this.weeklyAvg),
      weeklyMin: this.weeklyMin,
      weeklyMax: this.weeklyMax,
      bestDay: this.bestDay!,
      worstDay: this.worstDay!,
      volatility: Math.round(this.volatility),
      isWorseToday: todayAQI > this.weeklyAvg,
      isBestDay: todayAQI <= this.weeklyMin,
      isWorstDay: todayAQI >= this.weeklyMax,
    };
  }

  generateTips(todayAQI: number, analysis: any) {
    const tips = [];
    if (analysis.trend === 'WORSENING') {
      tips.push({ icon: '📈', text: `AQI is worsening this week (avg: ${analysis.weeklyAvg})`, severity: 'high' });
      tips.push({ icon: '😷', text: 'Wear N95 mask — pollution trending up', severity: 'high' });
    }
    if (analysis.trend === 'IMPROVING') {
      tips.push({ icon: '📉', text: `Good news! AQI improving this week`, severity: 'low' });
    }
    if (analysis.diffFromAvg > 20) {
      tips.push({ icon: '⚠️', text: `Today is ${analysis.diffFromAvg}% worse than your weekly average`, severity: 'high' });
    }
    if (analysis.diffFromAvg < -20) {
      tips.push({ icon: '✅', text: `Today is ${Math.abs(analysis.diffFromAvg)}% better than usual`, severity: 'low' });
    }
    if (analysis.isBestDay) {
      tips.push({ icon: '🌟', text: 'Best air quality this week! Plan outdoor activities today', severity: 'low' });
    }
    if (analysis.isWorstDay) {
      tips.push({ icon: '🏠', text: 'Worst air quality this week. Stay indoors if possible', severity: 'high' });
    }
    if (analysis.volatility > 50) {
      tips.push({ icon: '📊', text: `AQI highly variable this week (±${analysis.volatility}). Check before going out`, severity: 'medium' });
    }
    tips.push({ icon: '📅', text: `Best day this week: ${analysis.bestDay.date} (AQI: ${analysis.bestDay.aqi})`, severity: 'info' });
    return tips;
  }
}