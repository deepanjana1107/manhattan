Ext.define('manhattan.Application', {
    name: 'manhattan',

    extend: 'Ext.app.Application',

    requires: [
        'manhattan.Global',
        'GeoExt.tree.LayerContainer',
        'GeoExt.tree.OverlayLayerContainer',
        'GeoExt.tree.BaseLayerContainer',
        'GeoExt.data.LayerTreeModel',
        'GeoExt.data.FeatureStore',
        'GeoExt.data.proxy.Protocol',
        'Ext.grid.*',
        'GeoExt.container.WmsLegend',
        'GeoExt.container.UrlLegend',
        'GeoExt.container.VectorLegend',
        'GeoExt.panel.Legend'
    ],
    
    views: [
        'HeaderBar',
        'FooterBar',
        'MapTabs'
    ],

    controllers: [
        'MapTabs'
    ]
});
