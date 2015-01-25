<?php
    include('config.inc.php');
    ob_start();
    $pointTrain = array();
    $start = array();
    $end = array();
    $pointTrain = $_REQUEST['pointTrain'];
   
   $latlng = explode(",", $pointTrain);

   // Return route as GeoJSON
   $geojson = array(
      'type'      => 'FeatureCollection',
      'features'  => array()
   ); 


   // Connect to database
   $dbcon = pg_connect("dbname=".PG_DB." host=".PG_HOST." user=".PG_USER." password=".PG_PASSWORD);
  
   for ($i=0; $i < count($latlng)-1; $i++) { 
     $start = explode(" ", $latlng[$i]);

     $end = explode(" ", $latlng[$i+1]);


      $sql = "
      SELECT gid, ST_AsGeoJSON(geom) AS geojson, ST_length(geom) AS length 
      FROM pgr_fromAtoB
      ('".TABLE."',".$start[0].", ".$start[1].",".$end[0].",".$end[1].");";

       // Perform database query
       $query = pg_query($dbcon,$sql); 
    
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
                'id' => $edge['gid'],
                'length' => $edge['length']
             )
          );
          
          // Add feature array to feature collection array
          array_push($geojson['features'], $feature);
       }

   }

   // Close database connection
   pg_close($dbcon);

   // Return routing result
   header('Content-type: application/json',true);
   echo json_encode($geojson);

?>
