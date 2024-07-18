<script>
	import { onMount } from 'svelte';
	import { blur, fly } from 'svelte/transition';
</script>

<div
	class="flex h-full w-full flex-col items-start justify-start"
	in:fly={{ x: -500, duration: 500 }}
	out:fly={{ x: 500, duration: 500 }}
>
	Email me at mossberg [dot] max [at] gmail [dot] com
	<!-- <h2>Or find my Social</h2>
	<h2>Games</h2> -->
</div>
