var cubeRotation = 0.0;
vecadd = function(v1,v2){
	out = [];
	for(var i=0;i<v1.length;i++){
		out.push(v1[i]+v2[i]);
	}
	return out;
}

vecadd3 = function(v1,v2,v3){
	out = [];
	for(var i=0;i<v1.length;i++){
		out.push(v1[i]+v2[i]+v3[i]);
	}
	return out;
}

vecscale = function(v,c){
	out = [];
	for(var i=0;i<v.length;i++){
		out.push(v[i]*c);
	}
	return out;
}

unitdisp = function(v1,v2){
	out = [];
	for(var i=0;i<v1.length;i++){
		out.push(v2[i]-v1[i]);
	}
	return vecscale(out,1.0/Math.hypot(v1[0]-v2[0],v1[1]-v2[1],v1[2]-v2[2]));
}





// Physics Engine

const N=14;
const gravity=0.02;
const rigidity=6.0;
const damping=0.3;
const L=2.0;
const dx= L/(N-1);
const dt=0.03;

class Particle {
  constructor() {
    this.pos = [0.0,0.0,0.0];
    this.vel = [0.0,0.0,0.0];
	this.acc = [0.0,0.0,0.0];
	this.oldacc = [0.0,0.0,0.0];
  }
  // Getter
  get info() {
    return this.getInfo();
  }
  // Method
  getInfo() {
    return 'pos:'+this.pos + ' vel:' + this.vel + ' acc:'+this.acc;
  }
  static foo(){ console.log('hi');}
  
  static dist(p1, p2) {
	  return Math.hypot(p1.pos[0]-p2.pos[0],p1.pos[1]-p2.pos[1],p1.pos[2]-p2.pos[2]);
  }
  
  static force(p1,p2){
	return vecscale(unitdisp(p1.pos,p2.pos),rigidity*(Particle.dist(p1,p2)-dx));
  }
 
  
}

class World{
		constructor(){
			this.nodes = [];
			this.wPow=0.0;
			for (var i=0;i<N;i++){
				for(var j=0;j<N;j++){
					var p = new Particle();
					p.pos=[(-L/2.0) + i*dx,(-L/2.0)+j*dx,0.0];
					this.nodes.push(p);
					//console.log(p.pos[0]+"*"+p.pos[1]);
				}
			}
		
			
		}
		
		blow(pow){
			if(this.wPow===0.0){
				this.wPow=parseFloat(pow);
			console.log('in blow' +this.wPow);
			}
		}
		
		tick() {
			// Update Position
			var wpower = this.wPow;
			if(this.wPow!==0) console.log('non zero pow');
			for (var i=0;i<N*N;i++){
				if(i%N==(N-1)) continue;
				this.nodes[i].pos=vecadd3(this.nodes[i].pos,vecscale(this.nodes[i].vel,dt),vecscale(this.nodes[i].acc,dt*dt*0.5));
				this.nodes[i].oldacc = this.nodes[i].acc;
				
				this.nodes[i].acc=[0.0,-gravity,0.0];
				// console.log('applying '+this.nodes[i].acc);
				
			/* 	if((cnt%200==14))sgn*=-1.0;
				if((cnt%200)>12 && (cnt%200)<14){
					this.nodes[i].acc=vecadd(this.nodes[i].acc,[0.0,0.0,-4.0*sgn]);
					
				} */
				
				//console.log('@'+cnt+ ' pos ' +this.nodes[i].pos);
			}
			
			
			// Calculate New Forces
			for (var i=0;i<N;i++){
				for(var j=0;j<N;j++){
					
					var ind = j+i*N;
					//console.log('@'+cnt+ ' acc ' +this.nodes[ind].acc);
						if(i-1>0){
							this.nodes[ind].acc=vecadd(this.nodes[ind].acc,Particle.force(this.nodes[ind],this.nodes[ind-N]));
							//console.log('@'+cnt+ ' FORCE1 ' +Particle.force(this.nodes[ind],this.nodes[ind-N]));
							
						}
						if(i+1<N){
							this.nodes[ind].acc=vecadd(this.nodes[ind].acc,Particle.force(this.nodes[ind],this.nodes[ind+N]));
							//console.log('@'+cnt+ ' FORCE2 ' +Particle.force(this.nodes[ind],this.nodes[ind+N]));
						}
						if(j-1>0){
							this.nodes[ind].acc=vecadd(this.nodes[ind].acc,Particle.force(this.nodes[ind],this.nodes[ind-1]));
							//console.log('@'+cnt+ ' FORCE3 ' +Particle.force(this.nodes[ind],this.nodes[ind-1]));
						}
						if(j+1<N){
							this.nodes[ind].acc=vecadd(this.nodes[ind].acc,Particle.force(this.nodes[ind],this.nodes[ind+1]));
							//console.log('@'+cnt+ ' FORCE4 ' +Particle.force(this.nodes[ind],this.nodes[ind+1]));
						}
						
						this.nodes[ind].acc=vecadd(this.nodes[ind].acc,vecscale(this.nodes[ind].vel,-damping));
						this.nodes[ind].acc=vecadd(this.nodes[ind].acc,[0.0,0.0,wpower]);
					
						//console.log('@'+cnt+ ' acc ' +this.nodes[ind].acc);
				}
			}
			// Update Speed
			for (var i=0;i<N*N;i++){
				this.nodes[i].vel=vecadd3(this.nodes[i].vel,vecscale(this.nodes[i].acc,0.5*dt),vecscale(this.nodes[i].oldacc,dt*0.5));
			}
			this.wPow=0.0;
		}
}


// Main




main();

