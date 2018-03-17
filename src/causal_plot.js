var width=1200,height=700,rf=require("fs"),data,threshold;
var svg,yScale,
    color1=d3.rgb("green"),color2=d3.rgb("yellow"),
    compute1=d3.interpolate(color1,"white"),
    compute2=d3.interpolate("white",color2),
    tooptip=d3.select("body")
              .append("div")
              .attr("class","tooptip")
              .style("opacity",0.0);

  function show_drawing(){
      svg=d3.select("body").append("svg")
                         .attr("width",width)
                         .attr("height",height);
     document.getElementById('draw').style.display="none";
     document.getElementById('help').style.display="none";
     document.getElementById('reset').style.display="none";
     document.getElementById("path").style.display="none";
     document.getElementById("threshold").style.display="none";

     inital();
  }
function inital(){
  
   var file_path=document.getElementById("path").value;
   threshold=document.getElementById("threshold").value;
   //threshold=0.5;
   data=rf.readFileSync(file_path,"utf-8");  
   //data=rf.readFileSync("data.net","utf-8");  
   draw_the_main();
   document.getElementById('return').style.display="block";
    
}
function show_content(){
    var tmp=d3.select("body").selectAll("svg");
     tmp.remove();
     document.getElementById('reset').style.display="block";
     document.getElementById('draw').style.display="block";
     document.getElementById('help').style.display="block";
     document.getElementById('path').style.display="block";
     document.getElementById('threshold').style.display="block";
     document.getElementById('return').style.display="none";
}  
function draw_the_main(){
    var data_nodes=data.toString().split("\n");
    var length=data_nodes.length;
    var nodes=new Array(length);
    var max=0,min=0,i,j;
    for (var index = 0; index <length; index++) {
         nodes[index]=data_nodes[index].toString().split("\t");
    }
    var list=new Array(length),
        reference=new Array(length),
        flag=false;
        for(var k=0;k<length;k++){
            flag=false;
            for(i=0;i<length;i++){
                if(reference[i]==2)continue;
                for(j=1;j<i+1;j++){
                    if(reference[j-1]==2)continue;
                    if(nodes[i][j]>max)max=nodes[i][j];
                    if((nodes[i][j]<0)&&(-nodes[i][j]>-min))min=nodes[i][j];
                    if((nodes[i][j]>threshold||nodes[i][j]<-threshold)){
                        reference[i]=1;
                        break;
                    }
                }
            }
            list[k]="";
            for(var w=0;w<length;w++){
                if(reference[w]==2)continue;
                else if(reference[w]!=1){
                list[k]+=w.toString()+" ";
                flag=true;
                reference[w]=2;
            }
                else reference[w]=0;
            }
            console.log(list[k]);
            if(flag==false)break;
        }
        var nodes_by_line=new Array(k),max_of_row=0;
    draw_the_line(max,min,k);
    for(index=0;index<k;index++){
        nodes_by_line[index]=list[index].toString().split(" ");
        if(nodes_by_line[index].length>max_of_row)max_of_row=nodes_by_line[index].length;

    }
    var x_coordinate=new Array(length+1),y_coordinate=new Array(length+1);
   for(index=0;index<k;index++){
        for(var s=0;s<nodes_by_line[index].length-1;s++){
                x_coordinate[nodes_by_line[index][s]]=width/(2+2*k)+index*width/(1+k);
                y_coordinate[nodes_by_line[index][s]]=height/nodes_by_line[index].length*(s+1);
        }
        console.log(k);
    }
    function Line(){}
    Line.prototype.value = 0.8;
    Line.prototype.source = 4;
    Line.prototype.target = 4;
    Line.prototype.sourceID = 4;
    Line.prototype.targetID = 4;

    
    var line_class=new Array(),index_for_lineClass=0;
        for(i=0;i<length;i++){
            for(j=1;j<i+1;j++){
                if((nodes[i][j]>threshold||nodes[i][j]<-threshold)){
                    line_class[index_for_lineClass]=new Line();
                    line_class[index_for_lineClass].value=nodes[i][j];
                    line_class[index_for_lineClass].source=nodes[j-1][0];
                    line_class[index_for_lineClass].target=nodes[i][0];
                    line_class[index_for_lineClass].sourceID=j-1;
                    line_class[index_for_lineClass].targetID=i;
                    index_for_lineClass++;
                }
            }
        }
        console.log(line_class);
         var lines=svg.append("g").selectAll("line")
                  .data(line_class)
                  .enter()
                  .append("line")
                  .attr("x1",function(d){
                      return x_coordinate[d.sourceID];
                  })
                  .attr("y1",function(d){
                      return y_coordinate[d.sourceID];
                  })
                  .attr("x2",function(d){
                      return x_coordinate[d.targetID];
                  })
                  .attr("y2",function(d){
                      return y_coordinate[d.targetID];
                  })
                  .attr("stroke-width",4)
                   .attr("stroke",function(d){
                       if(d.value>0)return compute1(1-d.value/max);
                       else return compute2(d.value/min);
                   })
                   .attr("fill","none")
                   .on("mouseover",function(d){
                       d3.select(this)
                       .attr("stroke-width",8);
                       tooptip.html("value:"+d.value+"<br>"+"source:"+d.source+"<br>"+"target:"+d.target)
                       .style("left",(d3.event.pageX)+"px")
                       .style("top",(d3.event.pageY+20)+"px")
                       .style("background-color","Ivory")
                       .style("opacity",1.0);  
                })
                    .on("mouseout",function(){
                       d3.select(this)
                     .attr("stroke-width",4);
                     tooptip.style("opacity",0.0);

                });
console.log(lines);

    for(index=0;index<k;index++){
        for(var s=0;s<nodes_by_line[index].length-1;s++){
                svg.append("circle")
               .attr("cx", x_coordinate[nodes_by_line[index][s]])
               .attr("cy",y_coordinate[nodes_by_line[index][s]])
               .attr("r",height/(2.5*max_of_row))
               .attr("fill","#40E0D0")
               .on("mouseover",function(){
                d3.select(this)
                .attr("stroke-width",3)
                .attr("stroke","yellow");
                 })
                .on("mouseout",function(d){
                d3.select(this)
                .attr("stroke-width",0)
                 });
                 svg.append("text")
                 .attr("class","texts")
                 .attr("x", x_coordinate[nodes_by_line[index][s]])
                 .attr("y",y_coordinate[nodes_by_line[index][s]])
                 .text(nodes[nodes_by_line[index][s]][0]);
        }
    }
    
   
}
function draw_the_line(max,min,length){
    min=Math.floor(min),max=Math.floor(max)+1;
    yScale=d3.scaleLinear()
                   .domain([min,max])
                   .range([0,height]);
    console.log(yScale(2));
    var yAxis = d3.axisRight()
              .scale(yScale)
              .ticks(8);
      yScale.range([height,0]);
      svg.append("g")
       .attr("class","axis")
       .attr("transform","translate("+(width*0.88+50)+","+
       (0)+")")
       .call(yAxis);

      for(var i=0;i<200*(max/(max-min));i++){
          svg.append("rect")
             .attr("x",0.88*width)
             .attr("y",height/200*i)
             .attr("width",50)
             .attr("height",height/200)
             .attr("fill",compute1(i/(200*(max/(max-min)))));           
      }
      for(var i=0;i<200*(-min/(max-min));i++){
          svg.append("rect")
             .attr("x",0.88*width)
             .attr("y",height*max/(max-min)+height/200*i)
             .attr("width",50)
             .attr("height",height/200)
             .attr("fill",compute2(i/(200*(-min/(max-min)))));           
      }
}