var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var colors = require('colors/safe');
let allChunks = [];

function isVendor(module){
  return module.resource 
        && 
        ((module.resource.indexOf('node_modules/angular/') > -1 )||
        (module.resource.indexOf('node_modules/jquery/')>-1));
}

function moduleConsole(module){
  if(module && module.resource){
    let size = parseInt(module._source.size()/1000);
    let info =`moduleName:${module.resource}, moduleSize: ${  parseInt(module._source.size()/1000)} kb`;
    if(size>50){
      console.log(colors.red(info));
    }
    else{
      console.log(info)
    }
  }
}

module.exports = {
  devtool: 'sourcemap',
  entry: {
    vendor: ['angular', 'jquery']
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: [/app\/lib/, /node_modules\/(?!(fancyui)\/).*/], loader: 'ng-annotate!babel' },
      { test: /\.html$/, loader: 'raw' },
      { test: /\.less$/, loader: 'style!css!less' },
      { test: /\.css$/, loader: 'style!css' },
      // IMAGE
      {
        test: /.(gif|jpg|png)$/,
        loader: 'file?name=img-[hash].[ext]'
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: require.resolve('file-loader')
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.html',
      inject: 'body',
      excludeChunks:['vendor'],
      hash: true
    }),

    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    /**
     * 两个commons chunk, 第一个主要为了计算AllChunks
     */
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        if (module.chunks) {
          for (var i = 0, len = module.chunks.length; i < len; i++) {
            if (allChunks.indexOf(module.chunks[i].name) === -1) {
              allChunks.push(module.chunks[i].name);
            }
          }
        }
        
        moduleConsole(module);
        return isVendor(module);
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      chunks: allChunks,
      minChunks: function (module, count) {
        return count>=2 ;
      }
    })
  ]
};
