// Comprueba vocab.json antes de publicar: ids únicos, campos obligatorios, categorías existentes, versión nueva.
const fs=require('fs'),path=require('path');
const d=JSON.parse(fs.readFileSync(path.join(__dirname,'..','vocab.json'),'utf8'));
const err=[];
if(!/^\d{4}\.\d{2}\.\d{2}(\.\d+)?$/.test(d.version||''))err.push('version debe ser AAAA.MM.DD o AAAA.MM.DD.N');
const ids=new Set();
d.V.forEach((v,i)=>{
  const w=`#${i} (${v.id||'sin id'})`;
  for(const k of ['id','term','type','cat','en','es','ex'])if(!v[k])err.push(`${w}: falta ${k}`);
  if(ids.has(v.id))err.push(`${w}: id duplicado`);ids.add(v.id);
  if(!d.CATS[v.cat])err.push(`${w}: categoría desconocida ${v.cat}`);
  if(v.prep&&!d.PREPS[v.prep])err.push(`${w}: preposición desconocida ${v.prep}`);
  if(v.connCat&&!d.CONN_CATS[v.connCat])err.push(`${w}: tipo de conector desconocido ${v.connCat}`);
  if(v.cat==='connectors'&&v.register&&!d.REGISTERS[v.register])err.push(`${w}: registro desconocido ${v.register}`);
});
if(!d.changelog||d.changelog[0].version!==d.version)err.push('changelog[0] debe corresponder a la versión actual');
if(err.length){console.error(err.join('\n'));process.exit(1);}
console.log(`OK v${d.version}: ${d.V.length} términos`);
