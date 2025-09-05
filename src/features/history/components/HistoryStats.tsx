import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HistoryItem } from '@/shared/types';
import { extractDomain } from '@/shared/lib/utils';

interface HistoryStatsProps {
  history: HistoryItem[];
}

export const HistoryStats: React.FC<HistoryStatsProps> = ({ history }) => {
  const totalVisits = history.reduce((sum, item) => sum + item.visitCount, 0);
  const uniqueSites = new Set(history.map(item => extractDomain(item.url))).size;
  const todayVisits = history.filter(item => {
    const today = new Date();
    const itemDate = new Date(item.timestamp);
    return itemDate.toDateString() === today.toDateString();
  }).length;

  const topSites = Object.entries(
    history.reduce((acc, item) => {
      const domain = extractDomain(item.url);
      acc[domain] = (acc[domain] || 0) + item.visitCount;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const stats = [
    { icon: 'globe-outline', label: 'Total Visits', value: totalVisits.toString() },
    { icon: 'library-outline', label: 'Unique Sites', value: uniqueSites.toString() },
    { icon: 'today-outline', label: 'Today', value: todayVisits.toString() },
  ];

  return (
    <View className="mb-6">
      {/* Stats Cards */}
      <View className="flex-row justify-between mb-4">
        {stats.map((stat, index) => (
          <View key={index} className="bg-white/5 rounded-xl p-4 flex-1 mx-1 border border-white/10">
            <View className="flex-row items-center mb-2">
              <Ionicons name={stat.icon as any} size={20} color="#4285f4" />
              <Text className="text-white/70 text-sm ml-2">{stat.label}</Text>
            </View>
            <Text className="text-white text-xl font-bold">{stat.value}</Text>
          </View>
        ))}
      </View>

      {/* Top Sites */}
      {topSites.length > 0 && (
        <View className="bg-white/5 rounded-xl p-4 border border-white/10">
          <Text className="text-white font-bold mb-3">Most Visited Sites</Text>
          {topSites.map(([domain, visits], index) => (
            <View key={domain} className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center flex-1">
                <Text className="text-primary-400 font-bold mr-3">#{index + 1}</Text>
                <Text className="text-white flex-1" numberOfLines={1}>{domain}</Text>
              </View>
              <Text className="text-white/60 text-sm">{visits} visits</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};