import js from '@eslint/js'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'raw/**', 'propuesta/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        window: 'readonly', document: 'readonly', localStorage: 'readonly',
        navigator: 'readonly', location: 'readonly', history: 'readonly',
        URLSearchParams: 'readonly', URL: 'readonly', IntersectionObserver: 'readonly',
        getComputedStyle: 'readonly', matchMedia: 'readonly',
        setTimeout: 'readonly', requestAnimationFrame: 'readonly',
        Intl: 'readonly', DeviceOrientationEvent: 'readonly', PointerEvent: 'readonly',
        console: 'readonly', process: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
    },
  },
]
