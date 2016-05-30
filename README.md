## Origami App

## Build Instructions
```bash
npm install
```

```bash
npm start
```
--
## Application Organization

* [app](#app)
	* [app.component](#appcomponentts)
	* [canvas](#canvas)
		* [canvas.build-mode.component](#build-modecomponentts)
		* [canvas.explore-mode.component](#explore-modecomponentts)
		* [canvas.report-mode.component](#report-modecomponentts)
	* [shared](#shared)
		* [node-detail.component](#node-detailcomponentts) 
			* [node-detail.display.component](#node-detaildisplaycomponentts) 
			* [node-detail.edit.component](#node-detaileditcomponentts)
		* [user-menu.component](#user-menucomponentts)
		* [nav.component](#navcomponentts)
		* services
			* [org.service](#orgservicets)
			* [more services...](#)	
		* models
			* [orgchart.model](#orgchartmodelts)
			* [orgnode.model](#orgnodemodelts)
			* [more models...](#)	
	* [login](#Login)
		* [login.component](#logincomponentts)


## App
### app.component.ts
Main application wrapper. 

## Canvas
### canvas.component.ts
Parent component wrapper for all canvas view modes. Set global view controls, window resizing, data model initialization. Inidividual org chart views loaded as nested components.

### canvas.build-mode.component.ts

### canvas.explore-mode.component.ts

### canvas.report-mode.component.ts
TBD - not currently in scope

## Shared
### node-detail.component.ts
### node-detail.display.component.ts
### node-detail.edit.component.ts
### user-menu.component.ts
### nav.component.ts

## Login
OAuth Login handled with auth0 authentication service.
### login.component.ts
