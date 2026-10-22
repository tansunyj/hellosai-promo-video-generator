import {AbsoluteFill, Img, interpolate, spring, staticFile} from 'remotion';
import type {Product, VideoConfig} from './Video';

type SceneProps={frame:number;start:number;index:number;products:readonly Product[];frames:number;brand:string};
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const reveal=(frame:number,start:number,end:number)=>interpolate(frame,[start,end],[0,1],clamp);
const number=(value:number)=>String(value).padStart(2,'0');
const priceValue=(price:string)=>{const value=Number(String(price).replace(/[^0-9.]/g,''));return Number.isFinite(value)?value:null};
const sceneLine=(product:Product)=>{
  const title=String(product.title);
  if(/chatgpt|gpt|claude/i.test(title))return '适合写作 · 深度推理';
  if(/codex/i.test(title))return '适合开发 · 注册验证';
  if(/grok/i.test(title))return '适合检索 · 内容创作';
  if(/google|gmail|邮箱/i.test(title))return '适合账号 · 工具注册';
  if(/duolingo|多邻国/i.test(title))return '适合学习 · 日常使用';
  if(/steam/i.test(title))return '适合游戏 · 账号体验';
  return '按需选择 · 页面信息为准';
};
const lowestPrice=(products:readonly Product[])=>{
  const values=products.map(product=>priceValue(product.price)).filter((value):value is number=>value!==null);
  return values.length?Math.min(...values):null;
};
const ctaAction=(products:readonly Product[])=>lowestPrice(products)!==null&&lowestPrice(products)!<30?'查看本期低价方案':'查看完整方案清单';
const solutionLine=(product:Product)=>{
  const title=String(product.title),label=String(product.label),facts=product.facts.map(String).join(' ');
  if(/官方|直充/i.test(title+' '+label+' '+facts))return '官方直充 · 详情以页面为准';
  if(/质保|售后|退款/i.test(title+' '+label+' '+facts))return '售后说明 · 详情以页面为准';
  if(/成品号|账号|邮箱/i.test(title+' '+label))return '成品账号 · 到手查看详情';
  if(/礼品|链接/i.test(title+' '+label))return '礼品链接 · 按需选择';
  return facts.split(/[·，,。|]/).map(value=>value.trim()).find(Boolean)||'按需选择 · 页面信息为准';
};
const generatedHook=(products:readonly Product[])=>{
  const low=lowestPrice(products);
  return {
    title:low!==null&&low<10?'低预算也能用 AI？':products.length>=5?'AI 方案怎么选？':'国内想用 AI 怎么办？',
    subtitle:low!==null&&low<10?'从 ¥'+low.toFixed(2)+' 起 · 方案按需选':'现成方案 · 拍下即用 · 质保售后',
    badge:low!==null&&low<10?'低价起步 · '+products.length+' 项方案':'解决方案 · '+products.length+' 项速览'
  };
};
const fitHookText=(value:string,max:number)=>{const chars=Array.from(String(value).trim());return chars.length>max?chars.slice(0,max-1).join('')+'…':chars.join('')};const trustBadges=(products:readonly Product[])=>{
  const text=products.map(product=>[product.title,product.label,...product.facts].join(' ')).join(' ');
  return [
    /官方|直充/i.test(text)?'🛡️ 官方直充':'🛡️ 信息透明',
    /秒发|发货|现货|快速/i.test(text)?'⚡ 快速发货':'⚡ 按页面安排',
    /质保|售后|退款/i.test(text)?'🔒 质保售后':'🔒 售后说明清晰'
  ];
};const Logo:React.FC<{product:Product;size:number}>=({product,size})=>product.image?<Img src={staticFile(product.image)} style={{width:size,height:size,objectFit:'contain'}}/>:<div style={{fontSize:size*.45,fontWeight:900,color:product.color}}>{Array.from(product.title)[0]||'AI'}</div>;
export const Topline:React.FC<{brand:string;label:string}>=({brand,label})=><div style={{position:'absolute',top:80,left:72,right:72,display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontWeight:900,fontSize:29,letterSpacing:1}}>{brand}<span style={{color:'#ed714e'}}> /</span></span><span style={{fontSize:21,color:'#53616f'}}>{label}</span></div>;

