// global projection objects (uses the proj4js lib)
var epsg_4326 = new OpenLayers.Projection("EPSG:4326"),
 epsg_3857 = new OpenLayers.Projection("EPSG:3857");
var mm_draw_points, mm_route_layer, mm_points_layer;

var popup = null;
var mmextent = new OpenLayers.Bounds(-74.009802, 40.740490,-73.952681, 40.766806).transform('EPSG:4326','EPSG:3857');
var mmMapPanel = Ext.create('GeoExt.panel.Map', {
	region: 'center',
	itemId: 'mmMap',
	map: {
		allOverlays: false,
		projection: 'EPSG:3857',
		units: 'm',
		maxExtent: mmextent,
		minExtent: mmextent,
		restrictedExtent: mmextent,
		controls: [
			new OpenLayers.Control.Navigation({dragPanOptions: {enableKinetic: true}}),
			new OpenLayers.Control.Zoom(),
			new OpenLayers.Control.MousePosition({prefix: '<a target="_blank" ' +'href="http://spatialreference.org/ref/epsg/3857/">' +'EPSG:3857</a>: '}),
			new OpenLayers.Control.ScaleLine()	
		]
	},
	center: new OpenLayers.LonLat(-73.993418, 40.750508).transform('EPSG:4326','EPSG:3857'),
	zoom: 14,
	layers: [
		new OpenLayers.Layer.OSM("MapQuest OSM Tiles",
					["http://otile1.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                    "http://otile2.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                    "http://otile3.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                    "http://otile4.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg"],
                    {isBaseLayer:true, visibility:true}),
		new OpenLayers.Layer.OSM("MapQuest Aerial Tiles",
					["http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
		             "http://otile2.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
		             "http://otile3.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
		             "http://otile4.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg"],
		            {isBaseLayer: true,
		            visibility: false}),
		new OpenLayers.Layer.OSM("OpenStreetMap",
					['http://a.tile.openstreetmap.org/${z}/${x}/${y}.png','http://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
					'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'],
                    {isBaseLayer:true, visibility:false}),
		new OpenLayers.Layer.WMS("Parks",
		         			"http://localhost:8082/geoserver/tour_manhattan/wms", 
		         			{layers: 'tour_manhattan:Manhattan_parks', transparent:true},
	              	{isBaseLayer:false,visibility:false,restrictedExtent: mmextent}),
		new OpenLayers.Layer.WMS('Museums',
	         			'http://localhost:8082/geoserver/tour_manhattan/wms', {
	              		layers: ['tour_manhattan:museums','tour_manhattan:museums_poly'],transparent:true},
	              	{isBaseLayer:false,visibility:false,restrictedExtent: mmextent}),
		new OpenLayers.Layer.WMS('Theatre',
	         			'http://localhost:8082/geoserver/tour_manhattan/wms', {
	              		layers: ['tour_manhattan:theatre','tour_manhattan:theatre_poly'],transparent:true},
	              	{isBaseLayer:false,visibility:false,restrictedExtent: mmextent}),
		new OpenLayers.Layer.WMS('Buildings',
	         			'http://localhost:8082/geoserver/tour_manhattan/wms', {
	              		layers: ['tour_manhattan:importantBuildings2'],transparent:true},
	              	{isBaseLayer:false,visibility:false,restrictedExtent: mmextent})
/*		new OpenLayers.Layer.WMS('Midtown Manhattan',
                'http://localhost:8082/geoserver/tour_manhattan/wms', {
                layers: ['tour_manhattan:museums','tour_manhattan:museums_poly',
                'tour_manhattan:theatre','tour_manhattan:theatre_poly',
                'tour_manhattan:Manhattan_parks','tour_manhattan:importantBuildings2'],transparent:true},
	              	{isBaseLayer:false,visibility:false,
	              	restrictedExtent: new OpenLayers.Bounds(-74.009802, 40.740490, -73.952681, 40.766806).transform('EPSG:4326','EPSG:3857')})
*/
	]
});


	 var mm_map = mmMapPanel.map;
	 var mm_mp = new OpenLayers.Control.MousePosition();
	 mm_map.addControl(mm_mp);


    // create the layer where the route will be drawn
    mm_route_layer = new OpenLayers.Layer.Vector("route", {
        styleMap: new OpenLayers.StyleMap(new OpenLayers.Style({
            strokeColor: "#ff00ff",
            strokeOpacity: 0.7,
            strokeWidth: 5
        }))
    });

    // create the layer where the start and final points will be drawn
    mm_points_layer = new OpenLayers.Layer.Vector("points", {
        styleMap: new OpenLayers.StyleMap(new OpenLayers.Style({
            "fillColor": "${getColor}",
            "strokeColor": "${getColor}",
            "pointRadius": 5,
            "fillOpacity": 1.0
        }, {context: {
               "getColor": function(feature) {
                   return (feature.layer.features[0] == feature) ? 'green' : 'red';
               }
           }}))
    });

	// create the control to draw the points (see the DrawPoints.js file)
	mm_draw_points = new DrawPoints(mm_points_layer);
    
    //map.raiseLayer(points_layer, map.layers.length);
    //map.setLayerIndex(points_layer, this.map.getNumLayers());
	
	// add the layers to the map
    mm_map.addLayers([mm_points_layer, mm_route_layer]);

    // create the store to query the web service
    var mm_store = new GeoExt.data.FeatureStore({
        layer: mm_route_layer, 
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


var toolbarItems = [];
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

placePoints = Ext.create('Ext.button.Button', {
	text: 'Place Markers',
	handler: function() {
		mm_points_layer.removeAllFeatures();	
		mm_store.removeAll();	

		mm_map.addControl(mm_draw_points);	
	}
});

toolbarItems.push(placePoints);
toolbarItems.push("-");

drawRoute = Ext.create('Ext.button.Button', {
	text: 'Draw Route',
	handler: function() {

		var mm_pointTrain = [];
		for (var i = 0; i < mm_points_layer.features.length; i++) {
			//pgrouting(points_layer, i, i+1);
			var mm_point = mm_points_layer.features[i].geometry.clone();
		     mm_point.transform(epsg_3857, epsg_4326);
		     mm_pointTrain.push(mm_point.x + " " + mm_point.y);
		}
			     console.log(mm_pointTrain);
	     // load to route
	     mm_store.load({
	         params: {
	             pointTrain: mm_pointTrain
	        }
		});
	 	
	}
});

toolbarItems.push(drawRoute);
toolbarItems.push("-");

clearRoute = Ext.create('Ext.button.Button', {
	text: 'Clear Route',
	handler: function() {
		mm_points_layer.removeAllFeatures();
		mm_store.removeAll();
		mm_draw_points.deactivate();

	}
});

toolbarItems.push(clearRoute);

/*toolbarItems.push(Ext.create('Ext.button.Button', {text:'close echogram browser',handler: antarcticCloseEchogramBrowser,tooltip: "close the echogram browser and go back to the normal interface."}));
toolbarItems.push("-");*/
mmMapPanel.addDocked([{
	xtype: 'toolbar',
	dock: 'top',
	items: toolbarItems
}]);

var mmStore = Ext.create('Ext.data.TreeStore', {
	model: 'GeoExt.data.LayerTreeModel',
	root: {
		expanded: true,
		children: [
			{
				plugins: [{
					ptype: 'gx_overlaylayercontainer',
					loader: {
						store: mmMapPanel.layers,
						createNode: function(attr) {
							attr.component = {
								xtype: "gx_wmslegend",
								layerRecord: mmMapPanel.layers.getByLayer(attr.layer),
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
						store: mmMapPanel.layers,
						createNode: function(attr) {
							attr.component = {
								xtype: 'panel',
								layerRecord: mmMapPanel.layers.getByLayer(attr.layer),
								showTitle: false,
								cls: 'legend'
							};
							return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
						}
					}
				}],
				expanded: true,
				text: 'Midtown Manhattan Base Layers'
			}
		]
	}
});

var mmTree = Ext.create('GeoExt.tree.Panel', {
	itemId: 'mmTree',
	region: 'east',
	title: 'Map Layer Selection',
	width: 250,
	collapsible: true,
	autoScroll: true,
	store: mmStore,
	rootVisible: false,
	lines: true
});

  var info = new OpenLayers.Control.WMSGetFeatureInfo({
            url: 'http://localhost:8082/geoserver/tour_manhattan/wms', 
            title: 'Identify features by clicking',
            queryVisible: true,
            infoFormat: 'application/vnd.ogc.gml',
            eventListeners: {
               getfeatureinfo: function(event) {
                   if (popup) {
                       mmMapPanel.map.removePopup(popup);
                   }
                   var contentHtml = '';
                   // Manage the features
                   if (event.features.length > 0) {
                       // for (var i = 0; i < event.features.length; i++) {
                           // var feature = event.features[i];
                           var feature = event.features[0];
                           // Identify the type
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
                     popup = new OpenLayers.Popup.FramedCloud(
                        "chicken", 
                        mmMapPanel.map.getLonLatFromPixel(event.xy),
                        null,
                        contentHtml,
                        null,
                        true
                    );
                    popup.autoSize = true;
                    mmMapPanel.map.addPopup(popup);
                }
           }
        });
		mmMapPanel.map.addLayers(info);
        mmMapPanel.map.addControl(info);
        info.activate();
        // mmMapPanel.map.addControl(new OpenLayers.Control.LayerSwitcher());


Ext.define('manhattan.view.MMTab' ,{
    
    extend: 'Ext.Panel',
	
	layout: 'border',
	defaults: {
		collapsible: false,
		bodyStyle: 'padding:0px'
	},
	
	alias: 'widget.mmtab',
    title: 'Midtown Manhattan',
	
	items: [mmMapPanel,mmTree]
});

