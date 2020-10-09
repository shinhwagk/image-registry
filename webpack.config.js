const path = require('path');

module.exports = {
    entry: `./src/app.ts`,
    mode: 'production',
    target: 'node',
    module: {
        rules: [{ test: /\.ts$/, use: 'ts-loader' }],
    },
    resolve: { extensions: ['.ts', '.js'] },
    output: {
        filename: `app.js`,
        path: path.resolve(__dirname, 'dist'),
    }
};
