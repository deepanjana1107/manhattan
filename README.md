# Manhattan Tourist Itinerary

The NYC Manhattan Tourist Itinerary project (called 'Manhattan' in short) has been created in ExtJS’ MVC (Model-View-Controller) programming style. It is built with the following components.

- Server Side
	- PostGIS 2.1 with PostgreSQL 9.3 with pgRouting 2
	- GeoServer 2.5
	- PHP 
- Client Side
	- OpenLayers 2.13.1
	- GeoExt 2.0.2
	- ExtJS 4.2

- Folder Structure
	- 'app': stores the relevant model, view, controller files. For the 'Manhattan' application, no model is used
	- 'library': stores the relevant OpenLayers 2, GeoExt 2, and Ext.JS library files
	- 'resources': contains client application relevant non-JavaScript files such as images (of manhattan), map help, navigation help, etc.
		- A PHP file (route_multiple.php) inside the resources folder is used by the application to access pgRouting
	- 'database': contains two database dump files which can be used to set up the database 

Authors: Franziska Blumenschein & Deepanjana Majumdar

## How to load ‘Manhattan’ client application in Apache httpd web server

- The application has been tested with Apache httpd 2.4.7
- Clone this repository into your local folder (say, 'Manhattan')
- Copy the ‘Manhattan’ folder in /var/www/html folder of OSGeo-Live
- The index.html within 'Manhattan' will be visible in the browser at location http://localhost:80/manhattan/ (localhost/manhattan as shortcut)
- If you want to create more advanced or virtual locations, then create a new configuration in /etc/apache2/conf-available folder

## Setting up the Server Side

If you are using OSGeo Live, then the following components are already enabled for you. If not, please set these up individually.

- A PostgreSQL database containing different tables that store geometry data (‘features’) corresponding to the different ‘layers’ are displayed in the ‘Manhattan’ client

- pgRouting extension has been added (by default) to PostgreSQL database. The ‘ways’ table is pgRouting geometry (the_geom) enabled which is returned to the client application (‘Manhattan’) via PHP

- GeoServer is the WMS service provider. It exposes the different PostgreSQL tables to the ‘Manhattan’ application via WMS calls (in OSGeo Live via http://localhost:8082)


## Steps in Preparing the Data

- Get data from weogeo market (http://market.weogeo.com/datasets/osm-openstreetmap-new-york-ny-metro-region), here all needed layers are available
   Needed layers (as ESRI shapefile): highway (streets), leisure (parks), tourism (museums), buildings, amenity (theatres)
   
- Clip data to Manhattan boundaries

- Clean up data, remove unnecessary attributes (necessary: ID, geom, name)

- Create the following layers: theatre_poly (theatre polygons), buildins_poly (important buildings polygon features), theatre (theatre point features), 
   museums (museums point features), Manhattan_parks (park polygon features), museum_poly (museum polygon features)
   
- Modify the data, add the homepage and address columns and fill them manually either via pgAdmin or QGIS

- Style layers in QGIS and store them as .sld files

- Add layers to your PostGIS database

- Publish layers from the PostGIS database on Geoserver
	- Create a workspace called "tour_manhattan"
	- Create a store called "manhattan"
	- Add the layers described under point 4
	- Load the .sld files under style in GeoServer

Otherwise the database dump (database_dump.sql), which is also used as a backup, is containing all needed layers. It gives the opportunity to recreate the complete database within a SQL query, so the user only needs to publish these database tables.

## PgRouting

In order to provide the user a routing functionality the following steps need to be done. For further questions the FOSS4G workshop "Routing with pgRouting" provides further information.
 - http://download.osgeo.org/pgrouting/foss4g2010/workshop/docs/pgRoutingWorkshop.pdf
 - http://workshop.pgrouting.org/chapters/php_server.html

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

- Follow the further instructions in the PgRouting workshop from FOSS4G (http://workshop.pgrouting.org/chapters/topology.html) with chapter 4 (Create a Network Topology) and chapter 5 (PgRouting Algorithms)
  
After following this instructions the network topology is implemented and together with the published layers on geoserver and the provided codes the application should work.


