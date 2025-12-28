import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    // 1. Базовые настройки для JS и TS
    js.configs.recommended,
    ...tseslint.configs.recommended,

    {
        // Применяем настройки ко всем нужным файлам
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        languageOptions: {
            globals: {
                ...globals.node,
                // Добавляем глобальные переменные браузера для использования в page.evaluate()
                ...globals.browser,
            },
            ecmaVersion: 'latest',
            sourceType: 'module',
            // Настройка парсера уже встроена в tseslint.configs.recommended,
            // но если нужно явно — указываем так:
            parser: tseslint.parser,
        },
        rules: {
            'no-console': 'warn', // Выдаст ошибку на твой console.log
            'no-unused-vars': 'off', // Отключаем стандартный, так как используем TS версию
            'no-undef': 'error',
            'no-duplicate-imports': 'error',
        },
    },

    // 2. Специфичные правила для TypeScript
    {
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn', // Выдаст предупреждение на твой 'any'
            '@typescript-eslint/explicit-function-return-type': [
                'error',
                {
                    allowExpressions: true,
                    allowTypedFunctionExpressions: true,
                    allowHigherOrderFunctions: true,
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
    },
);
