import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof MD3LightTheme;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: MD3LightTheme,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [themeUpdate, setThemeUpdate] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      const themeChannel = supabase
        .channel(`profile_theme_changes_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new && payload.new.dark_mode !== undefined) {
              setThemeUpdate(payload.new.dark_mode);
            }
          }
        )
        .subscribe();

      fetchUserThemePreference();

      return () => {
        supabase.removeChannel(themeChannel);
      };
    }
  }, [user?.id]);

  // Apply theme updates when they arrive
  useEffect(() => {
    if (themeUpdate !== null) {
      setIsDarkMode(themeUpdate);
      setThemeUpdate(null);
    }
  }, [themeUpdate]);

  const fetchUserThemePreference = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('dark_mode')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;
      
      // Only update if we have a valid preference
      if (data?.dark_mode !== null && data?.dark_mode !== undefined) {
        setIsDarkMode(data.dark_mode);
      }
    } catch (error) {
      console.error('Error fetching theme preference:', error);
      // Fallback to system preference on error
      setIsDarkMode(systemColorScheme === 'dark');
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ dark_mode: newMode })
          .eq('id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating theme preference:', error);
        // Revert the theme if update fails
        setIsDarkMode(!newMode);
      }
    }
  };

  const theme = isDarkMode ? {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#22d3ee',
      secondary: '#38bdf8',
      background: '#121212',
      surface: '#1e1e1e',
      error: '#ef4444',
    },
  } : {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#0891b2',
      secondary: '#0ea5e9',
      background: '#ffffff',
      surface: '#ffffff',
      error: '#ef4444',
    },
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);