var t=Math.PI/3,e=[0,t,2*t,3*t,4*t,5*t];function n(t){return t[0]}function r(t){return t[1]}let o=["#1abc9c","#2ecc71","#3498db","#9b59b6","#34495e","#16a085","#27ae60","#2980b9","#8e44ad","#2c3e50","#f1c40f","#e67e22","#e74c3c","#ecf0f1","#95a5a6","#f39c12","#d35400","#c0392b","#bdc3c7","#7f8c8d"],a=document.querySelector("input#radius");a.addEventListener("click",(()=>{console.log(a.value),d()}));const l=30,s=30,i=30,u=1250-i-30,c=750-l-s;function d(){let d=a.value;const x=d3.json("https://raw.githubusercontent.com/addu390/population-cartogram/master/data/population/2018/geo.json");Promise.all([x]).then((a=>{let[x]=a;!function(a,d){let x=1.5*d,M=u/x,k=d3.geoNaturalEarth1().fitExtent([[0,.05*c],[u,.95*c]],a),b=Math.ceil(c/x),w=d3.range(b*M).map((function(t,e){return{x:Math.floor(e%M)*x,y:Math.floor(e/M)*x,datapoint:0}})),j=[];for(let t=0;t<a.features.length;t++)if(j[t]=[],"MultiPolygon"==a.features[t].geometry.type)for(let e=0;e<a.features[t].geometry.coordinates.length;e++)j[t]=j[t].concat(a.features[t].geometry.coordinates[e][0]);else"Polygon"==a.features[t].geometry.type&&(j[t]=j[t].concat(a.features[t].geometry.coordinates[0]));d3.select("#container").selectAll("*").remove();let q=function(){var o,a,l,s=0,i=0,u=1,c=1,d=n,f=r;function h(t){var e,n={},r=[],o=t.length;for(e=0;e<o;++e)if(!isNaN(i=+d.call(null,s=t[e],e,t))&&!isNaN(u=+f.call(null,s,e,t))){var s,i,u,c=Math.round(u/=l),h=Math.round(i=i/a-(1&c)/2),y=u-c;if(3*Math.abs(y)>1){var g=i-h,m=h+(i<h?-1:1)/2,p=c+(u<c?-1:1),v=i-m,x=u-p;g*g+y*y>v*v+x*x&&(h=m+(1&c?1:-1)/2,c=p)}var M=h+"-"+c,k=n[M];k?k.push(s):(r.push(k=n[M]=[s]),k.x=(h+(1&c)/2)*a,k.y=c*l)}return r}function y(t){var n=0,r=0;return e.map((function(e){var o=Math.sin(e)*t,a=-Math.cos(e)*t,l=o-n,s=a-r;return n=o,r=a,[l,s]}))}return h.hexagon=function(t){return"m"+y(null==t?o:+t).join("l")+"z"},h.centers=function(){for(var t=[],e=Math.round(i/l),n=Math.round(s/a),r=e*l;r<c+o;r+=l,++e)for(var d=n*a+(1&e)*a/2;d<u+a/2;d+=a)t.push([d,r]);return t},h.mesh=function(){var t=y(o).slice(0,4).join("l");return h.centers().map((function(e){return"M"+e+"m"+t})).join("")},h.x=function(t){return arguments.length?(d=t,h):d},h.y=function(t){return arguments.length?(f=t,h):f},h.radius=function(e){return arguments.length?(a=2*(o=+e)*Math.sin(t),l=1.5*o,h):o},h.size=function(t){return arguments.length?(s=i=0,u=+t[0],c=+t[1],h):[u-s,c-i]},h.extent=function(t){return arguments.length?(s=+t[0][0],i=+t[0][1],u=+t[1][0],c=+t[1][1],h):[[s,i],[u,c]]},h.radius(1)}().radius(d).x((function(t){return t.x})).y((function(t){return t.y}));const N=d3.select("#container").append("svg").attr("width",u+i+l).attr("height",c+l+s).append("g").attr("transform",`translate(${i} ${l})`);N.append("g").attr("id","hexes").selectAll(".hex").data(q(w)).enter().append("path").attr("class","hex").attr("transform",(function(t){return"translate("+t.x+", "+t.y+")"})).attr("d",q.hexagon()).style("fill","#fff").style("stroke","#e0e0e0").style("stroke-width",1).on("click",h);for(let t=0;t<j.length;t++){let e=j[t].map((t=>k(t))),n=q(w.reduce((function(t,n){return d3.polygonContains(e,[n.x,n.y])&&t.push(n),t}),[]));N.append("g").attr("id","hexes").selectAll(".hex").data(n).enter().append("path").attr("class","hex").attr("transform",(function(t){return"translate("+t.x+", "+t.y+")"})).attr("x",(function(t){return t.x})).attr("y",(function(t){return t.y})).attr("d",q.hexagon()).style("fill",o[t%19]).style("stroke","#000").style("stroke-width",1).on("click",y).on("mouseover",f).on("mouseout",g).call(d3.drag().on("start",m).on("drag",p).on("end",v))}}(x,d)}))}function f(t){d3.select(this).transition().duration(10).style("fill-opacity",.9)}function h(t){if("Remove"==document.querySelector("#label-option").value)d3.select(this).style("fill","#fff").style("stroke","#e0e0e0").lower();else{let t=document.querySelector("#color-option");d3.select(this).style("stroke-width",1).style("fill",t.value).style("stroke","#000").on("mouseover",f).on("mouseout",g).call(d3.drag().on("start",m).on("drag",p).on("end",v)).raise()}}function y(t){if("Remove"==document.querySelector("#label-option").value)console.log("here"),d3.select(this).remove();else{let t=document.querySelector("#color-option");d3.select(this).style("stroke-width",1).style("fill",t.value).style("stroke","#000").on("mouseover",f).on("mouseout",g).call(d3.drag().on("start",m).on("drag",p).on("end",v)).raise()}}function g(t){d3.select(this).transition().duration(10).style("fill-opacity",1)}function m(t,e){console.log("drag"),e.fixed=!1,d3.select(this).raise()}function p(t,e){let n=a.value;var r,o,l,s=t.x,i=t.y;gridX=(r=Math.max(n,Math.min(u-n,s)))%(l=2*(o=n)*.866)<l?r-r%l:r+o-r%l,gridY=function(t,e){var n=3*e;return t%n<n?t-t%n:t+e-t%n}(Math.max(n,Math.min(c-n,i)),n),d3.select(this).attr("x",e.x=gridX).attr("y",e.y=gridY).attr("transform",(function(t){return"translate("+t.x+", "+t.y+")"}))}function v(t,e){e.fixed=!0}d();
//# sourceMappingURL=index.0dd53428.js.map