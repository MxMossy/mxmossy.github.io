<script>
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import WebGL from 'three/addons/capabilities/WebGL.js';
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
	import modelURL from '$lib/static/Max.glb';

	import { blur } from 'svelte/transition';

	function createScene(n = 0) {
		if (n > 10) return;
		let canvas = document.getElementById('threejs');
		if (!WebGL.isWebGLAvailable() || !canvas) {
			return;
		}

		if (canvas.classList.contains('attached')) {
			setTimeout(() => {
				createScene(n + 1);
			}, 100);
			return;
		} else {
			canvas.classList.add('attached');
		}

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			75,
			canvas.offsetWidth / canvas.offsetHeight,
			0.1,
			1000
		);
		camera.position.set(0, 0.3, 1);

		const renderer = new THREE.WebGLRenderer({ canvas: canvas });
		renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		directionalLight.position.set(1, 1, 0.5);
		scene.add(directionalLight);

		let model;

		function animate() {
			model.rotation.y += 0.005;
			renderer.render(scene, camera);
		}

		const loader = new GLTFLoader();
		loader.load(
			modelURL,
			function (gltf) {
				model = gltf.scene;
				model.scale.set(0.01, 0.01, 0.01);
				scene.add(model);
				renderer.setAnimationLoop(animate);
			},
			undefined,
			function (error) {
				console.error(error);
			}
		);

		window.addEventListener('resize', onWindowResize);
		function onWindowResize() {
			camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
		}
	}

	onMount(() => {
		createScene();
	});
</script>

<canvas
	id="threejs"
	class="relative h-1/3 w-full md:h-full md:w-1/2"
	transition:blur={{ duration: 1000 }}
/>
