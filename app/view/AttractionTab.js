// Initialize global variables
var popup = null;

// define the attraction Map Panel that holds the map of Manhattan
var attractionMapPanel = Ext.create('GeoExt.panel.Map', {
	region: 'center',
	itemId: 'attractionMap',
	map: {
		allOverlays: false,
		projection: 'EPSG:3857', // The map is always projected in EPSG 3857 
		units: 'm',
		controls: [
			new OpenLayers.Control.Navigation({dragPanOptions: {enableKinetic: true}}),
			new OpenLayers.Control.Zoom(),
			new OpenLayers.Control.MousePosition({prefix: '<a target="_blank" '+'href="http://wiki.openstreetmap.org/wiki/EPSG:3857">' +'EPSG:3857</a>: '}),
			new OpenLayers.Control.ScaleLine(),
			new OpenLayers.Control.Attribution()

		]
	},
	center: new OpenLayers.LonLat(-73.996417, 40.729338).transform('EPSG:4326','EPSG:3857'), // pan the map to its center (transform coordinates from 4326 to 3857)
	zoom: 13,
	layers: [
		new OpenLayers.Layer.OSM("MapQuest OSM Tiles", // Default Baselayer - visibility set to true. isBaseLayer: true adds layer to Tree 'baselayer' container
					["http://otile1.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                    "http://otile2.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                    "http://otile3.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                    "http://otile4.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg"],
                    {attribution: "© <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> and contributors, under an <a href='http://www.openstreetmap.org/copyright' title='ODbL'>open license</a>. Tiles Courtesy of <a href='http://www.mapquest.com/'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>" },
                    {isBaseLayer:true, visibility:true}),
		new OpenLayers.Layer.OSM("MapQuest Aerial Tiles", // Second Baselayer - not default. isBaseLayer: true adds layer to Tree 'baselayer' container
					["http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
		             "http://otile2.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
		             "http://otile3.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
		             "http://otile4.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg"],
		             {attribution: "© <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> and contributors, under an <a href='http://www.openstreetmap.org/copyright' title='ODbL'>open license</a>. Tiles Courtesy of <a href='http://www.mapquest.com/'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>" },
		            {isBaseLayer: true,
		            visibility: false}),
		new OpenLayers.Layer.OSM("OpenStreetMap", // Third Baselayer - not default. isBaseLayer: true adds layer to Tree 'baselayer' container
					['http://a.tile.openstreetmap.org/${z}/${x}/${y}.png','http://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
					'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'],
                    {isBaseLayer:true, visibility:false}),
		new OpenLayers.Layer.WMS("Parks", // Overlay layer - isBaseLayer: false automatically adds to Tree 'overlay' container
		         			"http://localhost:8082/geoserver/tour_manhattan/wms", 
		         			{layers: 'tour_manhattan:Manhattan_parks', transparent:true},
	              	{isBaseLayer:false,visibility:false}),
		new OpenLayers.Layer.WMS('Museums', // Overlay layer - isBaseLayer: false automatically adds to Tree 'overlay' container
	         			'http://localhost:8082/geoserver/tour_manhattan/wms', {
	              		layers: ['tour_manhattan:museums','tour_manhattan:museums_poly'],transparent:true},
	              	{isBaseLayer:false,visibility:false}),
		new OpenLayers.Layer.WMS('Theatre', // Overlay layer - isBaseLayer: false automatically adds to Tree 'overlay' container
	         			'http://localhost:8082/geoserver/tour_manhattan/wms', {
	              		layers: ['tour_manhattan:theatre','tour_manhattan:theatre_poly'],transparent:true},
	              	{isBaseLayer:false,visibility:false}),
		new OpenLayers.Layer.WMS('Buildings', // Overlay layer - isBaseLayer: false automatically adds to Tree 'overlay' container
	         			'http://localhost:8082/geoserver/tour_manhattan/wms', {
	              		layers: ['tour_manhattan:importantBuildings2'],transparent:true},
	              	{isBaseLayer:false,visibility:false})

	]
});

// instantiate an array for toolbar
var toolbarItems = []; 

// Map Help is the only toolbar button in Attraction Overview map
mapHelp = Ext.create('Ext.button.Button', {
	text: 'Map Help',
	handler: function() {
		Ext.Ajax.request({
			url: 'resources/maphelp.html',
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

toolbarItems.push(mapHelp); // add mapHelp button to the toolbar array for display

attractionMapPanel.addDocked([{
	xtype: 'toolbar',
	dock: 'top',
	items: toolbarItems
}]);

// attraction store instantiates the tree with baselayer and overlay layer containers
// extends the GeoExt.data.LayerTreeModel 
var attractionStore = Ext.create('Ext.data.TreeStore', {
	model: 'GeoExt.data.LayerTreeModel',
	root: {
		expanded: true,
		children: [
			{
				plugins: [{
					ptype: 'gx_overlaylayercontainer',
					store: attractionMapPanel.layers,
					loader: {
                    	createNode: function(attr) {
							attr.component = {
								xtype: "gx_wmslegend",
								layerRecord: attractionMapPanel.layers.getByLayer(attr.layer),
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
						store: attractionMapPanel.layers,
						createNode: function(attr) {
							attr.component = {
								xtype: 'panel',
								layerRecord: attractionMapPanel.layers.getByLayer(attr.layer),
								showTitle: false,
								cls: "legend"
							};
							return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
						}
					}
				}],
				expanded: true,
				text: 'Base Layers'
			}
		]
	}
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
                   attractionMapPanel.map.removePopup(popup);
               }
               // instantiate variable contentHTML to store the content of the popup
               var contentHtml = '';
          
               if (event.features.length > 0) {
//                       for (var i = 0; i < event.features.length; i++) {
//                          var feature = event.features[i];
						// always get the last feature layer
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
                           if (typeof homepage === "undefined") {
                           	contentHtml = contentHtml + '<font color="black"><b>' + name + '</b>' + '<p>' + address + '</p>' + 
                            'Website not available' + '<p></p></font>'; 

                           }
                           else {
                           if (homepage.charAt(0)=='h')
                           	actualHomepage = '<a href="' + homepage + ' ';
                           else
                           	actualHomepage = '<a href="http:\/\/' + homepage + ' ';
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
                           if (typeof homepage === "undefined") {
                           	contentHtml = contentHtml + '<font color="black"><b>' + name + '</b>' + '<p>' + address + '</p>' + 
                            'Website not available' + '<p></p></font>'; 

                           }
                           else {
                           if (homepage.charAt(0)=='h')
                           	actualHomepage = '<a href="' + homepage + ' ';
                           else
                           	actualHomepage = '<a href="http:\/\/' + homepage + ' ';
                           contentHtml = contentHtml + '<font color="black"><b>' + name + '</b>' + '<p>' + address + '</p>' + 
                            actualHomepage + '"target="_blank">Website</a>' + '<p></p></font>'; 	
                           }
                           console.log(contentHtml);
                        }
//                        }
                    } else {
                        // Don't show any popup if no features are present
                        return;
                    }
                 // now it's time to display the popup
                 // style is a callout FramedCloud   
                 popup = new OpenLayers.Popup.FramedCloud(
                    "chicken", 
                    attractionMapPanel.map.getLonLatFromPixel(event.xy),
                    null,
                    contentHtml,
                    null,
                    true
                );
                popup.autoSize = true;
                attractionMapPanel.map.addPopup(popup);
            }
       }
    });
	attractionMapPanel.map.addLayers(info);
    attractionMapPanel.map.addControl(info);
    info.activate();
 
var attractionTree = Ext.create('GeoExt.tree.Panel', {
	itemId: 'attractionTree',
	region: 'east',
	title: 'Map Layer Selection',
	width: 250,
	collapsible: true,
	autoScroll: true,
	store: attractionStore,
	rootVisible: false,
	lines: true
});

// Define AttractionTab as viewport in manhattan application
// Extends Ext.Panel class of Ext.JS
Ext.define('manhattan.view.AttractionTab' ,{
    
    extend: 'Ext.Panel',
	
	layout: 'border',
	defaults: {
		collapsible: false,
		bodyStyle: 'padding:0px'
	},
	
	alias: 'widget.attractiontab',
    title: 'Attractions Overview',
	
	items: [attractionMapPanel,attractionTree]
});