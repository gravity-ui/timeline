import baseConfig from '@gravity-ui/eslint-config';

export default [
    ...baseConfig,
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