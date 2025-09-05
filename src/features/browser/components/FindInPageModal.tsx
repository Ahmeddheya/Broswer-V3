import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from '@/shared/ui/inputs/TextInput';
import { Button } from '@/shared/ui/buttons/Button';

interface FindInPageModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (text: string) => void;
  onClear: () => void;
}

export const FindInPageModal: React.FC<FindInPageModalProps> = ({
  visible,
  onClose,
  onSearch,
  onClear,
}) => {
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (visible) {
      setSearchText('');
    }
  }, [visible]);

  const handleSearch = () => {
    if (searchText.trim()) {
      onSearch(searchText.trim());
    }
  };

  const handleClose = () => {
    onClear();
    setSearchText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-background-secondary rounded-t-3xl p-6 border-t border-white/10">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-white">Find in Page</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <TextInput
            placeholder="Search in page..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            leftIcon="search"
            autoFocus
            returnKeyType="search"
          />

          {/* Buttons */}
          <View className="flex-row space-x-3 mt-4">
            <Button
              title="Search"
              onPress={handleSearch}
              disabled={!searchText.trim()}
              className="flex-1"
              gradient
            />
            <Button
              title="Clear"
              onPress={() => {
                onClear();
                setSearchText('');
              }}
              variant="outline"
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};