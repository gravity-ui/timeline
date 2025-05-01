import baseConfig from '@gravity-ui/eslint-config';
import prettierConfig from '@gravity-ui/eslint-config/prettier';

export default [
    ...baseConfig,
    ...prettierConfig,
    {
        rules: {
            'curly': 'off',
            "@typescript-eslint/explicit-member-accessibility": [
                "error",
                {
                    "accessibility": "explicit",
                    "overrides": {
                        "accessors": "explicit",
                        "constructors": "no-public",
                        "methods": "explicit",
                        "properties": "off",
                        "parameterProperties": "explicit",
                    },
                }
            ]
        }
    }
]; 