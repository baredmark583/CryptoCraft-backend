"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    moduleFileExtensions: ['js', 'json', 'ts'],
    testRegex: '.*\\.spec\\.ts$',
    collectCoverageFrom: ['<rootDir>/src/**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map