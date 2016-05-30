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

* [app](#App)
	* [app.component](#app.component.ts)
	* [canvas](#Canvas)
		* [canvas.build-mode.component](#build-mode.component.ts)
		* [canvas.explore-mode.component](#explore-mode.component.ts)
		* [canvas.report-mode.component](#report-mode.component.ts)
	* [shared](#Shared)
		* [node-detail.component](#node-detail.component.ts) 
			* [node-detail.display.component](#node-detail.display.component.ts) 
			* [node-detail.edit.component](#node-detail.edit.component.ts)
		* [user-menu.component](#user-menu.component.ts)
		* [nav.component](#nav.component.ts)
		* services
			* [org.service](#org.service.ts)
			* [more services...](#)	
		* models
			* [orgchart.model](#orgchart.model.ts)
			* [orgnode.model](#orgnode.model.ts)
			* [more models...](#)	
	* [login](#Login)
		* [login.component](#login.component.ts)


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
