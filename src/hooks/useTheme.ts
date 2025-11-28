import { useCallback, useEffect, useState } from "react";

export type Theme = 'light' | 'dark' | 'auto';
const order: Theme[] = ['light', 'dark', 'auto'];

function getStoredTheme(storageKey: string): Theme | null {
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem(storageKey);
		if (stored && order.includes(stored as Theme)) {
			return stored as Theme;
		}
	}
	return null;
}

function applyThemeToDOM(theme: 'light' | 'dark') {
	if (typeof document !== 'undefined') {
		document.documentElement.setAttribute('data-theme', theme);
	}
}

function detectSystemTheme(): 'light' | 'dark' {
	if (typeof window !== 'undefined' && window.matchMedia) {
		try {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		} catch (e) {
			console.debug('[useTheme] detectSystem error', e);
			return 'light';
		}
	}
	return 'light';
}

export function useTheme(defaultTheme: Theme = 'auto', storageKey: string = 'ui-theme') {
	const getInitialTheme = useCallback((): Theme => {
		const storedTheme = getStoredTheme(storageKey);
		const initialTheme = storedTheme ?? defaultTheme;

		// Применяем тему при инициализации
		if (initialTheme === 'auto') {
			const systemTheme = detectSystemTheme();
			applyThemeToDOM(systemTheme);
		} else {
			applyThemeToDOM(initialTheme);
		}

		return initialTheme;
	}, [defaultTheme, storageKey]);

	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	// Обновляем DOM и localStorage при изменении состояния темы
	useEffect(() => {
		let themeToApply: 'light' | 'dark';

		if (theme === 'auto') {
			themeToApply = detectSystemTheme();
		} else {
			themeToApply = theme;
		}

		applyThemeToDOM(themeToApply);
		localStorage.setItem(storageKey, theme);
	}, [theme, storageKey]);

	// Эффект для отслеживания системной темы - активен только если theme === 'auto'
	useEffect(() => {
		// Если тема не 'auto', нам не нужно следить за системной темой
		if (theme !== 'auto' || typeof window === 'undefined') {
			return;
		}

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = () => {
			const systemTheme = detectSystemTheme();
			applyThemeToDOM(systemTheme);
		};

		handleChange();
		mediaQuery.addEventListener('change', handleChange);

		return () => {
			mediaQuery.removeEventListener('change', handleChange);
		};
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme(prev => {
			const currentIndex = order.indexOf(prev);
			const nextIndex = (currentIndex + 1) % order.length;
			return order[nextIndex];
		});
	}, []);

	return { theme, toggleTheme };
}