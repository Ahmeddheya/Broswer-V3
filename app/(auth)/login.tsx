import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScreenLayout } from '@/shared/ui/layouts/ScreenLayout';
import { Button } from '@/shared/ui/buttons/Button';
import { TextInput } from '@/shared/ui/inputs/TextInput';
import { useAuthStore } from '@/shared/store/auth';
import { Ionicons } from '@expo/vector-icons';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      clearError();
      await login(data);
      router.replace('/(tabs)');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <ScreenLayout>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-primary-500/20 items-center justify-center mb-4">
              <Ionicons name="globe" size={40} color="#4285f4" />
            </View>
            <Text className="text-3xl font-bold text-white mb-2">Welcome Back</Text>
            <Text className="text-base text-white/70 text-center">
              Sign in to continue browsing
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <Text className="text-red-400 text-center">{error}</Text>
            </View>
          )}

          {/* Form */}
          <View className="space-y-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail-outline"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry={!showPassword}
                  leftIcon="lock-closed-outline"
                  rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
              )}
            />
          </View>

          {/* Login Button */}
          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            gradient
            className="mt-8"
          />

          {/* Register Link */}
          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-white/70">Don't have an account? </Text>
            <Button
              title="Sign Up"
              onPress={() => router.push('/(auth)/register')}
              variant="ghost"
              size="sm"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}