# Manhattan Tourist Itinerary

Open Source Geo Project Manhattan

Authors: Franziska Blumenschein & Deepanjana Majumdar

Client Technologies: OpenLayers 2, GeoExt2, Ext.JS, and PHP

## Data

1. Getting data from weogeo market (http://market.weogeo.com/datasets/osm-openstreetmap-new-york-ny-metro-region), here all needed layers are available
   Needed layers (as ESRI shapefile): highway (streets), leisure (parks), tourism (museums), buildings, amenity (theatres)
   
2. Clip data to Manhattan boundaries

3. Clean up data, remove not needed attributes (necessary: ID, geom, name)

4. Create the following layers: theatre_poly (theatre polygons), buildins_poly (important buildings polygon features), theatre (theatre point features), 
   museums (museums point features), Manhattan_parks (park polygon features), museum_poly (museum polygon features)
   
5. Modify the data, add the homepage and address columns and fill them manually

6. Style your layers

7. Add your layers to your PostGIS database

8. Publish layers from the PostGIS database on Geoserver
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
