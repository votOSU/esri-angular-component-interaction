import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { loadModules } from 'esri-loader';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  @Output() selectedFeature = new EventEmitter();

  ngOnInit() {
    const options = { version: '3.28', css: true };

    loadModules([
      'esri/map',
      'esri/layers/ArcGISDynamicMapServiceLayer',
      'esri/symbols/SimpleFillSymbol',
      'esri/symbols/SimpleLineSymbol',
      'esri/Color',
      'esri/tasks/query',
      'esri/tasks/QueryTask'
    ], options)
      .then(([
        Map,
        ArcGISDynamicMapServiceLayer,
        SimpleFillSymbol,
        SimpleLineSymbol,
        Color,
        Query,
        QueryTask
      ]) => {
        const map = new Map('mapNode', {
          center: [-86.718, 36.545],
          zoom: 4,
          basemap: 'gray'
        });

        const layer = new ArcGISDynamicMapServiceLayer('https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer', {});
        layer.setVisibleLayers([2]);

        map.addLayer(layer);

        map.on('click', event => {
          const query = new Query();
          query.returnGeometry = true;
          query.geometry = event.mapPoint;

          const queryTask = new QueryTask('https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2');
          queryTask.execute(query, featureSet => {
            map.graphics.clear();
            const feature = featureSet.features[0];

            const mySymbol = new SimpleFillSymbol('none',
              new SimpleLineSymbol('solid', new Color([255, 0, 255]), 2.5), new Color([0, 0, 0, 0.25])
            );

            feature.setSymbol(mySymbol);
            map.graphics.add(feature);
            this.selectedFeature.emit(feature);
          });
        });
      })
      .catch(err => {
        console.error(err);
      });
  }
}
