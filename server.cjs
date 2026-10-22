const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {execFile,execFileSync}=require('node:child_process');
const {buildSync}=require('esbuild');
const ROOT=__dirname,CATALOG=path.join(ROOT,'public','\u5546\u54c1\u76ee\u5f55.json'),PORT=Number(process.env.PORT)||4174;
const COLORS=['#f06a42','#c35c38','#315fb4','#8b5cf6','#0f766e','#ca8a04','#be185d','#2563eb','#4d7c0f','#c2410c'];
let job={status:'idle',message:'\u8bf7\u81f3\u5c11\u9009 1 \u4e2a\u5546\u54c1',output:'',cover:'',props:'',phase:'idle',startedAt:0};
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav','.m4a':'audio/mp4','.mp4':'video/mp4'};
execFileSync(process.env.PYTHON||'python',[path.join(ROOT,'tools','prepare_logos.py')],{cwd:ROOT,windowsHide:true});
const logoAssets=JSON.parse(fs.readFileSync(path.join(ROOT,'src','logo-assets.json'),'utf8'));
function getPreviewBundle(){return buildSync({entryPoints:[path.join(ROOT,'src','preview.tsx')],bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}}).outputFiles[0].contents;}
function stockState(stock){
  const value=String(stock==null?'':stock).trim();
  if(/^\d+(?:\.\d+)?/.test(value))return 'available';
  if(/\u7f3a\u8d27|\u552e\u7f44|\u65e0\u8d27/.test(value))return 'out-of-stock';
  return 'unknown';
}
function readCatalog(){return JSON.parse(fs.readFileSync(CATALOG,'utf8')).products.map(product=>{const image=logoAssets['assets/'+product.image]?logoAssets['assets/'+product.image].replace(/^assets\//,''):product.image;const status=stockState(product.stock);return {...product,image,shortTitle:product.shortTitle||product.displayTitle,stockStatus:status,selectable:status==='available'}})}
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data))}
function downloadInfo(file){return file?{url:'/api/download?file='+encodeURIComponent(path.basename(file)),filename:path.basename(file)}:null}
function body(req){return new Promise((resolve,reject)=>{let value='';req.on('data',chunk=>value+=chunk);req.on('end',()=>resolve(value));req.on('error',reject)})}
function assets(folder,extension){const location=path.join(ROOT,'public','assets',folder);return fs.existsSync(location)?fs.readdirSync(location,{withFileTypes:true}).filter(entry=>entry.isFile()&&extension.test(entry.name)).map(entry=>entry.name):[]}
async function uploadAsset(req,res){
  const origin=req.headers.origin;
  if(origin&&origin!=='http://'+req.headers.host)return json(res,403,{error:'不允许跨站上传'});
  if(req.headers['content-type']!=='application/octet-stream')return json(res,415,{error:'请使用素材上传功能提交文件'});
  const params=new URL(req.url,'http://localhost').searchParams,folder=params.get('type'),filename=params.get('name')||'';
  const allowed={background:/\.(png|jpe?g|webp)$/i,bgm:/\.(mp3|wav|m4a)$/i};
  if(!Object.hasOwn(allowed,folder)||!filename||filename.length>180||/[<>:"/\\|?*\x00-\x1f]/.test(filename)||!allowed[folder].test(filename))return json(res,400,{error:'请选择正确的素材类型和文件格式'});
  const limit=(folder==='background'?20:50)*1024*1024;
  if(Number(req.headers['content-length'])>limit)return json(res,413,{error:'文件过大：背景图最多 20 MB，音乐最多 50 MB'});
  const chunks=[];let size=0;
  for await(const chunk of req){
    size+=chunk.length;
    if(size>limit){json(res,413,{error:'文件超过大小限制'});return}
    chunks.push(chunk);
  }
  const buffer=Buffer.concat(chunks),extension=path.extname(filename).toLowerCase();
  const isRiff=buffer.toString('ascii',0,4)==='RIFF';
  const signatures={
    '.png':buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
    '.jpg':buffer[0]===255&&buffer[1]===216&&buffer[2]===255,
    '.jpeg':buffer[0]===255&&buffer[1]===216&&buffer[2]===255,
    '.webp':isRiff&&buffer.toString('ascii',8,12)==='WEBP',
    '.wav':isRiff&&buffer.toString('ascii',8,12)==='WAVE',
    '.mp3':buffer.toString('ascii',0,3)==='ID3'||(buffer[0]===255&&(buffer[1]&224)===224),
    '.m4a':buffer.toString('ascii',4,8)==='ftyp'
  };
  if(size<12||!signatures[extension])return json(res,415,{error:'文件内容与格式不符，请上传有效的图片或音频'});
  const directory=path.join(ROOT,'public','assets',folder);
  await fs.promises.mkdir(directory,{recursive:true});
  let savedName=filename;
  for(;;){
    try{await fs.promises.writeFile(path.join(directory,savedName),buffer,{flag:'wx'});break}
    catch(error){if(error.code!=='EEXIST')throw error;savedName=path.basename(filename,extension)+'_'+randomUUID().slice(0,8)+extension}
  }
  return json(res,201,{folder,filename:savedName,message:'素材上传成功'});
}
function prepareInput(data){
  const catalog=readCatalog();
  const items=[...new Set(data.ids||[])].map(id=>catalog.find(product=>product.id===Number(id))).filter(Boolean).slice(0,10);
  const backgrounds=assets('background',/\.(png|jpe?g|webp)$/i),bgms=assets('bgm',/\.(mp3|wav|m4a)$/i);
  const videoConfig={template:data.template==='information'?'information':'catalog',hookTitle:String(data.hookTitle||'').trim().slice(0,36),hookSubtitle:String(data.hookSubtitle||'').trim().slice(0,60),infoCards:Array.isArray(data.infoCards)?data.infoCards.map(value=>String(value).trim().slice(0,40)).filter(Boolean).slice(0,2):[],outroBrand:String(data.outroBrand||'HellosAI').trim().slice(0,24),outroText:String(data.outroText||'\u9700\u8981\u5b8c\u6574\u65b9\u6848\uff0c\u8bf7\u770b\u4e3b\u9875\u7b80\u4ecb\u6216\u7f6e\u9876\u8bc4\u8bba').trim().slice(0,40),storeUrl:String(data.storeUrl||'https://www.16688.com.cn/shop/S393570').trim().slice(0,160),showStoreUrl:data.showStoreUrl===true,showFollowHint:data.showFollowHint!==false,durationMode:data.durationMode==='standard'?'standard':'auto'};
  return {products:items.map((product,index)=>({id:product.id,title:product.displayTitle,label:product.label,price:product.price,image:product.image?'assets/'+product.image:'',facts:product.facts,color:COLORS[index%COLORS.length]})),renderConfig:{background:data.background&&backgrounds.includes(data.background)?'assets/background/'+data.background:null,bgm:data.bgm&&bgms.includes(data.bgm)?'assets/bgm/'+data.bgm:null},videoConfig};
}
function runRemotion(args){return new Promise((resolve,reject)=>{execFile(process.execPath,[path.join(path.dirname(require.resolve('@remotion/cli/package.json')),'remotion-cli.js'),...args],{cwd:ROOT,windowsHide:true,maxBuffer:8*1024*1024,timeout:15*60*1000,killSignal:'SIGTERM'},(error,stdout,stderr)=>error?reject(new Error(((stdout||'')+(stderr||'')+error.message).slice(-1800))):resolve())})}
function outputStamp(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).reduce((result,part)=>{result[part.type]=part.value;return result},{});
  return parts.year+parts.month+parts.day+'_'+parts.hour+parts.minute+parts.second;
}
function nextOutputStem(directory){
  const base=path.join(directory,'HellosAI_Promo_'+outputStamp());
  if(!fs.existsSync(base+'.mp4')&&!fs.existsSync(base+'_cover.png')&&!fs.existsSync(base+'_props.json'))return base;
  for(let index=2;;index++){
    const stem=base+'_'+String(index).padStart(2,'0');
    if(!fs.existsSync(stem+'.mp4')&&!fs.existsSync(stem+'_cover.png')&&!fs.existsSync(stem+'_props.json'))return stem;
  }
}
async function render(inputProps){
  const directory=path.join(ROOT,'output');fs.mkdirSync(directory,{recursive:true});
  const stem=nextOutputStem(directory),output=stem+'.mp4',cover=stem+'_cover.png',propsFile=stem+'_props.json';
  const startedAt=Date.now();let heartbeat;
  job={status:'rendering',message:'\u6b63\u5728\u751f\u6210 '+inputProps.products.length+' \u4e2a\u5546\u54c1\u7684\u5c01\u9762\uff0c\u8bf7\u7a0d\u5019\u2026',output:'',cover:'',props:propsFile,phase:'cover',startedAt};
  heartbeat=setInterval(()=>{if(job.status==='rendering'){const seconds=Math.floor((Date.now()-startedAt)/1000);job.message=(job.phase==='cover'?'\u6b63\u5728\u751f\u6210\u5c01\u9762':'\u6b63\u5728\u7f16\u7801 MP4')+'\uff0c\u5df2\u7528 '+seconds+' \u79d2';}},1000);
  try{
    fs.writeFileSync(propsFile,JSON.stringify(inputProps,null,2),'utf8');
    await runRemotion(['still','ShopPromoGenerator',cover,'--frame=78','--props='+propsFile,'--log=error']);
    if(!fs.existsSync(cover))throw new Error('\u5c01\u9762\u751f\u6210\u5b8c\u6210\u4f46\u672a\u627e\u5230\u5c01\u9762\u6587\u4ef6');
    job.phase='video';job.message='\u6b63\u5728\u7f16\u7801 '+inputProps.products.length+' \u4e2a\u5546\u54c1\u7684 MP4 \u89c6\u9891\u2026';
    const concurrency=Math.min(4,Math.max(1,inputProps.products.length));
    await runRemotion(['render','ShopPromoGenerator',output,'--props='+propsFile,'--concurrency='+concurrency,'--log=error']);
    if(!fs.existsSync(output))throw new Error('MP4\u751f\u6210\u5b8c\u6210\u4f46\u672a\u627e\u5230\u89c6\u9891\u6587\u4ef6');
    if(!fs.existsSync(propsFile))throw new Error('\u89c6\u9891\u751f\u6210\u5b8c\u6210\u4f46\u672a\u627e\u5230JSON\u6570\u636e\u6587\u4ef6');
    job={status:'done',message:'\u89c6\u9891\u3001\u5c01\u9762\u548cJSON\u6570\u636e\u5747\u5df2\u751f\u6210',output,cover,props:propsFile,phase:'done',startedAt};
  }catch(error){job={status:'error',message:error.message,output:fs.existsSync(output)?output:'',cover:fs.existsSync(cover)?cover:'',props:fs.existsSync(propsFile)?propsFile:'',phase:'error',startedAt};}finally{if(heartbeat)clearInterval(heartbeat)}
}

http.createServer(async(req,res)=>{
  try{
    const route=(req.url||'/').split('?')[0];
    if(route==='/web/preview.js'){res.writeHead(200,{'Content-Type':MIME['.js'],'Cache-Control':'no-store'});return res.end(getPreviewBundle())}
    if(route==='/api/upload'&&req.method==='POST')return await uploadAsset(req,res);
    if(route==='/api/assets')return json(res,200,{backgrounds:assets('background',/\.(png|jpe?g|webp)$/i),bgms:assets('bgm',/\.(mp3|wav|m4a)$/i)});
    if(route==='/api/products')return json(res,200,{products:readCatalog()});
    if(route==='/api/status')return json(res,200,{...job,downloads:{video:downloadInfo(job.output),cover:downloadInfo(job.cover),props:downloadInfo(job.props)}});
    if(route==='/api/download'){
      if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'Method not allowed'});
      const filename=new URL(req.url,'http://localhost').searchParams.get('file')||'';
      if(!/^HellosAI_Promo_\d{8}_\d{6}(?:_\d+)?(?:\.mp4|_cover\.png|_props\.json)$/.test(filename))return json(res,404,{error:'Not found'});
      const directory=path.resolve(ROOT,'output'),file=path.resolve(directory,filename);
      if(!fs.existsSync(file)||!fs.statSync(file).isFile())return json(res,404,{error:'Not found'});
      const relative=path.relative(fs.realpathSync(directory),fs.realpathSync(file));
      if(relative.startsWith('..')||path.isAbsolute(relative))return json(res,404,{error:'Not found'});
      res.writeHead(200,{'Content-Type':MIME[path.extname(file)],'Content-Length':fs.statSync(file).size,'Content-Disposition':'attachment; filename="'+filename+'"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      if(req.method==='HEAD')return res.end();
      const stream=fs.createReadStream(file);
      stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());
      return stream.pipe(res);
    }
    if(route==='/api/refresh'&&req.method==='POST'){execFile(process.execPath,['catalog.cjs'],{cwd:ROOT,windowsHide:true},(error,stdout,stderr)=>error?json(res,500,{error:stderr||error.message}):json(res,200,{products:readCatalog().length}));return}
    if((route==='/api/preview'||route==='/api/render')&&req.method==='POST'){
      if(route==='/api/render'&&job.status==='rendering')return json(res,409,{error:'\u6b63\u5728\u6e32\u67d3\uff0c\u8bf7\u7a0d\u5019'});
      const inputProps=prepareInput(JSON.parse(await body(req)));
      if(route==='/api/preview')return json(res,200,{inputProps});
      if(!inputProps.products.length)return json(res,400,{error:'\u8bf7\u81f3\u5c11\u9009\u62e9 1 \u4e2a\u5546\u54c1'});
      render(inputProps);return json(res,202,{message:'started'});
    }
    const pathname=decodeURIComponent(route);
    const file=pathname==='/'?path.join(ROOT,'web','index.html'):path.resolve(ROOT,pathname.replace(/^\//,''));
    const relative=path.relative(ROOT,file);
    if(relative.startsWith('..')||path.isAbsolute(relative)||!fs.existsSync(file)||!fs.statSync(file).isFile())return json(res,404,{error:'Not found'});
    res.writeHead(200,{'Content-Type':MIME[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(fs.readFileSync(file));
  }catch(error){json(res,500,{error:error.message})}
}).listen(PORT,()=>console.log('HellosAI: http://localhost:'+PORT));



