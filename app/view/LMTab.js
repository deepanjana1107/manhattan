// initialize global variables
// global projection objects (uses the proj4js lib)
var epsg_4326 = new OpenLayers.Projection("EPSG:4326"),
 epsg_3857 = new OpenLayers.Projection("EPSG:3857");
var lm_draw_points, lm_route_layer, lm_points_layer;
var popup = null;
// define the extent of the area which will be locked from panning in the Map Panel
var lmextent = new OpenLayers.Bounds(-74.047185, 40.700120, -73.972304, 40.741466).transform('EPSG:4326','EPSG:3857');

// define the attraction Map Panel that holds the map of Lower Manhattan
var lmMapPanel = Ext.create('GeoExt.panel.Map', {
	region: 'center',
	itemId: 'lmMap',
	map: {
		allOverlays: false,
		projection: 'EPSG:3857', // The map is always project in EPSG 3857 - although in Database it is represented in EPSG 4326
		units: 'm',
		maxExtent: lmextent,
		minExtent: lmextent,
		restrictedExtent: lmextent,
		controls: [
			new OpenLayers.Control.Navigation({dragPanOptions: {enableKinetic: true}}),
			new OpenLayers.Control.Zoom(),
			new OpenLayers.Control.MousePosition({prefix: '<a target="_blank" ' +'href="http://wiki.openstreetmap.org/wiki/EPSG:3857">' +'EPSG:3857</a>: '}),
			new OpenLayers.Control.ScaleLine()	
		]
	},
	center: new OpenLayers.LonLat(-74.011047, 40.708009).transform('EPSG:4326','EPSG:3857'),
	zoom: 14,
	layers: [
		new OpenLayers.Layer.OSM("MapQuest OSM Tiles", // Default Baselayer - visibility set to true. isBaseLayer: true adds layer to Tree 'baselayer' container
					["http://otile1.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                    "http://otile2.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                    "http://otile3.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                    "http://otile4.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg"],
                    {isBaseLayer:true, visibility:true}),
		new OpenLayers.Layer.OSM("MapQuest Aerial Tiles", // Second Baselayer - not default. isBaseLayer: true adds layer to Tree 'baselayer' container
					["http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
		             "http://otile2.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
		             "http://otile3.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
		             "http://otile4.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg"],
		            {isBaseLayer: true,
		            visibility: false}),
		new OpenLayers.Layer.OSM("OpenStreetMap", // Third Baselayer - not default. isBaseLayer: true adds layer to Tree 'baselayer' container
					['http://a.tile.openstreetmap.org/${z}/${x}/${y}.png','http://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
					'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'],
                    {isBaseLayer:true, visibility:false}),
		new OpenLayers.Layer.WMS("Parks", // Overlay layer - isBaseLayer: false automatically adds to Tree 'overlay' container
		         			"http://localhost:8082/geoserver/tour_manhattan/wms", 
		         			{layers: 'tour_manhattan:Manhattan_parks', transparent:true},
	              	{isBaseLayer:false,visibility:false,restrictedExtent: lmextent}),
		new OpenLayers.Layer.WMS('Museums', // Overlay layer - isBaseLayer: false automatically adds to Tree 'overlay' container
	         			'http://localhost:8082/geoserver/tour_manhattan/wms', {
	              		layers: ['tour_manhattan:museums','tour_manhattan:museums_poly'],transparent:true},
	              	{isBaseLayer:false,visibility:false,restrictedExtent: lmextent}),
		new OpenLayers.Layer.WMS('Theatre', // Overlay layer - isBaseLayer: false automatically adds to Tree 'overlay' container
	         			'http://localhost:8082/geoserver/tour_manhattan/wms', {
	              		layers: ['tour_manhattan:theatre','tour_manhattan:theatre_poly'],transparent:true},
	              	{isBaseLayer:false,visibility:false,restrictedExtent: lmextent}),
		new OpenLayers.Layer.WMS('Buildings', // Overlay layer - isBaseLayer: false automatically adds to Tree 'overlay' container
	         			'http://localhost:8082/geoserver/tour_manhattan/wms', {
	              		layers: ['tour_manhattan:importantBuildings2'],transparent:true},
	              	{isBaseLayer:false,visibility:false,restrictedExtent: lmextent})
/*		new OpenLayers.Layer.WMS('Lower Manhattan', // All features combined - isBaseLayer: false automatically adds to Tree 'overlay' container
                'http://localhost:8082/geoserver/tour_manhattan/wms', {
                layers: ['tour_manhattan:museums','tour_manhattan:museums_poly',
                'tour_manhattan:theatre','tour_manhattan:theatre_poly',
                'tour_manhattan:Manhattan_parks','tour_manhattan:importantBuildings2'],transparent:true},
	              	{isBaseLayer:false,visibility:false,
	              	restrictedExtent: new OpenLayers.Bounds(-74.047185, 40.700120, -73.972304, 40.741466).transform('EPSG:4326','EPSG:3857')})
*/
	]
});

var lm_map = lmMapPanel.map; // get an alias of the map component
var lm_mp = new OpenLayers.Control.MousePosition();
lm_map.addControl(lm_mp);


// create the layer where the route will be drawn
lm_route_layer = new OpenLayers.Layer.Vector("route", {
styleMap: new OpenLayers.StyleMap(new OpenLayers.Style({
    strokeColor: "#ff00ff",
    strokeOpacity: 0.7,
    strokeWidth: 5
}))
});

// create the layer where the start and final points will be drawn
lm_points_layer = new OpenLayers.Layer.Vector("points", {
styleMap: new OpenLayers.StyleMap(new OpenLayers.Style({
    "fillColor": "${getColor}",
    "strokeColor": "${getColor}",
    "pointRadius": 5,
    "fillOpacity": 1.0
}, {context: {
       "getColor": function(feature) { // first point is always green and subsequent points are red
           return (feature.layer.features[0] == feature) ? 'green' : 'red';
       }
   }}))
});

	// create the control to draw the points (see the DrawPoints.js file)
	lm_draw_points = new DrawPoints(lm_points_layer);
    
    //map.raiseLayer(points_layer, map.layers.length);
    //map.setLayerIndex(points_layer, this.map.getNumLayers());
	
	// add the layers to the map
    lm_map.addLayers([lm_points_layer, lm_route_layer]);

    // create the store to query the web service via PHP and retrieve the GeoJSON route feature from response
    var lm_store = new GeoExt.data.FeatureStore({
        layer: lm_route_layer, // Automatically draw GeoJSON route feature on the route layer
        autoLoad: true,
        fields: [
            {name: "length"}
        ],
        proxy: new GeoExt.data.proxy.Protocol({
            protocol: new OpenLayers.Protocol.HTTP({
                url: "resources/php/route_multiple.php",
                format: new OpenLayers.Format.GeoJSON({
                    internalProjection: epsg_3857,
                    externalProjection: epsg_4326
                })
            })
        })
    });

// instantiate an array for toolbar
var toolbarItems = [];

// Map Help is the first toolbar item
mapHelp = Ext.create('Ext.button.Button', {
	text: 'Map Help',
	handler: function() {
		Ext.Ajax.request({
			url: 'resources/navhelp.html',
			success: function(response){
				Ext.create('Ext.window.Window',{
					title: 'Map Help Documentation',
					height: 400,
					width: 600,
					layout: 'fit',
					autoScroll: true,
					closable: true,
					padding: '10 10 10 10',
					items: [{
						xtype: 'label',
						html: response.responseText
					}]
				}).show()
			}
		});
	}
});
toolbarItems.push(mapHelp);
toolbarItems.push("-");

// Place Markers is the second toolbar item
placePoints = Ext.create('Ext.button.Button', {
	text: 'Place Markers',
	handler: function() {
		// clear the canvas - remove all points as well as routes
		lm_points_layer.removeAllFeatures();	
		lm_store.removeAll();	

		// add a map control to display the starting (green) point
		lm_map.addControl(lm_draw_points);	
	}
});

toolbarItems.push(placePoints);
toolbarItems.push("-");

// Draw Route is the third toolbar item
drawRoute = Ext.create('Ext.button.Button', {
	text: 'Draw Route',
	handler: function() {
		// initialize the array to store all points that are to be sent to route_multiple.php web service
		var lm_pointTrain = [];
		// iterate through all the points in the points layer
		for (var i = 0; i < lm_points_layer.features.length; i++) {
			//pgrouting(points_layer, i, i+1);
			// get EPSG 3587 coordinate of each point and transform them to EPSG 4326 (because that's what the database understands)
			var lm_point = lm_points_layer.features[i].geometry.clone();
		     lm_point.transform(epsg_3857, epsg_4326);
		     // add the x, y coodinate of each point separated by a whitespace
		     lm_pointTrain.push(lm_point.x + " " + lm_point.y);
		}
			  console.log(lm_pointTrain); // a console command to dump the list of points being sent to the php webservice
	     // Load the store and pass the point train param as input argument to the php webservice
	     lm_store.load({
	         params: {
	             pointTrain: lm_pointTrain
	        }
		});
	 	
	}
});

toolbarItems.push(drawRoute);
toolbarItems.push("-");

// Clear Route is the fourth and final menubar item
clearRoute = Ext.create('Ext.button.Button', {
	text: 'Clear Route',
	handler: function() {
		// remove all route layers, points, and deactivate the points control
		lm_points_layer.removeAllFeatures();
		lm_store.removeAll();
		lm_draw_points.deactivate();

	}
});

toolbarItems.push(clearRoute);

lmMapPanel.addDocked([{
	xtype: 'toolbar',
	dock: 'top',
	items: toolbarItems
}]);

// attraction store instantiates the tree with baselayer and overlay layer containers
// extens the GeoExt.data.LayerTreeModel 
var lmStore = Ext.create('Ext.data.TreeStore', {
	model: 'GeoExt.data.LayerTreeModel',
	root: {
		expanded: true,
		children: [
			{
				plugins: [{
					ptype: 'gx_overlaylayercontainer',
					loader: {
						store: lmMapPanel.layers,
						createNode: function(attr) {
							attr.component = {
								xtype: "gx_wmslegend",
								layerRecord: lmMapPanel.layers.getByLayer(attr.layer),
								showTitle: false,
								cls: "legend"
							};
							return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
						}
					}
				}],
				expanded: true,
				text: 'POIs'
			},
			{
				plugins: [{
					ptype: 'gx_baselayercontainer',
					loader: {
						store: lmMapPanel.layers,
						createNode: function(attr) {
							attr.component = {
								xtype: 'panel',
								layerRecord: lmMapPanel.layers.getByLayer(attr.layer),
								showTitle: false,
								cls: 'legend'
							};
							return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
						}
					}
				}],
				expanded: true,
				text: 'Lower Manhattan Base Layers'
			}
		]
	}
});

var lmTree = Ext.create('GeoExt.tree.Panel', {
	itemId: 'lmTree',
	region: 'east',
	title: 'Map Layer Selection',
	width: 250,
	collapsible: true,
	autoScroll: true,
	store: lmStore,
	rootVisible: false,
	lines: true
});


// use WMSGetFeatureInfo to get textual information for each park, building, museum etc. and fill it in popup
// the feature layers are obtained from the GeoServer WMS layer URL
var info = new OpenLayers.Control.WMSGetFeatureInfo({
    url: 'http://localhost:8082/geoserver/tour_manhattan/wms', 
    title: 'Identify features by clicking',
    queryVisible: true,
    infoFormat: 'application/vnd.ogc.gml',
    eventListeners: {
       getfeatureinfo: function(event) {
           if (popup) {
           	 // remove any pre-existing popup from the map panel
               lmMapPanel.map.removePopup(popup);
           }
           // instantiate variable contentHTML to store the content of the popup
           var contentHtml = '';
           // Manage the features
           if (event.features.length > 0) {
               // for (var i = 0; i < event.features.length; i++) {
                   // var feature = event.features[i];
                   var feature = event.features[0];
                   // Identify the type and build contentHTML accordingly
                   if (feature.gml.featureType == 'museums' ||
                           feature.gml.featureType =='museums_poly') {
                       // Create HTML content for this feature type
                       var address = feature.attributes['address'];
                       var name = feature.attributes['name'];
                       var homepage = feature.attributes['homepage'];
                       var actualHomepage = null;
                           // check if the homepage variable is defined or not
                           if (typeof homepage === "undefined") {
                           	// if homepage variable is undefined, change the contentHTML to say "website not available"
                           	contentHtml = contentHtml + '<font color="black"><b>' + name + '</b>' + '<p>' + address + '</p>' + 
                            'Website not available' + '<p></p></font>'; 

                           }
                           else {
                           	// if homepage variable contains a website address, check the first character
                           if (homepage.charAt(0)=='h')
                           	actualHomepage = '<a href="' + homepage + ' '; // if the first character is 'h', the the website address starts with http. Do not add http to the address
                           else
                           	actualHomepage = '<a href="http:\/\/' + homepage + ' '; // else add http to the website address
                           contentHtml = contentHtml + '<font color="black"><b>' + name + '</b>' + '<p>' + address + '</p>' + 
                            actualHomepage + '"target="_blank">Website</a>' + '<p></p></font>'; 	
                           }
                       console.log(contentHtml);
                    }
                    else if (feature.gml.featureType == 'theatre' || feature.gml.featureType == 'Manhattan_parks' ||
                           feature.gml.featureType =='theatre_poly') {
                       // Create HTML content for this feature type
                       var address = feature.attributes['address'];
                       var name = feature.attributes['name'];
                       var homepage = feature.attributes['homepage'];
                       var actualHomepage = null;
                           // check if the homepage variable is defined or not
                           if (typeof homepage === "undefined") {
                           	// if homepage variable is undefined, change the contentHTML to say "website not available"
                           	contentHtml = contentHtml + '<font color="black"><b>' + name + '</b>' + '<p>' + address + '</p>' + 
                            'Website not available' + '<p></p></font>'; 

                           }
                           else {
                           	// if homepage variable contains a website address, check the first character
                           if (homepage.charAt(0)=='h')
                           	actualHomepage = '<a href="' + homepage + ' '; // if the first character is 'h', the the website address starts with http. Do not add http to the address
                           else
                           	actualHomepage = '<a href="http:\/\/' + homepage + ' '; // else add http to the website address
                           contentHtml = contentHtml + '<font color="black"><b>' + name + '</b>' + '<p>' + address + '</p>' + 
                            actualHomepage + '"target="_blank">Website</a>' + '<p></p></font>'; 	
                           }
                       console.log(contentHtml);
                    }
                    else if (feature.gml.featureType =='importantBuildings2') {
                       // Create HTML content for this feature type
                       var address = feature.attributes['address'];
                       var name = feature.attributes['name'];
                       var homepage = feature.attributes['website'];
                       var actualHomepage = null;
                           // check if the homepage variable is defined or not
                           if (typeof homepage === "undefined") {
                           	// if homepage variable is undefined, change the contentHTML to say "website not available"
                           	contentHtml = contentHtml + '<font color="black"><b>' + name + '</b>' + '<p>' + address + '</p>' + 
                            'Website not available' + '<p></p></font>'; 

                           }
                           else {
                           	// if homepage variable contains a website address, check the first character
                           if (homepage.charAt(0)=='h')
                           	actualHomepage = '<a href="' + homepage + ' '; // if the first character is 'h', the the website address starts with http. Do not add http to the address
                           else
                           	actualHomepage = '<a href="http:\/\/' + homepage + ' '; // else add http to the website address
                           contentHtml = contentHtml + '<font color="black"><b>' + name + '</b>' + '<p>' + address + '</p>' + 
                            actualHomepage + '"target="_blank">Website</a>' + '<p></p></font>'; 	
                           }   
                       console.log(contentHtml);
                    }
                //}
                } else {
                    // Don't show any popup if no feature
                    return;
                }
                // now it's time to display the popup
                 // style is a callout FramedCloud 
             popup = new OpenLayers.Popup.FramedCloud(
                "chicken", 
                lmMapPanel.map.getLonLatFromPixel(event.xy),
                null,
                contentHtml,
                null,
                true
            );
            popup.autoSize = true;
            lmMapPanel.map.addPopup(popup);
        }
   }
});
lmMapPanel.map.addLayers(info);
lmMapPanel.map.addControl(info);
info.activate();


Ext.define('manhattan.view.LMTab' ,{
    
    extend: 'Ext.Panel',

	layout: 'border',
	defaults: {
		collapsible: false,
		bodyStyle: 'padding:0px'
	},
	
	alias: 'widget.lmtab',
    title: 'Lower Manhattan',
	
	items: [lmMapPanel,lmTree]
});

