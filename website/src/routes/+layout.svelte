<script>
	import '../app.css';

	import { onMount } from 'svelte';
	import { goto, afterNavigate } from '$app/navigation';

	let underline, underlinedObj;
	let navBar = ['About', 'Projects', 'Connect'];
	let navActive = false;

	let moveUnderline = (obj) => {
		underlinedObj = obj;
		// underline = document.getElementById('underline');
		if (!obj || !underline) return;
		underline.style.top = obj.offsetTop + obj.offsetHeight + 'px';
		underline.style.left = obj.offsetLeft + 'px';
		underline.style.width = obj.offsetWidth + 'px';
	};

	let initialize = () => {
		page = window.location.href.split('/').at(-1)?.toLowerCase();
		let i = navBar.map((item) => item.toLowerCase()).indexOf(page);
		if (i !== -1) moveUnderline(document.getElementById(navBar[i]));
		else moveUnderline(document.getElementById(navBar[0]));
	};

	afterNavigate(() => {
		initialize();
	});

	let page;
	onMount(() => {
		initialize();

		window.addEventListener('resize', () => {
			moveUnderline(underlinedObj);
		});
		navActive = true;
	});
</script>

<div class="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-black">
	<div
		id="header"
		class="relative z-10 flex h-[15%] w-full flex-col items-center justify-between overflow-hidden md:h-[10%] md:flex-row md:items-start"
	>
		<div id="title" class="flex h-full w-fit items-center justify-center pl-16 pr-16">
			<h1 class="text-4xl"><a href="/">mxmoss.me</a></h1>
		</div>
		<div
			id="nav"
			class="relative flex h-full w-full items-center justify-center gap-10 md:items-center md:justify-start"
		>
			<span class="absolute bottom-8 h-1 rounded-full bg-white" bind:this={underline}></span>
			{#each navBar as item}
				<button
					id={item}
					class="text-xl"
					on:click={(e) => {
						moveUnderline(e.target);
						page = item.toLowerCase();
						goto('/' + item.toLowerCase());
					}}><a href="/{item.toLowerCase()}" tabIndex="-1">{item}</a></button
				>
			{/each}
		</div>
	</div>

	<div id="main" class="relative flex h-[85%] w-full max-w-screen-xl md:h-[90%]">
		<slot />
	</div>
</div>

<style>
	span {
		transition:
			width 0.2s ease-in-out,
			left 0.2s ease-in-out;
	}
</style>
