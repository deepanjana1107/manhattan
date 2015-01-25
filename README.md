# Manhattan Tourist Itinerary

The Manhattan client has been created in GeoExt’s MVC (Model-View-Controller) programming style.

Authors: Franziska Blumenschein & Deepanjana Majumdar

## How to load ‘Manhattan’ client application in Apache2

- Clone this repository into your local repo
- Copy the ‘Manhattan’ folder in /var/www/html folder
- Then the index.html file will be visible in the browser http://localhost:80/manhattan/ (localhost/manhattan as shortcut)
- One can create more advanced/virtual sites by editing /etc/apache2/conf-available folder by creating a new configuration

## Server Side

- PostgreSQL database hosting different tables that store geometry data (‘features’) corresponding to the different ‘layers’ that are displayed in the ‘manhattan’ client

- pgRouting extension that has been added (by default) to PostgreSQL database. The ‘ways’ table is pgRouting geometry (the_geom) enabled which is returned to the client application (‘manhattan’) via PHP

- GeoServer is the WMS service provider. It exposes the different PostgreSQL tables to the ‘manhattan’ application via webservice calls via http://localhost:8082

- a php file (routing_multiple.php) which acts as proxy between ‘manhattan’ and ‘ways
 table in PostgreSQL

## Preparing Data

- Getting data from weogeo market (http://market.weogeo.com/datasets/osm-openstreetmap-new-york-ny-metro-region), here all needed layers are available
   Needed layers (as ESRI shapefile): highway (streets), leisure (parks), tourism (museums), buildings, amenity (theatres)
   
- Clip data to Manhattan boundaries

- Clean up data, remove not needed attributes (necessary: ID, geom, name)

- Create the following layers: theatre_poly (theatre polygons), buildins_poly (important buildings polygon features), theatre (theatre point features), 
   museums (museums point features), Manhattan_parks (park polygon features), museum_poly (museum polygon features)
   
- Modify the data, add the homepage and address columns and fill them manually

- Style your layers

- Add your layers to your PostGIS database

- Publish layers from the PostGIS database on Geoserver
	- Create a workspace called "tour_manhattan"
	- Create a store called "manhattan"
	- Add the layers described under point 4

## PgRouting

In order to provide the user a routing functionality the following steps need to be done. For further questions the FOSS4G workshop "Routing with pgRouting" provides
further information.
http://download.osgeo.org/pgrouting/foss4g2010/workshop/docs/pgRoutingWorkshop.pdf
http://workshop.pgrouting.org/chapters/php_server.html

- Create database "routing" in PostgreSQL 

- Add postgis and pgRouting extension to the database (see workshop chapter 3.3)
  (-- add PostGIS functions
	CREATE EXTENSION postgis;

	-- add pgRouting core functions
	CREATE EXTENSION pgrouting;)

- Create a connection between this database and QGIS (Add PostGIS Table in QGIS)

- Layer highway (only the lines are needed):

	- change CRS from EPSG 3857 (WGS84 Web Mercator) to 4326 (WGS 84 / Latlong) after loading the data to QGIS
	
	- Explode lines (f.e. with QGIS Processing Toolbox: Geoalgorithms -> Vector geom tools -> Explode lines. 
	  This step is necessary to create junctions wherever streets will intersect. Otherwise streets will only intersect in the start and end point.
	  
	- Add new columns to the attribute table: -> gid (=$id)
											  -> length (=$length)
											  -> the_geom (=$geom)
	
    - Use QGIS DB Manager to add .shp-file layer as table "ways" to the PostGIS database. Choose target SRID 4326, create a spatial index, create single-part geometries 
	  instead of multi-part and the_geom as the geometry column
	  
	- Run query "UPDATE ways SET the_geom = ST_Force_2D(geom)"

- Follow the further instructions in the PgRouting workshop from FOSS4G (http://workshop.pgrouting.org/chapters/topology.html) with chapter 4 (Create a Network Topology)
  and chapter 5 (PgRouting Algorithms)
  
After following this instructions the network topology is implemented and together with the published layers on geoserver and the provided codes the application 
should work.

## Client Side

‘Manhattan’ => the JavaScript (JS) client application built in MVC style. It comprises the following important folders:

- app: stores the relevant model, view, controller files
- library: stores the relevant OpenLayers 2, GeoExt 2, and Ext.JS library files
- resources: contain client application relevant non-JavaScript files such as images (of NYC), help files (map files) etc.
- the php file (route_multiple.php) is contained in the manhattan/resources/php folder

Apache2 (HTTPD) webserver that hosts the ‘manhattan’ application client on http://localhost:80/ 
