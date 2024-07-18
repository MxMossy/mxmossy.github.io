<script>
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';

	import Model from './components/Model.svelte';

	let names = [
		'Max',
		'mxmoss',
		'mxmossy',
		'mossy',
		'mxninja',
		'Maxamilian',
		'Msquared',
		'Maximus',
		'(MxM)'
	];
	let pending = [];
	let i;
	function scramble(obj) {
		for (let i = 0; i < pending.length; i++) {
			clearInterval(pending[i]);
			clearTimeout(pending[i]);
		}
		pending = [];

		let shuffleArray = (array) => {
			for (var i = array.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
		};

		if (i === undefined) {
			i = 1;
			let startName = names[0];
			names = names.slice(1);
			shuffleArray(names);
			names.unshift(startName);
		} else if (i >= names.length) {
			i = 0;
			shuffleArray(names);
		}
		// let cand = names.filter((name) => name !== obj.innerText);
		// let target = cand[Math.floor(Math.random() * cand.length)];
		let target = names[i];
		i++;

		let shuffle = setInterval(() => {
			let newText = obj.innerText.split('');
			let r = Math.floor(Math.random() * Math.max(newText.length, target.length));
			let alphaNum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
			newText[r] = alphaNum.split('')[Math.floor(Math.random() * alphaNum.length)];
			obj.innerText = newText.join('');
		}, 50);
		pending.push(shuffle);

		let wait = setTimeout(() => {
			let tryClear = setInterval(() => {
				if (obj.innerText.length < target.length) return;
				clearInterval(shuffle);
				clearInterval(tryClear);

				let replaced = Array.from(Array(Math.max(obj.innerText.length, target.length)).keys());

				shuffleArray(replaced);
				let i = 0;
				let newText = obj.innerText.split('');

				let replace = setInterval(() => {
					let r = replaced[i];
					newText[r] = r >= target.length ? '' : target[r];
					obj.innerText = newText.join('');
					if (i >= replaced.length - 1) clearInterval(replace);
					i++;
				}, 100);
				pending.push(replace);
			}, 100);
			pending.push(tryClear);
		}, 1000);
		pending.push(wait);
	}

	let scrambleInterval;
	let setScrambleInterval = () => {
		clearInterval(scrambleInterval);
		scrambleInterval = setInterval(() => {
			scramble(document.getElementById('name'));
		}, 5000);
	};

	onMount(() => {
		setScrambleInterval();
	});

	onDestroy(() => {
		clearInterval(scrambleInterval);
	});
</script>

<div
	class="absolute left-0 top-0 flex h-full w-full flex-col-reverse items-center justify-center md:flex-row"
	in:fly={{ x: -500, duration: 500 }}
	out:fly={{ x: 500, duration: 500 }}
>
	<div
		id="content"
		class="relative flex h-2/3 w-full flex-col items-center justify-start gap-16 overflow-hidden bg-black px-16 md:h-full md:w-1/2 md:justify-center"
	>
		<h2 class="self-center justify-self-center text-5xl">
			Hi, I'm <button
				id="name"
				class="w-64 text-start text-green-500"
				tabindex="-1"
				on:click={(e) => {
					scramble(e.target);
					setScrambleInterval();
				}}
			>
				{names[0]}</button
			>
		</h2>
		<h2 class="text-2xl">
			I'm curious about what's possible with web technology. Check out what I'm <a
				href="/projects"
				class="text-blue-500 underline">building</a
			>.
		</h2>
	</div>

	<Model />
</div>

<style>
	#name {
		text-shadow: #080 1px 0 20px;
	}
</style>
