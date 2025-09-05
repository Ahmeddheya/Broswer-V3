import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@/shared/types';

interface UserProfileProps {
  user: User;
  onEditProfile: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onEditProfile }) => {
  return (
    <TouchableOpacity 
      onPress={onEditProfile}
      className="bg-white/5 rounded-2xl p-6 mx-5 mb-8 border border-white/10"
    >
      <View className="flex-row items-center">
        <View className="w-16 h-16 rounded-full bg-primary-500/20 items-center justify-center mr-4">
          {user.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <Ionicons name="person" size={32} color="#4285f4" />
          )}
        </View>
        
        <View className="flex-1">
          <Text className="text-xl font-bold text-white mb-1">
            {user.name}
          </Text>
          <Text className="text-sm text-white/70 mb-2">
            {user.email}
          </Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            <Text className="text-xs text-green-400 font-medium">
              Signed In
            </Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );
};