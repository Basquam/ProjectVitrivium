// Platform-safe confirmation dialog - works on web and native
import { Alert, Platform } from 'react-native';

interface ConfirmButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void | Promise<void>;
}

export const confirmAction = (
  title: string,
  message: string,
  buttons: ConfirmButton[]
) => {
  if (Platform.OS === 'web') {
    // Find the primary action (not cancel)
    const primaryAction = buttons.find(b => b.style !== 'cancel');
    const cancelAction = buttons.find(b => b.style === 'cancel');
    
    // On web, use window.confirm
    const text = message ? `${title}\n\n${message}` : title;
    // eslint-disable-next-line no-alert
    const confirmed = typeof window !== 'undefined' && window.confirm(text);
    
    if (confirmed && primaryAction?.onPress) {
      primaryAction.onPress();
    } else if (!confirmed && cancelAction?.onPress) {
      cancelAction.onPress();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

export const notify = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined') window.alert(text);
  } else {
    Alert.alert(title, message || '');
  }
};
