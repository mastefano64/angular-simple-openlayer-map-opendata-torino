import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import Map from 'ol/Map';
import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import VectorWFS from 'ol/format/WFS';
import Style from 'ol/style/style';
import Icon from 'ol/style/icon';
import View from 'ol/view';
import proj from 'ol/proj';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Mappe0';
  map: Map;

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.initilizeMap();
  }

  private initilizeMap() {
    const mylayers = this.createLayers();

    this.map = new Map({
      target: 'map',
      layers: mylayers,
      view: new View({
        center: proj.fromLonLat([7.66, 45.05]),
        zoom: 16
      })
    });
  }

  private createLayers(): any {
    const layers = [];
    const that = this;

    const layer1 = new TileLayer({
      visible: true,
      source: new OSM()
    });
    layers.push(layer1);


    const layer2 = new TileLayer({
      visible: true,
      source: new TileWMS({
          url: 'http://geomap.reteunitaria.piemonte.it/ws/siccms/coto-01/wmsg01/wms_sicc11_alberate?',
          params: {
            layers: 'Alberate',
            transparent: true
          }
      })
    });
    layers.push(layer2);

    const layer3 = new TileLayer({
      visible: true,
      source: new TileWMS({
          url: 'http://geomap.reteunitaria.piemonte.it/ws/siccms/coto-01/wmsg01/wms_sicc112_ospedali?',
          params: {
            layers: 'Ospedali',
            transparent: true
          }
      })
    });
    layers.push(layer3);

    // tslint:disable-next-line:max-line-length
    const url = 'https://geomap.reteunitaria.piemonte.it/ws/siccms/coto-01/wfsg01/wfs_sicc102_farmacie?service=WFS&version=1.1.0&request=GetFeature&typename=FarmacieComu&srsname=EPSG%3A3857';
    const wfssource = new VectorSource({
      loader: (): any => {
        that.http.get(url, { responseType: 'text' }).subscribe(result => {
          wfssource.addFeatures(new VectorWFS().readFeatures(result));
        });
      }
    });
    const wfsvector = new VectorLayer({
      style: (feature): any => {
        const zoom = this.map.getView().getZoom();
        const fstyle = this.getFarmacieStyle(zoom, feature);
        return fstyle;
      },
      source: wfssource
    });
    layers.push(wfsvector);

    return layers;
  }

  private getFarmacieStyle(zoom: number, feature: any): Style[] {
    let myscale = 0.5;
    let iconfile = '';
    if (zoom >= 15) {
      myscale = 0.6;
    }
    if (zoom >= 17) {
      myscale = 0.7;
    }
    const prop = feature.getProperties();
    const isnotturna = (prop.notturna === 'NO') ? true : false;
    if (isnotturna === true) {
        iconfile = './assets/images/farmacia01.png';
    } else {
        iconfile = './assets/images/farmacia02.png';
    }
    return [
        new Style({
            image: new Icon({
              src: iconfile,
              scale: myscale
            })
        })
    ];
  }
}
