'use client';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', nextTheme);
    setTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-all shadow-sm"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
    >
      {theme === 'dark' ? (
        <svg className="w-4 h-4 fill-current text-zinc-300" viewBox="0 0 24 24">
          <path d="M21.64 13a1 1 0 00-1.05-.14 8.05 8.05 0 01-3.37.73A8.15 8.15 0 019.08 5.49a8.59 8.59 0 01.25-2A1 1 0 008 2.36a10.14 10.14 0 1014 11.69 1 1 0 00-.36-1.05z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 fill-current text-amber-500" viewBox="0 0 24 24">
          <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.415 1.415-2.122 2.121-1.414-1.414 2.121-2.122zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
