const path = require('path');

module.exports = {
    entry: './src-repository/v21.ts',
    mode: 'production',
    target: 'node',
    module: {
        rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }],
    },
    resolve: { extensions: ['.ts', '.js'] },
    output: {
        filename: 'repository.min.js',
        path: path.resolve(__dirname, 'dist'),
    },
    watch: true
};