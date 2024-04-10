let proxyObj={};
proxyObj['/ws']={
  ws:true,
  target:"ws://localhost:8082"
};
proxyObj['/']={
  ws:false,
  target:'http://127.0.0.1:18080',
  changeOrigin: true,
  pathRewrite:{
    '^/':''
  }
}
module.exports={
  devServer:{
    host:'localhost',
    port:8080,
    proxy:proxyObj
  }
}
