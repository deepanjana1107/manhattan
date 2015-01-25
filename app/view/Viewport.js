/**
 * The main application viewport, which displays the whole application
 * @extends Ext.Viewport
 */
Ext.define('manhattan.view.Viewport', {
    extend: 'Ext.Viewport',

    requires: [
        'Ext.layout.container.Fit',
		'Ext.layout.container.Accordion',
		'Ext.layout.container.Border',
		'Ext.tab.Panel',
	    'Ext.resizer.Splitter',
 		'manhattan.view.HeaderBar',
 		'manhattan.view.FooterBar',
 		'manhattan.view.MapTabs'
	    ],

	layout: 'border',
	defaults: {
		collapsible: false,
		split: true,
		bodyStyle: 'padding:15px'
	},

    initComponent: function() {
        this.items = [{
				xtype: 'headerbar',
				region: 'north',
				margins: '5 5 5 5',
				height: 0,
				maxSize: 0,
				collapsed: true,
				hideCollapseTool: true
			},{
				xtype: 'maptabs',
				region: 'center',
				margins: '0 5 0 0',
				bodyStyle: 'padding:0px',
				collapsible: false,
				header: false
			},{
				xtype: 'footerbar',
				region: 'south',
				margins: '5 5 5 5',
				height: 0,
				maxSize: 0,
				collapsed: true,
				hideCollapseTool: true
			}]
		
		this.callParent();
	}
});
