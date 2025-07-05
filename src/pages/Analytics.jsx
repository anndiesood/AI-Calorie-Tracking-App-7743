import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import ReactECharts from 'echarts-for-react';
import { useMeal } from '../context/MealContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrendingUp, FiTrendingDown, FiTarget, FiCalendar } = FiIcons;

const Analytics = () => {
  const { meals, dailyGoal } = useMeal();
  const [timeRange, setTimeRange] = useState('7d');

  const getDaysData = (days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayMeals = meals.filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate >= startOfDay(date) && mealDate <= endOfDay(date);
      });
      
      const calories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
      const protein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);
      const carbs = dayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
      const fat = dayMeals.reduce((sum, meal) => sum + meal.fat, 0);
      
      data.push({
        date: format(date, 'MMM dd'),
        calories,
        protein,
        carbs,
        fat,
        mealCount: dayMeals.length
      });
    }
    return data;
  };

  const timeRanges = [
    { value: '7d', label: '7 Days', days: 7 },
    { value: '30d', label: '30 Days', days: 30 },
    { value: '90d', label: '90 Days', days: 90 }
  ];

  const currentRange = timeRanges.find(r => r.value === timeRange);
  const chartData = getDaysData(currentRange.days);

  const totalCalories = chartData.reduce((sum, day) => sum + day.calories, 0);
  const avgCalories = Math.round(totalCalories / chartData.length);
  const avgProtein = Math.round(chartData.reduce((sum, day) => sum + day.protein, 0) / chartData.length);
  const totalMeals = chartData.reduce((sum, day) => sum + day.mealCount, 0);

  const caloriesOption = {
    title: {
      text: 'Daily Calories',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = params[0];
        return `${data.name}<br/>Calories: ${data.value}<br/>Goal: ${dailyGoal}`;
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.date),
      axisLabel: { fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 12 }
    },
    series: [
      {
        data: chartData.map(d => d.calories),
        type: 'line',
        smooth: true,
        lineStyle: { color: '#0ea5e9', width: 3 },
        itemStyle: { color: '#0ea5e9' },
        areaStyle: { color: 'rgba(14, 165, 233, 0.1)' }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  };

  const macrosOption = {
    title: {
      text: 'Macronutrients',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = `${params[0].name}<br/>`;
        params.forEach(param => {
          result += `${param.seriesName}: ${param.value}g<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['Protein', 'Carbs', 'Fat'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.date),
      axisLabel: { fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 12 }
    },
    series: [
      {
        name: 'Protein',
        data: chartData.map(d => d.protein),
        type: 'bar',
        stack: 'macros',
        itemStyle: { color: '#22c55e' }
      },
      {
        name: 'Carbs',
        data: chartData.map(d => d.carbs),
        type: 'bar',
        stack: 'macros',
        itemStyle: { color: '#f59e0b' }
      },
      {
        name: 'Fat',
        data: chartData.map(d => d.fat),
        type: 'bar',
        stack: 'macros',
        itemStyle: { color: '#ef4444' }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    }
  };

  const stats = [
    {
      label: 'Avg Calories',
      value: avgCalories,
      unit: 'cal',
      icon: FiTarget,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
      trend: avgCalories > dailyGoal ? 'up' : 'down'
    },
    {
      label: 'Avg Protein',
      value: avgProtein,
      unit: 'g',
      icon: FiTrendingUp,
      color: 'text-success-500',
      bgColor: 'bg-success-50',
      trend: 'up'
    },
    {
      label: 'Total Meals',
      value: totalMeals,
      unit: 'meals',
      icon: FiCalendar,
      color: 'text-warning-500',
      bgColor: 'bg-warning-50',
      trend: 'up'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto px-4 py-6 space-y-6"
      style={{ paddingTop: '80px' }} // Add padding to account for fixed header
    >
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <motion.button
                key={range.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} rounded-lg p-4 text-center`}
            >
              <div className="flex items-center justify-center mb-2">
                <SafeIcon icon={stat.icon} className={`w-5 h-5 ${stat.color}`} />
                {stat.trend && (
                  <SafeIcon 
                    icon={stat.trend === 'up' ? FiTrendingUp : FiTrendingDown} 
                    className={`w-4 h-4 ml-1 ${stat.trend === 'up' ? 'text-success-500' : 'text-red-500'}`} 
                  />
                )}
              </div>
              <div className={`text-lg font-bold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">{stat.unit}</div>
              <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        {chartData.length > 0 ? (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <ReactECharts 
                option={caloriesOption} 
                style={{ height: '300px' }}
                opts={{ renderer: 'svg' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <ReactECharts 
                option={macrosOption} 
                style={{ height: '300px' }}
                opts={{ renderer: 'svg' }}
              />
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiTrendingUp} className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No data available</h3>
            <p className="text-gray-600">
              Start tracking your meals to see analytics
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Analytics;