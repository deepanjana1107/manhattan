<?php
include('config.inc.php');
ob_start();
   // Retrieve start point
   $start = split(' ',$_REQUEST['startpoint']);
   $startPoint = array($start[0], $start[1]);

   // Retrieve end point
   $end = split(' ',$_REQUEST['finalpoint']);
   $endPoint = array($end[0], $end[1]);

     // Find the nearest edge
   $startEdge = findNearestEdge($startPoint);
   $endEdge   = findNearestEdge($endPoint);

   // FUNCTION findNearestEdge
   function findNearestEdge($lonlat) {

      // Connect to database
      $con = pg_connect("dbname=".PG_DB." host=".PG_HOST." user=".PG_USER);

      $sql = "SELECT gid, source, target, the_geom, 
              ST_Distance(the_geom, ST_GeometryFromText(
                     'POINT(".$lonlat[0]." ".$lonlat[1].")', 4326)) AS dist 
               FROM ".TABLE."  
               WHERE the_geom && setsrid(
                     'BOX3D(".($lonlat[0]-0.1)." 
                            ".($lonlat[1]-0.1).", 
                            ".($lonlat[0]+0.1)." 
                            ".($lonlat[1]+0.1).")'::box3d, 4326) 
               ORDER BY dist LIMIT 1";

      $query = pg_query($con,$sql);  

      $edge['gid']      = pg_fetch_result($query, 0, 0);  
      $edge['source']   = pg_fetch_result($query, 0, 1);  
      $edge['target']   = pg_fetch_result($query, 0, 2);  
      $edge['the_geom'] = pg_fetch_result($query, 0, 3);  

      // Close database connection
      pg_close($con);

      return $edge;
   }

$sql = "


SELECT rt.gid, ST_AsGeoJSON(rt.the_geom) AS geojson, 
                   length(rt.the_geom) AS length, ".TABLE.".gid 
                FROM ".TABLE.", 
                    (SELECT gid, the_geom 
                        FROM pgr_dijkstra(
                            '".TABLE."',
                            ".$startEdge['source'].",
                            ".$endEdge['target'].",
                            0.1)
                     ) as rt 
                WHERE ".TABLE.".gid=rt.gid;";


   // Connect to database
   $dbcon = pg_connect("dbname=".PG_DB." host=".PG_HOST." user=".PG_USER." password=".PG_PASSWORD);

   // Perform database query
   $query = pg_query($dbcon,$sql); 
   



   // Return route as GeoJSON
   $geojson = array(
      'type'      => 'FeatureCollection',
      'features'  => array()
   ); 
  
   // Add edges to GeoJSON array
   while($edge=pg_fetch_assoc($query)) {  

      $feature = array(
         'type' => 'Feature',
         'geometry' => json_decode($edge['geojson'], true),
         'crs' => array(
            'type' => 'EPSG',
            'properties' => array('code' => '4326')
         ),
         'properties' => array(
            'id' => $edge['id'],
            'length' => $edge['length']
         )
      );
      
      // Add feature array to feature collection array
      array_push($geojson['features'], $feature);
   }

	
   // Close database connection
   pg_close($dbcon);

   // Return routing result
   header('Content-type: application/json',true);
   echo json_encode($geojson);

?>
