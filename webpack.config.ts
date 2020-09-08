import * as path from 'path';

import * as webpack from 'webpack';

const config: webpack.Configuration = {
    target: 'node',
    entry: './src/app.ts',
    output: {
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'out')
    },
    resolve: { extensions: ['.ts', '.js'] },
    module: { rules: [{ test: /\.ts$/, loader: 'ts-loader' }] }
};

export default config