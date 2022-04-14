var t=Math.PI/3,e=[0,t,2*t,3*t,4*t,5*t];function n(t){return t[0]}function r(t){return t[1]}document.querySelector("#loader").classList.add("hide");let o=["#1abc9c","#2ecc71","#3498db","#9b59b6","#34495e","#16a085","#27ae60","#2980b9","#8e44ad","#2c3e50","#f1c40f","#e67e22","#e74c3c","#ecf0f1","#95a5a6","#f39c12","#d35400","#c0392b","#bdc3c7","#7f8c8d"],a=document.querySelector("input#radius");a.addEventListener("click",(()=>{document.querySelector("#loader").classList.remove("hide"),console.log(a.value),d()}));const l=25,s=35,i=10,c=1250-i-10,u=750-l-s;function d(){let d=a.value;const x=d3.json("https://raw.githubusercontent.com/addu390/population-cartogram/master/data/population/2018/geo.json");Promise.all([x]).then((a=>{let[x]=a;!function(a,d){let x=1.5*d,k=c/x,M=d3.geoNaturalEarth1().fitExtent([[0,.05*u],[c,.95*u]],a),b=Math.ceil(u/x),q=d3.range(b*k).map((function(t,e){return{x:Math.floor(e%k)*x,y:Math.floor(e/k)*x,datapoint:0}})),w=[];for(let t=0;t<a.features.length;t++){var S=[];if("MultiPolygon"==a.features[t].geometry.type)for(let e=0;e<a.features[t].geometry.coordinates.length;e++)S=S.concat(a.features[t].geometry.coordinates[e][0]);else"Polygon"==a.features[t].geometry.type&&(S=S.concat(a.features[t].geometry.coordinates[0]));w[t]={coordinates:S,properties:a.features[t].properties}}d3.select("#container").selectAll("*").remove();let j=function(){var o,a,l,s=0,i=0,c=1,u=1,d=n,f=r;function h(t){var e,n={},r=[],o=t.length;for(e=0;e<o;++e)if(!isNaN(i=+d.call(null,s=t[e],e,t))&&!isNaN(c=+f.call(null,s,e,t))){var s,i,c,u=Math.round(c/=l),h=Math.round(i=i/a-(1&u)/2),y=c-u;if(3*Math.abs(y)>1){var p=i-h,m=h+(i<h?-1:1)/2,g=u+(c<u?-1:1),v=i-m,x=c-g;p*p+y*y>v*v+x*x&&(h=m+(1&u?1:-1)/2,u=g)}var k=h+"-"+u,M=n[k];M?M.push(s):(r.push(M=n[k]=[s]),M.x=(h+(1&u)/2)*a,M.y=u*l)}return r}function y(t){var n=0,r=0;return e.map((function(e){var o=Math.sin(e)*t,a=-Math.cos(e)*t,l=o-n,s=a-r;return n=o,r=a,[l,s]}))}return h.hexagon=function(t){return"m"+y(null==t?o:+t).join("l")+"z"},h.centers=function(){for(var t=[],e=Math.round(i/l),n=Math.round(s/a),r=e*l;r<u+o;r+=l,++e)for(var d=n*a+(1&e)*a/2;d<c+a/2;d+=a)t.push([d,r]);return t},h.mesh=function(){var t=y(o).slice(0,4).join("l");return h.centers().map((function(e){return"M"+e+"m"+t})).join("")},h.x=function(t){return arguments.length?(d=t,h):d},h.y=function(t){return arguments.length?(f=t,h):f},h.radius=function(e){return arguments.length?(a=2*(o=+e)*Math.sin(t),l=1.5*o,h):o},h.size=function(t){return arguments.length?(s=i=0,c=+t[0],u=+t[1],h):[c-s,u-i]},h.extent=function(t){return arguments.length?(s=+t[0][0],i=+t[0][1],c=+t[1][0],u=+t[1][1],h):[[s,i],[c,u]]},h.radius(1)}().radius(d).x((function(t){return t.x})).y((function(t){return t.y}));const N=d3.select("#container").append("svg").attr("width",c+i+l).attr("height",u+l+s).append("g").attr("transform",`translate(${i} ${l})`);N.append("g").attr("id","hexes").selectAll(".hex").data(j(q)).enter().append("path").attr("class","hex").attr("transform",(function(t){return"translate("+t.x+", "+t.y+")"})).attr("d",j.hexagon()).style("fill","#fff").style("stroke","#e0e0e0").style("stroke-width",.5).on("click",h);for(let t=0;t<w.length;t++){let e=w[t].coordinates.map((t=>M(t))),n=j(q.reduce((function(t,n){return d3.polygonContains(e,[n.x,n.y])&&t.push(n),t}),[]));N.append("g").attr("id","hexes").selectAll(".hex").data(n).enter().append("path").attr("class","hex"+w[t].properties.id).attr("transform",(function(t){return"translate("+t.x+", "+t.y+")"})).attr("x",(function(t){return t.x})).attr("y",(function(t){return t.y})).attr("d",j.hexagon()).style("fill",o[t%19]).style("stroke","#000").style("stroke-width",.5).on("click",y).on("mouseover",f).on("mouseout",p).call(d3.drag().on("start",m).on("drag",g).on("end",v))}}(x,d),document.querySelector("#loader").classList.add("hide")}))}function f(t){klass=d3.select(this).attr("class"),d3.selectAll("."+klass),d3.select(this).transition().duration(10).style("fill-opacity",.9)}function h(t){if("Remove"==document.querySelector("#label-option").value)d3.select(this).style("fill","#fff").style("stroke","#e0e0e0").lower();else{let t=document.querySelector("#color-option");d3.select(this).style("stroke-width",.5).style("fill",t.value).style("stroke","#000").on("mouseover",f).on("mouseout",p).call(d3.drag().on("start",m).on("drag",g).on("end",v)).raise()}}function y(t){if("Remove"==document.querySelector("#label-option").value)console.log("here"),d3.select(this).remove();else{let t=document.querySelector("#color-option");d3.select(this).style("stroke-width",.5).style("fill",t.value).style("stroke","#000").on("mouseover",f).on("mouseout",p).call(d3.drag().on("start",m).on("drag",g).on("end",v)).raise()}}function p(t){d3.select(this).transition().duration(10).style("fill-opacity",1)}function m(t,e){e.fixed=!1,d3.select(this).raise().style("stroke-width",1).style("stroke","#000")}function g(t,e){let n=a.value;var r=function(t,e,n){var r,o,a=Math.sqrt(3)/2,l=2*n,s=l*a,i=3*n;e%i<n?(o=e-e%i,r=t-t%s):(o=e+(l-n*a/2)-e%i,r=t+n*a-t%s);return[r,o]}(t.x,t.y,n);d3.select(this).attr("x",e.x=r[0]).attr("y",e.y=r[1]).attr("transform",(function(t){return"translate("+t.x+", "+t.y+")"}))}function v(t,e){e.fixed=!0,d3.select(this).style("stroke-width",.5).style("stroke","#000")}d();
//# sourceMappingURL=index.14dfc57b.js.map
