const path = require('path');

const commonConfig = (name) => {
    return {
        entry: `./src/app-${name}.ts`,
        mode: 'production',
        target: 'node',
        module: {
            rules: [{ test: /\.ts$/, use: 'ts-loader' }],
        },
        resolve: { extensions: ['.ts', '.js'] },
        output: {
            filename: `app-${name}.js`,
            path: path.resolve(__dirname, 'dist'),
        }
    }
};

const allConfig = commonConfig('all')
// const downConfig = commonConfig('down')

module.exports = [allConfig]


