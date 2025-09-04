import { PaymentCard } from '../types/settings';
import { StorageManager } from './storage';

export class PaymentManager {
  private static readonly CARDS_KEY = 'payment_cards';

  // Save payment card
  static async saveCard(card: Omit<PaymentCard, 'id' | 'dateAdded'>): Promise<void> {
    try {
      // Validate card before saving
      if (!this.validateCardNumber(card.cardNumber)) {
        throw new Error('Invalid card number');
      }
      
      if (!this.validateExpiryDate(card.expiryDate)) {
        throw new Error('Invalid expiry date');
      }
      
      const cards = await this.getCards();
      
      // If this is set as default, remove default from others
      if (card.isDefault) {
        cards.forEach(c => c.isDefault = false);
      }

      const newCard: PaymentCard = {
        ...card,
        id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dateAdded: Date.now(),
        // Store last 4 digits only for security
        cardNumber: this.maskCardNumber(card.cardNumber),
      };

      cards.push(newCard);
      await StorageManager.setItem(this.CARDS_KEY, cards);
    } catch (error) {
      console.error('Failed to save card:', error);
      throw error;
    }
  }

  // Get all saved cards
  static async getCards(): Promise<PaymentCard[]> {
    return StorageManager.getItem<PaymentCard[]>(this.CARDS_KEY, []);
  }

  // Delete card
  static async deleteCard(id: string): Promise<void> {
    try {
      const cards = await this.getCards();
      const filtered = cards.filter(c => c.id !== id);
      await StorageManager.setItem(this.CARDS_KEY, filtered);
    } catch (error) {
      console.error('Failed to delete card:', error);
      throw error;
    }
  }

  // Update card
  static async updateCard(id: string, updates: Partial<PaymentCard>): Promise<void> {
    try {
      const cards = await this.getCards();
      const index = cards.findIndex(c => c.id === id);
      
      if (index >= 0) {
        // If setting as default, remove default from others
        if (updates.isDefault) {
          cards.forEach(c => c.isDefault = false);
        }
        
        cards[index] = { ...cards[index], ...updates };
        await StorageManager.setItem(this.CARDS_KEY, cards);
      }
    } catch (error) {
      console.error('Failed to update card:', error);
      throw error;
    }
  }

  // Mask card number for display
  private static maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 4) return cleaned;
    
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4);
    return `${masked}${lastFour}`;
  }

  // Detect card type
  static detectCardType(cardNumber: string): PaymentCard['cardType'] {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    if (cleaned.startsWith('6')) return 'discover';
    
    return 'visa'; // Default
  }

  // Validate card number using Luhn algorithm
  static validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  // Clear all cards
  static async clearAllCards(): Promise<void> {
    await StorageManager.setItem(this.CARDS_KEY, []);
  }
  
  // Validate expiry date
  private static validateExpiryDate(expiryDate: string): boolean {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(expiryDate)) return false;
    
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const cardYear = parseInt(year);
    const cardMonth = parseInt(month);
    
    if (cardYear < currentYear) return false;
    if (cardYear === currentYear && cardMonth < currentMonth) return false;
    
    return true;
  }
}