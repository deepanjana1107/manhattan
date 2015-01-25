/**
 * This is the structure of the MapPanel
 * Has Introduction, Attractions Overview, Lower Manhattan, Middle Manhattan, and Upper Manhattan tabs
 * @extends Ext.Panel
 */
Ext.define('manhattan.view.MapTabs' ,{
    
	extend: 'Ext.tab.Panel',
	alias: 'widget.maptabs',
	itemId: 'maptabs',
	
	requires: [
		'manhattan.view.AttractionTab',
		'manhattan.view.LMTab',
		'manhattan.view.MMTab',
		'manhattan.view.UMTab'
		
	],
	
	initComponent: function() {
		
		this.items = [
			{
				title: 'Introduction',
				xtype: 'box',
				autoEl: {
					tag: 'iframe',
					src: 'resources/about.html'
				}
			},{
				xtype: 'attractiontab',
				collapsible: false,
				header: false
			},{
				xtype: 'lmtab',
				collapsible: false,
				header: false
			},{
				xtype: 'mmtab',
				collapsible: false,
				header: false
			},{
				xtype: 'umtab',
				collapsible: false,
				header: false
			}
		]
		
		this.callParent(arguments);
    }
});