//
// Start here
//
function main() {
	
	// Set the world
	var d = vecadd([1,2,3],[4,5,6]);
	console.log(d);
	
	world = new World();
	
	
	
	
	// Set the graphics
	
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aTextureCoord and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
	 buffers = initBuffers(gl);

  const texture = loadTexture(gl, 'cubetexture.png');

  var then = 0;
    cnt = 0;
  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
	if(cnt<100000){
		cnt++;
		world.tick();
	// buffers = updateBuffers(gl);
	
    drawScene(gl, programInfo, buffers, texture, deltaTime);

    requestAnimationFrame(render);
	}
		
	
  }
  requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  var positions = [];
  
  for(var i=0;i<(N-1)*(N-1);i++){
	  var ind = i+Math.floor(i/(N-1));
	 
	  positions.push(world.nodes[ind].pos[0]);
	  positions.push(world.nodes[ind].pos[1]);
	  positions.push(world.nodes[ind].pos[2]);
		
	  positions.push(world.nodes[ind+1].pos[0]);
	  positions.push(world.nodes[ind+1].pos[1]);
	  positions.push(world.nodes[ind+1].pos[2]);
	  
	  positions.push(world.nodes[ind+1+N].pos[0]);
	  positions.push(world.nodes[ind+1+N].pos[1]);
	  positions.push(world.nodes[ind+1+N].pos[2]);
	  
	  positions.push(world.nodes[ind+N].pos[0]);
	  positions.push(world.nodes[ind+N].pos[1]);
	  positions.push(world.nodes[ind+N].pos[2]);
	  
  }
  
  

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the texture coordinates for the faces.

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  var textureCoordinates = [];
  
  for(var i=0;i<(N-1)*(N-1);i++){
	  
	  textureCoordinates.push(0.0);
	  textureCoordinates.push(0.0);
	  
	  textureCoordinates.push(1.0);
	  textureCoordinates.push(0.0);
	  
	  textureCoordinates.push(1.0);
	  textureCoordinates.push(1.0);
	  
	  textureCoordinates.push(0.0);
	  textureCoordinates.push(1.0);
	  
  }
  

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  var indices = [];
  
    for(var i=0;i<(N-1)*(N-1);i++){
		var ind = i*4;
	  indices.push(ind); indices.push(ind+1); indices.push(ind+2); indices.push(ind); indices.push(ind+2); indices.push(ind+3); 
  }

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);
	
	console.log(indices);
	console.log(positions);
	console.log(textureCoordinates);
  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}

function updateBuffers(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  var positions = [];
  
  for(var i=0;i<(N-1)*(N-1);i++){
	  var ind = i+Math.floor(i/(N-1));
	 
	  positions.push(world.nodes[ind].pos[0]);
	  positions.push(world.nodes[ind].pos[1]);
	  positions.push(world.nodes[ind].pos[2]);
		
	  positions.push(world.nodes[ind+1].pos[0]);
	  positions.push(world.nodes[ind+1].pos[1]);
	  positions.push(world.nodes[ind+1].pos[2]);
	  
	  positions.push(world.nodes[ind+1+N].pos[0]);
	  positions.push(world.nodes[ind+1+N].pos[1]);
	  positions.push(world.nodes[ind+1+N].pos[2]);
	  
	  positions.push(world.nodes[ind+N].pos[0]);
	  positions.push(world.nodes[ind+N].pos[1]);
	  positions.push(world.nodes[ind+N].pos[2]);
	  
  }
  
  

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the texture coordinates for the faces.

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  var textureCoordinates = [];
  
  for(var i=0;i<(N-1)*(N-1);i++){
	  
	  textureCoordinates.push(0.0);
	  textureCoordinates.push(0.0);
	  
	  textureCoordinates.push(1.0);
	  textureCoordinates.push(0.0);
	  
	  textureCoordinates.push(1.0);
	  textureCoordinates.push(1.0);
	  
	  textureCoordinates.push(0.0);
	  textureCoordinates.push(1.0);
	  
  }
  

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  var indices = [];
  
    for(var i=0;i<(N-1)*(N-1);i++){
		var ind = i*4;
	  indices.push(ind); indices.push(ind+1); indices.push(ind+2); indices.push(ind); indices.push(ind+2); indices.push(ind+3); 
  }

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);
	
	console.log(indices);
	console.log(positions);
	console.log(textureCoordinates);
  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, texture, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0]);  // amount to translate


  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
	    const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
  var positions = [];
  
  for(var i=0;i<(N-1)*(N-1);i++){
	  var ind = i+Math.floor(i/(N-1));
	 
	  positions.push(world.nodes[ind].pos[0]);
	  positions.push(world.nodes[ind].pos[1]);
	  positions.push(world.nodes[ind].pos[2]);
		
	  positions.push(world.nodes[ind+1].pos[0]);
	  positions.push(world.nodes[ind+1].pos[1]);
	  positions.push(world.nodes[ind+1].pos[2]);
	  
	  positions.push(world.nodes[ind+1+N].pos[0]);
	  positions.push(world.nodes[ind+1+N].pos[1]);
	  positions.push(world.nodes[ind+1+N].pos[2]);
	  
	  positions.push(world.nodes[ind+N].pos[0]);
	  positions.push(world.nodes[ind+N].pos[1]);
	  positions.push(world.nodes[ind+N].pos[2]);
	  
  }
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the texture coordinates from
  // the texture coordinate buffer into the textureCoord attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  // Specify the texture to map onto the faces.

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  {
    const vertexCount = (N-1)*(N-1)*6;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw

  cubeRotation += deltaTime;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function Blower(){
	console.log('button pushed');
	console.log(document.getElementById("windPower").value);
	var pow=document.getElementById("windPower").value;
	if(pow.length>0){
		world.blow(pow);
		console.log('blowing '+pow);
	}
}

