import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput } from '@/shared/ui/inputs/TextInput';
import { Button } from '@/shared/ui/buttons/Button';
import { BookmarkItem } from '@/shared/types';

const bookmarkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Please enter a valid URL'),
  folder: z.string().min(1, 'Folder is required'),
  tags: z.string().optional(),
});

type BookmarkForm = z.infer<typeof bookmarkSchema>;

interface AddBookmarkModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (bookmark: Omit<BookmarkItem, 'id' | 'dateAdded'>) => void;
  existingFolders: string[];
  initialData?: Partial<BookmarkForm>;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  visible,
  onClose,
  onAdd,
  existingFolders,
  initialData,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [customFolder, setCustomFolder] = useState<string>('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookmarkForm>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: {
      title: initialData?.title || '',
      url: initialData?.url || '',
      folder: initialData?.folder || 'Default',
      tags: initialData?.tags || '',
    },
  });

  const onSubmit = (data: BookmarkForm) => {
    const finalFolder = customFolder || selectedFolder || data.folder;
    const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    
    onAdd({
      title: data.title,
      url: data.url,
      folder: finalFolder,
      tags,
    });
    
    reset();
    setSelectedFolder('');
    setCustomFolder('');
  };

  const handleClose = () => {
    reset();
    setSelectedFolder('');
    setCustomFolder('');
    onClose();
  };

  const predefinedFolders = ['Default', 'Work', 'Personal', 'Entertainment', 'News', 'Shopping'];
  const allFolders = [...new Set([...predefinedFolders, ...existingFolders])];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-background-secondary rounded-t-3xl p-6 border-t border-white/10 max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-white">Add Bookmark</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Form */}
            <View className="space-y-4">
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Title"
                    placeholder="Enter bookmark title"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.title?.message}
                    leftIcon="text-outline"
                  />
                )}
              />

              <Controller
                control={control}
                name="url"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="URL"
                    placeholder="https://example.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.url?.message}
                    leftIcon="link-outline"
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                )}
              />

              {/* Folder Selection */}
              <View>
                <Text className="text-white font-medium mb-2 text-base">Folder</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row space-x-2 mb-3">
                    {allFolders.map((folder) => (
                      <TouchableOpacity
                        key={folder}
                        onPress={() => {
                          setSelectedFolder(folder);
                          setCustomFolder('');
                        }}
                        className={`px-4 py-2 rounded-xl border ${
                          selectedFolder === folder
                            ? 'bg-primary-500/20 border-primary-500'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <Text
                          className={`font-medium ${
                            selectedFolder === folder ? 'text-primary-400' : 'text-white'
                          }`}
                        >
                          {folder}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                
                <TextInput
                  placeholder="Or create new folder..."
                  value={customFolder}
                  onChangeText={(text) => {
                    setCustomFolder(text);
                    setSelectedFolder('');
                  }}
                  leftIcon="folder-outline"
                />
              </View>

              <Controller
                control={control}
                name="tags"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Tags (optional)"
                    placeholder="work, important, reference (comma separated)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.tags?.message}
                    leftIcon="pricetags-outline"
                  />
                )}
              />
            </View>

            {/* Buttons */}
            <View className="flex-row space-x-3 mt-6">
              <Button
                title="Cancel"
                onPress={handleClose}
                variant="outline"
                className="flex-1"
              />
              <Button
                title="Add Bookmark"
                onPress={handleSubmit(onSubmit)}
                gradient
                className="flex-1"
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};