var container, camera, renderer, controls;
var gui, funcText, xmin, xmax, ymin, ymax, r_step, f_step, r_init, r_scale, c_length, c_circum;
var composer, FXAAeffect, effectCopy, renderPass;
var objects = [];

function init() {
	const canvas = document.querySelector('#plot');
  	const renderer = new THREE.WebGLRenderer({canvas});

  	var display_window = renderer.domElement;
    const aspect = display_window.clientWidth / display_window.clientHeight;
  	const fov = 45;
  	// //const aspect = 1;
  	const near = 0.1;
  	const far = 1000;
  	var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  	camera.position.z = 6.5;
  	var expr = "9.81-r*y";
  	const p = new math.parser();
  	let s = {r: 9.81, y: 2, x:0};
  	var func = math.parse(expr);
  	console.log(func.evaluate(s));
  	const scene = new THREE.Scene();
  	gui = new dat.GUI();
 
  	
	renderPass = new THREE.RenderPass( scene, camera );

	effectCopy = new THREE.ShaderPass( THREE.CopyShader);
	effectCopy.renderToScreen = true;
	FXAAeffect = new THREE.ShaderPass( THREE.FXAAShader );
	FXAAeffect.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
	
	composer = new THREE.EffectComposer( renderer );
	composer.addPass( renderPass );
	composer.addPass( FXAAeffect );
	composer.addPass(effectCopy);
  	
	
	var pm = {
		//defaultView:  function() { defaultView(); },	
		plotSlope: function() { plotSlope(); },
		funcText: '9.81-r*y',
		xmin: -10,
		xmax:10,
		ymin: -10,
		ymax: 10,
		f_step: 1,
		r_init: 9.81,
		r_step: 4.905,
		r_scale: 1,
		c_length: .5,
		c_circum: .07

	};

    // Input Parameters
	funcText = gui.add( pm, 'funcText' ).name('dy/dx = f(x, y) = ');
	xmin = gui.add( pm, 'xmin' ).name('x minimum = ');
	xmax = gui.add( pm, 'xmax' ).name('x maximum = ');
	ymin = gui.add( pm, 'ymin' ).name('y minimum = ');
	ymax = gui.add( pm, 'ymax' ).name('y maximum = ');
	f_step = gui.add( pm, 'f_step' ).name('Step For Points');
	r_step = gui.add( pm, 'r_step' ).name('Step For Control Parameter');
	r_init = gui.add( pm, 'r_init' ).name('Starting Control Value');
	r_scale = gui.add( pm, 'r_scale' ).name('Scale of r');
	c_length = gui.add( pm, 'c_length' ).name('Cylinder Length');
	c_circum = gui.add( pm, 'c_circum' ).name('Cylinder radius');
	
	// A Preset example of a partcile undergoing linear drag

	gui.add( pm, 'plotSlope' ).name("Plot the Slope Field");	
	//gui.add( pm, 'defaultView' ).name("Reset to Default View"); to be readded when a good default is found
	
	
	preset();
	function preset()  {

	funcText.setValue('9.81-r*y');
	xmin.setValue(-10); xmax.setValue(10);
	ymin.setValue(-10); ymax.setValue(10);
	f_step.setValue(1); r_step.setValue(4.905);
	r_init.setValue(9.81);
	plotSlope(); 
	}
	scene.add(camera); // add our camera to the scene
	controls = new THREE.OrbitControls( camera, renderer.domElement ); //adds the controls
  	scene.add( new THREE.AxesHelper() );
  	var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000088, wireframe: true, side:THREE.DoubleSide } ); 
	var floorGeometry = new THREE.PlaneGeometry(1000,1000,10,10);
	var floor = new THREE.Mesh(floorGeometry, wireframeMaterial);
	scene.add(floor);
//addCylinder is useful if using non-buffer geometries
function addCylinder(x, y, z, m, geo) {
	var max_val = pm.xmax*pm.xmax + pm.ymax*pm.ymax;
	var dist = x*x + y*y;
	var R = 1-dist/max_val;
	var G = z/far;
	var B = 1;
	if (m == 0) { R=.8; G = .2; B=.8;}
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: new THREE.Color(R, 1-G, B)}, {side: THREE.DoubleSide}));
    addObject(x, y, z, m, mesh);
  }
function addObject(x, y, z, m, obj) {
	var angle = 0;
	const blowUp = math.isNaN(m);
	if (!blowUp) {angle = math.atan(m)+3.14159/2;}
	obj.rotation.z = angle;
	obj.position.x = x;
	obj.position.y = y;
	obj.position.z = -z*pm.r_scale;
	scene.add(obj);
	objects.push(obj);
}
function render() {

    if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  	}
  	controls.update();
  	composer.render();
    requestAnimationFrame(render);

  }
  
// taken from the threejsfundamentals site under the MIT license
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}


// // Deprecated until I can find a good default view
// 	function defaultView() {
// 	// Puts the camera back at the default view
// 	console.log('defaultView');
// 		const display_window = renderer.domElement;
//   		const width = display_window.clientWidth;
//   		const height = display_window.clientHeight;
// 		const fov  = 45;
// 		const aspect = width / height;
// 		const near = 0.1;
// 		const far = math.abs(r_step*10);
// 		//const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
// 		camera.position.set( 0 , 0, pm.r_init*.75);
// 		camera.up = new THREE.Vector3( 0, 1, 0);
// 		camera.lookAt(scene.position);
// 		//scene.add(camera);
// 		//controls = new OrbitControls( camera, renderer.domElement );

// 	}
	
	function plotSlice(r_cur, z, geometry) {
		//Making new objects is expensive
		console.log(r_cur);
		const parser = new math.parser();
		for ( var i = pm.xmin; i <= pm.xmax; i+=pm.f_step) {
			for ( var j = pm.ymin; j <= pm.ymax; j+=pm.f_step) {
				let scope = {r: r_cur, x: i, y: j};
				var func = math.parse(pm.funcText.toString());
				var m = func.evaluate(scope);
				var max_val = pm.xmax*pm.xmax + pm.ymax*pm.ymax;
				var dist = i*i + j*j;
				var R = 1-dist/max_val;
				var G = z/far;
				var B = 1;
				if (m == 0) { R=0.0; G = 0.0; B=0.0; console.log(R); console.log(1-G); console.log(B);}
				else if (math.abs(m) < .05) {R=0.0; G = math.abs(m); B=0.0;}
				if (math.isNaN(m)) { R=1.0; G=1.0; B=0.0;}

    			const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: new THREE.Color(R, 1.0-G, B)}, {side: THREE.DoubleSide}));
				addObject(i, j, z, m, mesh);
			}
		}
	}
	function plotSlope() {
		const parser = new math.parser();
		const far = math.abs(pm.r_step*10);
		const radiusTop = pm.c_circum;
		const radiusBottom = pm.c_circum;
		const height = pm.c_length;
		const radialSegments = 12;
		const geometry = new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, height, radialSegments);
		// Making objects is expensive so if all our geometries are the same might as well just copy paste
		//Using Buffer geometry means you can't go back and change it arbitrarily but it takes full advantage
		// of the vertex shader
		var i;
		remove();
		for (i = pm.r_init; i <= far; i+=pm.r_step) {
			var z = math.round((i-pm.r_init))
			plotSlice(i, z, geometry);
		}
		requestAnimationFrame(render);

	}
	//removes objects neessary when using buffer objects
	function remove() {
		objects.forEach((obj)=> {
			scene.remove(obj);
		});
		objects = [];
	}
requestAnimationFrame(render);
	
}




init();
