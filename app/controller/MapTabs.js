/**
 * Map controller
 * Used to manage map layers and show their related views
 */
Ext.define('manhattan.controller.MapTabs', {
    extend: 'Ext.app.Controller',
	
 views: [
        'MapTabs'
    ],
	
init: function() {
        // init function is always the first function to be executed in the 'manhattan' application (much like the main method in Java)
        
        // ProxyHost below is required bypass proxy cross-site-scripting between Apache httpd & GeoServer webservers
        // if you are using a different machine, please store the proxy_zoo.cgi file in an appropriate cgi-bin folder 
        // proxy code obtained from OpenLayers 2 documentation
        OpenLayers.ProxyHost = "/cgi-bin/proxy_zoo.cgi?url="; 
        this.control({
            '#maptabs':{
                tabchange: function(tabPanel,newCard,oldCard) {
                    
                    var newTab = newCard.tab.text;
                    console.log(newTab);
                    var oldTab = oldCard.tab.text;
                    console.log(oldTab);
                    
                    }
                }
            
        });
    }
});
