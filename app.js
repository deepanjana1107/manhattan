/**
 * Ext.Loader
 */
Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        GeoExt: "library/geoext2",
        // for dev use
        Ext: "library/ext/src"
        // for build purpose
    }
});


Ext.application({
    name: 'manhattan',

    extend: 'manhattan.Application',
    
    autoCreateViewport: true
});


/* Old Code with One Map
Ext.application({
    name: 'manhattan',
    appFolder: 'app',
    controllers: [
        'Map'
    ],
    autoCreateViewport: true
});
*/
