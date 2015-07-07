# html-map
A configurable geographic viewer based on angularjs.

This project provides you with an HTML/Javascript template allowing to easily build a webpage that shows geographic information on an interactive map with no HTML/Javascript knowledge.


Features:

* Built on AngularJS and OpenLayers 3
* JSON based layers configuration
* Layers styling with cartocss
* Customizable HTML popup templates for showing features information


## GETTING STARTED

### 1. Get the code

Download, clone or fork this repository


### 2. Map configuration and styles

In this step you will modify two files of the repository in order to provide:

* the map setup and layers you want to show, contained in a JSON configuration file
* the graphic styling for layers, expressed with CartoCSS syntax.



#### Map configuration
The map can be setup by editing  **config/mapconfig.json** file.

Here's an example configuration of a map centered on Milan, Italy, and showing a couple of geojson layers on top of a Stamen base map:

	{
	  "title" : "My map",
	  "map" : {
	    "center" : [9.2, 45.483333],
	    "centerProjection" : "EPSG:4326",
	    "zoom" : 11,
	    "extent" : [9.0, 45.2, 9.4, 45.6 ]
	  },

	  "layers" : [
	    {
	      "name" : "toner",
	      "layerType" : "stamen",
	      "layerOptions" : { "layer" : "toner"}
	    },
	    {
	      "name" : "fermate_metro",
	      "layerType" : "geojson",
	      "layerOptions" : { "url" : "data/fermate-metro.geojson" },
	      "templatePopup" : "templates/example.html"
	    },
	    {
	      "name" : "ztlbg",
	      "layerType" : "geojson",
	      "layerOptions" : { "url" : "data/ztlbg.geojson" },
	      "templatePopup" : "templates/table.html"
	    }
	  ]

	}


Items in configuration have the following meaning:

* **title** (string, required): the main title of the map

* **map** this objectis used to configure properties of the map:
	* **center** ([float, float], required): coordinates of the initial center of the map
	* **centerProjection**: the projection of the initial center's coordinates. Example : `EPSG:4326`.
	* **zoom** (integer, required): the initial zoom level of the map
	* **minZoom** (number, optional): the min zoom level of the map
	* **maxZoom** (number, optional): the max zoom level of the map
	* **extent** ([number, number, number, number], optional): the extent the map is limited to
	* **extentProjection** (string, optional): the projection in which the extent is given

* **layers** (array of objects): a list of the layers to be shown in the map. Each layer object has the following properties defined
	* **name** (string, required): the name of the layer. Must be unique.
	* **layerType** (string, required): type of layer
	* **layerOptions** (object): options, specific to each layer type. Some layer types might require some options to be set for work correctly.
	* **templatePopup** (relative path to template, optional): specifies the html template to be used to show information about a feature in a layers. If the option is omitted the layer will not show popups when clicked on.


### 3. Optional: setup popup templates
TBW


## SUPPORTED LAYER TYPES

* OSM
* Stamen
* Mapquest
* Opencyclemap
* geojson

TBW

## STYLE
TBW


## CREDITS
The developement of this project is sponsored by [INMAGIK srl](http://inmagik.com/).


This project is based on other open source projects and libraries, in particular:

* [AngularJS]()
* [Openlayers 3]()
* [cartocss]()
* [Bootstrap]()
* [ol3-popup]()
* [ol3-layer-switcher]()