export const MotionIntro:React.FC<{frame:number;products:readonly Product[];config:VideoConfig}>=({frame,products,config})=>{
  const logos=products.slice(0,4),columns=logos.length===1?1:2,generated=generatedHook(products),title=fitHookText(config.hookTitle||generated.title,12),subtitle=fitHookText(config.hookSubtitle||generated.subtitle,24),badge=fitHookText(generated.badge,22),priceStart=lowestPrice(products),gridOpacity=1;
  const badgePop=spring({frame,fps:24,config:{damping:10,stiffness:180}});
  const titlePop=spring({frame:Math.max(0,frame-3),fps:24,config:{damping:12,stiffness:155}});
  return <AbsoluteFill style={{opacity:interpolate(frame,[66,72],[1,0],clamp)}}>
    <Topline brand={config.outroBrand} label="本期AI工具清单"/>{logos.map((product,index)=>product.image?<Img key={'preload'+(product.id??product.title+'|'+product.image)} src={staticFile(product.image)} style={{position:'absolute',width:1,height:1,opacity:0}}/>:null)}
    <div style={{position:'absolute',left:72,right:72,top:210,transform:'translateY('+interpolate(frame,[0,8],[42,0],clamp)+'px)',opacity:reveal(frame,0,5)}}>
      <div style={{display:'inline-block',background:'#ed714e',color:'#fff',fontSize:25,fontWeight:900,borderRadius:40,padding:'13px 24px',transform:'scale('+interpolate(badgePop,[0,1],[.72,1])+')'}}>{badge}</div>
      <div style={{fontSize:title.length>12?68:82,lineHeight:1.18,fontWeight:900,letterSpacing:-2,marginTop:28,maxWidth:900,overflowWrap:'anywhere',transform:'scale('+interpolate(titlePop,[0,1],[.86,1])+')',transformOrigin:'left center'}}>{title}</div>
      <div style={{width:150,height:10,borderRadius:9,background:'#ed714e',marginTop:23,transformOrigin:'left',transform:'scaleX('+reveal(frame,3,12)+')'}}/>
      <div style={{display:'inline-block',fontSize:27,lineHeight:1.4,color:'#132338',fontWeight:800,marginTop:21,padding:'10px 18px',borderRadius:18,background:'rgba(255,255,255,.9)',opacity:reveal(frame,8,14),maxWidth:900,overflowWrap:'anywhere'}}>{subtitle}</div>{priceStart!==null&&<div style={{display:'inline-block',marginTop:16,padding:'10px 22px',borderRadius:24,background:'#132338',color:'#fff',fontSize:30,fontWeight:900,opacity:reveal(frame,10,16),transform:'scale('+interpolate(frame,[10,16],[.8,1],clamp)+')'}}>¥{priceStart.toFixed(2)} 起 · 预算锚点</div>}
    </div>
    <div style={{position:'absolute',left:72,right:72,top:680,height:logos.length<=2?650:850,display:'grid',opacity:gridOpacity,gridTemplateColumns:'repeat('+columns+',1fr)',gridTemplateRows:logos.length<=2?'1fr':'1fr 1fr',gap:24}}>
      {logos.map((product,index)=>{return <div key={(product.id??product.title+'|'+product.price)+'|'+index} style={{gridColumn:logos.length===3&&index===2?'1 / -1':undefined,width:logos.length===3&&index===2?'calc(50% - 12px)':undefined,justifySelf:logos.length===3&&index===2?'center':undefined,boxSizing:'border-box',padding:30,background:'rgba(255,255,255,.75)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,.9)',borderRadius:36,boxShadow:'0 8px 24px rgba(0,0,0,.06)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:23,opacity:1,transform:'translateY(0px) scale(1)'}}><Logo product={product} size={logos.length===1?260:180}/><div style={{fontSize:28,fontWeight:800,textAlign:'center',lineHeight:1.35,overflowWrap:'anywhere'}}>{product.title}</div><div style={{display:'inline-flex',alignItems:'center',gap:10,padding:'8px 18px',borderRadius:20,background:product.color,color:'#fff',fontSize:25,fontWeight:900,whiteSpace:'nowrap'}}>{product.price||'页面查看'}</div><div style={{width:50,height:5,borderRadius:5,background:product.color}}/></div>})}
    </div>
    <div style={{position:'absolute',left:72,right:72,bottom:138,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:23,color:'#132338',borderTop:'1px solid rgba(19,35,56,.25)',paddingTop:22,opacity:reveal(frame,18,24)}}><span>名称 · 方案 · 价格</span>{products.length>4?<span style={{padding:'10px 18px',borderRadius:22,background:'#132338',color:'#fff',fontWeight:900}}>更多方案 · 正片展示 {products.length} 项 →</span>:<span style={{fontWeight:900,color:'#ed714e'}}>👉 看看最后哪个最划算</span>}</div>
  </AbsoluteFill>;
};

export const MotionProduct:React.FC<SceneProps>=({frame,start,index,products,frames,brand})=>{
  const product=products[index],local=frame-start,priceDescriptor=(priceValue(product.price)??Infinity)<30?'低门槛尝试':(priceValue(product.price)??0)>=500?'高阶生产力方案':'日常使用方案';
  const opacity=interpolate(local,[0,6,frames-5,frames],[0,1,1,0],clamp);
  const isUnderThirty=(priceValue(product.price)??Infinity)<30;
  const facts=(isUnderThirty?['预算友好',...product.facts]:product.facts).filter(Boolean).filter((fact,index,list)=>list.indexOf(fact)===index).filter(fact=>!String(product.label).includes(String(fact))).slice(0,2),solution=solutionLine(product),scene=sceneLine(product),price=priceValue(product.price),priceBadge=price!==null&&price<30?'性价比之选':price!==null&&price>=500?'尊享旗舰版':'';
  return <AbsoluteFill style={{opacity,transform:'translateX('+interpolate(local,[0,9],[64,0],clamp)+'px) rotate('+interpolate(local,[0,9],[index%2===0?-1.2:1.2,0],clamp)+'deg)'}}>
    <Topline brand={brand} label={'方案 '+number(index+1)+' / '+number(products.length)}/>
    <div style={{position:'absolute',top:150,left:72,right:72,height:6,background:'#dce3e9',borderRadius:8,overflow:'hidden'}}><div style={{height:'100%',width:100*(index+reveal(local,0,frames))/products.length+'%',background:product.color}}/></div>
    <div style={{position:'absolute',right:52,top:180,fontSize:230,fontWeight:900,lineHeight:1,color:product.color,opacity:.10}}>{number(index+1)}</div>
    <div style={{position:'absolute',left:72,right:72,top:260,opacity:reveal(local,1,7)}}>
      <div style={{fontSize:24,fontWeight:700,color:'#53616f',marginBottom:24}}>本期方案 / {number(index+1)}</div>
      <div style={{fontSize:product.title.length>12?58:78,fontWeight:900,letterSpacing:-2,lineHeight:1.2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{product.title}</div>
    </div>
    <div style={{position:'absolute',left:72,right:72,top:560,height:330,borderRadius:36,border:'1px solid #dce3e9',background:'rgba(255,255,255,.75)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(12px)',boxShadow:'0 12px 36px rgba(19,35,56,.08)',display:'flex',alignItems:'center',gap:34,padding:'34px 40px',boxSizing:'border-box',opacity:reveal(local,3,10),transform:'scale('+interpolate(local,[3,12],[.96,1],clamp)+')'}}>
      <div style={{width:220,flexShrink:0,display:'flex',justifyContent:'center'}}><Logo product={product} size={200}/></div>
      <div style={{borderLeft:'2px solid #e1e7ed',paddingLeft:32,minWidth:0}}><div style={{fontSize:22,color:'#53616f',marginBottom:18}}>商品分类与说明</div><div style={{fontSize:31,fontWeight:800,lineHeight:1.5,color:product.color,overflowWrap:'anywhere'}}>{scene}</div><div style={{fontSize:24,fontWeight:800,lineHeight:1.4,color:'#53616f',marginTop:16,overflowWrap:'anywhere'}}>{solution}</div></div>
    </div>
    <div style={{position:'absolute',left:72,right:72,top:940}}>
      <div style={{fontSize:23,fontWeight:800,color:'#53616f',marginBottom:18}}>先看这几个要点</div>
      {facts.map((fact,factIndex)=><div key={factIndex} style={{display:'flex',alignItems:'center',gap:20,minHeight:62,marginBottom:8,opacity:reveal(local,7+factIndex*2,13+factIndex*2),transform:'translateX('+interpolate(local,[7+factIndex*2,13+factIndex*2],[24,0],clamp)+'px)'}}><div style={{width:44,height:44,borderRadius:14,background:product.color,color:'#fff',fontSize:23,fontWeight:800,display:'grid',placeItems:'center',flexShrink:0}}>{number(factIndex+1)}</div><div style={{fontSize:27,fontWeight:700,lineHeight:1.28,overflowWrap:'anywhere'}}>{fact}</div></div>)}
    </div>
    <div style={{position:'absolute',left:72,right:72,top:1310,height:220,borderRadius:34,background:'#132338',color:'#fff',padding:'32px 40px',boxSizing:'border-box',display:'flex',alignItems:'center',justifyContent:'space-between',gap:20,opacity:reveal(local,10,18),transform:'scale('+interpolate(local,[10,18],[.96,1],clamp)+')'}}><div><div style={{fontSize:25,fontWeight:700}}>{priceDescriptor}</div><div style={{fontSize:19,color:'#bdcbdc',marginTop:14}}>价格与详情以当前页面为准</div></div><div style={{fontSize:product.price.length>10?55:76,fontWeight:900,letterSpacing:-2,whiteSpace:'nowrap'}}>{product.price||'页面查看'}</div></div>
    {priceBadge&&<div style={{position:'absolute',right:88,top:1272,padding:'9px 18px',borderRadius:22,background:price!==null&&price>=500?'#132338':'#ed714e',color:'#fff',fontSize:20,fontWeight:900,opacity:reveal(local,10,16)}}>{priceBadge}</div>}
    <div style={{position:'absolute',left:72,right:72,bottom:190,display:'flex',alignItems:'center',justifyContent:'space-between',gap:20}}><span style={{fontSize:22,color:'#53616f'}}>{index<products.length-1?'下一项方案 →':'本期方案展示完毕'}</span><div style={{display:'flex',alignItems:'center',gap:7,height:35}}>{Array.from({length:18},(_,barIndex)=><div key={barIndex} style={{width:6,borderRadius:4,background:product.color,height:8+22*(.5+.5*Math.sin(local*.24+barIndex*.9))}}/>)}</div></div>
  </AbsoluteFill>;
};

export const MotionOutro:React.FC<{frame:number;config:VideoConfig;products:readonly Product[]}>=({frame,config,products})=><AbsoluteFill style={{opacity:reveal(frame,0,8)}}><Topline brand={config.outroBrand} label="HellosAI 方案小铺"/><div style={{position:'absolute',top:360,left:72,right:72,textAlign:'center',transform:'translateY('+interpolate(frame,[0,12],[30,0],clamp)+'px)'}}><div style={{display:'inline-grid',placeItems:'center',width:140,height:140,borderRadius:40,background:'#132338',color:'#fff',fontSize:72,fontWeight:900}}>{Array.from(config.outroBrand)[0]||'H'}<span style={{position:'absolute',marginLeft:105,marginTop:100,width:25,height:25,borderRadius:20,background:'#ed714e'}}/></div><div style={{fontSize:91,fontWeight:900,marginTop:42,overflowWrap:'anywhere'}}>{config.outroBrand}</div><div style={{display:'flex',justifyContent:'center',gap:18,flexWrap:'wrap',margin:'28px 24px 0',fontSize:31,fontWeight:900,color:'#132338'}}>{trustBadges(products).map((badge,index)=><span key={index}>{badge}</span>)}</div>{config.showFollowHint&&<><div style={{display:'inline-flex',alignItems:'center',gap:18,padding:'30px 66px',borderRadius:60,background:'#ed714e',color:'#fff',fontSize:36,fontWeight:900,marginTop:58,boxShadow:'0 14px 28px rgba(237,113,78,.28)'}}>点击主页简介 · {ctaAction(products)} <span style={{display:'inline-block',fontSize:50,lineHeight:1,transform:'translateY('+(-5-5*Math.sin(frame*.22))+'px)'}}>↓</span></div><div style={{display:'inline-flex',flexDirection:'column',alignItems:'center',gap:7,marginTop:28,padding:'16px 32px',borderRadius:20,background:'rgba(255,255,255,.84)',border:'1px solid rgba(19,35,56,.18)',boxShadow:'0 8px 20px rgba(19,35,56,.08)',minWidth:620,boxSizing:'border-box'}}><div style={{fontSize:34,fontWeight:900,lineHeight:1.2,color:'#132338'}}>收藏视频 · 方案持续更新</div><div style={{fontSize:27,fontWeight:700,lineHeight:1.2,color:'#475569'}}>详情以页面信息为准</div></div></>}{config.showStoreUrl&&<div style={{marginTop:70,padding:'32px 24px',border:'1px solid #cbd5df',borderRadius:26,background:'rgba(255,255,255,.9)'}}><div style={{fontSize:22,color:'#53616f',marginBottom:16}}>HellosAI 小铺</div><div style={{fontSize:25,fontWeight:700,overflowWrap:'anywhere'}}>{config.storeUrl}</div></div>}</div></AbsoluteFill>;
