import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { loadModules } from 'esri-loader';
import * as d3 from 'd3';
//import * as $ from 'node_modules/jquery';
declare var $: any;



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  @Output() selectedFeature = new EventEmitter();
  
  @ViewChild('mapNode') private mapNodeElementRef: ElementRef;
  @ViewChild('legendNode') private legendNodeElementRef: ElementRef;
  selectedState: string;
  pop2000: number;
  femaleNum: number;
  maleNum: number; 
  sumGender: number;
  femalePercent: number;
  malePercent: number;  

  ngAfterViewInit() {
    const options = { version: '3.28', css: true };

    loadModules([
      'esri/map',
      'esri/layers/ArcGISDynamicMapServiceLayer',
      'esri/symbols/SimpleFillSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/Color',
      'esri/tasks/query',
      'esri/tasks/QueryTask',
      'esri/dijit/Legend'
    ], options)
      .then(([
        Map,
        ArcGISDynamicMapServiceLayer,
        SimpleFillSymbol,
        SimpleLineSymbol,
        Color,
        Query,
        QueryTask,
        Legend
      ]) => {
        const map = new Map(this.mapNodeElementRef.nativeElement, {
          center: [-98.507, 39.785], 
          zoom: 4,
          basemap: 'gray'
        });

        const layer = new ArcGISDynamicMapServiceLayer('https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer', {});
        layer.setVisibleLayers([3]);

        map.addLayer(layer);

        const legend = new Legend({
          map:map
        }, this.legendNodeElementRef.nativeElement);
        legend.startup();

        map.on('click', event => {
          const query = new Query();
          query.returnGeometry = true;
          query.outFields = ["*"];
          query.geometry = event.mapPoint;

          const queryTask = new QueryTask('https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3');
          queryTask.execute(query, featureSet => {
            if (featureSet.features[0]) {
              map.graphics.clear();
              const feature = featureSet.features[0];

              const mySymbol = new SimpleFillSymbol('none',
                new SimpleLineSymbol('solid', new Color([255, 0, 255]), 2.5), new Color([0, 0, 0, 0.25])
              );
              
              feature.setSymbol(mySymbol);
              map.graphics.add(feature);
              this.selectedFeature.emit(feature);
              this.selectedState = feature.attributes.STATE_NAME;
              //this.pop2000 = feature.attributes.POP2000 ;
              this.femaleNum = feature.attributes.FEMALES;
              this.maleNum = feature.attributes.MALES;
              // d3.selectAll('.genderNum li')
              //   .data([this.femaleNum, this.maleNum])
              //   .style({"background-color":"blue", "padding":"5px"})
              this.sumGender = this.femaleNum + this.maleNum;
              this.femalePercent = ((this.femaleNum / this.sumGender) * 100);
              this.malePercent = ((this.maleNum / this.sumGender) * 100);    
              d3.select('.femaleNum')
                .data([0])
                .style("background-color","#0eede9")
                .style("width",+this.femalePercent+"%")

              d3.select('.maleNum')
                .data([70])
                .style("background-color","#11fc92")
                .style("width",+this.malePercent+"%")

              $('#exampleModal').modal('show');

              console.log("Name: "+feature.attributes.STATE_NAME);
              console.log("Total Pop: "+this.femalePercent + " : " + this.malePercent);
              
            }
          });
        });
        
      })
      .catch(err => {
        console.error(err);
      });
  }
}
